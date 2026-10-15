import jwt from "jsonwebtoken";
import db from "../db.js";
import { config } from "../config.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Authentication required." });
  try {
    if (!config.jwtSecret) throw new Error("JWT_SECRET is not configured");
    const payload = jwt.verify(token, config.jwtSecret);
    const user = db.prepare(`
      SELECT user_id, full_name, email, role, account_status
      FROM users WHERE user_id = ?
    `).get(payload.sub);
    if (!user || user.account_status !== "ACTIVE") {
      return res.status(401).json({ success: false, message: "Account unavailable." });
    }
    if (user.role === "MUNICIPAL_EMPLOYEE") {
      const employee = db.prepare("SELECT approval_status FROM employees WHERE user_id = ?").get(user.user_id);
      if (!employee || employee.approval_status !== "APPROVED") {
        return res.status(403).json({ success: false, message: "Employee account is not approved." });
      }
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions." });
    }
    next();
  };
}
