import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../utils';

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Clean, border-framed SaaS surface card adhering strictly to the global
 * design system (`rounded-card` = 14px, `border-border`, `bg-surface`, `shadow-card`).
 */
export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card',
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-blue-50 text-primary">
              <Icon size={18} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-bold text-text">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-[12px] text-text-muted">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </header>
      <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
