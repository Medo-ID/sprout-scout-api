import { pool } from "../config/database";
import { AuthProviderSchema } from "../libs/schemas/auth-provider";
import { AuthProvider } from "../libs/types/auth-provider";
import {
  buildInsertColumns,
  buildPlaceholders,
  extractValidEntries,
  safeQuery,
} from "../utils/repo-helper";

const ALLOWED_COLUMNS = new Set([
  "user_id",
  "provider",
  "provider_user_id",
  "password_hash",
  "refresh_token",
]);

export class AuthProviderRepository {
  public async findByUserId(userId: string): Promise<AuthProvider | undefined> {
    if (!userId) throw new Error("Missing user id");
    return safeQuery<AuthProvider>(
      `SELECT * FROM auth_providers WHERE user_id = $1`,
      [userId],
      `DB Error finding auth provider with this user id: ${userId}`
    );
  }

  public async findByProvider(
    providerUserId: string
  ): Promise<AuthProvider | undefined> {
    if (!providerUserId) throw new Error("Provider user id is missing");
    return safeQuery<AuthProvider>(
      `SELECT * FROM auth_providers WHERE provider_user_id = $1`,
      [providerUserId],
      `DB Error finding auth provider data with this provider user id: ${providerUserId}`
    );
  }

  public async insert(
    data: AuthProviderSchema
  ): Promise<AuthProvider | undefined> {
    const entries = extractValidEntries<AuthProviderSchema>(
      data,
      ALLOWED_COLUMNS
    );
    const columns = buildInsertColumns(entries);
    const placeholders = buildPlaceholders(entries);
    const values = entries.map(([, value]) => value);
    return safeQuery<AuthProvider>(
      `INSERT INTO auth_providers (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
      `DB Error creating new auth provider with this data: ${data}`
    );
  }

  public async updatePassword(
    userId: string,
    newHash: string
  ): Promise<boolean> {
    if (!userId || !newHash) throw new Error("Missing credentials");
    try {
      const result = await pool.query(
        `UPDATE auth_providers SET password_hash = $1 
        WHERE user_id = $2 AND provider = 'local'`,
        [newHash, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.log(`DB Error updating password for user: ${userId}`, error);
      return false;
    }
  }

  public async saveRefeshToken(token: string): Promise<boolean> {
    if (!token) throw new Error("Missing token");
    try {
      const result = await pool.query(
        "INSERT INTO auth_providers (refresh_token) VALUES ($1) RETURNING refresh_token",
        [token]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("DB Error inserting refresh_token", error);
      return false;
    }
  }

  public async deleteByUserId(userId: string): Promise<boolean> {
    if (!userId) throw new Error("Missing user id");
    try {
      const result = await pool.query(
        "DELETE FROM auth_providers WHERE user_id = $1",
        [userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.log(
        `DB Error deleting auth provider with this user id: ${userId}`,
        error
      );
      return false;
    }
  }
}
