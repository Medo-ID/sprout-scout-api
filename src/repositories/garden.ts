import { pool } from "../config/database";
import { GardenSchema } from "../libs/schemas/garden";
import { Garden } from "../libs/types/garden";
import {
  buildInsertColumns,
  buildPlaceholders,
  buildUpdateClauses,
  extractValidEntries,
  safeQuery,
} from "../utils/repo-helper";

const ALLOWED_COLUMNS = new Set(["user_id", "name", "location"]);

export class GardenRepository {
  public async findAllByUserId(userId: string): Promise<Garden[] | undefined> {
    if (!userId) throw new Error("Missing user id");
    try {
      const { rows } = await pool.query(
        "SELECT * FROM gardens WHERE user_id = $1",
        [userId]
      );
      return rows as Garden[];
    } catch (error) {
      console.log(`DB Error finding all gardens for user id: ${userId}`, error);
      return [];
    }
  }

  public async findOneByUserId(
    userId: string,
    gardenId: string
  ): Promise<Garden | undefined> {
    if (!userId || !gardenId) throw new Error("Missing user id or garden id");
    try {
      const { rows } = await pool.query(
        "SELECT * FROM gardens WHERE id = $1 AND user_id = $2",
        [gardenId, userId]
      );
      return rows[0] as Garden;
    } catch (error) {
      console.log(
        `DB Error finding garden with id: ${gardenId} for user id: ${userId}`,
        error
      );
      return;
    }
  }

  public async create(data: GardenSchema): Promise<Garden | undefined> {
    if (!data || !data.user_id)
      throw new Error("Missing needed data or user id");
    const entries = extractValidEntries(data, ALLOWED_COLUMNS);
    const columns = buildInsertColumns(entries);
    const placeholders = buildPlaceholders(entries);
    const values = entries.map(([, value]) => value);
    return safeQuery<Garden>(
      `INSERT INTO gardens (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
      `DB Error inserting new garden with thsi data: ${data} for user id: ${data.user_id}`
    );
  }

  public async update(
    data: Partial<GardenSchema>,
    gardenId: string
  ): Promise<Garden | undefined> {
    if (!data || !gardenId) throw "Missing needed data or user id";
    const entries = extractValidEntries(data, ALLOWED_COLUMNS);
    const setClauses = buildUpdateClauses(entries);
    const values = entries.map(([, value]) => value);
    values.push(gardenId);
    return safeQuery<Garden>(
      `UPDATE gardens SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values,
      `DB Error updating garden with data: ${data} for user id: ${gardenId}`
    );
  }

  public async delete(id: string): Promise<boolean> {
    if (!id) throw new Error("Missing gardeb id");
    try {
      const result = await pool.query("DELETE FROM garden WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.log(`DB Error deleting garden with id: ${id}`, error);
      return false;
    }
  }
}
