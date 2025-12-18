
import React, { useState, useEffect } from 'react';

const steps = [
  { label: 'Securing Tunnel', desc: 'Establishing encrypted link to global bank nodes...' },
  { label: 'Asset Verification', desc: 'Verifying wallet signatures on the ledger...' },
  { label: 'Compliance Check', desc: 'Running AML/KYC protocols for capital exit...' },
  { label: 'Routing to Node', desc: 'Broadcasting withdrawal request to SWIFT network...' },
  { label: 'Completed', desc: 'Transaction finalized. Funds delivered.' }
];

const BankingBridge: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const duration = 2500 + Math.random() * 2000;
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min((elapsed / duration) * 100, 100);
        setProgress(p);
        
        if (p === 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentStep(s => s + 1);
            setProgress(0);
          }, 500);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="glass w-full max-w-lg p-10 rounded-3xl shadow-2xl relative border-electro-accent/30 overflow-hidden">
        {/* Progress scan line effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_0%,rgba(34,211,238,0.2)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_2s_linear_infinite]"></div>
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-electro-accent/10 border border-electro-accent/30 mb-6">
            <span className="text-3xl animate-pulse">⚡</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2 uppercase font-mono">Quantum Banking Bridge</h2>
          <p className="text-white/40 text-xs font-mono">NODE LINK: SECURE-AES-256</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-electro-accent font-mono text-[10px] uppercase tracking-widest">{steps[currentStep].label}</span>
              <span className="text-white/50 font-mono text-[10px]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-electro-primary to-electro-accent transition-all duration-300 shadow-accent-glow"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-white/30 italic">{steps[currentStep].desc}</p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-electro-accent' : 'bg-white/10'}`}></div>
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <button 
              onClick={onClose}
              className="w-full py-4 bg-electro-accent text-black font-bold rounded-xl tracking-widest hover:bg-white transition-all shadow-accent-glow font-mono uppercase text-xs"
            >
              CLOSE TERMINAL
            </button>
          ) : (
            <button 
              disabled
              className="w-full py-4 bg-white/5 text-white/20 font-bold rounded-xl tracking-widest font-mono uppercase text-xs border border-white/5 cursor-not-allowed"
            >
              TRANSMITTING CAPITAL...
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default BankingBridge;
