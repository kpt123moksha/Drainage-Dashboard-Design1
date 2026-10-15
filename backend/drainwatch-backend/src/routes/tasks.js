import { Router } from "express";
import { z } from "zod";
import db from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { audit, notify } from "../utils.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  let rows;
  if (req.user.role === "CITIZEN") {
    rows = db.prepare(`
      SELECT t.*, c.public_tracking_code, c.category
      FROM tasks t JOIN complaints c ON c.complaint_id=t.complaint_id
      WHERE c.citizen_id=? ORDER BY t.created_at DESC
    `).all(req.user.user_id);
  } else if (req.user.role === "MUNICIPAL_EMPLOYEE") {
    const employee = db.prepare("SELECT employee_id FROM employees WHERE user_id=? AND approval_status='APPROVED'").get(req.user.user_id);
    rows = employee ? db.prepare(`
      SELECT t.*, c.public_tracking_code, c.category, c.latitude, c.longitude
      FROM tasks t JOIN complaints c ON c.complaint_id=t.complaint_id
      WHERE t.assigned_employee_id=? ORDER BY t.deadline_at
    `).all(employee.employee_id) : [];
  } else {
    rows = db.prepare(`
      SELECT t.*, c.public_tracking_code, c.category, c.latitude, c.longitude, u.full_name AS employee_name
      FROM tasks t JOIN complaints c ON c.complaint_id=t.complaint_id
      LEFT JOIN employees e ON e.employee_id=t.assigned_employee_id
      LEFT JOIN users u ON u.user_id=e.user_id
      ORDER BY t.deadline_at
    `).all();
  }
  res.json({ success: true, data: rows });
});

