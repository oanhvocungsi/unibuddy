import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarPlus,
  Check,
  Clock,
  Info,
  MapPin,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  DeletedContentState,
  EmptyState,
  Modal,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { CLUB_FIELD_LABELS, EVENT_CATEGORY_LABELS } from '../../data';
import { useAppStore } from '../../store/appStore';
import type {
  CampusEvent,
  CampusEventCategory,
  CampusEventStatus,
  Club,
  ClubField,
} from '../../types/models';
import { cn } from '../../utils/cn';
import { formatFullDateVi } from '../../utils/dateUtils';
import { includesVi, matchProfileInterests } from './exploreUtils';

export type ClubsEventsSubView = 'all' | 'events' | 'clubs';

interface ClubsEventsViewProps {
  initialSection?: ClubsEventsSubView;
  initialEventId?: string | null;
  initialClubId?: string | null;
  initialQuery?: string;
}

const EVENT_STATUS_META: Record<
  CampusEventStatus,
  { label: string; variant: 'primary' | 'warning' | 'danger' }
> = {
  upcoming: { label: 'Sắp diễn ra', variant: 'primary' },
  updated: { label: 'Cập nhật', variant: 'warning' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

export function ClubsEventsView({
  initialSection = 'all',
  initialEventId,
  initialClubId,
  initialQuery = '',
}: ClubsEventsViewProps) {
  const { state, toggleJoinClub, toggleRegisterEvent, addEventToSchedule } =
    useAppStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [section, setSection] = useState<ClubsEventsSubView>(initialSection);
  const [query, setQuery] = useState(initialQuery);
  const [eventCategory, setEventCategory] = useState<CampusEventCategory | 'all'>(
    'all',
  );
  const [registeredOnly, setRegisteredOnly] = useState(false);
  const [clubField, setClubField] = useState<ClubField | 'all'>('all');
  const [joinedClubsOnly, setJoinedClubsOnly] = useState(false);
  const [detailClub, setDetailClub] = useState<Club | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    initialEventId ?? null,
  );
  const [dismissedMissingAlert, setDismissedMissingAlert] = useState(false);

  const handleCloseClubModal = useCallback(() => setDetailClub(null), []);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialEventId) {
      setHighlightedEventId(initialEventId);
      setDismissedMissingAlert(false);
    }
  }, [initialEventId]);

  useEffect(() => {
    if (initialClubId) {
      const found = state.clubs.find((c) => c.id === initialClubId);
      if (found) setDetailClub(found);
      setDismissedMissingAlert(false);
    }
  }, [initialClubId, state.clubs]);

  // Keep open club modal synced with store updates (memberCount / joined)
  const syncedDetailClub = useMemo(() => {
    if (!detailClub) return null;
    return state.clubs.find((c) => c.id === detailClub.id) ?? null;
  }, [detailClub, state.clubs]);

  const linkedScheduleEventIds = useMemo(() => {
    return new Set(
      state.scheduleEvents
        .map((e) => e.linkedEventId)
        .filter((id): id is string => Boolean(id)),
    );
  }, [state.scheduleEvents]);

  // Personalized recommendations matching state.profile.interests
  const recommendations = useMemo(() => {
    const interests = state.profile.interests;
    if (!interests.length) return [];

    const clubRecs: Array<{
      kind: 'club';
      club: Club;
      matchedInterests: string[];
    }> = [];
    const eventRecs: Array<{
      kind: 'event';
      event: CampusEvent;
      matchedInterests: string[];
    }> = [];

    for (const club of state.clubs) {
      const matched = matchProfileInterests(interests, [
        club.name,
        club.shortName,
        CLUB_FIELD_LABELS[club.field],
        club.description,
        club.highlights.join(' '),
      ]);
      if (matched.length > 0) {
        clubRecs.push({ kind: 'club', club, matchedInterests: matched });
      }
    }

    for (const ev of state.events) {
      if (ev.status === 'cancelled') continue;
      const linkedClub = ev.clubId
        ? state.clubs.find((c) => c.id === ev.clubId)
        : undefined;
      const matched = matchProfileInterests(interests, [
        ev.title,
        ev.description,
        ev.organizer,
        EVENT_CATEGORY_LABELS[ev.category],
        linkedClub ? `${linkedClub.name} ${linkedClub.description}` : '',
      ]);
      if (matched.length > 0) {
        eventRecs.push({ kind: 'event', event: ev, matchedInterests: matched });
      }
    }

    return [...clubRecs.slice(0, 2), ...eventRecs.slice(0, 2)];
  }, [state.profile.interests, state.clubs, state.events]);

  const filteredEvents = useMemo(() => {
    return state.events.filter((ev) => {
      if (eventCategory !== 'all' && ev.category !== eventCategory) return false;
      if (registeredOnly && !ev.registered) return false;
      if (query.trim()) {
        const searchable = [
          ev.title,
          ev.organizer,
          ev.location,
          ev.description,
          EVENT_CATEGORY_LABELS[ev.category],
        ].join(' ');
        if (!includesVi(searchable, query)) return false;
      }
      return true;
    });
  }, [state.events, eventCategory, registeredOnly, query]);

  const filteredClubs = useMemo(() => {
    return state.clubs.filter((club) => {
      if (clubField !== 'all' && club.field !== clubField) return false;
      if (joinedClubsOnly && !club.joined) return false;
      if (query.trim()) {
        const searchable = [
          club.name,
          club.shortName,
          club.description,
          club.location,
          club.highlights.join(' '),
          CLUB_FIELD_LABELS[club.field],
        ].join(' ');
        if (!includesVi(searchable, query)) return false;
      }
      return true;
    });
  }, [state.clubs, clubField, joinedClubsOnly, query]);

  const missingDeepLink =
    !dismissedMissingAlert &&
    ((initialEventId && !state.events.some((e) => e.id === initialEventId)) ||
      (initialClubId && !state.clubs.some((c) => c.id === initialClubId)));

  const handleToggleRegister = (ev: CampusEvent) => {
    if (ev.status === 'cancelled') return;
    if (!ev.registered && ev.registeredCount >= ev.capacity) {
      showToast('Sự kiện đã đủ số lượng chỗ trống.', 'warning');
      return;
    }
    const nextRegistered = !ev.registered;
    toggleRegisterEvent(ev.id);
    showToast(
      nextRegistered
        ? `Đã đăng ký tham dự "${ev.title}".`
        : `Đã hủy đăng ký "${ev.title}".`,
      nextRegistered ? 'success' : 'info',
    );
  };

  const handleAddToCalendar = (ev: CampusEvent) => {
    if (ev.status === 'cancelled') return;
    const alreadyAdded =
      Boolean(ev.addedToCalendar) || linkedScheduleEventIds.has(ev.id);
    if (alreadyAdded) return;
    addEventToSchedule(ev.id);
    showToast(`Đã thêm "${ev.title}" vào lịch của tôi.`, 'success', {
      actionLabel: 'Xem Lịch',
      onAction: () => navigate('/lich'),
    });
  };

  const handleToggleJoinClub = (club: Club) => {
    const nextJoined = !club.joined;
    toggleJoinClub(club.id);
    showToast(
      nextJoined
        ? `Bạn đã tham gia ${club.shortName}.`
        : `Bạn đã rời khỏi ${club.shortName}.`,
      nextJoined ? 'success' : 'info',
    );
  };

  const showEventsSection = section === 'all' || section === 'events';
  const showClubsSection = section === 'all' || section === 'clubs';

  if (missingDeepLink) {
    return (
      <DeletedContentState
        title="Không tìm thấy sự kiện hoặc CLB được liên kết"
        description="Mục bạn truy cập có thể đã bị xóa hoặc cập nhật."
        actionLabel="Xem danh sách CLB & Sự kiện"
        onBack={() => setDismissedMissingAlert(true)}
      />
    );
  }

  return (
    <section aria-labelledby="clubs-events-heading" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="clubs-events-heading"
            className="text-lg sm:text-xl font-bold text-[var(--text-primary)]"
          >
            Câu lạc bộ & Sự kiện tân sinh viên
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Tìm CLB vừa sức, đăng ký sự kiện định hướng và đưa thẳng vào lịch học cá nhân.
          </p>
        </div>
        <SampleDataBadge label="CLB & Sự kiện minh họa cho sinh viên năm nhất" />
      </div>

      {/* Personalized Recommendations Strip */}
      <Card className="border-[var(--accent-primary)]/30 bg-[var(--accent-primary-soft)]/35">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles
                className="h-4 w-4 text-[var(--accent-primary)]"
                aria-hidden="true"
              />
              Gợi ý theo sở thích của bạn
            </CardTitle>
            {state.profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {state.profile.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {state.profile.interests.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              Bạn chưa chọn sở thích cá nhân.{' '}
              <Link
                to="/tai-khoan"
                className="font-semibold text-[var(--accent-primary)] hover:underline"
              >
                Cập nhật sở thích trong Tài khoản
              </Link>{' '}
              để nhận gợi ý CLB và sự kiện phù hợp.
            </p>
          ) : recommendations.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              Hiện chưa có CLB hoặc sự kiện mới khớp với sở thích đã chọn. Bạn có thể duyệt danh sách đầy đủ bên dưới.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {recommendations.map((rec) =>
                rec.kind === 'club' ? (
                  <div
                    key={`rec-club-${rec.club.id}`}
                    className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="primary">CLB phù hợp</Badge>
                        <span className="text-xs text-[var(--text-muted)] tabular-nums">
                          {rec.club.memberCount} thành viên
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                        {rec.club.name}
                      </p>
                      <p className="text-xs text-[var(--accent-primary)] font-medium">
                        Khớp: {rec.matchedInterests.join(', ')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={rec.club.joined ? 'secondary' : 'outline'}
                      onClick={() => handleToggleJoinClub(rec.club)}
                    >
                      {rec.club.joined ? 'Đang tham gia' : 'Tham gia CLB'}
                    </Button>
                  </div>
                ) : (
                  <div
                    key={`rec-ev-${rec.event.id}`}
                    className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="success">Sự kiện gợi ý</Badge>
                        <span className="text-xs text-[var(--text-muted)] tabular-nums">
                          {rec.event.startTime}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                        {rec.event.title}
                      </p>
                      <p className="text-xs text-[var(--accent-primary)] font-medium">
                        Khớp: {rec.matchedInterests.join(', ')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={rec.event.registered ? 'secondary' : 'primary'}
                      onClick={() => handleToggleRegister(rec.event)}
                    >
                      {rec.event.registered ? 'Đã đăng ký' : 'Đăng ký ngay'}
                    </Button>
                  </div>
                ),
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sub-toggle & Global Search inside Clubs/Events */}
      <Card padded className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Chọn hiển thị sự kiện hoặc câu lạc bộ"
            className="inline-flex flex-wrap gap-1.5 rounded-lg bg-[var(--bg-surface-subtle)] p-1"
          >
            {(
              [
                { key: 'all', label: 'Tất cả' },
                {
                  key: 'events',
                  label: `Sự kiện sắp tới (${state.events.length})`,
                },
                {
                  key: 'clubs',
                  label: `Câu lạc bộ (${state.clubs.length})`,
                },
              ] as const
            ).map((opt) => {
              const active = section === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSection(opt.key)}
                  aria-pressed={active}
                  className={cn(
                    'min-h-[44px] rounded-md px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer',
                    active
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên CLB, sự kiện, địa điểm..."
              aria-label="Tìm kiếm câu lạc bộ và sự kiện"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>
      </Card>

      {/* Upcoming Events Section */}
      {showEventsSection && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Sự kiện sắp tới
            </h3>
            <Button
              size="sm"
              variant={registeredOnly ? 'primary' : 'outline'}
              aria-pressed={registeredOnly}
              onClick={() => setRegisteredOnly((prev) => !prev)}
            >
              Đã đăng ký ({state.events.filter((e) => e.registered).length})
            </Button>
          </div>

          <div
            role="group"
            aria-label="Lọc sự kiện theo danh mục"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              onClick={() => setEventCategory('all')}
              aria-pressed={eventCategory === 'all'}
              className={cn(
                'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                eventCategory === 'all'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              Tất cả sự kiện
            </button>
            {(Object.keys(EVENT_CATEGORY_LABELS) as CampusEventCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEventCategory(cat)}
                  aria-pressed={eventCategory === cat}
                  className={cn(
                    'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                    eventCategory === cat
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  {EVENT_CATEGORY_LABELS[cat]}
                </button>
              ),
            )}
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState
              title="Không có sự kiện khớp bộ lọc"
              description="Thử xóa từ khóa hoặc chuyển về Tất cả sự kiện."
              actionLabel="Xem tất cả sự kiện"
              onAction={() => {
                setQuery('');
                setEventCategory('all');
                setRegisteredOnly(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((ev) => {
                const statusMeta = EVENT_STATUS_META[ev.status];
                const spotsLeft = Math.max(0, ev.capacity - ev.registeredCount);
                const fillRatio = Math.min(
                  100,
                  Math.round((ev.registeredCount / Math.max(1, ev.capacity)) * 100),
                );
                const isAdded =
                  Boolean(ev.addedToCalendar) ||
                  linkedScheduleEventIds.has(ev.id);
                const isCancelled = ev.status === 'cancelled';
                const isFull = !ev.registered && spotsLeft === 0;

                return (
                  <Card
                    key={ev.id}
                    className={cn(
                      'flex flex-col',
                      highlightedEventId === ev.id &&
                        'ring-2 ring-[var(--accent-primary)]',
                    )}
                  >
                    <CardHeader className="flex-col items-stretch gap-2 pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant={statusMeta.variant}>
                            {statusMeta.label}
                          </Badge>
                          <Badge variant="default">
                            {EVENT_CATEGORY_LABELS[ev.category]}
                          </Badge>
                        </div>
                        <SampleDataBadge label="Sự kiện minh họa" />
                      </div>
                      <CardTitle className="text-base sm:text-lg leading-snug">
                        {ev.title}
                      </CardTitle>
                      <p className="text-xs font-medium text-[var(--text-muted)]">
                        Tổ chức: {ev.organizer}
                      </p>
                    </CardHeader>

                    <CardBody className="flex-1 space-y-3">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {ev.description}
                      </p>

                      {ev.statusNote && (
                        <div
                          className={cn(
                            'rounded-lg p-2.5 text-xs flex items-start gap-2',
                            isCancelled
                              ? 'bg-[var(--status-danger-soft)]/70 text-[var(--text-primary)]'
                              : 'bg-[var(--status-warning-soft)]/70 text-[var(--text-primary)]',
                          )}
                        >
                          <AlertTriangle
                            className={cn(
                              'h-4 w-4 shrink-0 mt-0.5',
                              isCancelled
                                ? 'text-[var(--status-danger)]'
                                : 'text-[var(--status-warning)]',
                            )}
                            aria-hidden="true"
                          />
                          <span>{ev.statusNote}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <p className="flex items-center gap-2">
                          <Clock
                            className="h-4 w-4 text-[var(--accent-primary)] shrink-0"
                            aria-hidden="true"
                          />
                          <span className="tabular-nums">
                            {formatFullDateVi(ev.date)} • {ev.startTime} – {ev.endTime}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin
                            className="h-4 w-4 text-[var(--accent-primary)] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{ev.location}</span>
                        </p>
                      </div>

                      {/* Capacity Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs tabular-nums">
                          <span className="text-[var(--text-secondary)]">
                            Đã đăng ký: {ev.registeredCount} / {ev.capacity}
                          </span>
                          <span
                            className={cn(
                              'font-semibold',
                              spotsLeft <= 10
                                ? 'text-[var(--status-warning)]'
                                : 'text-[var(--status-success)]',
                            )}
                          >
                            {spotsLeft === 0
                              ? 'Đã đủ chỗ'
                              : `Còn ${spotsLeft} chỗ`}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              isCancelled
                                ? 'bg-[var(--text-muted)]'
                                : 'bg-[var(--accent-primary)]',
                            )}
                            style={{ width: `${fillRatio}%` }}
                          />
                        </div>
                      </div>
                    </CardBody>

                    <CardFooter className="gap-2">
                      <Button
                        size="sm"
                        variant={ev.registered ? 'secondary' : 'primary'}
                        disabled={isCancelled || isFull}
                        aria-pressed={Boolean(ev.registered)}
                        onClick={() => handleToggleRegister(ev)}
                        leftIcon={
                          ev.registered ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : undefined
                        }
                      >
                        {isCancelled
                          ? 'Sự kiện đã hủy'
                          : ev.registered
                            ? 'Hủy đăng ký'
                            : isFull
                              ? 'Đã hết chỗ'
                              : 'Đăng ký tham dự'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isCancelled || isAdded}
                        onClick={() => handleAddToCalendar(ev)}
                        leftIcon={
                          isAdded ? (
                            <CalendarCheck className="h-4 w-4 text-[var(--status-success)]" aria-hidden="true" />
                          ) : (
                            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                          )
                        }
                      >
                        {isAdded ? 'Đã có trong lịch' : 'Thêm vào lịch của tôi'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Clubs Section */}
      {showClubsSection && (
        <div className="space-y-4 pt-2 border-t border-[var(--border-hairline)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Câu lạc bộ sinh viên
            </h3>
            <Button
              size="sm"
              variant={joinedClubsOnly ? 'primary' : 'outline'}
              aria-pressed={joinedClubsOnly}
              onClick={() => setJoinedClubsOnly((prev) => !prev)}
            >
              CLB đã tham gia ({state.clubs.filter((c) => c.joined).length})
            </Button>
          </div>

          <div
            role="group"
            aria-label="Lọc câu lạc bộ theo lĩnh vực"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              onClick={() => setClubField('all')}
              aria-pressed={clubField === 'all'}
              className={cn(
                'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                clubField === 'all'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              Tất cả ({state.clubs.length})
            </button>
            {(Object.keys(CLUB_FIELD_LABELS) as ClubField[]).map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => setClubField(field)}
                aria-pressed={clubField === field}
                className={cn(
                  'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                  clubField === field
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {CLUB_FIELD_LABELS[field]}
              </button>
            ))}
          </div>

          {filteredClubs.length === 0 ? (
            <EmptyState
              title="Không tìm thấy câu lạc bộ phù hợp"
              description="Thử tìm theo lĩnh vực khác hoặc xóa từ khóa tìm kiếm."
              actionLabel="Xem tất cả CLB"
              onAction={() => {
                setQuery('');
                setClubField('all');
                setJoinedClubsOnly(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClubs.map((club) => (
                <Card key={club.id} className="flex flex-col">
                  <CardHeader className="flex-col items-stretch gap-2 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="primary">
                        {CLUB_FIELD_LABELS[club.field]}
                      </Badge>
                      <Badge variant="default" className="tabular-nums">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        {club.memberCount} thành viên
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-snug">
                      {club.name}
                    </CardTitle>
                  </CardHeader>

                  <CardBody className="flex-1 space-y-3">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {club.description}
                    </p>
                    <div className="space-y-1 text-xs text-[var(--text-muted)]">
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{club.meetingSchedule}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{club.location}</span>
                      </p>
                    </div>
                  </CardBody>

                  <CardFooter className="gap-2">
                    <Button
                      size="sm"
                      variant={club.joined ? 'success' : 'primary'}
                      aria-pressed={Boolean(club.joined)}
                      onClick={() => handleToggleJoinClub(club)}
                      leftIcon={
                        club.joined ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : undefined
                      }
                    >
                      {club.joined ? 'Đang tham gia' : 'Tham gia'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailClub(club)}
                      leftIcon={<Info className="h-4 w-4" aria-hidden="true" />}
                    >
                      Chi tiết
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Club Detail Modal */}
      <Modal
        isOpen={Boolean(syncedDetailClub)}
        onClose={handleCloseClubModal}
        title={syncedDetailClub?.name ?? 'Chi tiết câu lạc bộ'}
        description={
          syncedDetailClub
            ? `${CLUB_FIELD_LABELS[syncedDetailClub.field]} • ${syncedDetailClub.memberCount} thành viên (Dữ liệu minh họa)`
            : undefined
        }
        size="lg"
        footer={
          syncedDetailClub && (
            <>
              <Button variant="ghost" onClick={() => setDetailClub(null)}>
                Đóng
              </Button>
              <Button
                variant={syncedDetailClub.joined ? 'secondary' : 'primary'}
                onClick={() => handleToggleJoinClub(syncedDetailClub)}
              >
                {syncedDetailClub.joined ? 'Rời câu lạc bộ' : 'Tham gia câu lạc bộ'}
              </Button>
            </>
          )
        }
      >
        {syncedDetailClub && (
          <div className="space-y-4">
            <SampleDataBadge label="Thông tin câu lạc bộ minh họa" />
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {syncedDetailClub.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[var(--border-hairline)] p-3">
                <p className="text-xs font-semibold text-[var(--text-muted)]">
                  Lịch sinh hoạt
                </p>
                <p className="mt-1 text-[var(--text-primary)]">
                  {syncedDetailClub.meetingSchedule}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-hairline)] p-3">
                <p className="text-xs font-semibold text-[var(--text-muted)]">
                  Địa điểm & Liên hệ mẫu
                </p>
                <p className="mt-1 text-[var(--text-primary)]">
                  {syncedDetailClub.location}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {syncedDetailClub.contactNote}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Hoạt động nổi bật dành cho năm nhất
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
                {syncedDetailClub.highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
