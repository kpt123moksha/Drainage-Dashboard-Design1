import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "../src/db.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = fs.readFileSync(path.join(root, "..", "database", "queries.sql"), "utf8");
const statements = sql.split(";").map(s => s.trim()).filter(s => s && !s.startsWith("-- Run after"));
let count = 0;
for (const statement of statements) {
  try {
    const rows = db.prepare(statement).all();
    count++;
    console.log(`\n[SQL ${count}] ${statement.split("\n").filter(x => !x.trim().startsWith("--")).join(" ").slice(0, 120)}`);
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
  } catch (error) {
    console.error(`SQL statement ${count + 1} failed: ${error.message}\n${statement}`);
    process.exitCode = 1;
  }
}
db.close();
