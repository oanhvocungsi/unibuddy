import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  MapPin,
  Plus,
  Repeat,
  Sparkles,
  Upload,
  User,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  useToast,
} from '../../../components/ui';
import type {
  Course,
  ScheduleCategory,
  ScheduleEvent,
} from '../../../types/models';
import { cn } from '../../../utils/cn';
import {
  addDays,
  expandScheduleOccurrences,
  findScheduleConflicts,
  formatFullDateVi,
  formatShortDate,
  formatWeekdayLong,
  formatWeekdayShort,
  getWeekDateKeys,
  parseDateKey,
  todayKey,
  type ExpandedScheduleOccurrence,
} from '../../../utils/dateUtils';
import { downloadICSFile, exportScheduleToICS } from '../../../utils/icsUtils';
import {
  getMonthGridDates,
  resolveCourseForOccurrence,
  SCHEDULE_CATEGORY_META,
} from '../scheduleHelpers';

type CalendarView = 'day' | 'week' | 'month';

function CategoryIcon({ category }: { category: ScheduleCategory }) {
  switch (category) {
    case 'class':
      return <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />;
    case 'exam':
      return <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />;
    case 'event':
      return <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />;
    case 'personal':
      return <User className="h-3.5 w-3.5" aria-hidden="true" />;
  }
}

interface TimetableSectionProps {
  scheduleEvents: ScheduleEvent[];
  courses: Course[];
  onOpenCreateEvent: (date?: string) => void;
  onSelectOccurrence: (occ: ExpandedScheduleOccurrence) => void;
  onOpenICSImport: () => void;
}

