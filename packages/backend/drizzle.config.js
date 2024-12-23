import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/drizzle/schemas/',
  out: './src/drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
});
