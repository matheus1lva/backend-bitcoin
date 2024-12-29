import { eq } from 'drizzle-orm';
import { db } from '../../config/database';
import { userTable } from '../../schema';

export class UsersRepository {
  async getById(userId) {
    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);
    return result[0];
  }
}
