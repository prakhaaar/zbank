import pool from "../../config/db.js";
import transactionRepository from "./transaction.repository.js";
import accountRepository from "../accounts/account.repository.js";
import AppError from "../../middlewares/AppError.js";
import { randomUUID } from "crypto";
import { z } from "zod";

const transferSchema = z.object({
  from_account_id: z.string().uuid("Invalid sender account ID"),
  to_account_number: z.string().min(1, "Receiver account number required"),
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().max(255).optional(),
  idempotency_key: z.string().optional(),
});

const transactionService = {
  transfer: async (userId, input) => {
    const parsed = transferSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const {
      from_account_id,
      to_account_number,
      amount,
      note,
      idempotency_key,
    } = parsed.data;

    // self transfer check — by account number
    const fromAccount = await accountRepository.getAccountById(
      from_account_id,
      userId,
    );
    if (!fromAccount)
      throw new AppError("Sender account not found or unauthorized", 403);

    if (fromAccount.account_number === to_account_number) {
      throw new AppError("Cannot transfer to same account", 400);
    }

    // idempotency check
    const iKey = idempotency_key || `transfer-${randomUUID()}`;
    const existing = await transactionRepository.findByIdempotencyKey(iKey);
    if (existing) return { transaction: existing, idempotent: true };

    // receiver lookup by account number
    const toAccount =
      await accountRepository.getAccountByAccountNumber(to_account_number);
    if (!toAccount) throw new AppError("Receiver account not found", 404);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // lock both accounts in consistent order — prevent deadlock
      const [firstId, secondId] = [from_account_id, toAccount.id].sort();
      await client.query(
        `SELECT id FROM accounts WHERE id IN ($1, $2) ORDER BY id FOR UPDATE`,
        [firstId, secondId],
      );

      // balance check after lock
      const {
        rows: [sender],
      } = await client.query(`SELECT balance FROM accounts WHERE id = $1`, [
        from_account_id,
      ]);
      if (parseFloat(sender.balance) < amount) {
        throw new AppError("Insufficient balance", 400);
      }

      // create transaction — pending first
      const txn = await transactionRepository.createTransaction(
        {
          type: "transfer",
          status: "pending",
          note: note || null,
          idempotency_key: iKey,
        },
        client,
      );

      // debit sender
      await transactionRepository.createLedgerEntry(
        {
          transaction_id: txn.id,
          account_id: from_account_id,
          amount,
          entry_type: "debit",
          description: `Transfer to ${toAccount.account_number}`,
        },
        client,
      );

      // credit receiver
      await transactionRepository.createLedgerEntry(
        {
          transaction_id: txn.id,
          account_id: toAccount.id,
          amount,
          entry_type: "credit",
          description: `Transfer from ${fromAccount.account_number}`,
        },
        client,
      );

      // safe balance update with DB constraint check
      const { rowCount } = await client.query(
        `UPDATE accounts SET balance = balance - $1, updated_at = NOW()
         WHERE id = $2 AND balance >= $1`,
        [amount, from_account_id],
      );
      if (rowCount === 0) throw new AppError("Insufficient balance", 400);

      await client.query(
        `UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
        [amount, toAccount.id],
      );

      // mark success
      const finalTxn = await transactionRepository.updateTransactionStatus(
        txn.id,
        "success",
        client,
      );

      // fetch updated balance
      const {
        rows: [updatedSender],
      } = await client.query(`SELECT balance FROM accounts WHERE id = $1`, [
        from_account_id,
      ]);

      await client.query("COMMIT");

      // invalidate cache
      await accountRepository.invalidateAccountCache(from_account_id);
      await accountRepository.invalidateAccountCache(toAccount.id);

      return {
        transaction: finalTxn,
        from_balance: updatedSender.balance,
        idempotent: false,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      try {
        await pool.query(
          `INSERT INTO transactions (type, status, note, idempotency_key)
           VALUES ('transfer', 'failed', $1, $2)`,
          [note || null, `${iKey}-failed-${Date.now()}`],
        );
      } catch (_) {}
      if (error instanceof AppError) throw error;
      throw new AppError("Transfer failed", 500);
    } finally {
      client.release();
    }
  },
};

export default transactionService;
