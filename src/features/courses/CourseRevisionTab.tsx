import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  RotateCw,
  Square,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { Course, FlashcardMastery } from '../../types/models';
import { cn } from '../../utils/cn';
import { FLASHCARD_MASTERY_LABELS } from './courseConstants';

interface CourseRevisionTabProps {
  course: Course;
}

type FlashcardFilter = 'all' | 'review';

export function CourseRevisionTab({ course }: CourseRevisionTabProps) {
  const {
    state,
    addCourseChecklistItem,
    toggleCourseChecklistItem,
    deleteCourseChecklistItem,
    addFlashcard,
    updateFlashcardMastery,
    deleteFlashcard,
  } = useAppStore();
  const { showToast } = useToast();
  const formId = useId();

  // Checklist state
  const [chkTitle, setChkTitle] = useState('');
  const [chkWeek, setChkWeek] = useState('');
  const [chkError, setChkError] = useState('');

  // Flashcard state
  const [cardFilter, setCardFilter] = useState<FlashcardFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [cardError, setCardError] = useState('');

  const checklistItems = useMemo(
    () => state.courseChecklists.filter((item) => item.courseId === course.id),
    [state.courseChecklists, course.id],
  );
  const doneChecklistCount = checklistItems.filter((i) => i.completed).length;

  const allCards = useMemo(
    () => state.flashcards.filter((f) => f.courseId === course.id),
    [state.flashcards, course.id],
  );
  const reviewCards = useMemo(
    () => allCards.filter((f) => f.mastery !== 'mastered'),
    [allCards],
  );
  const visibleCards = cardFilter === 'review' ? reviewCards : allCards;

  useEffect(() => {
    setCurrentIndex((prev) => {
      if (visibleCards.length === 0) return 0;
      return Math.min(prev, visibleCards.length - 1);
    });
    setIsFlipped(false);
  }, [visibleCards.length, cardFilter]);

  const activeCard = visibleCards[currentIndex] ?? null;

  const reduceMotionActive =
    state.settings.reduceMotion === 'reduce' ||
    (typeof document !== 'undefined' &&
      document.documentElement.classList.contains('reduce-motion'));

  const handleAddChecklist = (e: FormEvent) => {
    e.preventDefault();
    if (!chkTitle.trim()) {
      setChkError('Vui lòng nhập nội dung cần ôn tập.');
      return;
    }
    addCourseChecklistItem({
      courseId: course.id,
      title: chkTitle.trim(),
      weekLabel: chkWeek.trim() || undefined,
      completed: false,
    });
    setChkTitle('');
    setChkWeek('');
    setChkError('');
    showToast('Đã thêm mục vào checklist ôn tập', 'success');
  };

  const handleAddFlashcard = (e: FormEvent) => {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) {
      setCardError('Vui lòng nhập đầy đủ cả mặt trước (câu hỏi) và mặt sau (đáp án).');
      return;
    }
    addFlashcard({
      courseId: course.id,
      front: frontText.trim(),
      back: backText.trim(),
      mastery: 'new',
    });
    setFrontText('');
    setBackText('');
    setCardError('');
    setShowAddCard(false);
    setCardFilter('all');
    setCurrentIndex(allCards.length);
    setIsFlipped(false);
    showToast('Đã tạo thẻ ghi nhớ mới', 'success');
  };

  const goPrev = () => {
    if (visibleCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + visibleCards.length) % visibleCards.length,
    );
  };

  const goNext = () => {
    if (visibleCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % visibleCards.length);
  };

  const handleMasteryChange = (mastery: FlashcardMastery) => {
    if (!activeCard) return;
    updateFlashcardMastery(activeCard.id, mastery);
    showToast(
      `Đã đánh dấu thẻ: ${FLASHCARD_MASTERY_LABELS[mastery].label}`,
      'info',
    );
  };

  const handleDeleteActiveCard = () => {
    if (!activeCard) return;
    deleteFlashcard(activeCard.id);
    setIsFlipped(false);
    showToast('Đã xóa thẻ ghi nhớ', 'info');
  };

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Checklist ôn tập */}
      <div className="lg:col-span-5 min-w-0">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Checklist ôn tập</CardTitle>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                Đã hoàn thành {doneChecklistCount}/{checklistItems.length} mục
              </p>
            </div>
            <Badge
              variant={
                checklistItems.length > 0 &&
                doneChecklistCount === checklistItems.length
                  ? 'success'
                  : 'default'
              }
            >
              {checklistItems.length === 0
                ? '0%'
                : `${Math.round((doneChecklistCount / checklistItems.length) * 100)}%`}
            </Badge>
          </CardHeader>

          <CardBody className="space-y-4">
            <form onSubmit={handleAddChecklist} noValidate className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={chkTitle}
                  onChange={(e) => setChkTitle(e.target.value)}
                  placeholder="Nội dung cần ôn tập..."
                  aria-label="Nội dung mục checklist mới"
                  className={cn(inputClass, 'sm:col-span-2')}
                />
                <input
                  type="text"
                  value={chkWeek}
                  onChange={(e) => setChkWeek(e.target.value)}
                  placeholder="Tuần / Chương"
                  aria-label="Nhãn tuần hoặc chương"
                  className={inputClass}
                />
              </div>
              {chkError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-[var(--status-danger)]"
                >
                  {chkError}
                </p>
              )}
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                leftIcon={<Plus className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Thêm mục ôn tập
              </Button>
            </form>

            {checklistItems.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">
                Chưa có mục checklist nào. Hãy liệt kê các phần cần ôn trước khi kiểm tra.
              </p>
            ) : (
              <ul className="space-y-2">
                {checklistItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/40 p-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCourseChecklistItem(item.id)}
                      aria-label={
                        item.completed
                          ? `Bỏ đánh dấu: ${item.title}`
                          : `Đánh dấu hoàn thành: ${item.title}`
                      }
                      className="min-h-[44px] min-w-[44px] -m-1.5 inline-flex items-center justify-center rounded-lg text-[var(--accent-primary)] hover:bg-[var(--bg-surface)] cursor-pointer shrink-0"
                    >
                      {item.completed ? (
                        <CheckSquare
                          className="h-5 w-5 text-[var(--status-success)]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 pt-1">
                      <p
                        className={cn(
                          'text-sm break-words',
                          item.completed
                            ? 'line-through text-[var(--text-muted)]'
                            : 'text-[var(--text-primary)]',
                        )}
                      >
                        {item.title}
                      </p>
                      {item.weekLabel && (
                        <span className="inline-block mt-1 text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded px-1.5 py-0.5">
                          {item.weekLabel}
                        </span>
                      )}
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Xóa mục checklist ${item.title}`}
                      onClick={() => deleteCourseChecklistItem(item.id)}
                      className="text-[var(--text-muted)] hover:text-[var(--status-danger)]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Flashcards */}
      <div className="lg:col-span-7 min-w-0 space-y-4">
        <Card>
          <CardHeader className="flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Layers
                className="h-5 w-5 text-[var(--accent-primary)] shrink-0"
                aria-hidden="true"
              />
              <div>
                <CardTitle>Thẻ ghi nhớ (Flashcards)</CardTitle>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                  Tổng {allCards.length} thẻ • {reviewCards.length} thẻ cần ôn lại
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="Lọc thẻ ghi nhớ"
                className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setCardFilter('all')}
                  aria-pressed={cardFilter === 'all'}
                  className={cn(
                    'min-h-[44px] px-3 rounded-md text-xs font-medium cursor-pointer transition-colors',
                    cardFilter === 'all'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  Tất cả ({allCards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCardFilter('review')}
                  aria-pressed={cardFilter === 'review'}
                  className={cn(
                    'min-h-[44px] px-3 rounded-md text-xs font-medium cursor-pointer transition-colors',
                    cardFilter === 'review'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  Cần ôn lại ({reviewCards.length})
                </button>
              </div>

              <Button
                size="sm"
                variant={showAddCard ? 'secondary' : 'primary'}
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setShowAddCard((prev) => !prev);
                  setCardError('');
                }}
              >
                {showAddCard ? 'Đóng biểu mẫu' : 'Thêm thẻ'}
              </Button>
            </div>
          </CardHeader>

          <CardBody className="space-y-4">
            {showAddCard && (
              <form
                onSubmit={handleAddFlashcard}
                noValidate
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-subtle)]/70 p-4 space-y-3"
              >
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Tạo thẻ ghi nhớ mới
                </h4>
                <div>
                  <label
                    htmlFor={`${formId}-front`}
                    className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Mặt trước (Câu hỏi / Khái niệm){' '}
                    <span className="text-[var(--status-danger)]">*</span>
                  </label>
                  <textarea
                    id={`${formId}-front`}
                    rows={2}
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    placeholder="Ví dụ: Độ phức tạp của thuật toán tìm kiếm nhị phân?"
                    className={cn(inputClass, 'min-h-[68px] py-2')}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${formId}-back`}
                    className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Mặt sau (Đáp án / Giải thích){' '}
                    <span className="text-[var(--status-danger)]">*</span>
                  </label>
                  <textarea
                    id={`${formId}-back`}
                    rows={2}
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    placeholder="Ví dụ: O(log n) trên mảng đã sắp xếp."
                    className={cn(inputClass, 'min-h-[68px] py-2')}
                  />
                </div>

                {cardError && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-[var(--status-danger)]"
                  >
                    {cardError}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddCard(false)}
                  >
                    Hủy
                  </Button>
                  <Button size="sm" type="submit" variant="primary">
                    Lưu thẻ ghi nhớ
                  </Button>
                </div>
              </form>
            )}

            {!activeCard ? (
              <EmptyState
                title={
                  cardFilter === 'review' && allCards.length > 0
                    ? 'Tuyệt vời! Bạn đã thuộc hết các thẻ hiện có'
                    : 'Chưa có thẻ ghi nhớ nào cho môn này'
                }
                description={
                  cardFilter === 'review' && allCards.length > 0
                    ? 'Chuyển sang bộ lọc "Tất cả" để ôn lại toàn bộ bộ thẻ.'
                    : 'Tạo các thẻ câu hỏi - đáp án ngắn gọn để áp dụng phương pháp gợi nhớ chủ động.'
                }
                actionLabel={
                  cardFilter === 'review' && allCards.length > 0
                    ? 'Xem tất cả thẻ'
                    : 'Tạo thẻ đầu tiên'
                }
                onAction={
                  cardFilter === 'review' && allCards.length > 0
                    ? () => setCardFilter('all')
                    : () => setShowAddCard(true)
                }
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
                      Thẻ {currentIndex + 1} / {visibleCards.length}
                    </span>
                    <Badge
                      variant={
                        FLASHCARD_MASTERY_LABELS[activeCard.mastery].variant
                      }
                    >
                      {FLASHCARD_MASTERY_LABELS[activeCard.mastery].label}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    onClick={handleDeleteActiveCard}
                    className="text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)]"
                  >
                    Xóa thẻ này
                  </Button>
                </div>

                {/* Accessible Flashcard Flip Surface */}
                <button
                  type="button"
                  aria-pressed={isFlipped}
                  aria-label={
                    isFlipped
                      ? `Mặt sau đáp án: ${activeCard.back}. Nhấn để lật lại câu hỏi.`
                      : `Mặt trước câu hỏi: ${activeCard.front}. Nhấn để xem đáp án.`
                  }
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className={cn(
                    'w-full min-h-[210px] rounded-2xl border-2 p-6 text-left flex flex-col justify-between gap-4 cursor-pointer',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]',
                    !reduceMotionActive && 'transition-colors duration-200',
                    isFlipped
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]/50'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface-subtle)]/50 hover:border-[var(--accent-primary)]/60',
                  )}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-xs font-semibold text-[var(--accent-primary)]">
                      {isFlipped
                        ? 'Mặt sau — Đáp án / Giải thích'
                        : 'Mặt trước — Câu hỏi gợi nhớ'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                      {isFlipped ? 'Xem câu hỏi' : 'Lật xem đáp án'}
                    </span>
                  </div>

                  <div className="py-2">
                    <p className="text-base sm:text-lg font-medium text-[var(--text-primary)] leading-relaxed break-words">
                      {isFlipped ? activeCard.back : activeCard.front}
                    </p>
                  </div>

                  <span className="text-xs text-[var(--text-muted)]">
                    Nhấn chuột hoặc phím Enter / Space để lật thẻ
                  </span>
                </button>

                {/* Deck Navigation & Mastery Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={goPrev}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Thẻ trước
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsFlipped((prev) => !prev)}
                      leftIcon={<RotateCw className="h-4 w-4" />}
                    >
                      Lật thẻ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={goNext}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Thẻ tiếp
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={
                        activeCard.mastery === 'learning' ? 'secondary' : 'outline'
                      }
                      onClick={() => handleMasteryChange('learning')}
                    >
                      Đánh dấu cần ôn
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        activeCard.mastery === 'mastered' ? 'success' : 'primary'
                      }
                      onClick={() => handleMasteryChange('mastered')}
                    >
                      Đã thuộc
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
