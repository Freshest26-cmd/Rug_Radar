import { create } from 'zustand';

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
}

interface ScannerState {
  tokens: Token[];
  comparisonList: Token[];
  userPlan: 'free' | 'pro' | 'whale';
  isDemoMode: boolean;
  apiKeys: { id: string; key: string; name: string; createdAt: string; lastUsed?: string; usage: number; limit: number; revoked: boolean }[];
  addToken: (token: Token) => void;
  setTokens: (tokens: Token[]) => void;
  addToComparison: (token: Token) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  setUserPlan: (plan: 'free' | 'pro' | 'whale') => void;
  setDemoMode: (isDemo: boolean) => void;
  setApiKeys: (keys: any[]) => void;
  addApiKey: (key: any) => void;
  revokeApiKey: (id: string) => void;
}

export const useScannerStore = create<ScannerState>((set) => ({
  tokens: [],
  comparisonList: [],
  userPlan: 'free',
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
  setUserPlan: (plan) => set({ userPlan: plan, isDemoMode: plan === 'free' }),
  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  setApiKeys: (keys) => set({ apiKeys: keys }),
  addApiKey: (key) => set((state) => ({ apiKeys: [key, ...state.apiKeys] })),
  revokeApiKey: (id) => set((state) => ({ 
    apiKeys: state.apiKeys.map(k => k.id === id ? { ...k, revoked: true } : k) 
  })),
}));
