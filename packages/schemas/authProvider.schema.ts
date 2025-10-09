import z from "zod";

export interface AuthProvider {
  userId: string;
  provider: "local" | "google";
  providerUserId?: string | null;
  passwordHash?: string | null;
}

export const authProviderValidation = z.object({
  userId: z.string(),
  provider: z.enum(["local", "google"]),
  providerUserId: z.string().nullable(),
  passwordHash: z.string().nullable(),
});

export const passwordValidation = z
  .object({
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password must be less than 64 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AuthProviderSchema = z.infer<typeof authProviderValidation>;
