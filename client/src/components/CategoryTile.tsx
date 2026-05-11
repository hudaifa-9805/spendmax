'use client';
import Link from 'next/link';
import { CategorySummary } from '@/lib/types';

interface Props {
  summary: CategorySummary;
}

export function CategoryTile({ summary }: Props) {
  const { category, bestCardName, bestIssuer, bestCardColor, bestRate, hasOptimizationAlert, alertUpliftPct } = summary;

  return (
    <Link href={`/category/${category.id}`}>
      <div
        className={`relative rounded-2xl p-5 bg-slate-800 border transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-xl ${
          hasOptimizationAlert
            ? 'border-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.35)]'
            : 'border-slate-700 hover:border-slate-500'
        }`}
      >
        {hasOptimizationAlert && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            +{alertUpliftPct}% uplift
          </div>
        )}

        <div className="text-3xl mb-3">{category.icon}</div>
        <div className="text-slate-300 text-sm font-medium mb-3">{category.name}</div>

        {bestCardName ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-4 rounded" style={{ backgroundColor: bestCardColor ?? '#334155' }} />
              <span className="text-xs text-slate-500 truncate">
                {bestIssuer} {bestCardName}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{bestRate}%</div>
          </>
        ) : (
          <div className="text-slate-600 text-sm italic">No card in wallet</div>
        )}
      </div>
    </Link>
  );
}
