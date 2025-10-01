import { PlantDTO, PlantSchema } from "@schemas/plants.schema";
import { Plant } from "../entities/plants";
import { pool } from "../config/database";

const ALLOWED_COLUMNS = new Set([
  "commonName",
  "scientificName",
  "wateringIntervalDays",
  "sunlight",
  "careInstructions",
  "externalApiId",
]);

export class PlantRepository {
  async findAll(): Promise<PlantDTO[] | void[]> {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM plants ORDER BY created_at DESC`
      );
      return rows.map((row: PlantDTO) => {
        new Plant(row);
      });
    } catch (error) {
      console.log("DB Error Finding all plants", error);
      return [];
    }
  }

  async findById(id: string): Promise<PlantDTO | void> {
    try {
      const { rows } = await pool.query(`SELECT * FROM plants WHERE id = $1`, [
        id,
      ]);
      return rows[0] as PlantDTO;
    } catch (error) {
      console.log(`DB Error Finding plant with id: ${id}`, error);
    }
  }

  async create(data: PlantSchema): Promise<PlantDTO | void> {
    try {
      const { rows } = await pool.query(
        `INSERT INTO plants 
        (
          commonName, 
          scientificName, 
          wateringIntervalDays, 
          sunlight, 
          careInstructions, 
          externalApiId
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.commonName,
          data.scientificName,
          data.wateringIntervalDays,
          data.sunlight,
          data.careInstructions,
          data.externalApiId,
        ]
      );

      return new Plant(rows[0]).getData();
    } catch (error) {
      console.log("DB Error Creating new plant", error);
    }
  }

  async update(
    id: string,
    data: PlantSchema
  ): Promise<PlantSchema | Partial<PlantSchema> | void> {
    if (id === undefined || id === null) throw new Error("Missing plant's id");

    const entries = Object.entries(data || {}).filter(
      ([key, value]) => ALLOWED_COLUMNS.has(key) && value !== undefined
    );

    if (entries.length === 0) throw new Error("No valid fields to update");

    const setClauses = entries
      .map(([key], idx) => {
        const safeIdentifier = `"${key.replace(/"/g, '""')}"`;
        return `${safeIdentifier} = $${idx + 1}`;
      })
      .join(", ");

    const queryValues = entries.map(([, value]) => value);
    queryValues.push(id);

    try {
      const { rows } = await pool.query(
        `UPDATE plants SET ${setClauses} WHERE = ${queryValues.length} RETURNING *`,
        queryValues
      );

      return rows[0];
    } catch (error) {
      console.log(`DB Error Updating plant with id: ${id}`, error);
    }
  }

  async delete(ids: string[]): Promise<boolean> {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new Error("Missing plant id");

    try {
      const placeHolders = ids.map((_, idx) => `$${idx + 1}`).join(", ");
      const result = await pool.query(
        `DELETE FROM plants WHERE id IN (${placeHolders})`,
        ids
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.log(`DB Error Deleting plant with these id: ${ids}`, error);
      return false;
    }
  }
}
