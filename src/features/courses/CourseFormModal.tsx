import { useEffect, useId, useState, type FormEvent } from 'react';
import { Button, Modal } from '../../components/ui';
import type { Course } from '../../types/models';
import { cn } from '../../utils/cn';
import {
  COURSE_COLOR_OPTIONS,
  DEFAULT_SEMESTERS,
  TARGET_GRADE_OPTIONS,
} from './courseConstants';

export type CourseFormPayload = Omit<Course, 'id'>;

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CourseFormPayload) => void;
  initialCourse?: Course | null;
  defaultSemester?: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  credits?: string;
  semester?: string;
}

export function CourseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialCourse,
  defaultSemester = DEFAULT_SEMESTERS[0],
}: CourseFormModalProps) {
  const formId = useId();
  const isEditing = Boolean(initialCourse);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('3');
  const [semester, setSemester] = useState(defaultSemester);
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [scheduleSummary, setScheduleSummary] = useState('');
  const [targetGrade, setTargetGrade] = useState('A');
  const [currentScore, setCurrentScore] = useState('');
  const [description, setDescription] = useState('');
  const [syllabusText, setSyllabusText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [color, setColor] = useState(COURSE_COLOR_OPTIONS[0].value);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialCourse) {
      setName(initialCourse.name);
      setCode(initialCourse.code);
      setCredits(String(initialCourse.credits));
      setSemester(initialCourse.semester || defaultSemester);
      setInstructor(initialCourse.instructor);
      setRoom(initialCourse.room);
      setScheduleSummary(initialCourse.scheduleSummary);
      setTargetGrade(initialCourse.targetGrade ?? 'A');
      setCurrentScore(
        typeof initialCourse.currentScore === 'number'
          ? String(initialCourse.currentScore)
          : '',
      );
      setDescription(initialCourse.description ?? '');
      setSyllabusText((initialCourse.syllabusHighlights ?? []).join('\n'));
      setProgressPercent(initialCourse.progressPercent);
      setColor(initialCourse.color || COURSE_COLOR_OPTIONS[0].value);
    } else {
      setName('');
      setCode('');
      setCredits('3');
      setSemester(defaultSemester);
      setInstructor('');
      setRoom('');
      setScheduleSummary('');
      setTargetGrade('A');
      setCurrentScore('');
      setDescription('');
      setSyllabusText('');
      setProgressPercent(0);
      setColor(COURSE_COLOR_OPTIONS[0].value);
    }
    setErrors({});
  }, [isOpen, initialCourse, defaultSemester]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) {
      nextErrors.name = 'Vui lòng nhập tên môn học.';
    }
    if (!code.trim()) {
      nextErrors.code = 'Vui lòng nhập mã học phần (ví dụ: IT1010).';
    }
    const parsedCredits = Number(credits);
    if (!credits.trim() || Number.isNaN(parsedCredits) || parsedCredits < 1) {
      nextErrors.credits = 'Số tín chỉ phải từ 1 trở lên.';
    }
    if (!semester.trim()) {
      nextErrors.semester = 'Vui lòng nhập học kỳ.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedCredits = Math.max(1, Math.round(Number(credits)));
    const parsedScore = currentScore.trim() ? Number(currentScore) : undefined;
    const clampedScore =
      typeof parsedScore === 'number' && !Number.isNaN(parsedScore)
        ? Math.min(10, Math.max(0, parsedScore))
        : undefined;

    const highlights = syllabusText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: parsedCredits,
      semester: semester.trim(),
      instructor: instructor.trim() || 'Chưa cập nhật giảng viên',
      room: room.trim() || 'Chưa xếp phòng',
      scheduleSummary: scheduleSummary.trim() || 'Chưa có lịch cố định',
      targetGrade: targetGrade.trim() || undefined,
      currentScore: clampedScore,
      description: description.trim() || undefined,
      syllabusHighlights: highlights.length > 0 ? highlights : undefined,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      color,
      isSample: initialCourse?.isSample ?? false,
    });
  };

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEditing ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
      description="Lưu thông tin học phần, lịch học dự kiến và mục tiêu cá nhân của bạn."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={formId} variant="primary">
            {isEditing ? 'Lưu thay đổi' : 'Thêm môn học'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor={`${formId}-name`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Tên môn học <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Cấu trúc dữ liệu & Giải thuật"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${formId}-name-err` : undefined}
              className={cn(
                inputClass,
                errors.name && 'border-[var(--status-danger)]',
              )}
            />
            {errors.name && (
              <p
                id={`${formId}-name-err`}
                role="alert"
                className="mt-1 text-xs font-medium text-[var(--status-danger)]"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-code`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Mã học phần <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id={`${formId}-code`}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: IT2030"
              aria-invalid={Boolean(errors.code)}
              aria-describedby={errors.code ? `${formId}-code-err` : undefined}
              className={cn(
                inputClass,
                errors.code && 'border-[var(--status-danger)]',
              )}
            />
            {errors.code && (
              <p
                id={`${formId}-code-err`}
                role="alert"
                className="mt-1 text-xs font-medium text-[var(--status-danger)]"
              >
                {errors.code}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor={`${formId}-credits`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Số tín chỉ <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id={`${formId}-credits`}
              type="number"
              min={1}
              max={15}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              aria-invalid={Boolean(errors.credits)}
              aria-describedby={
                errors.credits ? `${formId}-credits-err` : undefined
              }
              className={cn(
                inputClass,
                'tabular-nums',
                errors.credits && 'border-[var(--status-danger)]',
              )}
            />
            {errors.credits && (
              <p
                id={`${formId}-credits-err`}
                role="alert"
                className="mt-1 text-xs font-medium text-[var(--status-danger)]"
              >
                {errors.credits}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-semester`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Học kỳ <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id={`${formId}-semester`}
              type="text"
              list={`${formId}-semester-list`}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="HK1 2026–2027"
              aria-invalid={Boolean(errors.semester)}
              aria-describedby={
                errors.semester ? `${formId}-semester-err` : undefined
              }
              className={cn(
                inputClass,
                errors.semester && 'border-[var(--status-danger)]',
              )}
            />
            <datalist id={`${formId}-semester-list`}>
              {DEFAULT_SEMESTERS.map((sem) => (
                <option key={sem} value={sem} />
              ))}
            </datalist>
            {errors.semester && (
              <p
                id={`${formId}-semester-err`}
                role="alert"
                className="mt-1 text-xs font-medium text-[var(--status-danger)]"
              >
                {errors.semester}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-target-grade`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Mục tiêu điểm
            </label>
            <select
              id={`${formId}-target-grade`}
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              className={inputClass}
            >
              {TARGET_GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  Mục tiêu {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`${formId}-instructor`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Giảng viên phụ trách
            </label>
            <input
              id={`${formId}-instructor`}
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Ví dụ: TS. Nguyễn Văn An"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor={`${formId}-room`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Phòng học
            </label>
            <input
              id={`${formId}-room`}
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Ví dụ: B1-302"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor={`${formId}-schedule`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Tóm tắt lịch học
            </label>
            <input
              id={`${formId}-schedule`}
              type="text"
              value={scheduleSummary}
              onChange={(e) => setScheduleSummary(e.target.value)}
              placeholder="Ví dụ: Thứ 2 & Thứ 5 • 07:30–09:50"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor={`${formId}-score`}
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Điểm hiện tại (thang 10)
            </label>
            <input
              id={`${formId}-score`}
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={currentScore}
              onChange={(e) => setCurrentScore(e.target.value)}
              placeholder="VD: 8.2"
              className={cn(inputClass, 'tabular-nums')}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${formId}-description`}
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            Mục tiêu & mô tả học phần
          </label>
          <textarea
            id={`${formId}-description`}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mục tiêu cần đạt được hoặc lưu ý quan trọng cho môn học..."
            className={cn(inputClass, 'min-h-[72px] py-2.5')}
          />
        </div>

        <div>
          <label
            htmlFor={`${formId}-syllabus`}
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            Ghi chú đề cương / Nội dung trọng tâm (mỗi dòng một ý)
          </label>
          <textarea
            id={`${formId}-syllabus`}
            rows={3}
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            placeholder={'Chương 1: Tổng quan...\nChương 2: Thực hành...\nTỷ trọng điểm: 20% - 30% - 50%'}
            className={cn(inputClass, 'min-h-[84px] py-2.5')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={`${formId}-progress`}
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Tiến độ tự đánh giá
              </label>
              <span className="text-sm font-semibold text-[var(--accent-primary)] tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <input
              id={`${formId}-progress`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
              className="w-full h-11 accent-[var(--accent-primary)] cursor-pointer"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Màu nhận diện môn học
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chọn màu nhận diện">
              {COURSE_COLOR_OPTIONS.map((opt) => {
                const selected = color === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={opt.label}
                    title={opt.label}
                    onClick={() => setColor(opt.value)}
                    className={cn(
                      'h-10 w-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform',
                      selected
                        ? 'border-[var(--text-primary)] scale-105 ring-2 ring-[var(--focus-ring)] ring-offset-2 ring-offset-[var(--bg-surface)]'
                        : 'border-transparent hover:scale-105',
                    )}
                    style={{ backgroundColor: opt.value }}
                  >
                    {selected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
