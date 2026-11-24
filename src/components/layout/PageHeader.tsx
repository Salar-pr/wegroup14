import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../utils';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Rendered at the far end (left in RTL) — typically action buttons. */
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

/** Standard page heading used at the top of every feature page. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="مسیر صفحه"
          className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronLeft size={12} aria-hidden="true" className="text-slate-300" />
                )}
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className={cn(isLast && 'font-semibold text-text')}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold leading-8 text-text sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-[13px] leading-6 text-text-muted">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
