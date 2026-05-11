export interface Card {
  id: string;
  name: string;
  issuer: string;
  color: string;
  baseRate: number;
  categoryRates: CategoryRate[];
  signupBonus: number;
  annualFee: number;
  affiliateUrl: string;
  isPromoted: boolean;
}

export interface CategoryRate {
  categoryId: string;
  rate: number;
  type: 'permanent' | 'rotating';
  activeQuarters?: number[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface LTO {
  id: string;
  cardId: string;
  merchant: string;
  categoryId: string;
  rate: number;
  startDate: string;
  endDate: string;
  description: string;
}

export interface RecommendationTier {
  tier: 1 | 2 | 3;
  cardId: string;
  cardName: string;
  issuer: string;
  cardColor: string;
  effectiveRate: number;
  reason: string;
  ltoId?: string;
  ltoMerchant?: string;
  annualUplift?: number;
  inWallet: boolean;
}

export interface CategorySummary {
  category: Category;
  bestCardId: string | null;
  bestCardName: string | null;
  bestCardColor: string | null;
  bestIssuer: string | null;
  bestRate: number;
  hasOptimizationAlert: boolean;
  alertCardId?: string;
  alertCardName?: string;
  alertUpliftPct?: number;
}

export interface DiscoverResult {
  card: Card;
  categoryUplifts: { categoryId: string; categoryName: string; uplift: number }[];
  annualEstimatedUplift: number;
  score: number;
  isPromotedSlot: boolean;
}
