import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (
    message: string,
    type?: ToastType,
    options?: { durationMs?: number; actionLabel?: string; onAction?: () => void },
  ) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON_MAP = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const COLOR_MAP: Record<ToastType, string> = {
  success: 'border-l-4 border-l-[var(--status-success)]',
  info: 'border-l-4 border-l-[var(--accent-primary)]',
  warning: 'border-l-4 border-l-[var(--status-warning)]',
  error: 'border-l-4 border-l-[var(--status-danger)]',
};

const ICON_COLOR_MAP: Record<ToastType, string> = {
  success: 'text-[var(--status-success)]',
  info: 'text-[var(--accent-primary)]',
  warning: 'text-[var(--status-warning)]',
  error: 'text-[var(--status-danger)]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId);
      }
      timers.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: {
        durationMs?: number;
        actionLabel?: string;
        onAction?: () => void;
      },
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [
        ...prev.slice(-3),
        {
          id,
          message,
          type,
          actionLabel: options?.actionLabel,
          onAction: options?.onAction,
        },
      ]);

      const duration = options?.durationMs ?? 4000;
      if (duration > 0) {
        const timerId = window.setTimeout(() => {
          timersRef.current.delete(id);
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timerId);
      }
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-20 right-4 z-[60] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none lg:bottom-5"
      >
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-3.5 shadow-lg',
                COLOR_MAP[toast.type],
              )}
            >
              <Icon
                className={cn('h-5 w-5 shrink-0 mt-0.5', ICON_COLOR_MAP[toast.type])}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {toast.message}
                </p>
                {toast.actionLabel && toast.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onAction?.();
                      dismissToast(toast.id);
                    }}
                    className="mt-1.5 min-h-[44px] inline-flex items-center text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Đóng thông báo"
                className="min-h-[44px] min-w-[44px] -my-2 -mr-2 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast phải được dùng bên trong ToastProvider');
  }
  return ctx;
}
