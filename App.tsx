
import React, { useState, useEffect, useCallback } from 'react';
import { User, AppState, SubscriptionTier, Transaction } from './types';
import { db } from './services/mockDb';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import AdminPanel from './components/AdminPanel';
import Settings from './components/Settings';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'wallet' | 'admin' | 'settings'>('dashboard');
  const [market, setMarket] = useState(db.getMarket());
  const [transactions, setTransactions] = useState(db.getTransactions());
  const [users, setUsers] = useState(db.getUsers());

  // Market Engine (Random Walk)
  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(market).forEach(symbol => {
        const coin = market[symbol];
        const currentPrice = coin.price;
        const volatility = 0.0015;
        const drift = 0.0001;
        const change = currentPrice * (drift + volatility * (Math.random() - 0.5));
        const newPrice = currentPrice + change;
        db.updateMarket(symbol, newPrice);
      });
      setMarket({ ...db.getMarket() });
    }, 4000);

    return () => clearInterval(interval);
  }, [market]);

  // Sync users and transactions
  const refreshData = useCallback(() => {
    setUsers([...db.getUsers()]);
    setTransactions([...db.getTransactions()]);
    if (currentUser) {
      const updatedSelf = db.getUsers().find(u => u.id === currentUser.id);
      if (updatedSelf) setCurrentUser(updatedSelf);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-electro-bg font-sans text-slate-200">
      <Navbar 
        user={currentUser} 
        onLogout={() => setCurrentUser(null)} 
        setView={setView} 
        currentView={view} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {view === 'dashboard' && (
          <Dashboard market={market} transactions={transactions} user={currentUser} />
        )}
        {view === 'wallet' && (
          <Wallet 
            user={currentUser} 
            market={market} 
            onTransaction={refreshData}
          />
        )}
        {view === 'admin' && currentUser.isAdmin && (
          <AdminPanel 
            onUpdate={refreshData}
          />
        )}
        {view === 'settings' && (
          <Settings 
            user={currentUser}
            onUpdate={refreshData}
          />
        )}
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-white/30 font-mono">
        &copy; 2024 ELECTRO-BLOCKCHAIN CORE v2.5.11 | PRODUCTION MAINNET
      </footer>
    </div>
  );
};

export default App;
