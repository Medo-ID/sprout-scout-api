import z from "zod";

export const userValidation = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.email("Invalid email address"),
  picture_url: z
    .file()
    .min(1)
    .max(1024 * 1024)
    .mime(["image/png", "image/jpeg", "image/webp"])
    .optional(),
});

export type UserSchema = z.infer<typeof userValidation>;
