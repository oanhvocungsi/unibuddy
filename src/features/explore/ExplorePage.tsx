import { useMemo, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Compass, MapPin, MessageSquare, Users } from 'lucide-react';
import { ErrorState, LoadingSkeleton } from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { CampusMapView } from './CampusMapView';
import { ClubsEventsView, type ClubsEventsSubView } from './ClubsEventsView';
import { CommunityView, type CommunitySubTab } from './CommunityView';
import { HandbookView } from './HandbookView';

export type ExploreTab = 'handbook' | 'map' | 'clubs' | 'community';

interface TabConfig {
  id: ExploreTab;
  label: string;
  shortLabel: string;
  icon: typeof BookOpen;
}

const EXPLORE_TABS: TabConfig[] = [
  {
    id: 'handbook',
    label: 'Cẩm nang năm nhất',
    shortLabel: 'Cẩm nang',
    icon: BookOpen,
  },
  {
    id: 'map',
    label: 'Bản đồ & Tiện ích',
    shortLabel: 'Bản đồ',
    icon: MapPin,
  },
  {
    id: 'clubs',
    label: 'CLB & Sự kiện',
    shortLabel: 'CLB & Sự kiện',
    icon: Users,
  },
  {
    id: 'community',
    label: 'Hỏi đáp & Nhóm học',
    shortLabel: 'Cộng đồng',
    icon: MessageSquare,
  },
];

function resolveExploreTab(rawTab: string | null): {
  tab: ExploreTab;
  clubsSection: ClubsEventsSubView;
  communitySubTab: CommunitySubTab;
} {
  switch (rawTab) {
    case 'handbook':
      return { tab: 'handbook', clubsSection: 'all', communitySubTab: 'qa' };
    case 'map':
      return { tab: 'map', clubsSection: 'all', communitySubTab: 'qa' };
    case 'clubs':
      return { tab: 'clubs', clubsSection: 'all', communitySubTab: 'qa' };
    case 'events':
      return { tab: 'clubs', clubsSection: 'events', communitySubTab: 'qa' };
    case 'community':
      return { tab: 'community', clubsSection: 'all', communitySubTab: 'qa' };
    case 'groups':
      return { tab: 'community', clubsSection: 'all', communitySubTab: 'groups' };
    default:
      return { tab: 'handbook', clubsSection: 'all', communitySubTab: 'qa' };
  }
}

export function ExplorePage() {
  const { state, setSimulation } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const queryParam = searchParams.get('q') ?? '';
  const itemParam = searchParams.get('item');
  const articleParam = searchParams.get('article');
  const locationParam = searchParams.get('location');
  const eventParam = searchParams.get('event');
  const clubParam = searchParams.get('club');
  const questionParam = searchParams.get('question');
  const groupParam = searchParams.get('group');

  const resolved = useMemo(() => {
    const base = resolveExploreTab(rawTab);
    let clubsSection = base.clubsSection;
    if (base.tab === 'clubs') {
      if (eventParam) clubsSection = 'events';
      else if (clubParam) clubsSection = 'clubs';
    }
    let communitySubTab = base.communitySubTab;
    if (base.tab === 'community') {
      if (groupParam) communitySubTab = 'groups';
      else if (questionParam) communitySubTab = 'qa';
    }
    return {
      tab: base.tab,
      clubsSection,
      communitySubTab,
    };
  }, [rawTab, eventParam, clubParam, groupParam, questionParam]);

  const activeTab = resolved.tab;

  const handleSelectTab = (tabId: ExploreTab) => {
    const next = new URLSearchParams();
    next.set('tab', tabId);
    setSearchParams(next, { replace: false });
  };

  const handleTabKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = EXPLORE_TABS[(index + 1) % EXPLORE_TABS.length];
      handleSelectTab(next.id);
      window.requestAnimationFrame(() => {
        document.getElementById(`explore-tab-${next.id}`)?.focus();
      });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev =
        EXPLORE_TABS[(index - 1 + EXPLORE_TABS.length) % EXPLORE_TABS.length];
      handleSelectTab(prev.id);
      window.requestAnimationFrame(() => {
        document.getElementById(`explore-tab-${prev.id}`)?.focus();
      });
    }
  };

  const isLoading =
    state.simulation.loadingFeature === 'explore' ||
    state.simulation.loadingFeature === 'all';

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
            <Compass
              className="h-7 w-7 text-[var(--accent-primary)] shrink-0"
              aria-hidden="true"
            />
            <span>Khám phá & Cộng đồng</span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Sổ tay năm nhất, bản đồ khuôn viên, CLB – sự kiện và diễn đàn hỏi đáp cùng bạn học.
          </p>
        </div>
      </header>

      {/* Primary 4-Tab Bar */}
      <div
        role="tablist"
        aria-label="Các chuyên mục Khám phá"
        className="flex flex-wrap gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1.5"
      >
        {EXPLORE_TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`explore-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`explore-panel-${tab.id}`}
              onClick={() => handleSelectTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={cn(
                'min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap',
                isSelected
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Simulation States or Active Tab Panel */}
      {state.simulation.networkError ? (
        <ErrorState
          title="Không thể tải dữ liệu mục Khám phá"
          message="Đang bật chế độ mô phỏng lỗi mạng. Dữ liệu đã lưu cục bộ trên máy vẫn được bảo toàn."
          onRetry={() => setSimulation({ networkError: false })}
        />
      ) : isLoading ? (
        <LoadingSkeleton rows={4} label="Đang tải dữ liệu mục Khám phá..." />
      ) : (
        <div
          role="tabpanel"
          id={`explore-panel-${activeTab}`}
          aria-labelledby={`explore-tab-${activeTab}`}
        >
          {activeTab === 'handbook' && (
            <HandbookView
              initialArticleId={articleParam ?? itemParam}
              initialQuery={queryParam}
            />
          )}

          {activeTab === 'map' && (
            <CampusMapView
              initialLocationId={locationParam ?? itemParam}
              initialQuery={queryParam}
            />
          )}

          {activeTab === 'clubs' && (
            <ClubsEventsView
              initialSection={resolved.clubsSection}
              initialEventId={eventParam ?? (rawTab === 'events' ? itemParam : null)}
              initialClubId={clubParam ?? (rawTab === 'clubs' ? itemParam : null)}
              initialQuery={queryParam}
            />
          )}

          {activeTab === 'community' && (
            <CommunityView
              initialSubTab={resolved.communitySubTab}
              initialQuestionId={
                questionParam ?? (rawTab === 'community' ? itemParam : null)
              }
              initialGroupId={groupParam ?? (rawTab === 'groups' ? itemParam : null)}
              initialQuery={queryParam}
            />
          )}
        </div>
      )}
    </div>
  );
}
export default ExplorePage;
