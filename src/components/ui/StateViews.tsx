import {
  AlertCircle,
  BookOpen,
  FileX2,
  Inbox,
  RefreshCw,
  ShieldAlert,
  WifiOff,
  Clock,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';

export function SampleDataBadge({
  label = 'Dữ liệu mẫu minh họa',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      icon={<BookOpen className="h-3.5 w-3.5" />}
      className={cn(
        'text-[var(--text-secondary)] whitespace-normal text-left leading-snug max-w-full',
        className,
      )}
      title="Thông tin minh họa cho sinh viên năm nhất. Hãy đối chiếu với cổng thông tin chính thức của trường bạn."
    >
      {label}
    </Badge>
  );
}

export function LoadingSkeleton({
  rows = 3,
  label = 'Đang tải dữ liệu...',
  className,
}: {
  rows?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn('space-y-3', className)}
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-2.5 animate-pulse"
        >
          <div className="h-4 w-1/3 rounded bg-[var(--bg-surface-subtle)]" />
          <div className="h-3.5 w-4/5 rounded bg-[var(--bg-surface-subtle)]" />
          <div className="h-3.5 w-2/3 rounded bg-[var(--bg-surface-subtle)]" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 py-10 text-center',
        className,
      )}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Không thể tải nội dung này',
  message = 'Đã xảy ra lỗi kết nối khi đồng bộ dữ liệu. Dữ liệu cục bộ trên máy vẫn được giữ nguyên.',
  onRetry,
  retryLabel = 'Thử lại',
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-[var(--status-danger)]/35 bg-[var(--status-danger-soft)]/50 p-6 text-center',
        className,
      )}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-danger-soft)] text-[var(--status-danger)]">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[var(--text-secondary)] leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function OfflineBanner({
  onReconnect,
}: {
  onReconnect?: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--status-warning)]/40 bg-[var(--status-warning-soft)] px-4 py-3 text-sm"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <WifiOff
          className="h-5 w-5 shrink-0 text-[var(--status-warning)]"
          aria-hidden="true"
        />
        <div>
          <span className="font-semibold text-[var(--text-primary)]">
            Đang ở chế độ ngoại tuyến.
          </span>{' '}
          <span className="text-[var(--text-secondary)]">
            Sổ tay, lịch học và ghi chú đã lưu cục bộ vẫn hoạt động bình thường.
          </span>
        </div>
      </div>
      {onReconnect && (
        <Button size="sm" variant="outline" onClick={onReconnect}>
          Kiểm tra kết nối
        </Button>
      )}
    </div>
  );
}

export function SessionExpiredBanner({
  onRelogin,
}: {
  onRelogin: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--status-danger)]/40 bg-[var(--status-danger-soft)] px-4 py-3 text-sm"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Clock
          className="h-5 w-5 shrink-0 text-[var(--status-danger)]"
          aria-hidden="true"
        />
        <div>
          <span className="font-semibold text-[var(--text-primary)]">
            Phiên làm việc đã hết hạn.
          </span>{' '}
          <span className="text-[var(--text-secondary)]">
            Vui lòng xác nhận đăng nhập lại để tiếp tục đồng bộ thay đổi.
          </span>
        </div>
      </div>
      <Button size="sm" variant="danger" onClick={onRelogin}>
        Đăng nhập lại
      </Button>
    </div>
  );
}

export function ForbiddenState({
  title = 'Bạn chưa có quyền truy cập khu vực này',
  description = 'Trang quản trị chỉ dành cho Ban biên tập hoặc Quản trị viên. Bạn có thể quay về trang chính hoặc chuyển vai trò minh họa trong phần Tài khoản.',
  onBackHome,
}: {
  title?: string;
  description?: string;
  onBackHome?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-6 py-10 text-center max-w-xl mx-auto my-8"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-warning-soft)] text-[var(--status-warning)]">
        <ShieldAlert className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
      {onBackHome && (
        <div className="mt-5">
          <Button variant="primary" onClick={onBackHome}>
            Quay về Hôm nay
          </Button>
        </div>
      )}
    </div>
  );
}

export function DeletedContentState({
  title = 'Nội dung không còn tồn tại hoặc đã bị ẩn',
  description = 'Mục bạn đang tìm đã bị xóa, thu hồi hoặc ẩn bởi bộ phận kiểm duyệt.',
  actionLabel = 'Quay lại danh sách',
  onBack,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onBack?: () => void;
}) {
  return (
    <div
      role="status"
      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-6 py-10 text-center max-w-xl mx-auto my-8"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]">
        <FileX2 className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
      {onBack && (
        <div className="mt-5">
          <Button variant="outline" onClick={onBack}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
