import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Download,
  EyeOff,
  Globe,
  HardDrive,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  WifiOff,
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
  Modal,
  useToast,
} from '../../components/ui';
import { STORAGE_KEY, useAppStore } from '../../store/appStore';
import type {
  PrivacySettings,
  ThemeMode,
  UserGoal,
  UserRole,
} from '../../types/models';

const AVATAR_COLOR_KEY = 'unibuddy_v1_avatar_color';

const AVATAR_COLORS = [
  { id: 'cobalt', label: 'Xanh dương học thuật', hex: '#2B59C3' },
  { id: 'teal', label: 'Xanh ngọc dịu mắt', hex: '#0F766E' },
  { id: 'forest', label: 'Xanh lá tập trung', hex: '#15803D' },
  { id: 'amber', label: 'Vàng hổ phách', hex: '#B45309' },
  { id: 'slate', label: 'Xám than trầm tĩnh', hex: '#334155' },
];

const GOAL_LABELS: Record<UserGoal, string> = {
  academic_balance: 'Cân bằng học tập kỳ đầu',
  time_management: 'Quản lý thời gian & deadline',
  make_friends: 'Kết bạn & tham gia CLB',
  campus_navigation: 'Thuộc đường & tiện ích khuôn viên',
  budget_control: 'Kiểm soát chi tiêu sinh hoạt',
  mental_wellness: 'Giữ nhịp ngủ & sức khỏe tinh thần',
};

const PRIVACY_ITEMS: {
  key: keyof PrivacySettings;
  label: string;
  hint: string;
}[] = [
  {
    key: 'hideEmail',
    label: 'Ẩn email cá nhân',
    hint: 'Mặc định bật — thành viên khác không nhìn thấy email của bạn.',
  },
  {
    key: 'hidePhone',
    label: 'Ẩn số điện thoại',
    hint: 'Mặc định bật — không hiển thị số điện thoại trong hồ sơ công khai.',
  },
  {
    key: 'hideSchedule',
    label: 'Ẩn thời khóa biểu cá nhân',
    hint: 'Giữ riêng tư lịch học và các buổi tự học của bạn.',
  },
  {
    key: 'hideClass',
    label: 'Ẩn lớp sinh hoạt',
    hint: 'Không hiển thị mã lớp hành chính khi trao đổi trên Q&A.',
  },
  {
    key: 'hideCommunityActivity',
    label: 'Ẩn lịch sử hoạt động cộng đồng',
    hint: 'Ẩn danh sách nhóm và câu hỏi khỏi thẻ tóm tắt hồ sơ.',
  },
];

const ROLE_LABELS: Record<UserRole, { label: string; desc: string }> = {
  student: {
    label: 'Sinh viên (student)',
    desc: 'Quyền chuẩn của tân sinh viên, không vào được khu vực Quản trị.',
  },
  editor: {
    label: 'Biên tập viên (editor)',
    desc: 'Có quyền cập nhật Cẩm nang, Sự kiện, Địa điểm và xử lý báo cáo.',
  },
  admin: {
    label: 'Quản trị viên (admin)',
    desc: 'Toàn quyền quản lý nội dung mẫu, thông báo và kiểm duyệt.',
  },
};