export function TimetableSection({
  scheduleEvents,
  courses,
  onOpenCreateEvent,
  onSelectOccurrence,
  onOpenICSImport,
}: TimetableSectionProps) {
  const { showToast } = useToast();
  const today = todayKey();
  const [view, setView] = useState<CalendarView>('week');
  const [anchorDate, setAnchorDate] = useState(today);
  const [categoryFilter, setCategoryFilter] = useState<
    ScheduleCategory | 'all'
  >('all');
  const [selectedMonthDay, setSelectedMonthDay] = useState(today);

  const anchorDateObj = useMemo(() => parseDateKey(anchorDate), [anchorDate]);
  const currentYear = anchorDateObj.getFullYear();
  const currentMonth = anchorDateObj.getMonth();

  const weekDates = useMemo(() => getWeekDateKeys(anchorDate), [anchorDate]);
  const monthDates = useMemo(
    () => getMonthGridDates(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const rangeStart =
    view === 'day'
      ? anchorDate
      : view === 'week'
        ? weekDates[0]
        : monthDates[0];
  const rangeEnd =
    view === 'day'
      ? anchorDate
      : view === 'week'
        ? weekDates[6]
        : monthDates[monthDates.length - 1];

  const allOccurrencesInRange = useMemo(
    () => expandScheduleOccurrences(scheduleEvents, rangeStart, rangeEnd),
    [scheduleEvents, rangeStart, rangeEnd],
  );

  const filteredOccurrences = useMemo(() => {
    if (categoryFilter === 'all') return allOccurrencesInRange;
    return allOccurrencesInRange.filter(
      (occ) => occ.category === categoryFilter,
    );
  }, [allOccurrencesInRange, categoryFilter]);

  const conflicts = useMemo(
    () => findScheduleConflicts(allOccurrencesInRange),
    [allOccurrencesInRange],
  );

  const conflictOccurrenceKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const pair of conflicts) {
      keys.add(`${pair.date}|${pair.first.id}`);
      keys.add(`${pair.date}|${pair.second.id}`);
    }
    return keys;
  }, [conflicts]);

  const shiftPeriod = (direction: -1 | 1) => {
    if (view === 'day') {
      setAnchorDate((prev) => addDays(prev, direction));
    } else if (view === 'week') {
      setAnchorDate((prev) => addDays(prev, direction * 7));
    } else {
      const nextMonth = new Date(
        currentYear,
        currentMonth + direction,
        1,
        12,
        0,
        0,
        0,
      );
      const y = nextMonth.getFullYear();
      const m = String(nextMonth.getMonth() + 1).padStart(2, '0');
      const nextKey = `${y}-${m}-01`;
      setAnchorDate(nextKey);
      setSelectedMonthDay(nextKey);
    }
  };

  const handleJumpToday = () => {
    setAnchorDate(today);
    setSelectedMonthDay(today);
  };

  const handleExportICS = () => {
    const ics = exportScheduleToICS(scheduleEvents);
    downloadICSFile('unibuddy-lich-hoc.ics', ics);
    showToast(
      `Đã xuất ${scheduleEvents.length} lịch ra tệp unibuddy-lich-hoc.ics.`,
      'success',
    );
  };

  const periodHeading =
    view === 'day'
      ? formatFullDateVi(anchorDate)
      : view === 'week'
        ? `Tuần ${formatShortDate(weekDates[0])} – ${formatShortDate(weekDates[6])}`
        : `Tháng ${currentMonth + 1}/${currentYear}`;

  const renderOccurrenceCard = (
    occ: ExpandedScheduleOccurrence,
    compact = false,
  ) => {
    const meta = SCHEDULE_CATEGORY_META[occ.category];
    const course = resolveCourseForOccurrence(occ, courses);
    const hasConflict = conflictOccurrenceKeys.has(
      `${occ.occurrenceDate}|${occ.id}`,
    );

    return (
      <button
        key={`${occ.id}-${occ.occurrenceDate}-${occ.startTime}`}
        type="button"
        onClick={() => onSelectOccurrence(occ)}
        className={cn(
          'w-full text-left rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-colors cursor-pointer',
          meta.borderClass,
          compact ? 'p-2.5 space-y-1' : 'p-3.5 space-y-1.5',
          hasConflict && 'ring-1 ring-[var(--status-danger)]',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">
            {occ.startTime} – {occ.endTime}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {hasConflict && (
              <Badge
                variant="danger"
                icon={<AlertTriangle className="h-3 w-3" />}
              >
                Trùng giờ
              </Badge>
            )}
            <Badge
              variant={meta.badgeVariant}
              icon={<CategoryIcon category={occ.category} />}
            >
              {meta.label}
            </Badge>
          </div>
        </div>

        <p
          className={cn(
            'font-semibold text-[var(--text-primary)] leading-snug',
            compact ? 'text-xs sm:text-sm line-clamp-2' : 'text-sm sm:text-base',
          )}
        >
          {occ.title}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
          {occ.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{occ.location}</span>
            </span>
          )}
          {!compact && course && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{course.instructor}</span>
            </span>
          )}
          {occ.recurrence === 'weekly' && (
            <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
              <Repeat className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>Hàng tuần</span>
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardBody className="pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Period navigation */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                <button
                  type="button"
                  onClick={() => shiftPeriod(-1)}
                  aria-label="Khoảng thời gian trước"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] rounded-l-lg cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleJumpToday}
                  className="min-h-[44px] px-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border-x border-[var(--border-hairline)] cursor-pointer"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => shiftPeriod(1)}
                  aria-label="Khoảng thời gian sau"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] rounded-r-lg cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tabular-nums">
                {periodHeading}
              </h2>
            </div>

            {/* View mode + Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="Chế độ xem lịch"
                className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)] p-0.5"
              >
                {(
                  [
                    { id: 'day', label: 'Ngày' },
                    { id: 'week', label: 'Tuần' },
                    { id: 'month', label: 'Tháng' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={view === item.id}
                    onClick={() => setView(item.id)}
                    className={cn(
                      'min-h-[44px] px-3 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                      view === item.id
                        ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={onOpenICSImport}
              >
                Nhập .ics
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExportICS}
              >
                Xuất .ics
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() =>
                  onOpenCreateEvent(
                    view === 'month' ? selectedMonthDay : anchorDate,
                  )
                }
              >
                Thêm lịch
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
            <span className="text-xs font-medium text-[var(--text-muted)] mr-1">
              Phân loại:
            </span>
            <button
              type="button"
              aria-pressed={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
              className={cn(
                'min-h-[44px] px-3 rounded-lg text-xs font-medium border cursor-pointer transition-colors',
                categoryFilter === 'all'
                  ? 'bg-[var(--accent-primary)] text-white border-transparent'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]',
              )}
            >
              Tất cả ({allOccurrencesInRange.length})
            </button>
            {(Object.keys(SCHEDULE_CATEGORY_META) as ScheduleCategory[]).map(
              (cat) => {
                const meta = SCHEDULE_CATEGORY_META[cat];
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium border cursor-pointer transition-colors',
                      active
                        ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border-[var(--accent-primary)]/40 font-semibold'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    <CategoryIcon category={cat} />
                    <span>{meta.label}</span>
                  </button>
                );
              },
            )}
          </div>
        </CardBody>
      </Card>

      {/* Schedule overlap warning */}
      {conflicts.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--status-danger)]/40 bg-[var(--status-danger-soft)]/50 p-4 space-y-2"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="h-5 w-5 text-[var(--status-danger)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Phát hiện {conflicts.length} cặp lịch trùng khung giờ
              </p>
              <ul className="space-y-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                {conflicts.slice(0, 4).map((pair, idx) => (
                  <li key={`${pair.date}-${idx}`}>
                    <strong>{formatFullDateVi(pair.date)}:</strong>{' '}
                    {pair.first.title} ({pair.first.startTime}–{pair.first.endTime})
                    {' trùng với '}
                    {pair.second.title} ({pair.second.startTime}–
                    {pair.second.endTime})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="space-y-3">
          {filteredOccurrences.length === 0 ? (
            <EmptyState
              icon={<CalendarPlus className="h-6 w-6" aria-hidden="true" />}
              title={`Chưa có lịch vào ${formatFullDateVi(anchorDate)}`}
              description="Bạn có thể thêm lịch học, lịch tự học ở thư viện hoặc sự kiện CLB cho ngày này."
              actionLabel="Thêm lịch cho ngày này"
              onAction={() => onOpenCreateEvent(anchorDate)}
            />
          ) : (
            <div className="space-y-3">
              {filteredOccurrences.map((occ) =>
                renderOccurrenceCard(occ, false),
              )}
            </div>
          )}
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDates.map((dateKey) => {
            const dayItems = filteredOccurrences.filter(
              (occ) => occ.occurrenceDate === dateKey,
            );
            const isTodayCol = dateKey === today;

            return (
              <div
                key={dateKey}
                className={cn(
                  'rounded-xl border bg-[var(--bg-surface)] flex flex-col min-h-[180px]',
                  isTodayCol
                    ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/30'
                    : 'border-[var(--border-hairline)]',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2.5 border-b border-[var(--border-hairline)] rounded-t-xl',
                    isTodayCol
                      ? 'bg-[var(--accent-primary-soft)]/70'
                      : 'bg-[var(--bg-surface-subtle)]/50',
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        'text-xs font-bold',
                        isTodayCol
                          ? 'text-[var(--accent-primary)]'
                          : 'text-[var(--text-primary)]',
                      )}
                    >
                      {formatWeekdayLong(dateKey)}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] tabular-nums">
                      {formatShortDate(dateKey)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenCreateEvent(dateKey)}
                    aria-label={`Thêm lịch ngày ${formatShortDate(dateKey)}`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-2 space-y-2 flex-1">
                  {dayItems.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                      Trống lịch
                    </p>
                  ) : (
                    dayItems.map((occ) => renderOccurrenceCard(occ, true))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <Card className="lg:col-span-8">
            <CardBody className="pt-4">
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-[var(--text-muted)]">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w) => (
                  <div key={w} className="py-1">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDates.map((dateKey) => {
                  const dayObj = parseDateKey(dateKey);
                  const inCurrentMonth = dayObj.getMonth() === currentMonth;
                  const items = filteredOccurrences.filter(
                    (occ) => occ.occurrenceDate === dateKey,
                  );
                  const isSelected = dateKey === selectedMonthDay;
                  const isTodayCell = dateKey === today;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedMonthDay(dateKey)}
                      aria-label={`${formatFullDateVi(dateKey)} (${items.length} lịch)`}
                      aria-pressed={isSelected}
                      className={cn(
                        'min-h-[68px] sm:min-h-[80px] rounded-lg border p-1.5 text-left flex flex-col justify-between transition-colors cursor-pointer',
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/50'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)]/60',
                        !inCurrentMonth && 'opacity-45',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                          isTodayCell
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'text-[var(--text-primary)]',
                        )}
                      >
                        {dayObj.getDate()}
                      </span>

                      {items.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {items.slice(0, 3).map((occ) => (
                            <span
                              key={`${occ.id}-${occ.startTime}`}
                              className={cn(
                                'h-2 w-2 rounded-full',
                                SCHEDULE_CATEGORY_META[occ.category].dotClass,
                              )}
                              title={occ.title}
                            />
                          ))}
                          {items.length > 3 && (
                            <span className="text-[10px] font-semibold text-[var(--text-muted)] tabular-nums">
                              +{items.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-4">
            <CardBody className="pt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[var(--accent-primary)]">
                    {formatWeekdayShort(selectedMonthDay)}
                  </p>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {formatFullDateVi(selectedMonthDay)}
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => onOpenCreateEvent(selectedMonthDay)}
                >
                  Thêm
                </Button>
              </div>

              {(() => {
                const selectedItems = filteredOccurrences.filter(
                  (occ) => occ.occurrenceDate === selectedMonthDay,
                );
                if (selectedItems.length === 0) {
                  return (
                    <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                      Không có lịch trong ngày này.
                    </p>
                  );
                }
                return (
                  <div className="space-y-2.5">
                    {selectedItems.map((occ) => renderOccurrenceCard(occ, true))}
                  </div>
                );
              })()}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
