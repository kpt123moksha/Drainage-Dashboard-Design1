import { Router } from "express";
import { z } from "zod";
import db from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { audit, riskLevel } from "../utils.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT d.drain_id,d.location_name,d.latitude,d.longitude,d.known_risk_level,d.is_low_lying,
      (SELECT risk_score FROM risk_assessments r WHERE r.drain_id=d.drain_id ORDER BY assessed_at DESC LIMIT 1) AS latest_risk_score
    FROM drainage_locations d WHERE d.is_active=1 ORDER BY d.location_name
  `).all();
  res.json({ success: true, data: rows });
});

router.post("/", requireAuth, requireRole("ADMIN","MUNICIPAL_EMPLOYEE"), (req, res) => {
  const parsed = z.object({
    locationName: z.string().trim().min(2).max(200),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    elevationMeters: z.number().optional(),
    drainType: z.string().max(80).optional().default("STORM_DRAIN"),
    isLowLying: z.boolean().optional().default(false)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid drain data." });
  const d = parsed.data;
  const result = db.prepare("INSERT INTO drainage_locations(location_name,latitude,longitude,elevation_meters,drain_type,is_low_lying) VALUES(?,?,?,?,?,?)")
    .run(d.locationName, d.latitude, d.longitude, d.elevationMeters ?? null, d.drainType, d.isLowLying ? 1 : 0);
  audit(req.user.user_id, "DRAIN_CREATED", "DRAIN", Number(result.lastInsertRowid));
  res.status(201).json({ success: true, data: db.prepare("SELECT * FROM drainage_locations WHERE drain_id=?").get(result.lastInsertRowid) });
});

router.get("/risk-assessments", requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, d.location_name, d.latitude, d.longitude
    FROM risk_assessments r JOIN drainage_locations d ON d.drain_id=r.drain_id
    ORDER BY r.assessed_at DESC LIMIT 100
  `).all();
  res.json({ success: true, data: rows });
});

router.post("/:id/risk-assessments", requireAuth, requireRole("ADMIN","MUNICIPAL_EMPLOYEE"), (req, res) => {
  const drainId = Number(req.params.id);
  const parsed = z.object({
    rainfallInput: z.enum(["UNKNOWN","LOW","MODERATE","HEAVY","EXTREME"]).optional().default("UNKNOWN"),
    blockageHistoryScore: z.number().int().min(0).max(100),
    elevationRiskScore: z.number().int().min(0).max(100)
  }).safeParse(req.body);
  if (!Number.isInteger(drainId) || !parsed.success) return res.status(400).json({ success: false, message: "Invalid risk assessment." });
  const drain = db.prepare("SELECT * FROM drainage_locations WHERE drain_id=? AND is_active=1").get(drainId);
  if (!drain) return res.status(404).json({ success: false, message: "Drain not found." });
  const rainfallScore = { UNKNOWN: 20, LOW: 10, MODERATE: 35, HEAVY: 70, EXTREME: 100 }[parsed.data.rainfallInput];
  const score = Math.round(Math.min(100, Math.max(0,
    0.4 * parsed.data.blockageHistoryScore +
    0.3 * parsed.data.elevationRiskScore +
    0.3 * rainfallScore
  )));
  const level = riskLevel(score);
  const result = db.prepare(`
    INSERT INTO risk_assessments(drain_id,risk_score,risk_level,rainfall_input,blockage_history_score,elevation_risk_score,method,assessed_by)
    VALUES(?,?,?,?,?,?,?,?)
  `).run(drainId, score, level, parsed.data.rainfallInput, parsed.data.blockageHistoryScore, parsed.data.elevationRiskScore, "RULE_BASED_DEMO_V1", req.user.user_id);
  audit(req.user.user_id, "RISK_ASSESSED", "RISK_ASSESSMENT", Number(result.lastInsertRowid), null, { score, level });
  res.status(201).json({ success: true, data: { riskAssessmentId: Number(result.lastInsertRowid), drainId, score, level, method: "RULE_BASED_DEMO_V1", disclaimer: "Demonstration estimate, not a validated flood prediction." } });
});

export default router;
