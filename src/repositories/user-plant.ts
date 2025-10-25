import { pool } from "../config/database";
import { UserPlantSchema } from "../libs/schemas/user-plant";
import { UserPlant } from "../libs/types/user-plant";

export class UserPlantRepository {
  public async bulkInsert(
    gardenId: string,
    arrayData: UserPlantSchema[]
  ): Promise<UserPlant[] | undefined> {
    if (!gardenId) {
      throw new Error("Garden ID is required");
    }
    if (!Array.isArray(arrayData) || arrayData.length === 0) {
      throw new Error("At least one plant is required");
    }

    const placeholders = arrayData
      .map((_, rowIndex) => {
        const offset = rowIndex * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      })
      .join(", ");

    const values = arrayData.flatMap((data) => [
      gardenId,
      data.plant_id,
      data.planted_at || new Date(),
    ]);

    try {
      const { rows } = await pool.query(
        `INSERT INTO user_plants ("garden_id", "plant_id", "planted_at") VALUES ${placeholders} RETURNING *`,
        values
      );
      return rows;
    } catch (error) {
      console.log(
        `DB Error bulk inserting user's plants data: ${JSON.stringify({
          gardenId,
          plants: arrayData,
        })}`,
        error
      );
      return undefined;
    }
  }

  public async delete(ids: string[]): Promise<boolean> {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new Error("Missing user's plants ids");
    try {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
      const result = await pool.query(
        `DELETE FROM user_plants WHERE id IN (${placeholders})`,
        ids
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.log(`DB Error deleting user's plants with ids: ${ids}`, error);
      return false;
    }
  }
}
