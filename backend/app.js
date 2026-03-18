import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./src/models/auth/auth.routes.js";
import AppError from "./src/middlewares/AppError.js";
import accountRoutes from "./src/models/accounts/account.routes.js";
import transactionRoutes from "./src/models/transactions/transaction.routes.js";
import pool from "./src/config/db.js";
const app = express();

// security headers
app.use(helmet());

// cors

const allowedOrigins = [
  "https://zbank.prakharhq.site",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// request logger
app.use(morgan("dev"));

// body parser
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    // check DB connection
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "Server is healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unhealthy",
    });
  }
});

// routes
app.use("/api/v1/auth", authRoutes);

//account Routes
app.use("/api/v1/accounts", accountRoutes);

//transaction routes

app.use("/api/v1/transactions", transactionRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error("ERROR:", err.message); // add this
  const message = err.isOperational ? err.message : "Something went wrong";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { detail: err.message }), // add this
  });
});
export default app;
