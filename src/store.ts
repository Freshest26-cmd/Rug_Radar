import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  age: string;
  liquidity: number;
  rugRisk: number;
  sentiment: number;
  recommendation: number;
  volume: number;
  holders: number;
  price?: number;
}

interface PriceAlert {
  id: string;
  tokenAddress: string;
  tokenName: string;
  priceThreshold: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered?: boolean;
}

interface ScannerState {
  tokens: Token[];
  comparisonList: Token[];
  alerts: PriceAlert[];
  notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; createdAt: number }[];
  userPlan: 'free' | 'pro' | 'whale';
  user: FirebaseUser | null;
  isDemoMode: boolean;
  apiKeys: { id: string; key: string; name: string; createdAt: string; lastUsed?: string; usage: number; limit: number; revoked: boolean }[];
  addToken: (token: Token) => void;
  setTokens: (tokens: Token[]) => void;
  addToComparison: (token: Token) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  addAlert: (alert: PriceAlert) => void;
  setAlerts: (alerts: PriceAlert[]) => void;
  removeAlert: (id: string) => void;
  addNotification: (notification: { message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
  removeNotification: (id: string) => void;
  setUserPlan: (plan: 'free' | 'pro' | 'whale') => void;
  setUser: (user: FirebaseUser | null) => void;
  setDemoMode: (isDemo: boolean) => void;
  setApiKeys: (keys: any[]) => void;
  addApiKey: (key: any) => void;
  revokeApiKey: (id: string) => void;
}

export const useScannerStore = create<ScannerState>((set) => ({
  tokens: [],
  comparisonList: [],
  alerts: [],
  notifications: [],
  userPlan: 'free',
  user: null,
  isDemoMode: true,
  apiKeys: [],
  addToken: (token) => set((state) => {
    const limit = state.isDemoMode ? 10 : 50;
    return { tokens: [token, ...state.tokens].slice(0, limit) };
  }),
  setTokens: (tokens) => set((state) => {
    const limit = state.isDemoMode ? 10 : 50;
    return { tokens: tokens.slice(0, limit) };
  }),
  addToComparison: (token) => set((state) => ({ 
    comparisonList: state.comparisonList.find(t => t.id === token.id) 
      ? state.comparisonList 
      : [...state.comparisonList, token].slice(0, state.userPlan === 'free' ? 2 : 5) 
  })),
  removeFromComparison: (id) => set((state) => ({ 
    comparisonList: state.comparisonList.filter(t => t.id !== id) 
  })),
  clearComparison: () => set({ comparisonList: [] }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  setAlerts: (alerts) => set({ alerts }),
  removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter(a => a.id !== id) })),
  addNotification: (n) => set((state) => ({ 
    notifications: [{ ...n, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() }, ...state.notifications].slice(0, 5) 
  })),
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
  setUserPlan: (plan) => set({ userPlan: plan, isDemoMode: plan === 'free' }),
  setUser: (user) => set({ user }),
  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  setApiKeys: (keys) => set({ apiKeys: keys }),
  addApiKey: (key) => set((state) => ({ apiKeys: [key, ...state.apiKeys] })),
  revokeApiKey: (id) => set((state) => ({ 
    apiKeys: state.apiKeys.map(k => k.id === id ? { ...k, revoked: true } : k) 
  })),
}));
