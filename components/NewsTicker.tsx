import React, { useEffect, useState } from 'react';
import { electroSocket } from '../services/socket';

const NewsTicker: React.FC = () => {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [ts, setTs] = useState<number>(0);

  useEffect(() => {
    electroSocket.connect();
    electroSocket.onNewsUpdate((payload) => {
      setHeadlines(payload.headlines || []);
      setTs(payload.timestamp);
    });
  }, []);

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold font-mono text-white/50 uppercase tracking-[0.2em]">Market News</h2>
        <span className="text-[9px] text-white/30 font-mono">{ts ? new Date(ts).toLocaleTimeString() : 'Waiting...'}</span>
      </div>
      {headlines.length === 0 ? (
        <p className="text-xs text-white/30 font-mono">No headlines yet.</p>
      ) : (
        <ul className="space-y-3">
          {headlines.map((title, idx) => (
            <li key={idx} className="group cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-electro-secondary/20 text-electro-secondary rounded">NEWS</span>
                <span className="text-[9px] text-white/30 font-mono">{idx + 1}</span>
              </div>
              <p className="text-xs text-white/70 group-hover:text-white transition-colors line-clamp-2">{title}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsTicker;
