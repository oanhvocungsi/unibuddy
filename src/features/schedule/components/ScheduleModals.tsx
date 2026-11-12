import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Clock,
  Edit3,
  FileUp,
  Info,
  MapPin,
  Repeat,
  Trash2,
  User,
} from 'lucide-react';
import { Badge, Button, Modal, useToast } from '../../../components/ui';
import type {
  Course,
  ScheduleCategory,
  ScheduleEvent,
  ScheduleRecurrence,
} from '../../../types/models';
import {
  formatFullDateVi,
  timeToMinutes,
  todayKey,
  type ExpandedScheduleOccurrence,
} from '../../../utils/dateUtils';
import { parseICSToScheduleEvents } from '../../../utils/icsUtils';
import { SCHEDULE_CATEGORY_META } from '../scheduleHelpers';

interface EventDetailModalProps {
  occurrence: ExpandedScheduleOccurrence | null;
  courses: Course[];
  onClose: () => void;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
}

export function EventDetailModal({
  occurrence,
  courses,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [occurrence?.id]);

  if (!occurrence) return null;

  const meta = SCHEDULE_CATEGORY_META[occurrence.category];
  const course = occurrence.courseId
    ? courses.find((c) => c.id === occurrence.courseId)
    : undefined;

  return (
    <Modal
      isOpen={Boolean(occurrence)}
      onClose={onClose}
      title={occurrence.title}
      description={formatFullDateVi(occurrence.occurrenceDate)}
      footer={
        confirmDelete ? (
          <div className="w-full flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-[var(--status-danger)]">
              {occurrence.recurrence === 'weekly'
                ? 'Xóa toàn bộ chuỗi lịch lặp hàng tuần này?'
                : 'Xác nhận xóa lịch này khỏi thời khóa biểu?'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(occurrence.id);
                  onClose();
                }}
              >
                Xác nhận xóa
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmDelete(true)}
            >
              Xóa
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit3 className="h-4 w-4" />}
                onClick={() => {
                  onClose();
                  onEdit(occurrence);
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          {occurrence.recurrence === 'weekly' && (
            <Badge variant="outline" icon={<Repeat className="h-3.5 w-3.5" />}>
              Lặp hàng tuần ({occurrence.recurrenceWeeks ?? 12} tuần)
            </Badge>
          )}
          {occurrence.source === 'imported' && (
            <Badge variant="default">Đã nhập / Mẫu</Badge>
          )}
          {occurrence.source === 'club' && (
            <Badge variant="success">CLB / Sự kiện</Badge>
          )}
        </div>

        <dl className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2.5">
            <Clock
              className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <dt className="sr-only">Thời gian</dt>
              <dd className="font-medium text-[var(--text-primary)] tabular-nums">
                {occurrence.startTime} – {occurrence.endTime}
              </dd>
            </div>
          </div>

          {occurrence.location && (
            <div className="flex items-start gap-2.5">
              <MapPin
                className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <dt className="sr-only">Địa điểm</dt>
                <dd className="text-[var(--text-primary)]">
                  {occurrence.location}
                </dd>
              </div>
            </div>
          )}

          {course && (
            <>
              <div className="flex items-start gap-2.5">
                <BookOpen
                  className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <dt className="sr-only">Học phần</dt>
                  <dd className="text-[var(--text-primary)]">
                    <span className="font-semibold">{course.code}</span> —{' '}
                    {course.name}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <User
                  className="h-4 w-4 text-[var(--text-muted)] mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <dt className="sr-only">Giảng viên</dt>
                  <dd className="text-[var(--text-secondary)]">
                    Giảng viên: {course.instructor}
                  </dd>
                </div>
              </div>
            </>
          )}

          {occurrence.note && (
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/60 p-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              {occurrence.note}
            </div>
          )}
        </dl>
      </div>
    </Modal>
  );
}

interface EventFormModalProps {
  isOpen: boolean;
  editingEvent: ScheduleEvent | null;
  defaultDate?: string;
  courses: Course[];
  onClose: () => void;
  onSave: (
    payload: Omit<ScheduleEvent, 'id'>,
    editingId?: string,
  ) => void;
}

export function EventFormModal({
  isOpen,
  editingEvent,
  defaultDate,
  courses,
  onClose,
  onSave,
}: EventFormModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('class');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(defaultDate ?? todayKey());
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:30');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [recurrence, setRecurrence] = useState<ScheduleRecurrence>('none');
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(15);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingEvent) {
      setTitle(editingEvent.title);
      setCategory(editingEvent.category);
      setCourseId(editingEvent.courseId ?? '');
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setLocation(editingEvent.location ?? '');
      setNote(editingEvent.note ?? '');
      setRecurrence(editingEvent.recurrence);
      setRecurrenceWeeks(editingEvent.recurrenceWeeks ?? 15);
    } else {
      setTitle('');
      setCategory('class');
      setCourseId('');
      setDate(defaultDate ?? todayKey());
      setStartTime('07:30');
      setEndTime('09:30');
      setLocation('');
      setNote('');
      setRecurrence('none');
      setRecurrenceWeeks(15);
    }
  }, [isOpen, editingEvent, defaultDate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Vui lòng nhập tiêu đề lịch học hoặc sự kiện.');
      return;
    }
    if (!date) {
      setError('Vui lòng chọn ngày diễn ra.');
      return;
    }
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setError('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    onSave(
      {
        title: cleanTitle,
        category,
        courseId: courseId || undefined,
        date,
        startTime,
        endTime,
        location: location.trim() || undefined,
        note: note.trim() || undefined,
        recurrence,
        recurrenceWeeks:
          recurrence === 'weekly'
            ? Math.max(1, Math.min(52, recurrenceWeeks || 12))
            : undefined,
        source: editingEvent?.source ?? 'personal',
        linkedEventId: editingEvent?.linkedEventId,
      },
      editingEvent?.id,
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? 'Chỉnh sửa lịch' : 'Thêm lịch mới'}
      description="Điền thông tin ca học, lịch thi hoặc hoạt động cá nhân của bạn."
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
            htmlFor="event-title"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Tên lịch / Môn học <span className="text-[var(--status-danger)]">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Nhập môn Lập trình (IT1010) hoặc Ôn nhóm thư viện"
            className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="event-category"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Loại lịch
            </label>
            <select
              id="event-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ScheduleCategory)
              }
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="class">Lịch học</option>
              <option value="exam">Lịch thi</option>
              <option value="event">Sự kiện</option>
              <option value="personal">Cá nhân</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="event-course"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Gắn với học phần (tùy chọn)
            </label>
            <select
              id="event-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
            >
              <option value="">Không gắn môn</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="event-date"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Ngày
            </label>
            <input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="event-start"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Giờ bắt đầu
            </label>
            <input
              id="event-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="event-end"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1"
            >
              Giờ kết thúc
            </label>
            <input
              id="event-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="event-location"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Phòng học / Địa điểm
          </label>
          <input
            id="event-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ví dụ: Phòng B1-302 hoặc Thư viện TV-01"
            className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
          />
        </div>

        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 space-y-2.5">
          <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer text-sm font-medium text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={recurrence === 'weekly'}
              onChange={(e) =>
                setRecurrence(e.target.checked ? 'weekly' : 'none')
              }
              className="h-4 w-4 accent-[var(--accent-primary)]"
            />
            <span>Lặp lại hàng tuần vào cùng thứ & khung giờ này</span>
          </label>

          {recurrence === 'weekly' && (
            <div className="flex items-center gap-2 pl-6">
              <label
                htmlFor="event-weeks"
                className="text-xs sm:text-sm text-[var(--text-secondary)]"
              >
                Số tuần lặp:
              </label>
              <input
                id="event-weeks"
                type="number"
                min={1}
                max={52}
                value={recurrenceWeeks}
                onChange={(e) =>
                  setRecurrenceWeeks(Number(e.target.value) || 1)
                }
                className="w-20 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-sm text-[var(--text-primary)] tabular-nums"
              />
              <span className="text-xs text-[var(--text-muted)]">
                (1 – 52 tuần)
              </span>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="event-note"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Ghi chú chuẩn bị
          </label>
          <textarea
            id="event-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Mang theo laptop, thẻ sinh viên hoặc bài đọc trước..."
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            {editingEvent ? 'Lưu thay đổi' : 'Thêm vào lịch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface ICSImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (events: Omit<ScheduleEvent, 'id'>[]) => {
    added: number;
    skipped: number;
  };
}

export function ICSImportModal({
  isOpen,
  onClose,
  onImport,
}: ICSImportModalProps) {
  const { showToast } = useToast();
  const [icsText, setIcsText] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIcsText('');
      setWarnings([]);
      setPreviewCount(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setIcsText(content);
      const parsed = parseICSToScheduleEvents(content);
      setWarnings(parsed.warnings);
      setPreviewCount(parsed.events.length);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleAnalyzeAndImport = () => {
    const parsed = parseICSToScheduleEvents(icsText);
    setWarnings(parsed.warnings);
    setPreviewCount(parsed.events.length);
    if (parsed.events.length === 0) return;

    const result = onImport(parsed.events);
    showToast(
      `Đã nhập ${result.added} lịch mới${result.skipped > 0 ? ` (bỏ qua ${result.skipped} mục trùng)` : ''}.`,
      'success',
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập / Đồng bộ lịch chuẩn .ics"
      description="Hỗ trợ tệp iCalendar (.ics) từ cổng đào tạo, Google Calendar hoặc Microsoft Outlook."
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3.5 space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Info className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Hướng dẫn đồng bộ với Google Calendar & Outlook</span>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Google Calendar:</strong> Mở Google Calendar trên máy tính → Cài đặt (bánh răng) → <em>Nhập và xuất</em> → chọn tệp <code>.ics</code> vừa xuất từ UniBuddy.
            </li>
            <li>
              <strong>Microsoft Outlook:</strong> Mở Lịch Outlook → <em>Thêm lịch</em> → <em>Tải lên từ tệp</em> → chọn tệp <code>.ics</code> để đưa toàn bộ lịch học/lịch thi vào lịch trường.
            </li>
          </ul>
        </div>

        <div>
          <label
            htmlFor="ics-file-input"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            Chọn tệp .ics từ máy của bạn
          </label>
          <label
            htmlFor="ics-file-input"
            className="min-h-[48px] inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
          >
            <FileUp className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Tải tệp .ics lên</span>
            <input
              id="ics-file-input"
              type="file"
              accept=".ics,text/calendar"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </div>

        <div>
          <label
            htmlFor="ics-raw-text"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Hoặc dán trực tiếp nội dung VCALENDAR (.ics)
          </label>
          <textarea
            id="ics-raw-text"
            rows={5}
            value={icsText}
            onChange={(e) => {
              setIcsText(e.target.value);
              setPreviewCount(null);
            }}
            placeholder="BEGIN:VCALENDAR&#10;VERSION:2.0&#10;BEGIN:VEVENT&#10;SUMMARY:Nhập môn Lập trình..."
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 font-mono text-xs text-[var(--text-primary)]"
          />
        </div>

        {previewCount !== null && (
          <p className="text-xs sm:text-sm font-medium text-[var(--accent-primary)] flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <span>Nhận diện được {previewCount} sự kiện hợp lệ trong tệp.</span>
          </p>
        )}

        {warnings.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-[var(--status-warning)]/40 bg-[var(--status-warning-soft)]/60 p-3 text-xs text-[var(--text-primary)] space-y-1"
          >
            {warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="primary"
            disabled={!icsText.trim()}
            onClick={handleAnalyzeAndImport}
          >
            Nhập vào thời khóa biểu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
