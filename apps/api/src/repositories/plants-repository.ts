import { PlantDTO, PlantSchema } from "@schemas/plants.schema";
import { Plant } from "../entities/plants";
import { pool } from "../config/database";

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
      console.log("Database error while finding all plants", error);
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
      console.log("Database error while finding plant by id", error);
    }
  }

  async create(data: PlantSchema): Promise<PlantDTO | void> {
    try {
      const { rows } = await pool.query(
        `INSERT INTO plants 
        (
            common_name, 
            scientific_name, 
            watering_interval_days, 
            sunlight, care_instructions, 
            external_api_id
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
      console.log("Database error while creating new plant", error);
    }
  }
}
