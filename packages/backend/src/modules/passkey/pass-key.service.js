import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { db } from '../../config/database';
import { eq } from 'drizzle-orm';
import { authenticators } from '../../schema/authenticator.schema';
import { userTable } from '../../schema';

const rpName = 'Your App Name';
const rpID = process.env.RPID || 'localhost';
const origin = process.env.ORIGIN || `http://${rpID}:5173`;

class PasskeyService {
  static async generateRegistrationOptions(userId, username) {
    const userAuthenticators = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.userId, userId));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: userAuthenticators.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialId, 'base64url'),
        type: 'public-key',
        transports: authenticator.transports || undefined,
      })),
    });

    return options;
  }

  static async verifyRegistration(userId, credential, challenge) {
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialID, credentialPublicKey, counter } =
        verification.registrationInfo;

      await db.insert(authenticators).values({
        userId,
        credentialId: Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey:
          Buffer.from(credentialPublicKey).toString('base64url'),
        counter: counter.toString(),
        credentialDeviceType: credential.response.transports
          ? 'platform'
          : 'cross-platform',
        credentialBackedUp: credential.response.backupEligible
          ? 'eligible'
          : 'ineligible',
        transports: credential.response.transports || [],
      });
    }

    return verification;
  }

  static async generateAuthenticationOptions(username) {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1);
    if (!user[0]) {
      throw new Error('User not found');
    }

    const userAuthenticators = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.userId, user[0].id));

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userAuthenticators.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialId, 'base64url'),
        type: 'public-key',
        transports: authenticator.transports || undefined,
      })),
      userVerification: 'preferred',
    });

    return options;
  }

  static async verifyAuthentication(credential, challenge) {
    const credentialIdBuffer = Buffer.from(credential.id, 'base64url');
    const authenticator = await db
      .select()
      .from(authenticators)
      .where(
        eq(
          authenticators.credentialId,
          credentialIdBuffer.toString('base64url'),
        ),
      )
      .limit(1);

    if (!authenticator[0]) {
      throw new Error('Authenticator not found');
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(authenticator[0].credentialId, 'base64url'),
        credentialPublicKey: Buffer.from(
          authenticator[0].credentialPublicKey,
          'base64url',
        ),
        counter: parseInt(authenticator[0].counter),
      },
    });

    if (verification.verified) {
      await db
        .update(authenticators)
        .set({
          counter: verification.authenticationInfo.newCounter.toString(),
          lastUsedAt: new Date(),
        })
        .where(eq(authenticators.id, authenticator[0].id));
    }

    return verification;
  }
}

export { PasskeyService };
