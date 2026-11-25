import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../utils';

export interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  /** Rendered at the inline-end of the header (usually a link or button). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove body padding (e.g. when the body is a full-bleed table). */
  flush?: boolean;
}

/**
 * Consistent surface used by every parent panel section:
 * white card, 14px radius, hairline border, subtle shadow (design system §3).
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  flush = false,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-card border border-border bg-surface shadow-card',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-start gap-2.5">
            {Icon && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-blue-50 text-primary">
                <Icon size={16} aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-[14px] font-bold leading-6 text-text">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-[11px] leading-5 text-text-muted">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}

      <div className={cn('flex-1', flush ? '' : 'p-4 sm:p-5')}>{children}</div>
    </section>
  );
}
