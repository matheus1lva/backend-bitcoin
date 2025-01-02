import { UserService } from '../user.service.js';
import bcrypt from 'bcrypt';
import * as bitcoin from 'bitcoinjs-lib';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('bitcoinjs-lib');
jest.mock('plaid');
jest.mock('tiny-secp256k1', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('ecpair', () => ({
  ECPairFactory: jest.fn(() => ({
    makeRandom: jest.fn(() => ({
      publicKey: Buffer.from('mock-public-key'),
      toWIF: () => 'mock-private-key',
    })),
  })),
}));

describe('UserService', () => {
  let userService;
  let mockUserRepository;
  let mockJwtService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock repositories and services
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    // Mock bcrypt functions
    bcrypt.hash.mockResolvedValue('hashed_password');
    bcrypt.compare.mockResolvedValue(true);

    // Mock bitcoin address generation
    bitcoin.networks = {
      regtest: {},
    };
    bitcoin.payments.p2wpkh.mockReturnValue({
      address: 'mock_btc_address',
    });

    userService = new UserService(mockUserRepository, mockJwtService);
  });

  describe('generateBitcoinAddress', () => {
    it('should generate a bitcoin address and private key', async () => {
      const result = await userService.generateBitcoinAddress();

      expect(result).toEqual({
        address: 'mock_btc_address',
        privateKey: 'mock-private-key',
      });
      expect(bitcoin.payments.p2wpkh).toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    const mockSignupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockCreatedUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      btcReceiveAddress: 'mock_btc_address',
    };

    beforeEach(() => {
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);
      mockJwtService.sign.mockReturnValue('mock_token');
    });

    it('should create a new user successfully', async () => {
      const result = await userService.signup(mockSignupData);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockSignupData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockSignupData.name,
          email: mockSignupData.email,
          password: 'hashed_password',
          btcReceiveAddress: 'mock_btc_address',
        }),
      );
      expect(result).toEqual({
        user: expect.objectContaining({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        }),
        token: 'mock_token',
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user creation fails', async () => {
      mockUserRepository.create.mockResolvedValue(null);

      await expect(userService.signup(mockSignupData)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('login', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: mockEmail,
      password: 'hashed_password',
    };

    beforeEach(() => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_token');
    });

    it('should login user successfully', async () => {
      const result = await userService.login(mockEmail, mockPassword);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockUser.password,
      );
      expect(result).toEqual({
        user: expect.objectContaining({
          id: 'user-123',
          name: 'Test User',
          email: mockEmail,
        }),
        token: 'mock_token',
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.login(mockEmail, mockPassword)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw error if password is invalid', async () => {
      bcrypt.compare.mockResolvedValue(false);

      await expect(userService.login(mockEmail, mockPassword)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
