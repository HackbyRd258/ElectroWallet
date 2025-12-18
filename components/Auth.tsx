
import React, { useState } from 'react';
import { User, SubscriptionTier } from '../types';
import { MNEMONIC_WORDS } from '../constants';
import { db } from '../services/mockDb';
import MnemonicDisplay from './MnemonicDisplay';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(1); // 1: Creds, 2: Mnemonic
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [error, setError] = useState('');

  const generateMnemonic = () => {
    const words = [];
    for (let i = 0; i < 12; i++) {
      words.push(MNEMONIC_WORDS[Math.floor(Math.random() * MNEMONIC_WORDS.length)]);
    }
    return words.join(' ');
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Required fields missing.');
      return;
    }

    if (isRegistering) {
      const mnemonic = generateMnemonic();
      setGeneratedMnemonic(mnemonic);
      setStep(2);
    } else {
      const user = db.getUsers().find(u => u.username === username && u.passwordHash === password);
      if (user) {
        if (user.isBanned) {
          setError('Account has been restricted by administrators.');
        } else {
          onLogin(user);
        }
      } else {
        setError('Invalid credentials.');
      }
    }
  };

  const finishRegistration = () => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      passwordHash: password,
      subscriptionTier: SubscriptionTier.FREE,
      isBanned: false,
      isAdmin: false,
      mnemonic: generatedMnemonic,
      walletAddress: 'bc1q' + Math.random().toString(36).substr(2, 32),
      balance: { BTC: 0.5, ETH: 2.0, SOL: 15.0 }, // Welcome bonus
    };
    db.addUser(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-electro-bg relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-electro-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-electro-secondary/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-electro-primary to-electro-secondary items-center justify-center shadow-glow mb-4">
            <span className="text-3xl font-bold italic">E</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">ElectroWallet</h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Global Electro Network</p>
        </div>

        {step === 1 ? (
          <div className="glass p-8 rounded-2xl shadow-xl">
            <form onSubmit={handleAuth} className="space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{error}</div>}
              <div>
                <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Username</label>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-electro-primary transition-all"
                  placeholder="Enter alias..."
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-electro-primary transition-all"
                  placeholder="********"
                />
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-electro-primary to-electro-secondary rounded-lg font-bold shadow-glow hover:opacity-90 transition-all">
                {isRegistering ? 'CREATE ACCOUNT' : 'ESTABLISH LINK'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="text-xs font-mono text-white/30 hover:text-white/60 uppercase tracking-tighter"
              >
                {isRegistering ? 'Already a member? Sign in' : 'New operator? Request entry'}
              </button>
            </div>
          </div>
        ) : (
          <div className="glass p-8 rounded-2xl shadow-xl">
            <MnemonicDisplay words={generatedMnemonic} />
            <button 
              onClick={finishRegistration}
              className="w-full mt-6 py-4 bg-electro-accent/20 border border-electro-accent/30 text-electro-accent rounded-lg font-bold shadow-accent-glow hover:bg-electro-accent/30 transition-all font-mono text-xs tracking-widest"
            >
              I HAVE SECURED MY PHRASE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
