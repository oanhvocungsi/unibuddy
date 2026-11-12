import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  HeartHandshake,
  Smile,
  Wallet,
} from 'lucide-react';
import { ErrorState, LoadingSkeleton } from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import { BudgetTab } from './BudgetTab';
import { ChecklistTab } from './ChecklistTab';
import { MoodTab } from './MoodTab';
import { SupportTab } from './SupportTab';

type SupportTabKey = 'support' | 'mood' | 'budget' | 'checklist';

const TABS: {
  key: SupportTabKey;
  label: string;
  icon: typeof HeartHandshake;
}[] = [
  { key: 'support', label: 'Hỗ trợ & Liên hệ', icon: HeartHandshake },
  { key: 'mood', label: 'Check-in cảm xúc', icon: Smile },
  { key: 'budget', label: 'Chi tiêu & Ngân sách', icon: Wallet },
  { key: 'checklist', label: 'Checklist đời sống', icon: CheckSquare },
];

function normalizeTab(param: string | null): SupportTabKey {
  if (
    param === 'support' ||
    param === 'mood' ||
    param === 'budget' ||
    param === 'checklist'
  ) {
    return param;
  }
  return 'support';
}

export function SupportAndLifePage() {
  const { state, setSimulation } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = normalizeTab(searchParams.get('tab'));

  const handleSelectTab = (tab: SupportTabKey) => {
    setSearchParams({ tab }, { replace: true });
  };

  if (
    state.simulation.loadingFeature === 'support' ||
    state.simulation.loadingFeature === 'all'
  ) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Đời sống, Chi tiêu & Hỗ trợ tâm lý
        </h1>
        <LoadingSkeleton
          rows={4}
          label="Đang tải dữ liệu hỗ trợ và đời sống..."
        />
      </div>
    );
  }

  if (state.simulation.networkError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Đời sống, Chi tiêu & Hỗ trợ tâm lý
        </h1>
        <ErrorState
          onRetry={() => setSimulation({ networkError: false })}
          message="Không thể đồng bộ thông tin hỗ trợ lúc này. Dữ liệu riêng tư và chi tiêu đã lưu trên máy vẫn được bảo toàn."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Đời sống, Chi tiêu & Hỗ trợ tâm lý
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
          Không gian an toàn để tìm đầu mối hỗ trợ ở trường, ghi nhận cảm xúc
          riêng tư, theo dõi thu chi tháng và chuẩn bị hành trang năm nhất.
        </p>
      </header>

      {/* Accessible tab bar */}
      <div
        role="tablist"
        aria-label="Các mục Đời sống và Hỗ trợ"
        className="flex flex-wrap gap-2 border-b border-[var(--border-hairline)] pb-3"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`support-tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`support-panel-${tab.key}`}
              onClick={() => handleSelectTab(tab.key)}
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

      <div
        role="tabpanel"
        id={`support-panel-${activeTab}`}
        aria-labelledby={`support-tab-${activeTab}`}
      >
        {activeTab === 'support' && <SupportTab />}
        {activeTab === 'mood' && <MoodTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'checklist' && <ChecklistTab />}
      </div>
    </div>
  );
}

export default SupportAndLifePage;
