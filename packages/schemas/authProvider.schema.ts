import z from "zod";

export interface AuthProvider {
  userId: string;
  provider: "local" | "google";
  providerUserId: string | null;
  password?: string | null;
}

export const authProviderValidation = z.object({
  userId: z.string(),
  provider: z.enum(["local", "google"]),
  providerUserId: z.string().nullable(),
  passwordHash: z.string().nullable(),
});

export type AuthProviderSchema = z.infer<typeof authProviderValidation>;
