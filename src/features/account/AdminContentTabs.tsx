import { useState, type FormEvent } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  Edit3,
  Flag,
  History,
  MapPin,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  EmptyState,
  Modal,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import {
  CAMPUS_LOCATION_CATEGORY_LABELS,
} from '../../data/campusData';
import { EVENT_CATEGORY_LABELS } from '../../data/communityData';
import { HANDBOOK_CATEGORY_LABELS } from '../../data/handbookData';
import { useAppStore } from '../../store/appStore';
import type {
  CampusEvent,
  CampusEventCategory,
  CampusLocationCategory,
  HandbookArticle,
  HandbookCategory,
  NotificationCategory,
  NotificationPriority,
} from '../../types/models';
import { formatRelativeTimeVi, todayOffset } from '../../utils/dateUtils';

export function AdminNotificationsTab() {
  const { state, addNotification, deleteNotification } = useAppStore();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('academic');
  const [priority, setPriority] = useState<NotificationPriority>('important');
  const [actionRoute, setActionRoute] = useState('/kham-pha');
  const [error, setError] = useState('');

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }
    setError('');
    addNotification({
      title: title.trim(),
      message: message.trim(),
      category,
      priority,
      actionRoute: actionRoute.trim() || undefined,
      isSample: true,
    });
    setTitle('');
    setMessage('');
    showToast('Đã đăng thông báo mẫu mới lên Trung tâm thông báo', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Card className="lg:col-span-5">
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              Đăng thông báo mẫu
            </h2>
            <CardDescription>
              Tạo thông báo gắn nhãn mẫu minh họa gửi tới toàn bộ bảng tin sinh
              viên.
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handlePublish} className="space-y-3.5" noValidate>
            <div>
              <label
                htmlFor="adm-notif-title"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Tiêu đề thông báo *
              </label>
              <input
                id="adm-notif-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Lịch nghỉ lễ & thay đổi phòng học tuần tới"
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="adm-notif-cat"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Danh mục
                </label>
                <select
                  id="adm-notif-cat"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as NotificationCategory)
                  }
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                >
                  <option value="schedule">Lịch học</option>
                  <option value="deadline">Hạn nộp</option>
                  <option value="academic">Học tập</option>
                  <option value="group">Nhóm học</option>
                  <option value="event">Sự kiện</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="adm-notif-prio"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Mức độ
                </label>
                <select
                  id="adm-notif-prio"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as NotificationPriority)
                  }
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                >
                  <option value="normal">Thông thường</option>
                  <option value="important">Quan trọng</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="adm-notif-route"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Đường dẫn liên quan (tùy chọn)
              </label>
              <input
                id="adm-notif-route"
                type="text"
                value={actionRoute}
                onChange={(e) => setActionRoute(e.target.value)}
                placeholder="/kham-pha"
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="adm-notif-msg"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Nội dung thông báo *
              </label>
              <textarea
                id="adm-notif-msg"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung ngắn gọn, rõ ràng cho tân sinh viên..."
                className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-[var(--status-danger)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" leftIcon={<Bell className="h-4 w-4" />}>
              Đăng thông báo mẫu
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="lg:col-span-7">
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
            Thông báo đã phát ({state.notifications.length})
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {state.notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-[var(--border-hairline)] p-3.5 flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={n.priority === 'urgent' ? 'danger' : 'default'}>
                    {n.priority}
                  </Badge>
                  {n.isSample && <SampleDataBadge label="Mẫu" />}
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatRelativeTimeVi(n.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {n.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {n.message}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Xóa ${n.title}`}
                onClick={() => {
                  deleteNotification(n.id);
                  showToast('Đã xóa thông báo', 'info');
                }}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Xóa
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export function AdminHandbookTab() {
  const { state, upsertHandbookArticle, deleteHandbookArticle } = useAppStore();
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HandbookCategory>('getting_started');
  const [summary, setSummary] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [docsText, setDocsText] = useState('');
  const [sourceUnit, setSourceUnit] = useState('Phòng Đào tạo (Minh họa)');
  const [officialGuidance, setOfficialGuidance] = useState(
    'Nội dung minh họa; kiểm tra quy định chính thức trên cổng thông tin trường.',
  );
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<HandbookArticle | null>(null);

  const loadForEdit = (art: HandbookArticle) => {
    setEditingId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setSummary(art.summary);
    setStepsText(art.steps.join('\n'));
    setDocsText(art.requiredDocs.join('\n'));
    setSourceUnit(art.sourceUnit);
    setOfficialGuidance(art.officialGuidance);
    setError('');
  };

  const resetForm = () => {
    setEditingId(undefined);
    setTitle('');
    setSummary('');
    setStepsText('');
    setDocsText('');
    setError('');
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setError('Vui lòng nhập tiêu đề và tóm tắt bài cẩm nang.');
      return;
    }
    const steps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const requiredDocs = docsText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    upsertHandbookArticle({
      id: editingId,
      title: title.trim(),
      category,
      summary: summary.trim(),
      steps: steps.length > 0 ? steps : ['Xem hướng dẫn chi tiết trên cổng trường.'],
      requiredDocs:
        requiredDocs.length > 0 ? requiredDocs : ['Thẻ sinh viên'],
      sourceUnit: sourceUnit.trim() || 'Đơn vị minh họa',
      officialGuidance: officialGuidance.trim(),
      tags: ['cẩm nang', 'năm nhất'],
      readMinutes: 4,
      isSample: true,
    });
    showToast(
      editingId ? 'Đã cập nhật bài cẩm nang' : 'Đã tạo bài cẩm nang mới',
      'success',
    );
    resetForm();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Card className="lg:col-span-5">
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              {editingId ? 'Chỉnh sửa bài cẩm nang' : 'Thêm bài cẩm nang mới'}
            </h2>
            <CardDescription>
              Mọi bài viết quản trị được gắn nhãn minh họa.
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-3" noValidate>
            <div>
              <label
                htmlFor="hb-title"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Tiêu đề bài viết *
              </label>
              <input
                id="hb-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="hb-cat"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Danh mục
              </label>
              <select
                id="hb-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as HandbookCategory)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              >
                {(
                  Object.keys(HANDBOOK_CATEGORY_LABELS) as HandbookCategory[]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {HANDBOOK_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="hb-summary"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Tóm tắt *
              </label>
              <textarea
                id="hb-summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="hb-steps"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Các bước thực hiện (mỗi dòng 1 bước)
              </label>
              <textarea
                id="hb-steps"
                rows={3}
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                placeholder={'Bước 1...\nBước 2...'}
                className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="hb-docs"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Giấy tờ cần thiết (mỗi dòng 1 mục)
              </label>
              <textarea
                id="hb-docs"
                rows={2}
                value={docsText}
                onChange={(e) => setDocsText(e.target.value)}
                placeholder="Thẻ sinh viên"
                className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="hb-unit"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Đơn vị phụ trách (Minh họa)
              </label>
              <input
                id="hb-unit"
                type="text"
                value={sourceUnit}
                onChange={(e) => setSourceUnit(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-[var(--status-danger)]">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy sửa
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1"
                leftIcon={<BookOpen className="h-4 w-4" />}
              >
                {editingId ? 'Lưu cập nhật' : 'Tạo bài cẩm nang'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="lg:col-span-7">
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
            Danh sách bài cẩm nang ({state.handbookArticles.length})
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {state.handbookArticles.map((art) => (
            <div
              key={art.id}
              className="rounded-xl border border-[var(--border-hairline)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">
                    {HANDBOOK_CATEGORY_LABELS[art.category]}
                  </Badge>
                  {art.isSample && <SampleDataBadge label="Mẫu" />}
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {art.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {art.summary}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadForEdit(art)}
                  leftIcon={<Edit3 className="h-4 w-4" />}
                >
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(art)}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xóa bài cẩm nang?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteTarget) {
                  deleteHandbookArticle(deleteTarget.id);
                  showToast('Đã xóa bài cẩm nang', 'info');
                  setDeleteTarget(null);
                }
              }}
            >
              Xóa bài viết
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Bạn chắc chắn muốn xóa &ldquo;{deleteTarget?.title}&rdquo;?
        </p>
      </Modal>
    </div>
  );
}

export function AdminEventsAndLocationsTab() {
  const {
    state,
    upsertCampusEvent,
    upsertCampusLocation,
    deleteCampusLocation,
  } = useAppStore();
  const { showToast } = useToast();

  // Event form state
  const [evId, setEvId] = useState<string | undefined>(undefined);
  const [evTitle, setEvTitle] = useState('');
  const [evOrganizer, setEvOrganizer] = useState('Phòng CTSV (Minh họa)');
  const [evCategory, setEvCategory] =
    useState<CampusEventCategory>('orientation');
  const [evDate, setEvDate] = useState(() => todayOffset(3));
  const [evStart, setEvStart] = useState('14:00');
  const [evEnd, setEvEnd] = useState('16:00');
  const [evLocation, setEvLocation] = useState('Hội trường HT-01');
  const [evDesc, setEvDesc] = useState('');
  const [evCapacity, setEvCapacity] = useState('100');

  // Location form state
  const [locCode, setLocCode] = useState('');
  const [locName, setLocName] = useState('');
  const [locCategory, setLocCategory] =
    useState<CampusLocationCategory>('building');
  const [locX, setLocX] = useState('50');
  const [locY, setLocY] = useState('50');
  const [locHours, setLocHours] = useState('07:00 – 17:30 (Minh họa)');

  const handleSaveEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) {
      showToast('Vui lòng nhập tên sự kiện', 'warning');
      return;
    }
    const existing = evId ? state.events.find((x) => x.id === evId) : undefined;
    upsertCampusEvent({
      id: evId,
      title: evTitle.trim(),
      organizer: evOrganizer.trim() || 'Đơn vị minh họa',
      category: evCategory,
      date: evDate,
      startTime: evStart,
      endTime: evEnd,
      location: evLocation.trim() || 'Khuôn viên chính',
      description: evDesc.trim() || 'Sự kiện dành cho tân sinh viên.',
      status: existing?.status ?? 'upcoming',
      capacity: Math.max(10, Number(evCapacity) || 100),
      registeredCount: existing?.registeredCount ?? 0,
      isSample: true,
    });
    setEvId(undefined);
    setEvTitle('');
    setEvDesc('');
    showToast(evId ? 'Đã cập nhật sự kiện' : 'Đã tạo sự kiện mới', 'success');
  };

  const handleCancelEvent = (ev: CampusEvent) => {
    upsertCampusEvent({
      ...ev,
      status: 'cancelled',
      statusNote: 'Đã hủy bởi Quản trị viên',
    });
    showToast(`Đã hủy sự kiện "${ev.title}"`, 'info');
  };

  const handleAddLocation = (e: FormEvent) => {
    e.preventDefault();
    if (!locCode.trim() || !locName.trim()) {
      showToast('Vui lòng nhập mã và tên địa điểm', 'warning');
      return;
    }
    upsertCampusLocation({
      code: locCode.trim().toUpperCase(),
      name: locName.trim(),
      category: locCategory,
      x: Math.max(5, Math.min(95, Number(locX) || 50)),
      y: Math.max(5, Math.min(95, Number(locY) || 50)),
      openHours: locHours.trim(),
      contactNote: 'Liên hệ minh họa trên cổng thông tin trường.',
      floorGuide: ['Tầng 1: Sảnh tiếp đón'],
      routeFromMainGate: ['Từ Cổng chính đi thẳng theo bảng chỉ dẫn khuôn viên.'],
      services: ['Hỗ trợ sinh viên'],
      isSample: true,
    });
    setLocCode('');
    setLocName('');
    showToast('Đã thêm địa điểm lên bản đồ 2D', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Events management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5">
          <CardHeader>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              {evId ? 'Cập nhật sự kiện' : 'Tạo sự kiện khuôn viên'}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label
                  htmlFor="adm-ev-title"
                  className="block text-sm font-medium mb-1"
                >
                  Tên sự kiện *
                </label>
                <input
                  id="adm-ev-title"
                  type="text"
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="adm-ev-cat"
                    className="block text-xs font-medium mb-1"
                  >
                    Loại sự kiện
                  </label>
                  <select
                    id="adm-ev-cat"
                    value={evCategory}
                    onChange={(e) =>
                      setEvCategory(e.target.value as CampusEventCategory)
                    }
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-sm"
                  >
                    {(
                      Object.keys(EVENT_CATEGORY_LABELS) as CampusEventCategory[]
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {EVENT_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="adm-ev-cap"
                    className="block text-xs font-medium mb-1"
                  >
                    Sức chứa
                  </label>
                  <input
                    id="adm-ev-cap"
                    type="number"
                    min={10}
                    value={evCapacity}
                    onChange={(e) => setEvCapacity(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="date"
                  aria-label="Ngày diễn ra"
                  value={evDate}
                  onChange={(e) => setEvDate(e.target.value)}
                  className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 text-xs"
                />
                <input
                  type="time"
                  aria-label="Giờ bắt đầu"
                  value={evStart}
                  onChange={(e) => setEvStart(e.target.value)}
                  className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 text-xs"
                />
                <input
                  type="time"
                  aria-label="Giờ kết thúc"
                  value={evEnd}
                  onChange={(e) => setEvEnd(e.target.value)}
                  className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 text-xs"
                />
              </div>

              <input
                type="text"
                aria-label="Địa điểm tổ chức"
                value={evLocation}
                onChange={(e) => setEvLocation(e.target.value)}
                placeholder="Địa điểm (VD: Hội trường HT-01)"
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              />

              <input
                type="text"
                aria-label="Đơn vị tổ chức"
                value={evOrganizer}
                onChange={(e) => setEvOrganizer(e.target.value)}
                placeholder="Đơn vị tổ chức"
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              />

              <textarea
                rows={2}
                aria-label="Mô tả sự kiện"
                value={evDesc}
                onChange={(e) => setEvDesc(e.target.value)}
                placeholder="Mô tả ngắn nội dung sự kiện..."
                className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm"
              />

              <div className="flex gap-2">
                {evId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEvId(undefined);
                      setEvTitle('');
                    }}
                  >
                    Hủy
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  leftIcon={<CalendarDays className="h-4 w-4" />}
                >
                  {evId ? 'Lưu sự kiện' : 'Tạo sự kiện'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              Sự kiện hiện có ({state.events.length})
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {state.events.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-[var(--border-hairline)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        ev.status === 'cancelled'
                          ? 'danger'
                          : ev.status === 'updated'
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {ev.status === 'cancelled'
                        ? 'Đã hủy'
                        : ev.status === 'updated'
                          ? 'Cập nhật'
                          : 'Sắp diễn ra'}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)] tabular-nums">
                      {ev.date} • {ev.startTime}–{ev.endTime}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {ev.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {ev.location} • {ev.registeredCount}/{ev.capacity} đăng ký
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEvId(ev.id);
                      setEvTitle(ev.title);
                      setEvOrganizer(ev.organizer);
                      setEvCategory(ev.category);
                      setEvDate(ev.date);
                      setEvStart(ev.startTime);
                      setEvEnd(ev.endTime);
                      setEvLocation(ev.location);
                      setEvDesc(ev.description);
                      setEvCapacity(String(ev.capacity));
                    }}
                  >
                    Sửa
                  </Button>
                  {ev.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelEvent(ev)}
                      leftIcon={<XCircle className="h-4 w-4" />}
                    >
                      Hủy sự kiện
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Campus locations management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5">
          <CardHeader>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              Thêm địa điểm bản đồ 2D
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAddLocation} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  aria-label="Mã địa điểm"
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value)}
                  placeholder="Mã (VD: D1-101)"
                  className="sm:col-span-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                />
                <input
                  type="text"
                  aria-label="Tên địa điểm"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="Tên tòa nhà / phòng"
                  className="sm:col-span-2 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                />
              </div>

              <select
                aria-label="Loại địa điểm"
                value={locCategory}
                onChange={(e) =>
                  setLocCategory(e.target.value as CampusLocationCategory)
                }
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              >
                {(
                  Object.keys(
                    CAMPUS_LOCATION_CATEGORY_LABELS,
                  ) as CampusLocationCategory[]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {CAMPUS_LOCATION_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={5}
                  max={95}
                  aria-label="Tọa độ X (5-95)"
                  value={locX}
                  onChange={(e) => setLocX(e.target.value)}
                  placeholder="Tọa độ X"
                  className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm tabular-nums"
                />
                <input
                  type="number"
                  min={5}
                  max={95}
                  aria-label="Tọa độ Y (5-95)"
                  value={locY}
                  onChange={(e) => setLocY(e.target.value)}
                  placeholder="Tọa độ Y"
                  className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm tabular-nums"
                />
              </div>

              <input
                type="text"
                aria-label="Giờ mở cửa"
                value={locHours}
                onChange={(e) => setLocHours(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
              />

              <Button
                type="submit"
                className="w-full"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Thêm điểm bản đồ
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              Địa điểm khuôn viên ({state.campusLocations.length})
            </h2>
          </CardHeader>
          <CardBody className="space-y-2.5">
            {state.campusLocations.map((loc) => (
              <div
                key={loc.id}
                className="rounded-lg border border-[var(--border-hairline)] p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" icon={<MapPin className="h-3 w-3" />}>
                      {loc.code}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      {CAMPUS_LOCATION_CATEGORY_LABELS[loc.category]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate mt-1">
                    {loc.name}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Xóa địa điểm ${loc.code}`}
                  onClick={() => {
                    deleteCampusLocation(loc.id);
                    showToast(`Đã xóa địa điểm ${loc.code}`, 'info');
                  }}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export function AdminModerationTab() {
  const { state, resolveModerationReport } = useAppStore();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Card className="lg:col-span-7">
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              Kiểm duyệt báo cáo ({state.moderationReports.length})
            </h2>
            <CardDescription>
              Xử lý các báo cáo tài liệu và hỏi đáp do thành viên gửi lên.
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {state.moderationReports.length === 0 ? (
            <EmptyState
              icon={<Flag className="h-6 w-6" />}
              title="Chưa có báo cáo nào"
              description="Các báo cáo nội dung từ Tài liệu môn học và Cộng đồng sẽ xuất hiện tại đây."
            />
          ) : (
            state.moderationReports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-xl border border-[var(--border-hairline)] p-4 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        rep.status === 'pending'
                          ? 'warning'
                          : rep.status === 'resolved_hidden'
                            ? 'danger'
                            : 'default'
                      }
                    >
                      {rep.status === 'pending'
                        ? 'Chờ xử lý'
                        : rep.status === 'resolved_hidden'
                          ? 'Đã ẩn nội dung'
                          : 'Đã bỏ qua'}
                    </Badge>
                    <Badge variant="outline">{rep.targetType}</Badge>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    Báo cáo bởi {rep.reportedBy} •{' '}
                    {formatRelativeTimeVi(rep.createdAt)}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  &ldquo;{rep.targetPreview}&rdquo;
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Lý do: {rep.reason}
                </p>

                {rep.status === 'pending' ? (
                  <div className="space-y-2 pt-2 border-t border-[var(--border-hairline)]">
                    <input
                      type="text"
                      aria-label={`Ghi chú xử lý báo cáo ${rep.id}`}
                      value={notes[rep.id] ?? ''}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [rep.id]: e.target.value,
                        }))
                      }
                      placeholder="Ghi chú lý do xử lý (tùy chọn)..."
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          resolveModerationReport(
                            rep.id,
                            'hide',
                            notes[rep.id] || 'Ẩn theo quyết định kiểm duyệt',
                          );
                          showToast('Đã ẩn nội dung và ghi nhật ký', 'info');
                        }}
                      >
                        Ẩn nội dung
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Check className="h-4 w-4" />}
                        onClick={() => {
                          resolveModerationReport(
                            rep.id,
                            'dismiss',
                            notes[rep.id] || 'Nội dung hợp lệ',
                          );
                          showToast('Đã bỏ qua báo cáo', 'info');
                        }}
                      >
                        Bỏ qua báo cáo
                      </Button>
                    </div>
                  </div>
                ) : (
                  rep.resolutionNote && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Kết quả xử lý: {rep.resolutionNote}
                    </p>
                  )
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card className="lg:col-span-5">
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug flex items-center gap-2">
              <History className="h-4 w-4 text-[var(--accent-primary)]" />
              <span>Lịch sử cập nhật (Audit Log)</span>
            </h2>
            <CardDescription>
              Các thao tác quản trị và kiểm duyệt gần đây.
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody className="space-y-2.5">
          {state.auditLogs.length === 0 ? (
            <EmptyState
              title="Chưa có nhật ký cập nhật"
              description="Các thao tác tạo, sửa hoặc kiểm duyệt sẽ được lưu tại đây."
            />
          ) : (
            state.auditLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {log.action}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {formatRelativeTimeVi(log.createdAt)}
                  </span>
                </div>
                <p className="text-[var(--text-primary)]">{log.targetLabel}</p>
                <p className="text-[var(--text-muted)]">
                  {log.actorName} ({log.actorRole})
                  {log.details ? ` • ${log.details}` : ''}
                </p>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
