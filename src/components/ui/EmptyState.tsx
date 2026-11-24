import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-text-muted">
          <Icon size={26} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-[15px] font-bold text-text">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13px] leading-6 text-text-muted">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
