'use client';
import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletContext';
import { fetchDiscover } from '@/lib/api';
import { DiscoverResult, RecommendationMode } from '@/lib/types';

const MODES: { value: RecommendationMode; label: string; desc: string; icon: string }[] = [
  { value: 'purist', label: 'The Purist', desc: 'Ranked purely by ROI uplift', icon: '📊' },
  { value: 'hybrid', label: 'The Hybrid', desc: 'Best value + promoted alternatives (default)', icon: '⚖️' },
  { value: 'deal-hunter', label: 'The Deal Hunter', desc: 'Prioritizes sign-up bonuses', icon: '🎯' },
];

export default function DiscoverPage() {
  const { walletIds, activatedLtoIds, mode, setMode, addCard } = useWallet();
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDiscover(walletIds, activatedLtoIds, mode).then(r => {
      setResults(r);
      setLoading(false);
    });
  }, [walletIds, activatedLtoIds, mode]);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white">Card Discovery</h1>
        <p className="text-slate-400 mt-1 text-sm">Cards outside your wallet ranked by estimated annual uplift</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">Recommendation Mode</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                mode === m.value
                  ? 'border-blue-500 bg-blue-500/15 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
              }`}
            >
              <div className="text-xl mb-2">{m.icon}</div>
              <div className={`font-semibold text-sm ${mode === m.value ? 'text-white' : 'text-slate-300'}`}>
                {m.label}
              </div>
              <div className="text-slate-500 text-xs mt-1">{m.desc}</div>
            </button>
          ))}
        </div>
        {mode === 'hybrid' && (
          <div className="mt-3 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
            ⭐ Hybrid mode may show a promoted alternative when it&apos;s within 5% of the top performer
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-800 rounded-2xl border border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <div className="text-white font-semibold text-lg mb-2">Wallet complete!</div>
          <div className="text-slate-400 text-sm">You already hold every card in our database</div>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, rank) => (
            <div
              key={result.card.id}
              className={`bg-slate-800 rounded-2xl border p-5 transition-all ${
                result.isPromotedSlot
                  ? 'border-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
                  : 'border-slate-700'
              }`}
            >
              {result.isPromotedSlot && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-3">
                  <span>⭐</span>
                  <span>Promoted Alternative — within 5% of top performer</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-slate-500 font-mono text-sm w-5">#{rank + 1}</div>
                  <div
                    className="w-12 h-7 rounded-md shrink-0 shadow-inner"
                    style={{ backgroundColor: result.card.color }}
                  />
                  <div>
                    <div className="text-white font-semibold">
                      {result.card.issuer} {result.card.name}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      ${result.card.annualFee}/yr annual fee · ${result.card.signupBonus} signup bonus value
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-green-400 font-bold text-xl">
                    +${result.annualEstimatedUplift.toLocaleString()}/yr
                  </div>
                  <div className="text-slate-500 text-xs">est. uplift</div>
                </div>
              </div>

              {result.categoryUplifts.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.categoryUplifts.map(u => (
                    <span
                      key={u.categoryId}
                      className="text-xs bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full"
                    >
                      +{u.uplift.toFixed(1)}% {u.categoryName}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => addCard(result.card.id)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Add to Wallet
                </button>
                <a
                  href={result.card.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
