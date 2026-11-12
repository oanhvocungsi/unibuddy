import { describe, expect, it } from 'vitest';
import type { ScheduleEvent, TaskItem } from '../types/models';
import {
  expandScheduleOccurrences,
  findDeadlineCollisions,
  findScheduleConflicts,
  isWithinQuietHours,
} from '../utils/dateUtils';

describe('dateUtils', () => {
  it('expands weekly schedule events and detects time overlaps', () => {
    const events: ScheduleEvent[] = [
      {
        id: 'e1',
        title: 'Lớp Toán',
        category: 'class',
        date: '2026-11-16',
        startTime: '08:00',
        endTime: '10:00',
        recurrence: 'weekly',
        recurrenceWeeks: 3,
        source: 'personal',
      },
      {
        id: 'e2',
        title: 'Hội thảo CLB',
        category: 'event',
        date: '2026-11-23',
        startTime: '09:00',
        endTime: '11:00',
        recurrence: 'none',
        source: 'club',
      },
    ];

    const occ = expandScheduleOccurrences(events, '2026-11-16', '2026-11-30');
    expect(occ).toHaveLength(4);
    const conflicts = findScheduleConflicts(occ);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].date).toBe('2026-11-23');
  });

  it('detects same-day deadline collisions for active todo tasks', () => {
    const tasks: TaskItem[] = [
      {
        id: 't1',
        title: 'Nộp Lab 02',
        dueDate: '2026-11-20',
        priority: 'high',
        reminderBefore: '1d',
        status: 'todo',
        subtasks: [],
        createdAt: '2026-11-12T00:00:00Z',
      },
      {
        id: 't2',
        title: 'Trắc nghiệm Giải tích',
        dueDate: '2026-11-20',
        priority: 'high',
        reminderBefore: '1d',
        status: 'todo',
        subtasks: [],
        createdAt: '2026-11-12T00:00:00Z',
      },
      {
        id: 't3',
        title: 'Đã hoàn thành cùng ngày',
        dueDate: '2026-11-20',
        priority: 'low',
        reminderBefore: 'none',
        status: 'done',
        subtasks: [],
        createdAt: '2026-11-12T00:00:00Z',
      },
    ];

    const collisions = findDeadlineCollisions(tasks);
    expect(collisions).toHaveLength(1);
    expect(collisions[0].dueDate).toBe('2026-11-20');
    expect(collisions[0].tasks).toHaveLength(2);
  });

  it('evaluates overnight quiet hours accurately', () => {
    expect(
      isWithinQuietHours(new Date(2026, 10, 12, 23, 15), '22:30', '06:30'),
    ).toBe(true);
    expect(
      isWithinQuietHours(new Date(2026, 10, 12, 5, 45), '22:30', '06:30'),
    ).toBe(true);
    expect(
      isWithinQuietHours(new Date(2026, 10, 12, 14, 0), '22:30', '06:30'),
    ).toBe(false);
  });
});
