import db from "./db.js";

export function audit(actorId, action, entityType, entityId, oldValues = null, newValues = null, reason = null) {
  db.prepare(`
    INSERT INTO audit_logs(actor_user_id, action, entity_type, entity_id, old_values, new_values, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(actorId ?? null, action, entityType, entityId ?? null,
    oldValues == null ? null : JSON.stringify(oldValues),
    newValues == null ? null : JSON.stringify(newValues), reason);
}

export function notify(userId, message, complaintId = null, taskId = null, type = "INFO") {
  db.prepare(`
    INSERT INTO notifications(user_id, complaint_id, task_id, message, notification_type)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, complaintId, taskId, message, type);
}

export function publicCode() {
  return `DW-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function riskLevel(score) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}
