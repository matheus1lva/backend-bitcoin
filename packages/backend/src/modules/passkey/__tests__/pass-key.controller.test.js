import { PasskeyController } from '../pass-key.controller.js';

// Mock logger
jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('PasskeyController', () => {
  let passkeyController;
  let mockPasskeyService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock passkey service
    mockPasskeyService = {
      generateRegistrationOptions: jest.fn(),
      verifyRegistration: jest.fn(),
      generateAuthenticationOptions: jest.fn(),
      verifyAuthentication: jest.fn(),
    };

    // Create controller instance with mock service
    passkeyController = new PasskeyController(mockPasskeyService);

    // Setup request and response mocks
    mockReq = {
      body: {},
      session: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('generateRegistrationOptions', () => {
    const mockUserId = 'user-123';
    const mockUsername = 'testuser';
    const mockOptions = {
      challenge: 'challenge-123',
      rp: { name: 'Bitcoin Wallet', id: 'localhost' },
    };

    beforeEach(() => {
      mockReq.body = { userId: mockUserId, username: mockUsername };
      mockPasskeyService.generateRegistrationOptions.mockResolvedValue(
        mockOptions,
      );
    });

    it('should generate registration options successfully', async () => {
      await passkeyController.generateRegistrationOptions(mockReq, mockRes);

      expect(
        mockPasskeyService.generateRegistrationOptions,
      ).toHaveBeenCalledWith(mockUserId, mockUsername);
      expect(mockReq.session.challenge).toBe(mockOptions.challenge);
      expect(mockRes.json).toHaveBeenCalledWith(mockOptions);
    });

    it('should handle errors appropriately', async () => {
      mockPasskeyService.generateRegistrationOptions.mockRejectedValue(
        new Error('Service error'),
      );

      await passkeyController.generateRegistrationOptions(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to generate registration options',
      });
    });
  });

  describe('verifyRegistration', () => {
    const mockUserId = 'user-123';
    const mockCredential = { id: 'cred-123' };
    const mockChallenge = 'challenge-123';

    beforeEach(() => {
      mockReq.body = { userId: mockUserId, credential: mockCredential };
      mockReq.session.challenge = mockChallenge;
    });

    it('should verify registration successfully', async () => {
      mockPasskeyService.verifyRegistration.mockResolvedValue({
        verified: true,
      });

      await passkeyController.verifyRegistration(mockReq, mockRes);

      expect(mockPasskeyService.verifyRegistration).toHaveBeenCalledWith(
        mockUserId,
        mockCredential,
        mockChallenge,
      );
      expect(mockReq.session.challenge).toBeUndefined();
      expect(mockRes.json).toHaveBeenCalledWith({ verified: true });
    });

    it('should handle missing challenge', async () => {
      delete mockReq.session.challenge;

      await passkeyController.verifyRegistration(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No challenge found in session',
      });
    });

    it('should handle verification errors', async () => {
      mockPasskeyService.verifyRegistration.mockRejectedValue(
        new Error('Verification failed'),
      );

      await passkeyController.verifyRegistration(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to verify registration',
      });
    });
  });

  describe('verifyAuthentication', () => {
    const mockCredential = { id: 'cred-123' };
    const mockChallenge = 'challenge-123';
    const mockUser = { id: 'user-123' };
    const mockToken = 'jwt-token-123';

    beforeEach(() => {
      mockReq.body = { credential: mockCredential };
      mockReq.session.challenge = mockChallenge;
    });

    it('should verify authentication successfully', async () => {
      mockPasskeyService.verifyAuthentication.mockResolvedValue({
        verified: true,
        user: mockUser,
        token: mockToken,
      });

      await passkeyController.verifyAuthentication(mockReq, mockRes);

      expect(mockPasskeyService.verifyAuthentication).toHaveBeenCalledWith(
        mockCredential,
        mockChallenge,
      );
      expect(mockReq.session.challenge).toBeUndefined();
      expect(mockReq.session.userId).toBe(mockUser.id);
      expect(mockRes.json).toHaveBeenCalledWith({
        verified: true,
        token: mockToken,
        user: mockUser,
      });
    });

    it('should handle missing challenge', async () => {
      delete mockReq.session.challenge;

      await passkeyController.verifyAuthentication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to verify authentication',
      });
    });

    it('should handle failed verification', async () => {
      mockPasskeyService.verifyAuthentication.mockResolvedValue({
        verified: false,
      });

      await passkeyController.verifyAuthentication(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ verified: false });
    });

    it('should handle authentication errors', async () => {
      mockPasskeyService.verifyAuthentication.mockRejectedValue(
        new Error('Authentication failed'),
      );

      await passkeyController.verifyAuthentication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to verify authentication',
      });
    });
  });
});
