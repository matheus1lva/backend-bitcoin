import { BitcoinService } from './bitcoin.service.js';
import { UserRepository } from '../user/user.repository.js';
import { PlaidService } from '../plaid/plaid.service.js';
import { logger } from '../../utils/logger.js';

export class BitcoinController {
  constructor() {
    this.userRepository = new UserRepository();
    this.bitcoinService = new BitcoinService(this.userRepository);
    this.plaidService = new PlaidService(this.userRepository);
  }

  getBalance = async (req, res) => {
    try {
      const userId = req.userId;

      const balance = await this.bitcoinService.getBalance(userId);
      res.json({ balance });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Error getting Bitcoin balance' });
    }
  };

  purchaseBitcoin = async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.userId;

      const transferId = await this.plaidService.processPayment(userId, amount);

      const btcPrice = await this.bitcoinService.getCurrentPrice();
      const btcAmount = amount / btcPrice;

      const txid = await this.bitcoinService.sendBitcoin(userId, btcAmount);

      res.json({
        txid,
        transferId,
        amountUsd: amount,
        amountBtc: btcAmount,
        price: btcPrice,
      });
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json({ message: error.message || 'Error purchasing Bitcoin' });
    }
  };

  getCurrentPrice = async (req, res) => {
    try {
      const price = await this.bitcoinService.getCurrentPrice();
      res.json({ price });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Error getting Bitcoin price' });
    }
  };
}
