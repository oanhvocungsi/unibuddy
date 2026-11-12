import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  FolderOpen,
  Layers,
  LayoutDashboard,
  MapPin,
  Pencil,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  DeletedContentState,
  ErrorState,
  LoadingSkeleton,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { CourseFormModal, type CourseFormPayload } from './CourseFormModal';
import { CourseNotesTab } from './CourseNotesTab';
import { CourseOverviewTab } from './CourseOverviewTab';
import { CourseResourcesTab } from './CourseResourcesTab';
import { CourseRevisionTab } from './CourseRevisionTab';

type CourseTabId = 'overview' | 'notes' | 'revision' | 'resources';

const VALID_TABS: CourseTabId[] = ['overview', 'notes', 'revision', 'resources'];

function parseTabParam(raw: string | null): CourseTabId {
  if (raw && VALID_TABS.includes(raw as CourseTabId)) {
    return raw as CourseTabId;
  }
  return 'overview';
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, updateCourse, setSimulation } = useAppStore();
  const { showToast } = useToast();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const closeEditModal = useCallback(() => setEditModalOpen(false), []);
  const activeTab = parseTabParam(searchParams.get('tab'));
  const tabButtonRefs = useRef<Record<CourseTabId, HTMLButtonElement | null>>({
    overview: null,
    notes: null,
    revision: null,
    resources: null,
  });

  const isLoading =
    state.simulation.loadingFeature === 'courses' ||
    state.simulation.loadingFeature === 'all';

  const course = useMemo(
    () => state.courses.find((c) => c.id === id) ?? null,
    [state.courses, id],
  );

  const counts = useMemo(() => {
    if (!course) {
      return { notes: 0, revision: 0, resources: 0 };
    }
    return {
      notes: state.courseNotes.filter((n) => n.courseId === course.id).length,
      revision:
        state.flashcards.filter((f) => f.courseId === course.id).length +
        state.courseChecklists.filter((c) => c.courseId === course.id).length,
      resources: state.courseResources.filter((r) => r.courseId === course.id)
        .length,
    };
  }, [
    course,
    state.courseNotes,
    state.flashcards,
    state.courseChecklists,
    state.courseResources,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-6 w-40 rounded bg-[var(--bg-surface-subtle)] animate-pulse" />
        <LoadingSkeleton rows={4} label="Đang tải thông tin môn học..." />
      </div>
    );
  }

  if (state.simulation.networkError) {
    return (
      <ErrorState
        title="Không thể tải chi tiết môn học"
        onRetry={() => setSimulation({ networkError: false })}
      />
    );
  }

  if (!course) {
    return (
      <DeletedContentState
        title="Môn học không tồn tại hoặc đã bị xóa"
        description="Học phần này không còn trong danh sách của bạn. Bạn có thể quay về trang Danh sách môn học để chọn hoặc tạo môn mới."
        actionLabel="Quay lại danh sách môn học"
        onBack={() => navigate('/mon-hoc')}
      />
    );
  }

  const selectTab = (tabId: CourseTabId) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next, { replace: true });
  };

  const tabs: Array<{
    id: CourseTabId;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }> = [
    {
      id: 'overview',
      label: 'Tổng quan & Hạn nộp',
      icon: LayoutDashboard,
    },
    {
      id: 'notes',
      label: 'Ghi chú theo buổi',
      icon: FileText,
      count: counts.notes,
    },
    {
      id: 'revision',
      label: 'Ôn tập & Thẻ ghi nhớ',
      icon: Layers,
      count: counts.revision,
    },
    {
      id: 'resources',
      label: 'Tài liệu học tập',
      icon: FolderOpen,
      count: counts.resources,
    },
  ];

  const handleTabKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const targetTab = tabs[nextIndex].id;
      selectTab(targetTab);
      tabButtonRefs.current[targetTab]?.focus();
    }
  };

  const handleEditSave = (payload: CourseFormPayload) => {
    updateCourse(course.id, payload);
    setEditModalOpen(false);
    showToast(`Đã cập nhật thông tin môn ${payload.code}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Back breadcrumb */}
      <div>
        <Link
          to="/mon-hoc"
          className="min-h-[44px] inline-flex items-center gap-2 rounded-lg px-2 -ml-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Quay lại danh sách môn học</span>
        </Link>
      </div>

      {/* Course Header Card */}
      <Card className="overflow-hidden">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: course.color }}
          aria-hidden="true"
        />

        <CardBody className="pt-5 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="space-y-3 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: course.color }}
                >
                  {course.code}
                </span>
                <Badge variant="default" className="tabular-nums">
                  {course.credits} tín chỉ
                </Badge>
                <Badge variant="outline">{course.semester}</Badge>
                {course.targetGrade && (
                  <Badge variant="primary">Mục tiêu: {course.targetGrade}</Badge>
                )}
                {course.isSample && (
                  <SampleDataBadge label="Học phần minh họa" />
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-tight break-words">
                {course.name}
              </h1>

              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-secondary)]">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <UserCheck
                    className="h-4 w-4 text-[var(--text-muted)] shrink-0"
                    aria-hidden="true"
                  />
                  <dd className="break-words">{course.instructor}</dd>
                </div>
                <div className="inline-flex items-center gap-2 min-w-0">
                  <MapPin
                    className="h-4 w-4 text-[var(--text-muted)] shrink-0"
                    aria-hidden="true"
                  />
                  <dd>Phòng {course.room}</dd>
                </div>
                <div className="inline-flex items-center gap-2 min-w-0">
                  <CalendarClock
                    className="h-4 w-4 text-[var(--text-muted)] shrink-0"
                    aria-hidden="true"
                  />
                  <dd className="break-words">{course.scheduleSummary}</dd>
                </div>
              </dl>
            </div>

            {/* Progress Slider + Actions */}
            <div className="w-full lg:w-80 shrink-0 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/60 p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="course-detail-progress-slider"
                    className="text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Tiến độ tự đánh giá
                  </label>
                  <span className="text-sm font-bold text-[var(--accent-primary)] tabular-nums">
                    {course.progressPercent}%
                  </span>
                </div>
                <input
                  id="course-detail-progress-slider"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={course.progressPercent}
                  onChange={(e) =>
                    updateCourse(course.id, {
                      progressPercent: Number(e.target.value),
                    })
                  }
                  aria-label="Tiến độ tự đánh giá môn học"
                  aria-valuetext={`${course.progressPercent}%`}
                  className="w-full h-11 accent-[var(--accent-primary)] cursor-pointer"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Pencil className="h-4 w-4" />}
                  onClick={() => setEditModalOpen(true)}
                  className="flex-1"
                >
                  Chỉnh sửa môn
                </Button>
                <Link
                  to="/kham-pha?tab=community"
                  className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] whitespace-nowrap"
                >
                  <Users className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                  <span>Nhóm học tập</span>
                </Link>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Accessible 4-Tab Navigation */}
      <div
        role="tablist"
        aria-label="Các mục học tập của môn học"
        className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-hairline)]"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabButtonRefs.current[tab.id] = el;
              }}
              id={`course-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`course-tabpanel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={cn(
                'min-h-[44px] inline-flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0',
                isSelected
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/50 font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]/70',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'inline-flex min-w-[20px] h-5 items-center justify-center rounded-full px-1.5 text-xs tabular-nums',
                    isSelected
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div
        id={`course-tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`course-tab-${activeTab}`}
        tabIndex={0}
        className="focus:outline-none"
      >
        <h2 className="sr-only">
          {tabs.find((t) => t.id === activeTab)?.label ?? 'Chi tiết môn học'}
        </h2>
        {activeTab === 'overview' && (
          <CourseOverviewTab
            course={course}
            onEditCourse={() => setEditModalOpen(true)}
          />
        )}
        {activeTab === 'notes' && <CourseNotesTab course={course} />}
        {activeTab === 'revision' && <CourseRevisionTab course={course} />}
        {activeTab === 'resources' && <CourseResourcesTab course={course} />}
      </div>

      {/* Edit Course Modal */}
      <CourseFormModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSubmit={handleEditSave}
        initialCourse={course}
      />
    </div>
  );
}

export default CourseDetailPage;
