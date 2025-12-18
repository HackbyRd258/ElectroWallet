
export enum SubscriptionTier {
  FREE = 'Free',
  BASIC = 'Basic',
  PREMIUM = 'Premium'
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  subscriptionTier: SubscriptionTier;
  isBanned: boolean;
  isAdmin: boolean;
  walletAddress?: string;
  mnemonic?: string;
  balance: {
    BTC: number;
    ETH: number;
    SOL: number;
  };
}

export interface Transaction {
  id: string;
  senderId: string;
  senderUsername: string;
  receiverUsername: string;
  amount: number;
  currency: 'BTC' | 'ETH' | 'SOL';
  hash: string;
  timestamp: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  history: { time: number; price: number }[];
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  market: Record<string, MarketData>;
}
