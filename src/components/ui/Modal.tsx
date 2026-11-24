import {
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Footer action area (usually buttons). */
  footer?: ReactNode;
  size?: ModalSize;
  /** Close when the backdrop is clicked. Default: true */
  closeOnOverlayClick?: boolean;
  /** Hide the built-in close (X) button. Default: false */
  hideCloseButton?: boolean;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  hideCloseButton = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key closes the dialog
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll while open + move focus into the panel
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="animate-modal-overlay absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'animate-modal-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-modal bg-surface shadow-modal outline-none sm:rounded-modal',
          SIZE_CLASSES[size],
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title && (
                <h2 className="text-base font-bold leading-6 text-text">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-[13px] leading-6 text-text-muted">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن پنجره"
                className="rounded-btn p-2 text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-slate-50/60 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
