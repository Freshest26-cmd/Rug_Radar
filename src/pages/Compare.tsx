import React, { useEffect, useRef } from 'react';
import { useScannerStore } from '../store';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Users, Zap, X, ArrowLeft, BarChart3, Crown } from 'lucide-react';
import { getRiskColor, getRiskLabel } from '../lib/utils';
import { gsap } from 'gsap';

export default function Compare() {
  const comparisonList = useScannerStore(state => state.comparisonList);
  const userPlan = useScannerStore(state => state.userPlan);
  const removeFromComparison = useScannerStore(state => state.removeFromComparison);
  const clearComparison = useScannerStore(state => state.clearComparison);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxComparison = userPlan === 'free' ? 2 : 5;

  useEffect(() => {
    gsap.fromTo('.compare-card', 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.1, 
        duration: 0.6, 
        ease: 'power3.out',
        clearProps: 'all'
      }
    );
  }, [comparisonList.length]);

  if (comparisonList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800">
          <BarChart3 size={48} className="text-slate-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white font-heading uppercase tracking-wide">No Tokens Selected</h2>
          <p className="text-slate-300 font-sans">Add tokens from the dashboard to compare them side-by-side.</p>
        </div>
        <Link to="/" className="bg-neon-green text-black px-8 py-3 rounded-lg font-black font-heading tracking-widest text-xs hover:scale-105 transition-transform">
          GO TO DASHBOARD
        </Link>
      </div>
    );
  }

  const metrics = [
    { label: 'Safety Score', key: 'recommendation', suffix: '/100' },
    { label: 'Rug Risk', key: 'rugRisk', isPercent: true },
    { label: 'Liquidity', key: 'liquidity', isCurrency: true },
    { label: 'Volume 24h', key: 'volume', isCurrency: true },
    { label: 'Sentiment', key: 'sentiment', isPercent: true },
    { label: 'Holders', key: 'holders' },
    { label: 'Dev Fingerprint', key: 'devFingerprint', isPercent: true, isAlpha: true },
    { label: 'Cabal Risk', key: 'cabalRisk', isPercent: true, isAlpha: true },
  ];

  return (
    <div ref={containerRef} className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <Link to="/" className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors mb-4 font-mono">
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          <h1 className="text-5xl font-black tracking-wide text-white font-heading">
            TOKEN <span className="text-neon-green">COMPARISON</span>
          </h1>
          <p className="text-slate-200 font-sans">Side-by-side analysis of your selected Solana assets.</p>
        </div>
        <button 
          onClick={clearComparison}
          className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors font-heading"
        >
          Clear All
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparisonList.map((token) => (
          <div key={token.id} className="compare-card bg-[#0a0f16] border border-slate-900 rounded-xl overflow-hidden relative group">
            <button 
              onClick={() => removeFromComparison(token.id)}
              className="absolute top-4 right-4 p-1.5 bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/30 rounded-lg transition-all z-10"
            >
              <X size={14} />
            </button>

            <div className="p-8 border-b border-slate-900 bg-slate-950/30">
              <div className="space-y-1 mb-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-wide font-heading">{token.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{token.symbol}</p>
              </div>
              <div className={`inline-block px-3 py-1 rounded text-[10px] font-black tracking-widest border ${getRiskColor(token.rugRisk).replace('text', 'border').replace('400', '400/30')} ${getRiskColor(token.rugRisk)} bg-slate-950/50`}>
                {getRiskLabel(token.rugRisk)}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-heading flex items-center gap-1">
                    {metric.label}
                    {metric.isAlpha && <Zap size={8} className="text-neon-green" />}
                  </p>
                  <p className={`text-xl font-black font-mono ${metric.key === 'recommendation' ? 'text-neon-green' : 'text-white'}`}>
                    {metric.isCurrency ? `$${(token[metric.key] / 1000).toFixed(1)}K` : 
                     metric.isPercent ? `${((token[metric.key] || Math.random()) * 100).toFixed(0)}%` : 
                     `${token[metric.key] || 'N/A'}${metric.suffix || ''}`}
                  </p>
                </div>
              ))}
              
              <Link 
                to={`/token/${token.address}`}
                className="block w-full py-4 bg-slate-900 border border-slate-800 rounded-lg text-center text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all mt-4 font-heading"
              >
                View Full Audit
              </Link>
            </div>
          </div>
        ))}
        
        {comparisonList.length < maxComparison && (
          <div className="border-2 border-dashed border-slate-900 rounded-xl flex flex-col items-center justify-center p-12 space-y-4 opacity-50 hover:opacity-100 transition-opacity">
            <div className="p-4 bg-slate-950 rounded-full border border-slate-900">
              <Zap size={24} className="text-slate-500" />
            </div>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center font-heading">
              Add more tokens <br /> to compare ({comparisonList.length}/{maxComparison})
            </p>
            <Link to="/" className="text-[10px] text-neon-green font-bold uppercase tracking-widest hover:underline font-heading">
              Browse Feed
            </Link>
          </div>
        )}
        {userPlan === 'free' && comparisonList.length >= maxComparison && (
          <div className="border-2 border-dashed border-yellow-500/20 bg-yellow-500/5 rounded-xl flex flex-col items-center justify-center p-12 space-y-4">
            <Crown size={24} className="text-yellow-500" />
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest text-center font-heading">
              Limit Reached <br /> (2/2 Tokens)
            </p>
            <Link to="/pricing" className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
              Upgrade for 5+
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
