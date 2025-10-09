import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function checkAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken<{ userId: string; email: string }>(token);
  if (!decoded) return res.status(401).json({ message: "Invalid token" });
  req.user = decoded;
  next();
}
