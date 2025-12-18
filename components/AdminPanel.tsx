
import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { User, SubscriptionTier } from '../types';
import { generateUniqueAddresses, validateAddress } from '../services/address';
import { electroSocket } from '../services/socket';
import { useNotify } from './Notifications';

interface AdminPanelProps {
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdate }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fundingTarget, setFundingTarget] = useState<User | null>(null);
  const [fundAmount, setFundAmount] = useState('1.0');
  const [fundCurrency, setFundCurrency] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');
  const [isProcessing, setIsProcessing] = useState(false);

  const [marketFrozen, setMarketFrozen] = useState(false);
  const [globalAlert, setGlobalAlert] = useState('');
  const notify = useNotify();
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    electroSocket.connect('admin');
    electroSocket.onMarketFrozen((f) => setMarketFrozen(f));
    electroSocket.onAirdrop(() => {
      notify('success', 'Airdrop broadcast sent.');
    });
    electroSocket.onGlobalAlert((payload) => {
      notify('warning', `Global Alert: ${payload.message}`);
    });
  }, []);

  const toggleBan = (id: string) => {
    const user = db.getUsers().find(u => u.id === id);
    if (!user) return;
    db.updateUser(id, { isBanned: !user.isBanned });
    refresh();
  };

  const changeTier = (id: string, tier: SubscriptionTier) => {
    db.updateUser(id, { subscriptionTier: tier });
    refresh();
  };

  const handleFundWallet = async () => {
    if (!fundingTarget || isProcessing) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;

    const user = db.getUsers().find(u => u.id === fundingTarget.id);
    if (!user) return;

    setIsProcessing(true);

    // Simulate network delay for "realism"
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newBalance = { 
      ...user.balance,
      [fundCurrency]: user.balance[fundCurrency] + amount
    };
    
    db.updateUser(user.id, { balance: newBalance });

    // Record the minting event in the global transaction ledger
    db.addTransaction({
      id: Math.random().toString(36).substr(2, 16),
      senderId: 'network-reserve',
      senderUsername: 'NETWORK_RESERVE',
      receiverUsername: user.username,
      amount: amount,
      currency: fundCurrency,
      hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: Date.now(),
      status: 'Confirmed'
    });

    setIsProcessing(false);
    setFundingTarget(null);
    setFundAmount('1.0');
    refresh();
  };

  const resetPassword = (id: string) => {
    const newPass = Math.random().toString(36).slice(-8);
    db.updateUser(id, { passwordHash: newPass });
    alert(`Temporary access phrase for account generated: ${newPass}`);
    refresh();
  };

  const regenerateAddresses = (user: User) => {
    if (!confirm('Regenerate this user\'s addresses? Existing addresses will be replaced.')) return;
    const others = db.getUsers().filter(u => u.id !== user.id);
    const newAddresses = generateUniqueAddresses(others);
    db.updateUser(user.id, { walletAddresses: newAddresses });
    refresh();
    alert(`New addresses generated for @${user.username}.`);
  };

  const refresh = () => {
    setUsers([...db.getUsers()]);
    onUpdate();
  };

  return (
    <div className="space-y-8">
      {/* Admin Realtime Controls */}
      <div className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { electroSocket.adminFreeze(!marketFrozen); notify('info', (!marketFrozen ? 'Market frozen' : 'Market unfrozen')); }}
            className={`px-3 py-2 rounded-lg font-mono text-xs border ${marketFrozen ? 'bg-danger/20 text-danger border-danger/30' : 'bg-success/20 text-success border-success/30'}`}
          >
            {marketFrozen ? 'UNFREEZE MARKET' : 'FREEZE MARKET'}
          </button>
          <button
            onClick={() => electroSocket.adminAirdrop()}
            className="px-3 py-2 rounded-lg font-mono text-xs border bg-electro-accent/20 text-electro-accent border-electro-accent/30"
          >
            BROADCAST AIRDROP
          </button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={globalAlert}
            onChange={(e) => setGlobalAlert(e.target.value)}
            placeholder="Global alert message..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2 text-white font-mono text-xs"
          />
          <button
            onClick={() => { if (globalAlert.trim()) { electroSocket.adminAlert(globalAlert.trim()); notify('info', 'Global alert sent'); } setGlobalAlert(''); }}
            className="px-3 py-2 rounded-lg font-mono text-xs border bg-white/10 text-white border-white/20"
          >
            SEND ALERT
          </button>
        </div>
      </div>
      {/* Network Stats */}
      <div className="glass p-6 rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Total Users</p>
            <p className="text-2xl font-bold font-mono tracking-tighter">{users.length}</p>
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Active</p>
            <p className="text-2xl font-bold font-mono tracking-tighter text-success">{users.filter(u => !u.isBanned).length}</p>
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Banned</p>
            <p className="text-2xl font-bold font-mono tracking-tighter text-danger">{users.filter(u => u.isBanned).length}</p>
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Admins</p>
            <p className="text-2xl font-bold font-mono tracking-tighter text-electro-accent">{users.filter(u => u.isAdmin).length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-mono text-white tracking-tighter">CORE COMMAND CENTER</h2>
          <p className="text-white/40 text-xs font-mono uppercase tracking-[0.2em]">Network Control Terminal v4.0.0</p>
        </div>
        <div className="w-full md:w-96">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-electro-primary transition-all"
            placeholder="SEARCH OPERATOR UUID/ALIAS..."
          />
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="bg-white/5 text-white/30 border-b border-white/5">
              <th className="px-6 py-4 uppercase font-bold tracking-widest">Username</th>
              <th className="px-6 py-4 uppercase font-bold tracking-widest">Addresses</th>
              <th className="px-6 py-4 uppercase font-bold tracking-widest">Tier</th>
              <th className="px-6 py-4 uppercase font-bold tracking-widest">Status</th>
              <th className="px-6 py-4 uppercase font-bold tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-electro-primary font-bold">@{u.username}</span>
                  {u.isAdmin && <span className="ml-2 text-[9px] bg-red-500/20 text-red-500 px-1 rounded">ROOT</span>}
                </td>
                <td className="px-6 py-4 text-white/70 space-y-2">
                  {(['BTC', 'ETH', 'SOL'] as const).map(asset => {
                    const addr = u.walletAddresses?.[asset];
                    const isValid = addr ? validateAddress(asset, addr) : false;
                    return (
                      <div key={asset} className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold w-9 text-white/60">{asset}</span>
                        <span className="truncate text-xs" title={addr || 'No address'}>{addr ?? '—'}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded ${isValid ? 'bg-green-100/20 text-green-300 border border-green-500/30' : 'bg-red-100/20 text-red-300 border border-red-500/30'}`}>
                          {isValid ? 'valid' : 'invalid'}
                        </span>
                      </div>
                    );
                  })}
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={u.subscriptionTier} 
                    onChange={(e) => changeTier(u.id, e.target.value as SubscriptionTier)}
                    className="bg-black/40 border border-white/10 rounded px-2 py-1 outline-none"
                  >
                    {Object.values(SubscriptionTier).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${u.isBanned ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                    {u.isBanned ? 'BANNED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <div className="flex justify-end gap-1 flex-wrap">
                    <AdminButton onClick={() => toggleBan(u.id)} color={u.isBanned ? 'success' : 'danger'}>
                      {u.isBanned ? 'UNBAN' : 'BAN'}
                    </AdminButton>
                    <AdminButton onClick={() => setFundingTarget(u)} color="accent">MINT</AdminButton>
                    <AdminButton onClick={() => resetPassword(u.id)} color="primary">RESET</AdminButton>
                    <AdminButton onClick={() => setSelectedUser(u)} color="primary">PHRASE</AdminButton>
                    <AdminButton onClick={() => regenerateAddresses(u)} color="primary">REKEY</AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mnemonic Recovery Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-6">
          <div className="glass p-8 rounded-3xl max-w-md w-full border-electro-secondary/30 relative">
            <h3 className="text-lg font-bold font-mono text-electro-secondary mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              SENSITIVE DATA RECOVERY
            </h3>
            <div className="p-4 bg-black/60 rounded-xl border border-white/10 mb-6">
              <p className="text-[10px] font-mono text-white/30 uppercase mb-2">Operator</p>
              <p className="text-white font-bold mb-4">@{selectedUser.username}</p>
              <p className="text-[10px] font-mono text-white/30 uppercase mb-2">Recovery Mnemonic</p>
              <code className="text-electro-accent font-mono text-xs leading-relaxed break-words block">
                {selectedUser.mnemonic || "NO PHRASE ON RECORD"}
              </code>
            </div>
            <button 
              onClick={() => setSelectedUser(null)}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl font-mono text-xs uppercase tracking-widest"
            >
              PURGE VIEW
            </button>
          </div>
        </div>
      )}

      {/* Mint Assets Modal */}
      {fundingTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-6">
          <div className="glass p-8 rounded-3xl max-w-md w-full border-electro-accent/30 relative">
            <h3 className="text-lg font-bold font-mono text-electro-accent mb-6 flex items-center gap-2 uppercase tracking-tighter">
              Asset Injection Protocol
            </h3>
            <p className="text-white/40 text-[10px] font-mono mb-6 uppercase">TARGET: @{fundingTarget.username}</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] font-mono text-white/30 mb-2 uppercase tracking-widest">Currency Node</label>
                <select 
                  value={fundCurrency}
                  disabled={isProcessing}
                  onChange={(e) => setFundCurrency(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-electro-accent transition-all appearance-none disabled:opacity-50"
                >
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="SOL">SOL (Solana)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-white/30 mb-2 uppercase tracking-widest">Injection Quantity</label>
                <input 
                  type="number"
                  step="any"
                  value={fundAmount}
                  disabled={isProcessing}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-electro-accent transition-all disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setFundingTarget(null)}
                disabled={isProcessing}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl font-mono text-xs uppercase tracking-widest border border-white/5 disabled:opacity-50"
              >
                ABORT
              </button>
              <button 
                onClick={handleFundWallet}
                disabled={isProcessing}
                className="flex-1 py-4 bg-electro-accent/20 hover:bg-electro-accent/30 text-electro-accent font-bold rounded-xl font-mono text-xs uppercase tracking-widest border border-electro-accent/30 shadow-accent-glow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-electro-accent border-t-transparent rounded-full animate-spin"></div>
                    MINTING...
                  </>
                ) : (
                  'EXECUTE MINT'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminButton: React.FC<{ onClick: () => void; color: 'danger' | 'success' | 'accent' | 'primary'; children: React.ReactNode }> = ({ onClick, color, children }) => {
  const colors = {
    danger: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20',
    success: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    accent: 'bg-electro-accent/10 text-electro-accent border-electro-accent/20 hover:bg-electro-accent/20',
    primary: 'bg-electro-primary/10 text-electro-primary border-electro-primary/20 hover:bg-electro-primary/20'
  };
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold font-mono transition-all ${colors[color]}`}
    >
      {children}
    </button>
  );
};

export default AdminPanel;
