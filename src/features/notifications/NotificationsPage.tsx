import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  Info,
  Moon,
  SlidersHorizontal,
  Timer,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type {
  NotificationCategory,
  NotificationPriority,
} from '../../types/models';
import {
  formatRelativeTimeVi,
  isWithinQuietHours,
} from '../../utils/dateUtils';

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  schedule: 'Lịch học',
  deadline: 'Hạn nộp',
  academic: 'Học tập',
  group: 'Nhóm học',
  event: 'Sự kiện',
};

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  urgent: 'Khẩn cấp',
  important: 'Quan trọng',
  normal: 'Thông thường',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as NotificationCategory[];
const ALL_PRIORITIES = Object.keys(PRIORITY_LABELS) as NotificationPriority[];

function readBrowserPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  try {
    return Notification.permission;
  } catch {
    return 'unsupported';
  }
}

export function NotificationsPage() {
  const {
    state,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    updateNotificationPrefs,
    stopFocusMode,
    setSimulation,
  } = useAppStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState<
    NotificationCategory | 'all'
  >('all');
  const [priorityFilter, setPriorityFilter] = useState<
    NotificationPriority | 'all'
  >('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [browserPerm, setBrowserPerm] = useState<
    NotificationPermission | 'unsupported'
  >(() => readBrowserPermission());

  const focusRemainingMin = useMemo(() => {
    if (!state.settings.focusModeUntil) return 0;
    const diff = new Date(state.settings.focusModeUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 60000));
  }, [state.settings.focusModeUntil]);

  const inQuietHours = useMemo(() => {
    if (!state.settings.quietHoursEnabled) return false;
    return isWithinQuietHours(
      new Date(),
      state.settings.quietStart,
      state.settings.quietEnd,
    );
  }, [
    state.settings.quietHoursEnabled,
    state.settings.quietStart,
    state.settings.quietEnd,
  ]);

  const filteredNotifications = useMemo(() => {
    return [...state.notifications]
      .filter((n) => categoryFilter === 'all' || n.category === categoryFilter)
      .filter((n) => priorityFilter === 'all' || n.priority === priorityFilter)
      .filter((n) => !unreadOnly || !n.read)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [state.notifications, categoryFilter, priorityFilter, unreadOnly]);

  const handleRequestBrowserPermission = async () => {
    if (typeof Notification === 'undefined') {
      setBrowserPerm('unsupported');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setBrowserPerm(result);
      if (result === 'granted') {
        showToast('Đã bật quyền thông báo trên trình duyệt', 'success');
      } else if (result === 'denied') {
        showToast(
          'Quyền thông báo bị từ chối trong cài đặt trình duyệt',
          'warning',
        );
      }
    } catch {
      setBrowserPerm('unsupported');
    }
  };

  const handleSendTestBrowserNotif = () => {
    if (typeof Notification === 'undefined' || browserPerm !== 'granted') return;
    try {
      new Notification('UniBuddy — Thử nghiệm thông báo', {
        body: 'Thông báo trình duyệt đang hoạt động bình thường.',
      });
      showToast('Đã gửi thông báo thử nghiệm', 'info');
    } catch {
      showToast('Không thể hiển thị thông báo trình duyệt trong môi trường này', 'warning');
    }
  };

  if (
    state.simulation.loadingFeature === 'notifications' ||
    state.simulation.loadingFeature === 'all'
  ) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Trung tâm thông báo
        </h1>
        <LoadingSkeleton rows={4} label="Đang tải danh sách thông báo..." />
      </div>
    );
  }

  if (state.simulation.networkError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Trung tâm thông báo
        </h1>
        <ErrorState
          onRetry={() => setSimulation({ networkError: false })}
          message="Không thể tải thông báo mới từ máy chủ lúc này. Thông báo đã lưu cục bộ vẫn hiển thị bình thường."
        />
      </div>
    );
  }

  const renderPriorityBadge = (priority: NotificationPriority) => {
    if (priority === 'urgent') {
      return (
        <Badge variant="danger" icon={<AlertCircle className="h-3.5 w-3.5" />}>
          {PRIORITY_LABELS[priority]}
        </Badge>
      );
    }
    if (priority === 'important') {
      return (
        <Badge
          variant="warning"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
        >
          {PRIORITY_LABELS[priority]}
        </Badge>
      );
    }
    return (
      <Badge variant="default" icon={<Info className="h-3.5 w-3.5" />}>
        {PRIORITY_LABELS[priority]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Trung tâm thông báo
            </h1>
            <Badge variant="primary" className="tabular-nums">
              {unreadNotificationCount} chưa đọc
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Theo dõi nhắc lịch học, hạn nộp trùng ngày, nhóm học và cập nhật từ
            trường.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setPrefsOpen((prev) => !prev)}
            aria-expanded={prefsOpen}
          >
            Kênh thông báo
          </Button>
          {unreadNotificationCount > 0 && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              onClick={() => {
                markAllNotificationsRead();
                showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
              }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </header>

      {/* Quiet Hours & Focus Mode Status */}
      {(focusRemainingMin > 0 || inQuietHours || state.settings.quietHoursEnabled) && (
        <div
          role="status"
          className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            focusRemainingMin > 0 || inQuietHours
              ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary-soft)]/55'
              : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[var(--accent-primary)] border border-[var(--border-hairline)]">
              {focusRemainingMin > 0 ? (
                <Timer className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-0.5 text-sm">
              <p className="font-semibold text-[var(--text-primary)]">
                {focusRemainingMin > 0
                  ? `Chế độ Tập trung đang bật (còn ${focusRemainingMin} phút)`
                  : inQuietHours
                    ? `Đang trong Giờ yên lặng (${state.settings.quietStart} – ${state.settings.quietEnd})`
                    : `Giờ yên lặng đã lên lịch (${state.settings.quietStart} – ${state.settings.quietEnd})`}
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {focusRemainingMin > 0 || inQuietHours
                  ? 'Thông báo không khẩn cấp (Quan trọng / Thông thường) đang được tắt tiếng tạm thời để bạn tập trung học và nghỉ ngơi; thông báo Khẩn cấp vẫn luôn hiển thị.'
                  : 'Khi bước vào khung giờ yên lặng, thông báo không khẩn cấp sẽ tự động tạm hoãn làm phiền.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {focusRemainingMin > 0 && (
              <Button size="sm" variant="outline" onClick={stopFocusMode}>
                Tắt chế độ Tập trung
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/tai-khoan')}
            >
              Chỉnh giờ yên lặng
            </Button>
          </div>
        </div>
      )}

      {/* Channel Preferences Drawer / Collapsible Panel */}
      {prefsOpen && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                Tùy chọn kênh &amp; quyền thông báo
              </h2>
              <CardDescription>
                Bật/tắt từng nhóm thông báo và kiểm tra quyền thông báo trên
                trình duyệt.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Nhóm thông báo muốn nhận
              </h3>
              <div className="space-y-2">
                {ALL_CATEGORIES.map((cat) => {
                  const enabled = state.settings.notifications[cat];
                  return (
                    <label
                      key={cat}
                      className="min-h-[44px] flex items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 px-3.5 py-2 cursor-pointer"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() =>
                          updateNotificationPrefs({ [cat]: !enabled })
                        }
                        className="h-4 w-4 accent-[var(--accent-primary)] cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Thông báo trình duyệt (Web Notification)
              </h3>
              <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/60 p-4 space-y-3">
                {browserPerm === 'unsupported' && (
                  <div className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <BellOff
                      className="h-5 w-5 text-[var(--text-muted)] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p className="leading-relaxed">
                      Trình duyệt hoặc môi trường hiện tại không hỗ trợ Web
                      Notification API. Bạn vẫn xem được đầy đủ thông báo ngay
                      trong UniBuddy.
                    </p>
                  </div>
                )}

                {browserPerm === 'denied' && (
                  <div className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <BellOff
                      className="h-5 w-5 text-[var(--status-danger)] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <p className="font-semibold text-[var(--text-primary)]">
                        Quyền thông báo trình duyệt đang bị chặn
                      </p>
                      <p className="text-xs leading-relaxed">
                        Hãy nhấn vào biểu tượng ổ khóa trên thanh địa chỉ trình
                        duyệt, chuyển mục Thông báo sang &ldquo;Cho phép&rdquo;
                        rồi tải lại trang nếu muốn nhận thông báo ngoài tab.
                      </p>
                    </div>
                  </div>
                )}

                {browserPerm === 'default' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                      <Bell
                        className="h-5 w-5 text-[var(--accent-primary)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="leading-relaxed">
                        Cho phép trình duyệt hiển thị nhắc hạn nộp quan trọng
                        ngay cả khi bạn đang mở tab học liệu khác.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleRequestBrowserPermission}
                      leftIcon={<BellRing className="h-4 w-4" />}
                    >
                      Bật thông báo trình duyệt
                    </Button>
                  </div>
                )}

                {browserPerm === 'granted' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--status-success)]">
                      <BellRing className="h-4 w-4" aria-hidden="true" />
                      <span>Đã cấp quyền thông báo trình duyệt</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSendTestBrowserNotif}
                    >
                      Gửi thông báo thử nghiệm
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Filter Bar */}
      <Card padded className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo danh mục">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`min-h-[44px] rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Tất cả danh mục
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[44px] rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Lọc theo mức ưu tiên"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value as NotificationPriority | 'all',
                )
              }
              className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm text-[var(--text-primary)]"
            >
              <option value="all">Mọi mức ưu tiên</option>
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>

            <label className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/60 px-3 text-xs sm:text-sm font-medium text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent-primary)] cursor-pointer"
              />
              <span>Chỉ chưa đọc</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="Không có thông báo nào phù hợp"
          description={
            unreadOnly || categoryFilter !== 'all' || priorityFilter !== 'all'
              ? 'Thử bỏ bớt bộ lọc để xem lại các thông báo trước đó.'
              : 'Hộp thư thông báo của bạn đang gọn gàng.'
          }
          actionLabel={
            unreadOnly || categoryFilter !== 'all' || priorityFilter !== 'all'
              ? 'Xóa bộ lọc'
              : undefined
          }
          onAction={() => {
            setCategoryFilter('all');
            setPriorityFilter('all');
            setUnreadOnly(false);
          }}
        />
      ) : (
        <ul className="space-y-3" aria-label="Danh sách thông báo">
          {filteredNotifications.map((item) => {
            const mutedByQuiet =
              (inQuietHours || focusRemainingMin > 0) &&
              item.priority !== 'urgent';

            return (
              <li key={item.id}>
                <Card
                  className={
                    !item.read
                      ? 'border-l-4 border-l-[var(--accent-primary)]'
                      : undefined
                  }
                >
                  <CardBody className="pt-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderPriorityBadge(item.priority)}
                        <Badge variant="default">
                          {CATEGORY_LABELS[item.category]}
                        </Badge>
                        {!item.read && <Badge variant="primary">Chưa đọc</Badge>}
                        {mutedByQuiet && (
                          <Badge variant="outline">Tạm hoãn chuông</Badge>
                        )}
                        {item.isSample && (
                          <SampleDataBadge label="Thông báo mẫu" />
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatRelativeTimeVi(item.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-base font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-hairline)]">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.actionRoute && (
                          <Button
                            size="sm"
                            variant="outline"
                            rightIcon={<ArrowUpRight className="h-4 w-4" />}
                            onClick={() => {
                              if (!item.read) {
                                markNotificationRead(item.id, true);
                              }
                              navigate(item.actionRoute!);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            markNotificationRead(item.id, !item.read)
                          }
                        >
                          {item.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Xóa thông báo ${item.title}`}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => {
                          deleteNotification(item.id);
                          showToast('Đã xóa thông báo', 'info');
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default NotificationsPage;
