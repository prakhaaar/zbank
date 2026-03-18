import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import pool from "../../config/db.js";
import authRepository from "./auth.repository.js";
import env from "../../config/env.js";
import AppError from "../../middlewares/AppError.js";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").max(254),
  phone_no: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, "Phone number must be 10–15 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  account_type: z.enum(["savings", "current"]).default("savings"),
  initial_balance: z.number().min(0).default(0),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(254),
  password: z.string().min(1, "Password is required").max(128),
});

const generateToken = (userId) =>
  jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const generateAccountNumber = () =>
  `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;

const authService = {
  register: async (input) => {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { name, email, phone_no, password, account_type, initial_balance } =
      parsed.data;
    const normalizedEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(
      password,
      Number(env.BCRYPT_ROUNDS),
    );

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const user = await authRepository.createUser(
        { name, email: normalizedEmail, phone_no, password: hashedPassword },
        client,
      );

      const account_number = generateAccountNumber();

      // RETURNING * — no extra query needed
      const {
        rows: [account],
      } = await client.query(
        `INSERT INTO accounts (user_id, account_number, account_type, balance)
         VALUES ($1, $2, $3, $4)
         RETURNING id, account_number, account_type, balance, currency`,
        [user.id, account_number, account_type, initial_balance],
      );

      if (initial_balance > 0) {
        const {
          rows: [txn],
        } = await client.query(
          `INSERT INTO transactions (type, status, note, idempotency_key)
           VALUES ('deposit', 'success', 'Opening balance', $1)
           RETURNING id`,
          [`opening-${account.id}`],
        );

        await client.query(
          `INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_type, description)
           VALUES ($1, $2, $3, 'credit', 'Opening balance')`,
          [txn.id, account.id, initial_balance],
        );

        // ledger integrity check — entry_type aware
        const {
          rows: [ledgerCheck],
        } = await client.query(
          `SELECT COALESCE(
             SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0
           ) AS ledger_sum
           FROM ledger_entries WHERE account_id = $1`,
          [account.id],
        );

        if (Number(ledgerCheck.ledger_sum) !== initial_balance) {
          throw new AppError("Ledger integrity check failed", 500);
        }
      }

      await client.query("COMMIT");

      const token = generateToken(user.id);
      return { user, account, token };
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        throw new AppError("User already exists with this email or phone", 409);
      }
      if (error instanceof AppError) throw error;
      throw new AppError("Registration failed. Please try again later.", 500);
    } finally {
      client.release();
    }
  },

  login: async (input) => {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;
    const user = await authRepository.findUserByEmail(email.toLowerCase());
    if (!user) throw new AppError("Invalid credentials", 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },
};

export default authService;
