import { BitcoinService } from '../bitcoin.service.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('BitcoinService', () => {
  let bitcoinService;
  let mockUserRepository;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock user repository
    mockUserRepository = {
      getById: jest.fn(),
    };

    bitcoinService = new BitcoinService(mockUserRepository);
  });

  describe('getCurrentPrice', () => {
    it('should return fixed price in dev environment', async () => {
      process.env.NODE_ENV = 'development';
      const price = await bitcoinService.getCurrentPrice();
      expect(price).toBe(30000);
    });
  });

  describe('getBalance', () => {
    const mockUserId = '123';
    const mockAddress = 'bc1qxyz';
    const mockBalance = 1.5;

    beforeEach(() => {
      mockUserRepository.getById.mockResolvedValue({
        btcReceiveAddress: mockAddress,
      });
    });

    it('should return the correct balance for a user', async () => {
      axios.post.mockResolvedValueOnce({
        data: { result: mockBalance },
      });

      const balance = await bitcoinService.getBalance(mockUserId);

      expect(balance).toBe(mockBalance);
      expect(mockUserRepository.getById).toHaveBeenCalledWith(mockUserId);
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'getreceivedbyaddress',
          params: [mockAddress],
        }),
        expect.any(Object),
      );
    });

    it('should handle errors when fetching balance', async () => {
      axios.post.mockRejectedValueOnce(new Error('RPC Error'));

      await expect(bitcoinService.getBalance(mockUserId)).rejects.toThrow(
        'Failed to get Bitcoin balance',
      );
    });
  });

  describe('getEstimatedFee', () => {
    it('should return estimated fee based on network info', async () => {
      const mockNetworkInfo = {
        data: { result: { relayfee: 0.00021 } },
      };
      const mockSmartFee = {
        data: { result: { feerate: 0.0003 } },
      };

      axios.post
        .mockResolvedValueOnce(mockNetworkInfo)
        .mockResolvedValueOnce(mockSmartFee);

      const fee = await bitcoinService.getEstimatedFee();
      expect(fee).toBeGreaterThan(0);
      expect(axios.post).toHaveBeenCalledTimes(2);
    });

    it('should return minimum relay fee on error', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      const fee = await bitcoinService.getEstimatedFee();
      expect(fee).toBe(0.00021);
    });
  });
});
