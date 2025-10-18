export interface AuthProvider {
  user_id: string;
  provider: "local" | "google";
  provider_user_id?: string | null;
  password_hash?: string | null;
  refresh_token: string;
}
