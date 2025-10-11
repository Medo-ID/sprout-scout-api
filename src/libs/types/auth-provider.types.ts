export interface AuthProvider {
  userId: string;
  provider: "local" | "google";
  providerUserId?: string | null;
  passwordHash?: string | null;
}
