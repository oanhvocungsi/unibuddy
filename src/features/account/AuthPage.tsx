import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LogIn,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';

type AuthMode = 'login' | 'register' | 'forgot';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPage() {
  const { signIn } = useAppStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('minhanh.demo@demo-uni.edu.vn');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setForgotSent(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSent(false);

    const cleanEmail = email.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: ten@uni.edu.vn).');
      return;
    }

    if (mode === 'forgot') {
      setForgotSent(true);
      showToast('Đã ghi nhận yêu cầu đặt lại mật khẩu mô phỏng', 'info');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Vui lòng nhập họ và tên sinh viên.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }

    signIn({
      name: mode === 'register' ? name.trim() : undefined,
      email: cleanEmail,
    });
    showToast(
      mode === 'register'
        ? 'Đã tạo hồ sơ cục bộ và đăng nhập UniBuddy'
        : 'Đăng nhập thành công',
      'success',
    );
    navigate(mode === 'register' ? '/huong-dan-bat-dau' : '/');
  };

  const handleQuickDemo = (providerLabel?: string) => {
    signIn({
      name: 'Nguyễn Minh Anh',
      email: 'minhanh.demo@demo-uni.edu.vn',
      role: 'student',
    });
    showToast(
      providerLabel
        ? `Đã đăng nhập nhanh qua ${providerLabel} (Mô phỏng cục bộ)`
        : 'Đang tiếp tục với tài khoản mẫu Nguyễn Minh Anh',
      'success',
    );
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="min-h-[44px] inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Quay về Hôm nay</span>
        </Link>
        <Badge variant="outline" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          Xác thực mô phỏng cục bộ
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left reassuring context */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white font-display font-bold text-lg">
              UB
            </span>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                UniBuddy
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Đồng hành cùng sinh viên năm nhất
              </p>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Quản lý thời khóa biểu, môn học, cẩm nang trường và sức khỏe tinh
            thần trong một không gian gọn gàng.
          </p>

          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">
              Lưu ý về chế độ mô phỏng cục bộ
            </p>
            <p className="leading-relaxed">
              Đây là phiên bản trình diễn chạy hoàn toàn trên trình duyệt
              (localStorage). Không có mật khẩu hay dữ liệu cá nhân nào được gửi
              tới máy chủ bên ngoài.
            </p>
          </div>
        </div>

        {/* Right auth card */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="w-full space-y-3">
              <div
                role="tablist"
                aria-label="Chế độ xác thực"
                className="grid grid-cols-3 gap-1.5 rounded-lg bg-[var(--bg-surface-subtle)] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => handleModeChange('login')}
                  className={`min-h-[44px] rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                    mode === 'login'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => handleModeChange('register')}
                  className={`min-h-[44px] rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                    mode === 'register'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Đăng ký
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'forgot'}
                  onClick={() => handleModeChange('forgot')}
                  className={`min-h-[44px] rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                    mode === 'forgot'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Quên mật khẩu
                </button>
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  {mode === 'login'
                    ? 'Đăng nhập phiên làm việc'
                    : mode === 'register'
                      ? 'Tạo tài khoản sinh viên mới'
                      : 'Khôi phục quyền truy cập'}
                </h2>
                <CardDescription>
                  Xác thực mô phỏng cục bộ trên thiết bị của bạn.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardBody className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Họ và tên *
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Minh Anh"
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Email sinh viên *
                </label>
                <div className="relative">
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ten@uni.edu.vn"
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Mật khẩu (tối thiểu 6 ký tự) *
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="text-sm font-medium text-[var(--status-danger)]"
                >
                  {error}
                </p>
              )}

              {forgotSent && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 rounded-lg border border-[var(--status-success)]/40 bg-[var(--status-success-soft)]/50 p-3 text-sm text-[var(--text-primary)]"
                >
                  <CheckCircle2 className="h-5 w-5 text-[var(--status-success)] shrink-0 mt-0.5" />
                  <p>
                    Vì đây là phiên bản mô phỏng cục bộ, không có email thật được
                    gửi đi. Bạn có thể tiếp tục ngay bằng tài khoản mẫu bên dưới.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                leftIcon={
                  mode === 'login' ? (
                    <LogIn className="h-4 w-4" />
                  ) : mode === 'register' ? (
                    <UserPlus className="h-4 w-4" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )
                }
              >
                {mode === 'login'
                  ? 'Đăng nhập cục bộ'
                  : mode === 'register'
                    ? 'Tạo tài khoản cục bộ'
                    : 'Gửi yêu cầu khôi phục (Mô phỏng)'}
              </Button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[var(--border-hairline)]" />
              <span className="shrink mx-3 text-xs text-[var(--text-muted)]">
                Hoặc dùng nhanh bản trình diễn
              </span>
              <div className="flex-grow border-t border-[var(--border-hairline)]" />
            </div>

            <div className="space-y-2.5">
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={() => handleQuickDemo()}
              >
                Tiếp tục với tài khoản mẫu Nguyễn Minh Anh
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickDemo('Google')}
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Google (Demo)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickDemo('Microsoft')}
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Microsoft (Demo)
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default AuthPage;
