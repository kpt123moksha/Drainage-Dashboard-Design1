import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();
const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, "..");

export const config = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "",
  databasePath: path.resolve(backendRoot, process.env.DATABASE_PATH || "./data/drainwatch.db"),
  uploadDir: path.resolve(backendRoot, process.env.UPLOAD_DIR || "./uploads"),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 5),
  backendRoot
};

if (config.jwtSecret.length < 32 && config.nodeEnv === "production") {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}
