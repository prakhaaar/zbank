import { Router } from "express";
import authController from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";
import authenticate from "../../middlewares/auth.middleware.js";

const router = Router();

// public routes  rate limited
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

// protected route  get current logged in user
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);
export default router;
