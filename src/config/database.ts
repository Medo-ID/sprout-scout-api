import { Pool } from "pg";
import path from "node:path";
import dotenv from "dotenv";
import fs from "node:fs/promises";

dotenv.config();

export const pool =
  process.env.NODE_ENV === "test"
    ? new Pool({
        host: process.env.TESTDB_HOST,
        user: process.env.TESTDB_USER,
        password: process.env.TESTDB_PASSWORD,
        database: process.env.TESTDB_NAME,
        port: Number(process.env.TESTDB_PORT),
      })
    : new Pool({
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

export async function initializeTestDB() {
  const client = await pool.connect();
  try {
    const LOCK_KEY = 987654321;
    // serialize schema initialization across workers to avoid DDL deadlocks
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
    try {
      const dbFile = path.join(__dirname, "db_migration.sql");
      const dbQueries = await fs.readFile(dbFile, "utf8");

      // Split and execute each statement independently
      const statements = dbQueries
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);

      // Execute each migration statement independently
      for (const query of statements) {
        try {
          await client.query(query);
        } catch (err) {
          if ((err as any).code !== "42P07") {
            // ignore "relation already exists" errors
            console.error("Error executing query:", query, err);
            throw err;
          }
        }
      }

      console.log("Test Database initialized successfully");
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
    }
  } catch (error) {
    console.error("Test Database initialization failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function resetTestDB() {
  const client = await pool.connect();
  const MAX_ATTEMPTS = 3;
  const LOCK_KEY = 987654321;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // serialize reset across workers
      await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
      try {
        await client.query("BEGIN");
        // Use DELETE instead of TRUNCATE to reduce risk of AccessExclusiveLock deadlocks
        await client.query("DELETE FROM watering_logs");
        await client.query("DELETE FROM user_plants");
        await client.query("DELETE FROM tasks");
        await client.query("DELETE FROM gardens");
        await client.query("DELETE FROM auth_providers");
        await client.query("DELETE FROM users");
        await client.query("DELETE FROM plants");
        await client.query("COMMIT");
        break;
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
      }
    } catch (error: any) {
      await client.query("ROLLBACK");
      // deadlock retry
      if (error && error.code === "40P01" && attempt < MAX_ATTEMPTS) {
        const backoff = 50 * attempt;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      console.error("Error initializing test database: ", error);
      break;
    }
  }
  client.release();
}

export async function closeTestDB() {
  await pool.end();
}

export async function resetUserAuthDB() {
  const client = await pool.connect();
  const MAX_ATTEMPTS = 3;
  const LOCK_KEY = 987654321;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
      try {
        await client.query("DELETE FROM auth_providers");
        await client.query("DELETE FROM users");
        break;
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
      }
    } catch (error: any) {
      if (error && error.code === "40P01" && attempt < MAX_ATTEMPTS) {
        const backoff = 50 * attempt;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      console.error("DB Error when resetting auth tables", error);
      throw error;
    }
  }
  client.release();
}

export async function resetGardenDB() {
  const client = await pool.connect();
  const MAX_ATTEMPTS = 3;
  const LOCK_KEY = 987654322;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM watering_logs");
        await client.query("DELETE FROM user_plants");
        await client.query("DELETE FROM tasks");
        await client.query("DELETE FROM gardens");
        await client.query("COMMIT");
        break;
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
      }
    } catch (error: any) {
      await client.query("ROLLBACK");
      if (error && error.code === "40P01" && attempt < MAX_ATTEMPTS) {
        const backoff = 50 * attempt;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      console.error("DB Error when resetting garden tables", error);
      throw error;
    }
  }
  client.release();
}

export async function resetPlantDB() {
  const client = await pool.connect();
  const MAX_ATTEMPTS = 3;
  const LOCK_KEY = 987654323;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM watering_logs");
        await client.query("DELETE FROM user_plants");
        await client.query("DELETE FROM plants");
        await client.query("COMMIT");
        break;
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
      }
    } catch (error: any) {
      await client.query("ROLLBACK");
      if (error && error.code === "40P01" && attempt < MAX_ATTEMPTS) {
        const backoff = 50 * attempt;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      console.error("DB Error when resetting plant tables", error);
      throw error;
    }
  }
  client.release();
}
