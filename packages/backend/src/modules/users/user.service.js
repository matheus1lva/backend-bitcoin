import bcrypt from 'bcrypt';
import bitcoin from 'bitcoin-address-generator';
import { db } from '../../config/database';
import { userTable } from '../../schema';
import { eq } from 'drizzle-orm';
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid';
import jwt from 'jsonwebtoken';

export class UserService {
  constructor() {
    this.plaidClient = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments['sandbox'],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
          },
        },
      }),
    );
  }

  async generateBitcoinAddress() {
    return new Promise((resolve) => {
      bitcoin.createWalletAddress((response) => {
        resolve(response);
      });
    });
  }

  async signup(data) {
    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      throw new Error('Missing required fields');
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const addresses = await this.generateBitcoinAddress();

    if (!addresses || !addresses.address || !addresses.key) {
      throw new Error('Failed to generate Bitcoin address');
    }

    const insertData = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      btcReceiveAddress: addresses.address,
      btcKey: addresses.key,
    };

    const user = await db.insert(userTable).values(insertData).returning();

    const { password, ...userWithoutPassword } = user[0];
    return userWithoutPassword;
  }

  async login(email, inputPassword) {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    if (!user[0]) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      inputPassword,
      user[0].password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user[0];
    const token = jwt.sign(userWithoutPassword, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return { user: userWithoutPassword, token };
  }

  async createPlaidToken(data) {
    const userId = data.userId;
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Btc wallet',
      products: [Products.Auth],
      language: 'en',
      country_codes: [CountryCode.Us],
    };

    try {
      const response = await this.plaidClient.linkTokenCreate(request);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }
  async exchangePublicToken(data) {
    const publicToken = data.public_token;
    const userId = data.userId;

    try {
      const response = await this.plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemID = response.data.item_id;

      await db
        .update(userTable)
        .set({
          plaidAccessToken: accessToken,
          plaidItemId: itemID,
        })
        .where(eq(userTable.id, userId));

      return { public_token_exchange: 'completed' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
