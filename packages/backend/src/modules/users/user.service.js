import bcrypt from 'bcrypt';
import * as bitcoin from 'bitcoinjs-lib';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import jwt from 'jsonwebtoken';
const ecc = require('tiny-secp256k1');
const { ECPairFactory } = require('ecpair');
const ECPair = ECPairFactory(ecc);
export class UserService {
  constructor(userRepository) {
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

    console.log({
      address,
      privateKey: keyPair.toWIF(),
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
    return userWithoutPassword;
  }

  async login(email, inputPassword) {
    const user = await this.userRepository.findByEmail(email);

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
}
