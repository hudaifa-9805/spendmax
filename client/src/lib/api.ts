import { CategorySummary, RecommendationTier, Card, LTO, DiscoverResult, RecommendationMode, Category } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function qs(walletIds: string[], ltoIds: string[], extra?: Record<string, string>): string {
  const p = new URLSearchParams();
  if (walletIds.length) p.set('walletIds', walletIds.join(','));
  if (ltoIds.length) p.set('activatedLtoIds', ltoIds.join(','));
  if (extra) Object.entries(extra).forEach(([k, v]) => p.set(k, v));
  return p.toString();
}

export async function fetchCategories(walletIds: string[], ltoIds: string[]): Promise<CategorySummary[]> {
  const r = await fetch(`${BASE}/categories?${qs(walletIds, ltoIds)}`);
  return (await r.json()).categories;
}

export async function fetchCategoryRecommendations(
  categoryId: string,
  walletIds: string[],
  ltoIds: string[],
): Promise<{ category: Category; recommendations: RecommendationTier[] }> {
  const r = await fetch(`${BASE}/category/${categoryId}/recommendations?${qs(walletIds, ltoIds)}`);
  return r.json();
}

export async function fetchCards(): Promise<Card[]> {
  const r = await fetch(`${BASE}/cards`);
  return (await r.json()).cards;
}

export async function fetchLTOs(): Promise<LTO[]> {
  const r = await fetch(`${BASE}/ltos`);
  return (await r.json()).ltos;
}

export async function fetchDiscover(
  walletIds: string[],
  ltoIds: string[],
  mode: RecommendationMode,
): Promise<DiscoverResult[]> {
  const r = await fetch(`${BASE}/discover?${qs(walletIds, ltoIds, { mode })}`);
  return (await r.json()).results;
}

export async function fetchStats(walletIds: string[], ltoIds: string[]): Promise<{
  totalAnnualValue: number;
  categoriesOptimized: number;
  categoriesWithAlerts: number;
}> {
  const r = await fetch(`${BASE}/stats?${qs(walletIds, ltoIds)}`);
  return r.json();
}
