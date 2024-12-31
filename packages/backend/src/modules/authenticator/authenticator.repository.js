import { db } from '../../config/database';
import { eq } from 'drizzle-orm';
import { authenticators } from '../../schema/authenticator.schema';

export class AuthenticatorRepository {
  async findByUserId(userId) {
    return db
      .select()
      .from(authenticators)
      .where(eq(authenticators.userId, userId));
  }

  async create(authenticatorData) {
    return db.insert(authenticators).values(authenticatorData);
  }

  async findByCredentialId(credentialId) {
    const [authenticator] = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.credentialId, credentialId))
      .limit(1);

    return authenticator;
  }

  async updateCounter(credentialId, newCounter) {
    return db
      .update(authenticators)
      .set({
        counter: newCounter.toString(),
        lastUsedAt: new Date(),
      })
      .where(eq(authenticators.credentialId, credentialId));
  }
}
