import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/mockDb';

interface AdminAuthProps {
  onLogin: (user: User) => void;
  onBack?: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Required fields missing.'); return; }
    const user = db.getUsers().find(u => u.username === username && u.passwordHash === password);
    if (!user || !user.isAdmin) { setError('Invalid admin credentials.'); return; }
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-electro-bg relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-electro-secondary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-electro-primary/10 rounded-full blur-[120px]"></div>
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-electro-secondary to-electro-primary items-center justify-center shadow-glow mb-4">
            <span className="text-3xl font-bold italic">A</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Admin Console</h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Privileged Access</p>
        </div>
        <div className="glass p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{error}</div>}
            <div>
              <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Admin Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-electro-secondary transition-all" placeholder="Enter admin alias..." />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-electro-secondary transition-all" placeholder="********" />
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-electro-secondary to-electro-primary rounded-lg font-bold shadow-glow hover:opacity-90 transition-all">
              ENTER CONSOLE
            </button>
          </form>
          {onBack && (
            <div className="mt-6 text-center">
              <button onClick={onBack} className="text-xs font-mono text-white/30 hover:text-white/60 uppercase tracking-tighter">
                Back to User Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
