import { Router, Request, Response } from 'express';
import { CARDS, CATEGORIES, LTOS } from '../data';
import {
  getCategorySummaries,
  getCategoryRecommendations,
  getDiscoverRecommendations,
  getStats,
} from '../engine/rules-engine';

const router = Router();

function parseList(param: string | undefined): string[] {
  if (!param) return [];
  return param.split(',').filter(Boolean);
}

function parseMode(param: string | undefined): 'purist' | 'deal-hunter' | 'hybrid' {
  if (param === 'purist' || param === 'deal-hunter') return param;
  return 'hybrid';
}

router.get('/cards', (_req: Request, res: Response) => {
  res.json({ cards: CARDS });
});

router.get('/categories', (req: Request, res: Response) => {
  const walletIds = parseList(req.query.walletIds as string);
  const ltoIds = parseList(req.query.activatedLtoIds as string);
  res.json({ categories: getCategorySummaries(walletIds, ltoIds) });
});

router.get('/category/:id/recommendations', (req: Request, res: Response) => {
  const { id } = req.params;
  const walletIds = parseList(req.query.walletIds as string);
  const ltoIds = parseList(req.query.activatedLtoIds as string);
  const category = CATEGORIES.find(c => c.id === id);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json({ category, recommendations: getCategoryRecommendations(id, walletIds, ltoIds) });
});

router.get('/ltos', (_req: Request, res: Response) => {
  res.json({ ltos: LTOS });
});

router.get('/discover', (req: Request, res: Response) => {
  const walletIds = parseList(req.query.walletIds as string);
  const ltoIds = parseList(req.query.activatedLtoIds as string);
  const mode = parseMode(req.query.mode as string);
  res.json({ results: getDiscoverRecommendations(walletIds, ltoIds, mode) });
});

router.get('/stats', (req: Request, res: Response) => {
  const walletIds = parseList(req.query.walletIds as string);
  const ltoIds = parseList(req.query.activatedLtoIds as string);
  res.json(getStats(walletIds, ltoIds));
});

export default router;
