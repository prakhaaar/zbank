# ZBank — Banking Transfer System

A full-stack banking application with user accounts, deposits, and money transfers. Built with Next.js on the frontend and Node.js/Express on the backend, backed by PostgreSQL and Redis.

**Live:** https://zbank.prakharhq.site

---

## Stack

**Frontend** — Next.js 14, Tailwind CSS  
**Backend** — Node.js, Express  
**Database** — PostgreSQL (Neon)  
**Cache / Auth** — Redis (Upstash), JWT

---

## Features

- Register and log in with JWT-based authentication
- View account balance and account details
- Deposit funds into your account
- Transfer money to other accounts (with insufficient balance protection)
- Full transaction history with pagination
- Double-entry ledger — every transfer creates two ledger records
- Idempotency keys to prevent duplicate transactions
- Row-level locking to prevent race conditions on concurrent transfers
- Redis caching for authenticated user sessions

---

## Project Structure

```
zbanksystem/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, env config
│   │   ├── middlewares/     # Auth, rate limiter, error handler
│   │   └── models/
│   │       ├── auth/        # Register, login, logout
│   │       ├── accounts/    # Balance, deposit, transaction history
│   │       └── transactions/ # Transfer logic
│   ├── migrations/
│   │   └── 001_init.sql
│   └── server.js
└── frontend/
    ├── app/
    │   ├── dashboard/
    │   ├── deposit/
    │   ├── login/
    │   ├── register/
    │   ├── transfer/
    │   └── transactionhistory/
    └── components/
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A PostgreSQL database (or a free [Neon](https://neon.tech) project)
- A Redis instance (or a free [Upstash](https://upstash.com) database)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd zbanksystem
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
REDIS_URL=your_redis_url
PORT=5000
```

Run migrations and start the server:

```bash
npm run migrate
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`. Make sure your API base URL is pointed at the backend (check `frontend/src/lib/api.js` or wherever your base URL is configured).

---

## API Endpoints

### Auth

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| POST   | `/api/v1/auth/register` | Create account              |
| POST   | `/api/v1/auth/login`    | Login                       |
| GET    | `/api/v1/auth/me`       | Current user + accounts     |
| POST   | `/api/v1/auth/logout`   | Logout (clears Redis cache) |

### Accounts

| Method | Endpoint                            | Description                     |
| ------ | ----------------------------------- | ------------------------------- |
| GET    | `/api/v1/accounts`                  | List your accounts              |
| GET    | `/api/v1/accounts/:id`              | Account details                 |
| GET    | `/api/v1/accounts/:id/transactions` | Transaction history (paginated) |
| POST   | `/api/v1/accounts/deposit`          | Deposit funds                   |

### Transactions

| Method | Endpoint                        | Description                 |
| ------ | ------------------------------- | --------------------------- |
| POST   | `/api/v1/transactions/transfer` | Transfer to another account |

---

## Test Flow

Here's a quick end-to-end walkthrough to verify everything works:

**1. Register User A**

```json
POST /api/v1/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "phone_no": "9876543210",
  "password": "password123",
  "account_type": "savings",
  "initial_balance": 0
}
```

**2. Log in as User A** — save the token from the response.

**3. Deposit funds**

```json
POST /api/v1/accounts/deposit
Authorization: Bearer <token>
{
  "account_id": "<alice_account_id>",
  "amount": 5000,
  "note": "Initial deposit"
}
```

**4. Register and log in as User B** — note their account ID.

**5. Transfer from A → B**

```json
POST /api/v1/transactions/transfer
Authorization: Bearer <alice_token>
{
  "from_account_id": "<alice_account_id>",
  "to_account_id": "<bob_account_id>",
  "amount": 1000,
  "note": "Splitting dinner"
}
```

**6. Check balances** — Alice should be down ₹1000, Bob up ₹1000.

**7. Try an overdraft** — attempt to transfer more than Alice's balance. Should return a `400` with `"Insufficient balance"`.

**8. Check transaction history** on either account — both the debit and credit entries should appear.

---

## Notes

- Transfers are atomic — if anything fails mid-transaction, the whole thing rolls back
- Rate limiting is applied on auth routes (10 requests per 15 minutes)
- Failed transactions are logged separately for auditability
- The `idempotency_key` field on transfers prevents double-charges if a request is retried
