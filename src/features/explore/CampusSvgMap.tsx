import {
  Bike,
  Building2,
  Droplets,
  Flag,
  HeartPulse,
  Landmark,
  Library,
  Utensils,
} from 'lucide-react';
import { CAMPUS_LOCATION_CATEGORY_LABELS } from '../../data';
import type { CampusLocation, CampusLocationCategory } from '../../types/models';
import { cn } from '../../utils/cn';
import { MAIN_GATE_COORDS } from './exploreUtils';

interface CampusSvgMapProps {
  locations: CampusLocation[];
  allLocations: CampusLocation[];
  selectedId: string | null;
  originValue: string;
  onSelect: (locationId: string) => void;
}

const CATEGORY_PIN_STYLES: Record<
  CampusLocationCategory,
  { bg: string; border: string; icon: typeof Building2 }
> = {
  building: {
    bg: 'bg-blue-700 text-white dark:bg-blue-700',
    border: 'border-blue-800 dark:border-blue-400',
    icon: Building2,
  },
  library: {
    bg: 'bg-teal-700 text-white dark:bg-teal-700',
    border: 'border-teal-800 dark:border-teal-400',
    icon: Library,
  },
  medical: {
    bg: 'bg-red-700 text-white dark:bg-red-700',
    border: 'border-red-800 dark:border-red-400',
    icon: HeartPulse,
  },
  canteen: {
    bg: 'bg-amber-800 text-white dark:bg-amber-700',
    border: 'border-amber-900 dark:border-amber-400',
    icon: Utensils,
  },
  restroom: {
    bg: 'bg-sky-800 text-white dark:bg-sky-700',
    border: 'border-sky-900 dark:border-sky-400',
    icon: Droplets,
  },
  parking: {
    bg: 'bg-slate-700 text-white dark:bg-slate-700',
    border: 'border-slate-800 dark:border-slate-400',
    icon: Bike,
  },
  admin: {
    bg: 'bg-emerald-800 text-white dark:bg-emerald-700',
    border: 'border-emerald-900 dark:border-emerald-400',
    icon: Landmark,
  },
};

export function CampusSvgMap({
  locations,
  allLocations,
  selectedId,
  originValue,
  onSelect,
}: CampusSvgMapProps) {
  const visibleIds = new Set(locations.map((l) => l.id));
  const selectedLocation = allLocations.find((l) => l.id === selectedId) ?? null;
  const originLocation =
    originValue === 'main_gate'
      ? null
      : allLocations.find((l) => l.id === originValue) ?? null;

  const fromPoint = originLocation
    ? { x: originLocation.x, y: originLocation.y }
    : { x: MAIN_GATE_COORDS.x, y: MAIN_GATE_COORDS.y };

  return (
    <div
      role="region"
      aria-label="Bản đồ khuôn viên 2D minh họa"
      className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)] overflow-hidden select-none"
    >
      {/* Architectural 2D Campus SVG Backdrop */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        {/* Campus outer perimeter */}
        <rect
          x="4"
          y="5"
          width="92"
          height="90"
          rx="4"
          fill="var(--bg-surface)"
          stroke="var(--border-strong)"
          strokeWidth="0.5"
        />

        {/* Subtle green lawns / courtyards */}
        <rect
          x="10"
          y="10"
          width="34"
          height="20"
          rx="2.5"
          fill="var(--status-success-soft)"
          opacity="0.45"
        />
        <rect
          x="56"
          y="10"
          width="34"
          height="20"
          rx="2.5"
          fill="var(--status-success-soft)"
          opacity="0.45"
        />
        <rect
          x="39"
          y="40"
          width="22"
          height="24"
          rx="3"
          fill="var(--status-success-soft)"
          opacity="0.35"
        />

        {/* Campus roads / walkways */}
        {/* Central North-South avenue */}
        <path
          d="M 50 93 L 50 14"
          stroke="var(--border-strong)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Southern entrance perimeter road */}
        <path
          d="M 12 82 L 88 82"
          stroke="var(--border-strong)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Mid-campus East-West corridor */}
        <path
          d="M 18 52 L 84 52"
          stroke="var(--border-strong)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Upper East-West walkway */}
        <path
          d="M 20 35 L 82 35"
          stroke="var(--border-hairline)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* West side path */}
        <path
          d="M 22 82 L 22 35"
          stroke="var(--border-hairline)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* East side path */}
        <path
          d="M 78 82 L 78 26"
          stroke="var(--border-hairline)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Central Roundabout */}
        <circle
          cx="50"
          cy="52"
          r="4.2"
          fill="var(--bg-surface)"
          stroke="var(--border-strong)"
          strokeWidth="0.9"
        />
        <circle
          cx="50"
          cy="52"
          r="2"
          fill="var(--status-success)"
          opacity="0.45"
        />

        {/* Active route indicator line */}
        {selectedLocation && selectedLocation.id !== originValue && (
          <g>
            <line
              x1={fromPoint.x}
              y1={fromPoint.y}
              x2={selectedLocation.x}
              y2={selectedLocation.y}
              stroke="var(--accent-primary)"
              strokeWidth="1.2"
              strokeDasharray="2 1.4"
              strokeLinecap="round"
            />
            <circle
              cx={fromPoint.x}
              cy={fromPoint.y}
              r="2.2"
              fill="var(--status-success)"
            />
          </g>
        )}
      </svg>

      {/* Compass indicator */}
      <div
        aria-hidden="true"
        className="absolute top-2.5 right-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]/90 px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]"
      >
        ↑ Bắc
      </div>

      {/* Main Gate Landmark */}
      <div
        style={{ left: `${MAIN_GATE_COORDS.x}%`, top: `${MAIN_GATE_COORDS.y}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-success)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--status-success)] shadow-xs whitespace-nowrap">
          <Flag className="h-3 w-3" aria-hidden="true" />
          Cổng chính
        </span>
      </div>

      {/* Interactive Building Pins */}
      {allLocations.map((loc) => {
        const isVisible = visibleIds.has(loc.id);
        const isSelected = loc.id === selectedId;
        const style = CATEGORY_PIN_STYLES[loc.category];
        const Icon = style.icon;

        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelect(loc.id)}
            aria-pressed={isSelected}
            aria-label={`${loc.code} — ${loc.name} (${CAMPUS_LOCATION_CATEGORY_LABELS[loc.category]})`}
            title={`${loc.code}: ${loc.name}`}
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center',
              'min-h-[44px] min-w-[44px] p-1 rounded-xl bg-transparent border-0 cursor-pointer group focus-visible:outline-none focus-visible:z-30',
              isSelected ? 'z-20' : 'z-10',
              !isVisible && !isSelected && 'opacity-25',
            )}
          >
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold shadow-xs border transition-transform',
                style.bg,
                style.border,
                isSelected
                  ? 'scale-110 ring-2 ring-[var(--focus-ring)] ring-offset-2 ring-offset-[var(--bg-surface)]'
                  : 'group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-[var(--focus-ring)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[var(--bg-surface)]',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">{loc.code}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
