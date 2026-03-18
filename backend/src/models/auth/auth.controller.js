import authService from "./auth.service.js";
import redis from "../../config/redis.js";
const authController = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const accounts = await import("../../config/db.js").then((m) =>
        m.default.query(
          `SELECT id, account_number, account_type, balance, currency, created_at
       FROM accounts WHERE user_id = $1
       ORDER BY created_at DESC`,
          [req.user.id],
        ),
      );

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          accounts: accounts.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      await redis.del(`user:${req.user.id}`);
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
