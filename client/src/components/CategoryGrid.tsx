'use client';
import { CategorySummary } from '@/lib/types';
import { CategoryTile } from './CategoryTile';

interface Props {
  summaries: CategorySummary[];
}

export function CategoryGrid({ summaries }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {summaries.map(s => (
        <CategoryTile key={s.category.id} summary={s} />
      ))}
    </div>
  );
}
