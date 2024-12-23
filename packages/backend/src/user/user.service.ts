import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { userTable } from 'src/drizzle/schemas';
import { Database } from 'src/drizzle/types';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as bitcoin from 'bitcoin-address-generator';

@Injectable()
export class UserService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database,
  ) {}

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
}
