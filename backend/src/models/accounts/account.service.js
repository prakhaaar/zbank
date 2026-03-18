import pool from "../../config/db.js";
import accountRepository from "./account.repository.js";
import AppError from "../../middlewares/AppError.js";
import { randomUUID } from "crypto";
import { z } from "zod";

const depositSchema = z.object({
  account_id: z.string().uuid("Invalid account ID"),
  amount: z.coerce.number().positive(),

  note: z.string().max(255).optional(),
});

const accountService = {
  getMyAccounts: async (userId) => {
    return await accountRepository.getAccountsByUserId(userId);
  },

  getAccountById: async (accountId, userId) => {
    const account = await accountRepository.getAccountById(accountId, userId);
    if (!account) throw new AppError("Account not found or unauthorized", 404);
    return account;
  },

  getTransactionHistory: async (accountId, userId, page = 1, limit = 10) => {
    const account = await accountRepository.getAccountById(accountId, userId);
    if (!account) throw new AppError("Account not found or unauthorized", 404);

    const offset = (page - 1) * limit;
    const result = await accountRepository.getTransactionHistory(
      accountId,
      limit,
      offset,
    );
    return { account, ...result };
  },

  deposit: async (userId, input) => {
    const parsed = depositSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { account_id, amount, note } = parsed.data;

    const account = await accountRepository.getAccountById(account_id, userId);
    if (!account) throw new AppError("Account not found or unauthorized", 404);

    const idempotency_key = `deposit-${randomUUID()}`;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const {
        rows: [txn],
      } = await client.query(
        `INSERT INTO transactions (type, status, note, idempotency_key)
         VALUES ('deposit', 'success', $1, $2)
         RETURNING *`,
        [note || "Deposit", idempotency_key],
      );

      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_type, description)
         VALUES ($1, $2, $3, 'credit', 'Deposit')`,
        [txn.id, account_id, amount],
      );

      const updated = await accountRepository.updateBalance(
        account_id,
        amount,
        client,
      );

      await client.query("COMMIT");
      // invalidate account cache
      await accountRepository.invalidateAccountCache(account_id);
      return {
        transaction: txn,
        balance: updated.balance,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof AppError) throw error;
      throw new AppError("Deposit failed: " + error.message, 500);
    } finally {
      client.release();
    }
  },
};

export default accountService;
