import z from "zod";
import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { loginValidation, registerValidation } from "../libs/schemas/auth";

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
    const result = await authService.registerLocal(email, password, name);
    res.status(201).json(result);
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
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
