// Local image upload utility — images are served from the backend's /uploads folder.
// No external CDN dependency.

import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

// Returns true if the URL is a local backend upload
export function isLocalUpload(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.includes('/uploads/');
}

// Swap the host part of a local upload URL to the current API base URL.
// Useful when the server IP changes between environments.
export function resolveImageUrl(
    url: string | null | undefined,
    apiBase?: string
): string | null {
    if (!url) return null;
    if (!apiBase || !isLocalUpload(url)) return url;

    try {
        const parsed  = new URL(url);
        const base    = new URL(apiBase);
        parsed.host   = base.host;
        parsed.protocol = base.protocol;
        return parsed.toString();
    } catch {
        return url;
    }
}

// ─── LocalImage component ─────────────────────────────────────────────────────

interface LocalImageProps {
    uri: string | null | undefined;
    style?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    placeholder?: React.ReactNode;
    apiBase?: string;
}

export function LocalImage({
    uri,
    style,
    containerStyle,
    resizeMode = 'cover',
    placeholder,
    apiBase,
}: LocalImageProps) {
    const resolved = resolveImageUrl(uri, apiBase);

    if (!resolved) {
        return placeholder ? <View style={containerStyle}>{placeholder}</View> : null;
    }

    return (
        <Image
            source={{ uri: resolved }}
            style={style}
            resizeMode={resizeMode}
        />
    );
}

export default LocalImage;
