import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { logger } from '../../utils/logger';

const rpName = process.env.RP_NAME || 'Bitcoin Wallet';
const rpID =
  process.env.NODE_ENV === 'production' ? process.env.RPID : 'localhost';

const origin =
  process.env.NODE_ENV === 'production'
    ? process.env.ORIGIN
    : 'http://localhost:5173';

class PasskeyService {
  constructor(authenticatorRepository, userRepository, jwtService) {
    this.authenticatorRepository = authenticatorRepository;
    this.userRepository = userRepository;
    this.jwtService = jwtService;
  }

  async generateRegistrationOptions(userId, username) {
    const [userAuthenticators] =
      await this.authenticatorRepository.findByUserId(userId);

    const userIdBuffer = Buffer.from(userId.replace(/-/g, ''), 'hex');
    const userIdArray = new Uint8Array(userIdBuffer);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userIdArray,
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: userAuthenticators?.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialId, 'base64url'),
        type: 'public-key',
        transports: authenticator.transports || undefined,
      })),
    });

    return options;
  }

  async verifyRegistration(userId, credential, challenge) {
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      await this.authenticatorRepository.create({
        userId,
        credentialId: verification.registrationInfo.credential.id,
        credentialPublicKey: Buffer.from(
          verification.registrationInfo.credential.publicKey,
        ).toString('hex'),
        counter: verification.registrationInfo.credential.counter,
        credentialDeviceType:
          verification.registrationInfo.credentialDeviceType,
        credentialBackedUp: verification.registrationInfo.credential.backedUp
          ? 'eligible'
          : 'ineligible',
        transports: verification.registrationInfo.credential.transports,
      });
    }

    return verification;
  }

  async generateAuthenticationOptions() {
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: [],
      userVerification: 'required',
    });

    return options;
  }

  async verifyAuthentication(credential, challenge) {
    try {
      const storedAuthenticator =
        await this.authenticatorRepository.findByCredentialId(credential.id);

      if (!storedAuthenticator) {
        throw new Error('Authenticator not found');
      }

      const authenticatorData = {
        credentialID: Buffer.from(
          storedAuthenticator.credentialId,
          'base64url',
        ),
        credentialPublicKey: Buffer.from(
          storedAuthenticator.credentialPublicKey,
          'hex',
        ),
        counter: Number(storedAuthenticator.counter || 0),
        transports: storedAuthenticator.transports || undefined,
      };

      const verification = await verifyAuthenticationResponse({
        response: {
          ...credential,
          ...credential.response,
          counter: 0,
        },
        credential: {
          ...storedAuthenticator,
          publicKey: Buffer.from(
            storedAuthenticator.credentialPublicKey,
            'hex',
          ),
          counter: Number(storedAuthenticator.counter),
        },
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: authenticatorData,
        requireUserVerification: true,
      });

      const { verified, authenticationInfo } = verification;

      if (!verified) {
        return { verified: false };
      }

      const user = await this.userRepository.getById(
        storedAuthenticator.userId,
      );

      if (!user) {
        throw new Error('User not found');
      }

      await this.authenticatorRepository.updateCounter(
        credential.id,
        authenticationInfo.newCounter.toString(),
      );

      return {
        verified: true,
        token: this.jwtService.sign({ id: user.id }),
        user,
      };
    } catch (error) {
      logger.error('Authentication verification failed:', error);
      throw new Error('Authentication failed');
    }
  }
}

export { PasskeyService };
