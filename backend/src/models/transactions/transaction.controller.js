import transactionService from "./transaction.service.js";

const transactionController = {
  transfer: async (req, res, next) => {
    try {
      const result = await transactionService.transfer(req.user.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

export default transactionController;
