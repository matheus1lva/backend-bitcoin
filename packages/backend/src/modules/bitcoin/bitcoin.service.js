import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';
import { isDev } from '../../utils/envs.js';
import axios from 'axios';
const ECPair = ECPairFactory(ecc);
const DUST_THRESHOLD = 546; // minimum amount in satoshis

export class BitcoinService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.network = isDev ? bitcoin.networks.regtest : bitcoin.networks.bitcoin;
    this.regtestApi = process.env.BITCOIN_RPC_URL || 'http://localhost:18443';
    this.rpcAuth = {
      username: process.env.BITCOIN_RPC_USER || 'bitcoin',
      password: process.env.BITCOIN_RPC_PASS || 'bitcoin',
    };
  }

  async getBalance(userId) {
    try {
      const user = await this.userRepository.getById(userId);
      const address = user.btcReceiveAddress;

      const response = await axios.post(
        this.regtestApi + '/wallet/legacy_wallet',
        {
          jsonrpc: '1.0',
          id: 'test',
          method: 'getreceivedbyaddress',
          params: [address],
        },
        {
          auth: this.rpcAuth,
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to get Bitcoin balance');
    }
  }

  async getLatestTransactionId(address = process.env.VAULT_ADDRESS) {
    const response = await axios.post(
      this.regtestApi,
      {
        jsonrpc: '1.0',
        id: 'test',
        method: 'scantxoutset',
        params: ['start', [`addr(${address})`]],
      },
      {
        auth: this.rpcAuth,
      },
    );

    const blockHeightResponse = await axios.post(
      this.regtestApi,
      {
        jsonrpc: '1.0',
        id: 'test',
        method: 'getblockcount',
        params: [],
      },
      {
        auth: this.rpcAuth,
      },
    );

    const currentHeight = blockHeightResponse.data.result;
    const COINBASE_MATURITY = 100;

    return response.data.result.unspents.filter((utxo) => {
      if (utxo.coinbase) {
        return currentHeight - utxo.height >= COINBASE_MATURITY;
      }
      return true;
    });
  }

  async getEstimatedFee() {
    try {
      const MIN_RELAY_FEE_SATS = 21000;
      const networkInfoResponse = await axios.post(
        this.regtestApi,
        {
          jsonrpc: '1.0',
          id: 'test',
          method: 'getnetworkinfo',
          params: [],
        },
        {
          auth: this.rpcAuth,
        },
      );

      const minRelayFee = networkInfoResponse.data.result.relayfee || 0.00021;

      const response = await axios.post(
        this.regtestApi,
        {
          jsonrpc: '1.0',
          id: 'test',
          method: 'estimatesmartfee',
          params: [6],
        },
        {
          auth: this.rpcAuth,
        },
      );

      let feeRate;
      if (response.data.error) {
        feeRate = minRelayFee;
      } else {
        feeRate = Math.max(
          response.data.result.feerate || minRelayFee,
          minRelayFee,
        );
      }

      const estimatedFee = (feeRate * 250) / 1024;

      const estimatedFeeSats = Math.round(estimatedFee * 100000000);

      if (estimatedFeeSats < MIN_RELAY_FEE_SATS) {
        return MIN_RELAY_FEE_SATS / 100000000;
      }

      return estimatedFee;
    } catch (error) {
      console.log('Fee estimation failed:', error);
      return 0.00021;
    }
  }

  async sendBitcoin(userId, amount) {
    try {
      const user = await this.userRepository.getById(userId);
      const toAddress = user.btcReceiveAddress;

      const fee = await this.getEstimatedFee();

      const amountInSatoshis = Math.round(amount * 100000000);

      const keyPair = ECPair.fromWIF(process.env.VAULT_PKEY, this.network);

      const psbt = new bitcoin.Psbt({ network: this.network });
      const utxos = await this.getLatestTransactionId(
        process.env.VAULT_ADDRESS,
      );

      let totalInput = 0;
      utxos.forEach((utxo) => {
        const valueInSatoshis = Math.round(utxo.amount * 100000000);
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: Buffer.from(utxo.scriptPubKey, 'hex'),
            value: valueInSatoshis,
          },
        });
        totalInput += valueInSatoshis;
      });

      const feeInSatoshis = Math.round(fee * 100000000);

      if (totalInput < amountInSatoshis + feeInSatoshis) {
        throw new Error(
          'Insufficient funds: total input amount is less than output amount plus fee',
        );
      }

      psbt.addOutput({
        address: toAddress,
        value: amountInSatoshis,
      });

      const change = totalInput - amountInSatoshis - feeInSatoshis;

      if (change > DUST_THRESHOLD) {
        const changeAddress = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(keyPair.publicKey),
          network: this.network,
        }).address;
        psbt.addOutput({
          address: changeAddress,
          value: change,
        });
      }

      utxos.forEach((_, index) => {
        psbt.signInput(index, {
          publicKey: Buffer.from(keyPair.publicKey),
          sign: (hash) => {
            const signature = keyPair.sign(hash);
            return Buffer.from(signature);
          },
        });
      });

      psbt.finalizeAllInputs();

      const rawTransaction = psbt.extractTransaction().toHex();

      const response = await axios.post(
        this.regtestApi,
        {
          jsonrpc: '1.0',
          id: 'test',
          method: 'sendrawtransaction',
          params: [rawTransaction],
        },
        {
          auth: this.rpcAuth,
        },
      );

      if (response.data.error) {
        console.log(response.data.error.message);
        return;
      }

      return response.data.result;
    } catch (err) {
      console.log(err.response.data);
      throw new Error('Failed to send Bitcoin');
    }
  }
}
