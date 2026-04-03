import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useScannerStore } from '../store';
import { Link } from 'react-router-dom';
import { formatCurrency, getRiskColor, getRiskLabel } from '../lib/utils';
import { Shield, Zap, Users, BarChart3, TrendingUp, Plus, ArrowRight, Copy, Check, Filter, Search as SearchIcon, ShieldAlert, Key, Trash2, RefreshCw, Terminal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';

const ApiKeysSection = () => {
  const apiKeys = useScannerStore(state => state.apiKeys);
  const setApiKeys = useScannerStore(state => state.setApiKeys);
  const addApiKey = useScannerStore(state => state.addApiKey);
  const revokeApiKey = useScannerStore(state => state.revokeApiKey);
  
  const [newKeyName, setNewKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRawKey, setShowRawKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/keys')
      .then(res => res.json())
      .then(data => setApiKeys(data));
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'Default Key' })
      });
      const data = await res.json();
      addApiKey(data);
      setShowRawKey(data.key);
      setNewKeyName('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    revokeApiKey(id);
  };

  return (
    <div className="space-y-8 hero-anim">
      <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white font-heading uppercase tracking-tight">API Access Control</h3>
            <p className="text-slate-400 text-sm font-sans">Generate secure keys to access the Rug Radar Scanner API programmatically.</p>
          </div>
          <Key className="text-neon-green" size={32} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Key Name (e.g. Trading Bot)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-neon-green"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-neon-green text-black px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? 'Generating...' : 'Generate New Key'}
          </button>
        </div>

        {showRawKey && (
          <div className="bg-neon-green/10 border border-neon-green/30 p-4 rounded-lg space-y-3 animate-pulse">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-neon-green uppercase tracking-widest">New Key Generated (Copy now, it won't be shown again!)</p>
              <button onClick={() => setShowRawKey(null)} className="text-neon-green hover:text-white"><Plus className="rotate-45" size={14} /></button>
            </div>
            <div className="flex items-center gap-3 bg-black/40 p-3 rounded border border-neon-green/20">
              <code className="text-neon-green font-mono text-sm flex-1 break-all">{showRawKey}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(showRawKey)}
                className="p-2 hover:bg-neon-green/20 rounded transition-colors text-neon-green"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Terminal size={14} className="text-slate-500" />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] font-mono">Active API Keys</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {apiKeys.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-900 rounded-xl">
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">No API keys generated yet</p>
            </div>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className={`bg-[#0a0f16] border p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6 transition-all ${key.revoked ? 'opacity-50 border-slate-900' : 'border-slate-800 hover:border-slate-700'}`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-white font-heading uppercase tracking-wide">{key.name}</h4>
                    {key.revoked && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">Revoked</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1"><Plus size={10} /> Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><RefreshCw size={10} /> Last Used: {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-900 inline-block">
                    <code className="text-xs text-slate-400 font-mono">{key.key}</code>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4 min-w-[150px]">
                  <div className="text-right space-y-1 w-full">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest font-heading mb-1">
                      <span className="text-slate-500">Usage</span>
                      <span className="text-neon-green">{key.usage} / {key.limit}</span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-green" style={{ width: `${(key.usage / key.limit) * 100}%` }} />
                    </div>
                  </div>
                  
                  {!key.revoked && (
                    <button 
                      onClick={() => handleRevoke(key.id)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      <Trash2 size={12} /> Revoke Key
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-900 p-6 rounded-xl space-y-4">
        <h4 className="text-xs font-black text-white uppercase tracking-widest font-heading flex items-center gap-2">
          <Terminal size={14} className="text-neon-green" /> Implementation Guide
        </h4>
        <div className="space-y-3">
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">Include your key in the <code className="text-neon-green">Authorization</code> header of your requests:</p>
          <div className="bg-black/50 p-4 rounded border border-slate-800">
            <code className="text-[10px] text-slate-300 font-mono block">
              curl -X GET "https://api.rugradar.ai/v1/tokens" \<br />
              &nbsp;&nbsp;-H "Authorization: Bearer rug_your_key_here"
            </code>
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">For WebSockets, pass the key in the <code className="text-neon-green">auth.token</code> field during handshake.</p>
        </div>
      </div>
    </div>
  );
};

const TokenCard = ({ token, index }: { token: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const addToComparison = useScannerStore(state => state.addToComparison);
  const comparisonList = useScannerStore(state => state.comparisonList);
  const isComparing = comparisonList.some(t => t.id === token.id);

  useEffect(() => {
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, delay: index * 0.05, ease: 'power2.out' }
    );
  }, []);

  const copyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = token.recommendation > 60 ? '#39ff14' : token.recommendation > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div ref={cardRef} className="relative group">
      <Link to={`/token/${token.address}`} className="bg-[#0a0f16] border border-slate-900 p-6 rounded-xl hover:border-slate-800 transition-all block relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-wide font-heading truncate">{token.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest truncate">{token.symbol} • {token.address}</p>
              <button 
                onClick={copyAddress}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white"
                title="Copy Address"
              >
                {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
          <div className={`px-3 py-1 rounded text-[10px] font-black tracking-widest border shrink-0 ml-4 ${getRiskColor(token.rugRisk).replace('text', 'border').replace('400', '400/30')} ${getRiskColor(token.rugRisk)} bg-slate-950/50`}>
            {getRiskLabel(token.rugRisk)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-900/50">
            <p className="text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider font-heading">Liquidity</p>
            <p className="text-sm font-bold text-white font-mono">${(token.liquidity / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-900/50">
            <p className="text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider font-heading">Volume 24h</p>
            <p className="text-sm font-bold text-white font-mono">${(token.volume / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-900/50">
            <p className="text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider font-heading">Sentiment</p>
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-blue-400" />
              <p className="text-sm font-bold text-white font-mono">{(token.sentiment * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-heading">Score</p>
            <p className="text-[10px] font-bold font-mono" style={{ color: scoreColor }}>{token.recommendation}/100</p>
          </div>
          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out" 
              style={{ 
                width: `${token.recommendation}%`,
                background: `linear-gradient(to right, #ef4444, #f59e0b, #39ff14)`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'left'
              }} 
            />
          </div>
        </div>
      </Link>
      <button 
        onClick={(e) => {
          e.preventDefault();
          addToComparison(token);
        }}
        className={`absolute top-4 right-4 p-2 rounded-lg border transition-all z-10 ${isComparing ? 'bg-neon-green border-neon-green text-black' : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
        title="Add to Comparison"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default function Dashboard() {
  const tokens = useScannerStore(state => state.tokens);
  const setTokens = useScannerStore(state => state.setTokens);
  const comparisonList = useScannerStore(state => state.comparisonList);
  const isDemoMode = useScannerStore(state => state.isDemoMode);
  const userPlan = useScannerStore(state => state.userPlan);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'api'>('feed');

  useEffect(() => {
    gsap.fromTo('.hero-anim', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out', clearProps: 'all' }
    );

    // Fetch initial tokens if store is empty
    if (tokens.length === 0) {
      fetch('/api/tokens')
        .then(res => res.json())
        .then(data => {
          setTokens(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(search.toLowerCase()) || 
                         token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                         token.address.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'safe') return matchesSearch && token.rugRisk < 0.3;
    if (filter === 'risky') return matchesSearch && token.rugRisk >= 0.3 && token.rugRisk < 0.7;
    if (filter === 'rug') return matchesSearch && token.rugRisk >= 0.7;
    return matchesSearch;
  }).slice(0, isDemoMode ? 10 : 50);

  const marketHealthData = [
    { name: 'Safe', value: 15, color: '#39ff14' },
    { name: 'Risky', value: 6, color: '#f59e0b' },
    { name: 'Rugs', value: 4, color: '#ef4444' },
  ];

  return (
    <div className="space-y-12 max-w-3xl mx-auto pb-24">
      {isDemoMode && (
        <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent border-l-4 border-yellow-500 p-4 rounded-r-xl flex items-center justify-between gap-4 hero-anim">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <ShieldAlert size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wide font-heading">Demo Mode Active</p>
              <p className="text-xs text-slate-400 font-sans">You are viewing a limited feed of 10 tokens. Upgrade to see all live Solana deployments.</p>
            </div>
          </div>
          <Link to="/pricing" className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform whitespace-nowrap">
            Upgrade Now
          </Link>
        </div>
      )}

      <header ref={headerRef} className="text-center space-y-8 py-12">
        <div className="flex flex-col items-center gap-4 hero-anim">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Zap size={14} className="text-neon-green" />
              <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] font-mono">Solana Memecoin Intelligence</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest font-mono ${
              userPlan === 'whale' ? 'bg-neon-purple/10 border-neon-purple/20 text-neon-purple' :
              userPlan === 'pro' ? 'bg-neon-green/10 border-neon-green/20 text-neon-green' :
              'bg-slate-500/10 border-slate-500/20 text-slate-500'
            }`}>
              {userPlan}
            </div>
          </div>
          {isDemoMode && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Shield size={10} className="text-yellow-500" />
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest font-mono">Demo Mode: Limited to 10 Tokens</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4 hero-anim">
          <h1 className="text-6xl font-black tracking-wide text-white leading-none font-heading">
            Don't get <br />
            <span className="text-neon-green">rugged.</span>
          </h1>
          <p className="text-slate-200 text-lg max-w-md mx-auto leading-relaxed font-sans">
            Real-time rug detection, ML-powered risk scoring, and sentiment analysis for every new Solana token.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 hero-anim">
          <div className="grid grid-cols-2 border border-slate-900 rounded-xl overflow-hidden">
            <div className="p-6 border-r border-b border-slate-900 bg-[#0a0f16]/30">
              <p className="text-2xl font-bold text-neon-green mb-1 font-mono">24</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest font-heading">Scanned</p>
            </div>
            <div className="p-6 border-b border-slate-900 bg-[#0a0f16]/30">
              <p className="text-2xl font-bold text-red-500 mb-1 font-mono">4</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest font-heading">Rugs Found</p>
            </div>
            <div className="p-6 border-r border-slate-900 bg-[#0a0f16]/30">
              <p className="text-2xl font-bold text-neon-green mb-1 font-mono">15</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest font-heading">Safe Tokens</p>
            </div>
            <div className="p-6 bg-[#0a0f16]/30">
              <p className="text-2xl font-bold text-yellow-500 mb-1 font-mono">60</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest font-heading">Avg Score</p>
            </div>
          </div>

          <div className="bg-[#0a0f16]/30 border border-slate-900 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 left-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-heading">Market Health</p>
            </div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {marketHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip 
                    contentStyle={{ backgroundColor: '#0a0f16', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2">
              {marketHealthData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {comparisonList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-neon-green text-black px-6 py-3 rounded-full font-black flex items-center gap-4 shadow-[0_0_30px_rgba(57,255,20,0.3)] animate-bounce">
          <span className="text-xs font-heading tracking-widest uppercase">{comparisonList.length} Tokens Selected</span>
          <Link to="/compare" className="bg-black text-neon-green px-4 py-1.5 rounded-full text-[10px] flex items-center gap-2 hover:scale-105 transition-transform">
            COMPARE NOW <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 hero-anim max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'feed' ? 'bg-neon-green text-black' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Zap size={12} /> Live Feed
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'api' ? 'bg-neon-green text-black' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Key size={12} /> API Keys
        </button>
      </div>

      {activeTab === 'feed' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] font-mono">// Live Token Feed</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] font-mono">{filteredTokens.length} of {tokens.length} Tokens</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Search tokens..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg py-2 pl-9 pr-4 text-xs font-mono focus:outline-none focus:border-neon-green transition-all"
                />
              </div>
              
              <div className="flex bg-slate-950 border border-slate-900 rounded-lg p-1">
                {['all', 'safe', 'risky', 'rug'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-neon-green text-black' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="py-20 text-center bg-[#0a0f16] border border-slate-900 rounded-xl space-y-4">
                <div className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Initializing Neural Scanner...</p>
              </div>
            ) : (
              <>
                {filteredTokens.map((token, i) => (
                  <TokenCard key={token.id} token={token} index={i} />
                ))}
                {isDemoMode && tokens.length >= 10 && (
                  <div className="p-8 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-xl space-y-4">
                    <p className="text-slate-400 text-xs font-medium">You've reached the Demo Mode limit of 10 tokens.</p>
                    <Link 
                      to="/pricing" 
                      className="inline-flex items-center gap-2 bg-neon-green text-black px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Upgrade to Pro for Full Feed <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
                {filteredTokens.length === 0 && (
                  <div className="py-20 text-center bg-[#0a0f16] border border-slate-900 rounded-xl">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">No tokens match your criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <ApiKeysSection />
      )}
    </div>
  );
}
