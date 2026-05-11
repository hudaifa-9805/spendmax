'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryGrid } from '@/components/CategoryGrid';
import { useWallet } from '@/components/WalletContext';
import { fetchCategories, fetchStats } from '@/lib/api';
import { CategorySummary } from '@/lib/types';

interface Stats {
  totalAnnualValue: number;
  categoriesOptimized: number;
  categoriesWithAlerts: number;
}

export default function DashboardPage() {
  const { walletIds, activatedLtoIds } = useWallet();
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([fetchCategories(walletIds, activatedLtoIds), fetchStats(walletIds, activatedLtoIds)])
      .then(([cats, st]) => {
        setSummaries(cats);
        setStats(st);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [walletIds, activatedLtoIds]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-4xl">⚠️</div>
        <div className="text-red-400 font-medium">Cannot connect to API</div>
        <div className="text-slate-500 text-sm">Make sure the server is running on port 3001</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">Your rewards at a glance — Q2 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Est. Annual Rewards</div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-700 rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-green-400">${stats?.totalAnnualValue.toLocaleString()}</div>
          )}
          <div className="text-slate-600 text-xs mt-1">Based on $5k/category/yr</div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Cards in Wallet</div>
          <div className="text-3xl font-bold text-blue-400">{walletIds.length}</div>
          <Link href="/wallet" className="text-slate-500 text-xs mt-1 hover:text-blue-400 transition-colors">
            Manage wallet →
          </Link>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Optimization Alerts</div>
          {loading ? (
            <div className="h-9 w-8 bg-slate-700 rounded animate-pulse" />
          ) : (
            <div className={`text-3xl font-bold ${stats?.categoriesWithAlerts ? 'text-orange-400' : 'text-green-400'}`}>
              {stats?.categoriesWithAlerts ?? 0}
            </div>
          )}
          <div className="text-slate-600 text-xs mt-1">
            {stats?.categoriesWithAlerts ? 'Categories could earn more' : 'Fully optimized'}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Spending Categories</h2>
          <span className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 px-3 py-1 rounded-full">
            Glowing border = uplift available
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 bg-slate-800 rounded-2xl border border-slate-700 animate-pulse" />
            ))}
          </div>
        ) : walletIds.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">💳</div>
            <div className="text-white font-semibold text-lg mb-2">Your wallet is empty</div>
            <div className="text-slate-400 text-sm mb-5">Add your cards to see personalized recommendations</div>
            <Link
              href="/wallet"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors inline-block"
            >
              Add Cards →
            </Link>
          </div>
        ) : (
          <CategoryGrid summaries={summaries} />
        )}
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
        <span className="text-blue-400 text-lg">📅</span>
        <div className="text-sm">
          <span className="text-slate-300 font-medium">Q2 2026 rotating categories active — </span>
          <span className="text-slate-500">
            Chase Freedom Flex: 5% on Groceries & Online Shopping · Discover it: 5% on Dining
          </span>
        </div>
      </div>
    </div>
  );
}
