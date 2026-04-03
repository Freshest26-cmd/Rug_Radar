import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, Award, Filter } from 'lucide-react';
import { formatCurrency, getRiskColor } from '../lib/utils';
import { Link } from 'react-router-dom';

import { useScannerStore } from '../store';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const isDemoMode = useScannerStore(state => state.isDemoMode);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/tokens')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) => b.recommendation - a.recommendation);
        const limited = isDemoMode ? sorted.slice(0, 5) : sorted;
        setRecommendations(limited);
      });

    gsap.from('.header-anim', { opacity: 0, y: -20, duration: 0.8 });
  }, []);

  useEffect(() => {
    if (recommendations.length > 0) {
      gsap.fromTo('.rec-card', 
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [recommendations]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 header-anim">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-wide text-white font-heading">
            TOP <span className="text-neon-green">PICKS</span>
          </h1>
          <p className="text-slate-300 font-sans">Ranked by our multi-engine scoring algorithm.</p>
        </div>
        <div className="flex gap-4">
          <button className="glass-card px-4 py-2 flex items-center gap-2 text-sm hover:border-neon-green transition-all text-white font-heading tracking-wide">
            <Filter size={16} /> Filter
          </button>
          <div className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-white font-mono tracking-widest">
            <Award size={16} className="text-neon-purple" /> Algorithm v2.4
          </div>
        </div>
      </header>

      <div ref={listRef} className="space-y-3">
        {recommendations.map((token, i) => (
          <Link
            to={`/token/${token.address}`}
            key={token.id}
            className="rec-card bg-[#0a0f16] border border-slate-900 p-4 md:p-6 rounded-xl grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-6 hover:border-slate-800 transition-all group"
          >
            <div className="md:col-span-1 text-2xl md:text-3xl font-black text-slate-400 group-hover:text-neon-green/40 transition-colors font-mono">
              {i + 1}
            </div>
            
            <div className="md:col-span-4">
              <h3 className="text-lg font-bold group-hover:text-neon-green transition-colors text-white uppercase tracking-wide font-heading">{token.name}</h3>
              <p className="text-[10px] text-slate-300 font-mono uppercase tracking-widest truncate">{token.symbol} • {token.address}</p>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div>
                <p className="text-[9px] text-slate-300 uppercase font-bold mb-1 tracking-wider font-heading">Liquidity</p>
                <p className="text-sm font-bold text-white font-mono">${(token.liquidity / 1000).toFixed(1)}K</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-300 uppercase font-bold mb-1 tracking-wider font-heading">Risk</p>
                <p className={`text-sm font-bold font-mono ${getRiskColor(token.rugRisk)}`}>{(token.rugRisk * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-300 uppercase font-bold mb-1 tracking-wider font-heading">Sentiment</p>
                <p className="text-sm font-bold text-blue-400 font-mono">{(token.sentiment * 100).toFixed(0)}%</p>
              </div>
              <div className="md:text-right">
                <p className="text-[9px] text-slate-300 uppercase font-bold mb-1 tracking-wider font-heading">Score</p>
                <p className="text-xl font-black text-neon-green font-mono">{token.recommendation}</p>
              </div>
            </div>
          </Link>
        ))}
        {isDemoMode && (
          <div className="p-8 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-xl space-y-4 mt-6">
            <p className="text-slate-400 text-xs font-medium">Top Picks are limited to 5 in Demo Mode.</p>
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-2 bg-neon-green text-black px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Unlock All Top Picks <TrendingUp size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
