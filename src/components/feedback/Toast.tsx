import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';
import { useToast } from '../../hooks';
import type { ToastType } from '../../types';

const TOAST_STYLES: Record<ToastType, { icon: LucideIcon; iconClass: string; bar: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-success', bar: 'bg-success' },
  error: { icon: XCircle, iconClass: 'text-danger', bar: 'bg-danger' },
  info: { icon: Info, iconClass: 'text-info', bar: 'bg-info' },
  warning: { icon: TriangleAlert, iconClass: 'text-warning', bar: 'bg-warning' },
};

/** Renders the live toast queue. Mounted once inside <DashboardLayout> / auth pages. */
export function Toaster() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 end-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2 sm:bottom-6 sm:end-6"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className="animate-toast-in pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-card border border-border bg-surface p-3.5 pe-10 shadow-cardHover"
          >
            <span
              className={cn('absolute inset-y-0 start-0 w-1', style.bar)}
              aria-hidden="true"
            />
            <Icon size={20} className={cn('mt-0.5 shrink-0', style.iconClass)} aria-hidden="true" />
            <div className="min-w-0">
              {toast.title && (
                <p className="text-[13px] font-bold text-text">{toast.title}</p>
              )}
              <p className="text-[13px] leading-6 text-text-muted">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="بستن اعلان"
              className="absolute end-2 top-2 rounded-btn p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
