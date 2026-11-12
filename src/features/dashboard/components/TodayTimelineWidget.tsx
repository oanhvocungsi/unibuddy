import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarClock,
  CalendarPlus,
  Clock,
  FileCheck2,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
} from '../../../components/ui';
import type {
  Course,
  ScheduleCategory,
  ScheduleEvent,
} from '../../../types/models';
import { cn } from '../../../utils/cn';
import {
  expandScheduleOccurrences,
  timeToMinutes,
  todayOffset,
} from '../../../utils/dateUtils';
import {
  resolveCourseForOccurrence,
  SCHEDULE_CATEGORY_META,
} from '../../schedule/scheduleHelpers';

function renderCategoryIcon(category: ScheduleCategory) {
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

export function TodayTimelineWidget({
  scheduleEvents,
  courses,
}: {
  scheduleEvents: ScheduleEvent[];
  courses: Course[];
}) {
  const today = todayOffset(0);
  const todayOccurrences = expandScheduleOccurrences(
    scheduleEvents,
    today,
    today,
  );

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarClock
              className="h-5 w-5 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <span>Lịch hôm nay</span>
          </CardTitle>
          <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
            {todayOccurrences.length > 0
              ? `Có ${todayOccurrences.length} hoạt động trong ngày — kiểm tra phòng học trước khi ra khỏi nhà.`
              : 'Ngày trống lịch học cố định — bạn có thể chủ động sắp xếp thời gian tự học.'}
          </p>
        </div>
        <Link
          to="/lich"
          className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-surface-subtle)] shrink-0"
        >
          <span>Mở thời khóa biểu</span>
        </Link>
      </CardHeader>

      <CardBody>
        {todayOccurrences.length === 0 ? (
          <EmptyState
            icon={<CalendarPlus className="h-6 w-6" aria-hidden="true" />}
            title="Chưa có lịch trong hôm nay"
            description="Bạn chưa có lịch học hôm nay. Thêm lịch đầu tiên hoặc mở thời khóa biểu."
            secondaryAction={
              <Link
                to="/lich"
                className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-[var(--accent-primary-ink)] hover:bg-[var(--accent-primary-hover)] transition-colors"
              >
                Mở thời khóa biểu
              </Link>
            }
          />
        ) : (
          <ol className="space-y-3">
            {todayOccurrences.map((occ) => {
              const meta = SCHEDULE_CATEGORY_META[occ.category];
              const course = resolveCourseForOccurrence(occ, courses);
              const startMin = timeToMinutes(occ.startTime);
              const endMin = timeToMinutes(occ.endTime);
              const isHappening =
                nowMinutes >= startMin && nowMinutes < endMin;
              const isPast = nowMinutes >= endMin;

              return (
                <li
                  key={`${occ.id}-${occ.occurrenceDate}`}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-stretch gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 transition-colors',
                    meta.borderClass,
                    isHappening &&
                      'ring-1 ring-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/35',
                    isPast && 'opacity-75',
                  )}
                >
                  <div className="sm:w-28 shrink-0 flex sm:flex-col justify-between sm:justify-start gap-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                      <Clock
                        className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        {occ.startTime} – {occ.endTime}
                      </span>
                    </div>
                    {isHappening && (
                      <Badge variant="primary" className="w-fit">
                        Đang diễn ra
                      </Badge>
                    )}
                    {!isHappening && !isPast && (
                      <span className="text-xs text-[var(--text-muted)]">
                        Sắp tới
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs text-[var(--text-muted)]">
                        Đã qua
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={meta.badgeVariant}
                        icon={renderCategoryIcon(occ.category)}
                      >
                        {meta.label}
                      </Badge>
                      {course && (
                        <Link
                          to={`/mon-hoc/${course.id}`}
                          className="min-h-[44px] inline-flex items-center text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                        >
                          {course.code} • {course.name}
                        </Link>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] leading-snug">
                      {occ.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                      {occ.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{occ.location}</span>
                        </span>
                      )}
                      {course?.instructor && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{course.instructor}</span>
                        </span>
                      )}
                    </div>

                    {occ.note && (
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {occ.note}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
