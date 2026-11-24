import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '../../utils';

export type StatCardTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone?: StatCardTone;
  /** e.g. { value: '٪۱۲+', direction: 'up', positive: true } */
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    /** true = good (green), false = bad (red). Defaults to direction === 'up'. */
    positive?: boolean;
  };
  hint?: string;
  className?: string;
}

const TONE_CLASSES: Record<StatCardTone, string> = {
  primary: 'bg-blue-50 text-primary',
  success: 'bg-green-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger: 'bg-red-50 text-danger',
  info: 'bg-sky-50 text-info',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'primary',
  trend,
  hint,
  className,
}: StatCardProps) {
  const trendPositive = trend?.positive ?? trend?.direction === 'up';
  const TrendIcon =
    trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-200 hover:shadow-cardHover',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-text-muted">{title}</p>
          <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-text">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-btn',
            TONE_CLASSES[tone],
          )}
        >
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>

      {(trend || hint) && (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-[11px]">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-bold',
                trendPositive ? 'text-success' : 'text-danger',
              )}
            >
              <TrendIcon size={13} aria-hidden="true" />
              {trend.value}
            </span>
          )}
          {hint && <span className="text-text-muted">{hint}</span>}
        </div>
      )}
    </div>
  );
}
