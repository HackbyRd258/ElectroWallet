
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/mockDb';

interface SettingsProps {
  user: User;
  onUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.passwordHash);
  const [success, setSuccess] = useState('');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateUser(user.id, { username, passwordHash: password });
    setSuccess('Security credentials synchronized with the network core.');
    onUpdate();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-mono text-white tracking-tighter">OPERATOR CONFIG</h2>
        <p className="text-white/40 text-xs font-mono uppercase tracking-[0.2em]">Personal Identity & Protocol Overrides</p>
      </div>

      <div className="glass p-8 rounded-2xl space-y-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          {success && <div className="p-3 bg-success/10 border border-success/20 text-success text-xs rounded-lg font-mono uppercase">{success}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-widest">Operator Alias</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-electro-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-widest">Access Phrase</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-electro-primary transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full md:w-auto px-8 py-4 bg-electro-primary text-white font-bold rounded-xl font-mono text-xs tracking-widest hover:bg-electro-secondary transition-all shadow-glow">
              UPDATE IDENTITY PARAMS
            </button>
          </div>
        </form>

        <div className="border-t border-white/5 pt-8">
          <h3 className="text-sm font-bold font-mono text-white/50 mb-4 uppercase tracking-[0.2em]">Subscription Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${user.subscriptionTier === 'Free' ? 'border-electro-accent bg-electro-accent/5' : 'border-white/5 bg-black/20'}`}>
              <p className="text-[10px] font-mono text-white/30 uppercase mb-1">Status</p>
              <p className="text-white font-bold">{user.subscriptionTier}</p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-black/20">
              <p className="text-[10px] font-mono text-white/30 uppercase mb-1">Fee Multiplier</p>
              <p className="text-white font-bold">{user.subscriptionTier === 'Premium' ? '0.00x' : '1.00x'}</p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-black/20">
              <p className="text-[10px] font-mono text-white/30 uppercase mb-1">Node Speed</p>
              <p className="text-white font-bold">Standard</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
          <h3 className="text-xs font-bold font-mono text-red-500/60 mb-2 uppercase tracking-[0.1em]">Danger Zone</h3>
          <p className="text-[10px] text-white/30 mb-4 leading-relaxed font-mono">
            Initiating a full identity purge will permanently remove your assets from the global network. This action cannot be undone by administrators.
          </p>
          <button className="px-4 py-2 border border-red-500/30 text-red-500 text-[10px] font-bold rounded hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest font-mono">
            PURGE IDENTITY
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
