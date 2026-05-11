import { Card, Category, LTO, RecommendationTier, CategorySummary, DiscoverResult } from '../types';
import { CARDS, CATEGORIES, LTOS } from '../data';

const CURRENT_QUARTER = 2; // Q2 2026 (May)
const ASSUMED_ANNUAL_SPEND_PER_CATEGORY = 5000;

function getEffectiveRate(card: Card, categoryId: string, activatedLtoIds: string[]): number {
  const activeLTO = LTOS.find(
    lto => lto.cardId === card.id && lto.categoryId === categoryId && activatedLtoIds.includes(lto.id)
  );
  if (activeLTO) return activeLTO.rate;

  const rotatingRate = card.categoryRates.find(
    r => r.categoryId === categoryId && r.type === 'rotating' && r.activeQuarters?.includes(CURRENT_QUARTER)
  );
  if (rotatingRate) return rotatingRate.rate;

  const permanentRate = card.categoryRates.find(
    r => r.categoryId === categoryId && r.type === 'permanent'
  );
  if (permanentRate) return permanentRate.rate;

  return card.baseRate;
}

function buildReason(card: Card, categoryId: string, rate: number, lto?: LTO): string {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (lto) return `${rate}% LTO at ${lto.merchant} — ${lto.description}`;

  const rotating = card.categoryRates.find(
    r => r.categoryId === categoryId && r.type === 'rotating' && r.activeQuarters?.includes(CURRENT_QUARTER)
  );
  if (rotating) return `${rate}% rotating category — active Q${CURRENT_QUARTER} 2026`;

  const permanent = card.categoryRates.find(r => r.categoryId === categoryId && r.type === 'permanent');
  if (permanent) return `${rate}% permanent bonus on ${category?.name ?? categoryId}`;

  return `${rate}% base rate on all purchases`;
}

export function getCategorySummaries(walletCardIds: string[], activatedLtoIds: string[]): CategorySummary[] {
  const walletCards = CARDS.filter(c => walletCardIds.includes(c.id));
  const nonWalletCards = CARDS.filter(c => !walletCardIds.includes(c.id));

  return CATEGORIES.map(category => {
    let bestWalletCard: Card | null = null;
    let bestWalletRate = 0;

    for (const card of walletCards) {
      const rate = getEffectiveRate(card, category.id, activatedLtoIds);
      if (rate > bestWalletRate) {
        bestWalletRate = rate;
        bestWalletCard = card;
      }
    }

    let bestNonWalletCard: Card | null = null;
    let bestNonWalletRate = 0;

    for (const card of nonWalletCards) {
      const rate = getEffectiveRate(card, category.id, activatedLtoIds);
      if (rate > bestNonWalletRate) {
        bestNonWalletRate = rate;
        bestNonWalletCard = card;
      }
    }

    const alertThreshold = bestWalletRate > 0 ? bestWalletRate * 1.1 : 0;
    const hasOptimizationAlert = bestNonWalletRate > alertThreshold && bestNonWalletRate > bestWalletRate;

    return {
      category,
      bestCardId: bestWalletCard?.id ?? null,
      bestCardName: bestWalletCard?.name ?? null,
      bestCardColor: bestWalletCard?.color ?? null,
      bestIssuer: bestWalletCard?.issuer ?? null,
      bestRate: bestWalletRate,
      hasOptimizationAlert,
      alertCardId: hasOptimizationAlert ? bestNonWalletCard?.id : undefined,
      alertCardName: hasOptimizationAlert ? bestNonWalletCard?.name : undefined,
      alertUpliftPct: hasOptimizationAlert
        ? Math.round(((bestNonWalletRate - bestWalletRate) / Math.max(bestWalletRate, 0.01)) * 100)
        : undefined,
    };
  });
}

