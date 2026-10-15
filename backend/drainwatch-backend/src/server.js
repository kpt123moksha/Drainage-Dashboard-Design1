import app from "./app.js";
import { config } from "./config.js";
import "./db.js";

const server = app.listen(config.port, () => {
  console.log(`DrainWatch API running at http://localhost:${config.port}`);
  console.log(`Health: http://localhost:${config.port}/api/v1/health`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
