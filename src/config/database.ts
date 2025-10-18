import { Pool } from "pg";
import path from "node:path";
import dotenv from "dotenv";
import fs from "node:fs/promises";

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export async function initializeDB() {
  const client = await pool.connect();
  try {
    const dbFile = path.join(__dirname, "db_migration.sql");
    const dbQueries = await fs.readFile(dbFile, "utf8");

    await client.query("BEGIN");
    const statements = dbQueries
      .split(";")
      .map((statement) => statement.trim());
    for (const query of statements) {
      await client.query(query);
    }
    await client.query("COMMIT");
    console.log("Database initialized successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database initialization failed:", error);
  } finally {
    client.release();
  }
}
