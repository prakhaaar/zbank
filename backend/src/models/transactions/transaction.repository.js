import pool from "../../config/db.js";

const transactionRepository = {
  findByIdempotencyKey: async (key, client = null) => {
    const db = client || pool;
    const result = await db.query(
      `SELECT * FROM transactions WHERE idempotency_key = $1`,
      [key],
    );
    return result.rows[0] || null;
  },

  createTransaction: async (
    { type, status, note, idempotency_key },
    client,
  ) => {
    const result = await client.query(
      `INSERT INTO transactions (type, status, note, idempotency_key)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [type, status, note, idempotency_key],
    );
    return result.rows[0];
  },

  createLedgerEntry: async (
    { transaction_id, account_id, amount, entry_type, description },
    client,
  ) => {
    const result = await client.query(
      `INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_type, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [transaction_id, account_id, amount, entry_type, description],
    );
    return result.rows[0];
  },

  updateTransactionStatus: async (id, status, client) => {
    const result = await client.query(
      `UPDATE transactions SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return result.rows[0];
  },
};

export default transactionRepository;
