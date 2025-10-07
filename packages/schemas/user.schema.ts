import z from "zod";

export interface User {
  id: string;
  name: string;
  email: string;
  pictureUrl: string;
}

export const userValidation = z
  .object({
    name: z.string().regex(/[a-z][A-Z]/),
    email: z.email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/\d/)
      .regex(/[^A-Za-z0-9]/),
    confirm_password: z.string(),
  })
  .refine((fields) => fields.password === fields.confirm_password, {
    message: "passwords do not match",
    path: ["confirm_password"],
  });

export type UserSchema = z.infer<typeof userValidation>;
