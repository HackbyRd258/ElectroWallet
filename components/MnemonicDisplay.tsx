
import React from 'react';

const MnemonicDisplay: React.FC<{ words: string }> = ({ words }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-electro-accent animate-pulse"></div>
        <h2 className="text-electro-accent font-mono text-xs uppercase tracking-[0.2em]">Secret Recovery Phrase</h2>
      </div>
      <p className="text-white/60 text-xs mb-4 leading-relaxed">
        This is the <span className="text-electro-secondary font-bold">master key</span> to your digital assets. Write it down. We cannot recover it for you.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {words.split(' ').map((word, i) => (
          <div key={i} className="flex items-center bg-black/40 p-2.5 rounded border border-white/5 group hover:border-electro-primary/30 transition-all">
            <span className="text-white/20 text-[10px] mr-2 font-mono w-4">{i + 1}.</span>
            <span className="text-electro-primary font-bold font-mono text-sm tracking-tight group-hover:text-white transition-colors">{word}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 items-start">
        <span className="text-lg text-red-500">⚠️</span>
        <p className="text-[10px] text-red-400 font-sans italic leading-normal">
          WARNING: If you lose these words, your identity will be purged from the global network. Never share these with anyone claiming to be "Admin".
        </p>
      </div>
    </div>
  );
};

export default MnemonicDisplay;
