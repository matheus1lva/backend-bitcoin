import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { pool } from '../src/config/database.js';

let container;

beforeAll(async () => {
  container = await new PostgreSqlContainer()
    .withUsername('testuser')
    .withPassword('12345')
    .withDatabase('testdb')
    .start();

  process.env.DATABASE_URL = `postgresql://testuser:12345@${container.getHost()}:${container.getPort()}/testdb`;
});

afterAll(async () => {
  await pool.end();
  await container.stop();
});

export { container };
