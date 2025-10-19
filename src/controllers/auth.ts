import z from "zod";
import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { loginValidation, registerValidation } from "../libs/schemas/auth";
import { configDotenv } from "dotenv";

configDotenv();

const authService = new AuthService();

export async function register(req: Request, res: Response) {
  const parsedResult = registerValidation.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: z.prettifyError(parsedResult.error),
    });
  }

  const { name, email, password } = parsedResult.data;
  try {
    const result = await authService.registerLocal(name, email, password);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.status(201).json(result.accessToken);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}

export async function login(req: Request, res: Response) {
  const parsedResult = loginValidation.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: z.prettifyError(parsedResult.error),
    });
  }

  const { email, password } = parsedResult.data;
  try {
    const result = await authService.loginLocal(email, password);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.status(200).json(result.accessToken);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken } = await authService.refreshAccessToken(
      token
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.json({ accessToken });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;
    const result = await authService.logout(token);
    if (!result) throw new Error("Error deleting session when logout");
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
