import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Flag,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import {
  Badge,
  ErrorState,
  ForbiddenState,
  LoadingSkeleton,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import {
  AdminEventsAndLocationsTab,
  AdminHandbookTab,
  AdminModerationTab,
  AdminNotificationsTab,
} from './AdminContentTabs';

type AdminTabKey = 'notifications' | 'handbook' | 'events' | 'moderation';

const ADMIN_TABS: {
  key: AdminTabKey;
  label: string;
  icon: typeof Bell;
}[] = [
  { key: 'notifications', label: 'Đăng thông báo mẫu', icon: Bell },
  { key: 'handbook', label: 'Quản lý Cẩm nang', icon: BookOpen },
  { key: 'events', label: 'Quản lý Sự kiện & Địa điểm', icon: CalendarDays },
  { key: 'moderation', label: 'Kiểm duyệt & Nhật ký', icon: Flag },
];

export function AdminPage() {
  const { state, setSimulation } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('notifications');

  // Strict role guard: student MUST see ForbiddenState
  if (state.profile.role === 'student') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Khu vực Quản trị &amp; Biên tập
        </h1>
        <ForbiddenState
          title="Bạn không có quyền truy cập khu vực quản trị nội dung"
          description="Khu vực này chỉ dành cho vai trò Biên tập viên hoặc Quản trị viên. Bạn có thể quay về trang chủ hoặc đổi vai trò minh họa trong trang Tài khoản."
          onBackHome={() => navigate('/')}
        />
        <div className="text-center">
          <Link
            to="/tai-khoan"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
          >
            <UserCog className="h-4 w-4 text-[var(--accent-primary)]" />
            <span>Chuyển vai trò trong Tài khoản</span>
          </Link>
        </div>
      </div>
    );
  }

  if (
    state.simulation.loadingFeature === 'admin' ||
    state.simulation.loadingFeature === 'all'
  ) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Khu vực Quản trị & Biên tập
        </h1>
        <LoadingSkeleton rows={4} label="Đang tải công cụ quản trị..." />
      </div>
    );
  }

  if (state.simulation.networkError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Khu vực Quản trị & Biên tập
        </h1>
        <ErrorState onRetry={() => setSimulation({ networkError: false })} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="primary"
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
            >
              Vai trò:{' '}
              {state.profile.role === 'admin'
                ? 'Quản trị viên'
                : 'Biên tập viên'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Khu vực Quản trị & Biên tập
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Đăng thông báo mẫu, cập nhật cẩm nang, sự kiện khuôn viên và kiểm
            duyệt báo cáo cộng đồng.
          </p>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Công cụ quản trị nội dung"
        className="flex flex-wrap gap-2 border-b border-[var(--border-hairline)] pb-3"
      >
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] font-semibold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {activeTab === 'notifications' && <AdminNotificationsTab />}
        {activeTab === 'handbook' && <AdminHandbookTab />}
        {activeTab === 'events' && <AdminEventsAndLocationsTab />}
        {activeTab === 'moderation' && <AdminModerationTab />}
      </div>
    </div>
  );
}

export default AdminPage;
