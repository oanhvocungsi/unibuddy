import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardTitle } from '../../../components/ui';
import type { DashboardWidgetId } from '../../../types/models';
import { cn } from '../../../utils/cn';

export const WIDGET_CATALOG: Record<
  DashboardWidgetId,
  {
    label: string;
    description: string;
    zone: 'main' | 'rail';
  }
> = {
  today_timeline: {
    label: 'Lịch hôm nay',
    description: 'Ca học, lịch thi và sự kiện diễn ra trong ngày',
    zone: 'main',
  },
  upcoming_deadlines: {
    label: 'Việc sắp đến hạn & Việc cần làm',
    description: 'Cảnh báo trùng hạn nộp, thêm nhanh và dời hạn +1 ngày',
    zone: 'main',
  },
  courses_overview: {
    label: 'Môn học học kỳ này',
    description: 'Tiến độ học phần, phòng học và lối tắt vào từng môn',
    zone: 'main',
  },
  weekly_progress: {
    label: 'Tiến độ tuần',
    description: 'Số buổi học tuần này, nhiệm vụ đã xong và việc quá hạn',
    zone: 'rail',
  },
  quick_actions: {
    label: 'Gợi ý cá nhân & Tập trung',
    description: 'Gợi ý theo sở thích, khoảng trống hôm nay và Focus Mode 25p',
    zone: 'rail',
  },
  campus_shortcuts: {
    label: 'Lối tắt quan trọng',
    description: 'Tìm phòng, Thời khóa biểu, Cẩm nang quy chế, Hỗ trợ sinh viên',
    zone: 'rail',
  },
  wellness_budget: {
    label: 'Chi tiêu & Nhịp sống',
    description: 'Tóm tắt chi tiêu tháng và trạng thái cảm xúc riêng tư',
    zone: 'rail',
  },
};

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetId[] = [
  'today_timeline',
  'upcoming_deadlines',
  'weekly_progress',
  'courses_overview',
  'quick_actions',
  'campus_shortcuts',
  'wellness_budget',
];

interface DashboardCustomizerProps {
  activeWidgets: DashboardWidgetId[];
  onToggleWidget: (id: DashboardWidgetId) => void;
  onUpdateOrder: (nextWidgets: DashboardWidgetId[]) => void;
  onClose: () => void;
}

