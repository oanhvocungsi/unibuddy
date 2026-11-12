import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  FileCheck2,
  Info,
  Search,
  ThumbsDown,
  ThumbsUp,
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
import { useToast } from '../../components/ui';
import { HANDBOOK_CATEGORY_LABELS } from '../../data';
import { useAppStore } from '../../store/appStore';
import type { HandbookCategory } from '../../types/models';
import { cn } from '../../utils/cn';
import { formatShortDate } from '../../utils/dateUtils';
import { includesVi } from './exploreUtils';

interface HandbookViewProps {
  initialArticleId?: string | null;
  initialQuery?: string;
}

export function HandbookView({
  initialArticleId,
  initialQuery = '',
}: HandbookViewProps) {
  const { state, toggleHandbookBookmark, voteHandbookArticle } = useAppStore();
  const { showToast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<
    HandbookCategory | 'all'
  >('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialArticleId ?? state.handbookArticles[0]?.id ?? null,
  );
  const [mobileShowDetail, setMobileShowDetail] = useState(
    Boolean(initialArticleId),
  );

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialArticleId) {
      setSelectedId(initialArticleId);
      setMobileShowDetail(true);
    }
  }, [initialArticleId]);

  const bookmarkedCount = useMemo(
    () => state.handbookArticles.filter((a) => a.bookmarked).length,
    [state.handbookArticles],
  );

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<HandbookCategory, number>> = {};
    for (const art of state.handbookArticles) {
      counts[art.category] = (counts[art.category] ?? 0) + 1;
    }
    return counts;
  }, [state.handbookArticles]);

  const filteredArticles = useMemo(() => {
    return state.handbookArticles.filter((art) => {
      if (selectedCategory !== 'all' && art.category !== selectedCategory) {
        return false;
      }
      if (bookmarkedOnly && !art.bookmarked) {
        return false;
      }
      if (query.trim()) {
        const searchable = [
          art.title,
          art.summary,
          art.sourceUnit,
          art.tags.join(' '),
          art.steps.join(' '),
        ].join(' ');
        if (!includesVi(searchable, query)) {
          return false;
        }
      }
      return true;
    });
  }, [state.handbookArticles, selectedCategory, bookmarkedOnly, query]);

  const missingInitialTarget = Boolean(
    initialArticleId &&
      selectedId === initialArticleId &&
      !state.handbookArticles.some((a) => a.id === initialArticleId),
  );

  const activeArticle = useMemo(() => {
    if (missingInitialTarget) return null;
    if (selectedId) {
      const exact = filteredArticles.find((a) => a.id === selectedId);
      if (exact) return exact;
      const fromAll = state.handbookArticles.find((a) => a.id === selectedId);
      if (fromAll && filteredArticles.length === 0) return null;
      if (fromAll && !query && selectedCategory === 'all' && !bookmarkedOnly) {
        return fromAll;
      }
    }
    return filteredArticles[0] ?? null;
  }, [
    missingInitialTarget,
    selectedId,
    filteredArticles,
    state.handbookArticles,
    query,
    selectedCategory,
    bookmarkedOnly,
  ]);

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setBookmarkedOnly(false);
  };

  const handleToggleBookmark = (articleId: string, currentlyBookmarked: boolean) => {
    toggleHandbookBookmark(articleId);
    showToast(
      currentlyBookmarked
        ? 'Đã bỏ lưu bài viết khỏi mục Đã lưu.'
        : 'Đã lưu bài viết vào Cẩm nang của bạn.',
      'info',
    );
  };

  const handleVote = (articleId: string, vote: 'yes' | 'no', currentVote?: 'yes' | 'no') => {
    voteHandbookArticle(articleId, vote);
    if (currentVote === vote) {
      showToast('Đã hủy đánh giá bài viết.', 'info');
    } else if (vote === 'yes') {
      showToast('Cảm ơn phản hồi! Bài viết đã được ghi nhận là hữu ích.', 'success');
    } else {
      showToast(
        'Đã ghi nhận góp ý. Hãy đối chiếu thêm với cổng thông tin chính thức của trường bạn.',
        'info',
      );
    }
  };

  const categories = Object.keys(HANDBOOK_CATEGORY_LABELS) as HandbookCategory[];

  return (
    <section aria-labelledby="handbook-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="handbook-heading"
            className="text-lg sm:text-xl font-bold text-[var(--text-primary)]"
          >
            Cẩm nang sinh viên năm nhất
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Tra cứu nhanh thủ tục nhập học, đăng ký tín chỉ, quy chế thi và mẹo thích nghi tuần đầu.
          </p>
        </div>
        <SampleDataBadge label="Nội dung minh họa — đối chiếu quy chế chính thức của trường" />
      </div>

      {/* Search & Bookmarked Filter Bar */}
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
              placeholder="Tìm thủ tục, GPA, đăng ký tín chỉ, thư viện, mất thẻ..."
              aria-label="Tìm kiếm bài viết cẩm nang"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <Button
            variant={bookmarkedOnly ? 'primary' : 'outline'}
            aria-pressed={bookmarkedOnly}
            onClick={() => setBookmarkedOnly((prev) => !prev)}
            leftIcon={<Bookmark className="h-4 w-4" aria-hidden="true" />}
          >
            <span>Đã lưu ({bookmarkedCount})</span>
          </Button>
        </div>

        {/* 10 Category Filter Chips */}
        <div
          role="group"
          aria-label="Lọc cẩm nang theo chuyên mục"
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
            Tất cả ({state.handbookArticles.length})
          </button>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={active}
                className={cn(
                  'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left',
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {HANDBOOK_CATEGORY_LABELS[cat]} ({categoryCounts[cat] ?? 0})
              </button>
            );
          })}
        </div>
      </Card>

      {missingInitialTarget ? (
        <DeletedContentState
          title="Không tìm thấy bài cẩm nang được liên kết"
          description="Bài viết bạn mở có thể đã được biên tập viên cập nhật hoặc xóa khỏi danh sách."
          actionLabel="Xem toàn bộ cẩm nang"
          onBack={() => {
            setSelectedId(state.handbookArticles[0]?.id ?? null);
            setMobileShowDetail(false);
          }}
        />
      ) : filteredArticles.length === 0 ? (
        <EmptyState
          title="Không có bài viết phù hợp"
          description={
            bookmarkedOnly
              ? 'Bạn chưa lưu bài viết nào khớp với bộ lọc hiện tại.'
              : 'Thử từ khóa ngắn hơn như "GPA", "tín chỉ", "thẻ" hoặc chuyển về Tất cả chuyên mục.'
          }
          actionLabel="Xóa bộ lọc"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Article List */}
          <div
            className={cn(
              'lg:col-span-5 space-y-2.5',
              mobileShowDetail ? 'hidden lg:block' : 'block',
            )}
          >
            <p className="text-xs font-medium text-[var(--text-muted)] px-1 tabular-nums">
              Hiển thị {filteredArticles.length} bài viết hướng dẫn
            </p>
            <ul className="space-y-2.5" aria-label="Danh sách bài viết cẩm nang">
              {filteredArticles.map((article) => {
                const isSelected = activeArticle?.id === article.id;
                return (
                  <li key={article.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(article.id);
                        setMobileShowDetail(true);
                      }}
                      aria-current={isSelected ? 'true' : undefined}
                      className={cn(
                        'w-full text-left rounded-xl border p-4 transition-colors cursor-pointer space-y-2',
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/50'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant={isSelected ? 'primary' : 'default'}>
                          {HANDBOOK_CATEGORY_LABELS[article.category]}
                        </Badge>
                        {article.bookmarked && (
                          <Bookmark
                            className="h-4 w-4 shrink-0 text-[var(--accent-primary)] fill-current"
                            aria-label="Đã lưu"
                          />
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {article.readMinutes} phút đọc
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                          {article.helpfulYes} hữu ích
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Reading Detail Pane */}
          <div
            className={cn(
              'lg:col-span-7',
              mobileShowDetail ? 'block' : 'hidden lg:block',
            )}
          >
            {activeArticle && (
              <Card>
                <CardHeader className="flex-col items-stretch gap-3 border-b border-[var(--border-hairline)] pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden -ml-2"
                      onClick={() => setMobileShowDetail(false)}
                      leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                    >
                      Quay lại danh sách
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">
                        {HANDBOOK_CATEGORY_LABELS[activeArticle.category]}
                      </Badge>
                      <SampleDataBadge label="Nội dung minh họa — đối chiếu quy chế chính thức của trường" />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg sm:text-xl font-bold leading-snug">
                      {activeArticle.title}
                    </CardTitle>
                    <Button
                      variant={activeArticle.bookmarked ? 'primary' : 'outline'}
                      size="sm"
                      aria-pressed={Boolean(activeArticle.bookmarked)}
                      onClick={() =>
                        handleToggleBookmark(
                          activeArticle.id,
                          Boolean(activeArticle.bookmarked),
                        )
                      }
                      leftIcon={
                        <Bookmark
                          className={cn(
                            'h-4 w-4',
                            activeArticle.bookmarked && 'fill-current',
                          )}
                          aria-hidden="true"
                        />
                      }
                    >
                      {activeArticle.bookmarked ? 'Đã lưu' : 'Lưu bài'}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                    <span>Nguồn: {activeArticle.sourceUnit}</span>
                    <span className="tabular-nums">
                      Cập nhật: {formatShortDate(activeArticle.updatedAt.slice(0, 10))}
                    </span>
                    <span className="tabular-nums">
                      Thời lượng đọc: {activeArticle.readMinutes} phút
                    </span>
                  </div>
                </CardHeader>

                <CardBody className="pt-5 space-y-6">
                  <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed max-w-prose">
                    {activeArticle.summary}
                  </p>

                  {/* Numbered Procedure Steps */}
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <CheckCircle2
                        className="h-4 w-4 text-[var(--accent-primary)]"
                        aria-hidden="true"
                      />
                      Các bước thực hiện
                    </h3>
                    <ol className="space-y-2.5 max-w-prose">
                      {activeArticle.steps.map((step, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3 text-sm text-[var(--text-primary)] leading-relaxed"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold tabular-nums mt-0.5">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Required Documents */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <FileCheck2
                        className="h-4 w-4 text-[var(--status-success)]"
                        aria-hidden="true"
                      />
                      Giấy tờ & chuẩn bị cần có
                    </h3>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--text-secondary)] max-w-prose">
                      {activeArticle.requiredDocs.map((doc, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Official Guidance Callout */}
                  <div className="rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary-soft)]/50 p-4 flex items-start gap-3">
                    <Info
                      className="h-5 w-5 shrink-0 text-[var(--accent-primary)] mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-[var(--text-primary)]">
                        Lưu ý đối chiếu quy chế chính thức
                      </p>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {activeArticle.officialGuidance}
                      </p>
                    </div>
                  </div>

                  {/* Helpful Feedback */}
                  <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Thông tin này hữu ích không?
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          activeArticle.userVote === 'yes' ? 'success' : 'outline'
                        }
                        size="sm"
                        aria-pressed={activeArticle.userVote === 'yes'}
                        onClick={() =>
                          handleVote(
                            activeArticle.id,
                            'yes',
                            activeArticle.userVote,
                          )
                        }
                        leftIcon={<ThumbsUp className="h-4 w-4" aria-hidden="true" />}
                      >
                        <span className="tabular-nums">
                          Có ({activeArticle.helpfulYes})
                        </span>
                      </Button>
                      <Button
                        variant={
                          activeArticle.userVote === 'no' ? 'danger' : 'outline'
                        }
                        size="sm"
                        aria-pressed={activeArticle.userVote === 'no'}
                        onClick={() =>
                          handleVote(
                            activeArticle.id,
                            'no',
                            activeArticle.userVote,
                          )
                        }
                        leftIcon={<ThumbsDown className="h-4 w-4" aria-hidden="true" />}
                      >
                        <span className="tabular-nums">
                          Không ({activeArticle.helpfulNo})
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
