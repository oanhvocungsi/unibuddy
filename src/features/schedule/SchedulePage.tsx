import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, ListTodo, Timer } from 'lucide-react';
import {
  Badge,
  ErrorState,
  LoadingSkeleton,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { ScheduleEvent } from '../../types/models';
import { cn } from '../../utils/cn';
import type { ExpandedScheduleOccurrence } from '../../utils/dateUtils';
import { FocusPlannerSection } from './components/FocusPlannerSection';
import {
  EventDetailModal,
  EventFormModal,
  ICSImportModal,
} from './components/ScheduleModals';
import { TasksSection } from './components/TasksSection';
import { TimetableSection } from './components/TimetableSection';

type ScheduleTab = 'schedule' | 'tasks' | 'focus';

function normalizeTab(raw: string | null): ScheduleTab {
  if (raw === 'tasks' || raw === 'focus' || raw === 'schedule') return raw;
  return 'schedule';
}

export function SchedulePage() {
  const {
    state,
    addScheduleEvent,
    updateScheduleEvent,
    deleteScheduleEvent,
    importScheduleEvents,
    addTask,
    updateTask,
    toggleTaskStatus,
    archiveTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    startFocusMode,
    stopFocusMode,
    setSimulation,
  } = useAppStore();
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ScheduleTab>(() =>
    normalizeTab(searchParams.get('tab')),
  );

  const [selectedOccurrence, setSelectedOccurrence] =
    useState<ExpandedScheduleOccurrence | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [createDefaultDate, setCreateDefaultDate] = useState<
    string | undefined
  >(undefined);
  const [icsImportOpen, setIcsImportOpen] = useState(false);

  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab) {
      setActiveTab(normalizeTab(paramTab));
    }
  }, [searchParams]);

  const switchTab = (tab: ScheduleTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  if (
    state.simulation.loadingFeature === 'schedule' ||
    state.simulation.loadingFeature === 'all'
  ) {
    return (
      <section className="space-y-4" aria-label="Đang tải lịch và việc">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Lịch & Việc
        </h1>
        <LoadingSkeleton rows={4} label="Đang tải thời khóa biểu và công việc..." />
      </section>
    );
  }

  if (state.simulation.networkError) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Lịch & Việc
        </h1>
        <ErrorState
          onRetry={() => setSimulation({ networkError: false })}
          message="Không thể tải dữ liệu thời khóa biểu. Vui lòng thử lại sau."
        />
      </section>
    );
  }

  const pendingTaskCount = state.tasks.filter(
    (t) => t.status === 'todo',
  ).length;

  const handleSaveScheduleEvent = (
    payload: Omit<ScheduleEvent, 'id'>,
    editingId?: string,
  ) => {
    if (editingId) {
      updateScheduleEvent(editingId, payload);
      showToast(`Đã cập nhật "${payload.title}".`, 'success');
    } else {
      addScheduleEvent(payload);
      showToast(`Đã thêm "${payload.title}" vào thời khóa biểu.`, 'success');
    }
  };

  const tabs: Array<{
    id: ScheduleTab;
    label: string;
    icon: typeof CalendarClock;
    badge?: number;
  }> = [
    { id: 'schedule', label: 'Thời khóa biểu', icon: CalendarClock },
    {
      id: 'tasks',
      label: 'Nhắc việc & Hạn nộp',
      icon: ListTodo,
      badge: pendingTaskCount,
    },
    { id: 'focus', label: 'Lập kế hoạch & Tập trung', icon: Timer },
  ];

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Lịch & Việc
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
          Quản lý thời khóa biểu Ngày/Tuần/Tháng, phát hiện trùng giờ học, chia nhỏ hạn nộp và tập trung theo phiên Pomodoro.
        </p>
      </header>

      {/* Sub-tabs */}
      <div
        role="tablist"
        aria-label="Phân mục Lịch và Việc"
        className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-hairline)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => switchTab(tab.id)}
              className={cn(
                'min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer',
                isActive
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/45 font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]/60',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <Badge variant={isActive ? 'primary' : 'default'}>
                  {tab.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {activeTab === 'schedule' && (
        <div role="tabpanel" aria-label="Thời khóa biểu">
          <TimetableSection
            scheduleEvents={state.scheduleEvents}
            courses={state.courses}
            onOpenCreateEvent={(date) => {
              setEditingEvent(null);
              setCreateDefaultDate(date);
              setEventFormOpen(true);
            }}
            onSelectOccurrence={(occ) => setSelectedOccurrence(occ)}
            onOpenICSImport={() => setIcsImportOpen(true)}
          />
        </div>
      )}

      {activeTab === 'tasks' && (
        <div role="tabpanel" aria-label="Nhắc việc & Hạn nộp">
          <TasksSection
            tasks={state.tasks}
            courses={state.courses}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onToggleTaskStatus={toggleTaskStatus}
            onArchiveTask={archiveTask}
            onDeleteTask={deleteTask}
            onToggleSubtask={toggleSubtask}
            onAddSubtask={addSubtask}
            onDeleteSubtask={deleteSubtask}
          />
        </div>
      )}

      {activeTab === 'focus' && (
        <div role="tabpanel" aria-label="Lập kế hoạch & Tập trung">
          <FocusPlannerSection
            scheduleEvents={state.scheduleEvents}
            tasks={state.tasks}
            focusModeUntil={state.settings.focusModeUntil}
            onStartFocusMode={startFocusMode}
            onStopFocusMode={stopFocusMode}
            onToggleTaskStatus={toggleTaskStatus}
          />
        </div>
      )}

      {/* Modals */}
      <EventDetailModal
        occurrence={selectedOccurrence}
        courses={state.courses}
        onClose={() => setSelectedOccurrence(null)}
        onEdit={(event) => {
          setEditingEvent(event);
          setCreateDefaultDate(undefined);
          setEventFormOpen(true);
        }}
        onDelete={(id) => {
          deleteScheduleEvent(id);
          showToast('Đã xóa lịch khỏi thời khóa biểu.', 'info');
        }}
      />

      <EventFormModal
        isOpen={eventFormOpen}
        editingEvent={editingEvent}
        defaultDate={createDefaultDate}
        courses={state.courses}
        onClose={() => setEventFormOpen(false)}
        onSave={handleSaveScheduleEvent}
      />

      <ICSImportModal
        isOpen={icsImportOpen}
        onClose={() => setIcsImportOpen(false)}
        onImport={importScheduleEvents}
      />
    </section>
  );
}
