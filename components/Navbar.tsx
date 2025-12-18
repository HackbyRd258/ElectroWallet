
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  setView: (v: 'dashboard' | 'wallet' | 'admin' | 'settings') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, setView, currentView }) => {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electro-primary to-electro-secondary flex items-center justify-center shadow-glow">
            <span className="text-xl font-bold italic tracking-tighter">E</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">ElectroWallet</h1>
            <span className="text-[10px] text-electro-accent font-mono uppercase tracking-[0.2em]">Quantum Secure v2.5</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <NavButton active={currentView === 'dashboard'} onClick={() => setView('dashboard')}>DASHBOARD</NavButton>
          <NavButton active={currentView === 'wallet'} onClick={() => setView('wallet')}>WALLET</NavButton>
          <NavButton active={currentView === 'settings'} onClick={() => setView('settings')}>SETTINGS</NavButton>
          {user.isAdmin && (
            <NavButton active={currentView === 'admin'} onClick={() => setView('admin')}>ADMIN PANEL</NavButton>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-mono text-white/50">{user.subscriptionTier} Tier</p>
            <p className="text-sm font-bold text-electro-secondary">@{user.username}</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold border border-white/10 transition-colors"
          >
            DISCONNECT
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
      active ? 'bg-electro-primary text-white shadow-glow' : 'text-white/40 hover:text-white/70'
    }`}
  >
    {children}
  </button>
);

export default Navbar;
