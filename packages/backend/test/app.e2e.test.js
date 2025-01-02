import request from 'supertest';
import { app } from '../src/app.js';
import './setup';
import { PlaidService } from '../src/modules/plaid/plaid.service.js';
import { BitcoinService } from '../src/modules/bitcoin/bitcoin.service.js';

jest.mock('../src/modules/plaid/plaid.service.js');
jest.mock('../src/modules/bitcoin/bitcoin.service.js');

describe('API End-to-End Tests', () => {
  let api;
  let server;

  beforeAll(async () => {
    server = app.listen(3001);
    api = request(server);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  describe('test', () => {
    it('should call the health route', async () => {
      const response = await api.get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await api.post('/v1/users/signup').send({
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: 'test@example.com',
          name: 'Test User',
        }),
      });
    });

    it('should login with correct credentials', async () => {
      const response = await api.post('/v1/users/login').send({
        email: 'test@example.com',
        password: 'Test123!@#',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('Bitcoin', () => {
    it('should get bitcoin price', async () => {
      const loginResponse = await api.post('/v1/users/login').send({
        email: 'test@example.com',
        password: 'Test123!@#',
      });
      jest
        .spyOn(BitcoinService.prototype, 'getCurrentPrice')
        .mockResolvedValue({
          price: 30000,
        });

      const authToken = loginResponse.body.token;
      const response = await api
        .get('/v1/bitcoin/price')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('price');
    });
  });

  describe('Complete User Flow - Account Creation to BTC Purchase', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      jest.spyOn(BitcoinService.prototype, 'purchase').mockResolvedValue({
        txid: 'mock-txid',
      });

      jest
        .spyOn(PlaidService.prototype, 'exchangePublicToken')
        .mockResolvedValue({
          data: {
            success: true,
          },
        });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    const testUser = {
      email: 'complete-flow@example.com',
      password: 'Test123!@#',
      name: 'Complete Flow',
    };
    let authToken;

    it('should complete the entire flow successfully', async () => {
      const registerResponse = await api
        .post('/v1/users/signup')
        .send(testUser);
      expect(registerResponse.status).toBe(201);

      const loginResponse = await api.post('/v1/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(loginResponse.status).toBe(200);
      authToken = loginResponse.body.token;

      const linkTokenResponse = await api
        .post('/v1/users/create-plaid-token')
        .set('Authorization', `Bearer ${authToken}`);
      expect(linkTokenResponse.status).toBe(200);

      const exchangeTokenResponse = await api
        .post('/v1/users/exchange-public-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          public_token: 'mock-public-token',
          account_id: 'mock-account-id',
        });
      expect(exchangeTokenResponse.status).toBe(200);
      expect(exchangeTokenResponse.body.data).toHaveProperty('success', true);

      jest
        .spyOn(BitcoinService.prototype, 'getCurrentPrice')
        .mockResolvedValue({
          price: 30000,
        });

      const priceResponse = await api
        .get('/v1/bitcoin/price')
        .set('Authorization', `Bearer ${authToken}`);
      expect(priceResponse.status).toBe(200);

      const purchaseResponse = await api
        .post('/v1/bitcoin/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          plaidAccountId: 'mock-account-id',
        });
      expect(purchaseResponse.status).toBe(200);
    });
  });
});
