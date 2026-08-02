import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({
  label, value, icon, trend, tone = 'forest',
}: {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  tone?: 'forest' | 'indigo' | 'brass';
}) {
  const toneStyles = {
    forest: 'bg-forest-50 text-forest-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    brass: 'bg-brass-50 text-brass-700',
  }[tone];

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow-tag">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneStyles)}>{icon}</div>
      </div>
      {trend && (
        <div className={cn('mt-3 inline-flex items-center gap-1 text-xs font-medium', trend.positive ? 'text-forest-600' : 'text-red-600')}>
          {trend.positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(trend.value)}% vs last month
        </div>
      )}
    </div>
  );
}
