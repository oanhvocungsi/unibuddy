import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  interactive?: boolean;
}

export function Card({
  children,
  padded = false,
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]',
        padded && 'p-5',
        interactive &&
          'transition-colors hover:border-[var(--border-strong)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 px-5 pt-5 pb-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-base font-semibold text-[var(--text-primary)] leading-snug',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'mt-1 text-sm text-[var(--text-secondary)] leading-relaxed',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pb-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 rounded-b-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
