import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Search, ShieldCheck, AlertTriangle, Skull, Loader2, Bell, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';
import { getRiskColor, getRiskLabel } from '../lib/utils';
import { useScannerStore } from '../store';
import socket from '../lib/socket';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// v1.0.2 - Added Price Alerts
export default function CoinChecker() {
  const user = useScannerStore(state => state.user);
  const [address, setAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Alert specific state
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [priceThreshold, setPriceThreshold] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const addAlert = useScannerStore(state => state.addAlert);
  
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    gsap.fromTo(formRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' }
    );
  }, []);

  const handleCheck = async (e?: React.FormEvent, retryAddress?: string) => {
    if (e) e.preventDefault();
    const targetAddress = retryAddress || address;
    if (!targetAddress) return;

    setAddress(''); 
    setIsAnalyzing(true);
    setResult(null);
    setProgress(10);
    setError('');
    setShowAlertForm(false);
    setAlertSuccess(false);

    try {
      setProgress(20);
      const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${targetAddress}`);
      const dexData = await dexResponse.json();
      
      setProgress(60);
      const pair = dexData?.pairs?.[0];
      
      if (!pair) {
        throw new Error('Token not found on DexScreener. Please ensure the address is correct.');
      }

      const liquidity = pair.liquidity?.usd || 0;
      const volume = pair.volume?.h24 || 0;
      const fdv = pair.fdv || 0;
      const price = parseFloat(pair.priceUsd) || 0;
      
      let score = 50; 
      if (liquidity > 50000) score += 10;
      if (liquidity > 200000) score += 15;
      if (volume > 10000) score += 10;
      if (fdv > 1000000) score += 10;
      
      score = Math.min(95, score);
      
      const rugRisk = 1 - (score / 100);
      const verdict = score > 75 ? 'SAFE' : score > 40 ? 'RISKY' : 'RUG';

      const analysisResult = {
        score,
        rugRisk,
        verdict,
        price,
        tokenAddress: targetAddress,
        tokenName: pair.baseToken?.name || 'Unknown Token',
        checks: [
          { name: "Liquidity Analysis", status: liquidity > 10000, detail: liquidity > 50000 ? "Strong Liquidity" : "Low Liquidity" },
          { name: "Volume Consistency", status: volume > 1000, detail: volume > 10000 ? "High Activity" : "Low Activity" },
          { name: "Market Cap / FDV", status: fdv > 100000, detail: `$${(fdv / 1000).toFixed(1)}k FDV` },
          { name: "Price Tracking", status: true, detail: `$${price.toFixed(6)}` }
        ]
      };

      setProgress(90);
      setResult(analysisResult);
      setProgress(100);
      setPriceThreshold(price.toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !priceThreshold || !user) return;

    setIsSubmittingAlert(true);
    
    const alertData = {
      tokenAddress: result.tokenAddress,
      tokenName: result.tokenName,
      priceThreshold: parseFloat(priceThreshold),
      condition: alertCondition,
      userId: user.uid,
      createdAt: Date.now(),
      triggered: false
    };

    try {
      // 1. Save to Firestore
      const alertsRef = collection(db, `users/${user.uid}/alerts`);
      const docRef = await addDoc(alertsRef, alertData);

      // 2. Local notification feedback (App.tsx listens to Firestore snapshot anyway)
      // socket.emit('create_alert', { ...alertData, id: docRef.id });

      setIsSubmittingAlert(false);
      setAlertSuccess(true);
      setTimeout(() => setShowAlertForm(false), 2000);
    } catch (err: any) {
      console.error("Error saving alert", err);
      setIsSubmittingAlert(false);
    }
  };

  useEffect(() => {
    if (result) {
      setTimeout(() => {
        gsap.fromTo(resultRef.current, 
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', clearProps: 'all' }
        );
        
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (result.score / 100) * circumference;
        gsap.fromTo(dialRef.current,
          { strokeDashoffset: circumference },
          { strokeDashoffset: offset, duration: 1.5, ease: 'power2.out', clearProps: 'strokeDashoffset' }
        );
      }, 100);
    }
  }, [result]);

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div ref={formRef} className="bg-[#0a0f16] border border-slate-900 p-8 md:p-12 rounded-xl text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-white font-heading">COIN <span className="text-neon-green">CHECKER</span></h2>
          <p className="text-slate-400 text-sm font-medium font-sans">Paste a Solana contract address for a deep-dive security audit.</p>
        </div>
        
        <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Solana Mint Address..."
              className="w-full bg-slate-950 border border-slate-900 rounded-lg py-4 pl-12 pr-4 focus:outline-none focus:border-neon-green transition-all text-white font-mono text-sm placeholder:text-slate-300"
            />
          </div>
          <button
            disabled={isAnalyzing}
            className="bg-neon-green hover:bg-neon-green/90 text-black font-black px-10 py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs font-heading"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : 'ANALYZE'}
          </button>
        </form>

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-xs font-bold uppercase tracking-widest text-red-500">
            <p>{error}</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="space-y-3">
            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
              <div className="h-full bg-neon-green transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] font-mono">
              Running Security Pipeline... {progress}%
            </p>
          </div>
        )}
      </div>

      {result && (
        <div ref={resultRef} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-950" />
                  <circle
                    ref={dialRef}
                    cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeDasharray={2 * Math.PI * 45}
                    className="text-neon-green"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono">{result.score}</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 font-heading">Safety Score</h3>
                <p className="text-slate-500 text-[10px] font-medium font-sans">Overall confidence index</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-[#0a0f16] border border-slate-900 p-8 rounded-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest font-mono">Analysis Result</p>
                  <h3 className="text-3xl font-black text-white font-heading">VERDICT: <span className={getRiskColor(result.rugRisk)}>{result.verdict}</span></h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAlertForm(!showAlertForm)}
                    className="p-3 bg-slate-950 border border-slate-900 rounded-lg hover:border-neon-green transition-all text-slate-400 hover:text-neon-green group"
                  >
                    <Bell size={20} className={showAlertForm ? 'text-neon-green' : ''} />
                  </button>
                  {result.verdict === 'SAFE' ? <ShieldCheck className="text-neon-green" size={40} /> : result.verdict === 'RISKY' ? <AlertTriangle className="text-yellow-500" size={40} /> : <Skull className="text-red-500" size={40} />}
                </div>
              </div>

              {showAlertForm && (
                <div className="p-6 bg-slate-950 rounded-xl border border-neon-green/20 animate-in fade-in slide-in-from-top-2">
                  {!user ? (
                    <div className="text-center py-4 space-y-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connect your identity to set alerts.</p>
                      <p className="text-xs text-slate-400">Login is required to persist radar alerts in production.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSetAlert} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white font-heading">Set Price Alert</h4>
                        <div className="flex bg-[#0a0f16] p-1 rounded-lg border border-slate-900">
                          <button
                            type="button"
                            onClick={() => setAlertCondition('above')}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${alertCondition === 'above' ? 'bg-neon-green text-black' : 'text-slate-500'}`}
                          >
                            <TrendingUp size={12} /> Above
                          </button>
                          <button
                            type="button"
                            onClick={() => setAlertCondition('below')}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${alertCondition === 'below' ? 'bg-red-500 text-white' : 'text-slate-500'}`}
                          >
                            <TrendingDown size={12} /> Below
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 block">Price Threshold (USD)</label>
                          <input
                            type="number"
                            step="0.000000001"
                            value={priceThreshold}
                            onChange={(e) => setPriceThreshold(e.target.value)}
                            className="w-full bg-[#0a0f16] border border-slate-900 rounded-lg py-3 px-4 focus:outline-none focus:border-neon-green transition-all text-white font-mono text-sm"
                          />
                        </div>
                        <button
                          disabled={isSubmittingAlert || alertSuccess}
                          className={`w-full font-black py-4 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-heading ${alertSuccess ? 'bg-neon-green text-black' : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-800'}`}
                        >
                          {isSubmittingAlert ? <Loader2 className="animate-spin" size={16} /> : alertSuccess ? 'ALERT CONFIGURED' : 'ACTIVATE RADAR ALERT'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {result.checks.map((check: any, j: number) => (
                  <div key={j} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${check.status ? 'bg-neon-green' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                      <span className="text-sm font-bold text-slate-200 uppercase tracking-tight font-heading">{check.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-widest">{check.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest font-mono">My Active Radar Alerts</p>
                <h3 className="text-xl font-black text-white font-heading">MONITORING MODULE</h3>
              </div>
            </div>

            <div className="space-y-4">
              {useScannerStore.getState().alerts.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-900 rounded-xl text-center">
                  <p className="text-xs text-slate-500 font-medium">No active alerts. Analyze a coin above to set your first radar alert.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {useScannerStore.getState().alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-900/50 group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded bg-slate-900 ${alert.triggered ? 'text-slate-600' : 'text-neon-green'}`}>
                          <Bell size={14} className={alert.triggered ? '' : 'animate-pulse'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-heading">{alert.tokenName}</span>
                            <span className="text-[10px] font-mono text-slate-500 lowercase">{alert.tokenAddress.substring(0, 6)}...</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {alert.condition === 'above' ? 'Price >' : 'Price <'} ${alert.priceThreshold.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {alert.triggered && (
                          <span className="text-[8px] font-black bg-neon-green/10 text-neon-green px-2 py-0.5 rounded border border-neon-green/20 uppercase tracking-widest">Triggered</span>
                        )}
                        <button 
                          onClick={async () => {
                            if (user) {
                              const { deleteDoc, doc } = await import('firebase/firestore');
                              await deleteDoc(doc(db, `users/${user.uid}/alerts`, alert.id));
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all"
                        >
                          <ShieldAlert size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
