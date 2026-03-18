import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 30 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: "Too many requests, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
