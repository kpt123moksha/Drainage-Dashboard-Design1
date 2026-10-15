import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { config } from "./config.js";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
const db = new Database(config.databasePath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(root, "sql", "migrations");
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )
`);

const applied = new Set(db.prepare("SELECT migration_name FROM schema_migrations").all().map(r => r.migration_name));
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
  for (const migration of migrations) {
    if (applied.has(migration)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, migration), "utf8");
    const apply = db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations(migration_name) VALUES (?)").run(migration);
    });
    apply();
    console.log(`Applied migration: ${migration}`);
  }
}
export default db;
