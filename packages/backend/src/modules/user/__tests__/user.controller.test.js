import { UserController } from '../user.controller.js';
import { UserService } from '../user.service.js';
import { PlaidService } from '../../plaid/plaid.service.js';

// Mock dependencies
jest.mock('../user.service.js');
jest.mock('../../plaid/plaid.service.js');
jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('UserController', () => {
  let userController;
  let mockReq;
  let mockRes;
  let mockUserService;
  let mockPlaidService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock services
    mockUserService = {
      signup: jest.fn(),
      login: jest.fn(),
    };

    mockPlaidService = {
      createPlaidToken: jest.fn(),
      exchangePublicToken: jest.fn(),
    };

    // Mock service constructors
    UserService.mockImplementation(() => mockUserService);
    PlaidService.mockImplementation(() => mockPlaidService);

    // Create controller instance
    userController = new UserController();

    // Setup request and response mocks
    mockReq = {
      body: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('signup', () => {
    const mockSignupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockSignupResponse = {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
      token: 'mock_token',
    };

    beforeEach(() => {
      mockReq.body = mockSignupData;
      mockUserService.signup.mockResolvedValue(mockSignupResponse);
    });

    it('should create a new user successfully', async () => {
      await userController.signup(mockReq, mockRes);

      expect(mockUserService.signup).toHaveBeenCalledWith(mockSignupData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockSignupResponse);
    });

    it('should handle user already exists error', async () => {
      const error = new Error('User already exists');
      mockUserService.signup.mockRejectedValue(error);

      await userController.signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });

    it('should handle general errors', async () => {
      const error = new Error('Database error');
      mockUserService.signup.mockRejectedValue(error);

      await userController.signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error creating user',
      });
    });
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
      token: 'mock_token',
    };

    beforeEach(() => {
      mockReq.body = mockLoginData;
      mockUserService.login.mockResolvedValue(mockLoginResponse);
    });

    it('should login user successfully', async () => {
      await userController.login(mockReq, mockRes);

      expect(mockUserService.login).toHaveBeenCalledWith(
        mockLoginData.email,
        mockLoginData.password,
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockLoginResponse);
    });

    it('should handle invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      mockUserService.login.mockRejectedValue(error);

      await userController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should handle general errors', async () => {
      const error = new Error('Database error');
      mockUserService.login.mockRejectedValue(error);

      await userController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error logging in',
      });
    });
  });

  describe('createPlaidToken', () => {
    const mockPlaidData = { userId: 'user-123' };
    const mockToken = { link_token: 'plaid-token-123' };

    beforeEach(() => {
      mockReq.body = mockPlaidData;
      mockPlaidService.createPlaidToken.mockResolvedValue(mockToken);
    });

    it('should create plaid token successfully', async () => {
      await userController.createPlaidToken(mockReq, mockRes);

      expect(mockPlaidService.createPlaidToken).toHaveBeenCalledWith(
        mockPlaidData,
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockToken);
    });

    it('should handle token creation errors', async () => {
      mockPlaidService.createPlaidToken.mockRejectedValue(
        new Error('Plaid error'),
      );

      await userController.createPlaidToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'failed to create token',
      });
    });
  });

  describe('exchangePublicToken', () => {
    const mockExchangeData = {
      public_token: 'public-token-123',
      userId: 'user-123',
    };
    const mockExchangeResponse = { public_token_exchange: 'completed' };

    beforeEach(() => {
      mockReq.body = mockExchangeData;
      mockPlaidService.exchangePublicToken.mockResolvedValue(
        mockExchangeResponse,
      );
    });

    it('should exchange public token successfully', async () => {
      await userController.exchangePublicToken(mockReq, mockRes);

      expect(mockPlaidService.exchangePublicToken).toHaveBeenCalledWith(
        mockExchangeData,
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockExchangeResponse);
    });

    it('should handle token exchange errors', async () => {
      mockPlaidService.exchangePublicToken.mockRejectedValue(
        new Error('Exchange error'),
      );

      await userController.exchangePublicToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'failed to create token',
      });
    });
  });
});
