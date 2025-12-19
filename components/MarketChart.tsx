
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle, AreaSeriesPartialOptions } from 'lightweight-charts';

interface MarketChartProps {
  data: { time: number; price: number }[];
}

const MarketChart: React.FC<MarketChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const areaRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#e9ecf5',
        fontSize: 11,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        secondsVisible: true,
        timeVisible: true,
      },
      grid: {
        horzLines: { color: 'rgba(255,255,255,0.04)' },
        vertLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        horzLine: { color: '#7af5d3', width: 1, style: LineStyle.Solid },
        vertLine: { color: '#7af5d3', width: 1, style: LineStyle.Solid },
      },
      localization: { priceFormatter: (p) => `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    });

    const areaOptions: AreaSeriesPartialOptions = {
      lineColor: '#7af5d3',
      topColor: 'rgba(122,245,211,0.35)',
      bottomColor: 'rgba(122,245,211,0.04)',
      lineWidth: 2,
      priceLineVisible: false,
    };

    const areaSeries = chart.addAreaSeries(areaOptions);

    const resize = () => {
      chart.applyOptions({ width: containerRef.current?.clientWidth || 0, height: containerRef.current?.clientHeight || 0 });
    };
    resize();
    window.addEventListener('resize', resize);

    chartRef.current = chart;
    areaRef.current = areaSeries;

    return () => {
      window.removeEventListener('resize', resize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !chartRef.current || !areaRef.current) return;
    const chart = chartRef.current;
    const areaSeries = areaRef.current;

    if (!data || data.length === 0) {
      areaSeries.setData([]);
      return;
    }

    const normalized = data.map(d => ({ time: Math.floor(d.time / 1000), value: d.price }));
    areaSeries.setData(normalized);
    areaSeries.update(normalized[normalized.length - 1]);
    chart.timeScale()?.fitContent();
  }, [data]);

  if (!data || data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center border border-white/5 bg-white/5 rounded-2xl glass">
        <p className="text-xs font-mono text-white/30 animate-pulse">Booting market feed…</p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  return (
    <div className="relative h-72 w-full rounded-2xl glass overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ filter: 'drop-shadow(0 0 12px rgba(122,245,211,0.35))' }} />
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-4 right-4 text-right">
        <p className="text-[10px] font-mono text-white/40">LIVE PRICE</p>
        <p className="text-xl font-bold font-mono text-white">${latest.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        <p className="text-[10px] font-mono text-electro-accent">Real-time feed · glass view</p>
      </div>
    </div>
  );
};

export default MarketChart;
