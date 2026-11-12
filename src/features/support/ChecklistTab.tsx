import { useMemo, useState, type FormEvent } from 'react';
import {
  CheckSquare,
  Home,
  Lightbulb,
  Plus,
  Square,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  EmptyState,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { LIFE_CHECKLIST_CATEGORY_LABELS } from '../../data/lifeAndSupportData';
import { useAppStore } from '../../store/appStore';
import type { LifeChecklistCategory } from '../../types/models';

const CHECKLIST_CATEGORIES = Object.keys(
  LIFE_CHECKLIST_CATEGORY_LABELS,
) as LifeChecklistCategory[];

export function ChecklistTab() {
  const { state, toggleLifeChecklistItem, addLifeChecklistItem } =
    useAppStore();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<
    LifeChecklistCategory | 'all'
  >('all');
  const [title, setTitle] = useState('');
  const [category, setCategory] =
    useState<LifeChecklistCategory>('semester_prep');
  const [description, setDescription] = useState('');
  const [tip, setTip] = useState('');
  const [formError, setFormError] = useState('');

  const stats = useMemo(() => {
    const total = state.lifeChecklist.length;
    const completed = state.lifeChecklist.filter((i) => i.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [state.lifeChecklist]);

  const filteredItems = useMemo(() => {
    return state.lifeChecklist.filter(
      (item) => selectedCategory === 'all' || item.category === selectedCategory,
    );
  }, [state.lifeChecklist, selectedCategory]);

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề việc cần chuẩn bị.');
      return;
    }
    setFormError('');
    addLifeChecklistItem({
      title: title.trim(),
      category,
      description:
        description.trim() || 'Mục chuẩn bị cá nhân do bạn tự thêm.',
      tip: tip.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setTip('');
    showToast('Đã thêm mục mới vào checklist đời sống', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Progress & Dormitory Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7" padded>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Tiến độ chuẩn bị học kỳ đầu
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Đánh dấu các đầu việc quan trọng để nhập học tự tin và đỡ thiếu
                sót.
              </p>
            </div>
            <Badge variant="primary" className="tabular-nums">
              {stats.completed}/{stats.total} mục ({stats.percent}%)
            </Badge>
          </div>
          <div
            className="h-3 w-full rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden"
            role="progressbar"
            aria-valuenow={stats.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến độ hoàn thành checklist chuẩn bị năm nhất"
          >
            <div
              className="h-full rounded-full bg-[var(--status-success)] transition-all"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </Card>

        <Card className="lg:col-span-5" padded>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
              <Home className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Gợi ý KTX & Nhà trọ
                </h2>
                <SampleDataBadge label="Minh họa" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Khi mới nhận phòng KTX hoặc trọ gần trường, hãy chụp ảnh hiện
                trạng thiết bị ngày nhận phòng, hỏi rõ giờ đóng cổng, chi phí
                điện nước và thử đi tuyến xe buýt tới giảng đường trước ngày khai
                giảng.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category filter pills */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Lọc checklist theo nhóm"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`min-h-[44px] rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
          }`}
        >
          Tất cả ({state.lifeChecklist.length})
        </button>
        {CHECKLIST_CATEGORIES.map((cat) => {
          const count = state.lifeChecklist.filter(
            (i) => i.category === cat,
          ).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
              }`}
            >
              {LIFE_CHECKLIST_CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Checklist items */}
        <div className="lg:col-span-7 space-y-3">
          {filteredItems.length === 0 ? (
            <EmptyState
              title="Chưa có mục nào trong nhóm này"
              description="Bạn có thể thêm mục chuẩn bị riêng bằng biểu mẫu bên cạnh."
            />
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} interactive>
                <CardBody className="pt-4 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleLifeChecklistItem(item.id)}
                    aria-pressed={item.completed}
                    aria-label={`${
                      item.completed ? 'Bỏ đánh dấu' : 'Đánh dấu hoàn thành'
                    }: ${item.title}`}
                    className={`min-h-[44px] min-w-[44px] -ml-1 inline-flex items-center justify-center rounded-lg cursor-pointer shrink-0 transition-colors ${
                      item.completed
                        ? 'text-[var(--status-success)] hover:bg-[var(--status-success-soft)]/50'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {item.completed ? (
                      <CheckSquare className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Square className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default">
                        {LIFE_CHECKLIST_CATEGORY_LABELS[item.category]}
                      </Badge>
                      {item.isSample && (
                        <SampleDataBadge label="Gợi ý minh họa" />
                      )}
                    </div>
                    <h3
                      className={`text-sm sm:text-base font-semibold ${
                        item.completed
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                    {item.tip && (
                      <div className="flex items-start gap-2 rounded-lg bg-[var(--bg-surface-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                        <Lightbulb
                          className="h-4 w-4 text-[var(--status-warning)] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>Mẹo: {item.tip}</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Add personal checklist item */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                Thêm mục chuẩn bị cá nhân
              </h2>
              <CardDescription>
                Bổ sung vật dụng hoặc đầu việc riêng cho kế hoạch nhập học của
                bạn.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAddItem} className="space-y-3.5" noValidate>
              <div>
                <label
                  htmlFor="life-item-title"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Tên việc cần làm / vật dụng *
                </label>
                <input
                  id="life-item-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Làm thẻ thư viện & vé xe buýt"
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div>
                <label
                  htmlFor="life-item-cat"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Nhóm mục
                </label>
                <select
                  id="life-item-cat"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as LifeChecklistCategory)
                  }
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                >
                  {CHECKLIST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {LIFE_CHECKLIST_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="life-item-desc"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Mô tả chi tiết
                </label>
                <textarea
                  id="life-item-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giấy tờ cần mang theo hoặc lưu ý nhỏ..."
                  className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div>
                <label
                  htmlFor="life-item-tip"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Mẹo ghi nhớ (tùy chọn)
                </label>
                <input
                  id="life-item-tip"
                  type="text"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  placeholder="Ví dụ: Đi vào đầu giờ sáng để đỡ chờ"
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {formError && (
                <p
                  role="alert"
                  className="text-sm font-medium text-[var(--status-danger)]"
                >
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Thêm vào checklist
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
