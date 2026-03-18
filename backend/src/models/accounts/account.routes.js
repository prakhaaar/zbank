import { Router } from "express";
import accountController from "./account.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", accountController.getMyAccounts);
router.get("/:id", accountController.getAccountById);
router.get("/:id/transactions", accountController.getTransactionHistory);
router.post("/deposit", accountController.deposit);
router.get(
  "/lookup/:account_number",
  authenticate,
  accountController.lookupByAccountNumber,
);

export default router;
