import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  useToast,
} from '../../../components/ui';
import type { Course, TaskItem, TaskPriority } from '../../../types/models';
import { cn } from '../../../utils/cn';
import {
  addDays,
  findDeadlineCollisions,
  formatRelativeDayLabel,
  todayKey,
} from '../../../utils/dateUtils';
import { TASK_PRIORITY_META } from '../../schedule/scheduleHelpers';

interface DeadlinesAndTodoWidgetProps {
  tasks: TaskItem[];
  courses: Course[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: {
    title: string;
    dueDate: string;
    priority: TaskPriority;
    courseId?: string;
    reminderBefore: '1d';
    subtasks: [];
  }) => void;
  onPostponeTask: (task: TaskItem) => void;
}

export function DeadlinesAndTodoWidget({
  tasks,
  courses,
  onToggleTask,
  onAddTask,
  onPostponeTask,
}: DeadlinesAndTodoWidgetProps) {
  const { showToast } = useToast();
  const today = todayKey();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickDate, setQuickDate] = useState(today);
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [quickCourseId, setQuickCourseId] = useState('');
  const [showDone, setShowDone] = useState(false);

  const collisions = useMemo(() => findDeadlineCollisions(tasks), [tasks]);

  const sortedTodoTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'todo')
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        const pDiff =
          TASK_PRIORITY_META[a.priority].rank -
          TASK_PRIORITY_META[b.priority].rank;
        if (pDiff !== 0) return pDiff;
        return (a.dueTime ?? '23:59').localeCompare(b.dueTime ?? '23:59');
      });
  }, [tasks]);

  const recentDoneTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'done')
      .sort((a, b) =>
        (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt),
      )
      .slice(0, 4);
  }, [tasks]);

  const handleQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    const clean = quickTitle.trim();
    if (!clean) {
      showToast('Vui lòng nhập nội dung việc cần làm.', 'warning');
      return;
    }
    onAddTask({
      title: clean,
      dueDate: quickDate || today,
      priority: quickPriority,
      courseId: quickCourseId || undefined,
      reminderBefore: '1d',
      subtasks: [],
    });
    setQuickTitle('');
    showToast(`Đã thêm "${clean}" vào danh sách việc cần làm.`, 'success');
  };

  const handleToggle = (task: TaskItem) => {
    const nextDone = task.status !== 'done';
    onToggleTask(task.id);
    showToast(
      nextDone
        ? `Đã hoàn thành "${task.title}"`
        : `Đã mở lại "${task.title}"`,
      nextDone ? 'success' : 'info',
    );
  };

  const handlePostpone = (task: TaskItem) => {
    onPostponeTask(task);
    const nextDate = addDays(task.dueDate, 1);
    showToast(
      `Đã dời "${task.title}" sang ${formatRelativeDayLabel(nextDate)}.`,
      'info',
    );
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo
              className="h-5 w-5 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <span>Việc sắp đến hạn & Việc cần làm</span>
          </CardTitle>
          <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
            Sắp xếp theo mức độ gấp. Đánh dấu hoàn thành nhanh hoặc dời +1 ngày khi lịch quá dày.
          </p>
        </div>
        <Link
          to="/lich?tab=tasks"
          className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-surface-subtle)] shrink-0"
        >
          <span>Quản lý chi tiết</span>
        </Link>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Same-day deadline collision warning */}
        {collisions.length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-[var(--status-warning)]/45 bg-[var(--status-warning-soft)]/70 p-3.5 space-y-2"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                className="h-5 w-5 shrink-0 text-[var(--status-warning)] mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Cảnh báo trùng hạn nộp cùng ngày ({collisions.length} mốc)
                </p>
                <ul className="space-y-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {collisions.map((group) => (
                    <li key={group.dueDate}>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatRelativeDayLabel(group.dueDate)}:
                      </span>{' '}
                      {group.tasks.length} việc cùng hạn (
                      {group.tasks.map((t) => t.title).join(' • ')})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Inline quick-add task form */}
        <form
          onSubmit={handleQuickAdd}
          aria-label="Thêm nhanh việc cần làm"
          className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/55 p-3 space-y-2.5"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Thêm việc cần làm nhanh (ví dụ: Đọc trước chương 2 Giải tích)..."
              aria-label="Nội dung việc cần làm nhanh"
              className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              className="shrink-0"
            >
              Thêm việc
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span>Hạn:</span>
              <input
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                aria-label="Hạn hoàn thành nhanh"
                className="min-h-[44px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs text-[var(--text-primary)] tabular-nums"
              />
            </label>
            <label className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span>Ưu tiên:</span>
              <select
                value={quickPriority}
                onChange={(e) =>
                  setQuickPriority(e.target.value as TaskPriority)
                }
                aria-label="Mức ưu tiên việc nhanh"
                className="min-h-[44px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs text-[var(--text-primary)]"
              >
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span>Môn:</span>
              <select
                value={quickCourseId}
                onChange={(e) => setQuickCourseId(e.target.value)}
                aria-label="Môn học liên quan"
                className="min-h-[44px] max-w-[190px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs text-[var(--text-primary)]"
              >
                <option value="">Chung / Không gắn môn</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </form>

        {/* Active tasks */}
        {sortedTodoTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-6 w-6" aria-hidden="true" />}
            title="Tuyệt vời, bạn đã hoàn thành hết việc cần làm!"
            description="Không còn đầu việc nào đang chờ. Dùng ô thêm nhanh ở trên khi có bài tập hoặc nhắc việc mới."
          />
        ) : (
          <ul className="space-y-2.5" aria-label="Danh sách việc cần làm">
            {sortedTodoTasks.map((task) => {
              const isOverdue = task.dueDate < today;
              const isToday = task.dueDate === today;
              const course = courses.find((c) => c.id === task.courseId);
              const priorityMeta = TASK_PRIORITY_META[task.priority];
              const doneSubtasks = task.subtasks.filter((s) => s.done).length;
              const isCollisionDate = collisions.some(
                (c) => c.dueDate === task.dueDate,
              );

              return (
                <li
                  key={task.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition-colors',
                    isOverdue
                      ? 'border-[var(--status-danger)]/40 bg-[var(--status-danger-soft)]/30'
                      : isCollisionDate
                        ? 'border-[var(--status-warning)]/45 bg-[var(--bg-surface)]'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]',
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <label className="min-h-[44px] min-w-[44px] -m-1.5 flex items-center justify-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggle(task)}
                        aria-label={`Đánh dấu hoàn thành: ${task.title}`}
                        className="h-5 w-5 rounded border-[var(--border-strong)] accent-[var(--accent-primary)] cursor-pointer"
                      />
                    </label>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={priorityMeta.variant}>
                          {priorityMeta.label}
                        </Badge>
                        {course && (
                          <Badge variant="default">{course.code}</Badge>
                        )}
                        {isOverdue && <Badge variant="danger">Quá hạn</Badge>}
                        {isToday && (
                          <Badge variant="primary">Hạn hôm nay</Badge>
                        )}
                        {isCollisionDate && (
                          <Badge
                            variant="warning"
                            icon={<AlertTriangle className="h-3 w-3" />}
                          >
                            Trùng hạn
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                        {task.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)] tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {formatRelativeDayLabel(task.dueDate)}
                            {task.dueTime ? ` • ${task.dueTime}` : ''}
                          </span>
                        </span>
                        {task.subtasks.length > 0 && (
                          <span>
                            Bước nhỏ: {doneSubtasks}/{task.subtasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CalendarPlus className="h-3.5 w-3.5" />}
                      onClick={() => handlePostpone(task)}
                      aria-label={`Dời +1 ngày cho ${task.title}`}
                    >
                      +1 ngày
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Recently completed quick-toggle */}
        {recentDoneTasks.length > 0 && (
          <div className="pt-1 border-t border-[var(--border-hairline)]">
            <button
              type="button"
              onClick={() => setShowDone((prev) => !prev)}
              aria-expanded={showDone}
              className="min-h-[44px] inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <CheckCircle2
                className="h-4 w-4 text-[var(--status-success)]"
                aria-hidden="true"
              />
              <span>
                {showDone
                  ? 'Ẩn các việc đã hoàn thành'
                  : `Xem ${recentDoneTasks.length} việc đã hoàn thành gần đây`}
              </span>
            </button>

            {showDone && (
              <ul className="mt-2 space-y-2">
                {recentDoneTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 px-3 py-2"
                  >
                    <label className="min-h-[44px] min-w-[44px] -m-1.5 flex items-center justify-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked
                        onChange={() => handleToggle(task)}
                        aria-label={`Bỏ đánh dấu hoàn thành: ${task.title}`}
                        className="h-5 w-5 rounded accent-[var(--status-success)] cursor-pointer"
                      />
                    </label>
                    <span className="text-sm text-[var(--text-muted)] line-through truncate">
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
