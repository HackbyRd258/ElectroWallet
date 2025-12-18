
import React from 'react';
import { MarketData, Transaction, User } from '../types';
import MarketChart from './MarketChart';

interface DashboardProps {
  market: Record<string, MarketData>;
  transactions: Transaction[];
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ market, transactions, user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Market Ticker & Stats */}
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(market).map((coin: MarketData) => (
            <div key={coin.symbol} className="glass p-6 rounded-2xl hover:border-white/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white/50 text-xs font-mono uppercase tracking-widest">{coin.name}</h3>
                  <p className="text-2xl font-bold font-mono tracking-tighter">${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded ${coin.change24h >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
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

        <div className="glass p-6 rounded-2xl">
          <h2 className="text-sm font-bold font-mono text-white/50 mb-4 uppercase tracking-[0.2em]">Market News</h2>
          <div className="space-y-4">
            <NewsItem 
              time="12m ago" 
              tag="BREAKING" 
              title="Global central banks announce new framework for BTC integration."
            />
            <NewsItem 
              time="45m ago" 
              tag="WHALE" 
              title="Address 16f...v2p moves 10,000 BTC into cold storage. Market sentiment rises."
            />
            <NewsItem 
              time="2h ago" 
              tag="TECH" 
              title="ElectroWallet v2.5 update introduces Banking Bridge protocols for all users."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsItem: React.FC<{ time: string; tag: string; title: string }> = ({ time, tag, title }) => (
  <div className="group cursor-pointer">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-electro-secondary/20 text-electro-secondary rounded">{tag}</span>
      <span className="text-[9px] text-white/30 font-mono">{time}</span>
    </div>
    <p className="text-xs text-white/70 group-hover:text-white transition-colors line-clamp-2">{title}</p>
  </div>
);

export default Dashboard;
