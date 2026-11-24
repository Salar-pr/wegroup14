import { useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: LucideIcon;
  options: SelectOption[];
  /** Shown as the disabled first option when nothing is selected. */
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  required,
  leftIcon: LeftIcon,
  options,
  placeholder,
  className,
  id,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full appearance-none rounded-input border bg-surface px-3.5 pe-10 text-sm text-text',
            'transition-shadow duration-150',
            'focus:outline-none focus:ring-4',
            error
              ? 'border-danger focus:border-danger focus:ring-red-100'
              : 'border-border focus:border-primary focus:ring-blue-100',
            LeftIcon && 'ps-11',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-text-muted',
          )}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
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
