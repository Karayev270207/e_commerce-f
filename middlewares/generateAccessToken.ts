import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_change_in_production";

export const generateAccessToken = (userId: number, email: string): string => {
  try {
    const token = jwt.sign(
      {
        id: userId,
        email: email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    console.log(`✅ [Auth] Generated token for user ${userId}`);
    return token;
  } catch (error) {
    console.error("❌ [Auth] Failed to generate token:", error);
    throw new Error("Token generation failed");
  }
};
