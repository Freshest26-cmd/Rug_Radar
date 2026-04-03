import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, TrendingUp, Users, ExternalLink, Twitter, MessageSquare, Loader2, ThumbsUp, Flag, Fingerprint, Lock, Bot, Zap, Network, Wallet, CheckCircle2, Copy, Check } from 'lucide-react';
import { formatCurrency, getRiskColor, getRiskLabel } from '../lib/utils';
import { gsap } from 'gsap';

const COLORS = ['#39ff14', '#bc13fe', '#3b82f6', '#f59e0b'];

export default function TokenDetail() {
  const { address } = useParams();
  const [token, setToken] = useState<any>(null);
  const [vouchCount, setVouchCount] = useState(Math.floor(Math.random() * 100));
  const [flagCount, setFlagCount] = useState(Math.floor(Math.random() * 10));
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Mock Alpha Metrics Data
  const alphaMetrics = {
    devFingerprint: {
      score: 85,
      label: 'Trusted Dev',
      desc: 'Creator has 4 previous successful launches with >3x returns.',
      status: 'positive'
    },
    liquidityStickiness: {
      score: 92,
      label: 'High Stickiness',
      desc: '95% of liquidity is locked in Raydium for 365 days.',
      status: 'positive'
    },
    botDetection: {
      score: 12,
      label: 'Organic Growth',
      desc: 'Only 12% of social engagement matches bot patterns.',
      status: 'positive'
    },
    honeypotSimulation: {
      score: 100,
      label: 'Safe to Sell',
      desc: 'Simulated sell transaction succeeded with 0.3% tax.',
      status: 'positive'
    },
    clusterAnalysis: {
      score: 15,
      label: 'Low Cabal Risk',
      desc: 'Top holders are not linked by initial funding sources.',
      status: 'positive'
    },
    firstInProfitability: {
      score: 78,
      label: 'Smart Money In',
      desc: '65% of the first 50 buyers are high-win rate wallets.',
      status: 'positive'
    }
  };

  const socialPosts = [
    { user: 'SolWhale', text: 'Bullish on this one, liquidity looks solid.', time: '2m ago', type: 'positive' },
    { user: 'RugHunter', text: 'Watch out for top holder concentration.', time: '15m ago', type: 'neutral' },
    { user: 'MemeKing', text: 'To the moon! 🚀🚀🚀', time: '45m ago', type: 'positive' },
  ];

  useEffect(() => {
    fetch(`/api/tokens/${address}`)
      .then(res => res.json())
      .then(data => setToken(data));

    gsap.from('.animate-in', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, [address]);

  if (!token) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-neon-green" size={48} />
    </div>
  );

  const chartData = [
    { time: '10:00', price: 0.0012 },
    { time: '10:05', price: 0.0015 },
    { time: '10:10', price: 0.0013 },
    { time: '10:15', price: 0.0018 },
    { time: '10:20', price: 0.0022 },
    { time: '10:25', price: 0.0021 },
    { time: '10:30', price: 0.0025 },
  ];

  const holderData = [
    { name: 'Top 10', value: 45 },
    { name: 'Top 50', value: 25 },
    { name: 'Others', value: 30 },
  ];

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-8">
      <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl animate-in">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-white uppercase tracking-wide font-heading">{token.name}</h1>
              <span className="px-2 py-1 bg-slate-950 border border-slate-900 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{token.symbol}</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-600 font-mono flex items-center gap-2 uppercase tracking-widest">
                {token.address}
              </p>
              <button 
                onClick={copyAddress}
                className="p-1.5 bg-slate-950 border border-slate-900 rounded hover:border-slate-700 transition-all text-slate-500 hover:text-white"
                title="Copy Address"
              >
                {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
              </button>
              <a href={`https://solscan.io/token/${token.address}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-950 border border-slate-900 rounded hover:border-slate-700 transition-all text-slate-500 hover:text-white">
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-black tracking-[0.2em] text-xs font-heading ${getRiskColor(token.rugRisk).replace('text', 'border').replace('400', '400/30')} ${getRiskColor(token.rugRisk)} bg-slate-950/50`}>
            {getRiskLabel(token.rugRisk)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900/50">
            <p className="text-[10px] text-slate-600 uppercase font-bold mb-1 tracking-wider font-heading">Liquidity</p>
            <p className="text-xl font-bold text-white font-mono">{formatCurrency(token.liquidity)}</p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900/50">
            <p className="text-[10px] text-slate-600 uppercase font-bold mb-1 tracking-wider font-heading">Volume 24h</p>
            <p className="text-xl font-bold text-white font-mono">{formatCurrency(token.volume)}</p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900/50">
            <p className="text-[10px] text-slate-600 uppercase font-bold mb-1 tracking-wider font-heading">Sentiment</p>
            <p className="text-xl font-bold text-blue-400 font-mono">{(token.sentiment * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900/50">
            <p className="text-[10px] text-slate-600 uppercase font-bold mb-1 tracking-wider font-heading">Score</p>
            <p className="text-xl font-black text-neon-green font-mono">{token.recommendation}/100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl animate-in">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 font-heading flex items-center gap-2">
                <Zap size={14} className="text-neon-green" /> Alpha Intelligence
              </h3>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-900">v2.0 Beta</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1: Dev Fingerprinting */}
              <div className="p-5 bg-slate-950/50 rounded-xl border border-slate-900/50 space-y-3 hover:border-neon-green/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green">
                    <Fingerprint size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neon-green uppercase tracking-widest font-heading">{alphaMetrics.devFingerprint.label}</p>
                    <p className="text-lg font-black text-white font-mono">{alphaMetrics.devFingerprint.score}%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide font-heading">Dev Fingerprint</p>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{alphaMetrics.devFingerprint.desc}</p>
                </div>
              </div>

              {/* Feature 2: Liquidity Stickiness */}
              <div className="p-5 bg-slate-950/50 rounded-xl border border-slate-900/50 space-y-3 hover:border-neon-green/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green">
                    <Lock size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neon-green uppercase tracking-widest font-heading">{alphaMetrics.liquidityStickiness.label}</p>
                    <p className="text-lg font-black text-white font-mono">{alphaMetrics.liquidityStickiness.score}%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide font-heading">Liquidity Stickiness</p>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{alphaMetrics.liquidityStickiness.desc}</p>
                </div>
              </div>

              {/* Feature 3: Bot Detection */}
              <div className="p-5 bg-slate-950/50 rounded-xl border border-slate-900/50 space-y-3 hover:border-neon-green/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green">
                    <Bot size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neon-green uppercase tracking-widest font-heading">{alphaMetrics.botDetection.label}</p>
                    <p className="text-lg font-black text-white font-mono">{alphaMetrics.botDetection.score}%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide font-heading">Bot-Detection Index</p>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{alphaMetrics.botDetection.desc}</p>
                </div>
              </div>

              {/* Feature 4: Honeypot Simulation */}
              <div className="p-5 bg-slate-950/50 rounded-xl border border-slate-900/50 space-y-3 hover:border-neon-green/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neon-green uppercase tracking-widest font-heading">{alphaMetrics.honeypotSimulation.label}</p>
                    <p className="text-lg font-black text-white font-mono">PASS</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide font-heading">Honeypot Simulation</p>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{alphaMetrics.honeypotSimulation.desc}</p>
                </div>
              </div>

              {/* Feature 5: Cluster Analysis */}
              <div className="p-5 bg-slate-950/50 rounded-xl border border-slate-900/50 space-y-3 hover:border-neon-green/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green">
                    <Network size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neon-green uppercase tracking-widest font-heading">{alphaMetrics.clusterAnalysis.label}</p>
                    <p className="text-lg font-black text-white font-mono">{alphaMetrics.clusterAnalysis.score}%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide font-heading">Cluster Analysis (Cabal)</p>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{alphaMetrics.clusterAnalysis.desc}</p>
                </div>
              </div>

              {/* Feature 6: First-In Profitability */}
              <div className="p-5 bg-slate-950/50 rounded-xl border border-slate-900/50 space-y-3 hover:border-neon-green/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green">
                    <Wallet size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-neon-green uppercase tracking-widest font-heading">{alphaMetrics.firstInProfitability.label}</p>
                    <p className="text-lg font-black text-white font-mono">{alphaMetrics.firstInProfitability.score}%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide font-heading">First-In Profitability</p>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{alphaMetrics.firstInProfitability.desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl h-[400px] animate-in relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2 font-heading">
                <TrendingUp size={14} className="text-neon-green" /> Price Action (5m)
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                <span className="text-[10px] text-neon-green font-bold uppercase tracking-widest font-mono">Live Feed</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0f16', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#39ff14' }}
                />
                <Line type="monotone" dataKey="price" stroke="#39ff14" strokeWidth={3} dot={{ fill: '#39ff14', r: 4 }} activeDot={{ r: 6, stroke: '#39ff14', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl animate-in">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2 font-heading">
                <Users size={14} className="text-blue-400" /> Holder Distribution
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={holderData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {holderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest mt-4 font-mono">
                {holderData.map((h, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-slate-500">{h.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl animate-in">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2 font-heading">
                <Shield size={14} className="text-neon-green" /> Security Audit
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Liquidity Lock', status: 'Verified', color: 'text-neon-green' },
                  { label: 'Mint Authority', status: 'Disabled', color: 'text-neon-green' },
                  { label: 'Top 10 Holders', status: '45% (High)', color: 'text-yellow-500' },
                  { label: 'Honeypot Test', status: 'Passed', color: 'text-neon-green' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-900/50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-heading">{item.label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl animate-in">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-6 font-heading">Market Stats</h3>
            <div className="space-y-6">
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900/50">
                <p className="text-[9px] text-slate-600 uppercase font-bold mb-1 tracking-wider font-heading">Holders</p>
                <p className="text-xl font-bold text-white font-mono">{token.holders}</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900/50">
                <p className="text-[9px] text-slate-600 uppercase font-bold mb-1 tracking-wider font-heading">Market Cap</p>
                <p className="text-xl font-bold text-white font-mono">$1.2M</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900/50">
                <p className="text-[9px] text-slate-600 uppercase font-bold mb-1 tracking-wider font-heading">Total Supply</p>
                <p className="text-xl font-bold text-white font-mono">1.0B</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl animate-in">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-6 font-heading">Social Activity</h3>
            <div className="space-y-4">
              {socialPosts.map((post, i) => (
                <div key={i} className="p-4 bg-slate-950/50 rounded-lg border border-slate-900/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest font-heading">@{post.user}</span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase font-mono">{post.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{post.text}</p>
                </div>
              ))}
              <button className="w-full py-3 border border-slate-900 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-700 transition-all">
                View More on X.com
              </button>
            </div>
          </div>

          <div className="bg-[#0a0f16] border border-slate-900 p-8 rounded-xl animate-in">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 mb-6 font-heading">Community Feedback</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setVouchCount(vouchCount + 1)}
                className="flex flex-col items-center justify-center p-6 bg-neon-green/5 border border-neon-green/20 rounded-xl hover:bg-neon-green/10 transition-all group"
              >
                <ThumbsUp className="text-neon-green mb-2 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-xl font-black text-white font-mono">{vouchCount}</span>
                <span className="text-[9px] text-neon-green font-bold uppercase tracking-widest mt-1">Vouches</span>
              </button>
              <button 
                onClick={() => setFlagCount(flagCount + 1)}
                className="flex flex-col items-center justify-center p-6 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all group"
              >
                <Flag className="text-red-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-xl font-black text-white font-mono">{flagCount}</span>
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">Flags</span>
              </button>
            </div>
            <p className="text-[9px] text-slate-600 text-center mt-4 font-sans italic">
              Community feedback is weighted by account age and SOL balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
