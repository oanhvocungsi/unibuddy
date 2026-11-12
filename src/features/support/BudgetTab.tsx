import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Plus,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  EmptyState,
  Modal,
  SampleDataBadge,
  useToast,
} from '../../components/ui';
import { EXPENSE_CATEGORY_LABELS } from '../../data/lifeAndSupportData';
import { useAppStore } from '../../store/appStore';
import type { ExpenseCategory } from '../../types/models';
import {
  formatCurrencyVND,
  formatFullDateVi,
  todayKey,
} from '../../utils/dateUtils';

const ALL_CATEGORIES = Object.keys(
  EXPENSE_CATEGORY_LABELS,
) as ExpenseCategory[];

export function BudgetTab() {
  const { state, addExpense, deleteExpense, updateBudgetLimit } = useAppStore();
  const { showToast } = useToast();

  const currentMonthPrefix = useMemo(() => {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${m}`;
  }, []);

  const currentMonthDisplay = useMemo(() => {
    const [y, m] = currentMonthPrefix.split('-');
    return `Tháng ${m}/${y}`;
  }, [currentMonthPrefix]);

  // Form state
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(() => todayKey());
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>(
    'all',
  );
  const [filterCategory, setFilterCategory] = useState<
    ExpenseCategory | 'all'
  >('all');

  // Limit editor modal
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [draftLimits, setDraftLimits] = useState<Record<ExpenseCategory, string>>(
    () => {
      const initial = {} as Record<ExpenseCategory, string>;
      for (const cat of ALL_CATEGORIES) {
        const found = state.budgetLimits.find((b) => b.category === cat);
        initial[cat] = String(found?.monthlyLimit ?? 0);
      }
      return initial;
    },
  );
  const [limitError, setLimitError] = useState('');

  const openLimitModal = () => {
    const next = {} as Record<ExpenseCategory, string>;
    for (const cat of ALL_CATEGORIES) {
      const found = state.budgetLimits.find((b) => b.category === cat);
      next[cat] = String(found?.monthlyLimit ?? 0);
    }
    setDraftLimits(next);
    setLimitError('');
    setLimitModalOpen(true);
  };

  const monthlyTotals = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = {} as Record<ExpenseCategory, number>;
    for (const cat of ALL_CATEGORIES) byCategory[cat] = 0;

    for (const item of state.expenses) {
      if (!item.date.startsWith(currentMonthPrefix)) continue;
      if (item.amount < 0) {
        totalIncome += Math.abs(item.amount);
      } else {
        totalExpense += item.amount;
        byCategory[item.category] = (byCategory[item.category] ?? 0) + item.amount;
      }
    }

    const totalBudgetLimit = state.budgetLimits.reduce(
      (sum, item) => sum + item.monthlyLimit,
      0,
    );
    const remainingBudget = totalBudgetLimit - totalExpense;

    return {
      totalIncome,
      totalExpense,
      totalBudgetLimit,
      remainingBudget,
      byCategory,
    };
  }, [state.expenses, state.budgetLimits, currentMonthPrefix]);

  const categoryBreakdown = useMemo(() => {
    return ALL_CATEGORIES.map((cat) => {
      const spent = monthlyTotals.byCategory[cat] ?? 0;
      const limit =
        state.budgetLimits.find((b) => b.category === cat)?.monthlyLimit ?? 0;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const status: 'over' | 'near' | 'ok' =
        limit > 0 && spent > limit
          ? 'over'
          : limit > 0 && spent >= limit * 0.8
            ? 'near'
            : 'ok';
      return {
        category: cat,
        label: EXPENSE_CATEGORY_LABELS[cat],
        spent,
        limit,
        percent,
        status,
      };
    });
  }, [monthlyTotals.byCategory, state.budgetLimits]);

  const alertedCategories = useMemo(
    () => categoryBreakdown.filter((c) => c.status !== 'ok'),
    [categoryBreakdown],
  );

  const filteredEntries = useMemo(() => {
    return [...state.expenses]
      .filter((item) => {
        if (filterType === 'expense' && item.amount < 0) return false;
        if (filterType === 'income' && item.amount >= 0) return false;
        if (filterCategory !== 'all' && item.category !== filterCategory)
          return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.expenses, filterType, filterCategory]);

  const handleAddEntry = (e: FormEvent) => {
    e.preventDefault();
    const numeric = Number(amountInput.replace(/[^\d.-]/g, ''));
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên khoản thu hoặc chi.');
      return;
    }
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setFormError('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }
    if (!date) {
      setFormError('Vui lòng chọn ngày ghi nhận.');
      return;
    }

    setFormError('');
    const signedAmount =
      entryType === 'income' ? -Math.abs(numeric) : Math.abs(numeric);
    const cleanNote = note.trim();

    addExpense({
      title: title.trim(),
      category: entryType === 'income' ? 'other' : category,
      amount: signedAmount,
      date,
      note:
        entryType === 'income'
          ? cleanNote
            ? `[Thu nhập] ${cleanNote}`
            : '[Thu nhập]'
          : cleanNote || undefined,
    });

    setTitle('');
    setAmountInput('');
    setNote('');
    showToast(
      entryType === 'income'
        ? 'Đã thêm khoản thu mới'
        : 'Đã ghi nhận khoản chi mới',
      'success',
    );
  };

  const handleSaveLimits = (e: FormEvent) => {
    e.preventDefault();
    for (const cat of ALL_CATEGORIES) {
      const val = Number(draftLimits[cat]);
      if (!Number.isFinite(val) || val < 0) {
        setLimitError(
          `Hạn mức cho "${EXPENSE_CATEGORY_LABELS[cat]}" phải là số từ 0 trở lên.`,
        );
        return;
      }
    }
    for (const cat of ALL_CATEGORIES) {
      updateBudgetLimit(cat, Math.round(Number(draftLimits[cat])));
    }
    setLimitModalOpen(false);
    showToast('Đã cập nhật hạn mức ngân sách tháng', 'success');
  };

  const maxBarValue = Math.max(
    1,
    ...categoryBreakdown.map((c) => Math.max(c.spent, c.limit)),
  );

  return (
    <div className="space-y-6">
      {/* Manual tracking note */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
            <Banknote className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Quản lý thu chi thủ công — không yêu cầu kết nối tài khoản ngân hàng.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Số liệu mẫu minh họa giúp tân sinh viên ước lượng chi tiêu sinh hoạt{' '}
              {currentMonthDisplay}. Mọi khoản bạn tự ghi chỉ lưu trên thiết bị.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={openLimitModal}
        >
          Chỉnh hạn mức tháng
        </Button>
      </div>

      {/* Summary Cards */}
      <section aria-labelledby="budget-overview-heading" className="space-y-3">
        <h2
          id="budget-overview-heading"
          className="text-lg font-semibold text-[var(--text-primary)]"
        >
          Tổng quan thu chi &amp; Ngân sách {currentMonthDisplay}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padded>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Tổng thu ({currentMonthDisplay})
            </span>
            <TrendingUp
              className="h-4 w-4 text-[var(--status-success)]"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {formatCurrencyVND(monthlyTotals.totalIncome)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Trợ cấp, học bổng hoặc thu nhập tự ghi
          </p>
        </Card>

        <Card padded>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Tổng chi tháng ({currentMonthDisplay})
            </span>
            <TrendingDown
              className="h-4 w-4 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {formatCurrencyVND(monthlyTotals.totalExpense)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)] tabular-nums">
            Trên tổng hạn mức {formatCurrencyVND(monthlyTotals.totalBudgetLimit)}
          </p>
        </Card>

        <Card padded>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Ngân sách còn lại
            </span>
            <Wallet
              className={`h-4 w-4 ${
                monthlyTotals.remainingBudget < 0
                  ? 'text-[var(--status-danger)]'
                  : 'text-[var(--status-success)]'
              }`}
              aria-hidden="true"
            />
          </div>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${
              monthlyTotals.remainingBudget < 0
                ? 'text-[var(--status-danger)]'
                : 'text-[var(--text-primary)]'
            }`}
          >
            {formatCurrencyVND(monthlyTotals.remainingBudget)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {monthlyTotals.remainingBudget < 0
              ? 'Tổng chi đã vượt tổng hạn mức tháng'
              : 'Mức an toàn còn lại trong tháng'}
          </p>
        </Card>
        </div>
      </section>

      {/* Budget Limit Warnings */}
      {alertedCategories.length > 0 && (
        <div
          role="alert"
          aria-label="Cảnh báo ngân sách theo danh mục"
          className="rounded-xl border border-[var(--status-warning)]/45 bg-[var(--status-warning-soft)]/35 p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5 text-[var(--status-warning)] shrink-0"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Cảnh báo ngân sách ({alertedCategories.length} nhóm cần chú ý)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {alertedCategories.map((item) => {
              const isOver = item.status === 'over';
              return (
                <div
                  key={item.category}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                    isOver
                      ? 'border-[var(--status-danger)]/40 bg-[var(--status-danger-soft)]/60'
                      : 'border-[var(--status-warning)]/40 bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={isOver ? 'danger' : 'warning'}
                        icon={
                          isOver ? (
                            <AlertCircle className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )
                        }
                      >
                        {isOver
                          ? `Vượt ngân sách (${item.percent}%)`
                          : `Gần chạm hạn mức (${item.percent}%)`}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                      Đã chi {formatCurrencyVND(item.spent)} / Hạn mức{' '}
                      {formatCurrencyVND(item.limit)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown SVG + Add Entry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Category SVG Breakdown */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                Phân bổ chi tiêu theo nhóm ({currentMonthDisplay})
              </h2>
              <CardDescription>
                So sánh mức đã chi với hạn mức đặt ra của từng hạng mục.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <svg
              viewBox={`0 0 560 ${categoryBreakdown.length * 46 + 16}`}
              className="w-full h-auto"
              role="img"
              aria-label="Biểu đồ thanh ngang chi tiêu tháng theo từng danh mục so với hạn mức"
            >
              {categoryBreakdown.map((item, index) => {
                const y = 12 + index * 46;
                const trackX = 185;
                const trackW = 285;
                const limitW = Math.max(
                  4,
                  Math.round((item.limit / maxBarValue) * trackW),
                );
                const spentW = Math.min(
                  trackW,
                  Math.round((item.spent / maxBarValue) * trackW),
                );
                const fill =
                  item.status === 'over'
                    ? 'var(--status-danger)'
                    : item.status === 'near'
                      ? 'var(--status-warning)'
                      : 'var(--accent-primary)';

                return (
                  <g key={item.category}>
                    <text
                      x={4}
                      y={y + 18}
                      fontSize="12"
                      fontWeight="500"
                      fill="var(--text-primary)"
                    >
                      {item.label.length > 25
                        ? `${item.label.slice(0, 24)}…`
                        : item.label}
                    </text>
                    {/* Limit track */}
                    <rect
                      x={trackX}
                      y={y + 6}
                      width={limitW}
                      height={16}
                      rx={5}
                      fill="var(--bg-surface-subtle)"
                      stroke="var(--border-strong)"
                      strokeWidth="1"
                    />
                    {/* Spent bar */}
                    <rect
                      x={trackX}
                      y={y + 6}
                      width={spentW}
                      height={16}
                      rx={5}
                      fill={fill}
                    />
                    <text
                      x={480}
                      y={y + 18}
                      fontSize="11.5"
                      fontWeight="600"
                      fill="var(--text-secondary)"
                    >
                      {item.percent}%
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Accessible text breakdown with status badges */}
            <ul className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)] pt-2">
              {categoryBreakdown.map((item) => (
                <li
                  key={item.category}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.status === 'over' ? (
                      <AlertCircle
                        className="h-4 w-4 text-[var(--status-danger)] shrink-0"
                        aria-hidden="true"
                      />
                    ) : item.status === 'near' ? (
                      <AlertTriangle
                        className="h-4 w-4 text-[var(--status-warning)] shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckCircle2
                        className="h-4 w-4 text-[var(--status-success)] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-medium text-[var(--text-primary)] truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums text-xs sm:text-sm">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatCurrencyVND(item.spent)}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      / {formatCurrencyVND(item.limit)}
                    </span>
                    {item.status === 'over' && (
                      <Badge variant="danger">Vượt {item.percent}%</Badge>
                    )}
                    {item.status === 'near' && (
                      <Badge variant="warning">Đạt {item.percent}%</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Add Income/Expense Form */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                Ghi nhận thu / chi mới
              </h2>
              <CardDescription>
                Nhập thủ công để theo dõi chi tiêu hằng ngày.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAddEntry} className="space-y-3.5" noValidate>
              <div>
                <span className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Loại giao dịch
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType('expense')}
                    aria-pressed={entryType === 'expense'}
                    className={`min-h-[44px] rounded-lg border px-3 text-sm font-medium cursor-pointer transition-colors ${
                      entryType === 'expense'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Khoản chi
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('income')}
                    aria-pressed={entryType === 'income'}
                    className={`min-h-[44px] rounded-lg border px-3 text-sm font-medium cursor-pointer transition-colors ${
                      entryType === 'income'
                        ? 'border-[var(--status-success)] bg-[var(--status-success-soft)] text-[var(--status-success)]'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Khoản thu
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="exp-title"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Tên khoản {entryType === 'income' ? 'thu' : 'chi'} *
                </label>
                <input
                  id="exp-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    entryType === 'income'
                      ? 'Ví dụ: Gia đình gửi tiền sinh hoạt tháng'
                      : 'Ví dụ: Mua giáo trình & in đề cương'
                  }
                  className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="exp-amount"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Số tiền (VND) *
                  </label>
                  <input
                    id="exp-amount"
                    type="number"
                    min={1000}
                    step={1000}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="150000"
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="exp-date"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Ngày *
                  </label>
                  <input
                    id="exp-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {entryType === 'expense' && (
                <div>
                  <label
                    htmlFor="exp-category"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Danh mục chi tiêu
                  </label>
                  <select
                    id="exp-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ExpenseCategory)
                    }
                    className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {EXPENSE_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="exp-note"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Ghi chú (tùy chọn)
                </label>
                <input
                  id="exp-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú ngắn gọn..."
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
                {entryType === 'income' ? 'Thêm khoản thu' : 'Thêm khoản chi'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex-col sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              Lịch sử thu chi
            </h2>
            <CardDescription>
              Danh sách các khoản bạn đã ghi nhận và dữ liệu mẫu minh họa.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Lọc theo loại thu chi"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | 'expense' | 'income')
              }
              className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)]"
            >
              <option value="all">Tất cả giao dịch</option>
              <option value="expense">Chỉ khoản chi</option>
              <option value="income">Chỉ khoản thu</option>
            </select>
            <select
              aria-label="Lọc theo danh mục chi tiêu"
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value as ExpenseCategory | 'all')
              }
              className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)]"
            >
              <option value="all">Mọi danh mục</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardBody>
          {filteredEntries.length === 0 ? (
            <EmptyState
              title="Chưa có giao dịch phù hợp"
              description="Thử thay đổi bộ lọc hoặc ghi nhận một khoản thu/chi mới ở biểu mẫu phía trên."
            />
          ) : (
            <ul className="divide-y divide-[var(--border-hairline)]">
              {filteredEntries.map((entry) => {
                const isIncome = entry.amount < 0;
                return (
                  <li
                    key={entry.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {entry.title}
                        </span>
                        {isIncome ? (
                          <Badge variant="success">Khoản thu</Badge>
                        ) : (
                          <Badge variant="default">
                            {EXPENSE_CATEGORY_LABELS[entry.category]}
                          </Badge>
                        )}
                        {entry.isSample && (
                          <SampleDataBadge label="Mẫu minh họa" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatFullDateVi(entry.date)}
                        {entry.note ? ` • ${entry.note}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          isIncome
                            ? 'text-[var(--status-success)]'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrencyVND(Math.abs(entry.amount))}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Xóa ${entry.title}`}
                        onClick={() => {
                          deleteExpense(entry.id);
                          showToast('Đã xóa giao dịch khỏi danh sách', 'info');
                        }}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                      >
                        Xóa
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Budget Limit Modal */}
      <Modal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        title="Điều chỉnh hạn mức ngân sách tháng"
        description="Hệ thống sẽ cảnh báo khi mức chi chạm từ 80% trở lên hoặc vượt quá hạn mức."
      >
        <form onSubmit={handleSaveLimits} className="space-y-4">
          <div className="space-y-3">
            {ALL_CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <label
                  htmlFor={`limit-${cat}`}
                  className="text-sm font-medium text-[var(--text-primary)]"
                >
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </label>
                <input
                  id={`limit-${cat}`}
                  type="number"
                  min={0}
                  step={50000}
                  value={draftLimits[cat]}
                  onChange={(e) =>
                    setDraftLimits((prev) => ({
                      ...prev,
                      [cat]: e.target.value,
                    }))
                  }
                  className="w-full sm:w-44 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] tabular-nums"
                />
              </div>
            ))}
          </div>
          {limitError && (
            <p
              role="alert"
              className="text-sm font-medium text-[var(--status-danger)]"
            >
              {limitError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLimitModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu hạn mức</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
