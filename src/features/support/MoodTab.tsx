import { useMemo, useState, type FormEvent } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Frown,
  Lock,
  Meh,
  Plus,
  Smile,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  EmptyState,
  useToast,
} from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { MoodLevel } from '../../types/models';
import { formatFullDateVi, formatRelativeTimeVi } from '../../utils/dateUtils';

const MOOD_OPTIONS: {
  value: MoodLevel;
  label: string;
  short: string;
  icon: typeof Smile;
}[] = [
  { value: 1, label: 'Rất mệt / Áp lực', short: '1 - Rất mệt', icon: Frown },
  { value: 2, label: 'Hơi chùng xuống', short: '2 - Hơi chùng', icon: Frown },
  { value: 3, label: 'Bình thường', short: '3 - Bình thường', icon: Meh },
  { value: 4, label: 'Khá ổn / Tích cực', short: '4 - Khá ổn', icon: Smile },
  { value: 5, label: 'Rất phấn khởi', short: '5 - Rất tốt', icon: Sparkles },
];

const ENERGY_OPTIONS: {
  value: MoodLevel;
  label: string;
  icon: typeof Battery;
}[] = [
  { value: 1, label: 'Cạn năng lượng', icon: BatteryWarning },
  { value: 2, label: 'Hơi uể oải', icon: BatteryLow },
  { value: 3, label: 'Trung bình', icon: BatteryMedium },
  { value: 4, label: 'Đủ sức học', icon: Battery },
  { value: 5, label: 'Tràn năng lượng', icon: BatteryCharging },
];

const SUGGESTED_TAGS = [
  'Bình tĩnh',
  'Tập trung',
  'Háo hức',
  'Hơi lo lắng',
  'Nhớ nhà',
  'Hơi bận',
  'Kết nối',
  'Mệt mỏi',
  'Chủ động',
];

