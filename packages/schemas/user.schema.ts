import z from "zod";

export interface User {
  id: string;
  name: string;
  email: string;
  pictureUrl: string;
}

export const userValidation = z.object({
  name: z.string().regex(/[a-z][A-Z]/),
  email: z.email(),
  pictureUrl: z
    .file()
    .min(1)
    .max(1024 * 1024)
    .mime(["image/png", "image/jpeg", "image/webp"]),
});

export type UserSchema = z.infer<typeof userValidation>;
