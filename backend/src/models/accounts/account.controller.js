import accountService from "./account.service.js";
import accountRepository from "./account.repository.js";
const accountController = {
  getMyAccounts: async (req, res, next) => {
    try {
      const accounts = await accountService.getMyAccounts(req.user.id);
      res.status(200).json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  },

  getAccountById: async (req, res, next) => {
    try {
      const account = await accountService.getAccountById(
        req.params.id,
        req.user.id,
      );
      res.status(200).json({ success: true, data: account });
    } catch (error) {
      next(error);
    }
  },

  getTransactionHistory: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const data = await accountService.getTransactionHistory(
        req.params.id,
        req.user.id,
        page,
        limit,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  deposit: async (req, res, next) => {
    try {
      const result = await accountService.deposit(req.user.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  lookupByAccountNumber: async (req, res, next) => {
    try {
      const account = await accountRepository.getAccountByAccountNumber(
        req.params.account_number,
      );
      if (!account)
        return res
          .status(404)
          .json({ success: false, error: "Account not found" });
      // only expose safe fields
      res.status(200).json({
        success: true,
        data: { name: account.name, account_number: account.account_number },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default accountController;
