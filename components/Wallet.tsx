
import React, { useState } from 'react';
import { User, MarketData, SubscriptionTier } from '../types';
import { db } from '../services/mockDb';
import BankingBridge from './BankingBridge';

interface WalletProps {
  user: User;
  market: Record<string, MarketData>;
  onTransaction: () => void;
}

const Wallet: React.FC<WalletProps> = ({ user, market, onTransaction }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');
  const [isBridging, setIsBridging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      setError('Invalid amount.');
      return;
    }

    if (user.balance[currency] < sendAmount) {
      setError(`Insufficient ${currency} balance.`);
      return;
    }

    const receiver = db.getUsers().find(u => u.username === recipient);
    if (!receiver) {
      setError('User not found on the network.');
      return;
    }

    if (receiver.id === user.id) {
      setError('Cannot transmit to self.');
      return;
    }

    // Process Transaction
    const txId = Math.random().toString(36).substr(2, 16);
    const fee = user.subscriptionTier === SubscriptionTier.PREMIUM ? 0 : 0.0001;

    // Update balances
    const senderBalance = { ...user.balance, [currency]: user.balance[currency] - sendAmount - fee };
    const receiverBalance = { ...receiver.balance, [currency]: receiver.balance[currency] + sendAmount };

    db.updateUser(user.id, { balance: senderBalance });
    db.updateUser(receiver.id, { balance: receiverBalance });

    db.addTransaction({
      id: txId,
      senderId: user.id,
      senderUsername: user.username,
      receiverUsername: recipient,
      amount: sendAmount,
      currency,
      hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: Date.now(),
      status: 'Confirmed'
    });

    setSuccess(`Successfully transmitted ${sendAmount} ${currency} to @${recipient}`);
    setRecipient('');
    setAmount('');
    onTransaction();
  };

  const totalValueUSD = (user.balance.BTC * market.BTC.price) + 
                       (user.balance.ETH * market.ETH.price) + 
                       (user.balance.SOL * market.SOL.price);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Wallet Details */}
      <div className="space-y-6">
        <div className="glass p-8 rounded-2xl border-l-4 border-electro-primary bg-gradient-to-r from-electro-primary/5 to-transparent">
          <p className="text-white/40 text-xs font-mono uppercase tracking-[0.2em] mb-1">Estimated Net Worth</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold font-mono tracking-tighter text-white">
              ${totalValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </h2>
            <span className="text-electro-accent font-mono text-xs">USD</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <BalanceCard symbol="BTC" amount={user.balance.BTC} price={market.BTC.price} />
            <BalanceCard symbol="ETH" amount={user.balance.ETH} price={market.ETH.price} />
            <BalanceCard symbol="SOL" amount={user.balance.SOL} price={market.SOL.price} />
          </div>
        </div>

        <div className="glass p-8 rounded-2xl">
          <h3 className="text-sm font-bold font-mono text-white/50 mb-6 uppercase tracking-[0.2em]">Public Node Address</h3>
          <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
            <code className="text-electro-accent font-mono text-sm break-all">{user.walletAddress}</code>
            <button className="text-[10px] font-bold text-white/30 hover:text-white transition-colors ml-4">COPY</button>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl">
          <h3 className="text-sm font-bold font-mono text-white/50 mb-6 uppercase tracking-[0.2em]">Banking Bridge</h3>
          <p className="text-xs text-white/40 mb-6 leading-relaxed">
            Move capital to verified external bank nodes. Note that bridge delays apply for non-Premium tiers.
          </p>
          <button 
            onClick={() => setIsBridging(true)}
            className="w-full py-3 bg-electro-accent/10 border border-electro-accent/20 text-electro-accent rounded-xl font-bold font-mono text-xs tracking-widest hover:bg-electro-accent/20 transition-all shadow-accent-glow"
          >
            INITIALIZE BRIDGE
          </button>
        </div>
      </div>

      {/* Transaction Control */}
      <div className="glass p-8 rounded-2xl h-fit">
        <h3 className="text-sm font-bold font-mono text-white/50 mb-6 uppercase tracking-[0.2em]">P2P Transmission</h3>
        <form onSubmit={handleSend} className="space-y-6">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg font-mono uppercase">{error}</div>}
          {success && <div className="p-3 bg-success/10 border border-success/20 text-success text-[10px] rounded-lg font-mono uppercase">{success}</div>}
          
          <div>
            <label className="block text-[10px] font-mono text-white/30 mb-2 uppercase tracking-widest">Recipient Operator (@)</label>
            <input 
              type="text" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-electro-secondary transition-all"
              placeholder="e.g. AdminGod"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-white/30 mb-2 uppercase tracking-widest">Amount</label>
              <input 
                type="number" 
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-electro-secondary transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-white/30 mb-2 uppercase tracking-widest">Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-electro-secondary transition-all appearance-none"
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] font-mono text-white/30 mb-1">
              <span>Network Fee</span>
              <span>{user.subscriptionTier === SubscriptionTier.PREMIUM ? '0.0000' : '0.0001'} {currency}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/30">
              <span>Status</span>
              <span className="text-success">READY</span>
            </div>
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-electro-primary to-electro-secondary rounded-xl font-bold font-mono tracking-widest hover:opacity-90 transition-all shadow-glow">
            EXECUTE TRANSMISSION
          </button>
        </form>
      </div>

      {isBridging && <BankingBridge onClose={() => setIsBridging(false)} />}
    </div>
  );
};

const BalanceCard: React.FC<{ symbol: string; amount: number; price: number }> = ({ symbol, amount, price }) => (
  <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex-1 min-w-[120px]">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] font-bold text-white/40">{symbol}</span>
      <span className="text-[9px] text-electro-accent font-mono">${(amount * price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
    </div>
    <p className="text-sm font-bold font-mono text-white">{amount.toFixed(4)}</p>
  </div>
);

export default Wallet;
