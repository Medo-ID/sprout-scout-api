import { pool } from "../config/database";

type TableEntries = [string, string | number | boolean | null][];

export function extractValidEntries<T>(
  data: T,
  allowedColumns: Set<string>
): TableEntries {
  if (!data) throw new Error("Missing plant data");
  const entries = Object.entries(data).filter(
    ([key, value]) => allowedColumns.has(key) && value !== undefined
  );
  if (entries.length === 0) throw new Error("No valid fields");
  return entries as TableEntries;
}

export function buildInsertColumns(entries: TableEntries): string {
  return entries.map(([key]) => `"${key.replace(/"/g, '""')}"`).join(", ");
}

export function buildPlaceholders(entries: TableEntries): string {
  return entries.map((_, idx: number) => `$${idx + 1}`).join(", ");
}

export function buildUpdateClauses(entries: TableEntries): string {
  return entries
    .map(([key], idx: number) => `"${key.replace(/"/g, '""')}" = $${idx + 1}`)
    .join(", ");
}

export async function safeQuery<T>(
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
