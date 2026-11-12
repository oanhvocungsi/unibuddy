import {
  Fragment,
  useCallback,
  useId,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  FileText,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
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
  Modal,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { Course, CourseNote } from '../../types/models';
import { cn } from '../../utils/cn';
import { formatRelativeTimeVi } from '../../utils/dateUtils';

interface CourseNotesTabProps {
  course: Course;
}

/**
 * Render an toàn nội dung ghi chú hỗ trợ cú pháp markdown đơn giản (tiêu đề, danh sách, **đậm**, `code`).
 */
function renderInlineMarkdown(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="rounded bg-[var(--bg-surface-subtle)] px-1.5 py-0.5 text-xs font-mono text-[var(--accent-primary)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={idx}>{token}</Fragment>;
  });
}

function NoteMarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 text-sm text-[var(--text-secondary)] leading-relaxed break-words">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" aria-hidden="true" />;
        }
        if (line.startsWith('### ')) {
          return (
            <h5
              key={idx}
              className="text-sm font-semibold text-[var(--text-primary)] pt-1"
            >
              {renderInlineMarkdown(line.slice(4))}
            </h5>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h4
              key={idx}
              className="text-base font-semibold text-[var(--text-primary)] pt-1"
            >
              {renderInlineMarkdown(line.slice(3))}
            </h4>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span
                className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] shrink-0"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                {renderInlineMarkdown(line.slice(2))}
              </span>
            </div>
          );
        }
        return <p key={idx}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

