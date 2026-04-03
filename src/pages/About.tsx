import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Cpu, Database, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial hidden state explicitly
      gsap.set(['.reveal-text-hero', '.feature-card', '.reveal-text-bottom'], {
        opacity: 0,
        y: 30,
      });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

      // Hero section sequence
      tl.to('.reveal-text-hero', {
        opacity: 1,
        y: 0,
        stagger: 0.15,
      })
      // Feature cards sequence
      .to('.feature-card', {
        opacity: 1,
        y: 0,
        stagger: 0.1,
      }, '-=0.4')
      // Bottom section sequence
      .to('.reveal-text-bottom', {
        opacity: 1,
        y: 0,
      }, '-=0.4');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-24 py-12">
      <section className="text-center space-y-6">
        <h1 className="text-6xl font-black tracking-wide reveal-text-hero font-heading">
          THE <span className="text-neon-green">ENGINE</span> BEHIND THE SCAN
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto reveal-text-hero font-sans">
          SolScan.ai combines high-performance C++ systems with advanced Python analytics to protect your capital in the Solana wild west.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-4 feature-card">
          <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center">
            <Cpu className="text-neon-green" />
          </div>
          <h3 className="text-2xl font-bold font-heading tracking-wide">Low-Latency Core</h3>
          <p className="text-slate-400 leading-relaxed font-sans">
            Our high-performance execution layer is engineered for sub-millisecond on-chain monitoring. It intercepts new contract deployments directly from the Solana RPC stream, performing immediate authority validation before the first trade is even executed.
          </p>
        </div>

        <div className="glass-card p-8 space-y-4 feature-card">
          <div className="w-12 h-12 bg-neon-purple/10 rounded-xl flex items-center justify-center">
            <Zap className="text-neon-purple" />
          </div>
          <h3 className="text-2xl font-bold font-heading tracking-wide">Cognitive Synthesis</h3>
          <p className="text-slate-400 leading-relaxed font-sans">
            The cognitive layer utilizes deep learning models to synthesize social sentiment and market psychology. It identifies "Cabal" signatures and manipulative trading patterns by analyzing thousands of historical failure vectors in real-time.
          </p>
        </div>

        <div className="glass-card p-8 space-y-4 feature-card">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Database className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold font-heading tracking-wide">Distributed Intelligence</h3>
          <p className="text-slate-400 leading-relaxed font-sans">
            A massively parallel processing architecture orchestrates data flow across high-speed caching layers, ensuring that every user receives a synchronized, live-updating view of the memecoin landscape with zero bottlenecking.
          </p>
        </div>

        <div className="glass-card p-8 space-y-4 feature-card">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Shield className="text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold font-heading tracking-wide">Multi-Vector Analysis</h3>
          <p className="text-slate-400 leading-relaxed font-sans">
            Our engine monitors 40+ risk vectors simultaneously, including liquidity depth, holder distribution, and instruction-level honeypot simulations. We don't just scan; we predict the probability of exit liquidity events.
          </p>
        </div>
      </div>

      <section className="glass-card p-12 text-center space-y-12 overflow-hidden relative reveal-text-bottom">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-green/5 to-transparent pointer-events-none" />
        
        <div className="space-y-4 relative z-10 text-center">
          <h2 className="text-4xl font-black font-heading tracking-widest uppercase text-center">PROPRIETARY <span className="text-neon-green">INTELLIGENCE</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-sans text-lg text-center">
            Our core logic is a multi-layered neural network that processes over 150+ data points per second. 
            We don't just calculate numbers; we analyze patterns of behavior.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
          <div className="relative w-64 h-64">
            {/* Animated Neural Core */}
            <div className="absolute inset-0 border-2 border-neon-green/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-4 border border-neon-purple/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute inset-8 border border-blue-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-neon-green/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative">
                <Shield size={64} className="text-neon-green drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
                <div className="absolute -inset-4 border border-neon-green/50 rounded-lg rotate-45 animate-pulse" />
              </div>
            </div>

            {/* Data Nodes */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-neon-green rounded-full shadow-[0_0_10px_#39ff14]"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translate(100px) rotate(-${i * 45}deg)`
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
            {[
              { label: 'HEURISTICS', value: 'ACTIVE' },
              { label: 'NEURAL WEIGHTS', value: 'DYNAMIC' },
              { label: 'PATTERN MATCH', value: '99.8%' },
              { label: 'LATENCY', value: '<2ms' }
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-950/80 border border-slate-900 p-4 rounded-lg">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 font-heading">{stat.label}</p>
                <p className="text-sm font-mono text-white font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em] font-bold">
          [ SYSTEM ARCHITECTURE PROTECTED BY END-TO-END ENCRYPTION ]
        </p>
      </section>
    </div>
  );
}
