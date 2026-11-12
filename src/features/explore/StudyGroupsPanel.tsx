import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarPlus,
  Check,
  Clock,
  MapPin,
  Plus,
  Search,
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
  EmptyState,
  Modal,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { StudyGroup } from '../../types/models';
import { cn } from '../../utils/cn';
import { formatRelativeDayLabel, todayOffset } from '../../utils/dateUtils';
import { includesVi } from './exploreUtils';

interface StudyGroupsPanelProps {
  initialGroupId?: string | null;
  initialQuery?: string;
}

export function StudyGroupsPanel({
  initialGroupId,
  initialQuery = '',
}: StudyGroupsPanelProps) {
  const {
    state,
    toggleJoinStudyGroup,
    createStudyGroup,
    addStudyGroupSession,
    addGroupSessionToSchedule,
  } = useAppStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQuery);
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [joinedOnly, setJoinedOnly] = useState(false);
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(
    initialGroupId ?? null,
  );

  // Create group modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [maxMembers, setMaxMembers] = useState(8);

  // Add session modal state
  const [sessionModalGroup, setSessionModalGroup] = useState<StudyGroup | null>(
    null,
  );
  const [sessTitle, setSessTitle] = useState('');
  const [sessDate, setSessDate] = useState(() => todayOffset(1));
  const [sessStart, setSessStart] = useState('16:00');
  const [sessEnd, setSessEnd] = useState('17:30');
  const [sessLocation, setSessLocation] = useState('');
  const [sessAgenda, setSessAgenda] = useState('');

  const handleCloseCreateModal = useCallback(() => setCreateOpen(false), []);
  const handleCloseSessionModal = useCallback(() => setSessionModalGroup(null), []);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialGroupId) setHighlightedGroupId(initialGroupId);
  }, [initialGroupId]);

  const availableCourseCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const grp of state.studyGroups) {
      if (grp.courseCode) codes.add(grp.courseCode);
    }
    return Array.from(codes);
  }, [state.studyGroups]);

  const linkedScheduleKeys = useMemo(() => {
    return new Set(
      state.scheduleEvents
        .map((e) => e.linkedEventId)
        .filter((id): id is string => Boolean(id)),
    );
  }, [state.scheduleEvents]);

  const filteredGroups = useMemo(() => {
    return state.studyGroups.filter((g) => {
      if (joinedOnly && !g.joined) return false;
      if (courseFilter !== 'all' && g.courseCode !== courseFilter) return false;
      if (query.trim()) {
        const searchable = [
          g.name,
          g.courseCode ?? '',
          g.courseName ?? '',
          g.topic,
          g.description,
          g.locationNote,
        ].join(' ');
        if (!includesVi(searchable, query)) return false;
      }
      return true;
    });
  }, [state.studyGroups, joinedOnly, courseFilter, query]);

  const handleCreateGroup = (e: FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !topic.trim()) return;
    createStudyGroup({
      name: groupName,
      courseCode: courseCode || undefined,
      courseName: courseName || undefined,
      topic,
      description:
        description.trim() || 'Nhóm cùng ôn tập và hỗ trợ bài tập mỗi tuần.',
      scheduleNote: scheduleNote.trim() || 'Thống nhất lịch linh hoạt trong nhóm',
      locationNote: locationNote.trim() || 'Thư viện TV-01 hoặc Online',
      maxMembers,
    });
    showToast(`Đã tạo nhóm học "${groupName.trim()}".`, 'success');
    setGroupName('');
    setCourseCode('');
    setCourseName('');
    setTopic('');
    setDescription('');
    setScheduleNote('');
    setLocationNote('');
    setMaxMembers(8);
    setCreateOpen(false);
  };

  const handleToggleJoin = (group: StudyGroup) => {
    if (!group.joined && group.memberCount >= group.maxMembers) {
      showToast('Nhóm đã đủ số lượng thành viên tối đa.', 'warning');
      return;
    }
    const nextJoined = !group.joined;
    toggleJoinStudyGroup(group.id);
    showToast(
      nextJoined
        ? `Bạn đã tham gia "${group.name}".`
        : `Bạn đã rời khỏi "${group.name}".`,
      nextJoined ? 'success' : 'info',
    );
  };

  const handleCreateSession = (e: FormEvent) => {
    e.preventDefault();
    if (!sessionModalGroup || !sessTitle.trim()) return;
    addStudyGroupSession(sessionModalGroup.id, {
      title: sessTitle.trim(),
      date: sessDate,
      startTime: sessStart,
      endTime: sessEnd,
      locationOrLink:
        sessLocation.trim() || sessionModalGroup.locationNote || 'Thư viện TV-01',
      agenda: sessAgenda.trim() || 'Cùng giải đáp thắc mắc và ôn bài theo tiến độ.',
    });
    showToast('Đã tạo buổi học mới cho nhóm.', 'success');
    setSessTitle('');
    setSessLocation('');
    setSessAgenda('');
    setSessionModalGroup(null);
  };

  const handleAddSessionToCalendar = (groupId: string, sessionId: string, title: string) => {
    const linkedKey = `${groupId}:${sessionId}`;
    if (linkedScheduleKeys.has(linkedKey)) return;
    addGroupSessionToSchedule(groupId, sessionId);
    showToast(`Đã thêm buổi học "${title}" vào lịch của tôi.`, 'success', {
      actionLabel: 'Xem Lịch',
      onAction: () => navigate('/lich'),
    });
  };

  return (
    <div className="space-y-4">
      <Card padded className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo mã môn (IT1010, MI1110), chủ đề ôn tập..."
              aria-label="Tìm kiếm nhóm học tập"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={joinedOnly ? 'primary' : 'outline'}
              aria-pressed={joinedOnly}
              onClick={() => setJoinedOnly((prev) => !prev)}
            >
              Nhóm đã tham gia ({state.studyGroups.filter((g) => g.joined).length})
            </Button>
            <Button
              variant="primary"
              onClick={() => setCreateOpen(true)}
              leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
            >
              Tạo nhóm học mới
            </Button>
          </div>
        </div>

        {/* Course code filter */}
        <div
          role="group"
          aria-label="Lọc nhóm học theo mã môn"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setCourseFilter('all')}
            aria-pressed={courseFilter === 'all'}
            className={cn(
              'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
              courseFilter === 'all'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            Tất cả ({state.studyGroups.length})
          </button>
          {availableCourseCodes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setCourseFilter(code)}
              aria-pressed={courseFilter === code}
              className={cn(
                'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer tabular-nums',
                courseFilter === code
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              {code}
            </button>
          ))}
        </div>
      </Card>

      {filteredGroups.length === 0 ? (
        <EmptyState
          title="Chưa có nhóm học tập phù hợp"
          description="Bạn có thể xóa bộ lọc hoặc tạo nhóm học mới cho môn đang học."
          actionLabel="Tạo nhóm học mới"
          onAction={() => setCreateOpen(true)}
          secondaryAction={
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setCourseFilter('all');
                setJoinedOnly(false);
              }}
            >
              Xóa bộ lọc
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGroups.map((group) => {
            const isFull = !group.joined && group.memberCount >= group.maxMembers;
            return (
              <Card
                key={group.id}
                className={cn(
                  'flex flex-col',
                  highlightedGroupId === group.id &&
                    'ring-2 ring-[var(--accent-primary)]',
                )}
              >
                <CardHeader className="flex-col items-stretch gap-2 pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {group.courseCode && (
                        <Badge variant="primary" className="tabular-nums">
                          {group.courseCode}
                        </Badge>
                      )}
                      <Badge variant="default" className="tabular-nums">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        {group.memberCount}/{group.maxMembers} thành viên
                      </Badge>
                    </div>
                    {group.isSample && <SampleDataBadge label="Nhóm mẫu" />}
                  </div>
                  <CardTitle className="text-base sm:text-lg leading-snug">
                    {group.name}
                  </CardTitle>
                  <p className="text-xs font-semibold text-[var(--accent-primary)]">
                    Mục tiêu: {group.topic}
                  </p>
                </CardHeader>

                <CardBody className="flex-1 space-y-4">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {group.description}
                  </p>

                  <div className="space-y-1 text-xs text-[var(--text-muted)]">
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{group.scheduleNote}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{group.locationNote}</span>
                    </p>
                  </div>

                  {/* Group Sessions */}
                  <div className="space-y-2.5 pt-2 border-t border-[var(--border-hairline)]">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Buổi học sắp tới ({group.sessions.length})
                      </h4>
                      {group.joined && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSessionModalGroup(group);
                            setSessLocation(group.locationNote);
                          }}
                          leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                        >
                          Thêm buổi học
                        </Button>
                      )}
                    </div>

                    {group.sessions.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic">
                        Chưa có buổi học nào được lên lịch.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {group.sessions.map((sess) => {
                          const linkedKey = `${group.id}:${sess.id}`;
                          const added =
                            Boolean(sess.addedToCalendar) ||
                            linkedScheduleKeys.has(linkedKey);

                          return (
                            <li
                              key={sess.id}
                              className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 space-y-2"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                                    {sess.title}
                                  </p>
                                  <p className="text-xs text-[var(--text-secondary)] tabular-nums mt-0.5">
                                    {formatRelativeDayLabel(sess.date)} •{' '}
                                    {sess.startTime}–{sess.endTime} •{' '}
                                    {sess.locationOrLink}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-[var(--text-muted)]">
                                {sess.agenda}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={added}
                                onClick={() =>
                                  handleAddSessionToCalendar(
                                    group.id,
                                    sess.id,
                                    sess.title,
                                  )
                                }
                                leftIcon={
                                  added ? (
                                    <CalendarCheck
                                      className="h-4 w-4 text-[var(--status-success)]"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <CalendarPlus
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  )
                                }
                              >
                                {added
                                  ? 'Đã có trong lịch'
                                  : 'Thêm buổi học vào lịch'}
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </CardBody>

                <CardFooter>
                  <span className="text-xs text-[var(--text-muted)] truncate max-w-[60%]">
                    Thành viên: {group.members.slice(0, 3).join(', ')}
                    {group.members.length > 3 ? '...' : ''}
                  </span>
                  <Button
                    size="sm"
                    variant={group.joined ? 'secondary' : 'primary'}
                    disabled={isFull}
                    aria-pressed={Boolean(group.joined)}
                    onClick={() => handleToggleJoin(group)}
                    leftIcon={
                      group.joined ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : undefined
                    }
                  >
                    {group.joined
                      ? 'Rời nhóm'
                      : isFull
                        ? 'Nhóm đã đầy'
                        : 'Tham gia nhóm'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Study Group Modal */}
      <Modal
        isOpen={createOpen}
        onClose={handleCloseCreateModal}
        title="Tạo nhóm học tập mới"
        description="Mời bạn cùng lớp ôn tập định kỳ và chia sẻ buổi học lên lịch cá nhân."
        size="lg"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="new-group-name"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Tên nhóm học <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id="new-group-name"
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ví dụ: Nhóm ôn cuối tuần IT1010 — K2026"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="new-group-course"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Mã môn học (tùy chọn)
              </label>
              <input
                id="new-group-course"
                type="text"
                list="unibuddy-course-codes"
                value={courseCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setCourseCode(val);
                  const found = state.courses.find(
                    (c) => c.code.toLowerCase() === val.toLowerCase(),
                  );
                  if (found) setCourseName(found.name);
                }}
                placeholder="VD: IT1010, MI1110..."
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
              <datalist id="unibuddy-course-codes">
                {state.courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-group-max"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Số thành viên tối đa
              </label>
              <input
                id="new-group-max"
                type="number"
                min={2}
                max={30}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value) || 6)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-group-topic"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Chủ đề / Mục tiêu chính <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id="new-group-topic"
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Luyện bài Lab tuần 4 và rà test case"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="new-group-schedule"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Lịch sinh hoạt dự kiến
              </label>
              <input
                id="new-group-schedule"
                type="text"
                value={scheduleNote}
                onChange={(e) => setScheduleNote(e.target.value)}
                placeholder="VD: Thứ 5 • 16:00–17:30"
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="new-group-location"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Địa điểm hoặc link họp
              </label>
              <input
                id="new-group-location"
                type="text"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="VD: Tầng 2 Thư viện TV-01"
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-group-desc"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Mô tả ngắn
            </label>
            <textarea
              id="new-group-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cách nhóm hoạt động, yêu cầu chuẩn bị trước buổi học..."
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Tạo nhóm học
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Session Modal */}
      <Modal
        isOpen={Boolean(sessionModalGroup)}
        onClose={handleCloseSessionModal}
        title={`Tạo buổi học mới — ${sessionModalGroup?.name ?? ''}`}
        size="md"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="new-sess-title"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Tiêu đề buổi học <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id="new-sess-title"
              type="text"
              required
              value={sessTitle}
              onChange={(e) => setSessTitle(e.target.value)}
              placeholder="VD: Chữa đề ôn tập Chương 2"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="new-sess-date"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Ngày
              </label>
              <input
                id="new-sess-date"
                type="date"
                required
                value={sessDate}
                onChange={(e) => setSessDate(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="new-sess-start"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Bắt đầu
              </label>
              <input
                id="new-sess-start"
                type="time"
                required
                value={sessStart}
                onChange={(e) => setSessStart(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="new-sess-end"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Kết thúc
              </label>
              <input
                id="new-sess-end"
                type="time"
                required
                value={sessEnd}
                onChange={(e) => setSessEnd(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-sess-loc"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Địa điểm / Link tham gia
            </label>
            <input
              id="new-sess-loc"
              type="text"
              value={sessLocation}
              onChange={(e) => setSessLocation(e.target.value)}
              placeholder="VD: Phòng tự học TV-01"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-sess-agenda"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Nội dung dự kiến
            </label>
            <textarea
              id="new-sess-agenda"
              rows={2}
              value={sessAgenda}
              onChange={(e) => setSessAgenda(e.target.value)}
              placeholder="Mỗi thành viên chuẩn bị 1 bài tập..."
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSessionModalGroup(null)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu buổi học
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