export function getCategoryRecommendations(
  categoryId: string,
  walletCardIds: string[],
  activatedLtoIds: string[],
): RecommendationTier[] {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return [];

  const walletCards = CARDS.filter(c => walletCardIds.includes(c.id));
  const nonWalletCards = CARDS.filter(c => !walletCardIds.includes(c.id));
  const tiers: RecommendationTier[] = [];

  const walletRates = walletCards.map(card => {
    const activeLTO = LTOS.find(
      lto => lto.cardId === card.id && lto.categoryId === categoryId && activatedLtoIds.includes(lto.id)
    );
    return { card, effectiveRate: getEffectiveRate(card, categoryId, activatedLtoIds), activeLTO };
  }).sort((a, b) => b.effectiveRate - a.effectiveRate);

  if (walletRates.length > 0) {
    const top = walletRates[0];
    tiers.push({
      tier: 1,
      cardId: top.card.id,
      cardName: top.card.name,
      issuer: top.card.issuer,
      cardColor: top.card.color,
      effectiveRate: top.effectiveRate,
      reason: buildReason(top.card, categoryId, top.effectiveRate, top.activeLTO),
      ltoId: top.activeLTO?.id,
      ltoMerchant: top.activeLTO?.merchant,
      inWallet: true,
    });
  }

  const ltoDeals = LTOS.filter(
    lto =>
      lto.categoryId === categoryId &&
      activatedLtoIds.includes(lto.id) &&
      walletCardIds.includes(lto.cardId) &&
      lto.cardId !== tiers[0]?.cardId
  ).slice(0, 2);

  for (const lto of ltoDeals) {
    const card = CARDS.find(c => c.id === lto.cardId);
    if (!card) continue;
    tiers.push({
      tier: 2,
      cardId: card.id,
      cardName: card.name,
      issuer: card.issuer,
      cardColor: card.color,
      effectiveRate: lto.rate,
      reason: `${lto.rate}% LTO at ${lto.merchant} — ${lto.description}`,
      ltoId: lto.id,
      ltoMerchant: lto.merchant,
      inWallet: true,
    });
  }

  const walletBestRate = walletRates[0]?.effectiveRate ?? 0;
  const tier3 = nonWalletCards
    .map(card => ({ card, effectiveRate: getEffectiveRate(card, categoryId, activatedLtoIds) }))
    .sort((a, b) => b.effectiveRate - a.effectiveRate)
    .find(r => r.effectiveRate > walletBestRate * 1.1);

  if (tier3) {
    const annualUplift = Math.round(((tier3.effectiveRate - walletBestRate) / 100) * ASSUMED_ANNUAL_SPEND_PER_CATEGORY);
    tiers.push({
      tier: 3,
      cardId: tier3.card.id,
      cardName: tier3.card.name,
      issuer: tier3.card.issuer,
      cardColor: tier3.card.color,
      effectiveRate: tier3.effectiveRate,
      reason: `Not in wallet — adding this card could earn ~$${annualUplift}/yr more in ${category.name}`,
      inWallet: false,
      annualUplift,
    });
  }

  return tiers;
}

export function getDiscoverRecommendations(
  walletCardIds: string[],
  activatedLtoIds: string[],
  mode: 'purist' | 'deal-hunter' | 'hybrid',
): DiscoverResult[] {
  const nonWalletCards = CARDS.filter(c => !walletCardIds.includes(c.id));

  const results = nonWalletCards.map(card => {
    const categoryUplifts = CATEGORIES.map(cat => {
      const newRate = getEffectiveRate(card, cat.id, activatedLtoIds);
      const walletBest = Math.max(
        0,
        ...CARDS.filter(c => walletCardIds.includes(c.id)).map(c => getEffectiveRate(c, cat.id, activatedLtoIds))
      );
      return { categoryId: cat.id, categoryName: cat.name, uplift: Math.max(0, newRate - walletBest) };
    }).filter(u => u.uplift > 0);

    const annualEstimatedUplift = categoryUplifts.reduce(
      (sum, u) => sum + Math.round((u.uplift / 100) * ASSUMED_ANNUAL_SPEND_PER_CATEGORY),
      0
    );

    const score =
      mode === 'purist'
        ? annualEstimatedUplift
        : mode === 'deal-hunter'
        ? card.signupBonus + annualEstimatedUplift * 0.5
        : annualEstimatedUplift * 0.7 + card.signupBonus * 0.3;

    return { card, categoryUplifts, annualEstimatedUplift, score, isPromotedSlot: false };
  });

  const sorted = [...results].sort((a, b) => b.score - a.score);

  if (mode === 'hybrid' && sorted.length > 0) {
    const topUplift = sorted[0].annualEstimatedUplift;
    for (const r of sorted) {
      if (r.card.isPromoted && r.card.id !== sorted[0].card.id) {
        r.isPromotedSlot = r.annualEstimatedUplift >= topUplift * 0.95;
      }
    }
  }

  return sorted;
}

export function getStats(walletCardIds: string[], activatedLtoIds: string[]) {
  const summaries = getCategorySummaries(walletCardIds, activatedLtoIds);
  const totalAnnualValue = summaries.reduce(
    (sum, s) => sum + Math.round((s.bestRate / 100) * ASSUMED_ANNUAL_SPEND_PER_CATEGORY),
    0
  );
  return {
    totalAnnualValue,
    categoriesOptimized: summaries.filter(s => !s.hasOptimizationAlert).length,
    categoriesWithAlerts: summaries.filter(s => s.hasOptimizationAlert).length,
  };
}
