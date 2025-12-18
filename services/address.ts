import { User } from '../types';

const HEX = '0123456789abcdef';
const BASE32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'; // bech32 charset lower
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function randomString(length: number, alphabet: string) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function generateBtcAddress() {
  // bech32-style: bc1q + 38 chars
  return 'bc1q' + randomString(38, BASE32);
}

function generateEthAddress() {
  return '0x' + randomString(40, HEX);
}

function generateSolAddress() {
  // typical Solana addresses are 44 base58 chars
  return randomString(44, BASE58);
}

export function generateUniqueAddresses(existingUsers: User[]): { BTC: string; ETH: string; SOL: string } {
  const taken = new Set<string>();
  existingUsers.forEach(u => {
    if (u.walletAddresses) {
      taken.add(u.walletAddresses.BTC);
      taken.add(u.walletAddresses.ETH);
      taken.add(u.walletAddresses.SOL);
    }
  });

  let btc = generateBtcAddress();
  while (taken.has(btc)) btc = generateBtcAddress();
  taken.add(btc);

  let eth = generateEthAddress();
  while (taken.has(eth)) eth = generateEthAddress();
  taken.add(eth);

  let sol = generateSolAddress();
  while (taken.has(sol)) sol = generateSolAddress();

  return { BTC: btc, ETH: eth, SOL: sol };
}

export function validateAddress(currency: 'BTC' | 'ETH' | 'SOL', address: string): boolean {
  if (!address) return false;
  if (currency === 'BTC') {
    return /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{1,87}$/i.test(address) && address.length >= 24 && address.length <= 62;
  }
  if (currency === 'ETH') {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }
  if (currency === 'SOL') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(address);
  }
  return false;
}
