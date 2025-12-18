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

  connect(username?: string) {
    if (this.socket) return this.socket;
    this.socket = io('http://localhost:4000', {
      transports: ['websocket'],
      query: username ? { username } : undefined,
    });
    return this.socket;
  }

  onMarketSnapshot(cb: (snap: MarketSnapshot) => void) {
    this.socket?.on('LAST_SNAPSHOT', cb);
  }

  onMarketUpdate(cb: (snap: MarketSnapshot) => void) {
    this.socket?.on('MARKET_UPDATE', cb);
  }

  onNewsUpdate(cb: (payload: { headlines: string[]; timestamp: number }) => void) {
    this.socket?.on('NEWS_UPDATE', cb);
  }

  onMempoolUpdate(cb: (txs: MempoolTx[]) => void) {
    this.socket?.on('MEMPOOL_UPDATE', cb);
  }

  onTxConfirmed(cb: (tx: MempoolTx) => void) {
    this.socket?.on('TX_CONFIRMED', cb);
  }

  onOnlineCount(cb: (count: number) => void) {
    this.socket?.on('ONLINE_COUNT', cb);
  }

  onMarketFrozen(cb: (frozen: boolean) => void) {
    this.socket?.on('MARKET_FROZEN', cb);
  }

  onAirdrop(cb: (payload: { amountSats: number; timestamp: number }) => void) {
    this.socket?.on('AIRDROP', cb);
  }

  onGlobalAlert(cb: (payload: { message: string; timestamp: number }) => void) {
    this.socket?.on('GLOBAL_ALERT', cb);
  }

  submitTx(payload: { from: string; to: string; amount: number; currency: string }) {
    this.socket?.emit('SUBMIT_TX', payload);
  }

  adminFreeze(enabled: boolean) {
    this.socket?.emit('ADMIN_FREEZE', enabled);
  }

  adminAirdrop() {
    this.socket?.emit('ADMIN_AIRDROP');
  }

  adminAlert(message: string) {
    this.socket?.emit('ADMIN_ALERT', message);
  }
}

export const electroSocket = new ElectroSocket();
