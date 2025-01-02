import { BitcoinController } from '../bitcoin.controller.js';
import { BitcoinService } from '../bitcoin.service.js';
import { PlaidService } from '../../plaid/plaid.service.js';

// Mock the dependencies
jest.mock('../bitcoin.service.js');
jest.mock('../../plaid/plaid.service.js');
jest.mock('../../user/user.repository.js');
jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('BitcoinController', () => {
  let bitcoinController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh instance of controller
    bitcoinController = new BitcoinController();

    // Setup request and response mocks
    mockReq = {
      userId: 'test-user-id',
      body: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getBalance', () => {
    it('should return balance successfully', async () => {
      const mockBalance = 1.5;
      BitcoinService.prototype.getBalance.mockResolvedValueOnce(mockBalance);

      await bitcoinController.getBalance(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ balance: mockBalance });
      expect(BitcoinService.prototype.getBalance).toHaveBeenCalledWith(
        mockReq.userId,
      );
    });

    it('should handle errors appropriately', async () => {
      BitcoinService.prototype.getBalance.mockRejectedValueOnce(
        new Error('Test error'),
      );

      await bitcoinController.getBalance(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error getting Bitcoin balance',
      });
    });
  });

  describe('purchaseBitcoin', () => {
    const mockAmount = 100;
    const mockBtcPrice = 30000;
    const mockBtcAmount = mockAmount / mockBtcPrice;
    const mockTransferId = 'transfer-123';
    const mockTxId = 'tx-123';

    beforeEach(() => {
      mockReq.body = { amount: mockAmount };
      BitcoinService.prototype.getCurrentPrice.mockResolvedValue(mockBtcPrice);
      PlaidService.prototype.processPayment.mockResolvedValue(mockTransferId);
      BitcoinService.prototype.sendBitcoin.mockResolvedValue(mockTxId);
    });

    it('should process Bitcoin purchase successfully', async () => {
      await bitcoinController.purchaseBitcoin(mockReq, mockRes);

      expect(PlaidService.prototype.processPayment).toHaveBeenCalledWith(
        mockReq.userId,
        mockAmount,
      );
      expect(BitcoinService.prototype.sendBitcoin).toHaveBeenCalledWith(
        mockReq.userId,
        mockBtcAmount,
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        txid: mockTxId,
        transferId: mockTransferId,
        amountUsd: mockAmount,
        amountBtc: mockBtcAmount,
        price: mockBtcPrice,
      });
    });

    it('should handle payment processing errors', async () => {
      const error = new Error('Payment failed');
      PlaidService.prototype.processPayment.mockRejectedValueOnce(error);

      await bitcoinController.purchaseBitcoin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Payment failed',
      });
    });
  });

  describe('getCurrentPrice', () => {
    it('should return current price successfully', async () => {
      const mockPrice = 30000;
      BitcoinService.prototype.getCurrentPrice.mockResolvedValueOnce(mockPrice);

      await bitcoinController.getCurrentPrice(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ price: mockPrice });
    });

    it('should handle price fetch errors', async () => {
      BitcoinService.prototype.getCurrentPrice.mockRejectedValueOnce(
        new Error('API Error'),
      );

      await bitcoinController.getCurrentPrice(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error getting Bitcoin price',
      });
    });
  });
});
