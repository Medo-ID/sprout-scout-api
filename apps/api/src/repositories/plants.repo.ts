import { Plant, PlantSchema } from "@schemas/plants.schema";
import { pool } from "../config/database";

// TODO:
/*
 * | Method                                              | Description                                 |
 * | --------------------------------------------------- | ------------------------------------------- |
 * | `findByExternalApiId(externalApiId: string)`        | Check if plant from API already exists      |
 * | `searchByName(query: string)`                       | Case-insensitive search with `ILIKE`        |
 * | `findCustomPlantsByUser(userId: string)`            | Get all user-created plants                 |
 * | `bulkInsert(plants: PlantSchema[])`                 | Efficiently insert multiple plants from API |
 * | `updateWateringFrequency(id: string, days: number)` | Adjust watering schedule                    |
 * | `findNeedingWatering(referenceDate: Date)`          | List plants that should be watered today    |
 */

const ALLOWED_COLUMNS = new Set([
  "name",
  "watering_frequency_days",
  "sunlight",
  "care_instructions",
  "external_api_id",
  "is_custom",
  "custom_watering_frequency_days",
]);

type TableEntries = [string, string | number | boolean | null][];

export class PlantRepository {
  private extractValidEntries(data: PlantSchema): TableEntries {
    if (!data) throw new Error("Missing plant data");
    const entries = Object.entries(data).filter(
      ([key, value]) => ALLOWED_COLUMNS.has(key) && value !== undefined
    );
    if (entries.length === 0) throw new Error("No valid fields");
    return entries as TableEntries;
  }

  private buildInsertColumns(entries: TableEntries): string {
    return entries.map(([key]) => `"${key.replace(/"/g, '""')}"`).join(", ");
  }

  private buildPlaceholders(entries: TableEntries): string {
    return entries.map((_, idx) => `$${idx + 1}`).join(", ");
  }

  private buildUpdateClauses(entries: TableEntries): string {
    return entries
      .map(([key], idx) => `"${key.replace(/"/g, '""')}" = $${idx + 1}`)
      .join(", ");
  }

  private async safeQuery<T>(
    query: string,
    values: any[],
    logMessage: string
  ): Promise<T | undefined> {
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.log(logMessage, error);
      return undefined;
    }
  }

  public async findAll(): Promise<Plant[]> {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM plants ORDER BY created_at DESC`
      );
      return rows;
    } catch (error) {
      console.log("DB Error Finding all plants", error);
      return [];
    }
  }

  public async findById(id: string): Promise<Plant | undefined> {
    if (!id) throw new Error("Missing plant id");
    return this.safeQuery<Plant>(
      `SELECT * FROM plants WHERE id = $1`,
      [id],
      `DB Error finding plant with id: ${id}`
    );
  }

  public async insert(data: PlantSchema): Promise<Plant | undefined> {
    const entries = this.extractValidEntries(data);
    const columns = this.buildInsertColumns(entries);
    const placeholders = this.buildPlaceholders(entries);
    const values = entries.map(([, value]) => value);
    return this.safeQuery<Plant>(
      `INSERT INTO plants (${columns}) VALUES (${placeholders})`,
      values,
      "DB Error creating new plant"
    );
  }

  public async update(
    id: string,
    data: PlantSchema
  ): Promise<Plant | undefined> {
    if (!id) throw new Error("Missing plant id");
    const entries = this.extractValidEntries(data);
    const setClauses = this.buildUpdateClauses(entries);
    const values = entries.map(([, value]) => value);
    values.push(id);
    return this.safeQuery<Plant>(
      `UPDATE plants SET ${setClauses} WHERE id $${values.length} RETURNING *`,
      values,
      `DB Error updating plant with id: ${id}`
    );
  }

  public async delete(ids: string[]): Promise<boolean> {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new Error("Missing plant id");
    const placeholders = ids.map((_, idx) => `$${idx + 1}`).join(", ");
    try {
      const result = await pool.query(
        `DELETE FROM plants WHERE id IN (${placeholders})`,
        ids
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.log(`DB Error Deleting plants with ids: ${ids}`, error);
      return false;
    }
  }
}
