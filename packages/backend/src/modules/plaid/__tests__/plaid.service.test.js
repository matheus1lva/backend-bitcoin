import { PlaidService } from '../plaid.service.js';
import { PlaidApi } from 'plaid';

// Mock the Plaid API
jest.mock('plaid', () => ({
  PlaidApi: jest.fn(),
  Configuration: jest.fn(),
  PlaidEnvironments: {
    sandbox: 'sandbox-environment',
  },
}));

describe('PlaidService', () => {
  let plaidService;
  let mockUserRepository;
  let mockPlaidClient;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock Plaid client methods
    mockPlaidClient = {
      accountsBalanceGet: jest.fn(),
      accountsGet: jest.fn(),
      transferGet: jest.fn(),
      transferCreate: jest.fn(),
      itemPublicTokenExchange: jest.fn(),
      linkTokenCreate: jest.fn(),
    };

    // Setup PlaidApi mock
    PlaidApi.mockImplementation(() => mockPlaidClient);

    // Create mock user repository
    mockUserRepository = {
      getById: jest.fn(),
      updateById: jest.fn(),
    };

    plaidService = new PlaidService(mockUserRepository);
  });

  describe('getBalance', () => {
    const mockUserId = 'user-123';
    const mockAccessToken = 'access-token-123';
    const mockAccounts = [
      {
        official_name: 'Checking',
        balances: { available: 1000 },
      },
      {
        official_name: 'Savings',
        balances: { available: 5000 },
      },
    ];

    beforeEach(() => {
      mockUserRepository.getById.mockResolvedValue({
        plaidAccessToken: mockAccessToken,
      });
    });

    it('should return account balances successfully', async () => {
      mockPlaidClient.accountsBalanceGet.mockResolvedValue({
        data: { accounts: mockAccounts },
      });

      const balances = await plaidService.getBalance(mockUserId);

      expect(balances).toEqual({
        Checking: 1000,
        Savings: 5000,
      });
      expect(mockPlaidClient.accountsBalanceGet).toHaveBeenCalledWith({
        access_token: mockAccessToken,
      });
    });

    it('should handle errors when fetching balance', async () => {
      mockPlaidClient.accountsBalanceGet.mockRejectedValue(
        new Error('Plaid API error'),
      );

      await expect(plaidService.getBalance(mockUserId)).rejects.toThrow();
    });
  });

  describe('processPayment', () => {
    const mockUserId = 'user-123';
    const mockAmount = 100;
    const mockAccessToken = 'access-token-123';
    const mockAccountId = 'account-123';
    const mockTransferId = 'transfer-123';

    beforeEach(() => {
      mockUserRepository.getById.mockResolvedValue({
        plaidAccessToken: mockAccessToken,
      });
      mockPlaidClient.accountsGet.mockResolvedValue({
        data: { accounts: [{ account_id: mockAccountId }] },
      });
    });

    it('should process payment successfully', async () => {
      mockPlaidClient.transferCreate.mockResolvedValue({
        data: { transfer: { id: mockTransferId } },
      });

      const transferId = await plaidService.processPayment(
        mockUserId,
        mockAmount,
      );

      expect(transferId).toBe(mockTransferId);
      expect(mockPlaidClient.transferCreate).toHaveBeenCalledWith({
        access_token: mockAccessToken,
        account_id: mockAccountId,
        amount: mockAmount.toFixed(2),
        description: 'Buy BTC',
      });
    });

    it('should handle missing bank account', async () => {
      mockUserRepository.getById.mockResolvedValue({
        plaidAccessToken: null,
      });

      await expect(
        plaidService.processPayment(mockUserId, mockAmount),
      ).rejects.toThrow('Failed to process payment');
    });
  });

  describe('exchangePublicToken', () => {
    const mockUserId = 'user-123';
    const mockPublicToken = 'public-token-123';
    const mockAccessToken = 'access-token-123';
    const mockItemId = 'item-123';

    it('should exchange public token successfully', async () => {
      mockPlaidClient.itemPublicTokenExchange.mockResolvedValue({
        data: {
          access_token: mockAccessToken,
          item_id: mockItemId,
        },
      });

      const result = await plaidService.exchangePublicToken({
        public_token: mockPublicToken,
        userId: mockUserId,
      });

      expect(result).toEqual({ public_token_exchange: 'completed' });
      expect(mockUserRepository.updateById).toHaveBeenCalledWith({
        id: mockUserId,
        plaidAccessToken: mockAccessToken,
        plaidItemId: mockItemId,
      });
    });

    it('should handle token exchange errors', async () => {
      mockPlaidClient.itemPublicTokenExchange.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        plaidService.exchangePublicToken({
          public_token: mockPublicToken,
          userId: mockUserId,
        }),
      ).rejects.toThrow();
    });
  });

  describe('createPlaidToken', () => {
    const mockUserId = 'user-123';
    const mockLinkToken = 'link-token-123';

    it('should create link token successfully', async () => {
      mockPlaidClient.linkTokenCreate.mockResolvedValue({
        data: { link_token: mockLinkToken },
      });

      const result = await plaidService.createPlaidToken({
        userId: mockUserId,
      });

      expect(result).toEqual({ link_token: mockLinkToken });
      expect(mockPlaidClient.linkTokenCreate).toHaveBeenCalledWith({
        user: { client_user_id: mockUserId },
        client_name: 'Btc wallet',
        products: ['auth', 'transfer'],
        language: 'en',
        country_codes: ['US'],
      });
    });
  });
});
