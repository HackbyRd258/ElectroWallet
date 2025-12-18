
import React from 'react';

interface MarketChartProps {
  data: { time: number; price: number }[];
}

const MarketChart: React.FC<MarketChartProps> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center border border-white/5 bg-black/20 rounded-xl">
        <p className="text-xs font-mono text-white/20 animate-pulse">Initializing data streams...</p>
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const padding = range * 0.1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.price - min + padding) / (range + padding * 2)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative h-64 w-full bg-black/20 rounded-xl overflow-hidden group">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-5 pointer-events-none">
        {[...Array(5)].map((_, i) => <div key={i} className="border-t border-white w-full"></div>)}
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full p-4 overflow-visible">
        {/* Fill area */}
        <polyline
          fill="url(#gradient)"
          stroke="none"
          points={`0,100 ${points} 100,100`}
        />
        {/* Main Line */}
        <polyline
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          points={points}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      <div className="absolute top-4 right-4 flex flex-col items-end">
        <p className="text-[10px] font-mono text-white/30">CURRENT SESSION MAX</p>
        <p className="text-sm font-bold font-mono text-electro-accent">${max.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default MarketChart;
