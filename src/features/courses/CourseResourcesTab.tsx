import { useCallback, useId, useMemo, useState, type FormEvent } from 'react';
import {
  ExternalLink,
  FileText,
  Flag,
  FolderOpen,
  Info,
  Link2,
  Plus,
  Presentation,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Modal,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type {
  Course,
  CourseResource,
  CourseResourceOrigin,
  CourseResourceType,
} from '../../types/models';
import { cn } from '../../utils/cn';
import { formatRelativeTimeVi } from '../../utils/dateUtils';
import {
  isSafeHttpUrl,
  RESOURCE_ORIGIN_META,
  RESOURCE_REPORT_REASONS,
  RESOURCE_TYPE_LABELS,
} from './courseConstants';

interface CourseResourcesTabProps {
  course: Course;
}

function ResourceTypeIcon({ type }: { type: CourseResourceType }) {
  switch (type) {
    case 'syllabus':
      return <FileText className="h-5 w-5" aria-hidden="true" />;
    case 'slide':
      return <Presentation className="h-5 w-5" aria-hidden="true" />;
    case 'practice':
      return <Wrench className="h-5 w-5" aria-hidden="true" />;
    case 'link':
      return <Link2 className="h-5 w-5" aria-hidden="true" />;
    case 'reference':
    default:
      return <FolderOpen className="h-5 w-5" aria-hidden="true" />;
  }
}

export function CourseResourcesTab({ course }: CourseResourcesTabProps) {
  const {
    state,
    addCourseResource,
    deleteCourseResource,
    submitModerationReport,
  } = useAppStore();
  const { showToast } = useToast();
  const formId = useId();
  const reportFormId = useId();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CourseResourceType>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add resource state
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<CourseResourceType>('reference');
  const [resOrigin, setResOrigin] = useState<Exclude<CourseResourceOrigin, 'school_sample'>>('personal');
  const [resUrl, setResUrl] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resError, setResError] = useState('');

  // Report modal state
  const [reportingResource, setReportingResource] =
    useState<CourseResource | null>(null);
  const [reportReason, setReportReason] = useState<string>(
    RESOURCE_REPORT_REASONS[0],
  );
  const [reportExtraNote, setReportExtraNote] = useState('');

  const closeReportModal = useCallback(() => {
    setReportingResource(null);
  }, []);

  const reportedResourceIds = useMemo(() => {
    return new Set(
      state.moderationReports
        .filter((r) => r.parentId === course.id)
        .map((r) => r.targetId),
    );
  }, [state.moderationReports, course.id]);

  const resources = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.courseResources
      .filter((r) => r.courseId === course.id)
      .filter((r) => typeFilter === 'all' || r.type === typeFilter)
      .filter((r) => {
        if (!q) return true;
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          RESOURCE_TYPE_LABELS[r.type].toLowerCase().includes(q)
        );
      });
  }, [state.courseResources, course.id, search, typeFilter]);

  const handleAddResource = (e: FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) {
      setResError('Vui lòng nhập tiêu đề tài liệu.');
      return;
    }

    addCourseResource({
      courseId: course.id,
      title: resTitle.trim(),
      type: resType,
      origin: resOrigin,
      url: resUrl.trim() || undefined,
      description:
        resDescription.trim() ||
        'Tài liệu học tập do sinh viên lưu trữ cho môn học.',
    });

    setResTitle('');
    setResType('reference');
    setResOrigin('personal');
    setResUrl('');
    setResDescription('');
    setResError('');
    setShowAddForm(false);
    showToast('Đã thêm tài liệu học tập mới', 'success');
  };

  const handleSubmitReport = (e: FormEvent) => {
    e.preventDefault();
    if (!reportingResource) return;

    const fullReason = reportExtraNote.trim()
      ? `${reportReason}: ${reportExtraNote.trim()}`
      : reportReason;

    submitModerationReport({
      targetType: 'group',
      targetId: reportingResource.id,
      parentId: course.id,
      targetPreview: `[Tài liệu ${course.code}] ${reportingResource.title}`,
      reason: fullReason,
    });

    setReportingResource(null);
    setReportReason(RESOURCE_REPORT_REASONS[0]);
    setReportExtraNote('');
    showToast(
      'Đã gửi báo cáo tài liệu tới ban biên tập để kiểm tra.',
      'success',
    );
  };

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]';

  return (
    <div className="space-y-5">
      {/* Subtle origin clarity note */}
      <div
        role="note"
        className="flex items-start gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 text-xs sm:text-sm text-[var(--text-secondary)]"
      >
        <Info
          className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          Mỗi tài liệu được gắn nhãn nguồn rõ ràng:{' '}
          <strong className="text-[var(--text-primary)]">
            Tài liệu trường (minh họa)
          </strong>{' '}
          chỉ mang tính tham khảo mẫu,{' '}
          <strong className="text-[var(--text-primary)]">
            Cộng đồng chia sẻ
          </strong>{' '}
          từ sinh viên khóa trước, và{' '}
          <strong className="text-[var(--text-primary)]">
            Ghi chú / Tài liệu cá nhân
          </strong>{' '}
          do bạn tự lưu.
        </p>
      </div>

      {/* Filters + Add CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên tài liệu, mô tả..."
              aria-label="Tìm kiếm tài liệu học tập"
              className={cn(inputClass, 'pl-9')}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as 'all' | CourseResourceType)
            }
            aria-label="Lọc theo loại tài liệu"
            className={cn(inputClass, 'sm:w-56')}
          >
            <option value="all">Tất cả loại tài liệu</option>
            {(Object.keys(RESOURCE_TYPE_LABELS) as CourseResourceType[]).map(
              (key) => (
                <option key={key} value={key}>
                  {RESOURCE_TYPE_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </div>

        <Button
          variant={showAddForm ? 'secondary' : 'primary'}
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setResError('');
          }}
        >
          {showAddForm ? 'Đóng biểu mẫu' : 'Thêm tài liệu'}
        </Button>
      </div>

      {/* Add resource form */}
      {showAddForm && (
        <Card className="border-[var(--accent-primary)]/40">
          <CardBody className="pt-5">
            <form onSubmit={handleAddResource} noValidate className="space-y-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Thêm tài liệu học tập mới
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={`${formId}-title`}
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Tiêu đề tài liệu <span className="text-[var(--status-danger)]">*</span>
                  </label>
                  <input
                    id={`${formId}-title`}
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="Ví dụ: Bộ đề ôn tập cuối kỳ tự tổng hợp"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-type`}
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Loại tài liệu
                  </label>
                  <select
                    id={`${formId}-type`}
                    value={resType}
                    onChange={(e) =>
                      setResType(e.target.value as CourseResourceType)
                    }
                    className={inputClass}
                  >
                    {(Object.keys(RESOURCE_TYPE_LABELS) as CourseResourceType[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {RESOURCE_TYPE_LABELS[key]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Nguồn tài liệu
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <label className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 px-3 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`${formId}-origin`}
                        value="personal"
                        checked={resOrigin === 'personal'}
                        onChange={() => setResOrigin('personal')}
                        className="accent-[var(--accent-primary)]"
                      />
                      <span>Ghi chú / Tài liệu cá nhân</span>
                    </label>
                    <label className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 px-3 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name={`${formId}-origin`}
                        value="community"
                        checked={resOrigin === 'community'}
                        onChange={() => setResOrigin('community')}
                        className="accent-[var(--accent-primary)]"
                      />
                      <span>Cộng đồng chia sẻ</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-url`}
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Đường dẫn hoặc vị trí lưu (tùy chọn)
                  </label>
                  <input
                    id={`${formId}-url`}
                    type="text"
                    value={resUrl}
                    onChange={(e) => setResUrl(e.target.value)}
                    placeholder="https://... hoặc Thư mục Drive / Sách giáo trình"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-desc`}
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Mô tả ngắn
                </label>
                <textarea
                  id={`${formId}-desc`}
                  rows={2}
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  placeholder="Nội dung tài liệu này hỗ trợ phần nào của môn học..."
                  className={cn(inputClass, 'min-h-[72px] py-2')}
                />
              </div>

              {resError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-[var(--status-danger)]"
                >
                  {resError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  Lưu tài liệu
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Resource list */}
      {resources.length === 0 ? (
        <EmptyState
          title="Không có tài liệu phù hợp"
          description={
            search.trim() || typeFilter !== 'all'
              ? 'Thử thay đổi bộ lọc loại tài liệu hoặc xóa từ khóa tìm kiếm.'
              : 'Chưa có tài liệu nào được lưu cho môn học này.'
          }
          actionLabel={
            search.trim() || typeFilter !== 'all'
              ? 'Xóa bộ lọc'
              : 'Thêm tài liệu đầu tiên'
          }
          onAction={() => {
            if (search.trim() || typeFilter !== 'all') {
              setSearch('');
              setTypeFilter('all');
            } else {
              setShowAddForm(true);
            }
          }}
        />
      ) : (
        <div className="space-y-3">
          {resources.map((res) => {
            const originMeta = RESOURCE_ORIGIN_META[res.origin];
            const safeLink = isSafeHttpUrl(res.url);
            const isReported = reportedResourceIds.has(res.id);

            return (
              <Card key={res.id}>
                <CardBody className="pt-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface-subtle)] text-[var(--accent-primary)]">
                        <ResourceTypeIcon type={res.type} />
                      </span>

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={originMeta.badgeVariant}>
                            {originMeta.badgeLabel}
                          </Badge>
                          <Badge variant="default">
                            {RESOURCE_TYPE_LABELS[res.type]}
                          </Badge>
                          {isReported && (
                            <Badge variant="warning">Đã báo cáo</Badge>
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-[var(--text-primary)] break-words">
                          {res.title}
                        </h3>

                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                          {res.description}
                        </p>

                        {res.origin === 'school_sample' &&
                          originMeta.helperNote && (
                            <p className="text-xs text-[var(--text-muted)] italic">
                              {originMeta.helperNote}
                            </p>
                          )}

                        {res.url && !safeLink && (
                          <p className="text-xs text-[var(--text-muted)] break-all">
                            Vị trí lưu: {res.url}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {safeLink && res.url && (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          <span>Mở liên kết</span>
                        </a>
                      )}

                      {res.origin === 'personal' && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Trash2 className="h-4 w-4" />}
                          onClick={() => {
                            deleteCourseResource(res.id);
                            showToast('Đã xóa tài liệu cá nhân', 'info');
                          }}
                          className="text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)]"
                        >
                          Xóa
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Flag className="h-4 w-4" />}
                        onClick={() => {
                          setReportingResource(res);
                          setReportReason(RESOURCE_REPORT_REASONS[0]);
                          setReportExtraNote('');
                        }}
                      >
                        Báo cáo tài liệu
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
                    Đã thêm: {formatRelativeTimeVi(res.addedAt) || 'Gần đây'}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Report Resource Modal */}
      <Modal
        isOpen={Boolean(reportingResource)}
        onClose={closeReportModal}
        size="md"
        title="Báo cáo tài liệu"
        description={
          reportingResource
            ? `Phản hồi vấn đề về tài liệu "${reportingResource.title}" để ban biên tập kiểm tra.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={closeReportModal}>
              Hủy
            </Button>
            <Button type="submit" form={reportFormId} variant="danger">
              Gửi báo cáo
            </Button>
          </>
        }
      >
        <form id={reportFormId} onSubmit={handleSubmitReport} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Chọn lý do báo cáo
            </legend>
            {RESOURCE_REPORT_REASONS.map((reason) => (
              <label
                key={reason}
                className="min-h-[44px] flex items-center gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 px-3.5 py-2 cursor-pointer text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              >
                <input
                  type="radio"
                  name={`${reportFormId}-reason`}
                  value={reason}
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                  className="accent-[var(--accent-primary)]"
                />
                <span>{reason}</span>
              </label>
            ))}
          </fieldset>

          <div>
            <label
              htmlFor={`${reportFormId}-note`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Chi tiết bổ sung (tùy chọn)
            </label>
            <textarea
              id={`${reportFormId}-note`}
              rows={3}
              value={reportExtraNote}
              onChange={(e) => setReportExtraNote(e.target.value)}
              placeholder="Mô tả cụ thể điểm chưa chính xác hoặc đường dẫn bị lỗi..."
              className={cn(inputClass, 'min-h-[84px] py-2')}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
