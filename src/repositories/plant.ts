import { pool } from "../config/database";
import { PlantSchema } from "../libs/schemas/plant.schema";
import { Plant } from "../libs/types/plant";
import {
  buildInsertColumns,
  buildPlaceholders,
  buildUpdateClauses,
  extractValidEntries,
  safeQuery,
} from "../utils/repo-helper";

const ALLOWED_COLUMNS = new Set([
  "common_name",
  "family",
  "cultivar",
  "species_epithet",
  "genus",
  "watering_frequency_days",
  "sunlight",
  "external_api_id",
  "is_custom",
  "custom_watering_frequency_days",
  "default_image",
]);

export class PlantRepository {
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
    return safeQuery<Plant>(
      `SELECT * FROM plants WHERE id = $1`,
      [id],
      `DB Error finding plant with id: ${id}`
    );
  }

  public async findByExternalApiId(
    externalApiId: number
  ): Promise<Plant | undefined> {
    if (!externalApiId) throw new Error("Missing external api id");
    return safeQuery<Plant>(
      `SELECT * FROM plants WHERE external_api_id = $1`,
      [externalApiId],
      `DB Error finding plant by external api id: ${externalApiId}`
    );
  }

  public async searchByName(query: string): Promise<Plant[]> {
    if (!query) throw new Error("Missing search query");
    try {
      const { rows } = await pool.query(
        "SELECT * FROM plants WHERE LOWER(name) LIKE LOWER($1)",
        [`%${query}%`]
      );
      return rows;
    } catch (error) {
      console.log(`DB Error search plant by name: ${query}`, error);
      return [];
    }
  }

  public async insert(data: PlantSchema): Promise<Plant | undefined> {
    const entries = extractValidEntries<PlantSchema>(data, ALLOWED_COLUMNS);
    const columns = buildInsertColumns(entries);
    const placeholders = buildPlaceholders(entries);
    const values = entries.map(([, value]) => value);
    return safeQuery<Plant>(
      `INSERT INTO plants (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
      "DB Error creating new plant"
    );
  }

  public async bulkInsert(arrayData: PlantSchema[]): Promise<Plant[]> {
    if (!Array.isArray(arrayData) || arrayData.length === 0)
      throw new Error("No Plant data provided");
    const entriesList = arrayData.map((data) =>
      extractValidEntries<PlantSchema>(data, ALLOWED_COLUMNS)
    );
    const columns = buildInsertColumns(entriesList[0]);
    const placeholders = entriesList
      .map(
        (_, rowIndex) =>
          `(${entriesList[rowIndex]
            .map(
              (_, columnIndex) =>
                `$${rowIndex * entriesList[0].length + columnIndex + 1}`
            )
            .join(", ")})`
      )
      .join(", ");
    const allValues = entriesList.flatMap((entries) =>
      entries.map(([, value]) => value)
    );

    try {
      const { rows } = await pool.query(
        `INSERT INTO plants (${columns}) VALUES (${placeholders}) RETURNING *`,
        allValues
      );

      return rows;
    } catch (error) {
      console.log(`DB Error bulk inserting data: ${arrayData}`, error);
      return [];
    }
  }

  public async update(
    id: string,
    data: Partial<PlantSchema>
  ): Promise<Plant | undefined> {
    if (!id) throw new Error("Missing plant id");
    const entries = extractValidEntries<Partial<PlantSchema>>(
      data,
      ALLOWED_COLUMNS
    );
    const setClauses = buildUpdateClauses(entries);
    const values = entries.map(([, value]) => value);
    values.push(id);
    return safeQuery<Plant>(
      `UPDATE plants SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values,
      `DB Error updating plant with id: ${id}`
    );
  }

  public async delete(ids: string[]): Promise<boolean> {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new Error("Missing plant ids");
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
