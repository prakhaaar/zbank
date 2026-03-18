import pool from "../../config/db.js";
import AppError from "../../middlewares/AppError.js";
const authRepository = {
  createUser: async ({ name, email, phone_no, password }, client = null) => {
    const db = client || pool;

    try {
      const result = await db.query(
        `INSERT INTO users (name, email, phone_no, password)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, phone_no, created_at`,
        [name, email, phone_no, password],
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError("User already exists", 409);
      }
      throw error;
    }
  },

  findUserByEmail: async (email, client = null) => {
    const db = client || pool;

    const result = await db.query(
      `SELECT id, name, email, phone_no, password, created_at 
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email],
    );

    return result.rows[0] || null;
  },

  findUserById: async (id, client = null) => {
    const db = client || pool;

    const result = await db.query(
      `SELECT id, name, email, phone_no, created_at 
       FROM users WHERE id = $1`,
      [id],
    );

    return result.rows[0] || null;
  },
};

export default authRepository;
