import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  password: text('password'),
  btcReceiveAddress: text('btcReceiveAddress').notNull(),
  btcKey: text('btcKey').notNull(),
  plaidAccessToken: text('plaidAccessToken'),
  plaidItemId: text('plaidItemId'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});
