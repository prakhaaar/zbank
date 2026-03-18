import pool from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigrations = async () => {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, "migrations/001_init.sql"),
      "utf8",
    );
    await pool.query(sql);
    console.log("Migrations ran successfully");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
};

runMigrations();
