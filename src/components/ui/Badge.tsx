import { type ReactNode } from 'react';
import { cn } from '../../utils';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  /** Show a small colored dot before the label. Default: true */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, { chip: string; dot: string }> = {
  neutral: { chip: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  primary: { chip: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-primary' },
  success: { chip: 'bg-green-50 text-green-800 ring-green-200', dot: 'bg-success' },
  warning: { chip: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-warning' },
  danger: { chip: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-danger' },
  info: { chip: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-info' },
};

export function Badge({ variant = 'neutral', dot = true, children, className }: BadgeProps) {
  const styles = VARIANT_CLASSES[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        styles.chip,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}
