import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Bell,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Edit3,
  ListChecks,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Modal,
  useToast,
} from '../../../components/ui';
import type {
  Course,
  ReminderBefore,
  TaskItem,
  TaskPriority,
  TaskStatus,
} from '../../../types/models';
import { cn } from '../../../utils/cn';
import {
  addDays,
  findDeadlineCollisions,
  formatRelativeDayLabel,
  todayKey,
} from '../../../utils/dateUtils';
import {
  FRESHMAN_PROJECT_MILESTONES,
  REMINDER_LABELS,
  TASK_PRIORITY_META,
  TASK_STATUS_LABELS,
} from '../scheduleHelpers';

interface TasksSectionProps {
  tasks: TaskItem[];
  courses: Course[];
  onAddTask: (
    task: Omit<TaskItem, 'id' | 'createdAt' | 'status'> & {
      status?: TaskStatus;
    },
  ) => void;
  onUpdateTask: (id: string, updates: Partial<TaskItem>) => void;
  onToggleTaskStatus: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: TaskItem | null;
  courses: Course[];
  onClose: () => void;
  onSave: (
    payload: Omit<TaskItem, 'id' | 'createdAt' | 'status' | 'subtasks'>,
    editingId?: string,
  ) => void;
}

function TaskFormModal({
  isOpen,
  editingTask,
  courses,
  onClose,
  onSave,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState(todayKey());
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [reminderBefore, setReminderBefore] = useState<ReminderBefore>('1d');
  const [estimatedMinutes, setEstimatedMinutes] = useState('45');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingTask) {
      setTitle(editingTask.title);
      setCourseId(editingTask.courseId ?? '');
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime ?? '23:59');
      setPriority(editingTask.priority);
      setReminderBefore(editingTask.reminderBefore);
      setEstimatedMinutes(
        editingTask.estimatedMinutes
          ? String(editingTask.estimatedMinutes)
          : '',
      );
      setDescription(editingTask.description ?? '');
    } else {
      setTitle('');
      setCourseId('');
      setDueDate(todayKey());
      setDueTime('23:59');
      setPriority('medium');
      setReminderBefore('1d');
      setEstimatedMinutes('45');
      setDescription('');
    }
  }, [isOpen, editingTask]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) {
      setError('Vui lòng nhập tên công việc hoặc bài tập.');
      return;
    }
    if (!dueDate) {
      setError('Vui lòng chọn ngày đến hạn.');
      return;
    }

    onSave(
      {
        title: clean,
        courseId: courseId || undefined,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        reminderBefore,
        estimatedMinutes: estimatedMinutes
          ? Math.max(5, Number(estimatedMinutes) || 30)
          : undefined,
        description: description.trim() || undefined,
      },
      editingTask?.id,
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc / Hạn nộp'}
      description="Theo dõi deadline từng môn, đặt nhắc trước hạn và chia nhỏ các bước thực hiện."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-[var(--status-danger)]/40 bg-[var(--status-danger-soft)]/70 px-3 py-2.5 text-sm font-medium text-[var(--status-danger)]"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Tên công việc / Bài tập{' '}
            <span className="text-[var(--status-danger)]">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Hoàn thành bài tập lớn IT1010"
            className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="task-course"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Môn học liên quan
            </label>
            <select
              id="task-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Chung / Không gắn môn</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Mức độ ưu tiên
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="task-due-date"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Hạn nộp (Ngày)
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="task-due-time"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Giờ nộp
            </label>
            <input
              id="task-due-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="task-reminder"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Nhắc trước hạn
            </label>
            <select
              id="task-reminder"
              value={reminderBefore}
              onChange={(e) =>
                setReminderBefore(e.target.value as ReminderBefore)
              }
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="none">Không nhắc</option>
              <option value="1h">Trước 1 giờ</option>
              <option value="1d">Trước 1 ngày</option>
              <option value="3d">Trước 3 ngày</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="task-est"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Ước lượng (phút)
            </label>
            <input
              id="task-est"
              type="number"
              min={5}
              max={600}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="task-desc"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Mô tả chi tiết
            </label>
            <input
              id="task-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú yêu cầu định dạng, cách nộp trên LMS..."
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            {editingTask ? 'Lưu thay đổi' : 'Tạo công việc'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function TasksSection({
  tasks,
  courses,
  onAddTask,
  onUpdateTask,
  onToggleTaskStatus,
  onArchiveTask,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}: TasksSectionProps) {
  const { showToast } = useToast();
  const today = todayKey();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('todo');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>(
    'all',
  );
  const [courseFilter, setCourseFilter] = useState('all');

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>(
    {},
  );
  const [rescheduleOpenId, setRescheduleOpenId] = useState<string | null>(null);
  const [customDateDraft, setCustomDateDraft] = useState('');

  const collisions = useMemo(() => findDeadlineCollisions(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) =>
        statusFilter === 'all' ? true : t.status === statusFilter,
      )
      .filter((t) =>
        priorityFilter === 'all' ? true : t.priority === priorityFilter,
      )
      .filter((t) =>
        courseFilter === 'all' ? true : t.courseId === courseFilter,
      )
      .sort((a, b) => {
        if (a.status !== b.status) {
          const order = { todo: 0, done: 1, archived: 2 };
          return order[a.status] - order[b.status];
        }
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return (
          TASK_PRIORITY_META[a.priority].rank -
          TASK_PRIORITY_META[b.priority].rank
        );
      });
  }, [tasks, statusFilter, priorityFilter, courseFilter]);

  const handleSaveTask = (
    payload: Omit<TaskItem, 'id' | 'createdAt' | 'status' | 'subtasks'>,
    editingId?: string,
  ) => {
    if (editingId) {
      onUpdateTask(editingId, payload);
      showToast('Đã cập nhật công việc.', 'success');
    } else {
      onAddTask({
        ...payload,
        subtasks: [],
      });
      showToast(`Đã tạo "${payload.title}".`, 'success');
    }
  };

  const handleApplyMilestones = (task: TaskItem) => {
    const existing = new Set(
      task.subtasks.map((s) => s.title.trim().toLowerCase()),
    );
    let addedCount = 0;
    for (const milestone of FRESHMAN_PROJECT_MILESTONES) {
      if (!existing.has(milestone.toLowerCase())) {
        onAddSubtask(task.id, milestone);
        addedCount += 1;
      }
    }
    if (addedCount > 0) {
      showToast(
        `Đã chia ${addedCount} mốc thực hiện cho "${task.title}".`,
        'success',
      );
    } else {
      showToast('Các mốc gợi ý đã có trong danh sách bước nhỏ.', 'info');
    }
  };

  const handleAddSubtaskSubmit = (taskId: string, e: FormEvent) => {
    e.preventDefault();
    const draft = (subtaskDrafts[taskId] ?? '').trim();
    if (!draft) return;
    onAddSubtask(taskId, draft);
    setSubtaskDrafts((prev) => ({ ...prev, [taskId]: '' }));
  };

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Nhắc việc và Hạn nộp</h2>
      {/* Same-day collision banner */}
      {collisions.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--status-warning)]/45 bg-[var(--status-warning-soft)]/70 p-4 space-y-1.5"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="h-5 w-5 text-[var(--status-warning)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Cảnh báo trùng hạn nộp ({collisions.length} ngày có từ 2 việc trở lên)
              </p>
              <ul className="space-y-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                {collisions.map((group) => (
                  <li key={group.dueDate}>
                    <strong>{formatRelativeDayLabel(group.dueDate)}:</strong>{' '}
                    {group.tasks.map((t) => t.title).join(' • ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <Card>
        <CardBody className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'todo', label: 'Cần làm' },
                { id: 'done', label: 'Đã xong' },
                { id: 'archived', label: 'Đã lưu trữ' },
                { id: 'all', label: 'Tất cả' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={statusFilter === tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'min-h-[44px] px-3 rounded-lg text-xs sm:text-sm font-medium border cursor-pointer transition-colors',
                  statusFilter === tab.id
                    ? 'bg-[var(--accent-primary)] text-white border-transparent'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]',
                )}
              >
                {tab.label}
              </button>
            ))}

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as TaskPriority | 'all')
              }
              aria-label="Lọc theo mức độ ưu tiên"
              className="min-h-[44px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm text-[var(--text-primary)]"
            >
              <option value="all">Mọi ưu tiên</option>
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              aria-label="Lọc theo môn học"
              className="min-h-[44px] max-w-[200px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm text-[var(--text-primary)]"
            >
              <option value="all">Mọi môn học</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            Thêm công việc
          </Button>
        </CardBody>
      </Card>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" aria-hidden="true" />}
          title="Chưa có công việc nào khớp bộ lọc"
          description="Thử chuyển trạng thái lọc hoặc tạo mới đầu việc cần theo dõi."
          actionLabel="Thêm công việc mới"
          onAction={() => {
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const course = courses.find((c) => c.id === task.courseId);
            const priorityMeta = TASK_PRIORITY_META[task.priority];
            const isOverdue = task.status === 'todo' && task.dueDate < today;
            const isCollision =
              task.status === 'todo' &&
              collisions.some((g) => g.dueDate === task.dueDate);
            const doneSub = task.subtasks.filter((s) => s.done).length;

            return (
              <Card
                key={task.id}
                className={cn(
                  isOverdue && 'border-[var(--status-danger)]/45',
                  isCollision && !isOverdue && 'border-[var(--status-warning)]/45',
                )}
              >
                <CardBody className="pt-4 space-y-3">
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <label className="min-h-[44px] min-w-[44px] -m-1.5 flex items-center justify-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={() => {
                            onToggleTaskStatus(task.id);
                            showToast(
                              task.status === 'done'
                                ? `Đã chuyển "${task.title}" về Cần làm.`
                                : `Đã hoàn thành "${task.title}".`,
                              'success',
                            );
                          }}
                          aria-label={`Đánh dấu hoàn thành: ${task.title}`}
                          className="h-5 w-5 rounded accent-[var(--accent-primary)] cursor-pointer"
                        />
                      </label>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant={priorityMeta.variant}>
                            {priorityMeta.label}
                          </Badge>
                          <Badge variant="default">
                            {TASK_STATUS_LABELS[task.status]}
                          </Badge>
                          {course && (
                            <Badge variant="primary">{course.code}</Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="danger">Quá hạn</Badge>
                          )}
                          {isCollision && (
                            <Badge
                              variant="warning"
                              icon={<AlertTriangle className="h-3 w-3" />}
                            >
                              Trùng hạn ngày này
                            </Badge>
                          )}
                        </div>

                        <h3
                          className={cn(
                            'text-base font-semibold text-[var(--text-primary)]',
                            task.status === 'done' &&
                              'line-through text-[var(--text-muted)]',
                          )}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-sm text-[var(--text-secondary)]">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)] tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>
                              Hạn: {formatRelativeDayLabel(task.dueDate)}
                              {task.dueTime ? ` lúc ${task.dueTime}` : ''}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{REMINDER_LABELS[task.reminderBefore]}</span>
                          </span>
                          {task.estimatedMinutes && (
                            <span>Ước lượng: ~{task.estimatedMinutes} phút</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Task actions */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {task.status === 'todo' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<CalendarPlus className="h-3.5 w-3.5" />}
                            onClick={() => {
                              const nextDate = addDays(task.dueDate, 1);
                              onUpdateTask(task.id, { dueDate: nextDate });
                              showToast(
                                `Đã dời sang ${formatRelativeDayLabel(nextDate)}.`,
                                'info',
                              );
                            }}
                          >
                            Dời +1 ngày
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (rescheduleOpenId === task.id) {
                                setRescheduleOpenId(null);
                              } else {
                                setRescheduleOpenId(task.id);
                                setCustomDateDraft(task.dueDate);
                              }
                            }}
                          >
                            Chọn ngày
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Chỉnh sửa ${task.title}`}
                        onClick={() => {
                          setEditingTask(task);
                          setTaskModalOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </Button>

                      {task.status !== 'archived' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Lưu trữ ${task.title}`}
                          title="Lưu trữ"
                          onClick={() => {
                            onArchiveTask(task.id);
                            showToast(`Đã lưu trữ "${task.title}".`, 'info');
                          }}
                        >
                          <Archive className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                          onClick={() => {
                            onUpdateTask(task.id, { status: 'todo' });
                            showToast(`Đã khôi phục "${task.title}".`, 'success');
                          }}
                        >
                          Khôi phục
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Xóa ${task.title}`}
                        title="Xóa công việc"
                        onClick={() => {
                          onDeleteTask(task.id);
                          showToast(`Đã xóa "${task.title}".`, 'info');
                        }}
                      >
                        <Trash2
                          className="h-4 w-4 text-[var(--status-danger)]"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Custom reschedule inline picker */}
                  {rescheduleOpenId === task.id && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-2.5">
                      <label className="text-xs font-medium text-[var(--text-secondary)]">
                        Đổi hạn sang ngày:
                      </label>
                      <input
                        type="date"
                        value={customDateDraft}
                        onChange={(e) => setCustomDateDraft(e.target.value)}
                        aria-label={`Ngày hạn mới cho ${task.title}`}
                        className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-xs text-[var(--text-primary)] tabular-nums"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          if (!customDateDraft) return;
                          onUpdateTask(task.id, { dueDate: customDateDraft });
                          setRescheduleOpenId(null);
                          showToast(
                            `Đã đổi hạn sang ${formatRelativeDayLabel(customDateDraft)}.`,
                            'success',
                          );
                        }}
                      >
                        Áp dụng
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRescheduleOpenId(null)}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}

                  {/* Subtasks & Freshman 4-milestone generator */}
                  <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/40 p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 tabular-nums">
                        <CheckCircle2
                          className="h-4 w-4 text-[var(--accent-primary)]"
                          aria-hidden="true"
                        />
                        <span>
                          Bước nhỏ ({doneSub}/{task.subtasks.length})
                        </span>
                      </span>

                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                        onClick={() => handleApplyMilestones(task)}
                      >
                        Gợi ý chia mốc bài tập lớn
                      </Button>
                    </div>

                    {task.subtasks.length > 0 && (
                      <ul className="space-y-1.5">
                        {task.subtasks.map((sub) => (
                          <li
                            key={sub.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-[var(--bg-surface)] px-2.5 py-1.5 border border-[var(--border-hairline)]"
                          >
                            <label className="flex items-center gap-2.5 min-w-0 flex-1 min-h-[44px] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sub.done}
                                onChange={() =>
                                  onToggleSubtask(task.id, sub.id)
                                }
                                className="h-4 w-4 rounded accent-[var(--accent-primary)] cursor-pointer shrink-0"
                              />
                              <span
                                className={cn(
                                  'text-xs sm:text-sm',
                                  sub.done
                                    ? 'line-through text-[var(--text-muted)]'
                                    : 'text-[var(--text-primary)]',
                                )}
                              >
                                {sub.title}
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => onDeleteSubtask(task.id, sub.id)}
                              aria-label={`Xóa bước nhỏ ${sub.title}`}
                              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--status-danger)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      onSubmit={(e) => handleAddSubtaskSubmit(task.id, e)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={subtaskDrafts[task.id] ?? ''}
                        onChange={(e) =>
                          setSubtaskDrafts((prev) => ({
                            ...prev,
                            [task.id]: e.target.value,
                          }))
                        }
                        placeholder="Thêm bước nhỏ mới..."
                        aria-label={`Thêm bước nhỏ cho ${task.title}`}
                        className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm text-[var(--text-primary)]"
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Thêm bước
                      </Button>
                    </form>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <TaskFormModal
        isOpen={taskModalOpen}
        editingTask={editingTask}
        courses={courses}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
}
