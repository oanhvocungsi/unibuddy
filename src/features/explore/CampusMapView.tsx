import { useEffect, useMemo, useState } from 'react';
import {
  Accessibility,
  Clock,
  Compass,
  Layers,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
  Search,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DeletedContentState,
  EmptyState,
  SampleDataBadge,
} from '../../components/ui';
import {
  CAMPUS_LOCATION_CATEGORY_LABELS,
  CAMPUS_UTILITY_CATEGORY_LABELS,
} from '../../data';
import { useAppStore } from '../../store/appStore';
import type {
  CampusLocationCategory,
  CampusUtilityCategory,
} from '../../types/models';
import { cn } from '../../utils/cn';
import { CampusSvgMap } from './CampusSvgMap';
import { buildCampusRoute, includesVi } from './exploreUtils';

interface CampusMapViewProps {
  initialLocationId?: string | null;
  initialQuery?: string;
}

const QUICK_ROOM_CODES = ['B1-302', 'TV-01', 'A1-101', 'C2-105', 'YT-01', 'CT-01'];

export function CampusMapView({
  initialLocationId,
  initialQuery = '',
}: CampusMapViewProps) {
  const { state } = useAppStore();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<
    CampusLocationCategory | 'all'
  >('all');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialLocationId ?? state.campusLocations[0]?.id ?? null,
  );
  const [originId, setOriginId] = useState<string>('main_gate');
  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const [utilityCategory, setUtilityCategory] = useState<
    CampusUtilityCategory | 'all'
  >('all');

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialLocationId) {
      setSelectedId(initialLocationId);
    }
  }, [initialLocationId]);

  const locationCategories = Object.keys(
    CAMPUS_LOCATION_CATEGORY_LABELS,
  ) as CampusLocationCategory[];

  const utilityCategories = Object.keys(
    CAMPUS_UTILITY_CATEGORY_LABELS,
  ) as CampusUtilityCategory[];

  const filteredLocations = useMemo(() => {
    return state.campusLocations.filter((loc) => {
      if (selectedCategory !== 'all' && loc.category !== selectedCategory) {
        return false;
      }
      if (query.trim()) {
        const searchable = [
          loc.code,
          loc.name,
          loc.floorGuide.join(' '),
          loc.services.join(' '),
          CAMPUS_LOCATION_CATEGORY_LABELS[loc.category],
        ].join(' ');
        if (!includesVi(searchable, query)) {
          return false;
        }
      }
      return true;
    });
  }, [state.campusLocations, selectedCategory, query]);

  const missingInitialTarget = Boolean(
    initialLocationId &&
      selectedId === initialLocationId &&
      !state.campusLocations.some((l) => l.id === initialLocationId),
  );

  const selectedLocation = useMemo(() => {
    if (missingInitialTarget) return null;
    if (selectedId) {
      const inFiltered = filteredLocations.find((l) => l.id === selectedId);
      if (inFiltered) return inFiltered;
    }
    return filteredLocations[0] ?? null;
  }, [missingInitialTarget, selectedId, filteredLocations]);

  // Reset origin if user selects the same building as both origin & destination
  useEffect(() => {
    if (selectedLocation && originId === selectedLocation.id) {
      setOriginId('main_gate');
    }
  }, [selectedLocation, originId]);

  const routeInfo = useMemo(() => {
    if (!selectedLocation) return null;
    const originObj =
      originId === 'main_gate'
        ? 'main_gate'
        : state.campusLocations.find((l) => l.id === originId) ?? 'main_gate';
    return buildCampusRoute(originObj, selectedLocation);
  }, [selectedLocation, originId, state.campusLocations]);

  const filteredUtilities = useMemo(() => {
    return state.campusUtilities.filter(
      (u) => utilityCategory === 'all' || u.category === utilityCategory,
    );
  }, [state.campusUtilities, utilityCategory]);

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
  };

  return (
    <section aria-labelledby="campus-map-heading" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="campus-map-heading"
            className="text-lg sm:text-xl font-bold text-[var(--text-primary)]"
          >
            Bản đồ & Tiện ích khuôn viên
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Tra cứu nhanh mã phòng học, sơ đồ tầng, giờ mở cửa và hướng dẫn đường đi giữa các tòa nhà.
          </p>
        </div>
        <SampleDataBadge label="Sơ đồ & giờ mở cửa minh họa — không phải bản đồ/liên hệ chính thức" />
      </div>

      {/* Search, Quick Codes & Category Filter */}
      <Card padded className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập mã phòng (vd: B1-302, TV-01, A1-101) hoặc tên địa điểm..."
              aria-label="Tìm theo mã phòng hoặc tên địa điểm"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <Button
            variant={textOnlyMode ? 'primary' : 'outline'}
            onClick={() => setTextOnlyMode((prev) => !prev)}
            aria-pressed={textOnlyMode}
            leftIcon={
              textOnlyMode ? (
                <MapIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <List className="h-4 w-4" aria-hidden="true" />
              )
            }
          >
            {textOnlyMode
              ? 'Hiện bản đồ 2D'
              : 'Chỉ xem danh sách & chỉ đường văn bản'}
          </Button>
        </div>

        {/* Quick Room Code Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-[var(--text-muted)]">
            Tra nhanh mã phổ biến:
          </span>
          {QUICK_ROOM_CODES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setQuery(code);
              }}
              className={cn(
                'min-h-[44px] min-w-[44px] rounded-md border px-3 py-1.5 font-semibold tabular-nums transition-colors cursor-pointer',
                query.toUpperCase() === code
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)]',
              )}
            >
              {code}
            </button>
          ))}
        </div>

        {/* 7 Location Category Chips */}
        <div
          role="group"
          aria-label="Lọc địa điểm theo nhóm"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            aria-pressed={selectedCategory === 'all'}
            className={cn(
              'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            Tất cả ({state.campusLocations.length})
          </button>
          {locationCategories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={active}
                className={cn(
                  'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {CAMPUS_LOCATION_CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </Card>

      {missingInitialTarget ? (
        <DeletedContentState
          title="Không tìm thấy địa điểm được liên kết"
          description="Điểm bản đồ bạn chọn không còn trong dữ liệu hiện tại."
          actionLabel="Xem toàn bộ bản đồ"
          onBack={() => setSelectedId(state.campusLocations[0]?.id ?? null)}
        />
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          title="Không tìm thấy phòng học hoặc địa điểm phù hợp"
          description="Thử tìm mã tòa như B1, C2, TV-01, A1 hoặc chuyển về Tất cả khu vực."
          actionLabel="Đặt lại tìm kiếm"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: 2D SVG Map + Accessible Location List */}
          <div className="lg:col-span-7 space-y-4">
            {!textOnlyMode && (
              <Card padded className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                    Chọn tòa nhà trực tiếp trên sơ đồ (Tab + Enter hoặc chạm vào mã)
                  </span>
                  <span className="tabular-nums">
                    {filteredLocations.length} điểm khớp bộ lọc
                  </span>
                </div>
                <CampusSvgMap
                  locations={filteredLocations}
                  allLocations={state.campusLocations}
                  selectedId={selectedLocation?.id ?? null}
                  originValue={originId}
                  onSelect={(id) => setSelectedId(id)}
                />
              </Card>
            )}

            {/* Text Accessible Location Directory (always available for mobile & screen readers) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Danh sách địa điểm & Sơ đồ tầng dạng văn bản ({filteredLocations.length})
                </CardTitle>
              </CardHeader>
              <CardBody>
                <ul
                  aria-label="Danh sách địa điểm khuôn viên"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  {filteredLocations.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <li key={loc.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(loc.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            'w-full min-h-[56px] text-left rounded-xl border p-3 transition-colors cursor-pointer space-y-1',
                            isSelected
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/50'
                              : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)] tabular-nums">
                              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                              {loc.code}
                            </span>
                            <Badge variant="default">
                              {CAMPUS_LOCATION_CATEGORY_LABELS[loc.category]}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                            {loc.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {loc.openHours}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Selected Location Detail & Route Finder */}
          <div className="lg:col-span-5">
            {selectedLocation && (
              <Card>
                <CardHeader className="flex-col items-stretch gap-2.5 border-b border-[var(--border-hairline)] pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" className="font-bold tabular-nums">
                        {selectedLocation.code}
                      </Badge>
                      <Badge variant="default">
                        {CAMPUS_LOCATION_CATEGORY_LABELS[selectedLocation.category]}
                      </Badge>
                    </div>
                    <SampleDataBadge label="Thông tin minh họa" />
                  </div>
                  <CardTitle className="text-lg font-bold leading-snug">
                    {selectedLocation.name}
                  </CardTitle>
                </CardHeader>

                <CardBody className="pt-4 space-y-5">
                  {/* Hours & Contact */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2.5 text-[var(--text-primary)]">
                      <Clock
                        className="h-4 w-4 shrink-0 text-[var(--accent-primary)] mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="font-semibold">Giờ mở cửa: </span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedLocation.openHours}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-[var(--text-primary)]">
                      <Phone
                        className="h-4 w-4 shrink-0 text-[var(--text-muted)] mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="font-semibold">Đầu mối: </span>
                        <span className="text-[var(--text-secondary)]">
                          {selectedLocation.contactNote}
                        </span>
                      </div>
                    </div>
                    {selectedLocation.accessibilityNote && (
                      <div className="flex items-start gap-2.5 text-[var(--text-primary)]">
                        <Accessibility
                          className="h-4 w-4 shrink-0 text-[var(--status-success)] mt-0.5"
                          aria-hidden="true"
                        />
                        <div>
                          <span className="font-semibold">Tiếp cận: </span>
                          <span className="text-[var(--text-secondary)]">
                            {selectedLocation.accessibilityNote}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Floor Guide */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Layers
                        className="h-4 w-4 text-[var(--accent-primary)]"
                        aria-hidden="true"
                      />
                      Sơ đồ tầng & Phòng chính
                    </h3>
                    <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                      {selectedLocation.floorGuide.map((floor, idx) => (
                        <li
                          key={idx}
                          className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 px-3 py-2 leading-relaxed"
                        >
                          {floor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Dịch vụ & Tiện ích tại đây
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
                      {selectedLocation.services.map((srv, idx) => (
                        <li key={idx}>{srv}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Route Finder ("Tìm đường đi") */}
                  <div className="rounded-xl border border-[var(--accent-primary)]/35 bg-[var(--accent-primary-soft)]/45 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Navigation
                          className="h-4 w-4 text-[var(--accent-primary)]"
                          aria-hidden="true"
                        />
                        Tìm đường đi tới {selectedLocation.code}
                      </h3>
                      {routeInfo && (
                        <Badge variant="primary" className="tabular-nums">
                          ~{routeInfo.distanceMeters}m • {routeInfo.walkMinutes} phút
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="campus-route-origin"
                        className="block text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        Chọn điểm xuất phát
                      </label>
                      <select
                        id="campus-route-origin"
                        value={originId}
                        onChange={(e) => setOriginId(e.target.value)}
                        className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      >
                        <option value="main_gate">Cổng chính (Lối vào phía Nam)</option>
                        {state.campusLocations
                          .filter((l) => l.id !== selectedLocation.id)
                          .map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.code} — {loc.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {routeInfo && (
                      <ol
                        aria-label="Chỉ dẫn đường đi từng bước"
                        className="space-y-2 text-sm text-[var(--text-primary)]"
                      >
                        {routeInfo.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold tabular-nums mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Campus Utilities Section */}
      <div className="space-y-4 pt-2 border-t border-[var(--border-hairline)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Tiện ích khuôn viên & Thủ tục thường dùng
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Giờ mở cửa thư viện/căng-tin, thủ tục xác nhận sinh viên, tuyến xe buýt và gửi xe minh họa.
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Lọc tiện ích khuôn viên"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setUtilityCategory('all')}
            aria-pressed={utilityCategory === 'all'}
            className={cn(
              'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
              utilityCategory === 'all'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            Tất cả ({state.campusUtilities.length})
          </button>
          {utilityCategories.map((cat) => {
            const active = utilityCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setUtilityCategory(cat)}
                aria-pressed={active}
                className={cn(
                  'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {CAMPUS_UTILITY_CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUtilities.map((util) => (
            <Card key={util.id} className="flex flex-col">
              <CardHeader className="flex-col items-start gap-2 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <Badge variant="primary">
                    {CAMPUS_UTILITY_CATEGORY_LABELS[util.category]}
                  </Badge>
                  <SampleDataBadge label="Minh họa" />
                </div>
                <CardTitle>{util.title}</CardTitle>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {util.summary}
                </p>
              </CardHeader>
              <CardBody className="flex-1 space-y-3">
                <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-primary)]">
                  {util.details.map((d, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-[var(--bg-surface-subtle)]/70 p-3 text-xs space-y-1 text-[var(--text-secondary)]">
                  <p>
                    <span className="font-semibold text-[var(--text-primary)]">
                      Thời gian / Mốc áp dụng:{' '}
                    </span>
                    {util.scheduleOrHours}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--text-primary)]">
                      Liên hệ mẫu:{' '}
                    </span>
                    {util.contactNote}
                  </p>
                  <p className="text-[var(--text-muted)]">{util.officialGuidance}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
