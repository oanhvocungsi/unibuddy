import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  MapPin,
  Plus,
  Target,
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
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type {
  Course,
  ReminderBefore,
  ScheduleCategory,
  TaskPriority,
} from '../../types/models';
import { cn } from '../../utils/cn';
import { formatRelativeDayLabel, todayOffset } from '../../utils/dateUtils';
import { TASK_PRIORITY_META } from './courseConstants';

const SCHEDULE_CATEGORY_LABELS: Record<ScheduleCategory, string> = {
  class: 'Lịch học',
  exam: 'Lịch thi',
  event: 'Hoạt động',
  personal: 'Tự học',
};

interface CourseOverviewTabProps {
  course: Course;
  onEditCourse: () => void;
}

export function CourseOverviewTab({
  course,
  onEditCourse,
}: CourseOverviewTabProps) {
  const { state, addTask, toggleTaskStatus } = useAppStore();
  const { showToast } = useToast();
  const formId = useId();

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(() => todayOffset(2));
  const [taskDueTime, setTaskDueTime] = useState('23:59');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskReminder, setTaskReminder] = useState<ReminderBefore>('1d');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskError, setTaskError] = useState('');

  const courseEvents = state.scheduleEvents
    .filter((ev) => ev.courseId === course.id)
    .sort((a, b) =>
      a.date !== b.date
        ? a.date.localeCompare(b.date)
        : a.startTime.localeCompare(b.startTime),
    );

  const courseTasks = state.tasks
    .filter((t) => t.courseId === course.id && t.status !== 'archived')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setTaskError('Vui lòng nhập tên bài tập hoặc hạn nộp.');
      return;
    }
    if (!taskDueDate) {
      setTaskError('Vui lòng chọn ngày đến hạn.');
      return;
    }

    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      courseId: course.id,
      dueDate: taskDueDate,
      dueTime: taskDueTime || undefined,
      priority: taskPriority,
      reminderBefore: taskReminder,
      subtasks: [],
      isSample: false,
    });

    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate(todayOffset(2));
    setTaskDueTime('23:59');
    setTaskPriority('medium');
    setTaskReminder('1d');
    setTaskError('');
    setShowAddTask(false);
    showToast(`Đã thêm hạn nộp mới cho môn ${course.code}`, 'success');
  };

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left column: Goal & Syllabus */}
      <div className="lg:col-span-5 space-y-5 min-w-0">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 min-w-0">
              <Target
                className="h-5 w-5 text-[var(--accent-primary)] shrink-0"
                aria-hidden="true"
              />
              <CardTitle>Mục tiêu & Đề cương</CardTitle>
            </div>
            <Button size="sm" variant="ghost" onClick={onEditCourse}>
              Cập nhật
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {course.targetGrade && (
                <Badge variant="primary">Mục tiêu: {course.targetGrade}</Badge>
              )}
              {typeof course.currentScore === 'number' && (
                <Badge variant="success">
                  Điểm hiện tại: {course.currentScore.toFixed(1)}/10
                </Badge>
              )}
            </div>

            {course.description ? (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                {course.description}
              </p>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">
                Chưa có mô tả mục tiêu cho học phần này. Nhấn &ldquo;Cập nhật&rdquo; để bổ sung.
              </p>
            )}

            <div className="pt-2 border-t border-[var(--border-hairline)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2.5">
                Nội dung trọng tâm theo đề cương
              </h4>
              {course.syllabusHighlights && course.syllabusHighlights.length > 0 ? (
                <ul className="space-y-2">
                  {course.syllabusHighlights.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: course.color }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  Chưa ghi chú đề cương. Bạn có thể thêm các chương hoặc tỷ trọng điểm khi chỉnh sửa môn học.
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 min-w-0">
              <CalendarClock
                className="h-5 w-5 text-[var(--accent-primary)] shrink-0"
                aria-hidden="true"
              />
              <CardTitle>Lịch học & Lịch thi của môn</CardTitle>
            </div>
            <Link
              to="/lich"
              className="text-xs font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap min-h-[44px] inline-flex items-center"
            >
              Mở lịch đầy đủ
            </Link>
          </CardHeader>
          <CardBody>
            {courseEvents.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Chưa có buổi học hoặc lịch thi nào gắn với môn {course.code}.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {courseEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)] break-words">
                        {ev.title}
                      </span>
                      <Badge
                        variant={ev.category === 'exam' ? 'danger' : 'default'}
                      >
                        {SCHEDULE_CATEGORY_LABELS[ev.category]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatRelativeDayLabel(ev.date)} • {ev.startTime}–{ev.endTime}
                      </span>
                      {ev.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Right column: Course Tasks & Inline Quick Add */}
      <div className="lg:col-span-7 min-w-0">
        <Card>
          <CardHeader className="flex-wrap gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <ListTodo
                className="h-5 w-5 text-[var(--accent-primary)] shrink-0"
                aria-hidden="true"
              />
              <div>
                <CardTitle>Bài tập & Hạn nộp của môn</CardTitle>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                  {courseTasks.filter((t) => t.status === 'todo').length} việc cần làm
                  {' • '}
                  {courseTasks.filter((t) => t.status === 'done').length} đã xong
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={showAddTask ? 'secondary' : 'primary'}
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setShowAddTask((prev) => !prev);
                setTaskError('');
              }}
            >
              {showAddTask ? 'Đóng biểu mẫu' : 'Thêm bài tập / hạn nộp cho môn này'}
            </Button>
          </CardHeader>

          <CardBody className="space-y-4">
            {showAddTask && (
              <form
                onSubmit={handleAddTask}
                noValidate
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)]/70 p-4 space-y-3"
              >
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Tạo hạn nộp mới cho {course.code}
                </h4>

                <div>
                  <label
                    htmlFor={`${formId}-task-title`}
                    className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Tên bài tập / hạn nộp <span className="text-[var(--status-danger)]">*</span>
                  </label>
                  <input
                    id={`${formId}-task-title`}
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Ví dụ: Nộp báo cáo thực hành tuần 5"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label
                      htmlFor={`${formId}-task-date`}
                      className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                    >
                      Ngày hạn nộp
                    </label>
                    <input
                      id={`${formId}-task-date`}
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className={cn(inputClass, 'tabular-nums')}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${formId}-task-time`}
                      className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                    >
                      Giờ hạn
                    </label>
                    <input
                      id={`${formId}-task-time`}
                      type="time"
                      value={taskDueTime}
                      onChange={(e) => setTaskDueTime(e.target.value)}
                      className={cn(inputClass, 'tabular-nums')}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${formId}-task-priority`}
                      className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                    >
                      Mức ưu tiên
                    </label>
                    <select
                      id={`${formId}-task-priority`}
                      value={taskPriority}
                      onChange={(e) =>
                        setTaskPriority(e.target.value as TaskPriority)
                      }
                      className={inputClass}
                    >
                      <option value="high">Cao</option>
                      <option value="medium">Trung bình</option>
                      <option value="low">Thấp</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`${formId}-task-reminder`}
                      className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                    >
                      Nhắc trước
                    </label>
                    <select
                      id={`${formId}-task-reminder`}
                      value={taskReminder}
                      onChange={(e) =>
                        setTaskReminder(e.target.value as ReminderBefore)
                      }
                      className={inputClass}
                    >
                      <option value="1h">Trước 1 giờ</option>
                      <option value="1d">Trước 1 ngày</option>
                      <option value="3d">Trước 3 ngày</option>
                      <option value="none">Không nhắc</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-task-desc`}
                    className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Ghi chú yêu cầu (tùy chọn)
                  </label>
                  <input
                    id={`${formId}-task-desc`}
                    type="text"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Ví dụ: Nộp định dạng PDF trên LMS"
                    className={inputClass}
                  />
                </div>

                {taskError && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-[var(--status-danger)]"
                  >
                    {taskError}
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddTask(false)}
                  >
                    Hủy
                  </Button>
                  <Button size="sm" type="submit" variant="primary">
                    Lưu hạn nộp
                  </Button>
                </div>
              </form>
            )}

            {courseTasks.length === 0 ? (
              <EmptyState
                title="Chưa có bài tập hoặc hạn nộp nào"
                description="Thêm hạn nộp riêng cho môn học này để luôn chủ động trước tuần thi."
                actionLabel="Thêm bài tập đầu tiên"
                onAction={() => setShowAddTask(true)}
              />
            ) : (
              <ul className="space-y-2.5">
                {courseTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const prio = TASK_PRIORITY_META[task.priority];
                  const completedSubs = task.subtasks.filter((s) => s.done).length;
                  return (
                    <li
                      key={task.id}
                      className={cn(
                        'rounded-xl border border-[var(--border-hairline)] p-3.5 transition-colors',
                        isDone
                          ? 'bg-[var(--bg-surface-subtle)]/50 opacity-80'
                          : 'bg-[var(--bg-surface)]',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id)}
                          aria-label={
                            isDone
                              ? `Đánh dấu chưa xong: ${task.title}`
                              : `Đánh dấu đã hoàn thành: ${task.title}`
                          }
                          className="min-h-[44px] min-w-[44px] -m-1.5 inline-flex items-center justify-center rounded-lg text-[var(--accent-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2
                              className="h-5 w-5 text-[var(--status-success)]"
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p
                              className={cn(
                                'text-sm font-semibold break-words',
                                isDone
                                  ? 'line-through text-[var(--text-muted)]'
                                  : 'text-[var(--text-primary)]',
                              )}
                            >
                              {task.title}
                            </p>
                            <Badge variant={isDone ? 'success' : prio.variant}>
                              {isDone ? 'Đã xong' : prio.label}
                            </Badge>
                          </div>

                          {task.description && (
                            <p className="mt-1 text-xs text-[var(--text-secondary)] break-words">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] tabular-nums">
                            <span>
                              Hạn: {formatRelativeDayLabel(task.dueDate)}
                              {task.dueTime ? ` • ${task.dueTime}` : ''}
                            </span>
                            {task.subtasks.length > 0 && (
                              <span>
                                Bước nhỏ: {completedSubs}/{task.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
