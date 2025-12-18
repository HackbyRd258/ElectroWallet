
import React, { useEffect, useState } from 'react';
import { MarketData, Transaction, User } from '../types';
import MarketChart from './MarketChart';
import NewsTicker from './NewsTicker';
import { electroSocket, MempoolTx } from '../services/socket';

interface DashboardProps {
  market: Record<string, MarketData>;
  transactions: Transaction[];
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ market, transactions, user }) => {
  const [mempool, setMempool] = useState<MempoolTx[]>([]);

  useEffect(() => {
    electroSocket.connect(user.username);
    electroSocket.onMempoolUpdate((txs) => setMempool(txs));
  }, [user.username]);

  const totalValue = user.balance.BTC * market.BTC.price + user.balance.ETH * market.ETH.price + user.balance.SOL * market.SOL.price;
  const userTxs = transactions.filter(tx => tx.senderUsername === user.username || tx.receiverUsername === user.username);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Market Ticker & Stats */}
      <div className="lg:col-span-2 space-y-8">
        {/* Portfolio Stats */}
        <div className="glass p-6 rounded-2xl border-l-4 border-electro-primary bg-gradient-to-r from-electro-primary/5 to-transparent hover:border-electro-accent transition-all hover:shadow-2xl animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group cursor-pointer">
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1 group-hover:text-electro-primary transition-colors">Portfolio Value</p>
              <p className="text-2xl font-bold font-mono tracking-tighter group-hover:scale-105 transition-transform">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="group cursor-pointer">
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1 group-hover:text-electro-primary transition-colors">Total Transactions</p>
              <p className="text-2xl font-bold font-mono tracking-tighter group-hover:scale-105 transition-transform">{userTxs.length}</p>
            </div>
            <div className="group cursor-pointer">
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1 group-hover:text-electro-primary transition-colors">Account Tier</p>
              <p className="text-2xl font-bold font-mono tracking-tighter text-electro-accent group-hover:scale-105 transition-transform">{user.subscriptionTier}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(market).map((coin: MarketData) => (
            <div key={coin.symbol} className="glass p-6 rounded-2xl hover:border-electro-primary/50 transition-all group cursor-pointer hover:scale-105 hover:shadow-2xl animate-scale-in">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white/50 text-xs font-mono uppercase tracking-widest group-hover:text-electro-accent transition-colors">{coin.name}</h3>
                  <p className="text-2xl font-bold font-mono tracking-tighter group-hover:text-electro-primary transition-colors">${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <span className={`text-xs font-mono px-3 py-1.5 rounded-full transition-all transform group-hover:scale-110 ${coin.change24h >= 0 ? 'bg-success/10 text-success group-hover:bg-success/20' : 'bg-danger/10 text-danger group-hover:bg-danger/20'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="h-12 w-full">
                <div className="flex items-end gap-0.5 h-full opacity-30 group-hover:opacity-60 transition-opacity">
                  {coin.history.slice(-15).map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 ${coin.change24h >= 0 ? 'bg-success' : 'bg-danger'}`}
                      style={{ height: `${20 + (Math.random() * 80)}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-electro-accent animate-pulse"></span>
              LIVE MARKET FLOW
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white/5 rounded text-[10px] font-mono hover:bg-white/10">1H</button>
              <button className="px-3 py-1 bg-electro-primary/20 text-electro-primary rounded text-[10px] font-mono">24H</button>
              <button className="px-3 py-1 bg-white/5 rounded text-[10px] font-mono hover:bg-white/10">7D</button>
            </div>
          </div>
          <MarketChart data={market['BTC'].history} />
        </div>
      </div>

      {/* Right Column: Transaction Stream & News */}
      <div className="space-y-8">
        <div className="glass p-6 rounded-2xl h-[240px]">
          <h2 className="text-sm font-bold font-mono text-white/50 mb-4 uppercase tracking-[0.2em]">Pending Mempool</h2>
          {mempool.length === 0 ? (
            <p className="text-xs text-white/30 font-mono">No pending transactions.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[160px] pr-2">
              {mempool.slice(0, 20).map((tx) => (
                <div key={tx.hash} className="border-l-2 border-yellow-400/30 pl-4 py-1">
                  <p className="text-xs font-mono">
                    <span className="text-electro-accent">@{tx.senderUsername}</span>
                    <span className="text-white/40"> sent </span>
                    <span className="text-white">{tx.amount} {tx.currency}</span>
                    <span className="text-white/40"> to </span>
                    <span className="text-electro-secondary">@{tx.receiverUsername}</span>
                  </p>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-white/20 font-mono">HASH: {tx.hash.substr(0, 12)}...</span>
                    <span className="text-[9px] text-yellow-300 font-mono uppercase">PENDING</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass p-6 rounded-2xl h-[400px] flex flex-col">
          <h2 className="text-sm font-bold font-mono text-white/50 mb-4 uppercase tracking-[0.2em]">Global Feed</h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="border-l-2 border-electro-primary/30 pl-4 py-1">
                <p className="text-xs font-mono">
                  <span className="text-electro-accent">@{tx.senderUsername}</span> 
                  <span className="text-white/40"> sent </span>
                  <span className="text-white">{tx.amount} {tx.currency}</span>
                  <span className="text-white/40"> to </span>
                  <span className="text-electro-secondary">@{tx.receiverUsername}</span>
                </p>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-white/20 font-mono">HASH: {tx.hash.substr(0, 12)}...</span>
                  <span className="text-[9px] text-success font-mono uppercase">CONFIRMED</span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-xs text-center text-white/20 mt-10 font-mono">Synchronizing ledger...</p>
            )}
          </div>
        </div>

        <NewsTicker />
      </div>
    </div>
  );
};

export default Dashboard;