router.post("/", requireAuth, requireRole("ADMIN","MUNICIPAL_EMPLOYEE"), (req, res) => {
  const parsed = z.object({
    complaintId: z.number().int().positive(),
    employeeId: z.number().int().positive(),
    priority: z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]),
    deadlineAt: z.string().datetime()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid task data.", errors: parsed.error.flatten() });
  const d = parsed.data;
  const employee = db.prepare(`
    SELECT e.employee_id, e.user_id FROM employees e JOIN users u ON u.user_id=e.user_id
    WHERE e.employee_id=? AND e.approval_status='APPROVED' AND u.account_status='ACTIVE'
  `).get(d.employeeId);
  if (!employee) return res.status(400).json({ success: false, message: "Employee is not approved or active." });
  const complaint = db.prepare("SELECT * FROM complaints WHERE complaint_id=?").get(d.complaintId);
  if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found." });
  if (["RESOLVED","CANCELLED","REJECTED"].includes(complaint.status)) return res.status(409).json({ success: false, message: "Cannot assign a task to a closed complaint." });
  const tx = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO tasks(complaint_id,assigned_employee_id,assigned_by,priority,status,deadline_at)
      VALUES(?,?,?,?,'PENDING',?)
    `).run(d.complaintId, d.employeeId, req.user.user_id, d.priority, d.deadlineAt);
    const taskId = Number(result.lastInsertRowid);
    db.prepare("UPDATE complaints SET status='ASSIGNED', deadline_at=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE complaint_id=?").run(d.deadlineAt, d.complaintId);
    db.prepare("INSERT INTO task_history(task_id,changed_by,action,new_value,reason) VALUES(?,?,?,?,?)").run(taskId, req.user.user_id, "TASK_ASSIGNED", JSON.stringify({ employeeId: d.employeeId, deadlineAt: d.deadlineAt }), "Initial assignment");
    audit(req.user.user_id, "TASK_ASSIGNED", "TASK", taskId, null, d);
    notify(employee.user_id, `New task assigned for complaint ${complaint.public_tracking_code}`, d.complaintId, taskId, "TASK");
    notify(complaint.citizen_id, `A municipality task was assigned for complaint ${complaint.public_tracking_code}`, d.complaintId, taskId, "STATUS");
    return db.prepare("SELECT * FROM tasks WHERE task_id=?").get(taskId);
  });
  try { res.status(201).json({ success: true, data: tx() }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: "Task assignment failed." }); }
});

router.patch("/:id/status", requireAuth, requireRole("MUNICIPAL_EMPLOYEE","ADMIN"), (req, res) => {
  const id = Number(req.params.id);
  const parsed = z.object({ status: z.enum(["IN_PROGRESS","REOPENED"]) }).safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) return res.status(400).json({ success: false, message: "Invalid task ID or status." });
  const task = db.prepare("SELECT * FROM tasks WHERE task_id=?").get(id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  if (req.user.role === "MUNICIPAL_EMPLOYEE") {
    const employee = db.prepare("SELECT employee_id FROM employees WHERE user_id=?").get(req.user.user_id);
    if (!employee || task.assigned_employee_id !== employee.employee_id) return res.status(403).json({ success: false, message: "This task is not assigned to you." });
  }
  const tx = db.transaction(() => {
    db.prepare("UPDATE tasks SET status=?, started_at=CASE WHEN ?='IN_PROGRESS' AND started_at IS NULL THEN strftime('%Y-%m-%dT%H:%M:%fZ','now') ELSE started_at END, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE task_id=?").run(parsed.data.status, parsed.data.status, id);
    db.prepare("UPDATE complaints SET status=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE complaint_id=?").run(parsed.data.status === "IN_PROGRESS" ? "IN_PROGRESS" : "REOPENED", task.complaint_id);
    db.prepare("INSERT INTO task_history(task_id,changed_by,action,old_value,new_value) VALUES(?,?,?,?,?)").run(id, req.user.user_id, "TASK_STATUS_CHANGED", task.status, parsed.data.status);
    audit(req.user.user_id, "TASK_STATUS_CHANGED", "TASK", id, { status: task.status }, { status: parsed.data.status });
  });
  tx();
  res.json({ success: true, message: "Task updated." });
});

router.post("/:id/evidence", requireAuth, requireRole("MUNICIPAL_EMPLOYEE"), (req, res) => {
  const id = Number(req.params.id);
  const parsed = z.object({
    beforeImageUrl: z.string().min(1).max(1000),
    afterImageUrl: z.string().min(1).max(1000),
    notes: z.string().max(3000).optional().default(""),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  }).safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) return res.status(400).json({ success: false, message: "Invalid evidence payload." });
  const employee = db.prepare("SELECT employee_id FROM employees WHERE user_id=? AND approval_status='APPROVED'").get(req.user.user_id);
  const task = db.prepare("SELECT * FROM tasks WHERE task_id=?").get(id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  if (!employee || task.assigned_employee_id !== employee.employee_id) return res.status(403).json({ success: false, message: "Task is not assigned to you." });
  if (!["IN_PROGRESS","PENDING","REOPENED"].includes(task.status)) return res.status(409).json({ success: false, message: "Task is not eligible for evidence submission." });
  const tx = db.transaction(() => {
    const ev = db.prepare(`
      INSERT INTO cleaning_evidence(task_id,submitted_by,before_image_url,after_image_url,notes,latitude,longitude)
      VALUES(?,?,?,?,?,?,?)
    `).run(id, req.user.user_id, parsed.data.beforeImageUrl, parsed.data.afterImageUrl, parsed.data.notes, parsed.data.latitude ?? null, parsed.data.longitude ?? null);
    db.prepare("UPDATE tasks SET status='SUBMITTED', completed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'), updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE task_id=?").run(id);
    db.prepare("UPDATE complaints SET status='AWAITING_VERIFICATION', updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE complaint_id=?").run(task.complaint_id);
    db.prepare("INSERT INTO task_history(task_id,changed_by,action,new_value) VALUES(?,?,?,?)").run(id, req.user.user_id, "CLEANING_EVIDENCE_SUBMITTED", String(ev.lastInsertRowid));
    const complaint = db.prepare("SELECT citizen_id,public_tracking_code FROM complaints WHERE complaint_id=?").get(task.complaint_id);
    notify(complaint.citizen_id, `Cleaning evidence is ready for complaint ${complaint.public_tracking_code}`, task.complaint_id, id, "VERIFICATION");
    audit(req.user.user_id, "CLEANING_EVIDENCE_SUBMITTED", "EVIDENCE", Number(ev.lastInsertRowid));
    return Number(ev.lastInsertRowid);
  });
  const evidenceId = tx();
  res.status(201).json({ success: true, evidenceId, message: "Evidence submitted; awaiting citizen verification." });
});

router.post("/:id/acknowledgement", requireAuth, requireRole("CITIZEN"), (req, res) => {
  const taskId = Number(req.params.id);
  const parsed = z.object({ evidenceId: z.number().int().positive(), decision: z.enum(["CONFIRMED","DISPUTED"]), comment: z.string().max(2000).optional().default("") }).safeParse(req.body);
  if (!Number.isInteger(taskId) || !parsed.success) return res.status(400).json({ success: false, message: "Invalid acknowledgement." });
  const task = db.prepare("SELECT * FROM tasks WHERE task_id=?").get(taskId);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  const complaint = db.prepare("SELECT * FROM complaints WHERE complaint_id=?").get(task.complaint_id);
  if (complaint.citizen_id !== req.user.user_id) return res.status(403).json({ success: false, message: "Only the reporting citizen can acknowledge this complaint." });
  const evidence = db.prepare("SELECT * FROM cleaning_evidence WHERE evidence_id=? AND task_id=?").get(parsed.data.evidenceId, taskId);
  if (!evidence) return res.status(404).json({ success: false, message: "Evidence not found for this task." });
  if (evidence.review_status !== "AWAITING_CITIZEN") return res.status(409).json({ success: false, message: "This evidence has already been reviewed." });
  const tx = db.transaction(() => {
    db.prepare("INSERT INTO acknowledgements(complaint_id,citizen_id,evidence_id,decision,comment) VALUES(?,?,?,?,?)").run(complaint.complaint_id, req.user.user_id, evidence.evidence_id, parsed.data.decision, parsed.data.comment);
    const newReview = parsed.data.decision === "CONFIRMED" ? "CONFIRMED" : "DISPUTED";
    db.prepare("UPDATE cleaning_evidence SET review_status=? WHERE evidence_id=?").run(newReview, evidence.evidence_id);
    const newStatus = parsed.data.decision === "CONFIRMED" ? "RESOLVED" : "DISPUTED";
    db.prepare("UPDATE complaints SET status=?, resolved_at=CASE WHEN ?='RESOLVED' THEN strftime('%Y-%m-%dT%H:%M:%fZ','now') ELSE NULL END, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE complaint_id=?").run(newStatus, newStatus, complaint.complaint_id);
    db.prepare("UPDATE tasks SET status=? WHERE task_id=?").run(parsed.data.decision === "CONFIRMED" ? "COMPLETED" : "REOPENED", taskId);
    audit(req.user.user_id, `CITIZEN_${parsed.data.decision}`, "COMPLAINT", complaint.complaint_id, { status: complaint.status }, { status: newStatus }, parsed.data.comment);
    const employee = db.prepare("SELECT e.user_id FROM employees e WHERE e.employee_id=?").get(task.assigned_employee_id);
    if (employee) notify(employee.user_id, `Citizen ${parsed.data.decision.toLowerCase()} cleaning evidence for ${complaint.public_tracking_code}`, complaint.complaint_id, taskId, "VERIFICATION");
    const admins = db.prepare("SELECT user_id FROM users WHERE role='ADMIN' AND account_status='ACTIVE'").all();
    if (parsed.data.decision === "DISPUTED") admins.forEach(a => notify(a.user_id, `Cleaning evidence disputed for ${complaint.public_tracking_code}`, complaint.complaint_id, taskId, "DISPUTE"));
  });
  try { tx(); res.json({ success: true, message: parsed.data.decision === "CONFIRMED" ? "Cleaning confirmed." : "Dispute submitted for review." }); }
  catch (e) {
    if (String(e.message).includes("UNIQUE")) return res.status(409).json({ success: false, message: "You have already acknowledged this evidence." });
    console.error(e); res.status(500).json({ success: false, message: "Unable to record acknowledgement." });
  }
});

export default router;
