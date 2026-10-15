import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT notification_id,complaint_id,task_id,message,notification_type,is_read,created_at
    FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100
  `).all(req.user.user_id);
  res.json({ success: true, data: rows });
});

router.patch("/:id/read", (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare("UPDATE notifications SET is_read=1 WHERE notification_id=? AND user_id=?").run(id, req.user.user_id);
  if (!result.changes) return res.status(404).json({ success: false, message: "Notification not found." });
  res.json({ success: true, message: "Notification marked as read." });
});

export default router;
