import z from "zod";
import { userValidation } from "./user";
import { passwordValidation } from "./auth-provider";

export const registerValidation = userValidation.and(passwordValidation);

export const loginValidation = z.object({
  email: z.email("Invalid email address"),
  password: z.string({ error: "Password is required" }),
});

export type RegisterInput = z.infer<typeof registerValidation>;
export type LoginInput = z.infer<typeof loginValidation>;
