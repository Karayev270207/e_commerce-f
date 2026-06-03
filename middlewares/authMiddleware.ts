import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_change_in_production";

// Extend Express Request type to include user info
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      iat?: number;
      exp?: number;
    };

    // Attach user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    console.log(`✅ [Auth] Token verified for user ${decoded.id}`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  }
};
