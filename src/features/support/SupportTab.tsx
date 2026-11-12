import { useState, type FormEvent } from 'react';
import {
  BookOpen,
  CalendarCheck,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  MapPin,
  Phone,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import {
  SUPPORT_CENTER_CATEGORY_LABELS,
  WELLNESS_GUIDE_CATEGORY_LABELS,
} from '../../data/lifeAndSupportData';
import { useAppStore } from '../../store/appStore';
import type { WellnessGuideCategory } from '../../types/models';
import { formatFullDateVi, todayOffset } from '../../utils/dateUtils';

const TIME_SLOTS = [
  '08:30 – 09:00',
  '09:30 – 10:00',
  '10:30 – 11:00',
  '14:00 – 14:30',
  '15:00 – 15:30',
  '16:00 – 16:30',
];

export function SupportTab() {
  const { state, bookSupportAppointment, cancelSupportAppointment } =
    useAppStore();
  const { showToast } = useToast();

  const bookableCenters = state.supportCenters.filter((c) => c.bookingAvailable);
  const [centerId, setCenterId] = useState(
    () => bookableCenters[0]?.id ?? state.supportCenters[0]?.id ?? '',
  );
  const [date, setDate] = useState(() => todayOffset(1));
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[3]);
  const [mode, setMode] = useState<'in_person' | 'online'>('in_person');
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  const [guideCategory, setGuideCategory] = useState<
    WellnessGuideCategory | 'all'
  >('all');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(
    () => state.wellnessGuides[0]?.id ?? null,
  );

  const selectedCenter =
    state.supportCenters.find((c) => c.id === centerId) ?? bookableCenters[0];

  const handleBookSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) {
      setFormError('Chưa có đơn vị hỗ trợ khả dụng để đặt lịch.');
      return;
    }
    if (!topic.trim()) {
      setFormError('Vui lòng nhập nội dung cần trao đổi.');
      return;
    }
    if (!date) {
      setFormError('Vui lòng chọn ngày hẹn.');
      return;
    }

    setFormError('');
    bookSupportAppointment({
      centerId: selectedCenter.id,
      centerName: selectedCenter.name,
      date,
      timeSlot,
      mode,
      topic: topic.trim(),
      note: note.trim() || undefined,
    });
    setTopic('');
    setNote('');
    showToast(
      `Đã đặt lịch hẹn minh họa với ${selectedCenter.name}`,
      'success',
    );
  };

  const handleSelectCenterForBooking = (id: string) => {
    setCenterId(id);
    const bookingEl = document.getElementById('support-booking-form');
    bookingEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const topicInput = document.getElementById('appt-topic');
    topicInput?.focus();
  };

  const filteredGuides = state.wellnessGuides.filter(
    (g) => guideCategory === 'all' || g.category === guideCategory,
  );

  return (
    <div className="space-y-6">
      {/* Sample contact disclaimer banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
        <div className="space-y-1.5 min-w-0">
          <SampleDataBadge label="Liên hệ & giờ làm việc minh họa" />
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Liên hệ &amp; giờ làm việc minh họa — tra cứu cổng thông tin chính
            thức của trường bạn. Thông tin phòng ban, email và giờ trực dưới
            đây là dữ liệu mẫu cho sinh viên năm nhất làm quen quy trình tìm hỗ
            trợ.
          </p>
        </div>
      </div>

      {/* Emergency & Medical Disclaimer Card */}
      <Card className="border-[var(--status-warning)]/40 bg-[var(--status-warning-soft)]/35">
        <CardBody className="pt-5 flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--status-warning-soft)] text-[var(--status-warning)]">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Khuyến cáo y tế & Hỗ trợ khẩn cấp
              </h2>
              <Badge
                variant="warning"
                icon={<ShieldAlert className="h-3.5 w-3.5" />}
              >
                Không thay thế chuyên gia
              </Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-prose">
              UniBuddy là công cụ đồng hành học tập và đời sống —{' '}
              <strong className="font-semibold text-[var(--text-primary)]">
                không chẩn đoán y khoa, không tư vấn điều trị và không thay thế
                bác sĩ hay chuyên gia tâm lý
              </strong>
              .
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-prose">
              <strong className="font-semibold text-[var(--text-primary)]">
                Trong tình huống khẩn cấp:
              </strong>{' '}
              Nếu bạn hoặc người xung quanh đang gặp nguy hiểm sức khỏe hoặc
              khủng hoảng tinh thần cấp bách, hãy gọi ngay số cấp cứu địa phương
              hoặc liên hệ trực tiếp Phòng Y tế / bảo vệ khuôn viên theo số
              chính thức trên cổng thông tin trường bạn.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Main split: Support Centers + Booking & Private Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-labelledby="support-centers-heading"
          className="lg:col-span-7 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="support-centers-heading"
              className="text-lg font-semibold text-[var(--text-primary)]"
            >
              Các đơn vị hỗ trợ sinh viên (Minh họa)
            </h2>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {state.supportCenters.length} đầu mối
            </span>
          </div>

          <div className="space-y-3">
            {state.supportCenters.map((center) => (
              <Card key={center.id} interactive>
                <CardHeader className="pb-2">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">
                        {SUPPORT_CENTER_CATEGORY_LABELS[center.category]}
                      </Badge>
                      {center.isSample && (
                        <SampleDataBadge label="Minh họa" />
                      )}
                    </div>
                    <CardTitle>{center.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {center.description}
                  </p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-subtle)]/70 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <dt className="font-medium text-[var(--text-primary)]">
                          Địa điểm
                        </dt>
                        <dd>{center.location}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock
                        className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <dt className="font-medium text-[var(--text-primary)]">
                          Giờ làm việc
                        </dt>
                        <dd>{center.openHours}</dd>
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-2 pt-1 border-t border-[var(--border-hairline)]">
                      <Phone
                        className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <dt className="sr-only">Liên hệ</dt>
                        <dd>{center.contactNote}</dd>
                      </div>
                    </div>
                  </dl>
                  <p className="text-xs text-[var(--text-muted)]">
                    {center.officialGuidance}
                  </p>
                  {center.bookingAvailable && (
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<CalendarPlus className="h-4 w-4" />}
                        onClick={() => handleSelectCenterForBooking(center.id)}
                      >
                        Đặt lịch hẹn minh họa
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Booking form & Private Appointments list */}
        <aside className="lg:col-span-5 space-y-5">
          <Card id="support-booking-form">
            <CardHeader>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" icon={<Lock className="h-3 w-3" />}>
                    Lưu riêng tư trên máy
                  </Badge>
                </div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Đặt lịch hẹn minh họa
                </h2>
                <CardDescription>
                  Mô phỏng đặt lịch với đơn vị tư vấn hoặc cố vấn học tập để
                  lưu nhắc nhở cá nhân.
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleBookSubmit} className="space-y-3.5" noValidate>
                <div>
                  <label
                    htmlFor="appt-center"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Đơn vị tiếp nhận
                  </label>
                  <select
                    id="appt-center"
                    value={centerId}
                    onChange={(e) => setCenterId(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  >
                    {bookableCenters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="appt-date"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Ngày hẹn
                    </label>
                    <input
                      id="appt-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="appt-slot"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Khung giờ
                    </label>
                    <select
                      id="appt-slot"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Hình thức gặp
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('in_person')}
                      aria-pressed={mode === 'in_person'}
                      className={`min-h-[44px] rounded-lg border px-3 text-sm font-medium cursor-pointer transition-colors ${
                        mode === 'in_person'
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      Gặp trực tiếp
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('online')}
                      aria-pressed={mode === 'online'}
                      className={`min-h-[44px] rounded-lg border px-3 text-sm font-medium cursor-pointer transition-colors ${
                        mode === 'online'
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      Trực tuyến
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="appt-topic"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Chủ đề cần trao đổi *
                  </label>
                  <input
                    id="appt-topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ví dụ: Hỏi cách lập kế hoạch ôn tập giữa kỳ"
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="appt-note"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Ghi chú chuẩn bị (tùy chọn)
                  </label>
                  <textarea
                    id="appt-note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Những câu hỏi bạn muốn mang theo..."
                    className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="text-sm font-medium text-[var(--status-danger)]"
                  >
                    {formError}
                  </p>
                )}

                <Button type="submit" className="w-full">
                  Xác nhận đặt lịch hẹn minh họa
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Upcoming private appointments */}
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Lịch hẹn riêng tư của bạn
                </h2>
                <CardDescription>
                  Chỉ hiển thị cho riêng bạn trên thiết bị này.
                </CardDescription>
              </div>
              <Badge variant="default" className="tabular-nums">
                {state.supportAppointments.length}
              </Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {state.supportAppointments.length === 0 ? (
                <EmptyState
                  icon={<CalendarCheck className="h-6 w-6" />}
                  title="Chưa có lịch hẹn nào"
                  description="Khi bạn đặt lịch hẹn minh họa ở biểu mẫu trên, lịch hẹn sẽ xuất hiện tại đây."
                />
              ) : (
                state.supportAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3.5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge
                        variant={
                          appt.status === 'scheduled'
                            ? 'primary'
                            : appt.status === 'completed'
                              ? 'success'
                              : 'default'
                        }
                      >
                        {appt.status === 'scheduled'
                          ? 'Đã đặt'
                          : appt.status === 'completed'
                            ? 'Đã hoàn thành'
                            : 'Đã hủy'}
                      </Badge>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        Riêng tư
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {appt.centerName}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                      {formatFullDateVi(appt.date)} • {appt.timeSlot} •{' '}
                      {appt.mode === 'in_person' ? 'Gặp trực tiếp' : 'Trực tuyến'}
                    </p>
                    <p className="text-sm text-[var(--text-primary)]">
                      {appt.topic}
                    </p>
                    {appt.note && (
                      <p className="text-xs text-[var(--text-secondary)]">
                        Ghi chú: {appt.note}
                      </p>
                    )}
                    {appt.status === 'scheduled' && (
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            cancelSupportAppointment(appt.id);
                            showToast('Đã hủy lịch hẹn minh họa', 'info');
                          }}
                        >
                          Hủy lịch hẹn
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </aside>
      </div>

      {/* Wellness & Adaptation Guides */}
      <section aria-labelledby="wellness-guides-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="wellness-guides-heading"
              className="text-lg font-semibold text-[var(--text-primary)]"
            >
              Bài viết cân bằng & thích nghi năm nhất
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Gợi ý thực tế giúp bạn vượt qua nhớ nhà, áp lực thi cử và giữ nhịp
              nghỉ ngơi lành mạnh.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc chủ đề bài viết">
            <button
              type="button"
              onClick={() => setGuideCategory('all')}
              className={`min-h-[44px] rounded-lg px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                guideCategory === 'all'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
              }`}
            >
              Tất cả
            </button>
            {(
              Object.keys(WELLNESS_GUIDE_CATEGORY_LABELS) as WellnessGuideCategory[]
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGuideCategory(cat)}
                className={`min-h-[44px] rounded-lg px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                  guideCategory === cat
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
                }`}
              >
                {WELLNESS_GUIDE_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => {
            const expanded = expandedGuideId === guide.id;
            return (
              <Card key={guide.id} className="flex flex-col">
                <CardHeader>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default" icon={<BookOpen className="h-3 w-3" />}>
                        {WELLNESS_GUIDE_CATEGORY_LABELS[guide.category]}
                      </Badge>
                      {guide.isSample && <SampleDataBadge label="Gợi ý minh họa" />}
                    </div>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.summary}</CardDescription>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3 flex-1 flex flex-col justify-between">
                  {expanded && (
                    <div className="space-y-3 pt-1 border-t border-[var(--border-hairline)]">
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                          Các bước thực hành gợi ý
                        </h4>
                        <ol className="list-decimal list-inside space-y-1.5 text-sm text-[var(--text-secondary)]">
                          {guide.practicalSteps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="rounded-lg bg-[var(--accent-primary-soft)]/60 p-3 text-xs text-[var(--text-primary)] leading-relaxed">
                        <strong className="font-semibold">
                          Khi nào nên tìm hỗ trợ:
                        </strong>{' '}
                        {guide.whenToSeekHelp}
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedGuideId(expanded ? null : guide.id)
                      }
                      rightIcon={
                        expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      }
                    >
                      {expanded ? 'Thu gọn hướng dẫn' : 'Xem bước thực hành'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
