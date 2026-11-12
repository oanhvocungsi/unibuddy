import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  Compass,
  HeartHandshake,
  Plus,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  ErrorState,
  LoadingSkeleton,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type {
  NotificationCategory,
  NotificationPreferences,
  UserGoal,
} from '../../types/models';

const STEP_TITLES = [
  'Thông tin trường & ngành',
  'Môn học & Lịch rảnh',
  'Sở thích & CLB',
  'Thông báo & Hướng dẫn nhanh',
];

const GOAL_LABELS: Record<UserGoal, string> = {
  academic_balance: 'Cân bằng học tập kỳ đầu',
  time_management: 'Quản lý thời gian & deadline',
  make_friends: 'Kết bạn & tham gia CLB',
  campus_navigation: 'Thuộc đường & tiện ích khuôn viên',
  budget_control: 'Kiểm soát chi tiêu sinh hoạt',
  mental_wellness: 'Giữ nhịp ngủ & sức khỏe tinh thần',
};

const FREE_SLOT_PRESETS = [
  'Thứ 2 (14:00–17:00)',
  'Thứ 3 (14:00–17:00)',
  'Thứ 4 (15:00–17:30)',
  'Thứ 5 (15:00–17:30)',
  'Thứ 6 (13:30–16:30)',
  'Thứ 7 (08:30–11:30)',
  'Chủ nhật (Sáng)',
];

const INTEREST_PRESETS = [
  'Lập trình web',
  'Giải thuật cơ bản',
  'Tiếng Anh giao tiếp',
  'Cầu lông',
  'Bóng đá / Thể thao',
  'Tình nguyện',
  'Kỹ năng thuyết trình',
  'Âm nhạc & Truyền thông',
  'Thiết kế đồ họa',
  'Nghiên cứu khoa học',
];

const NOTIFICATION_LABELS: Record<NotificationCategory, string> = {
  schedule: 'Nhắc lịch học & thay đổi phòng',
  deadline: 'Cảnh báo hạn nộp & trùng deadline',
  academic: 'Gợi ý ôn tập & tài liệu môn học',
  group: 'Lịch hẹn nhóm học tập',
  event: 'Sự kiện khuôn viên & CLB',
};

