import type { ScheduleEvent, TaskItem } from '../types/models';

const PAD = (n: number): string => String(n).padStart(2, '0');

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${PAD(date.getMonth() + 1)}-${PAD(date.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function todayOffset(daysFromToday: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return toDateKey(d);
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDays(dateKey: string, days: number): string {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/**
 * Trả về ngày Thứ 2 đầu tuần (chuẩn tuần học Việt Nam: Thứ 2 -> Chủ nhật)
 */
export function startOfWeekKey(anchorDateKey: string): string {
  const d = parseDateKey(anchorDateKey);
  const day = d.getDay(); // 0 = CN, 1 = T2 ... 6 = T7
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toDateKey(d);
}

export function getWeekDateKeys(anchorDateKey: string): string[] {
  const monday = startOfWeekKey(anchorDateKey);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const WEEKDAY_LONG = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function formatWeekdayShort(dateKey: string): string {
  return WEEKDAY_SHORT[parseDateKey(dateKey).getDay()];
}

export function formatWeekdayLong(dateKey: string): string {
  return WEEKDAY_LONG[parseDateKey(dateKey).getDay()];
}

export function formatShortDate(dateKey: string): string {
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  return `${parts[2]}/${parts[1]}`;
}

export function formatFullDateVi(dateKey: string): string {
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  const weekday = formatWeekdayLong(dateKey);
  return `${weekday}, ${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatRelativeDayLabel(dateKey: string): string {
  const t = todayKey();
  if (dateKey === t) return `Hôm nay (${formatShortDate(dateKey)})`;
  if (dateKey === addDays(t, 1)) return `Ngày mai (${formatShortDate(dateKey)})`;
  if (dateKey === addDays(t, -1)) return `Hôm qua (${formatShortDate(dateKey)})`;
  return `${formatWeekdayLong(dateKey)} (${formatShortDate(dateKey)})`;
}

export function formatCurrencyVND(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} đ`;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function hasTimeOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  const s1 = timeToMinutes(aStart);
  const e1 = timeToMinutes(aEnd);
  const s2 = timeToMinutes(bStart);
  const e2 = timeToMinutes(bEnd);
  return s1 < e2 && s2 < e1;
}

export interface ExpandedScheduleOccurrence extends ScheduleEvent {
  occurrenceDate: string;
  isRecurringInstance: boolean;
}

/**
 * Mở rộng các lịch học lặp hàng tuần thành từng buổi cụ thể trong khoảng [rangeStart, rangeEnd]
 */
export function expandScheduleOccurrences(
  events: ScheduleEvent[],
  rangeStart: string,
  rangeEnd: string,
): ExpandedScheduleOccurrence[] {
  const result: ExpandedScheduleOccurrence[] = [];

  for (const event of events) {
    if (event.recurrence !== 'weekly') {
      if (event.date >= rangeStart && event.date <= rangeEnd) {
        result.push({
          ...event,
          occurrenceDate: event.date,
          isRecurringInstance: false,
        });
      }
      continue;
    }

    const totalWeeks = Math.max(1, Math.min(52, event.recurrenceWeeks ?? 12));
    for (let week = 0; week < totalWeeks; week++) {
      const occDate = addDays(event.date, week * 7);
      if (occDate > rangeEnd) break;
      if (occDate >= rangeStart) {
        result.push({
          ...event,
          occurrenceDate: occDate,
          isRecurringInstance: week > 0,
        });
      }
    }
  }

  return result.sort((a, b) => {
    if (a.occurrenceDate !== b.occurrenceDate) {
      return a.occurrenceDate.localeCompare(b.occurrenceDate);
    }
    return a.startTime.localeCompare(b.startTime);
  });
}

export interface ScheduleConflictPair {
  date: string;
  first: ExpandedScheduleOccurrence;
  second: ExpandedScheduleOccurrence;
}

export function findScheduleConflicts(
  occurrences: ExpandedScheduleOccurrence[],
): ScheduleConflictPair[] {
  const conflicts: ScheduleConflictPair[] = [];
  const byDate = new Map<string, ExpandedScheduleOccurrence[]>();

  for (const item of occurrences) {
    const list = byDate.get(item.occurrenceDate) ?? [];
    list.push(item);
    byDate.set(item.occurrenceDate, list);
  }

  for (const [date, items] of byDate.entries()) {
    const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].id === sorted[j].id) continue;
        if (
          hasTimeOverlap(
            sorted[i].startTime,
            sorted[i].endTime,
            sorted[j].startTime,
            sorted[j].endTime,
          )
        ) {
          conflicts.push({ date, first: sorted[i], second: sorted[j] });
        }
      }
    }
  }

  return conflicts;
}

export interface DeadlineCollisionGroup {
  dueDate: string;
  tasks: TaskItem[];
}

export function findDeadlineCollisions(
  tasks: TaskItem[],
): DeadlineCollisionGroup[] {
  const byDate = new Map<string, TaskItem[]>();
  for (const task of tasks) {
    if (task.status !== 'todo') continue;
    const list = byDate.get(task.dueDate) ?? [];
    list.push(task);
    byDate.set(task.dueDate, list);
  }

  return Array.from(byDate.entries())
    .filter(([, group]) => group.length >= 2)
    .map(([dueDate, group]) => ({ dueDate, tasks: group }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function isWithinQuietHours(
  now: Date,
  quietStart: string,
  quietEnd: string,
): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const start = timeToMinutes(quietStart);
  const end = timeToMinutes(quietEnd);
  if (start === end) return false;
  if (start < end) {
    return nowMinutes >= start && nowMinutes < end;
  }
  return nowMinutes >= start || nowMinutes < end;
}

export function formatRelativeTimeVi(isoTimestamp: string): string {
  const time = new Date(isoTimestamp).getTime();
  if (Number.isNaN(time)) return '';
  const diffMinutes = Math.floor((Date.now() - time) / 60000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  const d = new Date(time);
  return `${PAD(d.getDate())}/${PAD(d.getMonth() + 1)}/${d.getFullYear()}`;
}
