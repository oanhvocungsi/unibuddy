import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';

type SearchScope =
  | 'all'
  | 'course'
  | 'handbook'
  | 'location'
  | 'event'
  | 'club'
  | 'question'
  | 'group';

interface SearchResultItem {
  id: string;
  scope: Exclude<SearchScope, 'all'>;
  title: string;
  subtitle: string;
  badge: string;
  route: string;
}

const SCOPE_LABELS: Record<SearchScope, string> = {
  all: 'Tất cả',
  course: 'Môn học',
  handbook: 'Sổ tay',
  location: 'Bản đồ',
  event: 'Sự kiện',
  club: 'CLB',
  question: 'Hỏi đáp',
  group: 'Nhóm học',
};

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { state, addRecentSearch, clearRecentSearches } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const allItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    for (const c of state.courses) {
      items.push({
        id: `course-${c.id}`,
        scope: 'course',
        title: `${c.name} (${c.code})`,
        subtitle: `${c.instructor} • Phòng ${c.room}`,
        badge: 'Môn học',
        route: `/mon-hoc/${c.id}`,
      });
    }

    for (const art of state.handbookArticles) {
      items.push({
        id: `hb-${art.id}`,
        scope: 'handbook',
        title: art.title,
        subtitle: `${art.summary} (${art.sourceUnit})`,
        badge: 'Sổ tay',
        route: `/kham-pha?tab=handbook&article=${art.id}`,
      });
    }

    for (const loc of state.campusLocations) {
      items.push({
        id: `loc-${loc.id}`,
        scope: 'location',
        title: `${loc.code} — ${loc.name}`,
        subtitle: `${loc.openHours} • ${loc.services.slice(0, 2).join(', ')}`,
        badge: 'Campus',
        route: `/kham-pha?tab=map&location=${loc.id}`,
      });
    }

    for (const ev of state.events) {
      items.push({
        id: `ev-${ev.id}`,
        scope: 'event',
        title: ev.title,
        subtitle: `${ev.date} • ${ev.startTime} • ${ev.location}`,
        badge: 'Sự kiện',
        route: `/kham-pha?tab=events&event=${ev.id}`,
      });
    }

    for (const club of state.clubs) {
      items.push({
        id: `club-${club.id}`,
        scope: 'club',
        title: club.name,
        subtitle: `${club.meetingSchedule} • ${club.location}`,
        badge: 'CLB',
        route: `/kham-pha?tab=clubs&club=${club.id}`,
      });
    }

    for (const q of state.questions) {
      if (q.isHidden) continue;
      items.push({
        id: `q-${q.id}`,
        scope: 'question',
        title: q.title,
        subtitle: `${q.authorName} • ${q.answers.length} phản hồi`,
        badge: 'Hỏi đáp',
        route: `/kham-pha?tab=community&question=${q.id}`,
      });
    }

    for (const g of state.studyGroups) {
      items.push({
        id: `grp-${g.id}`,
        scope: 'group',
        title: g.name,
        subtitle: `${g.topic} • ${g.scheduleNote}`,
        badge: 'Nhóm học',
        route: `/kham-pha?tab=groups&group=${g.id}`,
      });
    }

    return items;
  }, [state]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems
      .filter((item) => scope === 'all' || item.scope === scope)
      .filter((item) => {
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [allItems, query, scope]);

  const handleSelect = (item: SearchResultItem) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    navigate(item.route);
    onClose();
  };

  const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        filtered.length === 0 ? 0 : (prev + 1) % filtered.length,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        filtered.length === 0
          ? 0
          : (prev - 1 + filtered.length) % filtered.length,
      );
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      handleSelect(filtered[activeIndex]);
    }
  };

  if (!isOpen) return null;

  const renderIcon = (itemScope: SearchResultItem['scope']) => {
    switch (itemScope) {
      case 'course':
        return <BookOpen className="h-4 w-4" aria-hidden="true" />;
      case 'handbook':
        return <FileText className="h-4 w-4" aria-hidden="true" />;
      case 'location':
        return <MapPin className="h-4 w-4" aria-hidden="true" />;
      case 'event':
        return <CalendarDays className="h-4 w-4" aria-hidden="true" />;
      case 'club':
      case 'group':
        return <Users className="h-4 w-4" aria-hidden="true" />;
      case 'question':
        return <MessageSquare className="h-4 w-4" aria-hidden="true" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-950/55 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm nhanh toàn hệ thống"
        className="w-full max-w-2xl rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-hairline)]">
          <Search
            className="h-5 w-5 text-[var(--text-muted)] shrink-0"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Tìm môn học, phòng học, thủ tục sổ tay, CLB, sự kiện, nhóm học..."
            aria-label="Từ khóa tìm kiếm toàn hệ thống"
            className="flex-1 min-h-[44px] bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scope filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 border-b border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50">
          {(Object.keys(SCOPE_LABELS) as SearchScope[]).map((key) => {
            const active = scope === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setScope(key);
                  setActiveIndex(0);
                }}
                className={cn(
                  'min-h-[44px] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]',
                )}
              >
                {SCOPE_LABELS[key]}
              </button>
            );
          })}
        </div>

        {/* Recent searches when query is empty */}
        {!query.trim() && state.recentSearches.length > 0 && (
          <div className="px-4 py-3 border-b border-[var(--border-hairline)]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Tìm kiếm gần đây
              </span>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="min-h-[44px] px-2 text-xs font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Xóa lịch sử
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="min-h-[44px] px-3 py-1 rounded-lg bg-[var(--bg-surface-subtle)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--border-hairline)] cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Không tìm thấy kết quả phù hợp cho "{query}"
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Thử từ khóa ngắn hơn như tên phòng (B1), môn học (IT1010), thư viện hoặc học bổng.
              </p>
            </div>
          ) : (
            <ul role="listbox" aria-label="Kết quả tìm kiếm" className="space-y-1">
              {filtered.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-full min-h-[48px] flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-[var(--accent-primary-soft)] text-[var(--text-primary)]'
                          : 'hover:bg-[var(--bg-surface-subtle)]',
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--accent-primary)]">
                        {renderIcon(item.scope)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {item.subtitle}
                        </p>
                      </div>
                      <Badge variant="default">{item.badge}</Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 text-xs text-[var(--text-muted)]">
          <span>Phím tắt: Ctrl + K để mở nhanh bất cứ lúc nào</span>
          <span>Dùng ↑ ↓ và Enter để chọn</span>
        </div>
      </div>
    </div>
  );
}
