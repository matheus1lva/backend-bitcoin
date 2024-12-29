// Example of getting UTXO in regtest
const bitcoin = require('bitcoinjs-lib');
const { RegtestUtils } = require('regtest-client');
const regtestUtils = new RegtestUtils(bitcoin);
async function getUTXO() {
  // This will create a new UTXO by using the regtest faucet
  const utxo = await regtestUtils.faucet(
    'bcrt1qlwlfcprcn7zc7lef9e0jc4t76g09fe06h0t099',
    50000,
  );
  console.log(utxo);
  return utxo;
}

getUTXO();
