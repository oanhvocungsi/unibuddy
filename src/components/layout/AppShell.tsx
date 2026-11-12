import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CalendarClock,
  Compass,
  HeartHandshake,
  Home,
  Menu,
  Monitor,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  UserCog,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { ThemeMode } from '../../types/models';
import { cn } from '../../utils/cn';
import { isWithinQuietHours } from '../../utils/dateUtils';
import {
  OfflineBanner,
  SessionExpiredBanner,
} from '../ui/StateViews';
import { GlobalSearchModal } from './GlobalSearchModal';

interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: typeof Home;
  badgeCount?: number;
}

export function AppShell({ children }: { children: ReactNode }) {
  const {
    state,
    unreadNotificationCount,
    updateSettings,
    startFocusMode,
    stopFocusMode,
    setSimulation,
    signIn,
  } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const previousDrawerFocusRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Accessible mobile drawer: initial focus, Escape to close, Tab focus trap, restore focus
  useEffect(() => {
    if (!mobileMenuOpen) return;

    previousDrawerFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    drawerCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (event.key === 'Tab' && drawerPanelRef.current) {
        const focusables = Array.from(
          drawerPanelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
          if (active === first || !drawerPanelRef.current.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !drawerPanelRef.current.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      (previousDrawerFocusRef.current ?? menuTriggerRef.current)?.focus?.();
    };
  }, [mobileMenuOpen]);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Tick every 30s when focus mode is active
  useEffect(() => {
    if (!state.settings.focusModeUntil) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, [state.settings.focusModeUntil]);

  const focusRemainingMin = useMemo(() => {
    if (!state.settings.focusModeUntil) return 0;
    const diff = new Date(state.settings.focusModeUntil).getTime() - nowTick;
    return Math.max(0, Math.ceil(diff / 60000));
  }, [state.settings.focusModeUntil, nowTick]);

  useEffect(() => {
    if (state.settings.focusModeUntil && focusRemainingMin <= 0) {
      stopFocusMode();
    }
  }, [state.settings.focusModeUntil, focusRemainingMin, stopFocusMode]);

  const inQuietHours = useMemo(() => {
    if (!state.settings.quietHoursEnabled) return false;
    return isWithinQuietHours(
      new Date(),
      state.settings.quietStart,
      state.settings.quietEnd,
    );
  }, [
    state.settings.quietHoursEnabled,
    state.settings.quietStart,
    state.settings.quietEnd,
  ]);

  const canAccessAdmin =
    state.profile.role === 'admin' || state.profile.role === 'editor';

  const navItems: NavItem[] = [
    { to: '/', label: 'Hôm nay', shortLabel: 'Hôm nay', icon: Home },
    {
      to: '/lich',
      label: 'Lịch & Việc',
      shortLabel: 'Lịch',
      icon: CalendarClock,
    },
    {
      to: '/mon-hoc',
      label: 'Môn học',
      shortLabel: 'Môn học',
      icon: BookOpen,
    },
    {
      to: '/kham-pha',
      label: 'Khám phá',
      shortLabel: 'Khám phá',
      icon: Compass,
    },
    {
      to: '/ho-tro',
      label: 'Đời sống & Hỗ trợ',
      shortLabel: 'Hỗ trợ',
      icon: HeartHandshake,
    },
    {
      to: '/thong-bao',
      label: 'Thông báo',
      shortLabel: 'Thông báo',
      icon: Bell,
      badgeCount: unreadNotificationCount,
    },
    {
      to: '/tai-khoan',
      label: 'Tài khoản & Cài đặt',
      shortLabel: 'Tài khoản',
      icon: UserCog,
    },
  ];

  if (canAccessAdmin) {
    navItems.push({
      to: '/quan-tri',
      label: 'Quản trị',
      shortLabel: 'Quản trị',
      icon: ShieldCheck,
    });
  }

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(state.settings.theme);
    const next = order[(idx + 1) % order.length];
    updateSettings({ theme: next });
  };

  const renderThemeIcon = () => {
    if (state.settings.theme === 'dark') {
      return <Moon className="h-4 w-4" aria-hidden="true" />;
    }
    if (state.settings.theme === 'light') {
      return <Sun className="h-4 w-4" aria-hidden="true" />;
    }
    return <Monitor className="h-4 w-4" aria-hidden="true" />;
  };

  const themeLabel =
    state.settings.theme === 'dark'
      ? 'Giao diện tối'
      : state.settings.theme === 'light'
        ? 'Giao diện sáng'
        : 'Theo hệ thống';

  const mobilePrimaryTabs = navItems.slice(0, 5);

  const renderNavLinks = () => (
    <nav aria-label="Điều hướng chính" className="flex-1 space-y-1 px-3 py-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'min-h-[44px] flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]',
              )
            }
          >
            <span className="flex items-center gap-3 min-w-0">
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </span>
            {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
              <span className="inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full bg-[var(--accent-solid)] px-1.5 text-xs font-semibold text-white tabular-nums">
                {item.badgeCount > 99 ? '99+' : item.badgeCount}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <a href="#main-content" className="skip-link">
        Bỏ qua đến nội dung chính
      </a>

      {/* Desktop Left Navigation Rail */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--bg-surface)] border-r border-[var(--border-hairline)] z-30">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border-hairline)]">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-h-[44px] focus-visible:rounded-lg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-solid)] text-white font-display font-bold text-base">
              UB
            </span>
            <div>
              <span className="block font-display font-bold text-base text-[var(--text-primary)] leading-tight">
                UniBuddy
              </span>
              <span className="block text-xs text-[var(--text-muted)]">
                Đồng hành năm nhất
              </span>
            </div>
          </Link>
        </div>

        {renderNavLinks()}

        <div className="p-3 border-t border-[var(--border-hairline)] space-y-2">
          <Link
            to="/huong-dan-bat-dau"
            className="min-h-[44px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
          >
            <Sparkles
              className="h-4 w-4 text-[var(--accent-primary)] shrink-0"
              aria-hidden="true"
            />
            <span>Trợ lý thiết lập năm nhất</span>
          </Link>

          <Link
            to="/tai-khoan"
            className="flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/60 p-3 hover:border-[var(--border-strong)] transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold text-sm">
              {state.profile.name
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {state.profile.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {state.profile.cohort} • {state.profile.semester}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
        >
          <div
            className="fixed inset-0 bg-slate-950/55"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            ref={drawerPanelRef}
            className="relative z-10 w-72 max-w-[85vw] h-full bg-[var(--bg-surface)] border-r border-[var(--border-hairline)] flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-solid)] text-white font-display font-bold text-sm">
                  UB
                </span>
                <span className="font-display font-bold text-base text-[var(--text-primary)]">
                  UniBuddy
                </span>
              </div>
              <button
                ref={drawerCloseRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Đóng menu"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
            <div className="p-3 border-t border-[var(--border-hairline)] space-y-2">
              <Link
                to="/huong-dan-bat-dau"
                className="min-h-[44px] flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
              >
                <Sparkles
                  className="h-4 w-4 text-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                <span>Trợ lý thiết lập năm nhất</span>
              </Link>
              <Link
                to="/dang-nhap"
                className="min-h-[44px] flex items-center justify-center rounded-lg border border-[var(--border-hairline)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
              >
                {state.isAuthenticated ? 'Chuyển phiên đăng nhập' : 'Đăng nhập'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 pb-20 lg:pb-6">
        {/* Top Utility Header */}
        <header className="sticky top-0 z-20 h-16 bg-[var(--bg-surface)]/95 backdrop-blur-xs border-b border-[var(--border-hairline)] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu điều hướng"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer shrink-0"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Tìm kiếm nhanh (Ctrl+K)"
              className="min-h-[44px] flex-1 max-w-md flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/70 px-3 text-left text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Tìm môn học, phòng, sổ tay, CLB...
                </span>
              </span>
              <kbd className="hidden sm:inline-flex items-center rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {focusRemainingMin > 0 ? (
              <button
                type="button"
                onClick={stopFocusMode}
                title="Nhấn để tắt chế độ tập trung"
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] px-3 text-xs font-semibold tabular-nums cursor-pointer"
              >
                <Timer className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Tập trung:</span>
                <span>{focusRemainingMin}p</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startFocusMode(25)}
                title="Bật phiên tập trung 25 phút"
                className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <Timer className="h-4 w-4" aria-hidden="true" />
                <span>Tập trung 25p</span>
              </button>
            )}

            <button
              type="button"
              onClick={cycleTheme}
              aria-label={`Đổi giao diện (${themeLabel})`}
              title={themeLabel}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {renderThemeIcon()}
              <span className="hidden md:inline">{themeLabel}</span>
            </button>

            <Link
              to="/thong-bao"
              aria-label={`Thông báo (${unreadNotificationCount} chưa đọc)`}
              className="relative min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex min-w-[20px] h-[20px] items-center justify-center rounded-full bg-[var(--accent-solid)] px-1 text-[11px] font-bold text-white tabular-nums">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </Link>

            {!state.isAuthenticated && (
              <Link
                to="/dang-nhap"
                className="min-h-[44px] inline-flex items-center rounded-lg bg-[var(--accent-solid)] px-3 text-xs font-semibold text-white hover:bg-[var(--accent-solid-hover)]"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 focus:outline-none"
        >
          {/* Global resilient banners */}
          {state.simulation.isOffline && (
            <OfflineBanner
              onReconnect={() => setSimulation({ isOffline: false })}
            />
          )}

          {state.simulation.sessionExpired && (
            <SessionExpiredBanner
              onRelogin={() => {
                signIn();
                navigate(location.pathname + location.search);
              }}
            />
          )}

          {(focusRemainingMin > 0 || inQuietHours) && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--accent-primary-soft)]/60 px-4 py-2.5 text-xs sm:text-sm text-[var(--text-primary)]"
            >
              <span>
                {focusRemainingMin > 0
                  ? `Đang trong phiên tập trung (${focusRemainingMin} phút còn lại). Thông báo không khẩn cấp được tạm hoãn.`
                  : `Đang trong giờ yên lặng (${state.settings.quietStart} – ${state.settings.quietEnd}). Chỉ thông báo khẩn cấp mới làm phiền bạn.`}
              </span>
              {focusRemainingMin > 0 && (
                <button
                  type="button"
                  onClick={stopFocusMode}
                  className="min-h-[44px] inline-flex items-center px-2 font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  Kết thúc sớm
                </button>
              )}
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (5 primary items, >= 44px touch target) */}
      <nav
        aria-label="Thanh điều hướng nhanh trên di động"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-xs border-t border-[var(--border-hairline)] px-1 py-1 grid grid-cols-5"
      >
        {mobilePrimaryTabs.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/70 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate max-w-full">{item.shortLabel}</span>
            </NavLink>
          );
        })}
      </nav>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
