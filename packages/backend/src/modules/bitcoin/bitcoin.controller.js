import { BitcoinService } from './bitcoin.service.js';
import { PlaidService } from '../plaid/plaid.service.js';
import { db } from '../../config/database.js';
import { userTable } from '../../schema/user.schema.js';
import { eq } from 'drizzle-orm';
import { UsersRepository } from '../users/users.repository.js';

export class BitcoinController {
  constructor() {
    this.bitcoinService = new BitcoinService(new UsersRepository());
    this.plaidService = new PlaidService();
  }

  getBalance = async (req, res) => {
    try {
      const user = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, req.userId))
        .limit(1);

      if (!user[0] || !user[0].btcReceiveAddress) {
        return res.status(404).json({ message: 'Bitcoin address not found' });
      }

      const balance = await this.bitcoinService.getBalance(
        user[0].btcReceiveAddress,
      );
      res.json({ balance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error getting Bitcoin balance' });
    }
  };

  sendBitcoin = async (req, res) => {
    try {
      const userId = req.userId;
      const amountInSatoshis = req.body.amount;
      const txid = await this.bitcoinService.sendBitcoin(
        userId,
        amountInSatoshis,
      );
      res.json({ txid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

  purchaseBitcoin = async (req, res) => {
    try {
      const { amount } = req.body;
      const txid = await this.bitcoinService.sendBitcoin(req.userId, amount);

      res.json({ txid });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: error.message || 'Error purchasing Bitcoin' });
    }
  };
}
