import { eq } from 'drizzle-orm';
import { db } from '../../config/database';
import { userTable } from '../../schema';

export class UsersRepository {
  async getById(userId) {
    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId));
    return result[0];
  }

  async updateById(data) {
    const result = await db
      .update(userTable)
      .set(data)
      .where(eq(userTable.id, data.id))
      .returning();

    return result[0];
  }

  async create(data) {
    const result = await db.insert(userTable).values(data).returning();
    return result[0];
  }

  async findByEmail(email) {
    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    return result[0];
  }
}
