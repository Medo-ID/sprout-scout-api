import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const testPool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export async function testPlantsTable() {
  const client = await testPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DROP TABLE IF EXISTS plants`);
    await client.query(`CREATE TABLE plants (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			common_name TEXT NOT NULL,
			scientific_name TEXT,
			watering_interval_days INT,
			sunlight TEXT,
			care_instructions TEXT,
			external_api_id TEXT UNIQUE,
			created_at TIMESTAMP DEFAULT now()    
		)`);
  } catch (error) {
    await client.query("ROLEBACK");
    console.log("Error Test Database: ", error);
  } finally {
    client.release();
  }
}
