import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

test("schema enforces foreign keys and valid complaint coordinates", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "drainwatch-test-"));
  const db = new Database(path.join(tempDir, "test.db"));
  db.pragma("foreign_keys = ON");
  const schemaPath = path.resolve("sql/migrations/001_initial_schema.sql");
  db.exec(fs.readFileSync(schemaPath, "utf8"));
  const hash = "not-a-real-password-hash-for-schema-test";
  const user = db.prepare("INSERT INTO users(full_name,email,phone,password_hash,role,account_status) VALUES(?,?,?,?,?,?)")
    .run("Test Citizen", "test@example.local", "9000000000", hash, "CITIZEN", "ACTIVE");
  assert.throws(() => {
    db.prepare(`INSERT INTO complaints(public_tracking_code,citizen_id,category,latitude,longitude)
      VALUES(?,?,'BLOCKED_DRAIN',999,0)`).run("DW-INVALID", Number(user.lastInsertRowid));
  });
  assert.throws(() => {
    db.prepare(`INSERT INTO complaints(public_tracking_code,citizen_id,category,latitude,longitude)
      VALUES(?,?,'BLOCKED_DRAIN',0,0)`).run("DW-ORPHAN", 99999);
  });
  db.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});
