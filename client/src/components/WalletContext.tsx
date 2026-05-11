'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RecommendationMode } from '@/lib/types';

interface WalletContextType {
  walletIds: string[];
  activatedLtoIds: string[];
  mode: RecommendationMode;
  addCard: (id: string) => void;
  removeCard: (id: string) => void;
  toggleLto: (id: string) => void;
  setMode: (mode: RecommendationMode) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletIds, setWalletIds] = useState<string[]>([]);
  const [activatedLtoIds, setActivatedLtoIds] = useState<string[]>([]);
  const [mode, setModeState] = useState<RecommendationMode>('hybrid');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('spendmax-v2');
    if (raw) {
      const { w, l, m } = JSON.parse(raw);
      setWalletIds(w ?? []);
      setActivatedLtoIds(l ?? []);
      setModeState(m ?? 'hybrid');
    } else {
      setWalletIds(['citi-dc']);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('spendmax-v2', JSON.stringify({ w: walletIds, l: activatedLtoIds, m: mode }));
  }, [walletIds, activatedLtoIds, mode, hydrated]);

  const addCard = (id: string) => setWalletIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  const removeCard = (id: string) => setWalletIds(prev => prev.filter(w => w !== id));
  const toggleLto = (id: string) =>
    setActivatedLtoIds(prev => (prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]));
  const setMode = (m: RecommendationMode) => setModeState(m);

  if (!hydrated) return null;

  return (
    <WalletContext.Provider value={{ walletIds, activatedLtoIds, mode, addCard, removeCard, toggleLto, setMode }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
