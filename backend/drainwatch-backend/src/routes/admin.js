import { Router } from "express";
import { z } from "zod";
import db from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { audit, notify } from "../utils.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", (req, res) => {
  const counts = {
    complaints: db.prepare("SELECT COUNT(*) AS n FROM complaints").get().n,
    pendingComplaints: db.prepare("SELECT COUNT(*) AS n FROM complaints WHERE status IN ('SUBMITTED','UNDER_REVIEW')").get().n,
    overdueTasks: db.prepare("SELECT COUNT(*) AS n FROM v_overdue_tasks").get().n,
    pendingEmployees: db.prepare("SELECT COUNT(*) AS n FROM employees WHERE approval_status='PENDING'").get().n,
    disputed: db.prepare("SELECT COUNT(*) AS n FROM cleaning_evidence WHERE review_status='DISPUTED'").get().n
  };
  res.json({ success: true, data: counts });
});

router.get("/employees/pending", (req, res) => {
  const rows = db.prepare(`
    SELECT e.employee_id,e.municipal_employee_code,e.department,e.approval_status,e.created_at,
      u.user_id,u.full_name,u.email,u.phone
    FROM employees e JOIN users u ON u.user_id=e.user_id
    WHERE e.approval_status='PENDING' ORDER BY e.created_at
  `).all();
  res.json({ success: true, data: rows });
});

router.post("/employees/:id/decision", (req, res) => {
  const employeeId = Number(req.params.id);
  const parsed = z.object({ decision: z.enum(["APPROVED","REJECTED"]) }).safeParse(req.body);
  if (!Number.isInteger(employeeId) || !parsed.success) return res.status(400).json({ success: false, message: "Invalid employee decision." });
  const employee = db.prepare("SELECT * FROM employees WHERE employee_id=?").get(employeeId);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
  const tx = db.transaction(() => {
    db.prepare("UPDATE employees SET approval_status=?, approved_by=?, approved_at=CASE WHEN ?='APPROVED' THEN strftime('%Y-%m-%dT%H:%M:%fZ','now') ELSE NULL END WHERE employee_id=?")
      .run(parsed.data.decision, req.user.user_id, parsed.data.decision, employeeId);
    db.prepare("UPDATE users SET account_status=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE user_id=?")
      .run(parsed.data.decision === "APPROVED" ? "ACTIVE" : "SUSPENDED", employee.user_id);
    audit(req.user.user_id, `EMPLOYEE_${parsed.data.decision}`, "EMPLOYEE", employeeId);
    notify(employee.user_id, `Your municipal account status is ${parsed.data.decision}.`);
  });
  tx();
  res.json({ success: true, message: `Employee ${parsed.data.decision.toLowerCase()}.` });
});

router.get("/deadline-rules", (req, res) => {
  res.json({ success: true, data: db.prepare("SELECT * FROM deadline_rules ORDER BY risk_level").all() });
});

router.put("/deadline-rules/:id", (req, res) => {
  const id = Number(req.params.id);
  const parsed = z.object({
    responseHours: z.number().int().min(1).max(8760),
    reminderMinutesBefore: z.number().int().min(0).max(10080),
    escalationEnabled: z.boolean(),
    isActive: z.boolean()
  }).safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) return res.status(400).json({ success: false, message: "Invalid deadline rule." });
  const old = db.prepare("SELECT * FROM deadline_rules WHERE deadline_rule_id=?").get(id);
  if (!old) return res.status(404).json({ success: false, message: "Rule not found." });
  try {
    db.prepare(`UPDATE deadline_rules SET response_hours=?,reminder_minutes_before=?,escalation_enabled=?,is_active=?,updated_by=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE deadline_rule_id=?`)
      .run(parsed.data.responseHours, parsed.data.reminderMinutesBefore, parsed.data.escalationEnabled ? 1 : 0, parsed.data.isActive ? 1 : 0, req.user.user_id, id);
    audit(req.user.user_id, "DEADLINE_RULE_UPDATED", "DEADLINE_RULE", id, old, parsed.data);
    res.json({ success: true, message: "Deadline rule updated." });
  } catch (e) {
    res.status(409).json({ success: false, message: "Could not update rule. Check for an active rule with the same risk level." });
  }
});

router.get("/audit-logs", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
  const rows = db.prepare(`
    SELECT a.audit_id,a.action,a.entity_type,a.entity_id,a.old_values,a.new_values,a.reason,a.created_at,
           u.full_name AS actor_name
    FROM audit_logs a LEFT JOIN users u ON u.user_id=a.actor_user_id
    ORDER BY a.audit_id DESC LIMIT ?
  `).all(limit);
  res.json({ success: true, data: rows });
});

router.get("/reports/complaints-by-status", (req, res) => {
  res.json({ success: true, data: db.prepare("SELECT status, COUNT(*) AS count FROM complaints GROUP BY status ORDER BY count DESC").all() });
});

export default router;
