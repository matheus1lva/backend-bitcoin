import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

export class PlaidService {
  constructor(userRepository) {
    this.userRepository = userRepository;
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
    const user = this.userRepository.getById(userId);

    const plaidAccessToken = user.plaidAccessToken;

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
      const user = await this.userRepository.getById(userId);

      if (!user || !user.plaidAccessToken) {
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

  async exchangePublicToken(data) {
    const publicToken = data.public_token;
    const userId = data.userId;

    try {
      const response = await this.plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemID = response.data.item_id;

      await this.userRepository.updateById({
        id: userId,
        plaidAccessToken: accessToken,
        plaidItemId: itemID,
      });

      return { public_token_exchange: 'completed' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createPlaidToken(data) {
    const userId = data.userId;
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Btc wallet',
      products: ['auth', 'transfer'],
      language: 'en',
      country_codes: ['US'],
    };

    try {
      const response = await this.plaidClient.linkTokenCreate(request);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }
}
