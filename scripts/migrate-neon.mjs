import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "@neondatabase/serverless";

process.loadEnvFile?.(resolve(".env.local"));
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");

const directory = resolve("neon/migrations");
const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query("create table if not exists app_migrations (name text primary key, applied_at timestamptz not null default now())");
  for (const file of files) {
    const applied = await pool.query("select 1 from app_migrations where name=$1", [file]);
    if (applied.rowCount) continue;
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(await readFile(resolve(directory, file), "utf8"));
      await client.query("insert into app_migrations(name) values($1)", [file]);
      await client.query("commit");
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
