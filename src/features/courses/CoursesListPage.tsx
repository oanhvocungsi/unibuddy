import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  Modal,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { Course } from '../../types/models';
import { cn } from '../../utils/cn';
import { CourseFormModal, type CourseFormPayload } from './CourseFormModal';

export function CoursesListPage() {
  const { state, addCourse, updateCourse, deleteCourse, setSimulation } =
    useAppStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const closeFormModal = useCallback(() => {
    setFormOpen(false);
    setEditingCourse(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeletingCourse(null);
  }, []);

  const isLoading =
    state.simulation.loadingFeature === 'courses' ||
    state.simulation.loadingFeature === 'all';

  const semesters = useMemo(() => {
    const set = new Set<string>();
    for (const c of state.courses) {
      if (c.semester.trim()) set.add(c.semester.trim());
    }
    return Array.from(set);
  }, [state.courses]);

  const pendingTasksByCourse = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of state.tasks) {
      if (t.status === 'todo' && t.courseId) {
        map.set(t.courseId, (map.get(t.courseId) ?? 0) + 1);
      }
    }
    return map;
  }, [state.tasks]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.courses.filter((course) => {
      const matchesSemester =
        semesterFilter === 'all' || course.semester === semesterFilter;
      if (!matchesSemester) return false;
      if (!q) return true;
      return (
        course.name.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q)
      );
    });
  }, [state.courses, search, semesterFilter]);

  const stats = useMemo(() => {
    const totalCredits = filteredCourses.reduce((sum, c) => sum + c.credits, 0);
    const totalPending = filteredCourses.reduce(
      (sum, c) => sum + (pendingTasksByCourse.get(c.id) ?? 0),
      0,
    );
    const avgProgress =
      filteredCourses.length === 0
        ? 0
        : Math.round(
            filteredCourses.reduce((sum, c) => sum + c.progressPercent, 0) /
              filteredCourses.length,
          );
    return {
      count: filteredCourses.length,
      totalCredits,
      totalPending,
      avgProgress,
    };
  }, [filteredCourses, pendingTasksByCourse]);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormOpen(true);
  };

  const handleSaveCourse = (payload: CourseFormPayload) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, payload);
      showToast(`Đã cập nhật môn ${payload.code} — ${payload.name}`, 'success');
    } else {
      addCourse(payload);
      showToast(`Đã thêm môn học ${payload.code} — ${payload.name}`, 'success');
    }
    setFormOpen(false);
    setEditingCourse(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCourse) return;
    const label = `${deletingCourse.code} — ${deletingCourse.name}`;
    deleteCourse(deletingCourse.id);
    setDeletingCourse(null);
    showToast(`Đã xóa môn học ${label}`, 'info');
  };

  const clearFilters = () => {
    setSearch('');
    setSemesterFilter('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 rounded bg-[var(--bg-surface-subtle)] animate-pulse" />
        <LoadingSkeleton rows={4} label="Đang tải danh sách môn học..." />
      </div>
    );
  }

  if (state.simulation.networkError) {
    return (
      <ErrorState
        title="Không thể tải danh sách môn học"
        message="Đã xảy ra lỗi kết nối mô phỏng. Dữ liệu môn học và ghi chú lưu cục bộ trên máy vẫn an toàn."
        onRetry={() => setSimulation({ networkError: false })}
      />
    );
  }

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Môn học của tôi
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Quản lý học phần theo học kỳ, ghi chú buổi học, thẻ ghi nhớ và tiến độ tự đánh giá.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openAddModal}
          className="shrink-0 w-full sm:w-auto"
        >
          Thêm môn học
        </Button>
      </div>

      {/* Semester Summary Strip */}
      <section
        aria-label="Thống kê nhanh học phần"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <Card padded className="p-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Số môn hiển thị
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {stats.count}
          </p>
        </Card>
        <Card padded className="p-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Tổng tín chỉ
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {stats.totalCredits}
          </p>
        </Card>
        <Card padded className="p-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Hạn nộp đang chờ
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--accent-primary)] tabular-nums">
            {stats.totalPending}
          </p>
        </Card>
        <Card padded className="p-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Tiến độ TB tự đánh giá
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--status-success)] tabular-nums">
            {stats.avgProgress}%
          </p>
        </Card>
      </section>

      {/* Search & Semester Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên môn học, mã học phần hoặc giảng viên..."
            aria-label="Tìm kiếm môn học"
            className={cn(inputClass, 'pl-9')}
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            aria-label="Lọc theo học kỳ"
            className={cn(inputClass, 'sm:w-52')}
          >
            <option value="all">Tất cả học kỳ</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          {(search.trim() !== '' || semesterFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters} className="shrink-0">
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Course Cards or Empty State */}
      {state.courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
          title="Bạn chưa có môn học nào"
          description="Thêm các học phần đang theo học trong học kỳ này để lưu ghi chú, checklist ôn tập và tài liệu môn."
          actionLabel="Thêm môn học đầu tiên"
          onAction={openAddModal}
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" aria-hidden="true" />}
          title="Không tìm thấy môn học phù hợp"
          description="Thử tìm với tên môn ngắn hơn, mã học phần hoặc đặt lại bộ lọc học kỳ."
          actionLabel="Xóa bộ lọc"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const pendingCount = pendingTasksByCourse.get(course.id) ?? 0;

            return (
              <Card
                key={course.id}
                interactive
                className="flex flex-col min-w-0 overflow-hidden"
              >
                {/* Thin color orientation strip */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: course.color }}
                  aria-hidden="true"
                />

                <CardBody className="pt-4 flex-1 flex flex-col gap-3.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span
                        className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: course.color }}
                      >
                        {course.code}
                      </span>
                      <Badge variant="default" className="tabular-nums">
                        {course.credits} tín chỉ
                      </Badge>
                    </div>
                    {course.isSample && (
                      <SampleDataBadge label="Mẫu minh họa" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-snug break-words">
                      <Link
                        to={`/mon-hoc/${course.id}`}
                        className="inline-flex items-center min-h-[44px] py-1 max-w-full hover:text-[var(--accent-primary)] hover:underline focus-visible:rounded"
                      >
                        {course.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {course.semester}
                      {course.targetGrade ? ` • Mục tiêu ${course.targetGrade}` : ''}
                    </p>
                  </div>

                  <dl className="space-y-1.5 text-sm text-[var(--text-secondary)] min-w-0">
                    <div className="flex items-start gap-2 min-w-0">
                      <UserCheck
                        className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <dd className="min-w-0 break-words">
                        {course.instructor}
                      </dd>
                    </div>
                    <div className="flex items-start gap-2 min-w-0">
                      <CalendarClock
                        className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <dd className="min-w-0 break-words">
                        {course.scheduleSummary}
                      </dd>
                    </div>
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin
                        className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <dd className="min-w-0 break-words">
                        Phòng {course.room}
                      </dd>
                    </div>
                  </dl>

                  {/* Progress & Pending Tasks */}
                  <div className="mt-auto pt-2 space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-[var(--text-secondary)]">
                          Tiến độ tự đánh giá
                        </span>
                        <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                          {course.progressPercent}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Tiến độ tự đánh giá môn ${course.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={course.progressPercent}
                        className="h-2 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${course.progressPercent}%`,
                            backgroundColor: course.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {pendingCount > 0 ? (
                        <Badge
                          variant="warning"
                          icon={<ClipboardList className="h-3.5 w-3.5" />}
                        >
                          {pendingCount} bài tập cần làm
                        </Badge>
                      ) : (
                        <Badge
                          variant="success"
                          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        >
                          Không có hạn nộp chờ
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="py-2.5 px-4 gap-2">
                  <Link
                    to={`/mon-hoc/${course.id}`}
                    className="min-h-[44px] inline-flex items-center justify-center rounded-lg px-3 text-sm font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary-soft)] transition-colors"
                  >
                    Mở không gian học
                  </Link>

                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Chỉnh sửa môn ${course.name}`}
                      title="Chỉnh sửa môn học"
                      onClick={() => openEditModal(course)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Xóa môn ${course.name}`}
                      title="Xóa môn học"
                      onClick={() => setDeletingCourse(course)}
                      className="text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <CourseFormModal
        isOpen={formOpen}
        onClose={closeFormModal}
        onSubmit={handleSaveCourse}
        initialCourse={editingCourse}
        defaultSemester={semesters[0]}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingCourse)}
        onClose={closeDeleteModal}
        size="sm"
        title="Xác nhận xóa môn học"
        description={
          deletingCourse
            ? `Bạn sắp xóa học phần ${deletingCourse.code} — ${deletingCourse.name}.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={closeDeleteModal}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Xóa môn học
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Toàn bộ ghi chú buổi học, checklist ôn tập, thẻ ghi nhớ và tài liệu riêng gắn với môn học này cũng sẽ bị xóa. Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}

export default CoursesListPage;
