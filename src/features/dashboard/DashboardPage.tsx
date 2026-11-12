import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { DashboardWidgetId } from '../../types/models';
import {
  addDays,
  formatFullDateVi,
  todayKey,
} from '../../utils/dateUtils';
import {
  DashboardCustomizer,
  DEFAULT_DASHBOARD_WIDGETS,
  WIDGET_CATALOG,
} from './components/DashboardCustomizer';
import { DeadlinesAndTodoWidget } from './components/DeadlinesAndTodoWidget';
import {
  CampusShortcutsWidget,
  CoursesOverviewWidget,
  PersonalSuggestionsWidget,
  SchoolAnnouncementsCard,
  WeeklyProgressWidget,
  WellnessBudgetWidget,
} from './components/RightRailWidgets';
import { TodayTimelineWidget } from './components/TodayTimelineWidget';

export function DashboardPage() {
  const {
    state,
    toggleTaskStatus,
    addTask,
    updateTask,
    toggleDashboardWidget,
    updateSettings,
    startFocusMode,
    stopFocusMode,
    setSimulation,
  } = useAppStore();

  const [isCustomizing, setIsCustomizing] = useState(false);

  const today = todayKey();
  const formattedDate = formatFullDateVi(today);
  const activeWidgets = state.settings.dashboardWidgets;

  const isFocusActive = Boolean(
    state.settings.focusModeUntil &&
      new Date(state.settings.focusModeUntil).getTime() > Date.now(),
  );

  if (
    state.simulation.loadingFeature === 'dashboard' ||
    state.simulation.loadingFeature === 'today' ||
    state.simulation.loadingFeature === 'all'
  ) {
    return (
      <section className="space-y-4" aria-label="Đang tải bảng tổng quan">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Hôm nay
        </h1>
        <LoadingSkeleton rows={4} label="Đang tải lịch học và việc hôm nay..." />
      </section>
    );
  }

  if (state.simulation.networkError) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Hôm nay
        </h1>
        <ErrorState
          onRetry={() => setSimulation({ networkError: false })}
          message="Không thể đồng bộ dữ liệu bảng tổng quan. Dữ liệu đã lưu cục bộ trên máy vẫn an toàn."
        />
      </section>
    );
  }

  const mainWidgetIds = activeWidgets.filter(
    (id) => WIDGET_CATALOG[id]?.zone === 'main',
  );
  const railWidgetIds = activeWidgets.filter(
    (id) => WIDGET_CATALOG[id]?.zone === 'rail',
  );

  const renderWidget = (id: DashboardWidgetId): ReactNode => {
    switch (id) {
      case 'today_timeline':
        return (
          <TodayTimelineWidget
            key={id}
            scheduleEvents={state.scheduleEvents}
            courses={state.courses}
          />
        );
      case 'upcoming_deadlines':
        return (
          <DeadlinesAndTodoWidget
            key={id}
            tasks={state.tasks}
            courses={state.courses}
            onToggleTask={toggleTaskStatus}
            onAddTask={addTask}
            onPostponeTask={(task) =>
              updateTask(task.id, { dueDate: addDays(task.dueDate, 1) })
            }
          />
        );
      case 'courses_overview':
        return <CoursesOverviewWidget key={id} state={state} />;
      case 'weekly_progress':
        return <WeeklyProgressWidget key={id} state={state} />;
      case 'quick_actions':
        return (
          <PersonalSuggestionsWidget
            key={id}
            state={state}
            onStartFocus={startFocusMode}
            onStopFocus={stopFocusMode}
          />
        );
      case 'campus_shortcuts':
        return <CampusShortcutsWidget key={id} />;
      case 'wellness_budget':
        return <WellnessBudgetWidget key={id} state={state} />;
    }
  };

  return (
    <section className="space-y-5">
      {/* Greeting Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--accent-primary)]">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>{formattedDate}</span>
            </span>
            <span aria-hidden="true">•</span>
            <span>{state.profile.semester}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Hôm nay
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Chào <span className="font-semibold text-[var(--text-primary)]">{state.profile.name}</span> — hôm nay mình cần làm gì?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant={isCustomizing ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            aria-expanded={isCustomizing}
            onClick={() => setIsCustomizing((prev) => !prev)}
          >
            Tùy chỉnh bảng tổng quan
          </Button>
        </div>
      </header>

      {/* Onboarding prompt if incomplete */}
      {!state.profile.onboardingCompleted && (
        <div
          role="region"
          aria-label="Gợi ý thiết lập hồ sơ năm nhất"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--accent-primary)]/35 bg-[var(--accent-primary-soft)]/70 px-4 py-3.5"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Hoàn tất thiết lập nhanh cho sinh viên năm nhất
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Chọn mục tiêu học kỳ, khung giờ rảnh và sở thích CLB để UniBuddy gợi ý sát nhu cầu của bạn hơn.
              </p>
            </div>
          </div>
          <Link
            to="/huong-dan-bat-dau"
            className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-primary-hover)] shrink-0"
          >
            Thiết lập ngay
          </Link>
        </div>
      )}

      {/* Desktop / Responsive Widget Customizer */}
      {isCustomizing && (
        <DashboardCustomizer
          activeWidgets={activeWidgets}
          onToggleWidget={toggleDashboardWidget}
          onUpdateOrder={(nextWidgets) =>
            updateSettings({ dashboardWidgets: nextWidgets })
          }
          onClose={() => setIsCustomizing(false)}
        />
      )}

      {activeWidgets.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-6 w-6" aria-hidden="true" />}
          title="Bạn đang ẩn toàn bộ khối thông tin"
          description="Nhấn nút bên dưới để khôi phục các khối mặc định cho trang Hôm nay."
          actionLabel="Khôi phục bố cục mặc định"
          onAction={() =>
            updateSettings({ dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS })
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Primary Focus Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            <h2 className="sr-only">Nội dung chính hôm nay</h2>
            {mainWidgetIds.map((id) => renderWidget(id))}
          </div>

          {/* Supportive Right Rail */}
          <aside
            aria-label="Thông tin tổng hợp và lối tắt"
            className="lg:col-span-5 xl:col-span-4 space-y-5"
          >
            <h2 className="sr-only">Thông báo, tiến độ và lối tắt</h2>
            <SchoolAnnouncementsCard
              notifications={state.notifications}
              isFocusActive={isFocusActive}
            />
            {railWidgetIds.map((id) => renderWidget(id))}
          </aside>
        </div>
      )}
    </section>
  );
}
