import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Compass,
  HeartHandshake,
  MapPin,
  Sparkles,
  Timer,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  SampleDataBadge,
} from '../../../components/ui';
import type {
  AppNotification,
  AppState,
  CampusEvent,
} from '../../../types/models';
import {
  expandScheduleOccurrences,
  formatCurrencyVND,
  formatRelativeDayLabel,
  formatRelativeTimeVi,
  getWeekDateKeys,
  todayKey,
} from '../../../utils/dateUtils';
import {
  computeDayStudyGaps,
  formatDurationVi,
} from '../../schedule/scheduleHelpers';

function notificationPriorityBadge(priority: AppNotification['priority']) {
  switch (priority) {
    case 'urgent':
      return <Badge variant="danger">Khẩn</Badge>;
    case 'important':
      return <Badge variant="warning">Quan trọng</Badge>;
    case 'normal':
      return <Badge variant="default">Thông tin</Badge>;
  }
}

export function SchoolAnnouncementsCard({
  notifications,
  isFocusActive,
}: {
  notifications: AppNotification[];
  isFocusActive: boolean;
}) {
  const highlighted = [...notifications]
    .filter((n) => n.priority === 'urgent' || n.priority === 'important')
    .sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      if (a.priority !== b.priority) {
        return a.priority === 'urgent' ? -1 : 1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex-wrap gap-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Bell
              className="h-4 w-4 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <span>Thông báo từ trường</span>
          </CardTitle>
          <SampleDataBadge label="Dữ liệu minh họa" />
        </div>
        <Link
          to="/thong-bao"
          className="min-h-[44px] inline-flex items-center text-xs font-semibold text-[var(--accent-primary)] hover:underline"
        >
          Xem tất cả
        </Link>
      </CardHeader>

      <CardBody className="space-y-2.5">
        {isFocusActive && (
          <p className="rounded-lg bg-[var(--accent-primary-soft)]/70 px-3 py-2 text-xs text-[var(--text-secondary)]">
            Chế độ Tập trung đang bật: thông báo không khẩn cấp được tạm ẩn.
          </p>
        )}

        {highlighted.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            Hiện chưa có thông báo khẩn hoặc quan trọng nào mới.
          </p>
        ) : (
          <ul className="space-y-2">
            {highlighted.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/40 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  {notificationPriorityBadge(item.priority)}
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {formatRelativeTimeVi(item.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {item.message}
                </p>
                {item.actionRoute && (
                  <Link
                    to={item.actionRoute}
                    className="inline-flex min-h-[44px] items-center text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                  >
                    Mở chi tiết
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export function WeeklyProgressWidget({ state }: { state: AppState }) {
  const today = todayKey();
  const weekDates = getWeekDateKeys(today);
  const weekOccurrences = expandScheduleOccurrences(
    state.scheduleEvents,
    weekDates[0],
    weekDates[6],
  );
  const classSessionsThisWeek = weekOccurrences.filter(
    (ev) => ev.category === 'class' || ev.category === 'exam',
  ).length;
  const doneCount = state.tasks.filter((t) => t.status === 'done').length;
  const overdueCount = state.tasks.filter(
    (t) => t.status === 'todo' && t.dueDate < today,
  ).length;
  const todoCount = state.tasks.filter((t) => t.status === 'todo').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp
            className="h-4 w-4 text-[var(--accent-primary)]"
            aria-hidden="true"
          />
          <span>Tiến độ tuần</span>
        </CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3">
          <p className="text-xs text-[var(--text-secondary)]">Buổi học tuần</p>
          <p className="mt-1 text-xl font-bold text-[var(--text-primary)] tabular-nums">
            {classSessionsThisWeek}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] tabular-nums">
            Tổng {weekOccurrences.length} lịch
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--status-success-soft)]/45 p-3">
          <p className="text-xs text-[var(--text-secondary)]">Đã hoàn thành</p>
          <p className="mt-1 text-xl font-bold text-[var(--status-success)] tabular-nums">
            {doneCount}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] tabular-nums">
            Còn {todoCount} việc
          </p>
        </div>

        <div
          className={
            overdueCount > 0
              ? 'rounded-xl border border-[var(--status-danger)]/35 bg-[var(--status-danger-soft)]/50 p-3'
              : 'rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3'
          }
        >
          <p className="text-xs text-[var(--text-secondary)]">Việc quá hạn</p>
          <p
            className={
              overdueCount > 0
                ? 'mt-1 text-xl font-bold text-[var(--status-danger)] tabular-nums'
                : 'mt-1 text-xl font-bold text-[var(--status-success)] tabular-nums'
            }
          >
            {overdueCount}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            {overdueCount > 0 ? 'Cần xử lý sớm' : 'Đúng tiến độ'}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function findMatchingEvent(
  events: CampusEvent[],
  interests: string[],
  today: string,
): CampusEvent | undefined {
  const upcoming = events
    .filter((ev) => ev.status !== 'cancelled' && ev.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length === 0) return undefined;

  const lowerInterests = interests.map((i) => i.toLowerCase());
  const matched = upcoming.find((ev) => {
    const hay = `${ev.title} ${ev.description} ${ev.organizer}`.toLowerCase();
    return lowerInterests.some((interest) =>
      interest
        .split(/\s+/)
        .some((token) => token.length >= 4 && hay.includes(token)),
    );
  });

  return matched ?? upcoming[0];
}

export function PersonalSuggestionsWidget({
  state,
  onStartFocus,
  onStopFocus,
}: {
  state: AppState;
  onStartFocus: (minutes: number) => void;
  onStopFocus: () => void;
}) {
  const today = todayKey();
  const gaps = computeDayStudyGaps(state.scheduleEvents, today);
  const topGap = gaps[0];
  const recommendedEvent = findMatchingEvent(
    state.events,
    state.profile.interests,
    today,
  );

  const isFocusActive = Boolean(
    state.settings.focusModeUntil &&
      new Date(state.settings.focusModeUntil).getTime() > Date.now(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles
            className="h-4 w-4 text-[var(--accent-primary)]"
            aria-hidden="true"
          />
          <span>Gợi ý cá nhân</span>
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {topGap && (
          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--accent-primary)]">
                Khoảng trống hôm nay
              </span>
              <Badge variant="primary">
                {formatDurationVi(topGap.durationMinutes)}
              </Badge>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {topGap.label}
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {topGap.suggestion}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isFocusActive ? (
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={onStopFocus}
                >
                  Đang tập trung • Tắt
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Timer className="h-4 w-4" />}
                  onClick={() => onStartFocus(25)}
                >
                  Bắt đầu Tập trung 25 phút
                </Button>
              )}
              <Link
                to="/lich?tab=focus"
                className="min-h-[44px] inline-flex items-center px-2 text-xs font-medium text-[var(--accent-primary)] hover:underline"
              >
                Mở Pomodoro
              </Link>
            </div>
          </div>
        )}

        {recommendedEvent && (
          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3 space-y-1.5">
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Phù hợp sở thích: {state.profile.interests.slice(0, 2).join(', ') || 'Hoạt động tân sinh viên'}
            </p>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
              {recommendedEvent.title}
            </p>
            <p className="text-xs text-[var(--text-secondary)] tabular-nums">
              {formatRelativeDayLabel(recommendedEvent.date)} •{' '}
              {recommendedEvent.startTime} • {recommendedEvent.location}
            </p>
            <Link
              to={`/kham-pha?tab=events&event=${recommendedEvent.id}`}
              className="inline-flex min-h-[44px] items-center text-xs font-semibold text-[var(--accent-primary)] hover:underline"
            >
              Xem sự kiện
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function CampusShortcutsWidget() {
  const shortcuts = [
    {
      to: '/kham-pha?tab=map',
      label: 'Tìm phòng',
      hint: 'Bản đồ tòa nhà & đường đi',
      icon: MapPin,
    },
    {
      to: '/lich',
      label: 'Thời khóa biểu',
      hint: 'Lịch tuần, trùng giờ & .ics',
      icon: CalendarClock,
    },
    {
      to: '/kham-pha?tab=handbook',
      label: 'Cẩm nang quy chế',
      hint: 'Tín chỉ, GPA & thủ tục',
      icon: Compass,
    },
    {
      to: '/ho-tro',
      label: 'Hỗ trợ sinh viên',
      hint: 'Chi tiêu, tâm lý & cố vấn',
      icon: HeartHandshake,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lối tắt quan trọng</CardTitle>
      </CardHeader>
      <CardBody className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="min-h-[56px] flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/40 px-3 py-2.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--text-primary)] truncate">
                  {item.label}
                </span>
                <span className="block text-xs text-[var(--text-muted)] truncate">
                  {item.hint}
                </span>
              </span>
            </Link>
          );
        })}
      </CardBody>
    </Card>
  );
}

export function CoursesOverviewWidget({ state }: { state: AppState }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen
              className="h-4 w-4 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <span>Môn học học kỳ này</span>
          </CardTitle>
          <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
            {state.courses.length} học phần đang theo dõi
          </p>
        </div>
        <Link
          to="/mon-hoc"
          className="min-h-[44px] inline-flex items-center text-xs sm:text-sm font-semibold text-[var(--accent-primary)] hover:underline"
        >
          Tất cả môn học
        </Link>
      </CardHeader>

      <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {state.courses.slice(0, 4).map((course) => (
          <Link
            key={course.id}
            to={`/mon-hoc/${course.id}`}
            className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 hover:border-[var(--border-strong)] transition-colors space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)]">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: course.color }}
                  aria-hidden="true"
                />
                {course.code}
              </span>
              <span className="text-xs text-[var(--text-muted)] tabular-nums">
                {course.credits} TC • {course.room}
              </span>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
              {course.name}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] tabular-nums">
                <span>Tiến độ tự học</span>
                <span>{course.progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)]"
                  style={{ width: `${Math.min(100, course.progressPercent)}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </CardBody>
    </Card>
  );
}

export function WellnessBudgetWidget({ state }: { state: AppState }) {
  const monthPrefix = todayKey().slice(0, 7);
  const monthSpent = state.expenses
    .filter((e) => e.date.startsWith(monthPrefix) && e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = state.budgetLimits.reduce(
    (sum, b) => sum + b.monthlyLimit,
    0,
  );
  const ratio = totalBudget > 0 ? Math.round((monthSpent / totalBudget) * 100) : 0;
  const latestMood = state.moodCheckIns[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet
            className="h-4 w-4 text-[var(--accent-primary)]"
            aria-hidden="true"
          />
          <span>Chi tiêu & Nhịp sống</span>
        </CardTitle>
        <Link
          to="/ho-tro"
          className="min-h-[44px] inline-flex items-center text-xs font-semibold text-[var(--accent-primary)] hover:underline"
        >
          Mở Đời sống
        </Link>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[var(--text-secondary)]">Chi tiêu tháng này</span>
            <Badge variant={ratio >= 85 ? 'warning' : 'default'}>
              {ratio}% ngân sách
            </Badge>
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
            {formatCurrencyVND(monthSpent)} / {formatCurrencyVND(totalBudget)}
          </p>
        </div>

        {latestMood ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border-hairline)] p-3 text-xs">
            <AlertCircle
              className="h-4 w-4 shrink-0 text-[var(--accent-primary)] mt-0.5"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-semibold text-[var(--text-primary)]">
                Nhật ký cảm xúc gần nhất (Riêng tư)
              </p>
              <p className="mt-0.5 text-[var(--text-secondary)] line-clamp-2">
                {latestMood.tags.join(', ')} — {latestMood.note}
              </p>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
