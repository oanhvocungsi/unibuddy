import type { ScheduleCategory, ScheduleEvent } from '../types/models';

const CATEGORY_LABEL_MAP: Record<ScheduleCategory, string> = {
  class: 'Lịch học',
  exam: 'Lịch thi',
  event: 'Sự kiện',
  personal: 'Cá nhân',
};

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function unescapeICS(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function toICSDateTime(dateKey: string, hhmm: string): string {
  const d = dateKey.replace(/-/g, '');
  const t = `${hhmm.replace(':', '')}00`;
  return `${d}T${t}`;
}

function toUTCDtStamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * Tạo nội dung chuẩn RFC-5545 (.ics) từ danh sách lịch học/lịch thi
 */
export function exportScheduleToICS(
  events: ScheduleEvent[],
  calendarName = 'UniBuddy - Lịch học sinh viên',
): string {
  const stamp = toUTCDtStamp();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniBuddy//Freshman Companion//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
  ];

  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@unibuddy.local`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${toICSDateTime(ev.date, ev.startTime)}`);
    lines.push(`DTEND:${toICSDateTime(ev.date, ev.endTime)}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.location) {
      lines.push(`LOCATION:${escapeICS(ev.location)}`);
    }
    if (ev.note) {
      lines.push(`DESCRIPTION:${escapeICS(ev.note)}`);
    }
    lines.push(`CATEGORIES:${escapeICS(CATEGORY_LABEL_MAP[ev.category])}`);
    if (ev.recurrence === 'weekly') {
      const count = Math.max(1, ev.recurrenceWeeks ?? 12);
      lines.push(`RRULE:FREQ=WEEKLY;COUNT=${count}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICSFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ParsedICSResult {
  events: Omit<ScheduleEvent, 'id'>[];
  warnings: string[];
}

function parseICSDateToken(raw: string): { date: string; time: string } | null {
  const clean = raw.trim();
  const dateTimeMatch = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (dateTimeMatch) {
    const [, y, m, d, hh, mm] = dateTimeMatch;
    return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
  }
  const dateOnlyMatch = clean.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return { date: `${y}-${m}-${d}`, time: '08:00' };
  }
  return null;
}

function addMinutesToTime(hhmm: string, minutesToAdd: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = Math.min(23 * 60 + 59, h * 60 + m + minutesToAdd);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function inferCategoryFromICS(
  rawCategory: string,
  title: string,
): ScheduleCategory {
  const hay = `${rawCategory} ${title}`.toLowerCase();
  if (hay.includes('thi') || hay.includes('exam') || hay.includes('kiểm tra')) {
    return 'exam';
  }
  if (
    hay.includes('sự kiện') ||
    hay.includes('event') ||
    hay.includes('hội thảo') ||
    hay.includes('clb')
  ) {
    return 'event';
  }
  if (hay.includes('cá nhân') || hay.includes('personal')) {
    return 'personal';
  }
  return 'class';
}

/**
 * Đọc và phân tích file .ics chuẩn RFC-5545 để nhập vào thời khóa biểu
 */
export function parseICSToScheduleEvents(icsContent: string): ParsedICSResult {
  const warnings: string[] = [];
  const events: Omit<ScheduleEvent, 'id'>[] = [];

  if (!icsContent.includes('BEGIN:VCALENDAR')) {
    return {
      events: [],
      warnings: ['Tệp không có cấu trúc VCALENDAR hợp lệ (.ics).'],
    };
  }

  // RFC-5545 line unfolding (CRLF/LF followed by space or tab)
  const unfolded = icsContent.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  let insideEvent = false;
  let currentProps: Record<string, string> = {};
  let index = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line === 'BEGIN:VEVENT') {
      insideEvent = true;
      currentProps = {};
      index += 1;
      continue;
    }

    if (line === 'END:VEVENT') {
      insideEvent = false;
      const summary = currentProps.SUMMARY
        ? unescapeICS(currentProps.SUMMARY)
        : '';
      const start = currentProps.DTSTART
        ? parseICSDateToken(currentProps.DTSTART)
        : null;

      if (!summary || !start) {
        warnings.push(
          `Mục #${index} bị bỏ qua vì thiếu tên sự kiện (SUMMARY) hoặc thời gian bắt đầu (DTSTART).`,
        );
        continue;
      }

      const end = currentProps.DTEND
        ? parseICSDateToken(currentProps.DTEND)
        : null;

      const endTime =
        end && end.time > start.time
          ? end.time
          : addMinutesToTime(start.time, 90);

      let recurrence: 'none' | 'weekly' = 'none';
      let recurrenceWeeks: number | undefined;
      const rrule = currentProps.RRULE ?? '';
      if (rrule.toUpperCase().includes('FREQ=WEEKLY')) {
        recurrence = 'weekly';
        const countMatch = rrule.match(/COUNT=(\d+)/i);
        recurrenceWeeks = countMatch ? Number(countMatch[1]) : 12;
      }

      events.push({
        title: summary,
        category: inferCategoryFromICS(currentProps.CATEGORIES ?? '', summary),
        date: start.date,
        startTime: start.time,
        endTime,
        location: currentProps.LOCATION
          ? unescapeICS(currentProps.LOCATION)
          : undefined,
        note: currentProps.DESCRIPTION
          ? unescapeICS(currentProps.DESCRIPTION)
          : undefined,
        recurrence,
        recurrenceWeeks,
        source: 'imported',
      });
      continue;
    }

    if (insideEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const rawKey = line.slice(0, colonIdx);
      const val = line.slice(colonIdx + 1);
      const propName = rawKey.split(';')[0].toUpperCase();
      currentProps[propName] = val;
    }
  }

  if (events.length === 0 && warnings.length === 0) {
    warnings.push('Không tìm thấy sự kiện VEVENT nào trong tệp .ics.');
  }

  return { events, warnings };
}
