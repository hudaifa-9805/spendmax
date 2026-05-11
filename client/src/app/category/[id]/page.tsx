'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/components/WalletContext';
import { fetchCategoryRecommendations, fetchLTOs } from '@/lib/api';
import { RecommendationTier, LTO, Category } from '@/lib/types';

const TIER_META = {
  1: { label: 'Best Match', border: 'border-blue-500', bg: 'bg-blue-500/10', badge: 'bg-blue-500' },
  2: { label: 'LTO Special', border: 'border-orange-400', bg: 'bg-orange-400/10', badge: 'bg-orange-400' },
  3: { label: 'Consider Adding', border: 'border-purple-500', bg: 'bg-purple-500/10', badge: 'bg-purple-500' },
};

export default function CategoryPage() {
  const { id } = useParams() as { id: string };
  const { walletIds, activatedLtoIds, toggleLto } = useWallet();
  const [category, setCategory] = useState<Category | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationTier[]>([]);
  const [ltos, setLtos] = useState<LTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCategoryRecommendations(id, walletIds, activatedLtoIds),
      fetchLTOs(),
    ]).then(([data, allLtos]) => {
      setCategory(data.category);
      setRecommendations(data.recommendations);
      setLtos(allLtos.filter(l => l.categoryId === id));
      setLoading(false);
    });
  }, [id, walletIds, activatedLtoIds]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-48 bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-400 mb-4">Category not found</div>
        <Link href="/" className="text-blue-400 hover:underline text-sm">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Dashboard</Link>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-5xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">{category.name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Multi-tier recommendation breakdown</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">💳</div>
          <div className="text-slate-300 font-medium mb-2">No recommendations yet</div>
          <div className="text-slate-500 text-sm mb-4">Add cards to your wallet to get personalized suggestions</div>
          <Link href="/wallet" className="text-blue-400 hover:underline text-sm">Add cards →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(rec => {
            const meta = TIER_META[rec.tier];
            return (
              <div key={`${rec.tier}-${rec.cardId}`} className={`rounded-2xl border p-5 ${meta.border} ${meta.bg}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>
                      Tier {rec.tier} — {meta.label}
                    </span>
                    {!rec.inWallet && (
                      <span className="text-xs text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                        Not in wallet
                      </span>
                    )}
                    {rec.ltoMerchant && (
                      <span className="text-xs text-orange-300 bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-full">
                        🎯 {rec.ltoMerchant}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-white">{rec.effectiveRate}%</div>
                    {rec.annualUplift && (
                      <div className="text-xs text-green-400 font-medium">+${rec.annualUplift}/yr</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-6 rounded-md shrink-0" style={{ backgroundColor: rec.cardColor }} />
                  <div>
                    <div className="text-white font-semibold">{rec.issuer} {rec.cardName}</div>
                    <div className="text-slate-400 text-sm mt-0.5">{rec.reason}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ltos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Limited-Time Offers in This Category</h2>
          <div className="space-y-3">
            {ltos.map(lto => {
              const isActivated = activatedLtoIds.includes(lto.id);
              const expires = new Date(lto.endDate);
              const isExpired = expires < new Date();
              const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400000));

              return (
                <div
                  key={lto.id}
                  className={`bg-slate-800 border rounded-2xl p-4 flex items-center justify-between gap-4 ${
                    isExpired ? 'opacity-40 border-slate-800' : isActivated ? 'border-green-500/50' : 'border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{lto.description}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-orange-400 font-bold">{lto.rate}% back</span>
                      <span className="text-slate-500 text-xs">
                        {isExpired ? 'Expired' : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => !isExpired && toggleLto(lto.id)}
                    disabled={isExpired}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                      isActivated
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {isActivated ? '✓ Activated' : 'Activate'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
