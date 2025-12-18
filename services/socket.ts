import { io, Socket } from 'socket.io-client';

export type MarketSnapshot = {
  btc: { price: number; change: number };
  eth: { price: number; change: number };
  sol: { price: number; change: number };
  timestamp: number;
};

export type MempoolTx = {
  id: string;
  hash: string;
  senderUsername: string;
  receiverUsername: string;
  amount: number;
  currency: string;
  timestamp: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
};

class ElectroSocket {
  private socket: Socket | null = null;
  private mockMode: boolean = true; // Enable mock mode for demo without backend
  private listeners: Map<string, Set<Function>> = new Map();

  connect(username?: string) {
    if (this.socket) return this.socket;
    
    // Try to connect to real server, but fallback to mock mode
    this.socket = io('http://localhost:4000', {
      transports: ['websocket'],
      query: username ? { username } : undefined,
      timeout: 1000,
    });

    // Detect if server is not available and enable mock mode
    this.socket.on('connect_error', () => {
      this.mockMode = true;
    });

    this.socket.on('connect', () => {
      this.mockMode = false;
    });

    // Listen for localStorage changes from other tabs
    if (this.mockMode) {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }

    return this.socket;
  }

  private handleStorageChange(e: StorageEvent) {
    if (e.key === 'electrowallet_sync_event') {
      const event = JSON.parse(e.newValue || '{}');
      const handlers = this.listeners.get(event.type);
      if (handlers) {
        handlers.forEach(cb => cb(event.payload));
      }
    }
  }

  private emit(eventType: string, payload: any) {
    if (this.mockMode) {
      // Broadcast to other tabs via localStorage
      localStorage.setItem('electrowallet_sync_event', JSON.stringify({
        type: eventType,
        payload,
        timestamp: Date.now()
      }));
      // Also trigger locally
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        handlers.forEach(cb => cb(payload));
      }
    } else {
      this.socket?.emit(eventType, payload);
    }
  }

  private on(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);
    
    if (!this.mockMode) {
      this.socket?.on(eventType, callback as any);
    }
  }

  onMarketSnapshot(cb: (snap: MarketSnapshot) => void) {
    this.on('LAST_SNAPSHOT', cb);
  }

  onMarketUpdate(cb: (snap: MarketSnapshot) => void) {
    this.on('MARKET_UPDATE', cb);
  }

  onNewsUpdate(cb: (payload: { headlines: string[]; timestamp: number }) => void) {
    this.on('NEWS_UPDATE', cb);
  }

  onMempoolUpdate(cb: (txs: MempoolTx[]) => void) {
    this.on('MEMPOOL_UPDATE', cb);
  }

  onTxConfirmed(cb: (tx: MempoolTx) => void) {
    this.on('TX_CONFIRMED', cb);
  }

  onOnlineCount(cb: (count: number) => void) {
    this.on('ONLINE_COUNT', cb);
  }

  onMarketFrozen(cb: (frozen: boolean) => void) {
    this.on('MARKET_FROZEN', cb);
  }

  onAirdrop(cb: (payload: { amountSats: number; timestamp: number }) => void) {
    this.on('AIRDROP', cb);
  }

  onGlobalAlert(cb: (payload: { message: string; timestamp: number }) => void) {
    this.on('GLOBAL_ALERT', cb);
  }

  submitTx(payload: { from: string; to: string; amount: number; currency: string }) {
    // In mock mode, process transaction locally
    if (this.mockMode) {
      this.processMockTransaction(payload);
    } else {
      this.socket?.emit('SUBMIT_TX', payload);
    }
  }

  private processMockTransaction(payload: { from: string; to: string; amount: number; currency: string }) {
    // Import db dynamically to avoid circular dependency
    import('../services/mockDb').then(({ db }) => {
      const sender = db.getUsers().find(u => u.username.toLowerCase() === payload.from.toLowerCase());
      const receiver = db.getUsers().find(u => u.username.toLowerCase() === payload.to.toLowerCase());

      if (!sender || !receiver) {
        console.error('Transaction failed: User not found');
        return;
      }

      const curr = payload.currency as 'BTC' | 'ETH' | 'SOL';
      if (sender.balance[curr] < payload.amount) {
        console.error('Transaction failed: Insufficient balance');
        return;
      }

      // Create transaction
      const tx: MempoolTx = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        senderUsername: sender.username,
        receiverUsername: receiver.username,
        amount: payload.amount,
        currency: payload.currency,
        timestamp: Date.now(),
        status: 'Pending'
      };

      // Add to mempool (emit to all tabs)
      this.emit('MEMPOOL_UPDATE', [tx]);

      // Simulate confirmation after 2 seconds
      setTimeout(() => {
        // Update balances
        db.updateUser(sender.id, {
          balance: {
            ...sender.balance,
            [curr]: sender.balance[curr] - payload.amount
          }
        });

        db.updateUser(receiver.id, {
          balance: {
            ...receiver.balance,
            [curr]: receiver.balance[curr] + payload.amount
          }
        });

        // Add to transactions
        db.addTransaction({
          id: tx.id,
          senderId: sender.id,
          senderUsername: sender.username,
          receiverUsername: receiver.username,
          amount: payload.amount,
          currency: payload.currency,
          hash: tx.hash,
          timestamp: Date.now(),
          status: 'Confirmed'
        });

        // Emit confirmation to all tabs
        tx.status = 'Confirmed';
        this.emit('TX_CONFIRMED', tx);
      }, 2000);
    });
  }

  adminFreeze(enabled: boolean) {
    this.emit('ADMIN_FREEZE', enabled);
    this.emit('MARKET_FROZEN', enabled);
  }

  adminAirdrop() {
    this.emit('ADMIN_AIRDROP', { amountSats: 1000, timestamp: Date.now() });
  }

  adminAlert(message: string) {
    this.emit('ADMIN_ALERT', { message, timestamp: Date.now() });
    this.emit('GLOBAL_ALERT', { message, timestamp: Date.now() });
  }
}

export const electroSocket = new ElectroSocket();
