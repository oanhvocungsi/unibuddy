import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)]',
  primary:
    'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-transparent',
  success:
    'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-transparent',
  warning:
    'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-transparent',
  danger:
    'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-transparent',
  outline:
    'bg-transparent text-[var(--text-secondary)] border border-[var(--border-strong)]',
};

export function Badge({
  variant = 'default',
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-snug max-w-full',
        BADGE_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
