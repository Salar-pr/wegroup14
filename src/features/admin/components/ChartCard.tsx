/**
 * Admin feature — consistent chart card shell for dashboard / reports.
 */
import type { ReactNode } from 'react';
import { cn } from '../../../utils';

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, action, children, className }: ChartCardProps) {
  return (
    <section
      className={cn(
        'rounded-card border border-border bg-surface p-5 shadow-card',
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-extrabold text-text">{title}</h2>
          {description && <p className="mt-0.5 text-[12px] text-text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
