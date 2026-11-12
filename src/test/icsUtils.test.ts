import { describe, expect, it } from 'vitest';
import type { ScheduleEvent } from '../types/models';
import {
  exportScheduleToICS,
  parseICSToScheduleEvents,
} from '../utils/icsUtils';

describe('icsUtils (RFC-5545 export & import)', () => {
  it('exports schedule events and round-trips them cleanly on parse', () => {
    const sampleEvents: ScheduleEvent[] = [
      {
        id: 'ev-1',
        title: 'Nhập môn Lập trình (IT1010)',
        category: 'class',
        date: '2026-11-16',
        startTime: '07:30',
        endTime: '09:30',
        location: 'Phòng Lab B1-302',
        note: 'Mang theo thẻ sinh viên, laptop',
        recurrence: 'weekly',
        recurrenceWeeks: 15,
        source: 'personal',
      },
      {
        id: 'ev-2',
        title: 'Thi giữa kỳ Giải tích 1',
        category: 'exam',
        date: '2026-11-25',
        startTime: '13:30',
        endTime: '15:00',
        location: 'Giảng đường C2-105',
        recurrence: 'none',
        source: 'personal',
      },
    ];

    const icsText = exportScheduleToICS(sampleEvents);
    expect(icsText).toContain('BEGIN:VCALENDAR');
    expect(icsText).toContain('RRULE:FREQ=WEEKLY;COUNT=15');
    expect(icsText).toContain('END:VCALENDAR');

    const parsed = parseICSToScheduleEvents(icsText);
    expect(parsed.warnings).toHaveLength(0);
    expect(parsed.events).toHaveLength(2);
    expect(parsed.events[0]).toMatchObject({
      title: 'Nhập môn Lập trình (IT1010)',
      category: 'class',
      date: '2026-11-16',
      startTime: '07:30',
      endTime: '09:30',
      location: 'Phòng Lab B1-302',
      note: 'Mang theo thẻ sinh viên, laptop',
      recurrence: 'weekly',
      recurrenceWeeks: 15,
      source: 'imported',
    });
    expect(parsed.events[1]).toMatchObject({
      title: 'Thi giữa kỳ Giải tích 1',
      category: 'exam',
      date: '2026-11-25',
      recurrence: 'none',
    });
  });

  it('reports clear warnings for invalid ICS files or incomplete VEVENTs', () => {
    const invalidResult = parseICSToScheduleEvents('NOT A CALENDAR');
    expect(invalidResult.events).toHaveLength(0);
    expect(invalidResult.warnings.length).toBeGreaterThan(0);

    const partialICS = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'SUMMARY:Sự kiện thiếu ngày',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const partialResult = parseICSToScheduleEvents(partialICS);
    expect(partialResult.events).toHaveLength(0);
    expect(partialResult.warnings).toHaveLength(1);
  });
});
