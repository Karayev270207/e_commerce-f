/**
 * Image URL resolver for the local backend uploads.
 *
 * The backend serves images at: http://<SERVER_IP>:<PORT>/uploads/<filename>
 * Those are returned as fully-qualified absolute URLs in the `image` / `image_url`
 * fields, so this function just validates and passes them through.
 *
 * The `baseUrl` parameter is accepted for backward compatibility with existing
 * callers but is only used as a fallback for relative paths.
 */
export function resolveImageUrl(
  imageUrl: string | null | undefined,
  baseUrl?: string,
): string | null {
  if (!imageUrl) {
    console.log("🖼️ [Image] No image URL provided");
    return null;
  }

  // Absolute URL — return as-is (normal case for backend local uploads)
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Relative path starting with "/" — prepend the API base URL
  if (baseUrl && imageUrl.startsWith("/")) {
    const resolved = `${baseUrl.replace(/\/$/, "")}${imageUrl}`;
    console.log("🖼️ [Image] Resolved relative path →", resolved);
    return resolved;
  }

  console.warn("⚠️ [Image] Unresolvable image URL:", imageUrl);
  return null;
}
