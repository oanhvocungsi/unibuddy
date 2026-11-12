import type {
  Course,
  CourseChecklistItem,
  CourseNote,
  CourseResource,
  Flashcard,
  ScheduleEvent,
  StudentProfile,
  TaskItem,
} from '../types/models';

/**
 * Trả về chuỗi ngày YYYY-MM-DD theo múi giờ địa phương, lệch `daysFromToday` ngày so với hôm nay.
 * Dùng local date để tránh lệch ngày giữa 00:00–07:00 ở múi giờ UTC+7.
 */
export function formatDateOffset(daysFromToday: number): string {
  const target = new Date();
  target.setHours(12, 0, 0, 0);
  target.setDate(target.getDate() + daysFromToday);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Trả về chuỗi ISO timestamp tương đối so với ngày hiện tại.
 */
export function formatIsoOffset(
  daysFromToday: number,
  hour = 9,
  minute = 0,
): string {
  const target = new Date();
  target.setDate(target.getDate() + daysFromToday);
  target.setHours(hour, minute, 0, 0);
  return target.toISOString();
}

export interface AcademicSeedData {
  profile: StudentProfile;
  courses: Course[];
  courseNotes: CourseNote[];
  courseChecklists: CourseChecklistItem[];
  flashcards: Flashcard[];
  courseResources: CourseResource[];
  scheduleEvents: ScheduleEvent[];
  tasks: TaskItem[];
}

export function createSampleProfile(): StudentProfile {
  return {
    id: 'student-demo-minhanh',
    name: 'Nguyễn Minh Anh',
    studentCode: 'SV2026-DEMO-0108',
    email: 'minhanh.demo@demo-uni.edu.vn',
    phone: '0900-000-108 (Số minh họa)',
    bio: 'Sinh viên năm nhất ngành Kỹ thuật Phần mềm (Hồ sơ minh họa). Đang làm quen nhịp học tín chỉ, tìm nhóm học tập và cân bằng giữa môn đại cương với CLB.',
    schoolName: 'Đại học Công nghệ & Khoa học (Trường minh họa)',
    faculty: 'Khoa Công nghệ thông tin',
    major: 'Kỹ thuật Phần mềm',
    cohort: 'K2026 (Năm nhất)',
    className: 'CNTT-K2026-01',
    campus: 'Cơ sở Chính — Khu A (Minh họa)',
    semester: 'Học kỳ 1 (2026–2027)',
    goals: [
      'academic_balance',
      'time_management',
      'make_friends',
      'campus_navigation',
    ],
    freeSlots: [
      'Thứ 3 (14:00–17:00)',
      'Thứ 5 (15:00–17:30)',
      'Thứ 7 (08:30–11:30)',
    ],
    interests: [
      'Lập trình web',
      'Giải thuật cơ bản',
      'Cầu lông',
      'Tình nguyện',
      'Kỹ năng thuyết trình',
    ],
    privacy: {
      hideEmail: true,
      hidePhone: true,
      hideSchedule: false,
      hideClass: false,
      hideCommunityActivity: false,
    },
    onboardingCompleted: true,
    role: 'student',
    isSample: true,
  };
}

export function createSampleCourses(): Course[] {
  return [
    {
      id: 'course-it1010',
      code: 'IT1010',
      name: 'Nhập môn Lập trình',
      credits: 4,
      instructor: 'TS. Trần Quốc Bảo (Minh họa)',
      room: 'B1-302',
      scheduleSummary: 'Thứ 2 & Thứ 5 • 07:30–09:50',
      color: '#2B59C3',
      targetGrade: 'A',
      currentScore: 8.6,
      progressPercent: 48,
      semester: 'HK1 2026–2027',
      description:
        'Làm quen tư duy giải quyết vấn đề, biến, cấu trúc điều khiển, hàm, mảng và kỹ năng gỡ lỗi cơ bản.',
      syllabusHighlights: [
        'Biến, kiểu dữ liệu & biểu thức logic',
        'Cấu trúc rẽ nhánh và vòng lặp',
        'Hàm, phạm vi biến và đệ quy cơ bản',
        'Mảng một chiều, chuỗi ký tự và xử lý tệp',
      ],
      isSample: true,
    },
    {
      id: 'course-mi1110',
      code: 'MI1110',
      name: 'Giải tích 1 & Đại số tuyến tính ứng dụng cho khối ngành Kỹ thuật',
      credits: 4,
      instructor: 'PGS.TS. Phạm Đức Minh (Minh họa)',
      room: 'C2-105',
      scheduleSummary: 'Thứ 3 & Thứ 6 • 07:30–09:50',
      color: '#0F766E',
      targetGrade: 'B+',
      currentScore: 7.7,
      progressPercent: 42,
      semester: 'HK1 2026–2027',
      description:
        'Nền tảng giới hạn, đạo hàm, tích phân một biến kết hợp ma trận, định thức và hệ phương trình tuyến tính.',
      syllabusHighlights: [
        'Giới hạn dãy số và hàm liên tục',
        'Đạo hàm, khai triển Taylor và cực trị',
        'Tích phân xác định và ứng dụng hình học',
        'Ma trận, hạng ma trận và hệ phương trình tuyến tính',
      ],
      isSample: true,
    },
    {
      id: 'course-ss1010',
      code: 'SS1010',
      name: 'Triết học Mác - Lênin',
      credits: 3,
      instructor: 'ThS. Nguyễn Thị Lan Hương (Minh họa)',
      room: 'A2-204',
      scheduleSummary: 'Thứ 4 • 09:30–11:45',
      color: '#7C3AED',
      targetGrade: 'B+',
      currentScore: 8.0,
      progressPercent: 35,
      semester: 'HK1 2026–2027',
      description:
        'Cung cấp thế giới quan, phương pháp luận duy vật biện chứng và duy vật lịch sử trong nhận thức khoa học.',
      syllabusHighlights: [
        'Vấn đề cơ bản của triết học',
        'Hai nguyên lý & ba quy luật phép biện chứng',
        'Thực tiễn và vai trò đối với nhận thức',
        'Hình thái kinh tế - xã hội',
      ],
      isSample: true,
    },
    {
      id: 'course-fl1020',
      code: 'FL1020',
      name: 'Tiếng Anh học thuật B1',
      credits: 3,
      instructor: 'ThS. Lê Thu Hà (Minh họa)',
      room: 'B1-208',
      scheduleSummary: 'Thứ 2 & Thứ 4 • 13:30–15:20',
      color: '#B45309',
      targetGrade: 'A-',
      currentScore: 8.3,
      progressPercent: 52,
      semester: 'HK1 2026–2027',
      description:
        'Rèn luyện đọc hiểu tài liệu chuyên ngành, viết đoạn văn học thuật chuẩn cấu trúc và thuyết trình ngắn.',
      syllabusHighlights: [
        'Skimming, Scanning & đoán nghĩa theo ngữ cảnh',
        'Cấu trúc Academic Paragraph (Topic & Supporting)',
        'Nghe hiểu bài giảng ngắn & ghi chú từ khóa',
        'Thuyết trình nhóm 5 phút bằng tiếng Anh',
      ],
      isSample: true,
    },
    {
      id: 'course-ge1005',
      code: 'GE1005',
      name: 'Kỹ năng học đại học, Phương pháp tự học & Tư duy phản biện',
      credits: 2,
      instructor: 'TS. Vũ Hoàng Nam (Minh họa)',
      room: 'C1-102',
      scheduleSummary: 'Thứ 6 • 13:30–15:10',
      color: '#BE185D',
      targetGrade: 'A',
      currentScore: 9.0,
      progressPercent: 60,
      semester: 'HK1 2026–2027',
      description:
        'Chuyển đổi từ cách học phổ thông sang tự học bậc đại học: quản lý thời gian, làm việc nhóm và đánh giá nguồn tin.',
      syllabusHighlights: [
        'Ghi chép Cornell & lập bản đồ tư duy',
        'Ma trận Eisenhower và kỹ thuật Pomodoro',
        'Phân biệt lập luận hợp lý với ngụy biện phổ biến',
        'Trình bày báo cáo và trích dẫn học thuật đúng chuẩn',
      ],
      isSample: true,
    },
  ];
}

export function createSampleCourseNotes(): CourseNote[] {
  return [
    {
      id: 'note-it-01',
      courseId: 'course-it1010',
      title: 'Tránh lỗi Off-by-One khi duyệt mảng và vòng lặp for',
      content:
        'Mảng có n phần tử luôn đánh chỉ số từ 0 đến n - 1. Khi dùng điều kiện dừng i < n sẽ duyệt đủ n phần tử; dùng i <= n dễ gây truy cập ngoài vùng nhớ.',
      tags: ['vòng lặp', 'mảng', 'debug'],
      updatedAt: formatIsoOffset(-1, 20, 15),
      pinned: true,
    },
    {
      id: 'note-it-02',
      courseId: 'course-it1010',
      title: 'Checklist tự kiểm tra trước khi nộp bài Lab lập trình',
      content:
        '1) Thử test biên (n = 0, n = 1, số âm). 2) Đặt tên biến rõ nghĩa. 3) Xóa dòng in debug thừa trước khi nén file nộp.',
      tags: ['lab', 'quy ước'],
      updatedAt: formatIsoOffset(-3, 14, 0),
    },
    {
      id: 'note-mi-01',
      courseId: 'course-mi1110',
      title: 'Tóm tắt 4 dạng vô định thường gặp khi tính giới hạn',
      content:
        'Dạng 0/0 và ∞/∞: ưu tiên rút gọn nhân tử chung, chia bậc cao nhất hoặc dùng Vô cùng bé tương đương trước khi áp dụng L’Hôpital.',
      tags: ['giới hạn', 'công thức', 'giữa kỳ'],
      updatedAt: formatIsoOffset(0, 8, 45),
      pinned: true,
    },
    {
      id: 'note-mi-02',
      courseId: 'course-mi1110',
      title: 'Ghi chú biến đổi sơ cấp tìm hạng ma trận',
      content:
        'Đưa ma trận về dạng bậc thang bằng cách khử từ trên xuống dưới. Số hàng khác 0 sau khi rút gọn chính là hạng của ma trận.',
      tags: ['đại số', 'ma trận'],
      updatedAt: formatIsoOffset(-4, 16, 20),
    },
    {
      id: 'note-ss-01',
      courseId: 'course-ss1010',
      title: 'Sơ đồ 2 nguyên lý & 3 quy luật phép biện chứng duy vật',
      content:
        '2 nguyên lý: Mối liên hệ phổ biến & Sự phát triển. 3 quy luật: Lượng–Chất (cách thức), Mâu thuẫn (nguồn gốc động lực), Phủ định của phủ định (khuynh hướng).',
      tags: ['sơ đồ', 'ôn tập'],
      updatedAt: formatIsoOffset(-2, 19, 10),
    },
    {
      id: 'note-fl-01',
      courseId: 'course-fl1020',
      title: 'Khung viết đoạn văn Academic Paragraph 150 từ',
      content:
        'Topic Sentence (nêu ý chính rõ ràng) -> 2–3 Supporting Ideas kèm ví dụ cụ thể -> Concluding Sentence tóm lại hoặc mở rộng nhẹ, tránh dùng văn nói.',
      tags: ['writing', 'academic'],
      updatedAt: formatIsoOffset(-1, 15, 30),
    },
    {
      id: 'note-ge-01',
      courseId: 'course-ge1005',
      title: 'Áp dụng phương pháp Cornell ngay sau giờ giảng',
      content:
        'Chia trang giấy làm 3 vùng: Cột phải ghi ý chính trong lớp, cột trái ghi câu hỏi gợi nhớ sau buổi học, phần đáy viết tóm tắt 3 câu trong vòng 24 giờ.',
      tags: ['ghi chép', 'cornell'],
      updatedAt: formatIsoOffset(-5, 11, 0),
    },
  ];
}

export function createSampleCourseChecklists(): CourseChecklistItem[] {
  return [
    {
      id: 'chk-it-1',
      courseId: 'course-it1010',
      title: 'Hoàn thành bài tập Biến, Kiểu dữ liệu & Toán tử',
      weekLabel: 'Tuần 1',
      completed: true,
    },
    {
      id: 'chk-it-2',
      courseId: 'course-it1010',
      title: 'Luyện 10 bài tập rẽ nhánh if-else và switch-case',
      weekLabel: 'Tuần 2',
      completed: true,
    },
    {
      id: 'chk-it-3',
      courseId: 'course-it1010',
      title: 'Ôn lại hàm truyền tham trị / tham chiếu & mảng 1 chiều',
      weekLabel: 'Tuần 4',
      completed: false,
    },
    {
      id: 'chk-mi-1',
      courseId: 'course-mi1110',
      title: 'Thuộc bảng giới hạn cơ bản & vô cùng bé tương đương',
      weekLabel: 'Tuần 2',
      completed: true,
    },
    {
      id: 'chk-mi-2',
      courseId: 'course-mi1110',
      title: 'Giải 15 bài tập xét tính liên tục và đạo hàm cấp 1',
      weekLabel: 'Tuần 3',
      completed: false,
    },
    {
      id: 'chk-mi-3',
      courseId: 'course-mi1110',
      title: 'Làm đề minh họa giữa kỳ phần Ma trận & Định thức',
      weekLabel: 'Giữa kỳ',
      completed: false,
    },
    {
      id: 'chk-ss-1',
      courseId: 'course-ss1010',
      title: 'Đọc tóm tắt Chương 1: Khái luận về Triết học',
      weekLabel: 'Tuần 1',
      completed: true,
    },
    {
      id: 'chk-ss-2',
      courseId: 'course-ss1010',
      title: 'Chuẩn bị ví dụ thực tiễn cho bài thảo luận quy luật Lượng - Chất',
      weekLabel: 'Tuần 4',
      completed: false,
    },
    {
      id: 'chk-fl-1',
      courseId: 'course-fl1020',
      title: 'Hoàn tất bộ 30 từ vựng học thuật Unit 1 & Unit 2',
      weekLabel: 'Tuần 2',
      completed: true,
    },
    {
      id: 'chk-fl-2',
      courseId: 'course-fl1020',
      title: 'Luyện đọc Skimming 2 bài báo ngắn chủ đề giáo dục đại học',
      weekLabel: 'Tuần 3',
      completed: false,
    },
    {
      id: 'chk-ge-1',
      courseId: 'course-ge1005',
      title: 'Lập bảng phân bổ 168 giờ/tuần theo khung thời gian thực tế',
      weekLabel: 'Tuần 1',
      completed: true,
    },
    {
      id: 'chk-ge-2',
      courseId: 'course-ge1005',
      title: 'Chuẩn bị dàn ý slide thuyết trình nhóm 5 phút',
      weekLabel: 'Tuần 3',
      completed: false,
    },
  ];
}

export function createSampleFlashcards(): Flashcard[] {
  return [
    {
      id: 'fc-it-1',
      courseId: 'course-it1010',
      front: 'Sự khác nhau chính giữa vòng lặp `while` và `do...while` là gì?',
      back: '`while` kiểm tra điều kiện trước khi chạy (có thể chạy 0 lần); `do...while` chạy thân vòng lặp ít nhất 1 lần rồi mới kiểm tra điều kiện.',
      mastery: 'mastered',
      lastReviewedAt: formatIsoOffset(-1, 21, 0),
    },
    {
      id: 'fc-it-2',
      courseId: 'course-it1010',
      front: 'Vì sao không nên so sánh bằng (`==`) trực tiếp hai số thực dấu phẩy động (`float`/`double`)?',
      back: 'Do sai số biểu diễn nhị phân. Nên kiểm tra `Math.abs(a - b) < 1e-9` (ngưỡng epsilon).',
      mastery: 'learning',
      lastReviewedAt: formatIsoOffset(-2, 19, 30),
    },
    {
      id: 'fc-it-3',
      courseId: 'course-it1010',
      front: 'Độ phức tạp thời gian của tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp là bao nhiêu?',
      back: 'O(log n), vì mỗi bước chia đôi không gian tìm kiếm.',
      mastery: 'new',
    },
    {
      id: 'fc-mi-1',
      courseId: 'course-mi1110',
      front: 'Giới hạn cơ bản: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$ bằng bao nhiêu?',
      back: 'Bằng 1 (khi x tính bằng radian). Suy ra khi x -> 0 thì sin(x) ~ x.',
      mastery: 'mastered',
      lastReviewedAt: formatIsoOffset(-1, 10, 0),
    },
    {
      id: 'fc-mi-2',
      courseId: 'course-mi1110',
      front: 'Điều kiện để ma trận vuông A cấp n khả nghịch là gì?',
      back: 'Định thức của A khác 0 (det(A) != 0), tương đương hạng của A bằng n.',
      mastery: 'learning',
      lastReviewedAt: formatIsoOffset(-3, 18, 0),
    },
    {
      id: 'fc-mi-3',
      courseId: 'course-mi1110',
      front: 'Định lý Fermat về cực trị địa phương phát biểu thế nào?',
      back: 'Nếu f khả vi tại điểm cực trị địa phương x0 thì đạo hàm tại đó bằng 0: f\'(x0) = 0 (điều kiện cần, chưa đủ).',
      mastery: 'new',
    },
    {
      id: 'fc-ss-1',
      courseId: 'course-ss1010',
      front: 'Vấn đề cơ bản của triết học gồm hai mặt nào?',
      back: 'Mặt thứ nhất (bản thể luận): Giữa ý thức và vật chất, cái nào có trước? Mặt thứ hai (nhận thức luận): Con người có khả năng nhận thức được thế giới hay không?',
      mastery: 'learning',
      lastReviewedAt: formatIsoOffset(-2, 16, 0),
    },
    {
      id: 'fc-ss-2',
      courseId: 'course-ss1010',
      front: 'Trong quy luật Lượng - Chất, "Độ" và "Điểm nút" nghĩa là gì?',
      back: '"Độ" là khoảng giới hạn mà sự thay đổi về lượng chưa làm thay đổi căn bản về chất. "Điểm nút" là điểm giới hạn mà tại đó diễn ra bước nhảy về chất.',
      mastery: 'new',
    },
    {
      id: 'fc-ss-3',
      courseId: 'course-ss1010',
      front: 'Ba hình thức cơ bản của hoạt động thực tiễn là gì?',
      back: '1) Hoạt động sản xuất vật chất (cơ bản nhất), 2) Hoạt động chính trị - xã hội, 3) Hoạt động thực nghiệm khoa học.',
      mastery: 'mastered',
      lastReviewedAt: formatIsoOffset(-4, 15, 0),
    },
    {
      id: 'fc-fl-1',
      courseId: 'course-fl1020',
      front: 'Trong Academic Writing, "Topic Sentence" đặt ở đâu và có vai trò gì?',
      back: 'Thường đặt ở đầu đoạn văn, nêu chủ đề chính và quan điểm kiểm soát (controlling idea) của cả đoạn.',
      mastery: 'mastered',
      lastReviewedAt: formatIsoOffset(-1, 14, 20),
    },
    {
      id: 'fc-fl-2',
      courseId: 'course-fl1020',
      front: 'Phân biệt kỹ năng đọc Skimming và Scanning?',
      back: 'Skimming: đọc lướt nhanh để nắm ý chính tổng quát. Scanning: rà mắt tìm thông tin cụ thể (ngày tháng, tên riêng, số liệu).',
      mastery: 'learning',
      lastReviewedAt: formatIsoOffset(-2, 11, 15),
    },
    {
      id: 'fc-fl-3',
      courseId: 'course-fl1020',
      front: 'Từ nối học thuật thay thế "But" và "Because" trang trọng hơn?',
      back: 'Thay "But": However, Nevertheless, In contrast. Thay "Because": Due to (+ danh từ), Since, As.',
      mastery: 'new',
    },
    {
      id: 'fc-ge-1',
      courseId: 'course-ge1005',
      front: '4 nhóm việc trong Ma trận Eisenhower gồm những gì?',
      back: '1) Quan trọng & Khẩn cấp (Làm ngay), 2) Quan trọng & Không khẩn cấp (Lên lịch ưu tiên), 3) Không quan trọng & Khẩn cấp (Ủy quyền/giảm thiểu), 4) Không quan trọng & Không khẩn cấp (Loại bỏ).',
      mastery: 'mastered',
      lastReviewedAt: formatIsoOffset(-1, 9, 30),
    },
    {
      id: 'fc-ge-2',
      courseId: 'course-ge1005',
      front: 'Nguyên tắc 1 tín chỉ ở đại học thường đòi hỏi bao nhiêu giờ tự học?',
      back: 'Thông thường ngoài 1 giờ lên lớp lý thuyết, sinh viên cần dành khoảng 2 giờ tự học, đọc tài liệu và làm bài tập ở nhà.',
      mastery: 'learning',
      lastReviewedAt: formatIsoOffset(-3, 20, 0),
    },
    {
      id: 'fc-ge-3',
      courseId: 'course-ge1005',
      front: 'Phương pháp Active Recall (Gợi nhớ chủ động) khác gì đọc lại giáo trình thụ động?',
      back: 'Active Recall buộc não tự truy xuất kiến thức bằng câu hỏi/flashcard mà không nhìn tài liệu trước, giúp ghi nhớ sâu hơn gấp nhiều lần.',
      mastery: 'new',
    },
  ];
}

export function createSampleCourseResources(): CourseResource[] {
  return [
    {
      id: 'res-it-1',
      courseId: 'course-it1010',
      title: 'Đề cương chi tiết học phần IT1010 (Bản mẫu học kỳ 1)',
      type: 'syllabus',
      url: 'https://demo-lms.example.org/it1010/syllabus',
      description:
        'Mô tả chuẩn đầu ra, tỷ trọng điểm (Chuyên cần 10% - Thực hành 30% - Cuối kỳ 60%) và lịch trình 15 tuần.',
      origin: 'school_sample',
      addedAt: formatIsoOffset(-10),
    },
    {
      id: 'res-it-2',
      courseId: 'course-it1010',
      title: 'Bộ 20 bài tập thực hành Vòng lặp & Mảng do khóa trước tổng hợp',
      type: 'practice',
      url: 'https://demo-community.example.org/it1010/loop-practice',
      description:
        'Tài liệu chia sẻ bởi nhóm sinh viên CLB IT-Club kèm test case mẫu để tự luyện trước buổi Lab.',
      origin: 'community',
      addedAt: formatIsoOffset(-4),
    },
    {
      id: 'res-mi-1',
      courseId: 'course-mi1110',
      title: 'Slide bài giảng Chương 1–2: Giới hạn và Đạo hàm (Minh họa)',
      type: 'slide',
      url: 'https://demo-lms.example.org/mi1110/slides-ch1-2',
      description:
        'Tài liệu bài giảng tuần 1–4 kèm ví dụ minh họa và đáp án gợi ý cuối chương.',
      origin: 'school_sample',
      addedAt: formatIsoOffset(-8),
    },
    {
      id: 'res-mi-2',
      courseId: 'course-mi1110',
      title: 'Bảng công thức tóm tắt Đạo hàm & Ma trận cá nhân tự ghi',
      type: 'reference',
      description:
        'Tờ tổng hợp 2 trang tự biên soạn để xem nhanh trước giờ làm bài tập nhóm.',
      origin: 'personal',
      addedAt: formatIsoOffset(-2),
    },
    {
      id: 'res-ss-1',
      courseId: 'course-ss1010',
      title: 'Hướng dẫn đọc giáo trình Triết học theo sơ đồ từ khóa',
      type: 'reference',
      url: 'https://demo-community.example.org/ss1010/mindmap',
      description:
        'Gợi ý cách tóm tắt khái niệm và gắn ví dụ đời sống giúp dễ nhớ khi thảo luận nhóm.',
      origin: 'community',
      addedAt: formatIsoOffset(-6),
    },
    {
      id: 'res-ss-2',
      courseId: 'course-ss1010',
      title: 'Đề cương môn Triết học Mác - Lênin (Mẫu tham khảo)',
      type: 'syllabus',
      url: 'https://demo-lms.example.org/ss1010/syllabus',
      description: 'Cấu trúc bài giảng và chủ đề thảo luận từng tuần học.',
      origin: 'school_sample',
      addedAt: formatIsoOffset(-9),
    },
    {
      id: 'res-fl-1',
      courseId: 'course-fl1020',
      title: 'Ngân hàng 100 từ vựng Academic Word List mức độ B1',
      type: 'practice',
      url: 'https://demo-lms.example.org/fl1020/awl-b1',
      description: 'Danh sách từ vựng kèm ví dụ ngữ cảnh dùng trong bài viết học thuật.',
      origin: 'school_sample',
      addedAt: formatIsoOffset(-7),
    },
    {
      id: 'res-fl-2',
      courseId: 'course-fl1020',
      title: 'Liên kết luyện nghe bài giảng ngắn theo chủ đề (Tự lưu)',
      type: 'link',
      url: 'https://demo-study.example.org/listening-b1',
      description: 'Kho video luyện ghi chú 5 phút mỗi ngày.',
      origin: 'personal',
      addedAt: formatIsoOffset(-1),
    },
    {
      id: 'res-ge-1',
      courseId: 'course-ge1005',
      title: 'Mẫu ghi chép Cornell & Bảng kế hoạch tuần PDF (Minh họa)',
      type: 'reference',
      url: 'https://demo-lms.example.org/ge1005/cornell-template',
      description: 'Mẫu in A4 hoặc chép tay giúp sinh viên năm nhất tối ưu giờ tự học.',
      origin: 'school_sample',
      addedAt: formatIsoOffset(-8),
    },
    {
      id: 'res-ge-2',
      courseId: 'course-ge1005',
      title: 'Mẹo làm slide 5 phút không chữ dày đặc từ CLB SpeakUp',
      type: 'slide',
      url: 'https://demo-community.example.org/ge1005/slide-tips',
      description: 'Chia sẻ kinh nghiệm thuyết trình nhóm từ các anh chị khóa trên.',
      origin: 'community',
      addedAt: formatIsoOffset(-3),
    },
  ];
}

export function createSampleScheduleEvents(): ScheduleEvent[] {
  return [
    // Hôm nay (today + 0)
    {
      id: 'sched-today-it',
      title: 'Nhập môn Lập trình (IT1010)',
      category: 'class',
      date: formatDateOffset(0),
      startTime: '07:30',
      endTime: '09:50',
      location: 'Phòng B1-302',
      courseId: 'course-it1010',
      note: 'Mang theo laptop hoặc chuẩn bị tài khoản phòng máy trước 10 phút.',
      recurrence: 'weekly',
      recurrenceWeeks: 15,
      source: 'imported',
      isSample: true,
    },
    {
      id: 'sched-today-fl',
      title: 'Tiếng Anh học thuật B1 (FL1020)',
      category: 'class',
      date: formatDateOffset(0),
      startTime: '13:30',
      endTime: '15:20',
      location: 'Phòng B1-208',
      courseId: 'course-fl1020',
      note: 'Luyện kỹ năng viết Topic Sentence trên lớp.',
      recurrence: 'weekly',
      recurrenceWeeks: 15,
      source: 'imported',
      isSample: true,
    },
    {
      id: 'sched-today-selfstudy',
      title: 'Tự học Pomodoro & ôn Flashcard',
      category: 'personal',
      date: formatDateOffset(0),
      startTime: '19:30',
      endTime: '21:00',
      location: 'Khu Tự học Thư viện TV-01',
      note: 'Ôn lại 10 thẻ Giải tích và hoàn thành bài viết 150 từ.',
      recurrence: 'none',
      source: 'personal',
      isSample: true,
    },
    // Ngày mai (today + 1)
    {
      id: 'sched-t1-mi',
      title: 'Giải tích 1 & Đại số tuyến tính (MI1110)',
      category: 'class',
      date: formatDateOffset(1),
      startTime: '07:30',
      endTime: '09:50',
      location: 'Phòng C2-105',
      courseId: 'course-mi1110',
      note: 'Chữa bài tập chương Giới hạn và liên tục.',
      recurrence: 'weekly',
      recurrenceWeeks: 15,
      source: 'imported',
      isSample: true,
    },
    {
      id: 'sched-t1-orientation',
      title: 'Ngày hội Tân sinh viên & Kết nối CLB (Minh họa)',
      category: 'event',
      date: formatDateOffset(1),
      startTime: '15:30',
      endTime: '17:30',
      location: 'Nhà Đa năng HT-01',
      note: 'Sự kiện đã đăng ký từ mục Khám phá.',
      recurrence: 'none',
      source: 'club',
      linkedEventId: 'evt-orientation-fair',
      isSample: true,
    },
    // Today + 2
    {
      id: 'sched-t2-ss',
      title: 'Triết học Mác - Lênin (SS1010)',
      category: 'class',
      date: formatDateOffset(2),
      startTime: '09:30',
      endTime: '11:45',
      location: 'Phòng A2-204',
      courseId: 'course-ss1010',
      note: 'Thảo luận nhóm nhỏ về hai nguyên lý cơ bản.',
      recurrence: 'weekly',
      recurrenceWeeks: 15,
      source: 'imported',
      isSample: true,
    },
    {
      id: 'sched-t2-group',
      title: 'Họp nhóm Cùng Code IT1010',
      category: 'event',
      date: formatDateOffset(2),
      startTime: '16:00',
      endTime: '17:30',
      location: 'Phòng học nhóm tầng 2 - TV-01',
      courseId: 'course-it1010',
      note: 'Rà soát bài Lab 02 trước hạn nộp tối nay.',
      recurrence: 'none',
      source: 'club',
      isSample: true,
    },
    // Today + 3
    {
      id: 'sched-t3-it',
      title: 'Thực hành Nhập môn Lập trình (IT1010)',
      category: 'class',
      date: formatDateOffset(3),
      startTime: '07:30',
      endTime: '09:50',
      location: 'Phòng Lab B1-302',
      courseId: 'course-it1010',
      note: 'Chấm điểm bài thực hành tại lớp.',
      recurrence: 'weekly',
      recurrenceWeeks: 15,
      source: 'imported',
      isSample: true,
    },
    // Today + 4
    {
      id: 'sched-t4-ge',
      title: 'Kỹ năng học đại học & Tư duy phản biện (GE1005)',
      category: 'class',
      date: formatDateOffset(4),
      startTime: '13:30',
      endTime: '15:10',
      location: 'Phòng C1-102',
      courseId: 'course-ge1005',
      note: 'Trình bày bài tập nhóm 5 phút.',
      recurrence: 'weekly',
      recurrenceWeeks: 15,
      source: 'imported',
      isSample: true,
    },
    // Today + 5 (Kỳ thi sắp tới)
    {
      id: 'sched-t5-exam-mi',
      title: 'Kiểm tra giữa kỳ Giải tích 1 & Đại số (MI1110)',
      category: 'exam',
      date: formatDateOffset(5),
      startTime: '08:00',
      endTime: '09:30',
      location: 'Giảng đường C2-105',
      courseId: 'course-mi1110',
      note: 'Mang theo thẻ sinh viên, bút xanh và máy tính bỏ túi được phép sử dụng.',
      recurrence: 'none',
      source: 'imported',
      isSample: true,
    },
    // Today + 9 (Kỳ thi thực hành)
    {
      id: 'sched-t9-exam-it',
      title: 'Bài kiểm tra thực hành giữa kỳ IT1010',
      category: 'exam',
      date: formatDateOffset(9),
      startTime: '14:00',
      endTime: '15:30',
      location: 'Phòng Lab B1-302',
      courseId: 'course-it1010',
      note: 'Thi trực tiếp trên máy phòng Lab, không dùng tài liệu mạng.',
      recurrence: 'none',
      source: 'imported',
      isSample: true,
    },
  ];
}

export function createSampleTasks(): TaskItem[] {
  return [
    // 1 task quá hạn nhẹ để minh họa trạng thái quá hạn
    {
      id: 'task-overdue-mi',
      title: 'Xác nhận danh sách nhóm bài tập lớn MI1110',
      description:
        'Điền tên nhóm và mã sinh viên vào biểu mẫu của giảng viên hướng dẫn.',
      courseId: 'course-mi1110',
      dueDate: formatDateOffset(-1),
      dueTime: '17:00',
      priority: 'medium',
      reminderBefore: '1h',
      status: 'todo',
      subtasks: [
        { id: 'sub-ov-1', title: 'Chốt 4 thành viên cùng nhóm', done: true },
        { id: 'sub-ov-2', title: 'Gửi xác nhận trên cổng học phần', done: false },
      ],
      estimatedMinutes: 15,
      createdAt: formatIsoOffset(-4, 9, 0),
      isSample: true,
    },
    // 1 task đến hạn HÔM NAY
    {
      id: 'task-today-fl',
      title: 'Viết đoạn văn 150 từ: Thích nghi tuần đầu đại học',
      description:
        'Áp dụng cấu trúc Topic Sentence + 3 câu triển khai + Concluding Sentence.',
      courseId: 'course-fl1020',
      dueDate: formatDateOffset(0),
      dueTime: '21:00',
      priority: 'medium',
      reminderBefore: '1h',
      status: 'todo',
      subtasks: [
        { id: 'sub-fl-1', title: 'Lập dàn ý 3 luận điểm chính', done: true },
        { id: 'sub-fl-2', title: 'Viết nháp & soát lỗi thì động từ', done: false },
      ],
      estimatedMinutes: 40,
      createdAt: formatIsoOffset(-3, 10, 0),
      isSample: true,
    },
    // 1 task đến hạn NGÀY MAI
    {
      id: 'task-tomorrow-ge',
      title: 'Hoàn thiện 4 slide tóm tắt bài thuyết trình GE1005',
      description:
        'Nhóm phụ trách chủ đề "Quản lý thời gian tuần thi cho sinh viên năm nhất".',
      courseId: 'course-ge1005',
      dueDate: formatDateOffset(1),
      dueTime: '18:00',
      priority: 'medium',
      reminderBefore: '1d',
      status: 'todo',
      subtasks: [
        { id: 'sub-ge-1', title: 'Chọn biểu đồ minh họa 168 giờ/tuần', done: true },
        { id: 'sub-ge-2', title: 'Chạy thử bấm giờ 5 phút', done: false },
      ],
      estimatedMinutes: 50,
      createdAt: formatIsoOffset(-3, 14, 0),
      isSample: true,
    },
    // CỐ Ý ĐẶT 2 DEADLINE TRÙNG NGÀY (today + 2) ĐỂ KÍCH HOẠT CẢNH BÁO TRÙNG HẠN CHÓT!
    {
      id: 'task-collision-it',
      title: 'Nộp bài tập Lab 02: Vòng lặp & Mảng 1 chiều',
      description:
        'Hoàn thành 4 bài code chuẩn đầu vào/ra và nộp file mã nguồn lên LMS mẫu.',
      courseId: 'course-it1010',
      dueDate: formatDateOffset(2),
      dueTime: '23:59',
      priority: 'high',
      reminderBefore: '1d',
      status: 'todo',
      subtasks: [
        { id: 'sub-it-1', title: 'Giải bài 1 & 2 (xử lý dãy số)', done: true },
        { id: 'sub-it-2', title: 'Giải bài 3 & 4 (đảo mảng & tìm max)', done: false },
        { id: 'sub-it-3', title: 'Kiểm tra test biên và đóng gói file', done: false },
      ],
      estimatedMinutes: 90,
      createdAt: formatIsoOffset(-4, 8, 30),
      isSample: true,
    },
    {
      id: 'task-collision-mi',
      title: 'Hoàn thành bộ 15 câu trắc nghiệm Giới hạn & Liên tục',
      description:
        'Bài luyện tập tính điểm chuyên cần trước kỳ kiểm tra giữa kỳ Giải tích 1.',
      courseId: 'course-mi1110',
      dueDate: formatDateOffset(2),
      dueTime: '20:00',
      priority: 'high',
      reminderBefore: '1d',
      status: 'todo',
      subtasks: [
        { id: 'sub-mi-1', title: 'Ôn lại công thức vô cùng bé tương đương', done: false },
        { id: 'sub-mi-2', title: 'Làm bài trên hệ thống & chụp lưu kết quả', done: false },
      ],
      estimatedMinutes: 60,
      createdAt: formatIsoOffset(-3, 11, 15),
      isSample: true,
    },
    // Task xa hơn trong tuần
    {
      id: 'task-future-ss',
      title: 'Đọc trước Chương 2 giáo trình Triết học Mác - Lênin',
      description:
        'Ghi chú lại 3 câu hỏi chưa rõ để trao đổi ở giờ thảo luận.',
      courseId: 'course-ss1010',
      dueDate: formatDateOffset(4),
      dueTime: '18:00',
      priority: 'low',
      reminderBefore: '1d',
      status: 'todo',
      subtasks: [
        { id: 'sub-ss-1', title: 'Đọc mục Vật chất và Ý thức', done: false },
      ],
      estimatedMinutes: 45,
      createdAt: formatIsoOffset(-2, 16, 0),
      isSample: true,
    },
    {
      id: 'task-future-exam-prep',
      title: 'Giải 2 đề ôn tập giữa kỳ Giải tích & Đại số',
      description: 'Tập trung phần hạng ma trận và khai triển giới hạn.',
      courseId: 'course-mi1110',
      dueDate: formatDateOffset(3),
      dueTime: '21:30',
      priority: 'high',
      reminderBefore: '3d',
      status: 'todo',
      subtasks: [
        { id: 'sub-ex-1', title: 'Làm đề mẫu số 1 trong 60 phút', done: false },
        { id: 'sub-ex-2', title: 'Đối chiếu đáp án và ghi lỗi sai hay gặp', done: false },
      ],
      estimatedMinutes: 120,
      createdAt: formatIsoOffset(-1, 19, 0),
      isSample: true,
    },
    // 1 task đã hoàn thành
    {
      id: 'task-done-setup',
      title: 'Cài đặt môi trường lập trình và chạy bài Lab 01',
      description: 'Cấu hình trình biên dịch và kiểm tra tài khoản nộp bài.',
      courseId: 'course-it1010',
      dueDate: formatDateOffset(-2),
      dueTime: '20:00',
      priority: 'medium',
      reminderBefore: '1d',
      status: 'done',
      subtasks: [
        { id: 'sub-dn-1', title: 'Cài đặt IDE và chạy thử Hello World', done: true },
        { id: 'sub-dn-2', title: 'Nộp xác nhận bài Lab 01', done: true },
      ],
      estimatedMinutes: 35,
      createdAt: formatIsoOffset(-6, 9, 0),
      completedAt: formatIsoOffset(-2, 17, 40),
      isSample: true,
    },
  ];
}

export function createAcademicSeedData(): AcademicSeedData {
  return {
    profile: createSampleProfile(),
    courses: createSampleCourses(),
    courseNotes: createSampleCourseNotes(),
    courseChecklists: createSampleCourseChecklists(),
    flashcards: createSampleFlashcards(),
    courseResources: createSampleCourseResources(),
    scheduleEvents: createSampleScheduleEvents(),
    tasks: createSampleTasks(),
  };
}

export const SAMPLE_PROFILE = createSampleProfile();
export const SAMPLE_COURSES = createSampleCourses();