export function AccountPage() {
  const {
    state,
    updateProfile,
    updatePrivacy,
    updateSettings,
    switchRole,
    setSimulation,
    exportStateJSON,
    importStateJSON,
    resetDemoData,
    deleteMoodCheckIn,
    deleteExpense,
    signOut,
  } = useAppStore();
  const { showToast } = useToast();

  // Profile draft
  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [phone, setPhone] = useState(state.profile.phone);
  const [schoolName, setSchoolName] = useState(state.profile.schoolName);
  const [faculty, setFaculty] = useState(state.profile.faculty);
  const [major, setMajor] = useState(state.profile.major);
  const [cohort, setCohort] = useState(state.profile.cohort);
  const [className, setClassName] = useState(state.profile.className);
  const [campus, setCampus] = useState(state.profile.campus);
  const [semester, setSemester] = useState(state.profile.semester);
  const [bio, setBio] = useState(state.profile.bio);
  const [goals, setGoals] = useState<UserGoal[]>(state.profile.goals);
  const [avatarColor, setAvatarColor] = useState<string>(() => {
    try {
      return (
        window.localStorage.getItem(AVATAR_COLOR_KEY) || AVATAR_COLORS[0].hex
      );
    } catch {
      return AVATAR_COLORS[0].hex;
    }
  });

  // Import JSON state
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteDataModalOpen, setDeleteDataModalOpen] = useState(false);

  if (
    state.simulation.loadingFeature === 'account' ||
    state.simulation.loadingFeature === 'all'
  ) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Tài khoản, Quyền riêng tư & Cài đặt
        </h1>
        <LoadingSkeleton rows={4} label="Đang tải cài đặt tài khoản..." />
      </div>
    );
  }

  if (state.simulation.networkError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Tài khoản, Quyền riêng tư & Cài đặt
        </h1>
        <ErrorState onRetry={() => setSimulation({ networkError: false })} />
      </div>
    );
  }

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || state.profile.name,
      email: email.trim(),
      phone: phone.trim(),
      schoolName: schoolName.trim(),
      faculty: faculty.trim(),
      major: major.trim(),
      cohort: cohort.trim(),
      className: className.trim(),
      campus: campus.trim(),
      semester: semester.trim(),
      bio: bio.trim(),
      goals,
    });
    showToast('Đã lưu thông tin hồ sơ cá nhân', 'success');
  };

  const handleAvatarColorChange = (hex: string) => {
    setAvatarColor(hex);
    try {
      window.localStorage.setItem(AVATAR_COLOR_KEY, hex);
    } catch {
      // ignore
    }
  };

  const toggleGoal = (goal: UserGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleDownloadBackup = () => {
    const json = exportStateJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `unibuddy-backup-${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống tệp sao lưu JSON', 'success');
  };

  const handleImportText = (rawText: string) => {
    setImportError('');
    if (!rawText.trim()) {
      setImportError('Vui lòng chọn tệp JSON hoặc dán nội dung JSON sao lưu.');
      return;
    }
    const result = importStateJSON(rawText);
    if (!result.ok) {
      setImportError(
        result.error ||
          'Không thể khôi phục tệp JSON. Vui lòng kiểm tra lại định dạng.',
      );
      return;
    }
    setJsonInput('');
    showToast('Đã khôi phục dữ liệu từ bản sao lưu JSON', 'success');
  };

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      handleImportText(content);
    };
    reader.onerror = () => {
      setImportError('Không thể đọc tệp đã chọn từ thiết bị.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemo = () => {
    resetDemoData();
    setResetModalOpen(false);
    showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu', 'info');
  };

  const handleDeletePersonalData = () => {
    for (const m of state.moodCheckIns) {
      deleteMoodCheckIn(m.id);
    }
    for (const exp of state.expenses) {
      deleteExpense(exp.id);
    }
    updateProfile({
      name: 'Sinh viên mới',
      studentCode: '',
      email: '',
      phone: '',
      bio: '',
      className: '',
      goals: [],
      freeSlots: [],
      interests: [],
      onboardingCompleted: false,
    });
    try {
      window.localStorage.removeItem(AVATAR_COLOR_KEY);
    } catch {
      // ignore
    }
    signOut();
    setDeleteDataModalOpen(false);
    showToast('Đã xóa dữ liệu cá nhân trên trình duyệt này', 'info');
  };

  const initials = (name || state.profile.name)
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Tài khoản, Quyền riêng tư & Cài đặt
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Chỉnh sửa hồ sơ, kiểm soát quyền riêng tư mặc định, trợ năng và sao
            lưu dữ liệu cục bộ.
          </p>
        </div>

        <Link
          to="/huong-dan-bat-dau"
          className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
        >
          <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
          <span>Mở lại hướng dẫn năm nhất</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left main column: Profile & Privacy */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white font-display font-bold text-lg"
                  style={{ backgroundColor: avatarColor }}
                  aria-hidden="true"
                >
                  {initials || 'UB'}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                    Hồ sơ sinh viên
                  </h2>
                  <CardDescription>
                    Thông tin cá nhân và mục tiêu học kỳ đầu của bạn.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <span className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                    Màu nhận diện ảnh đại diện
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_COLORS.map((c) => {
                      const active = avatarColor === c.hex;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleAvatarColorChange(c.hex)}
                          aria-label={`Chọn màu ${c.label}`}
                          aria-pressed={active}
                          className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border cursor-pointer transition-transform ${
                            active
                              ? 'border-[var(--text-primary)] scale-105'
                              : 'border-transparent opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {active && (
                            <Check className="h-4 w-4 text-white" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="prof-name"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Họ và tên
                    </label>
                    <input
                      id="prof-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-email"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="prof-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-phone"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Số điện thoại
                    </label>
                    <input
                      id="prof-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-class"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Lớp sinh hoạt
                    </label>
                    <input
                      id="prof-class"
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prof-school"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Trường học
                    </label>
                    <input
                      id="prof-school"
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-faculty"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Khoa / Viện
                    </label>
                    <input
                      id="prof-faculty"
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-major"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Ngành học
                    </label>
                    <input
                      id="prof-major"
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-cohort"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Khóa học
                    </label>
                    <input
                      id="prof-cohort"
                      type="text"
                      value={cohort}
                      onChange={(e) => setCohort(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-semester"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Học kỳ
                    </label>
                    <input
                      id="prof-semester"
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prof-campus"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Cơ sở học tập
                    </label>
                    <input
                      id="prof-campus"
                      type="text"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="prof-bio"
                      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                    >
                      Giới thiệu ngắn
                    </label>
                    <textarea
                      id="prof-bio"
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-[var(--text-primary)]">
                    Mục tiêu cá nhân
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(GOAL_LABELS) as UserGoal[]).map((key) => {
                      const active = goals.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleGoal(key)}
                          aria-pressed={active}
                          className={`min-h-[44px] flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-left text-xs sm:text-sm cursor-pointer ${
                            active
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-medium'
                              : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <span>{GOAL_LABELS[key]}</span>
                          {active && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button type="submit">Lưu thay đổi hồ sơ</Button>
              </form>
            </CardBody>
          </Card>

          {/* Privacy Defaults */}
          <Card>
            <CardHeader>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="primary" icon={<EyeOff className="h-3.5 w-3.5" />}>
                    Bảo vệ mặc định
                  </Badge>
                </div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Quyền riêng tư mặc định
                </h2>
                <CardDescription>
                  Email, số điện thoại, nhật ký cảm xúc và lịch hẹn hỗ trợ luôn
                  được thiết lập riêng tư mặc định.
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-2.5">
              {PRIVACY_ITEMS.map((item) => {
                const checked = state.profile.privacy[item.key];
                return (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3.5 cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="block text-sm font-medium text-[var(--text-primary)]">
                        {item.label}
                      </span>
                      <span className="block text-xs text-[var(--text-secondary)]">
                        {item.hint}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        updatePrivacy({ [item.key]: !checked });
                        showToast('Đã cập nhật tùy chọn quyền riêng tư', 'info');
                      }}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent-primary)] cursor-pointer"
                    />
                  </label>
                );
              })}
            </CardBody>
          </Card>
        </div>

        {/* Right rail: Appearance, Data & QA/Role tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Appearance & Accessibility */}
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Giao diện &amp; Trợ năng
                </h2>
                <CardDescription>
                  Tùy chỉnh chế độ sáng/tối, giảm chuyển động và giờ yên lặng.
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="space-y-2">
                <span className="block text-sm font-medium text-[var(--text-primary)]">
                  Chế độ hiển thị (Theme)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'light', label: 'Sáng', icon: Sun },
                      { key: 'dark', label: 'Tối', icon: Moon },
                      { key: 'system', label: 'Theo hệ thống', icon: Monitor },
                    ] as { key: ThemeMode; label: string; icon: typeof Sun }[]
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const active = state.settings.theme === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => updateSettings({ theme: opt.key })}
                        aria-pressed={active}
                        className={`min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium cursor-pointer ${
                          active
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="reduce-motion-select"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Giảm chuyển động (Reduce Motion)
                </label>
                <select
                  id="reduce-motion-select"
                  value={state.settings.reduceMotion}
                  onChange={(e) =>
                    updateSettings({
                      reduceMotion: e.target.value as
                        | 'system'
                        | 'reduce'
                        | 'normal',
                    })
                  }
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                >
                  <option value="system">Theo hệ thống</option>
                  <option value="reduce">Bật giảm chuyển động</option>
                  <option value="normal">Tắt (Chuyển động đầy đủ)</option>
                </select>
              </div>

              <div className="rounded-xl border border-[var(--border-hairline)] p-3.5 space-y-3">
                <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Bật Giờ yên lặng (Quiet Hours)
                  </span>
                  <input
                    type="checkbox"
                    checked={state.settings.quietHoursEnabled}
                    onChange={(e) =>
                      updateSettings({ quietHoursEnabled: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--accent-primary)]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="text-[var(--text-secondary)]">Bắt đầu</span>
                    <input
                      type="time"
                      value={state.settings.quietStart}
                      onChange={(e) =>
                        updateSettings({ quietStart: e.target.value })
                      }
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[var(--text-secondary)]">Kết thúc</span>
                    <input
                      type="time"
                      value={state.settings.quietEnd}
                      onChange={(e) =>
                        updateSettings({ quietEnd: e.target.value })
                      }
                      className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-surface-subtle)]/70 p-3 text-xs text-[var(--text-secondary)]">
                <Globe className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    Ngôn ngữ: Tiếng Việt (vi-VN)
                  </p>
                  <p>Múi giờ hiển thị: Asia/Ho_Chi_Minh (UTC+7)</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Personal Data & Security */}
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Dữ liệu cá nhân &amp; Bảo mật
                </h2>
                <CardDescription>
                  Sao lưu, khôi phục tệp JSON hoặc đặt lại dữ liệu trên máy.
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 text-xs text-[var(--text-secondary)] space-y-2">
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  <HardDrive className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span>
                    Phiên hiện tại:{' '}
                    {state.isAuthenticated
                      ? 'Đang đăng nhập cục bộ'
                      : 'Chưa đăng nhập'}
                  </span>
                </div>
                <p>
                  Dữ liệu lưu tại khóa <code>{STORAGE_KEY}</code> trên trình
                  duyệt này.
                </p>
                <div>
                  {state.isAuthenticated ? (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<LogOut className="h-4 w-4" />}
                      onClick={() => {
                        signOut();
                        showToast('Đã đăng xuất khỏi phiên cục bộ', 'info');
                      }}
                    >
                      Đăng xuất phiên cục bộ
                    </Button>
                  ) : (
                    <Link
                      to="/dang-nhap"
                      className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Đăng nhập</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleDownloadBackup}
                >
                  Tải xuống bản sao lưu (.json)
                </Button>

                <label className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>Chọn tệp JSON để khôi phục</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileImport}
                    className="sr-only"
                  />
                </label>

                <div className="space-y-1.5 pt-1">
                  <label
                    htmlFor="json-paste-input"
                    className="block text-xs font-medium text-[var(--text-secondary)]"
                  >
                    Hoặc dán chuỗi JSON sao lưu để khôi phục nhanh
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="json-paste-input"
                      type="text"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='{"version": 1, ...}'
                      className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleImportText(jsonInput)}
                    >
                      Khôi phục
                    </Button>
                  </div>
                </div>

                {importError && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-[var(--status-danger)]"
                  >
                    {importError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--border-hairline)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => setResetModalOpen(true)}
                >
                  Đặt lại dữ liệu mẫu
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setDeleteDataModalOpen(true)}
                >
                  Xóa dữ liệu cá nhân
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Role Switcher & QA Simulation Tools */}
          <Card>
            <CardHeader>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                    Công cụ Demo / QA
                  </Badge>
                </div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Vai trò &amp; Mô phỏng trạng thái
                </h2>
                <CardDescription>
                  Chuyển vai trò để kiểm thử quyền Quản trị hoặc xem thử trạng
                  thái lỗi/mạng.
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[var(--text-primary)]">
                  Vai trò hiện tại
                </span>
                <div className="space-y-2">
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => {
                    const active = state.profile.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          switchRole(role);
                          showToast(
                            `Đã chuyển sang vai trò ${ROLE_LABELS[role].label}`,
                            'info',
                          );
                        }}
                        aria-pressed={active}
                        className={`w-full min-h-[44px] flex items-start justify-between gap-2 rounded-lg border p-3 text-left cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
                        }`}
                      >
                        <div>
                          <span className="block text-sm font-semibold text-[var(--text-primary)]">
                            {ROLE_LABELS[role].label}
                          </span>
                          <span className="block text-xs text-[var(--text-secondary)]">
                            {ROLE_LABELS[role].desc}
                          </span>
                        </div>
                        {active && (
                          <Check className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <Link
                  to="/quan-tri"
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                >
                  <ShieldCheck className="h-4 w-4 text-[var(--accent-primary)]" />
                  <span>Mở trang Quản trị (/quan-tri)</span>
                </Link>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border-hairline)]">
                <span className="block text-xs font-semibold text-[var(--text-primary)]">
                  Xem thử trạng thái hệ thống
                </span>

                <label className="min-h-[44px] flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] px-3 py-1.5 text-xs sm:text-sm cursor-pointer">
                  <span className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-[var(--status-warning)]" />
                    Chế độ Ngoại tuyến (Offline)
                  </span>
                  <input
                    type="checkbox"
                    checked={state.simulation.isOffline}
                    onChange={(e) =>
                      setSimulation({ isOffline: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--accent-primary)]"
                  />
                </label>

                <label className="min-h-[44px] flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] px-3 py-1.5 text-xs sm:text-sm cursor-pointer">
                  <span>Lỗi kết nối (Network Error)</span>
                  <input
                    type="checkbox"
                    checked={state.simulation.networkError}
                    onChange={(e) =>
                      setSimulation({ networkError: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--accent-primary)]"
                  />
                </label>

                <label className="min-h-[44px] flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] px-3 py-1.5 text-xs sm:text-sm cursor-pointer">
                  <span>Phiên hết hạn (Session Expired)</span>
                  <input
                    type="checkbox"
                    checked={state.simulation.sessionExpired}
                    onChange={(e) =>
                      setSimulation({ sessionExpired: e.target.checked })
                    }
                    className="h-4 w-4 accent-[var(--accent-primary)]"
                  />
                </label>

                <div className="space-y-1">
                  <label
                    htmlFor="sim-loading-select"
                    className="block text-xs text-[var(--text-secondary)]"
                  >
                    Mô phỏng trạng thái đang tải (LoadingSkeleton)
                  </label>
                  <select
                    id="sim-loading-select"
                    value={state.simulation.loadingFeature ?? ''}
                    onChange={(e) =>
                      setSimulation({
                        loadingFeature: e.target.value || null,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs sm:text-sm"
                  >
                    <option value="">Tắt mô phỏng tải</option>
                    <option value="all">Toàn bộ trang</option>
                    <option value="dashboard">Trang Hôm nay</option>
                    <option value="schedule">Trang Lịch & Việc</option>
                    <option value="courses">Trang Môn học</option>
                    <option value="explore">Trang Khám phá</option>
                    <option value="support">Trang Hỗ trợ & Chi tiêu</option>
                    <option value="notifications">Trang Thông báo</option>
                    <option value="account">Trang Tài khoản</option>
                    <option value="admin">Trang Quản trị</option>
                  </select>
                </div>

                {(state.simulation.isOffline ||
                  state.simulation.networkError ||
                  state.simulation.sessionExpired ||
                  state.simulation.loadingFeature) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      setSimulation({
                        isOffline: false,
                        networkError: false,
                        sessionExpired: false,
                        loadingFeature: null,
                      })
                    }
                  >
                    Tắt mọi mô phỏng
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Confirm Reset Demo Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Đặt lại dữ liệu mẫu?"
        description="Toàn bộ ghi chú, chi tiêu, nhật ký cảm xúc và thay đổi của bạn sẽ trở về dữ liệu mẫu ban đầu."
        footer={
          <>
            <Button variant="outline" onClick={() => setResetModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleResetDemo}>
              Xác nhận đặt lại
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Bạn nên tải xuống bản sao lưu JSON trước nếu muốn giữ lại các dữ liệu
          đã tự nhập.
        </p>
      </Modal>

      {/* Confirm Delete Personal Data Modal */}
      <Modal
        isOpen={deleteDataModalOpen}
        onClose={() => setDeleteDataModalOpen(false)}
        title="Xóa toàn bộ dữ liệu cá nhân?"
        description="Hành động này sẽ xóa các bản ghi cảm xúc, thu chi đã nhập và thông tin cá nhân trên trình duyệt này."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteDataModalOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeletePersonalData}>
              Xóa dữ liệu cá nhân
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Dữ liệu cá nhân sẽ bị xóa khỏi phiên hiện tại và bạn sẽ được đăng
          xuất khỏi thiết bị này.
        </p>
      </Modal>
    </div>
  );
}

export default AccountPage;
