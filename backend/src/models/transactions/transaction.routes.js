import { Router } from "express";
import transactionController from "./transaction.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";
const router = Router();

router.use(authenticate);

router.post("/transfer", authLimiter, transactionController.transfer);

export default router;
