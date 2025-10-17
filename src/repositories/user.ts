import { pool } from "../config/database";
import { UserSchema } from "../libs/schemas/user";
import { User } from "../libs/types/user";
import {
  buildInsertColumns,
  buildPlaceholders,
  buildUpdateClauses,
  extractValidEntries,
  safeQuery,
} from "../utils/repo-helper";

const ALLOWED_COLUMNS = new Set(["email", "name", "picture_url"]);

export class UsersRepository {
  public async findAll(): Promise<User[]> {
    try {
      const { rows } = await pool.query("SELECT * FROM users");
      return rows;
    } catch (error) {
      console.log("DB Error finding all users", error);
      return [];
    }
  }

  public async findById(id: string): Promise<User | undefined> {
    if (!id) throw new Error("Missing user id");
    return safeQuery<User>(
      `SELECT * FROM users WHERE id = $1`,
      [id],
      `DB Error finding user by this id: ${id}`
    );
  }

  public async findByEmail(email: string) {
    if (!email) throw new Error("Email is missing");
    return safeQuery<User>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      `DB Error finding user by this email: ${email}`
    );
  }

  public async insert(data: UserSchema) {
    const entries = extractValidEntries<UserSchema>(data, ALLOWED_COLUMNS);
    const columns = buildInsertColumns(entries);
    const placeholders = buildPlaceholders(entries);
    const values = entries.map(([, value]) => value);
    return safeQuery<User>(
      `INSERT INTO users (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
      `DB Error creating new user with this data: ${data}`
    );
  }

  public async update(id: string, data: Partial<UserSchema>) {
    if (!id) throw new Error("Missing user id");
    const entries = extractValidEntries<Partial<UserSchema>>(
      data,
      ALLOWED_COLUMNS
    );
    const setClauses = buildUpdateClauses(entries);
    const values = entries.map(([, value]) => value);
    values.push(id);
    return safeQuery<User>(
      `UPDATE users SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values,
      `DB Error updating user with id: ${id} using this data: ${data}`
    );
  }

  public async delete(ids: string[]): Promise<boolean> {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new Error("Missing user ids");
    const placeholders = ids.map((_, idx) => `$${idx + 1}`).join(", ");
    try {
      const result = await pool.query(
        `DELETE FROM users WHERE id IN (${placeholders})`,
        ids
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.log(`DB Error Deleting plants with ids: ${ids}`, error);
      return false;
    }
  }
}
