import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Validation message rendered below the field; also flips the border to danger. */
  error?: string;
  /** Helper text shown when there is no error. */
  hint?: string;
  required?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  /** Extra node rendered at the far end inside the field (e.g. a password toggle). */
  endAdornment?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  required,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  endAdornment,
  className,
  id,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[13px] font-medium text-text"
        >
          {label}
          {required && <span className="ms-1 text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-input border bg-surface px-3.5 text-sm text-text placeholder:text-slate-400',
            'transition-shadow duration-150',
            'focus:outline-none focus:ring-4',
            error
              ? 'border-danger focus:border-danger focus:ring-red-100'
              : 'border-border focus:border-primary focus:ring-blue-100',
            LeftIcon && 'ps-11',
            RightIcon || endAdornment ? 'pe-11' : undefined,
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-text-muted',
          )}
          {...rest}
        />
        {RightIcon && (
          <RightIcon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
        )}
        {endAdornment && (
          <div className="absolute end-2 top-1/2 flex -translate-y-1/2 items-center">
            {endAdornment}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-1.5 text-xs text-text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
