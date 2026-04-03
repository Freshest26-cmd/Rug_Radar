import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Check, Zap, Shield, Crown, ArrowRight } from 'lucide-react';
import { useScannerStore } from '../store';
import { useNavigate } from 'react-router-dom';

const PlanCard = ({ 
  plan, 
  price, 
  features, 
  icon: Icon, 
  color, 
  isCurrent, 
  onSelect,
  index 
}: { 
  plan: string, 
  price: string, 
  features: string[], 
  icon: any, 
  color: 'slate' | 'neon-green' | 'neon-purple', 
  isCurrent: boolean,
  onSelect: () => void,
  index: number
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const colorClasses = {
    slate: {
      border: 'border-slate-500/50',
      bg: 'bg-slate-500',
      text: 'text-slate-500',
      bgLight: 'bg-slate-500/10',
      bgMuted: 'bg-slate-500/20',
      shadow: 'shadow-[0_0_40px_rgba(100,116,139,0.1)]',
      btnShadow: 'shadow-[0_0_20px_rgba(100,116,139,0.3)]'
    },
    'neon-green': {
      border: 'border-neon-green/50',
      bg: 'bg-neon-green',
      text: 'text-neon-green',
      bgLight: 'bg-neon-green/10',
      bgMuted: 'bg-neon-green/20',
      shadow: 'shadow-[0_0_40px_rgba(57,255,20,0.1)]',
      btnShadow: 'shadow-[0_0_20px_rgba(57,255,20,0.3)]'
    },
    'neon-purple': {
      border: 'border-neon-purple/50',
      bg: 'bg-neon-purple',
      text: 'text-neon-purple',
      bgLight: 'bg-neon-purple/10',
      bgMuted: 'bg-neon-purple/20',
      shadow: 'shadow-[0_0_40px_rgba(188,19,254,0.1)]',
      btnShadow: 'shadow-[0_0_20px_rgba(188,19,254,0.3)]'
    }
  };

  const styles = colorClasses[color];

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2 + index * 0.1, ease: 'power3.out' }
    );
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full ${
        isCurrent 
          ? `bg-slate-900/50 ${styles.border} ${styles.shadow}` 
          : 'bg-[#0a0f16] border-slate-900 hover:border-slate-800'
      }`}
    >
      {isCurrent && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full ${styles.bg} text-black text-[10px] font-black uppercase tracking-widest`}>
          Current Plan
        </div>
      )}

      <div className="mb-8">
        <div className={`w-12 h-12 rounded-xl ${styles.bgLight} flex items-center justify-center mb-6`}>
          <Icon className={styles.text} size={24} />
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-wide font-heading mb-2">{plan}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white font-mono">{price}</span>
          {price !== 'Free' && <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">/mo</span>}
        </div>
      </div>

      <ul className="space-y-4 mb-10 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={`mt-1 p-0.5 rounded-full ${styles.bgMuted}`}>
              <Check className={styles.text} size={12} />
            </div>
            <span className="text-sm text-slate-300 font-sans leading-tight">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
          isCurrent
            ? 'bg-slate-800 text-slate-500 cursor-default'
            : `${styles.bg} text-black hover:scale-[1.02] active:scale-95 ${styles.btnShadow}`
        }`}
      >
        {isCurrent ? 'Active' : 'Select Plan'} {!isCurrent && <ArrowRight size={14} />}
      </button>
    </div>
  );
};

export default function Pricing() {
  const { userPlan, setUserPlan } = useScannerStore();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo('.pricing-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  const plans: {
    id: 'free' | 'pro' | 'whale',
    plan: string,
    price: string,
    icon: any,
    color: 'slate' | 'neon-green' | 'neon-purple',
    features: string[]
  }[] = [
    {
      id: 'free',
      plan: 'Free',
      price: 'Free',
      icon: Shield,
      color: 'slate',
      features: [
        'Limited to 10 tokens in live feed',
        'Basic rug detection metrics',
        'Compare up to 2 tokens',
        'Community support'
      ]
    },
    {
      id: 'pro',
      plan: 'Pro Scanner',
      price: '$49',
      icon: Zap,
      color: 'neon-green',
      features: [
        'Unlimited live token feed',
        'Advanced ML risk scoring',
        'Compare up to 5 tokens',
        'Priority on-chain alerts',
        'Dev wallet fingerprinting'
      ]
    },
    {
      id: 'whale',
      plan: 'Whale Alpha',
      price: '$199',
      icon: Crown,
      color: 'neon-purple',
      features: [
        'Everything in Pro',
        'Private Alpha Discord access',
        'Custom webhook notifications',
        'Early access to new features',
        '1-on-1 strategy consulting',
        'Unlimited comparisons'
      ]
    }
  ];

  const handleSelectPlan = (planId: any) => {
    setUserPlan(planId);
    navigate('/');
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto py-12 space-y-16">
      <header className="text-center space-y-6 pricing-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <Crown size={14} className="text-yellow-500" />
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] font-mono">Premium Intelligence</span>
        </div>
        <h1 className="text-6xl font-black tracking-wide text-white font-heading leading-none">
          CHOOSE YOUR <br />
          <span className="text-neon-green">EDGE.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-sans">
          Upgrade your intelligence. Get real-time alerts, advanced metrics, and unlimited access to the Solana memecoin landscape.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            {...plan}
            index={i}
            isCurrent={userPlan === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}
      </div>

      <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-12 text-center space-y-6 reveal-text">
        <h2 className="text-3xl font-black text-white uppercase tracking-wide font-heading">Enterprise Solutions</h2>
        <p className="text-slate-400 max-w-xl mx-auto font-sans">
          Need custom API access, white-label solutions, or institutional-grade data feeds? Contact our team for a tailored package.
        </p>
        <button className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
          Contact Sales
        </button>
      </div>
    </div>
  );
}
