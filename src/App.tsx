import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, TrendingUp, Info, ShieldAlert, BarChart3, Sun, Moon, Twitter, Send, Github, Crown, LogIn, LogOut, User } from 'lucide-react';
import { gsap } from 'gsap';
import { io } from 'socket.io-client';
import socket from './lib/socket';
import { useScannerStore } from './store';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

// Components
import { NotificationToast } from './components/NotificationToast';

// Pages
import Dashboard from './pages/Dashboard';
import CoinChecker from './pages/CoinChecker';
import Recommendations from './pages/Recommendations';
import TokenDetail from './pages/TokenDetail';
import About from './pages/About';
import Compare from './pages/Compare';
import Pricing from './pages/Pricing';

const Navbar = ({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const comparisonList = useScannerStore(state => state.comparisonList);
  const userPlan = useScannerStore(state => state.userPlan);
  const user = useScannerStore(state => state.user);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/check', label: 'Checker', icon: Search },
    { path: '/recommend', label: 'Top Picks', icon: TrendingUp },
    { path: '/compare', label: `Compare (${comparisonList.length})`, icon: BarChart3 },
    { path: '/pricing', label: userPlan === 'free' ? 'Upgrade' : 'Pricing', icon: Crown },
    { path: '/about', label: 'About', icon: Info },
  ];

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b px-4 md:px-8 py-4 flex items-center justify-between transition-all duration-300 ${darkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-white/90 border-slate-200/60 shadow-sm'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-neon-green shadow-[0_0_8px_#39ff14]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`} />
        <span className={`text-xl font-black tracking-tighter font-accent ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          RUG <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>RADAR</span>
        </span>
      </div>
      <div className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar py-1 mx-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-2 text-xs md:text-sm font-bold transition-colors whitespace-nowrap font-heading tracking-wide ${isActive ? (darkMode ? 'text-white active' : 'text-slate-900 active') : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')}`}
            >
              {item.label}
              <div className={`underline absolute -bottom-5 left-0 h-0.5 ${darkMode ? 'bg-neon-green' : 'bg-emerald-500'} transition-all ${isActive ? 'w-full' : 'w-0'}`} />
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden md:flex">
              <span className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.displayName}</span>
              <span className="text-[8px] font-mono text-slate-500 lowercase">{user.email?.split('@')[0]}</span>
            </div>
            <button 
              onClick={handleLogout}
              className={`p-2 rounded-lg border transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10' : 'bg-white border-slate-200 text-slate-500 hover:text-red-600 shadow-sm'}`}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${darkMode ? 'bg-neon-green border-neon-green/20 text-slate-950 hover:shadow-[0_0_15px_#39ff14]' : 'bg-slate-950 border-slate-800 text-white hover:bg-slate-800 shadow-lg shadow-emerald-500/20'}`}
          >
            <LogIn size={14} />
            <span className="hidden sm:inline uppercase tracking-widest">Connect Identity</span>
          </button>
        )}

        <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border ${
          userPlan === 'whale' ? 'bg-neon-purple/10 border-neon-purple/20 text-neon-purple' :
          userPlan === 'pro' ? 'bg-neon-green/10 border-neon-green/20 text-neon-green' :
          'bg-slate-500/10 border-slate-500/20 text-slate-500'
        }`}>
          <Crown size={10} />
          <span className="text-[9px] font-black uppercase tracking-widest font-mono">{userPlan}</span>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg border transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'}`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
};

const Footer = ({ darkMode }: { darkMode: boolean }) => (
  <footer className={`border-t py-12 px-4 transition-all duration-300 ${darkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200/60'}`}>
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-neon-green' : 'bg-emerald-500'}`} />
        <span className={`text-lg font-black tracking-tighter font-accent ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          RUG <span className="text-slate-500">RADAR</span>
        </span>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        <Link to="/" className={`text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Dashboard</Link>
        <Link to="/check" className={`text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Checker</Link>
        <Link to="/recommend" className={`text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Top Picks</Link>
        <Link to="/pricing" className={`text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Pricing</Link>
        <Link to="/about" className={`text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>About</Link>
      </div>
      
      <div className="flex gap-6">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={`transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <Twitter size={20} />
        </a>
        <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className={`transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <Send size={20} />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={`transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <Github size={20} />
        </a>
      </div>
      
      <p className={`text-[10px] font-bold uppercase tracking-widest font-mono ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 Rug Radar Intelligence
      </p>
    </div>
  </footer>
);

export default function App() {
  const user = useScannerStore(state => state.user);
  const setUser = useScannerStore(state => state.setUser);
  const addToken = useScannerStore(state => state.addToken);
  const addNotification = useScannerStore(state => state.addNotification);
  const setAlerts = useScannerStore(state => state.setAlerts);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribeAuth();
  }, [setUser]);

  useEffect(() => {
    // Firestore Alerts Sync
    if (!user) {
      setAlerts([]);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/alerts`));
    const unsubscribeAlerts = onSnapshot(q, (snapshot) => {
      const syncedAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setAlerts(syncedAlerts);
    });

    return () => unsubscribeAlerts();
  }, [user, setAlerts]);

  useEffect(() => {
    // Shared Socket instance listeners
    socket.on('connect', () => {
      console.log('Connected to Backend (Socket.IO)');
    });

    socket.on('new_token', (token) => {
      addToken(token);
    });

    socket.on('alert_triggered', (data: { alertId: string; address: string; price: string }) => {
      addNotification({
        message: `PRICE ALERT: Token ${data.address.substring(0, 8)}... just hit $${data.price}!`,
        type: 'success'
      });
      // Optionally remove the alert from local store as it was triggered
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Backend');
    });

    return () => {
      socket.off('connect');
      socket.off('new_token');
      socket.off('alert_triggered');
      socket.off('disconnect');
    };
  }, [addToken, addNotification]);

  return (
    <Router>
      <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-[#05080c] text-slate-100' : 'light bg-slate-50 text-slate-900'}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="pt-24 md:pt-32 pb-20 px-4 max-w-7xl mx-auto min-h-[calc(100vh-200px)]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/check" element={<CoinChecker />} />
            <Route path="/recommend" element={<Recommendations />} />
            <Route path="/token/:address" element={<TokenDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </main>
        <NotificationToast />
        <Footer darkMode={darkMode} />
      </div>
    </Router>
  );
}
