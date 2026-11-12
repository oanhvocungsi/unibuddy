import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowBigUp,
  Bookmark,
  CheckCircle2,
  Flag,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
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
  Modal,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { COMMUNITY_TOPIC_LABELS } from '../../data';
import { useAppStore } from '../../store/appStore';
import type { CommunityTopic } from '../../types/models';
import { cn } from '../../utils/cn';
import { formatRelativeTimeVi } from '../../utils/dateUtils';
import { findSimilarQuestions, includesVi } from './exploreUtils';
import { ReportContentModal, type ReportTarget } from './ReportContentModal';
import { StudyGroupsPanel } from './StudyGroupsPanel';

export type CommunitySubTab = 'qa' | 'groups';
type ResolvedFilter = 'all' | 'open' | 'resolved';

const SAVED_QUESTIONS_KEY = 'unibuddy_saved_questions_v1';

function loadSavedQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

interface CommunityViewProps {
  initialSubTab?: CommunitySubTab;
  initialQuestionId?: string | null;
  initialGroupId?: string | null;
  initialQuery?: string;
}

export function CommunityView({
  initialSubTab = 'qa',
  initialQuestionId,
  initialGroupId,
  initialQuery = '',
}: CommunityViewProps) {
  const {
    state,
    addQuestion,
    toggleUpvoteQuestion,
    toggleResolveQuestion,
    addAnswer,
    toggleUpvoteAnswer,
    toggleAcceptAnswer,
  } = useAppStore();
  const { showToast } = useToast();

  const [subTab, setSubTab] = useState<CommunitySubTab>(initialSubTab);
  const [query, setQuery] = useState(initialQuery);
  const [topicFilter, setTopicFilter] = useState<CommunityTopic | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ResolvedFilter>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(loadSavedQuestionIds);

  const visibleQuestions = useMemo(
    () => state.questions.filter((q) => !q.isHidden),
    [state.questions],
  );

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    initialQuestionId ?? visibleQuestions[0]?.id ?? null,
  );
  const [mobileShowDetail, setMobileShowDetail] = useState(
    Boolean(initialQuestionId),
  );

  // Ask modal state
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftTopic, setDraftTopic] = useState<CommunityTopic>('registration');
  const [draftContent, setDraftContent] = useState('');
  const [draftTags, setDraftTags] = useState('');

  // Answer & Report state
  const [answerText, setAnswerText] = useState('');
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [dismissedMissingQuestion, setDismissedMissingQuestion] = useState(false);

  const handleCloseAskModal = useCallback(() => setAskModalOpen(false), []);
  const handleCloseReportModal = useCallback(() => setReportTarget(null), []);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialQuestionId) {
      setSubTab('qa');
      setSelectedQuestionId(initialQuestionId);
      setMobileShowDetail(true);
      setDismissedMissingQuestion(false);
    }
  }, [initialQuestionId]);

  useEffect(() => {
    if (initialGroupId) {
      setSubTab('groups');
    }
  }, [initialGroupId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(savedIds));
    } catch {
      // ignore storage errors
    }
  }, [savedIds]);

  const savedIdSet = useMemo(() => new Set(savedIds), [savedIds]);

  const toggleSaveQuestion = (questionId: string) => {
    const currentlySaved = savedIdSet.has(questionId);
    setSavedIds((prev) =>
      currentlySaved ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    );
    showToast(
      currentlySaved
        ? 'Đã bỏ lưu câu hỏi.'
        : 'Đã lưu câu hỏi vào danh sách theo dõi.',
      'info',
    );
  };

  const filteredQuestions = useMemo(() => {
    return visibleQuestions.filter((q) => {
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
      if (statusFilter === 'open' && q.resolved) return false;
      if (statusFilter === 'resolved' && !q.resolved) return false;
      if (savedOnly && !savedIdSet.has(q.id)) return false;
      if (query.trim()) {
        const searchable = [
          q.title,
          q.content,
          q.authorName,
          q.tags.join(' '),
          COMMUNITY_TOPIC_LABELS[q.topic],
        ].join(' ');
        if (!includesVi(searchable, query)) return false;
      }
      return true;
    });
  }, [visibleQuestions, topicFilter, statusFilter, savedOnly, savedIdSet, query]);

  const missingDeepLinkedQuestion = Boolean(
    !dismissedMissingQuestion &&
      initialQuestionId &&
      selectedQuestionId === initialQuestionId &&
      !visibleQuestions.some((q) => q.id === initialQuestionId),
  );

  const activeQuestion = useMemo(() => {
    if (missingDeepLinkedQuestion) return null;
    if (selectedQuestionId) {
      const inFiltered = filteredQuestions.find((q) => q.id === selectedQuestionId);
      if (inFiltered) return inFiltered;
      const inAll = visibleQuestions.find((q) => q.id === selectedQuestionId);
      if (inAll && filteredQuestions.length === 0) return null;
    }
    return filteredQuestions[0] ?? null;
  }, [
    missingDeepLinkedQuestion,
    selectedQuestionId,
    filteredQuestions,
    visibleQuestions,
  ]);

  // Live duplicate suggestion as user types in "Đặt câu hỏi mới" modal
  const similarQuestions = useMemo(() => {
    if (!askModalOpen) return [];
    return findSimilarQuestions(draftTitle, visibleQuestions, 3);
  }, [askModalOpen, draftTitle, visibleQuestions]);

  const handleSubmitQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftContent.trim()) return;
    const parsedTags = draftTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addQuestion({
      title: draftTitle,
      content: draftContent,
      topic: draftTopic,
      tags: parsedTags.length > 0 ? parsedTags : [COMMUNITY_TOPIC_LABELS[draftTopic]],
    });
    showToast('Đã đăng câu hỏi mới lên Cộng đồng.', 'success');
    setDraftTitle('');
    setDraftContent('');
    setDraftTags('');
    setTopicFilter('all');
    setStatusFilter('all');
    setSavedOnly(false);
    setAskModalOpen(false);
    setSelectedQuestionId(null);
    setMobileShowDetail(true);
  };

  const handleSubmitAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !answerText.trim()) return;
    addAnswer(activeQuestion.id, answerText);
    setAnswerText('');
    showToast('Đã gửi câu trả lời của bạn.', 'success');
  };

  const topics = Object.keys(COMMUNITY_TOPIC_LABELS) as CommunityTopic[];

  return (
    <section aria-labelledby="community-heading" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="community-heading"
            className="text-lg sm:text-xl font-bold text-[var(--text-primary)]"
          >
            Cộng đồng: Hỏi đáp & Nhóm học tập
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Hỏi đáp nhanh cùng sinh viên khóa trên và tham gia nhóm ôn tập theo từng môn học.
          </p>
        </div>

        <div
          role="group"
          aria-label="Chuyển giữa Hỏi đáp và Nhóm học tập"
          className="inline-flex rounded-lg bg-[var(--bg-surface-subtle)] p-1"
        >
          <button
            type="button"
            onClick={() => setSubTab('qa')}
            aria-pressed={subTab === 'qa'}
            className={cn(
              'min-h-[44px] inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer',
              subTab === 'qa'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Hỏi đáp ({visibleQuestions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('groups')}
            aria-pressed={subTab === 'groups'}
            className={cn(
              'min-h-[44px] inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer',
              subTab === 'groups'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>Nhóm học tập ({state.studyGroups.length})</span>
          </button>
        </div>
      </div>

      {subTab === 'groups' ? (
        <StudyGroupsPanel
          initialGroupId={initialGroupId}
          initialQuery={initialQuery}
        />
      ) : (
        <div className="space-y-4">
          {/* Q&A Search & Filters */}
          <Card padded className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm câu hỏi về trùng lịch, GPA, KTX, thẻ sinh viên..."
                  aria-label="Tìm kiếm câu hỏi cộng đồng"
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              <Button
                variant="primary"
                onClick={() => setAskModalOpen(true)}
                leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
              >
                Đặt câu hỏi mới
              </Button>
            </div>

            {/* Topic chips */}
            <div
              role="group"
              aria-label="Lọc câu hỏi theo chủ đề"
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                onClick={() => setTopicFilter('all')}
                aria-pressed={topicFilter === 'all'}
                className={cn(
                  'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                  topicFilter === 'all'
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                Tất cả chủ đề
              </button>
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setTopicFilter(topic)}
                  aria-pressed={topicFilter === topic}
                  className={cn(
                    'min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer',
                    topicFilter === topic
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  {COMMUNITY_TOPIC_LABELS[topic]}
                </button>
              ))}
            </div>

            {/* Status + Saved toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-hairline)]">
              <div
                role="group"
                aria-label="Lọc theo trạng thái giải quyết"
                className="flex flex-wrap gap-2"
              >
                {(
                  [
                    { key: 'all', label: 'Tất cả trạng thái' },
                    { key: 'open', label: 'Chờ giải đáp' },
                    { key: 'resolved', label: 'Đã giải quyết' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key)}
                    aria-pressed={statusFilter === item.key}
                    className={cn(
                      'min-h-[44px] rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                      statusFilter === item.key
                        ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                variant={savedOnly ? 'primary' : 'outline'}
                aria-pressed={savedOnly}
                onClick={() => setSavedOnly((prev) => !prev)}
                leftIcon={<Bookmark className="h-4 w-4" aria-hidden="true" />}
              >
                Đã lưu ({savedIds.length})
              </Button>
            </div>
          </Card>

          {missingDeepLinkedQuestion ? (
            <DeletedContentState
              title="Câu hỏi không tồn tại hoặc đã bị ẩn"
              description="Nội dung bạn đang tìm có thể đã được chuyển sang trạng thái ẩn bởi bộ phận kiểm duyệt."
              actionLabel="Xem các câu hỏi khác"
              onBack={() => {
                setDismissedMissingQuestion(true);
                setSelectedQuestionId(visibleQuestions[0]?.id ?? null);
                setMobileShowDetail(false);
              }}
            />
          ) : filteredQuestions.length === 0 ? (
            <EmptyState
              title="Chưa có câu hỏi phù hợp"
              description="Bạn có thể đặt câu hỏi mới để nhận chia sẻ từ mentor và bạn cùng khóa."
              actionLabel="Đặt câu hỏi mới"
              onAction={() => setAskModalOpen(true)}
              secondaryAction={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setTopicFilter('all');
                    setStatusFilter('all');
                    setSavedOnly(false);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Question List */}
              <div
                className={cn(
                  'lg:col-span-5 space-y-2.5',
                  mobileShowDetail ? 'hidden lg:block' : 'block',
                )}
              >
                <p className="text-xs font-medium text-[var(--text-muted)] px-1 tabular-nums">
                  {filteredQuestions.length} câu hỏi thảo luận
                </p>
                <ul className="space-y-2.5" aria-label="Danh sách câu hỏi cộng đồng">
                  {filteredQuestions.map((q) => {
                    const isSelected = activeQuestion?.id === q.id;
                    const answerCount = q.answers.filter((a) => !a.isHidden).length;
                    return (
                      <li key={q.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedQuestionId(q.id);
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
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <Badge variant="default">
                              {COMMUNITY_TOPIC_LABELS[q.topic]}
                            </Badge>
                            <Badge variant={q.resolved ? 'success' : 'warning'}>
                              {q.resolved ? 'Đã giải quyết' : 'Chờ giải đáp'}
                            </Badge>
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] leading-snug">
                            {q.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] tabular-nums">
                            <span>{q.votes} hữu ích</span>
                            <span>{answerCount} trả lời</span>
                            <span>{formatRelativeTimeVi(q.createdAt)}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Question Detail */}
              <div
                className={cn(
                  'lg:col-span-7',
                  mobileShowDetail ? 'block' : 'hidden lg:block',
                )}
              >
                {activeQuestion && (
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
                            {COMMUNITY_TOPIC_LABELS[activeQuestion.topic]}
                          </Badge>
                          <Badge
                            variant={activeQuestion.resolved ? 'success' : 'warning'}
                          >
                            {activeQuestion.resolved
                              ? 'Đã giải quyết'
                              : 'Chờ giải đáp'}
                          </Badge>
                          {activeQuestion.isSample && (
                            <SampleDataBadge label="Thảo luận mẫu" />
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-lg sm:text-xl font-bold leading-snug">
                        {activeQuestion.title}
                      </CardTitle>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                        <span>
                          Đăng bởi{' '}
                          <strong className="text-[var(--text-primary)]">
                            {activeQuestion.authorName}
                          </strong>{' '}
                          ({activeQuestion.authorCohort}) •{' '}
                          {formatRelativeTimeVi(activeQuestion.createdAt)}
                        </span>
                      </div>
                    </CardHeader>

                    <CardBody className="pt-4 space-y-5">
                      <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed whitespace-pre-line max-w-prose">
                        {activeQuestion.content}
                      </p>

                      {activeQuestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {activeQuestion.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Question Action Bar */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
                        <Button
                          size="sm"
                          variant={
                            activeQuestion.userUpvoted ? 'primary' : 'outline'
                          }
                          aria-pressed={Boolean(activeQuestion.userUpvoted)}
                          onClick={() => toggleUpvoteQuestion(activeQuestion.id)}
                          leftIcon={
                            <ArrowBigUp className="h-4 w-4" aria-hidden="true" />
                          }
                        >
                          <span className="tabular-nums">
                            Hữu ích ({activeQuestion.votes})
                          </span>
                        </Button>

                        <Button
                          size="sm"
                          variant={
                            savedIdSet.has(activeQuestion.id)
                              ? 'primary'
                              : 'outline'
                          }
                          aria-pressed={savedIdSet.has(activeQuestion.id)}
                          onClick={() => toggleSaveQuestion(activeQuestion.id)}
                          leftIcon={
                            <Bookmark
                              className={cn(
                                'h-4 w-4',
                                savedIdSet.has(activeQuestion.id) && 'fill-current',
                              )}
                              aria-hidden="true"
                            />
                          }
                        >
                          {savedIdSet.has(activeQuestion.id)
                            ? 'Đã lưu'
                            : 'Lưu câu hỏi'}
                        </Button>

                        <Button
                          size="sm"
                          variant={
                            activeQuestion.resolved ? 'success' : 'outline'
                          }
                          aria-pressed={activeQuestion.resolved}
                          onClick={() => {
                            const next = !activeQuestion.resolved;
                            toggleResolveQuestion(activeQuestion.id);
                            showToast(
                              next
                                ? 'Đã đánh dấu câu hỏi là Đã giải quyết.'
                                : 'Đã mở lại câu hỏi.',
                              'info',
                            );
                          }}
                          leftIcon={
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          }
                        >
                          {activeQuestion.resolved
                            ? 'Đã giải quyết'
                            : 'Đánh dấu đã giải quyết'}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setReportTarget({
                              targetType: 'question',
                              targetId: activeQuestion.id,
                              targetPreview: activeQuestion.title,
                            })
                          }
                          leftIcon={<Flag className="h-4 w-4" aria-hidden="true" />}
                        >
                          Báo cáo nội dung
                        </Button>
                      </div>

                      {/* Answers */}
                      <div className="space-y-3 pt-3 border-t border-[var(--border-hairline)]">
                        <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                          Câu trả lời (
                          {activeQuestion.answers.filter((a) => !a.isHidden).length})
                        </h3>

                        {activeQuestion.answers.filter((a) => !a.isHidden)
                          .length === 0 ? (
                          <p className="text-sm text-[var(--text-muted)]">
                            Chưa có phản hồi nào. Hãy là người đầu tiên chia sẻ kinh nghiệm của bạn!
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {activeQuestion.answers
                              .filter((a) => !a.isHidden)
                              .map((ans) => (
                                <li
                                  key={ans.id}
                                  className={cn(
                                    'rounded-xl border p-4 space-y-2.5',
                                    ans.isHelpfulAccepted
                                      ? 'border-[var(--status-success)]/50 bg-[var(--status-success-soft)]/30'
                                      : 'border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/40',
                                  )}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-xs">
                                      <span className="font-semibold text-[var(--text-primary)]">
                                        {ans.authorName}
                                      </span>{' '}
                                      <span className="text-[var(--text-muted)]">
                                        ({ans.authorRoleLabel}) •{' '}
                                        {formatRelativeTimeVi(ans.createdAt)}
                                      </span>
                                    </div>
                                    {ans.isHelpfulAccepted && (
                                      <Badge
                                        variant="success"
                                        icon={
                                          <CheckCircle2
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                          />
                                        }
                                      >
                                        Giải pháp hữu ích
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                                    {ans.content}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <Button
                                      size="sm"
                                      variant={
                                        ans.userUpvoted ? 'primary' : 'outline'
                                      }
                                      aria-pressed={Boolean(ans.userUpvoted)}
                                      onClick={() =>
                                        toggleUpvoteAnswer(
                                          activeQuestion.id,
                                          ans.id,
                                        )
                                      }
                                      leftIcon={
                                        <ArrowBigUp
                                          className="h-4 w-4"
                                          aria-hidden="true"
                                        />
                                      }
                                    >
                                      <span className="tabular-nums">
                                        Hữu ích ({ans.votes})
                                      </span>
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant={
                                        ans.isHelpfulAccepted
                                          ? 'success'
                                          : 'outline'
                                      }
                                      aria-pressed={Boolean(ans.isHelpfulAccepted)}
                                      onClick={() => {
                                        toggleAcceptAnswer(
                                          activeQuestion.id,
                                          ans.id,
                                        );
                                        showToast(
                                          ans.isHelpfulAccepted
                                            ? 'Đã bỏ chọn giải pháp.'
                                            : 'Đã chọn làm giải pháp hữu ích!',
                                          'success',
                                        );
                                      }}
                                      leftIcon={
                                        <CheckCircle2
                                          className="h-4 w-4"
                                          aria-hidden="true"
                                        />
                                      }
                                    >
                                      {ans.isHelpfulAccepted
                                        ? 'Bỏ chọn giải pháp'
                                        : 'Chọn làm giải pháp'}
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setReportTarget({
                                          targetType: 'answer',
                                          targetId: ans.id,
                                          parentId: activeQuestion.id,
                                          targetPreview: ans.content.slice(0, 90),
                                        })
                                      }
                                      leftIcon={
                                        <Flag
                                          className="h-4 w-4"
                                          aria-hidden="true"
                                        />
                                      }
                                    >
                                      Báo cáo
                                    </Button>
                                  </div>
                                </li>
                              ))}
                          </ul>
                        )}

                        {/* Post New Answer Form */}
                        <form onSubmit={handleSubmitAnswer} className="space-y-2.5 pt-2">
                          <label
                            htmlFor="qa-answer-input"
                            className="block text-sm font-semibold text-[var(--text-primary)]"
                          >
                            Thêm câu trả lời của bạn
                          </label>
                          <textarea
                            id="qa-answer-input"
                            rows={3}
                            required
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Chia sẻ kinh nghiệm, cách xử lý hoặc địa điểm cụ thể..."
                            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                          />
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={!answerText.trim()}
                              leftIcon={
                                <Send className="h-4 w-4" aria-hidden="true" />
                              }
                            >
                              Gửi câu trả lời
                            </Button>
                          </div>
                        </form>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ask New Question Modal with Live Duplicate Suggestions */}
      <Modal
        isOpen={askModalOpen}
        onClose={handleCloseAskModal}
        title="Đặt câu hỏi mới cho cộng đồng"
        description="Hệ thống tự gợi ý các câu hỏi tương tự đã có lời giải khi bạn nhập tiêu đề."
        size="lg"
      >
        <form onSubmit={handleSubmitQuestion} className="space-y-4">
          {/* Live Similar Question Suggestion Box */}
          {similarQuestions.length > 0 && (
            <div
              role="region"
              aria-live="polite"
              aria-label="Câu hỏi tương tự đã có"
              className="rounded-xl border border-[var(--accent-primary)]/40 bg-[var(--accent-primary-soft)]/50 p-3.5 space-y-2.5"
            >
              <p className="text-xs sm:text-sm font-bold text-[var(--accent-primary)] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                Câu hỏi tương tự đã có ({similarQuestions.length}) — xem thử trước khi đăng nhé:
              </p>
              <ul className="space-y-2">
                {similarQuestions.map((sim) => (
                  <li key={sim.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setAskModalOpen(false);
                        setSubTab('qa');
                        setSelectedQuestionId(sim.id);
                        setMobileShowDetail(true);
                      }}
                      className="w-full min-h-[44px] text-left rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 hover:border-[var(--accent-primary)] transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
                          {sim.title}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] tabular-nums">
                          {sim.answers.filter((a) => !a.isHidden).length} câu trả lời •{' '}
                          {sim.votes} hữu ích
                        </p>
                      </div>
                      <Badge variant={sim.resolved ? 'success' : 'warning'}>
                        {sim.resolved ? 'Đã giải quyết' : 'Mở xem'}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="ask-question-title"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Tiêu đề câu hỏi <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id="ask-question-title"
              type="text"
              required
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Ví dụ: Lỡ đăng ký trùng lịch hoặc quên thẻ sinh viên..."
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="ask-question-topic"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Chủ đề
            </label>
            <select
              id="ask-question-topic"
              value={draftTopic}
              onChange={(e) => setDraftTopic(e.target.value as CommunityTopic)}
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {COMMUNITY_TOPIC_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="ask-question-content"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Chi tiết câu hỏi <span className="text-[var(--status-danger)]">*</span>
            </label>
            <textarea
              id="ask-question-content"
              rows={4}
              required
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Mô tả rõ tình huống, mã môn hoặc địa điểm liên quan để mọi người hỗ trợ nhanh hơn..."
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="ask-question-tags"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Thẻ từ khóa (phân cách bằng dấu phẩy, tùy chọn)
            </label>
            <input
              id="ask-question-tags"
              type="text"
              value={draftTags}
              onChange={(e) => setDraftTags(e.target.value)}
              placeholder="VD: đăng ký tín chỉ, trùng lịch"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAskModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Đăng câu hỏi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <ReportContentModal
        target={reportTarget}
        onClose={handleCloseReportModal}
      />
    </section>
  );
}
