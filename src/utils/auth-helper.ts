import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.ACCESS_SECRET!;

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateTokens(payload: object) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  } as SignOptions);
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  } as SignOptions);
  return { accessToken, refreshToken };
}

export function verifyAccessToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as T;
  } catch (error) {
    console.log("Error while verifying access token", error);
    return null;
  }
}

export function verifyRefreshToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as T;
  } catch (error) {
    console.log("Error while verifying refresh token", error);
    return null;
  }
}
