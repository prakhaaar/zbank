import pool from "../../config/db.js";
import redis from "../../config/redis.js";

const MAX_LIMIT = 100;
const ACCOUNT_CACHE_TTL = 60 * 5; // 5 minutes

const accountRepository = {
  getAccountsByUserId: async (userId, client = null) => {
    const db = client || pool;
    const result = await db.query(
      `SELECT id, account_number, account_type, balance, currency, created_at
       FROM accounts WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  },

  getAccountById: async (accountId, userId = null, client = null) => {
    const db = client || pool;

    // try cache first (only for no-ownership checks)
    if (!userId && !client) {
      try {
        const cached = await redis.get(`account:${accountId}`);
        if (cached) return JSON.parse(cached);
      } catch (_) {}
    }

    const query = userId
      ? `SELECT id, user_id, account_number, account_type, balance, currency, created_at
         FROM accounts WHERE id = $1 AND user_id = $2`
      : `SELECT id, user_id, account_number, account_type, balance, currency, created_at
         FROM accounts WHERE id = $1`;
    const params = userId ? [accountId, userId] : [accountId];
    const result = await db.query(query, params);
    const account = result.rows[0] || null;

    // cache if found and no ownership filter
    if (account && !userId && !client) {
      try {
        await redis.setEx(
          `account:${accountId}`,
          ACCOUNT_CACHE_TTL,
          JSON.stringify(account),
        );
      } catch (_) {}
    }

    return account;
  },

  getTransactionHistory: async (
    accountId,
    limit = 10,
    offset = 0,
    client = null,
  ) => {
    const db = client || pool;
    const safeLimit = Math.min(limit, MAX_LIMIT);

    const [dataResult, countResult] = await Promise.all([
      db.query(
        `SELECT t.id, t.type, t.status, t.note, t.created_at,
                le.amount, le.entry_type, le.description
         FROM ledger_entries le
         JOIN transactions t ON t.id = le.transaction_id
         WHERE le.account_id = $1
         ORDER BY le.created_at DESC, le.id DESC
         LIMIT $2 OFFSET $3`,
        [accountId, safeLimit, offset],
      ),
      db.query(`SELECT COUNT(*) FROM ledger_entries WHERE account_id = $1`, [
        accountId,
      ]),
    ]);

    return {
      transactions: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: Math.floor(offset / safeLimit) + 1,
      limit: safeLimit,
    };
  },

  updateBalance: async (accountId, amount, client) => {
    if (!client)
      throw new Error("updateBalance must be called within a transaction");

    const {
      rows: [account],
    } = await client.query(
      `SELECT id, balance FROM accounts WHERE id = $1 FOR UPDATE`,
      [accountId],
    );

    if (!account) throw new Error(`Account not found: ${accountId}`);

    const newBalance = parseFloat(account.balance) + amount;
    if (newBalance < 0) throw new Error("Insufficient balance");

    const result = await client.query(
      `UPDATE accounts SET balance = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, balance`,
      [newBalance, accountId],
    );
    return result.rows[0];
  },
  getAccountByAccountNumber: async (account_number, client = null) => {
    const db = client || pool;
    const result = await db.query(
      `SELECT a.id, a.account_number, a.account_type, a.balance,
            u.name, u.id as user_id
     FROM accounts a
     JOIN users u ON u.id = a.user_id
     WHERE a.account_number = $1`,
      [account_number],
    );
    return result.rows[0] || null;
  },
  invalidateAccountCache: async (accountId) => {
    try {
      await redis.del(`account:${accountId}`);
    } catch (_) {
      // silently ignore — cache invalidation failure shouldn't break the flow
    }
  },
};

export default accountRepository;
