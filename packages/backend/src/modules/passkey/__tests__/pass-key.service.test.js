import { PasskeyService } from '../pass-key.service.js';
import {
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

// Mock SimpleWebAuthn
jest.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: jest.fn(),
  generateRegistrationOptions: jest.fn(),
  verifyAuthenticationResponse: jest.fn(),
  verifyRegistrationResponse: jest.fn(),
}));

// Mock logger
jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('PasskeyService', () => {
  let passkeyService;
  let mockAuthenticatorRepository;
  let mockUserRepository;
  let mockJwtService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock repositories and services
    mockAuthenticatorRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      findByCredentialId: jest.fn(),
      updateCounter: jest.fn(),
    };

    mockUserRepository = {
      getById: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    passkeyService = new PasskeyService(
      mockAuthenticatorRepository,
      mockUserRepository,
      mockJwtService,
    );
  });

  describe('generateRegistrationOptions', () => {
    const mockUserId = 'user-123';
    const mockUsername = 'testuser';
    const mockOptions = {
      challenge: 'challenge-123',
      rp: { name: 'Bitcoin Wallet', id: 'localhost' },
    };

    beforeEach(() => {
      mockAuthenticatorRepository.findByUserId.mockResolvedValue([[]]);
      generateRegistrationOptions.mockResolvedValue(mockOptions);
    });

    it('should generate registration options successfully', async () => {
      const options = await passkeyService.generateRegistrationOptions(
        mockUserId,
        mockUsername,
      );

      expect(options).toEqual(mockOptions);
      expect(generateRegistrationOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          rpName: 'Bitcoin Wallet',
          rpID: 'localhost',
          userName: mockUsername,
        }),
      );
    });

    it('should handle existing authenticators', async () => {
      const mockAuthenticators = [
        {
          credentialId: 'cred-123',
          transports: ['internal'],
        },
      ];
      mockAuthenticatorRepository.findByUserId.mockResolvedValue([
        mockAuthenticators,
      ]);

      await passkeyService.generateRegistrationOptions(
        mockUserId,
        mockUsername,
      );

      expect(generateRegistrationOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          excludeCredentials: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Buffer),
              type: 'public-key',
              transports: ['internal'],
            }),
          ]),
        }),
      );
    });
  });

  describe('verifyRegistration', () => {
    const mockUserId = 'user-123';
    const mockCredential = {
      id: 'cred-123',
      response: {},
    };
    const mockChallenge = 'challenge-123';

    it('should verify registration successfully', async () => {
      const mockVerification = {
        verified: true,
        registrationInfo: {
          credential: {
            id: 'cred-123',
            publicKey: Buffer.from('public-key'),
            counter: 0,
            backedUp: true,
            transports: ['internal'],
          },
          credentialDeviceType: 'platform',
        },
      };

      verifyRegistrationResponse.mockResolvedValue(mockVerification);

      const result = await passkeyService.verifyRegistration(
        mockUserId,
        mockCredential,
        mockChallenge,
      );

      expect(result).toEqual(mockVerification);
      expect(mockAuthenticatorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          credentialId: 'cred-123',
          credentialPublicKey: expect.any(String),
          counter: 0,
        }),
      );
    });

    it('should handle verification failure', async () => {
      const mockVerification = { verified: false };
      verifyRegistrationResponse.mockResolvedValue(mockVerification);

      const result = await passkeyService.verifyRegistration(
        mockUserId,
        mockCredential,
        mockChallenge,
      );

      expect(result.verified).toBe(false);
      expect(mockAuthenticatorRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyAuthentication', () => {
    const mockCredential = {
      id: 'cred-123',
      response: {},
    };
    const mockChallenge = 'challenge-123';
    const mockStoredAuthenticator = {
      credentialId: 'cred-123',
      credentialPublicKey: Buffer.from('public-key').toString('hex'),
      counter: '0',
      userId: 'user-123',
      transports: ['internal'],
    };
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
    };

    beforeEach(() => {
      mockAuthenticatorRepository.findByCredentialId.mockResolvedValue(
        mockStoredAuthenticator,
      );
      mockUserRepository.getById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');
    });

    it('should verify authentication successfully', async () => {
      const mockVerification = {
        verified: true,
        authenticationInfo: {
          newCounter: 1,
        },
      };
      verifyAuthenticationResponse.mockResolvedValue(mockVerification);

      const result = await passkeyService.verifyAuthentication(
        mockCredential,
        mockChallenge,
      );

      expect(result).toEqual({
        verified: true,
        token: 'mock-token',
        user: mockUser,
      });
      expect(mockAuthenticatorRepository.updateCounter).toHaveBeenCalledWith(
        'cred-123',
        '1',
      );
    });

    it('should handle authenticator not found', async () => {
      mockAuthenticatorRepository.findByCredentialId.mockResolvedValue(null);

      await expect(
        passkeyService.verifyAuthentication(mockCredential, mockChallenge),
      ).rejects.toThrow('Authentication failed');
    });

    it('should handle verification failure', async () => {
      verifyAuthenticationResponse.mockResolvedValue({ verified: false });

      const result = await passkeyService.verifyAuthentication(
        mockCredential,
        mockChallenge,
      );

      expect(result.verified).toBe(false);
      expect(mockAuthenticatorRepository.updateCounter).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      verifyAuthenticationResponse.mockResolvedValue({
        verified: true,
        authenticationInfo: { newCounter: 1 },
      });
      mockUserRepository.getById.mockResolvedValue(null);

      await expect(
        passkeyService.verifyAuthentication(mockCredential, mockChallenge),
      ).rejects.toThrow('Authentication failed');
    });
  });
});
