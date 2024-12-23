import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  password: text().notNull(),
  btcReceiveAddress: text().notNull(),
  btcKey: text().notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});
