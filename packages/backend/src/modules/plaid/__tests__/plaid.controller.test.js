import { PlaidController } from '../plaid.controller.js';

// Mock the logger
jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('PlaidController', () => {
  let plaidController;
  let mockPlaidService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock Plaid service
    mockPlaidService = {
      getBalance: jest.fn(),
      processPayment: jest.fn(),
      getTransferStatus: jest.fn(),
    };

    // Create controller instance with mock service
    plaidController = new PlaidController(mockPlaidService);

    // Setup request and response mocks
    mockReq = {
      userId: 'test-user-id',
      body: {},
      params: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getBalance', () => {
    it('should return balance successfully', async () => {
      const mockBalance = {
        Checking: 1000,
        Savings: 5000,
      };
      mockPlaidService.getBalance.mockResolvedValue(mockBalance);

      await plaidController.getBalance(mockReq, mockRes);

      expect(mockPlaidService.getBalance).toHaveBeenCalledWith(mockReq.userId);
      expect(mockRes.json).toHaveBeenCalledWith(mockBalance);
    });

    it('should handle errors appropriately', async () => {
      const error = new Error('Failed to get balance');
      mockPlaidService.getBalance.mockRejectedValue(error);

      await plaidController.getBalance(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: error.message,
      });
    });
  });

  describe('createPayment', () => {
    const mockAmount = 100;
    const mockPaymentId = 'payment-123';

    beforeEach(() => {
      mockReq.body = { amount: mockAmount };
    });

    it('should create payment successfully', async () => {
      mockPlaidService.processPayment.mockResolvedValue(mockPaymentId);

      await plaidController.createPayment(mockReq, mockRes);

      expect(mockPlaidService.processPayment).toHaveBeenCalledWith(
        mockReq.userId,
        mockAmount,
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockPaymentId);
    });

    it('should handle payment creation errors', async () => {
      const error = new Error('Payment failed');
      mockPlaidService.processPayment.mockRejectedValue(error);

      await plaidController.createPayment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: error.message,
      });
    });
  });

  describe('getPaymentStatus', () => {
    const mockPaymentId = 'payment-123';
    const mockStatus = 'completed';

    beforeEach(() => {
      mockReq.params = { paymentId: mockPaymentId };
    });

    it('should return payment status successfully', async () => {
      mockPlaidService.getTransferStatus.mockResolvedValue(mockStatus);

      await plaidController.getPaymentStatus(mockReq, mockRes);

      expect(mockPlaidService.getTransferStatus).toHaveBeenCalledWith(
        mockPaymentId,
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockStatus);
    });

    it('should handle status check errors', async () => {
      const error = new Error('Status check failed');
      mockPlaidService.getTransferStatus.mockRejectedValue(error);

      await plaidController.getPaymentStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: error.message,
      });
    });
  });
});
