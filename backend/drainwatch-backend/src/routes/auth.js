import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import db from "../db.js";
import { config } from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../utils.js";

const router = Router();
const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  password: z.string().min(10).max(128)
});

router.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid registration details.", errors: parsed.error.flatten() });
  try {
    const { fullName, email, phone, password } = parsed.data;
    const hash = bcrypt.hashSync(password, 12);
    const result = db.prepare(`
      INSERT INTO users(full_name, email, phone, password_hash, role, account_status)
      VALUES (?, ?, ?, ?, 'CITIZEN', 'ACTIVE')
    `).run(fullName, email.toLowerCase(), phone, hash);
    audit(Number(result.lastInsertRowid), "USER_REGISTERED", "USER", Number(result.lastInsertRowid));
    return res.status(201).json({ success: true, message: "Registration successful. Please log in." });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) return res.status(409).json({ success: false, message: "Email already registered." });
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to register user." });
  }
});

router.post("/login", (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Email and password are required." });
  const user = db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(parsed.data.email);
  if (!user || !bcrypt.compareSync(parsed.data.password, user.password_hash) || user.account_status !== "ACTIVE") {
    return res.status(401).json({ success: false, message: "Invalid credentials or inactive account." });
  }
  if (user.role === "MUNICIPAL_EMPLOYEE") {
    const emp = db.prepare("SELECT approval_status FROM employees WHERE user_id = ?").get(user.user_id);
    if (!emp || emp.approval_status !== "APPROVED") return res.status(403).json({ success: false, message: "Employee approval is pending." });
  }
  if (!config.jwtSecret) return res.status(500).json({ success: false, message: "JWT_SECRET is not configured. Copy .env.example to .env and set it." });
  const token = jwt.sign({ sub: user.user_id }, config.jwtSecret, { expiresIn: "8h" });
  audit(user.user_id, "USER_LOGIN", "USER", user.user_id);
  return res.json({
    success: true,
    token,
    user: { id: user.user_id, fullName: user.full_name, email: user.email, role: user.role }
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, user: { id: req.user.user_id, fullName: req.user.full_name, email: req.user.email, role: req.user.role } });
});

router.post("/logout", requireAuth, (req, res) => {
  audit(req.user.user_id, "USER_LOGOUT", "USER", req.user.user_id);
  res.json({ success: true, message: "Logged out. Remove the token from the client." });
});

export default router;
