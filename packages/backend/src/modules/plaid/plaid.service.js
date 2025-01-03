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

  getBalance = async (userId) => {
    const user = await this.userRepository.getById(userId);
    const plaidAccessToken = user.plaidAccessToken;
    const response = await this.plaidClient.accountsBalanceGet({
      access_token: plaidAccessToken,
    });
    return response.data?.accounts.reduce((acc, curr) => {
      acc[curr.official_name] = curr.balances.available;
      return acc;
    }, {});
  };

  async getUserAccountId(userId) {
    const user = await this.userRepository.getById(userId);

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
      const formattedAmount = amount.toFixed(2);

      // First create a transfer authorization
      const authorizationResponse =
        await this.plaidClient.transferAuthorizationCreate({
          access_token: user.plaidAccessToken,
          account_id: accountId,
          amount: formattedAmount,
          ach_class: 'ppd',
          user: {
            legal_name: user.name,
          },
          network: 'ach',
          type: 'debit',
        });

      // Then create the transfer using the authorization_id
      const transferResponse = await this.plaidClient.transferCreate({
        access_token: user.plaidAccessToken,
        account_id: accountId,
        authorization_id: authorizationResponse.data.authorization.id,
        amount: formattedAmount,
        description: 'Buy BTC',
      });

      return transferResponse?.data?.transfer?.id;
    } catch (error) {
      throw new Error(
        error.response?.data?.error_message || 'Failed to process payment',
      );
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
    } catch (err) {}
  }
}
