'use client';
import { useEffect, useState } from 'react';
import { useWallet } from '@/components/WalletContext';
import { fetchCards, fetchLTOs } from '@/lib/api';
import { Card, LTO } from '@/lib/types';

export default function WalletPage() {
  const { walletIds, activatedLtoIds, toggleLto, addCard, removeCard } = useWallet();
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [allLTOs, setAllLTOs] = useState<LTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    Promise.all([fetchCards(), fetchLTOs()]).then(([cards, ltos]) => {
      setAllCards(cards);
      setAllLTOs(ltos);
      setLoading(false);
    });
  }, []);

  const handleSyncOffers = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const walletCards = allCards.filter(c => walletIds.includes(c.id));
  const availableCards = allCards.filter(c => !walletIds.includes(c.id));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">My Wallet</h1>

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Your Cards ({walletCards.length})
        </h2>
        {walletCards.length === 0 ? (
          <div className="text-slate-500 text-sm py-4 italic">No cards yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {walletCards.map(card => (
              <div
                key={card.id}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-7 rounded-md shrink-0 shadow"
                    style={{ backgroundColor: card.color }}
                  />
                  <div>
                    <div className="text-white font-medium text-sm">{card.issuer} {card.name}</div>
                    <div className="text-slate-500 text-xs">${card.annualFee}/yr fee · {card.baseRate}% base</div>
                  </div>
                </div>
                <button
                  onClick={() => removeCard(card.id)}
                  className="text-slate-600 hover:text-red-400 text-xs font-medium transition-colors ml-2 shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Sync Offers</h2>
          <button
            onClick={handleSyncOffers}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              syncing
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-slate-600 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {syncing ? '✓ Refreshed' : '↻ Sync Offers'}
          </button>
        </div>

        <div className="space-y-3">
          {allLTOs.map(lto => {
            const card = allCards.find(c => c.id === lto.cardId);
            if (!card) return null;
            const isActivated = activatedLtoIds.includes(lto.id);
            const expires = new Date(lto.endDate);
            const isExpired = expires < new Date();
            const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400000));

            return (
              <div
                key={lto.id}
                className={`bg-slate-800 border rounded-2xl p-4 flex items-center justify-between gap-4 ${
                  isExpired
                    ? 'opacity-40 border-slate-800'
                    : isActivated
                    ? 'border-green-500/40'
                    : 'border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-4 rounded shrink-0" style={{ backgroundColor: card.color }} />
                    <span className="text-white text-sm font-medium">{lto.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-bold text-sm">{lto.rate}% back</span>
                    <span className="text-slate-500 text-xs">
                      {isExpired
                        ? '⚠ Expired'
                        : `Expires ${expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${daysLeft}d left`}
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

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Available Cards ({availableCards.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableCards.map(card => (
            <div
              key={card.id}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-7 rounded-md shrink-0 shadow"
                  style={{ backgroundColor: card.color }}
                />
                <div>
                  <div className="text-slate-300 font-medium text-sm">{card.issuer} {card.name}</div>
                  <div className="text-slate-500 text-xs">
                    ${card.annualFee}/yr · ${card.signupBonus} bonus
                  </div>
                </div>
              </div>
              <button
                onClick={() => addCard(card.id)}
                className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ml-2"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