export function OnboardingPage() {
  const {
    state,
    completeOnboarding,
    addCourse,
    updateNotificationPrefs,
    updateSettings,
    setSimulation,
  } = useAppStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState(state.profile.name);
  const [schoolName, setSchoolName] = useState(state.profile.schoolName);
  const [faculty, setFaculty] = useState(state.profile.faculty);
  const [major, setMajor] = useState(state.profile.major);
  const [cohort, setCohort] = useState(state.profile.cohort);
  const [semester, setSemester] = useState(state.profile.semester);
  const [campus, setCampus] = useState(state.profile.campus);
  const [goals, setGoals] = useState<UserGoal[]>(state.profile.goals);

  // Step 2
  const [freeSlots, setFreeSlots] = useState<string[]>(state.profile.freeSlots);
  const [customSlot, setCustomSlot] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('3');

  // Step 3
  const [interests, setInterests] = useState<string[]>(state.profile.interests);
  const [customInterest, setCustomInterest] = useState('');

  // Step 4
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(
    state.settings.notifications,
  );
  const [quietEnabled, setQuietEnabled] = useState(
    state.settings.quietHoursEnabled,
  );
  const [quietStart, setQuietStart] = useState(state.settings.quietStart);
  const [quietEnd, setQuietEnd] = useState(state.settings.quietEnd);

  if (
    state.simulation.loadingFeature === 'onboarding' ||
    state.simulation.loadingFeature === 'all'
  ) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Thiết lập nhanh cho sinh viên năm nhất
        </h1>
        <LoadingSkeleton rows={3} label="Đang tải trợ lý thiết lập..." />
      </div>
    );
  }

  if (state.simulation.networkError) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Thiết lập nhanh cho sinh viên năm nhất
        </h1>
        <ErrorState onRetry={() => setSimulation({ networkError: false })} />
      </div>
    );
  }

  const handleSkip = () => {
    completeOnboarding({});
    showToast(
      'Đã bỏ qua thiết lập nhanh — bạn có thể chỉnh lại trong Tài khoản bất cứ lúc nào.',
      'info',
    );
    navigate('/');
  };

  const handleFinish = () => {
    completeOnboarding({
      name: name.trim() || state.profile.name,
      schoolName: schoolName.trim() || state.profile.schoolName,
      faculty: faculty.trim() || state.profile.faculty,
      major: major.trim() || state.profile.major,
      cohort: cohort.trim() || state.profile.cohort,
      semester: semester.trim() || state.profile.semester,
      campus: campus.trim() || state.profile.campus,
      goals,
      freeSlots,
      interests,
    });
    updateNotificationPrefs(notifPrefs);
    updateSettings({
      quietHoursEnabled: quietEnabled,
      quietStart,
      quietEnd,
    });
    showToast('Chào mừng bạn đến với UniBuddy! Thiết lập đã sẵn sàng.', 'success');
    navigate('/');
  };

  const toggleGoal = (goal: UserGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const toggleSlot = (slot: string) => {
    setFreeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  const handleAddCustomSlot = () => {
    const clean = customSlot.trim();
    if (!clean) return;
    if (!freeSlots.includes(clean)) {
      setFreeSlots((prev) => [...prev, clean]);
    }
    setCustomSlot('');
  };

  const handleQuickAddCourse = () => {
    if (!newCourseCode.trim() || !newCourseName.trim()) {
      showToast('Vui lòng nhập cả mã môn và tên môn học', 'warning');
      return;
    }
    addCourse({
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      credits: Math.max(1, Number(newCourseCredits) || 3),
      instructor: 'Chưa cập nhật',
      room: 'Cập nhật sau',
      scheduleSummary: 'Tự thêm trong thiết lập',
      color: '#2B59C3',
      progressPercent: 0,
      semester: semester || state.profile.semester,
    });
    setNewCourseCode('');
    setNewCourseName('');
    showToast('Đã thêm môn học vào danh sách của bạn', 'success');
  };

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleAddCustomInterest = () => {
    const clean = customInterest.trim();
    if (!clean) return;
    if (!interests.includes(clean)) {
      setInterests((prev) => [...prev, clean]);
    }
    setCustomInterest('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Bước {step} / 4
            </Badge>
            <span className="text-xs text-[var(--text-muted)]">
              Có thể thay đổi lại sau
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Thiết lập nhanh cho sinh viên năm nhất
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Cá nhân hóa UniBuddy theo trường, lịch rảnh và sở thích của bạn
            trong khoảng 1 phút.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSkip}
          rightIcon={<SkipForward className="h-4 w-4" />}
        >
          Bỏ qua
        </Button>
      </header>

      {/* Progress Stepper */}
      <nav aria-label="Các bước thiết lập" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEP_TITLES.map((title, idx) => {
          const num = idx + 1;
          const isCurrent = step === num;
          const isDone = step > num;
          return (
            <button
              key={title}
              type="button"
              onClick={() => setStep(num)}
              aria-current={isCurrent ? 'step' : undefined}
              className={`min-h-[48px] flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium cursor-pointer transition-colors ${
                isCurrent
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold'
                  : isDone
                    ? 'border-[var(--status-success)]/40 bg-[var(--status-success-soft)]/40 text-[var(--text-primary)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                  isCurrent
                    ? 'bg-[var(--accent-primary)] text-white'
                    : isDone
                      ? 'bg-[var(--status-success)] text-white'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : num}
              </span>
              <span className="line-clamp-2">{title}</span>
            </button>
          );
        })}
      </nav>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              Bước {step}: {STEP_TITLES[step - 1]}
            </h2>
            <CardDescription>
              {step === 1 &&
                'Thông tin giúp gợi ý cẩm nang, môn học và mục tiêu phù hợp học kỳ đầu.'}
              {step === 2 &&
                'Kiểm tra các môn học hiện tại và đánh dấu khung giờ rảnh để xếp lịch ôn tập.'}
              {step === 3 &&
                'Chọn lĩnh vực bạn quan tâm để UniBuddy gợi ý CLB và sự kiện phù hợp.'}
              {step === 4 &&
                'Chọn thông báo bạn muốn nhận và xem nhanh 4 khu vực chính của UniBuddy.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardBody className="space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="ob-name"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="ob-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ob-cohort"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Khóa / Năm học
                  </label>
                  <input
                    id="ob-cohort"
                    type="text"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="ob-school"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Trường đại học / Cao đẳng
                  </label>
                  <input
                    id="ob-school"
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ob-faculty"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Khoa / Viện
                  </label>
                  <input
                    id="ob-faculty"
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ob-major"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Ngành học
                  </label>
                  <input
                    id="ob-major"
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ob-semester"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Học kỳ hiện tại
                  </label>
                  <input
                    id="ob-semester"
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ob-campus"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Cơ sở học
                  </label>
                  <input
                    id="ob-campus"
                    type="text"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="block text-sm font-medium text-[var(--text-primary)]">
                  Mục tiêu ưu tiên của bạn trong học kỳ này
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(GOAL_LABELS) as UserGoal[]).map((goalKey) => {
                    const active = goals.includes(goalKey);
                    return (
                      <button
                        key={goalKey}
                        type="button"
                        onClick={() => toggleGoal(goalKey)}
                        aria-pressed={active}
                        className={`min-h-[44px] flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-medium'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span>{GOAL_LABELS[goalKey]}</span>
                        {active && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Các môn học đang có ({state.courses.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.courses.map((course) => (
                    <Badge key={course.id} variant="default">
                      {course.code} — {course.name}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3.5 space-y-2.5 mt-2">
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    Thêm nhanh một môn học mới (tùy chọn)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      placeholder="Mã môn (VD: PH1110)"
                      aria-label="Mã môn học mới"
                      className="sm:col-span-3 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="Tên môn học"
                      aria-label="Tên môn học mới"
                      className="sm:col-span-5 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newCourseCredits}
                      onChange={(e) => setNewCourseCredits(e.target.value)}
                      aria-label="Số tín chỉ"
                      className="sm:col-span-2 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm tabular-nums"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="sm:col-span-2"
                      onClick={handleQuickAddCourse}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Thêm
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Khung giờ rảnh trong tuần (để tự học / họp nhóm / CLB)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set([...FREE_SLOT_PRESETS, ...freeSlots]),
                  ).map((slot) => {
                    const active = freeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        aria-pressed={active}
                        className={`min-h-[44px] rounded-lg border px-3 py-1.5 text-xs sm:text-sm cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-medium'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSlot}
                    onChange={(e) => setCustomSlot(e.target.value)}
                    placeholder="Thêm khung giờ rảnh khác (VD: Thứ 6 19:00–21:00)"
                    aria-label="Thêm khung giờ rảnh khác"
                    className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomSlot}
                  >
                    Thêm giờ rảnh
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Chọn ít nhất 1–3 sở thích để mục{' '}
                <strong className="text-[var(--text-primary)]">
                  Khám phá CLB & Sự kiện
                </strong>{' '}
                ưu tiên gợi ý phù hợp cho bạn.
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...INTEREST_PRESETS, ...interests])).map(
                  (item) => {
                    const active = interests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        aria-pressed={active}
                        className={`min-h-[44px] rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                          active
                            ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                            : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  },
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Sở thích khác (VD: Nhiếp ảnh, Cờ vua)..."
                  aria-label="Thêm sở thích khác"
                  className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomInterest}
                >
                  Thêm sở thích
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[var(--accent-primary)]" />
                  Chọn loại thông báo bạn muốn nhận
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    Object.keys(NOTIFICATION_LABELS) as NotificationCategory[]
                  ).map((cat) => (
                    <label
                      key={cat}
                      className="min-h-[44px] flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 px-3 py-2 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm text-[var(--text-primary)]">
                        {NOTIFICATION_LABELS[cat]}
                      </span>
                      <input
                        type="checkbox"
                        checked={notifPrefs[cat]}
                        onChange={() =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            [cat]: !prev[cat],
                          }))
                        }
                        className="h-4 w-4 accent-[var(--accent-primary)]"
                      />
                    </label>
                  ))}
                </div>

                <div className="rounded-xl border border-[var(--border-hairline)] p-3.5 space-y-2.5 mt-2">
                  <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Bật Giờ yên lặng buổi tối
                    </span>
                    <input
                      type="checkbox"
                      checked={quietEnabled}
                      onChange={(e) => setQuietEnabled(e.target.checked)}
                      className="h-4 w-4 accent-[var(--accent-primary)]"
                    />
                  </label>
                  {quietEnabled && (
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                      <label className="flex items-center gap-2">
                        <span>Từ</span>
                        <input
                          type="time"
                          value={quietStart}
                          onChange={(e) => setQuietStart(e.target.value)}
                          className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2"
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        <span>Đến</span>
                        <input
                          type="time"
                          value={quietEnd}
                          onChange={(e) => setQuietEnd(e.target.value)}
                          className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Hướng dẫn sử dụng nhanh UniBuddy
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg border border-[var(--border-hairline)] p-3 flex items-start gap-2.5">
                    <CalendarClock className="h-5 w-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        Hôm nay & Lịch học
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        Xem lịch theo ngày/tuần, cảnh báo trùng deadline và nhập
                        xuất tệp .ics.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border-hairline)] p-3 flex items-start gap-2.5">
                    <BookOpen className="h-5 w-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        Môn học & Flashcard
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        Lưu ghi chú theo buổi, checklist ôn thi và lật thẻ ghi
                        nhớ.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border-hairline)] p-3 flex items-start gap-2.5">
                    <Compass className="h-5 w-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        Khám phá & Bản đồ
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        Tra cứu cẩm nang tân sinh viên, tìm phòng trên bản đồ 2D
                        và hỏi đáp.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border-hairline)] p-3 flex items-start gap-2.5">
                    <HeartHandshake className="h-5 w-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        Hỗ trợ & Chi tiêu
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        Check-in cảm xúc riêng tư trên máy, đặt lịch hỗ trợ và
                        theo dõi ngân sách.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-hairline)]">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                >
                  Quay lại
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={handleSkip}>
                Bỏ qua bước này
              </Button>
            </div>

            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => setStep((s) => Math.min(4, s + 1))}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                type="button"
                variant="success"
                leftIcon={<Check className="h-4 w-4" />}
                onClick={handleFinish}
              >
                Hoàn tất thiết lập
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default OnboardingPage;
