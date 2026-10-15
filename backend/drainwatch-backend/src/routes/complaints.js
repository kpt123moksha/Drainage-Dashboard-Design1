import { Router } from "express";
import { z } from "zod";
import db from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { audit, notify, publicCode } from "../utils.js";

const router = Router();
const createSchema = z.object({
  category: z.enum(["BLOCKED_DRAIN","STAGNANT_WATER","DAMAGED_DRAINAGE","WATERLOGGING_RISK","OTHER"]),
  description: z.string().max(3000).optional().default(""),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  severity: z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional().default("MEDIUM"),
  drainId: z.number().int().positive().optional(),
  imageUrl: z.string().max(1000).optional()
});

router.post("/", requireAuth, requireRole("CITIZEN"), (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid complaint data.", errors: parsed.error.flatten() });
  const d = parsed.data;
  const tx = db.transaction(() => {
    const code = publicCode();
    const result = db.prepare(`
      INSERT INTO complaints(public_tracking_code,citizen_id,drain_id,category,description,latitude,longitude,severity)
      VALUES(?,?,?,?,?,?,?,?)
    `).run(code, req.user.user_id, d.drainId ?? null, d.category, d.description, d.latitude, d.longitude, d.severity);
    const id = Number(result.lastInsertRowid);
    if (d.imageUrl) db.prepare("INSERT INTO complaint_images(complaint_id,uploaded_by,image_url,image_type) VALUES(?,?,?,'COMPLAINT')").run(id, req.user.user_id, d.imageUrl);
    audit(req.user.user_id, "COMPLAINT_CREATED", "COMPLAINT", id, null, { code, category: d.category });
    const staff = db.prepare("SELECT user_id FROM users WHERE role IN ('MUNICIPAL_EMPLOYEE','ADMIN') AND account_status='ACTIVE'").all();
    for (const s of staff) notify(s.user_id, `New drainage complaint ${code}`, id, null, "COMPLAINT");
    return db.prepare("SELECT * FROM complaints WHERE complaint_id=?").get(id);
  });
  try {
    const complaint = tx();
    res.status(201).json({ success: true, data: complaint });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Could not create complaint." });
  }
});

router.get("/", requireAuth, (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : null;
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  let rows;
  if (req.user.role === "CITIZEN") {
    rows = db.prepare(`
      SELECT c.*, (SELECT COUNT(*) FROM complaint_images i WHERE i.complaint_id=c.complaint_id) AS image_count
      FROM complaints c WHERE c.citizen_id=? AND (? IS NULL OR c.status=?)
      ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `).all(req.user.user_id, status, status, limit, offset);
  } else {
    rows = db.prepare(`
      SELECT c.*, u.full_name AS citizen_name,
      (SELECT COUNT(*) FROM complaint_images i WHERE i.complaint_id=c.complaint_id) AS image_count
      FROM complaints c JOIN users u ON u.user_id=c.citizen_id
      WHERE (? IS NULL OR c.status=?) ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `).all(status, status, limit, offset);
  }
  res.json({ success: true, data: rows, pagination: { limit, offset } });
});

router.get("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, message: "Invalid complaint ID." });
  const complaint = db.prepare(`
    SELECT c.*, u.full_name AS citizen_name
    FROM complaints c JOIN users u ON u.user_id=c.citizen_id WHERE c.complaint_id=?
  `).get(id);
  if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found." });
  if (req.user.role === "CITIZEN" && complaint.citizen_id !== req.user.user_id) return res.status(403).json({ success: false, message: "You cannot access this complaint." });
  const images = db.prepare("SELECT image_id,image_url,image_type,uploaded_at FROM complaint_images WHERE complaint_id=? ORDER BY uploaded_at").all(id);
  const tasks = db.prepare("SELECT * FROM tasks WHERE complaint_id=? ORDER BY created_at DESC").all(id);
  res.json({ success: true, data: { ...complaint, images, tasks } });
});

router.patch("/:id/status", requireAuth, requireRole("MUNICIPAL_EMPLOYEE","ADMIN"), (req, res) => {
  const id = Number(req.params.id);
  const parsed = z.object({ status: z.enum(["UNDER_REVIEW","IN_PROGRESS","REOPENED","REJECTED","CANCELLED"]) }).safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) return res.status(400).json({ success: false, message: "Invalid ID or status." });
  const current = db.prepare("SELECT * FROM complaints WHERE complaint_id=?").get(id);
  if (!current) return res.status(404).json({ success: false, message: "Complaint not found." });
  const allowed = {
    SUBMITTED: ["UNDER_REVIEW","REJECTED","CANCELLED"],
    UNDER_REVIEW: ["IN_PROGRESS","REOPENED","REJECTED","CANCELLED"],
    IN_PROGRESS: ["REOPENED"],
    DISPUTED: ["REOPENED","IN_PROGRESS"],
    REOPENED: ["IN_PROGRESS","CANCELLED"]
  };
  if (!(allowed[current.status] || []).includes(parsed.data.status)) return res.status(409).json({ success: false, message: `Invalid status transition from ${current.status}.` });
  const tx = db.transaction(() => {
    db.prepare("UPDATE complaints SET status=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE complaint_id=?").run(parsed.data.status, id);
    audit(req.user.user_id, "COMPLAINT_STATUS_CHANGED", "COMPLAINT", id, { status: current.status }, { status: parsed.data.status });
    notify(current.citizen_id, `Complaint ${current.public_tracking_code} status changed to ${parsed.data.status}`, id);
  });
  tx();
  res.json({ success: true, message: "Complaint status updated." });
});

router.get("/:id/history", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const complaint = db.prepare("SELECT citizen_id FROM complaints WHERE complaint_id=?").get(id);
  if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found." });
  if (req.user.role === "CITIZEN" && complaint.citizen_id !== req.user.user_id) return res.status(403).json({ success: false, message: "Forbidden." });
  const logs = db.prepare("SELECT action,entity_type,entity_id,old_values,new_values,reason,created_at FROM audit_logs WHERE entity_type='COMPLAINT' AND entity_id=? ORDER BY created_at").all(id);
  res.json({ success: true, data: logs });
});

export default router;
