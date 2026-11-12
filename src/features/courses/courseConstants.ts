import type {
  CourseResourceOrigin,
  CourseResourceType,
  FlashcardMastery,
  TaskPriority,
} from '../../types/models';

export interface CourseColorOption {
  value: string;
  label: string;
}

export const COURSE_COLOR_OPTIONS: CourseColorOption[] = [
  { value: '#2B59C3', label: 'Xanh dương đậm' },
  { value: '#0F766E', label: 'Xanh ngọc' },
  { value: '#7C3AED', label: 'Tím học thuật' },
  { value: '#B45309', label: 'Hổ phách' },
  { value: '#BE185D', label: 'Đỏ rượu' },
  { value: '#0369A1', label: 'Xanh thiên thanh' },
  { value: '#15803D', label: 'Xanh lá' },
];

export const DEFAULT_SEMESTERS = [
  'HK1 2026–2027',
  'HK2 2026–2027',
  'Hè 2026–2027',
];

export const TARGET_GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'Đạt'];

export const RESOURCE_TYPE_LABELS: Record<CourseResourceType, string> = {
  syllabus: 'Đề cương / PDF',
  slide: 'Slide bài giảng',
  reference: 'Tài liệu / Ghi chú',
  practice: 'Bài tập thực hành',
  link: 'Liên kết / Video',
};

export const RESOURCE_ORIGIN_META: Record<
  CourseResourceOrigin,
  {
    badgeLabel: string;
    badgeVariant: 'outline' | 'primary' | 'success';
    helperNote?: string;
  }
> = {
  school_sample: {
    badgeLabel: 'Tài liệu trường (minh họa)',
    badgeVariant: 'outline',
    helperNote:
      'Nội dung minh họa để tham khảo cấu trúc học phần, không phải văn bản chính thức từ nhà trường.',
  },
  community: {
    badgeLabel: 'Cộng đồng chia sẻ',
    badgeVariant: 'primary',
  },
  personal: {
    badgeLabel: 'Ghi chú / Tài liệu cá nhân',
    badgeVariant: 'success',
  },
};

export const RESOURCE_REPORT_REASONS = [
  'Sai thông tin',
  'Lỗi thời',
  'Vi phạm bản quyền',
] as const;

export const FLASHCARD_MASTERY_LABELS: Record<
  FlashcardMastery,
  { label: string; variant: 'default' | 'warning' | 'success' }
> = {
  new: { label: 'Thẻ mới', variant: 'default' },
  learning: { label: 'Cần ôn lại', variant: 'warning' },
  mastered: { label: 'Đã thuộc', variant: 'success' },
};

export const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; variant: 'danger' | 'warning' | 'default' }
> = {
  high: { label: 'Ưu tiên cao', variant: 'danger' },
  medium: { label: 'Trung bình', variant: 'warning' },
  low: { label: 'Thấp', variant: 'default' },
};

/**
 * Chuyển đổi học kỳ dài từ hồ sơ (vd "Học kỳ 1 (2026–2027)") sang dạng ngắn hoặc giữ nguyên.
 */
export function normalizeSemesterSuggestion(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_SEMESTERS[0];
  return trimmed;
}

/**
 * Chuẩn hóa URL để tránh scheme nguy hiểm (javascript:, data:).
 */
export function isSafeHttpUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
