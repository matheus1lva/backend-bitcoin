const { pgTable, text, timestamp, uuid } = require("drizzle-orm/pg-core");
const { users } = require("../user/schema");

const authenticators = pgTable("authenticators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  credentialId: text("credential_id").notNull().unique(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: text("counter").notNull(),
  credentialDeviceType: text("credential_device_type").notNull(),
  credentialBackedUp: text("credential_backed_up").notNull(),
  transports: text("transports").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
});

module.exports = { authenticators };
