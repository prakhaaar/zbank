import pg from "pg";
import env from "./env.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

console.log(
  "🔍 DB URL:",
  process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@"),
);

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ Database connected");
  release();
});

setInterval(
  async () => {
    try {
      await pool.query("SELECT 1");
    } catch (err) {
      console.error("Keep-alive failed:", err.message);
    }
  },
  4 * 60 * 1000,
);

pool.on("error", (err) =>
  console.error("Unexpected database error", err.message),
);

export default pool;
