import type {
  Course,
  ScheduleCategory,
  TaskPriority,
  TaskStatus,
} from '../../types/models';
import {
  expandScheduleOccurrences,
  timeToMinutes,
  type ExpandedScheduleOccurrence,
} from '../../utils/dateUtils';
import type { ScheduleEvent } from '../../types/models';

export interface ScheduleCategoryMeta {
  label: string;
  badgeVariant: 'primary' | 'danger' | 'success' | 'warning';
  surfaceClass: string;
  borderClass: string;
  dotClass: string;
}

export const SCHEDULE_CATEGORY_META: Record<
  ScheduleCategory,
  ScheduleCategoryMeta
> = {
  class: {
    label: 'Lịch học',
    badgeVariant: 'primary',
    surfaceClass: 'bg-[var(--accent-primary-soft)]/70',
    borderClass: 'border-l-4 border-l-[var(--accent-primary)]',
    dotClass: 'bg-[var(--accent-primary)]',
  },
  exam: {
    label: 'Lịch thi',
    badgeVariant: 'danger',
    surfaceClass: 'bg-[var(--status-danger-soft)]/70',
    borderClass: 'border-l-4 border-l-[var(--status-danger)]',
    dotClass: 'bg-[var(--status-danger)]',
  },
  event: {
    label: 'Sự kiện',
    badgeVariant: 'success',
    surfaceClass: 'bg-[var(--status-success-soft)]/70',
    borderClass: 'border-l-4 border-l-[var(--status-success)]',
    dotClass: 'bg-[var(--status-success)]',
  },
  personal: {
    label: 'Cá nhân',
    badgeVariant: 'warning',
    surfaceClass: 'bg-[var(--status-warning-soft)]/70',
    borderClass: 'border-l-4 border-l-[var(--status-warning)]',
    dotClass: 'bg-[var(--status-warning)]',
  },
};

export const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; variant: 'danger' | 'warning' | 'default'; rank: number }
> = {
  high: { label: 'Ưu tiên cao', variant: 'danger', rank: 0 },
  medium: { label: 'Trung bình', variant: 'warning', rank: 1 },
  low: { label: 'Thấp', variant: 'default', rank: 2 },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Cần làm',
  done: 'Đã xong',
  archived: 'Đã lưu trữ',
};

export const REMINDER_LABELS: Record<
  'none' | '1h' | '1d' | '3d',
  string
> = {
  none: 'Không nhắc',
  '1h': 'Trước 1 giờ',
  '1d': 'Trước 1 ngày',
  '3d': 'Trước 3 ngày',
};

export const FRESHMAN_PROJECT_MILESTONES = [
  'Đọc kỹ đề bài, tiêu chí chấm & mốc nộp bài',
  'Thu thập tài liệu & lập dàn ý khung giải quyết',
  'Hoàn thành bản nháp đầu tiên (khoảng 70% khối lượng)',
  'Kiểm tra lại lỗi, định dạng & nộp bài trước hạn 3 giờ',
];

export interface StudyGapSlot {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  kind: 'between_classes' | 'open_block';
  label: string;
  suggestion: string;
}

function minutesToHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDurationVi(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

/**
 * Tính các khoảng trống học tập / nghỉ ngơi trong ngày (khung 07:00 – 21:30)
 */
export function computeDayStudyGaps(
  events: ScheduleEvent[],
  dateKey: string,
): StudyGapSlot[] {
  const dayStart = 7 * 60;
  const dayEnd = 21 * 60 + 30;
  const occurrences = expandScheduleOccurrences(events, dateKey, dateKey);

  if (occurrences.length === 0) {
    return [
      {
        id: 'gap-all-day',
        startTime: '08:30',
        endTime: '11:30',
        durationMinutes: 180,
        kind: 'open_block',
        label: 'Buổi sáng trống lịch',
        suggestion:
          'Phù hợp cho 2–3 phiên tập trung 25p xử lý bài tập ưu tiên cao.',
      },
    ];
  }

  const intervals = occurrences
    .map((ev) => ({
      start: Math.max(dayStart, timeToMinutes(ev.startTime)),
      end: Math.min(dayEnd, timeToMinutes(ev.endTime)),
    }))
    .filter((item) => item.end > item.start)
    .sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const curr of intervals) {
    const last = merged[merged.length - 1];
    if (!last || curr.start > last.end) {
      merged.push({ ...curr });
    } else {
      last.end = Math.max(last.end, curr.end);
    }
  }

  const gaps: StudyGapSlot[] = [];

  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = merged[i].end;
    const gapEnd = merged[i + 1].start;
    const duration = gapEnd - gapStart;
    if (duration >= 30) {
      const startTime = minutesToHHMM(gapStart);
      const endTime = minutesToHHMM(gapEnd);
      const includesLunch = gapStart <= 12 * 60 + 30 && gapEnd >= 11 * 60 + 30;
      gaps.push({
        id: `gap-between-${i}`,
        startTime,
        endTime,
        durationMinutes: duration,
        kind: 'between_classes',
        label: `Khoảng trống giữa 2 buổi (${startTime} – ${endTime})`,
        suggestion: includesLunch
          ? 'Nghỉ trưa, ăn uống và dành 25 phút ôn nhanh ghi chú trước ca chiều.'
          : duration >= 60
            ? 'Đủ 1–2 phiên Pomodoro 25p tại thư viện hoặc làm bài tập ngắn.'
            : 'Nghỉ mắt, di chuyển giữa các tòa nhà và xem trước nội dung tiết sau.',
      });
    }
  }

  const lastEnd = merged[merged.length - 1]?.end ?? dayStart;
  if (dayEnd - lastEnd >= 45) {
    const startTime = minutesToHHMM(lastEnd);
    const endTime = minutesToHHMM(dayEnd);
    gaps.push({
      id: 'gap-evening',
      startTime,
      endTime,
      durationMinutes: dayEnd - lastEnd,
      kind: 'open_block',
      label: `Khung trống cuối ngày (${startTime} – ${endTime})`,
      suggestion:
        'Hoàn tất 1–2 phiên tập trung cho deadline gần nhất và nghỉ ngơi đúng giờ.',
    });
  }

  return gaps;
}

export function resolveCourseForOccurrence(
  occurrence: ExpandedScheduleOccurrence,
  courses: Course[],
): Course | undefined {
  if (!occurrence.courseId) return undefined;
  return courses.find((c) => c.id === occurrence.courseId);
}

export function getMonthGridDates(year: number, monthZeroBased: number): string[] {
  const firstDay = new Date(year, monthZeroBased, 1, 12, 0, 0, 0);
  const weekday = firstDay.getDay(); // 0 = CN, 1 = T2 ... 6 = T7
  const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;

  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() + offsetToMonday);

  const cells: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    cells.push(`${y}-${m}-${day}`);
  }
  return cells;
}

export function playGentleChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5 gentle triad

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.001, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.16 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.6);
    });

    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch {
    // Ignore audio context restrictions gracefully
  }
}
