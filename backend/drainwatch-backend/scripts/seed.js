import bcrypt from "bcryptjs";
import db from "../src/db.js";

const seed = db.transaction(() => {
  const findUser = db.prepare("SELECT user_id FROM users WHERE email=? COLLATE NOCASE");
  const insertUser = db.prepare(`
    INSERT INTO users(full_name,email,phone,password_hash,role,account_status)
    VALUES(?,?,?,?,?,?)
  `);
  function ensureUser(name,email,phone,password,role,status="ACTIVE") {
    const existing = findUser.get(email);
    if (existing) return existing.user_id;
    const result = insertUser.run(name,email,phone,bcrypt.hashSync(password, 10),role,status);
    return Number(result.lastInsertRowid);
  }

  const adminId = ensureUser("Demo Administrator","admin@drainwatch.local","9000000003","AdminDemo!2026","ADMIN");
  const citizenId = ensureUser("Demo Citizen","citizen@drainwatch.local","9000000001","CitizenDemo!2026","CITIZEN");
  const employeeUserId = ensureUser("Demo Employee","employee@drainwatch.local","9000000002","EmployeeDemo!2026","MUNICIPAL_EMPLOYEE");

  let employee = db.prepare("SELECT employee_id FROM employees WHERE user_id=?").get(employeeUserId);
  if (!employee) {
    const result = db.prepare(`
      INSERT INTO employees(user_id,municipal_employee_code,department,approval_status,approved_by,approved_at)
      VALUES(?,?,?,'APPROVED',?,strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    `).run(employeeUserId,"DEMO-EMP-001","Drainage Maintenance",adminId);
    employee = { employee_id: Number(result.lastInsertRowid) };
  }

  const rule = db.prepare("INSERT OR IGNORE INTO deadline_rules(risk_level,response_hours,reminder_minutes_before,escalation_enabled,is_active,updated_by) VALUES(?,?,?,?,1,?)");
  rule.run("LOW",72,120,1,adminId);
  rule.run("MEDIUM",24,60,1,adminId);
  rule.run("HIGH",6,30,1,adminId);
  rule.run("CRITICAL",1,10,1,adminId);

  if (db.prepare("SELECT COUNT(*) AS n FROM drainage_locations").get().n === 0) {
    db.prepare("INSERT INTO drainage_locations(location_name,latitude,longitude,elevation_meters,drain_type,known_risk_level,is_low_lying) VALUES(?,?,?,?,?,?,?)")
      .run("Demo Drain Location A",13.3379,77.1173,800,"STORM_DRAIN","HIGH",1);
  }
  const drain = db.prepare("SELECT drain_id FROM drainage_locations ORDER BY drain_id LIMIT 1").get();

  if (db.prepare("SELECT COUNT(*) AS n FROM complaints").get().n === 0) {
    const code = `DW-DEMO-${Date.now()}`;
    const complaint = db.prepare(`
      INSERT INTO complaints(public_tracking_code,citizen_id,drain_id,category,description,latitude,longitude,severity,status)
      VALUES(?,?,?,'BLOCKED_DRAIN','Seeded demo complaint: drain needs inspection.',13.3379,77.1173,'HIGH','SUBMITTED')
    `).run(code,citizenId,drain.drain_id);
    const complaintId = Number(complaint.lastInsertRowid);
    db.prepare("INSERT INTO tasks(complaint_id,assigned_employee_id,assigned_by,priority,status,deadline_at) VALUES(?,?,?,'HIGH','PENDING',strftime('%Y-%m-%dT%H:%M:%fZ','now','+6 hours'))")
      .run(complaintId,employee.employee_id,adminId);
  }
});
seed();
console.log("Seed completed.");
console.log("Development-only demo credentials:");
console.log("Admin: admin@drainwatch.local / AdminDemo!2026");
console.log("Citizen: citizen@drainwatch.local / CitizenDemo!2026");
console.log("Employee: employee@drainwatch.local / EmployeeDemo!2026");
console.log("Change/remove these accounts before any public deployment.");
db.close();