export function DashboardCustomizer({
  activeWidgets,
  onToggleWidget,
  onUpdateOrder,
  onClose,
}: DashboardCustomizerProps) {
  const [draggedId, setDraggedId] = useState<DashboardWidgetId | null>(null);

  const orderedZoneIds = (zone: 'main' | 'rail'): DashboardWidgetId[] => {
    const activeInZone = activeWidgets.filter(
      (id) => WIDGET_CATALOG[id]?.zone === zone,
    );
    const hiddenInZone = (
      Object.keys(WIDGET_CATALOG) as DashboardWidgetId[]
    ).filter(
      (id) => WIDGET_CATALOG[id].zone === zone && !activeWidgets.includes(id),
    );
    return [...activeInZone, ...hiddenInZone];
  };

  const moveWithinZone = (
    zone: 'main' | 'rail',
    widgetId: DashboardWidgetId,
    direction: -1 | 1,
  ) => {
    const activeInZone = activeWidgets.filter(
      (id) => WIDGET_CATALOG[id]?.zone === zone,
    );
    const idx = activeInZone.indexOf(widgetId);
    if (idx === -1) return;
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= activeInZone.length) return;

    const targetId = activeInZone[swapIdx];
    const fullCopy = [...activeWidgets];
    const fullIdxA = fullCopy.indexOf(widgetId);
    const fullIdxB = fullCopy.indexOf(targetId);
    if (fullIdxA === -1 || fullIdxB === -1) return;

    [fullCopy[fullIdxA], fullCopy[fullIdxB]] = [
      fullCopy[fullIdxB],
      fullCopy[fullIdxA],
    ];
    onUpdateOrder(fullCopy);
  };

  const handleDropOn = (zone: 'main' | 'rail', targetId: DashboardWidgetId) => {
    if (!draggedId || draggedId === targetId) return;
    if (WIDGET_CATALOG[draggedId].zone !== zone) return;
    if (!activeWidgets.includes(draggedId) || !activeWidgets.includes(targetId)) {
      return;
    }

    const activeInZone = activeWidgets.filter(
      (id) => WIDGET_CATALOG[id]?.zone === zone,
    );
    const fromIdx = activeInZone.indexOf(draggedId);
    const toIdx = activeInZone.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reorderedZone = [...activeInZone];
    const [moved] = reorderedZone.splice(fromIdx, 1);
    reorderedZone.splice(toIdx, 0, moved);

    let zonePointer = 0;
    const nextFull = activeWidgets.map((id) => {
      if (WIDGET_CATALOG[id]?.zone === zone) {
        const replacement = reorderedZone[zonePointer];
        zonePointer += 1;
        return replacement;
      }
      return id;
    });

    onUpdateOrder(nextFull);
    setDraggedId(null);
  };

  const renderZoneList = (zone: 'main' | 'rail', title: string) => {
    const items = orderedZoneIds(zone);
    const activeInZone = activeWidgets.filter(
      (id) => WIDGET_CATALOG[id]?.zone === zone,
    );

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <ul className="space-y-2">
          {items.map((id) => {
            const meta = WIDGET_CATALOG[id];
            const isVisible = activeWidgets.includes(id);
            const activeIndex = activeInZone.indexOf(id);

            return (
              <li
                key={id}
                draggable={isVisible}
                onDragStart={() => setDraggedId(id)}
                onDragOver={(e) => {
                  if (isVisible && draggedId && WIDGET_CATALOG[draggedId].zone === zone) {
                    e.preventDefault();
                  }
                }}
                onDrop={() => handleDropOn(zone, id)}
                onDragEnd={() => setDraggedId(null)}
                className={cn(
                  'flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-colors',
                  isVisible
                    ? 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
                    : 'border-dashed border-[var(--border-strong)] bg-[var(--bg-surface-subtle)]/60 opacity-75',
                  draggedId === id && 'ring-2 ring-[var(--accent-primary)]',
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <GripVertical
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isVisible
                        ? 'text-[var(--text-muted)] cursor-grab'
                        : 'text-[var(--border-strong)]',
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {meta.label}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isVisible && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveWithinZone(zone, id, -1)}
                        disabled={activeIndex <= 0}
                        aria-label={`Di chuyển lên ${meta.label}`}
                        title="Di chuyển lên"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWithinZone(zone, id, 1)}
                        disabled={activeIndex === activeInZone.length - 1}
                        aria-label={`Di chuyển xuống ${meta.label}`}
                        title="Di chuyển xuống"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleWidget(id)}
                    aria-pressed={isVisible}
                    aria-label={
                      isVisible
                        ? `Ẩn mục ${meta.label}`
                        : `Hiện mục ${meta.label}`
                    }
                    className={cn(
                      'min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-3 text-xs font-medium border cursor-pointer transition-colors',
                      isVisible
                        ? 'border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-hairline)]'
                        : 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]',
                    )}
                  >
                    {isVisible ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Ẩn</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Hiện</span>
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <Card className="border-[var(--accent-primary)]/40 bg-[var(--bg-surface)]">
      <CardHeader className="flex-wrap gap-3 border-b border-[var(--border-hairline)] pb-4">
        <div>
          <CardTitle>Tùy chỉnh bố cục bảng tổng quan</CardTitle>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Bật/tắt các khối thông tin hoặc kéo thả / nhấn mũi tên để sắp xếp thứ tự ưu tiên theo thói quen của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => onUpdateOrder(DEFAULT_DASHBOARD_WIDGETS)}
          >
            Khôi phục mặc định
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Xong
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderZoneList('main', 'Khu vực chính (Lịch & Việc hôm nay)')}
        {renderZoneList('rail', 'Cột phụ trợ (Tiến độ, Gợi ý & Lối tắt)')}
      </CardBody>
    </Card>
  );
}
