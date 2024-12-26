import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user.schema';

export const authenticators = pgTable('authenticators', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => userTable.id)
    .notNull(),
  credentialId: text('credential_id').notNull().unique(),
  credentialPublicKey: text('credential_public_key').notNull(),
  counter: text('counter').notNull(),
  credentialDeviceType: text('credential_device_type').notNull(),
  credentialBackedUp: text('credential_backed_up').notNull(),
  transports: text('transports').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
});
