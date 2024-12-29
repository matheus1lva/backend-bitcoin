import { PlaidService } from './plaid.service.js';

export class PlaidController {
  constructor() {
    this.plaidService = new PlaidService();
  }

  getBalance = async (req, res) => {
    try {
      const balance = await this.plaidService.getBalance(req.userId);
      res.json(balance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

  createPayment = async (req, res) => {
    try {
      const { amount } = req.body;
      const payment = await this.plaidService.processPayment(
        req.userId,
        amount,
      );
      res.json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

  getPaymentStatus = async (req, res) => {
    try {
      const { paymentId } = req.params;
      const status = await this.plaidService.getTransferStatus(paymentId);
      res.json(status);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
}
