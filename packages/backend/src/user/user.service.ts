import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { userTable } from 'src/drizzle/schemas';
import { Database } from 'src/drizzle/types';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as bitcoin from 'bitcoin-address-generator';
import { CreatePlaidTokenDto } from 'src/user/dto/create-plaid-token.dto';
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid';

@Injectable()
export class UserService {
  plaidClient: PlaidApi;
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database,
  ) {
    this.plaidClient = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments['sandbox'],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': '6769e47b491dca001bd2e3ca',
            'PLAID-SECRET': 'b81560ada267af4596b26459a4aed9',
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
    }) as Promise<{ key: string; address: string }>;
  }
  async signup(data: { name: string; email: string; password: string }) {
    const now = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const addresses = await this.generateBitcoinAddress();

    const user = await this.db
      .insert(userTable)
      .values({
        ...data,
        password: hashedPassword,
        btcReceiveAddress: addresses.address,
        btcKey: addresses.key,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user[0];
    return userWithoutPassword;
  }

  async login(data: { email: string; password: string }) {
    const user = await this.db.query.userTable.findFirst({
      where: eq(userTable.email, data.email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createPlaidToken(data: CreatePlaidTokenDto) {
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
      console.log(response);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }
  async exchangePublicToken(data: any) {
    const publicToken = data.public_token;
    const userId = data.userId; // Make sure to pass userId from the frontend

    try {
      const response = await this.plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemID = response.data.item_id;

      await this.db
        .update(userTable)
        .set({
          // @ts-expect-error it has an error
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
