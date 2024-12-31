import { BitcoinService } from './bitcoin.service.js';
import { UsersRepository } from '../user/user.repository.js';
import { logger } from '../../utils/logger.js';

export class BitcoinController {
  constructor() {
    this.bitcoinService = new BitcoinService(new UsersRepository());
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
      const txid = await this.bitcoinService.sendBitcoin(req.userId, amount);

      res.json({ txid });
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json({ message: error.message || 'Error purchasing Bitcoin' });
    }
  };
}
