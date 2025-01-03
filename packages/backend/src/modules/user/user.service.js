import bcrypt from 'bcrypt';
import * as bitcoin from 'bitcoinjs-lib';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';
const ECPair = ECPairFactory(ecc);
export class UserService {
  constructor(userRepository, jwtService) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
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
    const network = bitcoin.networks.regtest;
    const keyPair = ECPair.makeRandom({
      network: network,
    });
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network,
    });

    return {
      address,
      privateKey: keyPair.toWIF(),
    };
  }

  async signup(data) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const addresses = await this.generateBitcoinAddress();

    const insertData = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      btcReceiveAddress: addresses.address,
      btcKey: addresses.privateKey,
    };

    const user = await this.userRepository.create(insertData);

    if (!user) {
      throw new Error('User already exists');
    }

    const { password, ...userWithoutPassword } = user;
    return {
      user: { ...userWithoutPassword },
    };
  }

  async login(email, inputPassword) {
    if (!email || !inputPassword) {
      throw new Error('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(inputPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;

    const token = this.jwtService.sign({
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      hasLinkedBankAccount: userWithoutPassword.plaidItemId !== null,
    });

    return {
      user: userWithoutPassword,
      token,
      expiresIn: '24h',
    };
  }
}
