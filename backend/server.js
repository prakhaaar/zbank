import app from "./app.js";
import env from "./src/config/env.js";
import pool from "./src/config/db.js";
console.log("ENV CHECK:", {
  DATABASE_URL: process.env.DATABASE_URL ? "✅ loaded" : "❌ missing",
  REDIS_URL: process.env.REDIS_URL ? "✅ loaded" : "❌ missing",
  JWT_SECRET: process.env.JWT_SECRET ? "✅ loaded" : "❌ missing",
});
pool
  .query("SELECT 1")
  .then(() => console.log(" Database connected"))
  .catch((err) => console.error(" Database connection failed:", err.message));

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