export function MoodTab() {
  const { state, addMoodCheckIn, deleteMoodCheckIn } = useAppStore();
  const { showToast } = useToast();

  const [mood, setMood] = useState<MoodLevel>(4);
  const [energy, setEnergy] = useState<MoodLevel>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Bình tĩnh']);
  const [customTag, setCustomTag] = useState('');
  const [note, setNote] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleAddCustomTag = () => {
    const clean = customTag.trim();
    if (!clean) return;
    if (!selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
    }
    setCustomTag('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addMoodCheckIn({
      mood,
      energy,
      tags: selectedTags,
      note,
    });
    setNote('');
    showToast('Đã lưu check-in cảm xúc riêng tư trên máy bạn', 'success');
  };

  const recent7 = useMemo(() => {
    return [...state.moodCheckIns].slice(0, 7).reverse();
  }, [state.moodCheckIns]);

  const getMoodMeta = (level: MoodLevel) =>
    MOOD_OPTIONS.find((o) => o.value === level) ?? MOOD_OPTIONS[2];

  const getEnergyMeta = (level: MoodLevel) =>
    ENERGY_OPTIONS.find((o) => o.value === level) ?? ENERGY_OPTIONS[2];

  return (
    <div className="space-y-6">
      {/* Explicit Privacy Lock Banner */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-[var(--accent-primary)]/35 bg-[var(--accent-primary-soft)]/60 p-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
            Không gian riêng tư tuyệt đối
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Hoàn toàn riêng tư — dữ liệu cảm xúc chỉ lưu trên máy bạn và không
            bao giờ hiển thị cho bạn bè hay quản trị viên.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Check-in form */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                Check-in cảm xúc hôm nay
              </h2>
              <CardDescription>
                Dành 30 giây lắng nghe bản thân để nhận diện sớm căng thẳng hoặc
                mệt mỏi.
              </CardDescription>
            </div>
            <Badge variant="primary" icon={<Lock className="h-3 w-3" />}>
              Riêng tư
            </Badge>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mood 1-5 */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-[var(--text-primary)]">
                  Tâm trạng của bạn hiện tại (1–5)
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {MOOD_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = mood === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMood(option.value)}
                        aria-pressed={active}
                        aria-label={`Tâm trạng mức ${option.value}: ${option.label}`}
                        className={`min-h-[56px] flex sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 rounded-xl border px-3 py-2 text-left sm:text-center cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="text-xs leading-tight">
                          {option.short}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Đang chọn: <strong>{getMoodMeta(mood).label}</strong>
                </p>
              </fieldset>

              {/* Energy 1-5 */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-[var(--text-primary)]">
                  Mức năng lượng (1–5)
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {ENERGY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = energy === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setEnergy(option.value)}
                        aria-pressed={active}
                        aria-label={`Năng lượng mức ${option.value}: ${option.label}`}
                        className={`min-h-[56px] flex sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 rounded-xl border px-3 py-2 text-left sm:text-center cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--status-success)] bg-[var(--status-success-soft)] text-[var(--status-success)] font-semibold'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="text-xs leading-tight">
                          {option.value} - {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Emotion tags */}
              <div className="space-y-2">
                <span className="block text-sm font-medium text-[var(--text-primary)]">
                  Từ khóa cảm xúc
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set([...SUGGESTED_TAGS, ...selectedTags])).map(
                    (tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          aria-pressed={active}
                          className={`min-h-[44px] rounded-full px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                            active
                              ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]'
                              : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    },
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="Thêm từ khóa riêng..."
                    aria-label="Thêm từ khóa cảm xúc riêng"
                    className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomTag}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Thêm thẻ
                  </Button>
                </div>
              </div>

              {/* Optional note */}
              <div>
                <label
                  htmlFor="mood-private-note"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                >
                  Ghi chú riêng tư (tùy chọn)
                </label>
                <textarea
                  id="mood-private-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Hôm nay có điều gì khiến bạn vui, bận tâm hoặc muốn tự nhắn nhủ?"
                  className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              <Button type="submit" className="w-full">
                Lưu check-in riêng tư
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Trend & History */}
        <div className="lg:col-span-6 space-y-5">
          {/* 7-entry visual trend */}
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Xu hướng 7 lần check-in gần nhất
                </h2>
                <CardDescription>
                  So sánh nhanh nhịp Tâm trạng và Năng lượng (thang 1–5).
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {recent7.length === 0 ? (
                <EmptyState
                  title="Chưa có dữ liệu xu hướng"
                  description="Lưu check-in đầu tiên để xem biểu đồ theo dõi nhịp tâm trạng và năng lượng."
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 rounded-xs bg-[var(--accent-primary)] inline-block"
                        aria-hidden="true"
                      />
                      Tâm trạng (1–5)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 rounded-xs bg-[var(--status-success)] inline-block"
                        aria-hidden="true"
                      />
                      Năng lượng (1–5)
                    </span>
                  </div>

                  {/* Accessible SVG grouped bar chart */}
                  <div className="w-full overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${Math.max(recent7.length * 68, 280)} 150`}
                      className="w-full h-40 min-w-[260px]"
                      role="img"
                      aria-label={`Biểu đồ xu hướng ${recent7.length} lần check-in cảm xúc và năng lượng gần nhất`}
                    >
                      {[1, 2, 3, 4, 5].map((tick) => {
                        const y = 120 - (tick / 5) * 95;
                        return (
                          <g key={tick}>
                            <line
                              x1={24}
                              y1={y}
                              x2={Math.max(recent7.length * 68, 280) - 8}
                              y2={y}
                              stroke="var(--border-hairline)"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={8}
                              y={y + 4}
                              fontSize="10"
                              fill="var(--text-muted)"
                            >
                              {tick}
                            </text>
                          </g>
                        );
                      })}

                      {recent7.map((item, idx) => {
                        const groupX = 36 + idx * 64;
                        const moodH = (item.mood / 5) * 95;
                        const energyH = (item.energy / 5) * 95;
                        const shortDate = item.date.slice(5).split('-').reverse().join('/');
                        return (
                          <g key={item.id}>
                            <rect
                              x={groupX}
                              y={120 - moodH}
                              width={16}
                              height={moodH}
                              rx={4}
                              fill="var(--accent-primary)"
                            />
                            <rect
                              x={groupX + 20}
                              y={120 - energyH}
                              width={16}
                              height={energyH}
                              rx={4}
                              fill="var(--status-success)"
                            />
                            <text
                              x={groupX + 18}
                              y={138}
                              textAnchor="middle"
                              fontSize="10"
                              fill="var(--text-secondary)"
                            >
                              {shortDate}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Screen reader & text meter breakdown */}
                  <ul className="space-y-2 border-t border-[var(--border-hairline)] pt-3">
                    {recent7.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]"
                      >
                        <span className="font-medium text-[var(--text-primary)] tabular-nums">
                          {formatFullDateVi(item.date)}
                        </span>
                        <span className="tabular-nums">
                          Tâm trạng {item.mood}/5 ({getMoodMeta(item.mood).label}) •
                          Năng lượng {item.energy}/5
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardBody>
          </Card>

          {/* History list */}
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                  Nhật ký check-in riêng tư
                </h2>
                <CardDescription>
                  Bạn có thể xóa bất kỳ bản ghi nào bất cứ lúc nào.
                </CardDescription>
              </div>
              <Badge variant="default" className="tabular-nums">
                {state.moodCheckIns.length} mục
              </Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {state.moodCheckIns.length === 0 ? (
                <EmptyState
                  title="Chưa có check-in nào"
                  description="Hãy ghi lại cảm xúc hôm nay để theo dõi sự thích nghi qua từng tuần."
                />
              ) : (
                state.moodCheckIns.map((entry) => {
                  const moodMeta = getMoodMeta(entry.mood);
                  const energyMeta = getEnergyMeta(entry.energy);
                  const MoodIcon = moodMeta.icon;
                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/50 p-3.5 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="primary"
                            icon={<MoodIcon className="h-3.5 w-3.5" />}
                          >
                            Tâm trạng {entry.mood}/5 • {moodMeta.label}
                          </Badge>
                          <Badge variant="success">
                            Năng lượng {entry.energy}/5 • {energyMeta.label}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Xóa check-in ngày ${entry.date}`}
                          onClick={() => {
                            deleteMoodCheckIn(entry.id);
                            showToast('Đã xóa bản ghi check-in', 'info');
                          }}
                          leftIcon={<Trash2 className="h-4 w-4" />}
                        >
                          Xóa
                        </Button>
                      </div>

                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-2 py-0.5 text-xs text-[var(--text-secondary)]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.note && (
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                          {entry.note}
                        </p>
                      )}

                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        <span>
                          {formatFullDateVi(entry.date)} •{' '}
                          {formatRelativeTimeVi(entry.createdAt)}
                        </span>
                      </p>
                    </div>
                  );
                })
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
