import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-dark focus-visible:outline-primary',
  secondary:
    'bg-slate-100 text-text hover:bg-slate-200 focus-visible:outline-slate-400',
  outline:
    'border border-border bg-surface text-text hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-primary',
  ghost:
    'text-text-muted hover:bg-slate-100 hover:text-text focus-visible:outline-primary',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-700 focus-visible:outline-danger',
  success:
    'bg-success text-white shadow-sm hover:bg-green-700 focus-visible:outline-success',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 15, md: 17, lg: 19 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const iconSize = ICON_SIZE[size];
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-btn font-sans font-medium',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin" aria-hidden="true" />
      ) : (
        LeftIcon && <LeftIcon size={iconSize} aria-hidden="true" />
      )}
      {children}
      {!isLoading && RightIcon && <RightIcon size={iconSize} aria-hidden="true" />}
    </button>
  );
});
