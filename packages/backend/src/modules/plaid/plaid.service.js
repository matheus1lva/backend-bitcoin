import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';
import { db } from '../../config/database';
import { userTable } from '../../schema';
import { eq } from 'drizzle-orm';

export class PlaidService {
  constructor() {
    this.plaidClient = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments['sandbox'],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
          },
        },
      }),
    );
  }

  async getUserAccountId(userId) {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    const plaidAccessToken = user[0].plaidAccessToken;

    const response = await this.plaidClient.accountsGet({
      access_token: plaidAccessToken,
    });

    return response.data?.accounts[0]?.account_id;
  }

  async getTransferStatus(transferId) {
    const response = await this.plaidClient.transferGet({
      transfer_id: transferId,
    });

    return response.data?.transfer.status;
  }

  async processPayment(userId, amount) {
    try {
      const user = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1);

      if (!user[0] || !user[0].plaidAccessToken) {
        throw new Error('Bank account not linked');
      }

      const accountId = await this.getUserAccountId(userId);

      const authResponseObject =
        await this.plaidClient.transferAuthorizationCreate({
          access_token: user[0].plaidAccessToken,
          account_id: accountId,
          idempotency_key: 'unique-key',
          user: {
            client_user_id: userId,
            legal_name: user[0].name,
            email_address: user[0].email,
          },
          amount: amount,
          ach_class: 'ppd',
          network: 'same-day-ach',
          user_present: true,
        });

      const transferResponse = await this.plaidClient.transferCreate({
        access_token: user[0].plaidAccessToken,
        authorization_id: authResponseObject.data.authorization_id,
        account_id: accountId,
        description: 'transfer to btc wallet to buy bitcoin',
        amount,
      });

      return transferResponse?.data?.transfer.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to process payment');
    }
  }
}