export function CourseNotesTab({ course }: CourseNotesTabProps) {
  const { state, addCourseNote, updateCourseNote, deleteCourseNote } =
    useAppStore();
  const { showToast } = useToast();
  const formId = useId();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CourseNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<CourseNote | null>(null);

  const closeDeleteModal = useCallback(() => {
    setDeletingNote(null);
  }, []);

  const [title, setTitle] = useState('');
  const [sessionLabel, setSessionLabel] = useState('Buổi 1');
  const [extraTags, setExtraTags] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [formError, setFormError] = useState('');

  const courseNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.courseNotes
      .filter((n) => n.courseId === course.id)
      .filter((n) => {
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) {
          return a.pinned ? -1 : 1;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [state.courseNotes, course.id, search]);

  const openCreateForm = () => {
    setEditingNote(null);
    setTitle('');
    setSessionLabel('Buổi 1');
    setExtraTags('');
    setContent('');
    setPinned(false);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (note: CourseNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setSessionLabel(note.tags[0] ?? 'Buổi 1');
    setExtraTags(note.tags.slice(1).join(', '));
    setContent(note.content);
    setPinned(Boolean(note.pinned));
    setFormError('');
    setFormOpen(true);
  };

  const handleSaveNote = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề ghi chú.');
      return;
    }
    if (!content.trim()) {
      setFormError('Vui lòng nhập nội dung ghi chú.');
      return;
    }

    const parsedExtra = extraTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const mergedTags = Array.from(
      new Set([sessionLabel.trim() || 'Ghi chú buổi học', ...parsedExtra]),
    );

    if (editingNote) {
      updateCourseNote(editingNote.id, {
        title: title.trim(),
        content: content.trim(),
        tags: mergedTags,
        pinned,
      });
      showToast('Đã cập nhật ghi chú buổi học', 'success');
    } else {
      addCourseNote({
        courseId: course.id,
        title: title.trim(),
        content: content.trim(),
        tags: mergedTags,
        pinned,
      });
      showToast('Đã thêm ghi chú buổi học mới', 'success');
    }

    setFormOpen(false);
    setEditingNote(null);
  };

  const confirmDelete = () => {
    if (!deletingNote) return;
    deleteCourseNote(deletingNote.id);
    setDeletingNote(null);
    showToast('Đã xóa ghi chú buổi học', 'info');
  };

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ghi chú theo buổi, chương, từ khóa..."
            aria-label="Tìm kiếm ghi chú buổi học"
            className={cn(inputClass, 'pl-9')}
          />
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openCreateForm}
        >
          Thêm ghi chú mới
        </Button>
      </div>

      {formOpen && (
        <Card className="border-[var(--accent-primary)]/40">
          <CardHeader>
            <CardTitle>
              {editingNote ? 'Chỉnh sửa ghi chú' : 'Ghi chú buổi học mới'}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveNote} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`${formId}-title`}
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Tiêu đề ghi chú <span className="text-[var(--status-danger)]">*</span>
                  </label>
                  <input
                    id={`${formId}-title`}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Ghi chú bài giảng Vòng lặp & Độ phức tạp"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-session`}
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Buổi / Chương
                  </label>
                  <input
                    id={`${formId}-session`}
                    type="text"
                    value={sessionLabel}
                    onChange={(e) => setSessionLabel(e.target.value)}
                    placeholder="VD: Buổi 3, Chương 2"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-tags`}
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Thẻ phân loại (cách nhau bằng dấu phẩy)
                </label>
                <input
                  id={`${formId}-tags`}
                  type="text"
                  value={extraTags}
                  onChange={(e) => setExtraTags(e.target.value)}
                  placeholder="VD: công thức, giữa kỳ, ví dụ"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-content`}
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Nội dung ghi chú (hỗ trợ `-` danh sách, `**đậm**`, `` `mã` ``){' '}
                  <span className="text-[var(--status-danger)]">*</span>
                </label>
                <textarea
                  id={`${formId}-content`}
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={'- Ý chính trên lớp...\n- Lưu ý khi làm bài tập...'}
                  className={cn(inputClass, 'min-h-[120px] py-2.5')}
                />
              </div>

              <label className="inline-flex items-center gap-2.5 min-h-[44px] cursor-pointer text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent-primary)] rounded"
                />
                <span>Ghim ghi chú này lên đầu danh sách</span>
              </label>

              {formError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-[var(--status-danger)]"
                >
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingNote(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  {editingNote ? 'Lưu thay đổi' : 'Lưu ghi chú'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {courseNotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" aria-hidden="true" />}
          title={
            search.trim()
              ? 'Không tìm thấy ghi chú phù hợp'
              : 'Chưa có ghi chú nào cho môn học này'
          }
          description={
            search.trim()
              ? 'Thử xóa từ khóa tìm kiếm hoặc chọn thẻ khác.'
              : 'Lưu lại tóm tắt theo từng buổi học hoặc chương để ôn tập nhanh trước kỳ thi.'
          }
          actionLabel={search.trim() ? 'Xóa tìm kiếm' : 'Tạo ghi chú đầu tiên'}
          onAction={search.trim() ? () => setSearch('') : openCreateForm}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseNotes.map((note) => (
            <Card key={note.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {note.pinned && (
                      <Badge variant="warning" icon={<Pin className="h-3 w-3" />}>
                        Đã ghim
                      </Badge>
                    )}
                    {note.tags.map((tag, idx) => (
                      <Badge
                        key={`${note.id}-${tag}`}
                        variant={idx === 0 ? 'primary' : 'default'}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="break-words">{note.title}</CardTitle>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={note.pinned ? 'Bỏ ghim ghi chú' : 'Ghim ghi chú'}
                    title={note.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                    onClick={() =>
                      updateCourseNote(note.id, { pinned: !note.pinned })
                    }
                  >
                    {note.pinned ? (
                      <PinOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Pin className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Sửa ghi chú ${note.title}`}
                    title="Chỉnh sửa"
                    onClick={() => openEditForm(note)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Xóa ghi chú ${note.title}`}
                    title="Xóa ghi chú"
                    onClick={() => setDeletingNote(note)}
                    className="text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="flex-1 flex flex-col justify-between gap-4">
                <NoteMarkdownContent content={note.content} />
                <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
                  Cập nhật: {formatRelativeTimeVi(note.updatedAt) || 'Gần đây'}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(deletingNote)}
        onClose={closeDeleteModal}
        size="sm"
        title="Xác nhận xóa ghi chú"
        description={
          deletingNote
            ? `Bạn có chắc muốn xóa ghi chú "${deletingNote.title}"? Hành động này không thể hoàn tác.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={closeDeleteModal}>
              Giữ lại
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Xóa ghi chú
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Nội dung ghi chú sẽ bị xóa khỏi thiết bị của bạn.
        </p>
      </Modal>
    </div>
  );
}
