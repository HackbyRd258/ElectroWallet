
import { User, Transaction, MarketData, SubscriptionTier } from '../types';
import { MOCK_ADMIN, INITIAL_MARKET } from '../constants';

class MockDB {
  private users: User[] = [MOCK_ADMIN];
  private transactions: Transaction[] = [];
  private market: Record<string, MarketData> = INITIAL_MARKET;

  getUsers() { return this.users; }
  getTransactions() { return this.transactions; }
  getMarket() { return this.market; }

  addUser(user: User) {
    this.users.push(user);
  }

  updateUser(id: string, updates: Partial<User>) {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
  }

  addTransaction(tx: Transaction) {
    this.transactions = [tx, ...this.transactions];
  }

  updateMarket(symbol: string, newPrice: number) {
    const coin = this.market[symbol];
    if (coin) {
      const change = ((newPrice - coin.price) / coin.price) * 100;
      this.market[symbol] = {
        ...coin,
        price: newPrice,
        change24h: change,
        history: [...coin.history.slice(-20), { time: Date.now(), price: newPrice }]
      };
    }
  }
}

export const db = new MockDB();
