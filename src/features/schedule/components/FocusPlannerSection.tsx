import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  BellOff,
  CalendarRange,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  useToast,
} from '../../../components/ui';
import type { ScheduleEvent, TaskItem } from '../../../types/models';
import { cn } from '../../../utils/cn';
import {
  formatShortDate,
  formatWeekdayLong,
  getWeekDateKeys,
  todayKey,
} from '../../../utils/dateUtils';
import {
  computeDayStudyGaps,
  formatDurationVi,
  playGentleChime,
} from '../scheduleHelpers';

interface FocusPlannerSectionProps {
  scheduleEvents: ScheduleEvent[];
  tasks: TaskItem[];
  focusModeUntil: string | null;
  onStartFocusMode: (minutes: number) => void;
  onStopFocusMode: () => void;
  onToggleTaskStatus: (id: string) => void;
}

export function FocusPlannerSection({
  scheduleEvents,
  tasks,
  focusModeUntil,
  onStartFocusMode,
  onStopFocusMode,
  onToggleTaskStatus,
}: FocusPlannerSectionProps) {
  const { showToast } = useToast();
  const today = todayKey();

  const [durationMinutes, setDurationMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('30');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [syncFocusMode, setSyncFocusMode] = useState(true);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const isGlobalFocusActive = Boolean(
    focusModeUntil && new Date(focusModeUntil).getTime() > Date.now(),
  );

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setIsRunning(false);
          if (!mutedRef.current) {
            playGentleChime();
          }
          if (syncFocusMode) {
            onStopFocusMode();
          }
          showToast(
            'Hoàn thành phiên tập trung! Hãy đứng dậy vươn vai và uống ngụm nước nhé.',
            'success',
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, syncFocusMode, onStopFocusMode, showToast]);

  const selectPreset = (mins: number, autoStart = false) => {
    const safeMins = Math.max(5, Math.min(120, mins));
    setDurationMinutes(safeMins);
    setSecondsLeft(safeMins * 60);
    setIsRunning(autoStart);
    if (autoStart && syncFocusMode) {
      onStartFocusMode(safeMins);
    }
  };

  const handleApplyCustom = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(customMinutes);
    if (Number.isNaN(parsed) || parsed < 5 || parsed > 120) {
      showToast('Vui lòng nhập thời lượng từ 5 đến 120 phút.', 'warning');
      return;
    }
    selectPreset(Math.round(parsed), false);
    showToast(`Đã đặt bộ đếm ${Math.round(parsed)} phút.`, 'info');
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (secondsLeft === 0) {
      setSecondsLeft(durationMinutes * 60);
    }
    setIsRunning(true);
    if (syncFocusMode) {
      const remainingMins = Math.max(5, Math.ceil(secondsLeft / 60));
      onStartFocusMode(remainingMins);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(durationMinutes * 60);
    if (isGlobalFocusActive) {
      onStopFocusMode();
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const totalSec = durationMinutes * 60;
  const progressPercent =
    totalSec > 0
      ? Math.round(((totalSec - secondsLeft) / totalSec) * 100)
      : 0;

  const studyGaps = useMemo(
    () => computeDayStudyGaps(scheduleEvents, today),
    [scheduleEvents, today],
  );

  const weekDates = useMemo(() => getWeekDateKeys(today), [today]);
  const overdueTasks = useMemo(
    () => tasks.filter((t) => t.status === 'todo' && t.dueDate < today),
    [tasks, today],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <h2 className="sr-only">Lập kế hoạch học tập và Tập trung Pomodoro</h2>
      {/* Left column: Pomodoro Focus Timer + Today's Gaps */}
      <div className="lg:col-span-6 space-y-5">
        <Card>
          <CardHeader className="flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer
                  className="h-5 w-5 text-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                <span>Bộ đếm Tập trung (Pomodoro)</span>
              </CardTitle>
              <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                Chia thời gian học thành phiên ngắn có nghỉ giữa giờ để đỡ kiệt sức.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMuted((prev) => !prev)}
              aria-pressed={muted}
              aria-label={muted ? 'Bật âm báo hết giờ' : 'Tắt âm báo hết giờ'}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
            >
              {muted ? (
                <>
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                  <span>Đang tắt âm</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                  <span>Âm báo bật</span>
                </>
              )}
            </button>
          </CardHeader>

          <CardBody className="space-y-4">
            {/* Presets & custom */}
            <div className="flex flex-wrap items-center gap-2">
              {[25, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  aria-pressed={durationMinutes === mins}
                  onClick={() => selectPreset(mins, false)}
                  className={cn(
                    'min-h-[44px] px-4 rounded-lg text-sm font-medium border cursor-pointer transition-colors tabular-nums',
                    durationMinutes === mins
                      ? 'bg-[var(--accent-primary)] text-white border-transparent'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:bg-[var(--bg-surface-subtle)]',
                  )}
                >
                  {mins} phút
                </button>
              ))}

              <form
                onSubmit={handleApplyCustom}
                className="inline-flex items-center gap-1.5"
              >
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  aria-label="Số phút tập trung tùy chỉnh"
                  className="w-20 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-sm text-[var(--text-primary)] tabular-nums"
                />
                <Button type="submit" size="sm" variant="outline">
                  Đặt phút
                </Button>
              </form>
            </div>

            {/* Timer Display */}
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/55 p-5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                {isGlobalFocusActive ? (
                  <Badge
                    variant="primary"
                    icon={<BellOff className="h-3.5 w-3.5" />}
                  >
                    Chế độ Tập trung đang bật (tạm ẩn tin không khẩn)
                  </Badge>
                ) : (
                  <Badge variant="default">Sẵn sàng bắt đầu</Badge>
                )}
              </div>

              <p
                aria-live="polite"
                className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums"
              >
                {mm}:{ss}
              </p>

              <div className="h-2 w-full max-w-sm mx-auto rounded-full bg-[var(--border-hairline)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={
                    isRunning ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )
                  }
                  onClick={handleStartPause}
                >
                  {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={handleReset}
                >
                  Đặt lại
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer text-xs sm:text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={syncFocusMode}
                onChange={(e) => setSyncFocusMode(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent-primary)]"
              />
              <span>
                Tự động bật Chế độ Tập trung (tạm ẩn thông báo không khẩn cấp khi đang đếm giờ)
              </span>
            </label>
          </CardBody>
        </Card>

        {/* Today's free gaps */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock
                  className="h-4 w-4 text-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                <span>Khoảng trống giữa các buổi học hôm nay</span>
              </CardTitle>
              <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                Tính tự động từ thời khóa biểu trong ngày của bạn (07:00 – 21:30).
              </p>
            </div>
          </CardHeader>

          <CardBody className="space-y-3">
            {studyGaps.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">
                Lịch hôm nay khá kín từ sáng đến tối — ưu tiên nghỉ ngơi đủ giấc giữa các ca nhé.
              </p>
            ) : (
              studyGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                      {gap.label}
                    </span>
                    <Badge variant="primary">
                      {formatDurationVi(gap.durationMinutes)}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    {gap.suggestion}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Play className="h-3.5 w-3.5" />}
                      onClick={() => {
                        selectPreset(25, true);
                        showToast('Đã bắt đầu phiên tập trung 25 phút.', 'info');
                      }}
                    >
                      Dùng 25p ngay
                    </Button>
                    {gap.durationMinutes >= 50 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          selectPreset(45, true);
                          showToast('Đã bắt đầu phiên tập trung 45 phút.', 'info');
                        }}
                      >
                        Dùng 45p ngay
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Right column: Weekly To-do Overview */}
      <Card className="lg:col-span-6">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarRange
                className="h-5 w-5 text-[var(--accent-primary)]"
                aria-hidden="true"
              />
              <span>Tổng quan việc cần làm trong tuần</span>
            </CardTitle>
            <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
              Nhìn nhanh mật độ bài tập theo từng ngày để chủ động phân bổ sức học.
            </p>
          </div>
        </CardHeader>

        <CardBody className="space-y-3">
          {overdueTasks.length > 0 && (
            <div className="rounded-xl border border-[var(--status-danger)]/40 bg-[var(--status-danger-soft)]/45 p-3 space-y-2">
              <p className="text-xs font-bold text-[var(--status-danger)]">
                Quá hạn cần xử lý ({overdueTasks.length})
              </p>
              <ul className="space-y-1.5">
                {overdueTasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-1.5 text-sm">
                    <label className="min-h-[44px] min-w-[44px] -my-2 -ml-1.5 flex items-center justify-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => onToggleTaskStatus(task.id)}
                        aria-label={`Đánh dấu hoàn thành: ${task.title}`}
                        className="h-4 w-4 accent-[var(--status-danger)] cursor-pointer"
                      />
                    </label>
                    <span className="text-[var(--text-primary)] font-medium truncate">
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2.5">
            {weekDates.map((dateKey) => {
              const dayTasks = tasks.filter(
                (t) => t.dueDate === dateKey && t.status !== 'archived',
              );
              const todoCount = dayTasks.filter(
                (t) => t.status === 'todo',
              ).length;
              const isTodayRow = dateKey === today;

              return (
                <div
                  key={dateKey}
                  className={cn(
                    'rounded-xl border p-3 space-y-2',
                    isTodayRow
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/35'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                      {formatWeekdayLong(dateKey)} ({formatShortDate(dateKey)})
                      {isTodayRow ? ' — Hôm nay' : ''}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {todoCount >= 2 && (
                        <Badge variant="warning">Trùng {todoCount} hạn</Badge>
                      )}
                      {dayTasks.length === 0 && (
                        <span className="text-xs text-[var(--text-muted)]">
                          Nhẹ việc
                        </span>
                      )}
                    </div>
                  </div>

                  {dayTasks.length > 0 && (
                    <ul className="space-y-1.5">
                      {dayTasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                        >
                          <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer min-h-[44px]">
                            <input
                              type="checkbox"
                              checked={task.status === 'done'}
                              onChange={() => onToggleTaskStatus(task.id)}
                              className="h-4 w-4 accent-[var(--accent-primary)] cursor-pointer shrink-0"
                            />
                            <span
                              className={cn(
                                'truncate',
                                task.status === 'done'
                                  ? 'line-through text-[var(--text-muted)]'
                                  : 'text-[var(--text-primary)]',
                              )}
                            >
                              {task.title}
                            </span>
                          </label>
                          {task.status === 'done' ? (
                            <CheckCircle2
                              className="h-4 w-4 text-[var(--status-success)] shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            task.dueTime && (
                              <span className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">
                                {task.dueTime}
                              </span>
                            )
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
