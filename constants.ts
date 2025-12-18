
import { SubscriptionTier, User } from './types';

export const MNEMONIC_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
  'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford',
  'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
  'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always'
];

export const MOCK_ADMIN: User = {
  id: 'admin-001',
  username: 'AdminGod',
  passwordHash: 'admin123',
  subscriptionTier: SubscriptionTier.PREMIUM,
  isBanned: false,
  isAdmin: true,
  walletAddress: 'bc1qadminx7v678hnd73ndu293ns7sk2k9sh3',
  balance: { BTC: 100, ETH: 500, SOL: 10000 },
};

export const INITIAL_MARKET = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', price: 67240.50, change24h: 2.4, history: [] },
  ETH: { symbol: 'ETH', name: 'Ethereum', price: 3450.22, change24h: -1.1, history: [] },
  SOL: { symbol: 'SOL', name: 'Solana', price: 145.88, change24h: 5.7, history: [] },
};
