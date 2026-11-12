import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-solid)] text-[var(--accent-solid-ink)] hover:bg-[var(--accent-solid-hover)] border border-transparent shadow-xs',
  secondary:
    'bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-hairline)] border border-[var(--border-hairline)]',
  outline:
    'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] border border-transparent',
  danger:
    'bg-[var(--status-danger-solid)] text-white hover:opacity-90 border border-transparent',
  success:
    'bg-[var(--status-success-solid)] text-white hover:opacity-90 border border-transparent',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] px-3 py-2 text-sm gap-1.5',
  md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2',
  lg: 'min-h-[48px] px-5 py-3 text-base gap-2',
  icon: 'min-h-[44px] min-w-[44px] p-2.5 justify-center',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
