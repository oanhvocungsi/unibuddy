import type {
  AdminAuditLog,
  AppNotification,
  BudgetLimit,
  ExpenseCategory,
  ExpenseEntry,
  LifeChecklistCategory,
  LifeChecklistItem,
  ModerationReport,
  MoodCheckIn,
  SupportAppointment,
  SupportCenter,
  SupportCenterCategory,
  WellnessGuide,
  WellnessGuideCategory,
} from '../types/models';
import { formatDateOffset, formatIsoOffset } from './academicSeedData';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Nhà trọ / KTX & Điện nước',
  food: 'Ăn uống hằng ngày',
  transport: 'Đi lại & Gửi xe',
  study: 'Học tập & Giáo trình',
  social: 'Giao lưu & CLB',
  other: 'Vật dụng & Chi phí khác',
};

export const LIFE_CHECKLIST_CATEGORY_LABELS: Record<
  LifeChecklistCategory,
  string
> = {
  semester_prep: 'Checklist chuẩn bị học kỳ đầu',
  essentials: 'Vật dụng cần thiết',
  saving_tips: 'Mẹo tiết kiệm cho năm nhất',
  essential_places: 'Địa chỉ thiết yếu minh họa',
};

export const SUPPORT_CENTER_CATEGORY_LABELS: Record<
  SupportCenterCategory,
  string
> = {
  counseling: 'Tư vấn tâm lý',
  medical: 'Y tế trường học',
  student_affairs: 'Công tác sinh viên',
  academic_advising: 'Cố vấn học tập',
  hotline: 'Đường dây hỗ trợ (Minh họa)',
};

export const WELLNESS_GUIDE_CATEGORY_LABELS: Record<
  WellnessGuideCategory,
  string
> = {
  homesickness: 'Nhớ nhà & Môi trường mới',
  exam_stress: 'Áp lực thi cử',
  sleep_balance: 'Giấc ngủ & Nhịp sinh học',
  social_adaptation: 'Kết bạn & Hòa nhập',
  study_burnout: 'Phòng tránh kiệt sức học tập',
};

/**
 * Giữ các khoản chi mẫu luôn nằm trong tháng dương lịch hiện tại (không vượt quá hôm nay).
 */
function formatSameMonthDateOffset(daysBack: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const safeDay = Math.max(1, now.getDate() - Math.max(0, daysBack));
  return `${year}-${month}-${String(safeDay).padStart(2, '0')}`;
}

export interface LifeAndSupportSeedData {
  expenses: ExpenseEntry[];
  budgetLimits: BudgetLimit[];
  lifeChecklist: LifeChecklistItem[];
  supportCenters: SupportCenter[];
  supportAppointments: SupportAppointment[];
  wellnessGuides: WellnessGuide[];
  moodCheckIns: MoodCheckIn[];
  notifications: AppNotification[];
  moderationReports: ModerationReport[];
  auditLogs: AdminAuditLog[];
}

export function createSampleBudgetLimits(): BudgetLimit[] {
  return [
    { category: 'housing', monthlyLimit: 2200000 },
    { category: 'food', monthlyLimit: 1900000 },
    { category: 'transport', monthlyLimit: 350000 },
    { category: 'study', monthlyLimit: 550000 },
    { category: 'social', monthlyLimit: 450000 },
    { category: 'other', monthlyLimit: 400000 },
  ];
}

export function createSampleExpenses(): ExpenseEntry[] {
  return [
    {
      id: 'exp-housing-1',
      title: 'Phí phòng KTX / nhà trọ chia sẻ tháng này (Minh họa)',
      category: 'housing',
      amount: 1650000,
      date: formatSameMonthDateOffset(10),
      note: 'Đã bao gồm phần chia tiền điện nước cơ bản.',
      isSample: true,
    },
    {
      id: 'exp-transport-1',
      title: 'Vé xe buýt tháng sinh viên (Minh họa)',
      category: 'transport',
      amount: 110000,
      date: formatSameMonthDateOffset(9),
      note: 'Giảm 50% khi dùng thẻ sinh viên/giấy xác nhận.',
      isSample: true,
    },
    {
      id: 'exp-study-1',
      title: 'In đề cương & vở ghi chép 5 học phần',
      category: 'study',
      amount: 185000,
      date: formatSameMonthDateOffset(7),
      note: 'Giáo trình Giải tích mượn tại Thư viện TV-01 nên tiết kiệm được khá nhiều.',
      isSample: true,
    },
    {
      id: 'exp-food-1',
      title: 'Cơm trưa Căng-tin CT-01 (Tuần 1)',
      category: 'food',
      amount: 210000,
      date: formatSameMonthDateOffset(6),
      note: 'Khoảng 35.000đ/suất cho 6 buổi ăn trưa ở trường.',
      isSample: true,
    },
    {
      id: 'exp-other-1',
      title: 'Bình nước giữ nhiệt cá nhân & ổ cắm đa năng',
      category: 'other',
      amount: 195000,
      date: formatSameMonthDateOffset(5),
      note: 'Dùng để lấy nước lọc miễn phí tại trạm nước giảng đường.',
      isSample: true,
    },
    {
      id: 'exp-social-1',
      title: 'Nước uống giao lưu nhóm Cùng Code IT1010',
      category: 'social',
      amount: 75000,
      date: formatSameMonthDateOffset(3),
      note: 'Họp nhóm buổi đầu làm quen.',
      isSample: true,
    },
    {
      id: 'exp-food-2',
      title: 'Mua đồ ăn sáng & trái cây tuần này',
      category: 'food',
      amount: 320000,
      date: formatSameMonthDateOffset(2),
      note: 'Chuẩn bị bữa sáng nhanh trước ca 07:30.',
      isSample: true,
    },
    {
      id: 'exp-transport-2',
      title: 'Phí gửi xe đạp tại BX-01 & bơm xe',
      category: 'transport',
      amount: 45000,
      date: formatSameMonthDateOffset(1),
      isSample: true,
    },
    {
      id: 'exp-food-3',
      title: 'Suất cơm trưa & sữa hạt tại Quầy CT-02',
      category: 'food',
      amount: 55000,
      date: formatSameMonthDateOffset(0),
      isSample: true,
    },
  ];
}

export function createSampleLifeChecklist(): LifeChecklistItem[] {
  return [
    // semester_prep
    {
      id: 'life-prep-1',
      title: 'Kích hoạt email trường, cổng đào tạo & LMS',
      category: 'semester_prep',
      description:
        'Đổi mật khẩu mạnh, bật xác thực 2 lớp và kiểm tra xem đã nhận đủ thông báo các lớp học phần chưa.',
      completed: true,
      tip: 'Ghi nhớ lịch kiểm tra hộp thư trường vào mỗi buổi tối.',
      isSample: true,
    },
    {
      id: 'life-prep-2',
      title: 'Kiểm tra thẻ Bảo hiểm Y tế (BHYT) sinh viên',
      category: 'semester_prep',
      description:
        'Xác nhận thời hạn sử dụng BHYT và nơi đăng ký khám chữa bệnh ban đầu để yên tâm khi cần khám.',
      completed: true,
      tip: 'Lưu ảnh chụp mã thẻ BHYT vào điện thoại phòng khi cần gấp.',
      isSample: true,
    },
    {
      id: 'life-prep-3',
      title: 'Lưu thông tin Cố vấn học tập & Ban cán sự lớp',
      category: 'semester_prep',
      description:
        'Lưu email trường của Cố vấn học tập và nhóm lớp chính thức để không bỏ lỡ thông báo đột xuất.',
      completed: false,
      tip: 'Tránh tham gia các nhóm chat lạ chưa được lớp hoặc khoa xác nhận.',
      isSample: true,
    },
    {
      id: 'life-prep-4',
      title: 'Đi thử lộ trình từ chỗ ở đến từng giảng đường (B1, C1, C2)',
      category: 'semester_prep',
      description:
        'Ước lượng thời gian di chuyển thực tế giờ cao điểm sáng 07:00 để không bị trễ tiết đầu.',
      completed: false,
      isSample: true,
    },
    // essentials
    {
      id: 'life-ess-1',
      title: 'Bình nước cá nhân 500–750ml',
      category: 'essentials',
      description:
        'Lấy nước lọc miễn phí tại trạm nước WC-B1, WC-C2 và sảnh Thư viện TV-01, tiết kiệm đáng kể mỗi tháng.',
      completed: true,
      isSample: true,
    },
    {
      id: 'life-ess-2',
      title: 'Áo mưa gọn & ô gấp bỏ vừa ngăn bên balo',
      category: 'essentials',
      description:
        'Thời tiết chuyển mùa rất dễ mưa bất chợt lúc tan lớp chiều hoặc chờ xe buýt.',
      completed: true,
      isSample: true,
    },
    {
      id: 'life-ess-3',
      title: 'Túi sơ cứu mini & thuốc cảm/dán cá nhân',
      category: 'essentials',
      description:
        'Chuẩn bị vài miếng băng cá nhân, dầu gió, thuốc đau bụng thông thường và nhiệt kế nhỏ.',
      completed: false,
      isSample: true,
    },
    {
      id: 'life-ess-4',
      title: 'Ổ cắm nối dài có công tắc an toàn & tai nghe',
      category: 'essentials',
      description:
        'Hữu ích khi tự học tại phòng KTX/trọ hoặc nghe bài giảng video ở Thư viện mà không làm phiền xung quanh.',
      completed: false,
      isSample: true,
    },
    // saving_tips
    {
      id: 'life-save-1',
      title: 'Mượn giáo trình tại Thư viện TV-01 trước khi mua mới',
      category: 'saving_tips',
      description:
        'Nhiều môn đại cương chỉ dùng giáo trình trong 15 tuần; mượn thư viện hoặc mua lại sách cũ khóa trên giúp tiết kiệm 300.000–600.000đ/kỳ.',
      completed: true,
      tip: 'Đi mượn trong tuần 1–2 để tránh hết bản in.',
      isSample: true,
    },
    {
      id: 'life-save-2',
      title: 'Đăng ký vé xe buýt tháng dành cho sinh viên',
      category: 'saving_tips',
      description:
        'Nếu di chuyển từ 3 ngày/tuần bằng xe buýt, vé tháng sinh viên rẻ hơn nhiều so với mua vé lượt.',
      completed: false,
      isSample: true,
    },
    {
      id: 'life-save-3',
      title: 'Áp dụng quy tắc "chờ 24 giờ" với đồ dùng không thiết yếu',
      category: 'saving_tips',
      description:
        'Tháng đầu lên đại học dễ chi quá tay cho đồ trang trí hoặc ăn vặt; đặt hạn mức từng nhóm chi tiêu trong UniBuddy để theo dõi.',
      completed: false,
      isSample: true,
    },
    // essential_places
    {
      id: 'life-place-1',
      title: 'Bộ phận Một cửa & Phòng Đào tạo (Tòa A1-101 — Minh họa)',
      category: 'essential_places',
      description:
        'Nơi xin giấy xác nhận sinh viên, hỏi về đăng ký học phần và các thủ tục hành chính.',
      completed: true,
      tip: 'Đi vào đầu giờ sáng (07:45) hoặc đầu giờ chiều để ít phải chờ.',
      isSample: true,
    },
    {
      id: 'life-place-2',
      title: 'Phòng Y tế Trường (Nhà YT-01 — Minh họa)',
      category: 'essential_places',
      description:
        'Hỗ trợ sơ cứu, nghỉ ngơi khi mệt giữa buổi học và xác nhận khám y tế trong khuôn viên.',
      completed: false,
      isSample: true,
    },
    {
      id: 'life-place-3',
      title: 'Cụm dịch vụ sinh viên & Hiệu sách gần cổng trường (Khu minh họa)',
      category: 'essential_places',
      description:
        'Khu vực in ấn tài liệu, cửa hàng văn phòng phẩm, siêu thị mini giá sinh viên và điểm dừng xe buýt mẫu.',
      completed: false,
      tip: 'Kiểm tra bản đồ địa phương thực tế xung quanh cơ sở học của bạn.',
      isSample: true,
    },
  ];
}

export function createSampleSupportCenters(): SupportCenter[] {
  return [
    {
      id: 'sup-counseling',
      name: 'Phòng Tư vấn Tâm lý Sinh viên (Minh họa)',
      category: 'counseling',
      description:
        'Lắng nghe bảo mật, đồng hành cùng sinh viên vượt qua áp lực học tập, nỗi nhớ nhà, lo âu thi cử hoặc khó khăn hòa nhập.',
      location: 'Tầng 2 Nhà A2 — Phòng A2-209 (Khu yên tĩnh, Minh họa)',
      openHours: '08:00 – 11:30 & 13:30 – 17:00 (Thứ 2 – Thứ 6) • Minh họa',
      contactNote:
        'Email mẫu: tamly-sv@demo-uni.edu.vn • Đặt lịch riêng tư trực tiếp trong mục này.',
      bookingAvailable: true,
      officialGuidance:
        'Dữ liệu minh họa; hãy tra cứu kênh tư vấn tâm lý chính thức của trường bạn khi cần hỗ trợ thực tế.',
      isSample: true,
    },
    {
      id: 'sup-medical',
      name: 'Phòng Y tế & Chăm sóc Sức khỏe Trường (Minh họa)',
      category: 'medical',
      description:
        'Sơ cứu tai nạn nhẹ, kiểm tra huyết áp/thân nhiệt, hỗ trợ thuốc thông thường và hướng dẫn sử dụng BHYT sinh viên.',
      location: 'Nhà YT-01 (Phía Tây khuôn viên, gần A2 — Minh họa)',
      openHours: '07:00 – 19:00 (Thứ 2 – Thứ 7) • Minh họa',
      contactNote:
        'Số trực mẫu: [Số minh họa] • Liên hệ trực tiếp tại quầy YT-01 hoặc kênh chính thức của trường.',
      bookingAvailable: true,
      officialGuidance:
        'Trong tình huống cấp cứu y tế thực tế ngoài đời, hãy gọi ngay số cấp cứu địa phương hoặc tới cơ sở y tế gần nhất.',
      isSample: true,
    },
    {
      id: 'sup-ctsv',
      name: 'Phòng Công tác Sinh viên & Hỗ trợ Khó khăn (Minh họa)',
      category: 'student_affairs',
      description:
        'Tư vấn học bổng, miễn giảm học phí, vay vốn sinh viên, nội trú KTX và hỗ trợ sinh viên gặp biến cố đột xuất.',
      location: 'Phòng A2-104 (Tầng 1 Nhà A2 — Minh họa)',
      openHours: '07:30 – 11:30 & 13:30 – 17:00 (Thứ 2 – Thứ 6) • Minh họa',
      contactNote:
        'Email mẫu: ctsv-hotro@demo-uni.edu.vn • Cổng thông tin sinh viên chính thức.',
      bookingAvailable: true,
      officialGuidance:
        'Quy trình và địa chỉ là dữ liệu minh họa; kiểm tra thông báo từ Phòng CTSV của trường bạn.',
      isSample: true,
    },
    {
      id: 'sup-advising',
      name: 'Tổ Cố vấn Học tập Năm nhất (Minh họa)',
      category: 'academic_advising',
      description:
        'Hỗ trợ lập kế hoạch học tập học kỳ 1, chọn môn phù hợp năng lực, cải thiện phương pháp ôn thi và phòng tránh cảnh báo học vụ.',
      location: 'Văn phòng Khoa CNTT — Tòa B1 / Gặp trực tuyến (Minh họa)',
      openHours: 'Thứ 3 & Thứ 5 • 14:00 – 16:30 (Hoặc theo lịch hẹn, Minh họa)',
      contactNote: 'Email mẫu: covan-k2026@demo-uni.edu.vn',
      bookingAvailable: true,
      officialGuidance:
        'Liên hệ Cố vấn học tập được phân công chính thức cho lớp sinh hoạt của bạn trên cổng đào tạo.',
      isSample: true,
    },
    {
      id: 'sup-hotline',
      name: 'Đường dây Hỗ trợ & Lắng nghe Sinh viên (Kênh minh họa)',
      category: 'hotline',
      description:
        'Kênh tiếp nhận phản hồi nhanh, hỗ trợ tâm lý ban đầu và kết nối tới đơn vị chuyên trách của trường khi sinh viên cần trò chuyện khẩn.',
      location: 'Hỗ trợ từ xa / Kết nối tại cổng sinh viên',
      openHours: 'Trực hỗ trợ hằng ngày (Khung giờ minh họa)',
      contactNote:
        'Kênh minh họa: [Số minh họa] — Liên hệ chính thức qua đường dây hỗ trợ được công bố trên website trường của bạn.',
      bookingAvailable: false,
      officialGuidance:
        'Đây là mục minh họa trong ứng dụng mẫu, không phải đường dây khẩn cấp thực tế. Hãy luôn ưu tiên số liên hệ chính thức của trường và cơ quan y tế địa phương.',
      isSample: true,
    },
  ];
}

export function createSampleSupportAppointments(): SupportAppointment[] {
  return [
    {
      id: 'appt-demo-1',
      centerId: 'sup-advising',
      centerName: 'Tổ Cố vấn Học tập Năm nhất (Minh họa)',
      date: formatDateOffset(4),
      timeSlot: '14:30 – 15:00',
      mode: 'in_person',
      topic: 'Trao đổi lộ trình học Giải tích 1 & cân bằng thời gian CLB kỳ 1',
      note: 'Mang theo bảng kế hoạch 168 giờ/tuần đã nháp.',
      status: 'scheduled',
      createdAt: formatIsoOffset(-1, 15, 20),
      isPrivate: true,
    },
  ];
}

export function createSampleWellnessGuides(): WellnessGuide[] {
  return [
    {
      id: 'wg-homesickness',
      title: 'Khi mới xa nhà: Làm sao để bớt trống trải trong 2–3 tuần đầu?',
      category: 'homesickness',
      summary:
        'Cảm giác nhớ nhà vào buổi tối hoặc cuối tuần đầu tiên là phản ứng hoàn toàn bình thường của đa số tân sinh viên.',
      practicalSteps: [
        'Giữ lịch gọi điện cố định ngắn 10–15 phút với gia đình vào một khung giờ quen thuộc thay vì chỉ gọi khi quá buồn.',
        'Mang theo một món đồ quen thuộc từ nhà (chiếc cốc, ảnh nhỏ, gối tựa) để góc phòng KTX/trọ ấm áp hơn.',
        'Ra khỏi phòng 30 phút mỗi chiều: đi bộ quanh sân trường, ghé thư viện hoặc tham gia một buổi sinh hoạt nhẹ.',
        'Chia sẻ thật với bạn cùng phòng hoặc người bạn mới quen — nhiều bạn cũng đang cảm thấy giống bạn.',
      ],
      whenToSeekHelp:
        'Nếu nỗi buồn khiến bạn mất ngủ nhiều đêm liền, bỏ bữa kéo dài hơn 2 tuần hoặc không muốn ra khỏi phòng đi học, hãy đặt lịch trò chuyện với Phòng Tư vấn Tâm lý trường.',
      isSample: true,
    },
    {
      id: 'wg-exam-stress',
      title: 'Vượt qua áp lực kỳ kiểm tra giữa kỳ đầu tiên ở đại học',
      category: 'exam_stress',
      summary:
        'Đề thi đại học thường rộng và thiên về hiểu bản chất hơn cấp 3. Chia nhỏ khối lượng ôn giúp giảm lo âu rõ rệt.',
      practicalSteps: [
        'Liệt kê chính xác những chương sẽ thi và tách thành từng khối 45 phút ôn tập cụ thể thay vì nói chung chung "ôn Giải tích".',
        'Ôn theo cặp hoặc nhóm nhỏ 1 buổi để kiểm tra lại những chỗ mình tưởng đã hiểu.',
        'Ngừng nhồi nhét kiến thức mới 1 tiếng trước giờ đi ngủ đêm hôm trước kỳ thi.',
        'Hít thở chậm theo nhịp 4–4–6 trong 2 phút nếu cảm thấy tim đập nhanh khi bước vào phòng thi.',
      ],
      whenToSeekHelp:
        'Nếu cảm giác hoảng loạn, choáng váng hoặc mất tập trung nghiêm trọng lặp lại trước mỗi bài kiểm tra, hãy trao đổi với cố vấn học tập hoặc chuyên viên tâm lý.',
      isSample: true,
    },
    {
      id: 'wg-sleep-balance',
      title: 'Giữ nhịp ngủ đủ giấc khi sáng học 07:30 và tối hay thức khuya',
      category: 'sleep_balance',
      summary:
        'Thiếu ngủ liên tục làm giảm khả năng ghi nhớ bài giảng và dễ khiến bạn cáu gắt, uể oải suốt cả tuần.',
      practicalSteps: [
        'Cố định giờ thức dậy chênh lệch không quá 1 tiếng kể cả ngày cuối tuần để đồng hồ sinh học ổn định.',
        'Đặt "giờ yên tĩnh" (Quiet Hours) trên UniBuddy từ 22:30 và hạn chế caffeine sau 15:00.',
        'Nếu có tiết trống buổi trưa, chợp mắt ngắn 20 phút thay vì ngủ bù 2 tiếng khiến buổi chiều càng mệt.',
      ],
      whenToSeekHelp:
        'Nếu bạn khó vào giấc hoặc tỉnh giấc giữa đêm kéo dài trên 2 tuần kèm mệt mỏi ban ngày, hãy kiểm tra sức khỏe tại Phòng Y tế trường.',
      isSample: true,
    },
    {
      id: 'wg-social-adaptation',
      title: 'Làm quen bạn mới tự nhiên cho người hướng nội ở giảng đường lớn',
      category: 'social_adaptation',
      summary:
        'Bạn không cần phải quen cả lớp ngay tuần đầu; chỉ cần 2–3 người bạn học tin cậy đã giúp năm nhất dễ thở hơn rất nhiều.',
      practicalSteps: [
        'Bắt đầu từ những câu hỏi nhỏ cùng ngữ cảnh: hỏi bài giảng vừa qua, rủ đi ăn trưa căng-tin sau tiết hoặc ghép nhóm bài tập.',
        'Tham gia một Nhóm học tập nhỏ (4–6 người) hoặc CLB đúng sở thích để cuộc trò chuyện có điểm chung sẵn.',
        'Tôn trọng nhịp năng lượng của bản thân: cho phép mình có khoảng thời gian ngồi yên một mình để nạp lại pin.',
      ],
      whenToSeekHelp:
        'Nếu bạn cảm thấy cô lập kéo dài hoặc gặp vấn đề khó xử trong quan hệ bạn cùng phòng/nhóm lớp, Phòng CTSV và Tư vấn tâm lý luôn sẵn sàng lắng nghe.',
      isSample: true,
    },
    {
      id: 'wg-burnout',
      title: 'Nhận diện sớm kiệt sức học tập (Burnout) và cách phục hồi đúng cách',
      category: 'study_burnout',
      summary:
        'Ôm đồm quá nhiều deadline, CLB và việc làm thêm cùng lúc dễ khiến bạn cạn kiệt động lực giữa học kỳ.',
      practicalSteps: [
        'Dừng lại 15 phút để rà soát lịch tuần: tạm gác hoặc xin giảm tải các đầu việc không khẩn cấp.',
        'Áp dụng chu kỳ học 25–45 phút kèm 5–10 phút đứng dậy vươn vai, nhìn xa và uống nước.',
        'Không dùng thời gian "nghỉ ngơi" để lướt mạng xã hội trong cảm giác tội lỗi — hãy chọn nghỉ ngơi có chủ đích như đi dạo, nghe nhạc hoặc ngủ sớm.',
      ],
      whenToSeekHelp:
        'Khi tình trạng kiệt sức, chán nản, mất động lực kéo dài nhiều tuần và ảnh hưởng rõ tới điểm số hoặc sức khỏe, hãy tìm đến Phòng Tư vấn Tâm lý hoặc Cố vấn học tập.',
      isSample: true,
    },
  ];
}

export function createSampleMoodCheckIns(): MoodCheckIn[] {
  return [
    {
      id: 'mood-1',
      date: formatDateOffset(-3),
      createdAt: formatIsoOffset(-3, 21, 15),
      mood: 3,
      energy: 3,
      tags: ['Bỡ ngỡ', 'Háo hức'],
      note: 'Ngày đầu đi tìm phòng học hơi vội nhưng gặp được bạn cùng lớp chỉ đường giúp rất nhiệt tình.',
      isPrivate: true,
    },
    {
      id: 'mood-2',
      date: formatDateOffset(-1),
      createdAt: formatIsoOffset(-1, 21, 40),
      mood: 4,
      energy: 4,
      tags: ['Tập trung', 'Kết nối'],
      note: 'Ôn xong flashcards IT1010 và đăng ký tham gia Ngày hội CLB cùng nhóm bạn.',
      isPrivate: true,
    },
    {
      id: 'mood-3',
      date: formatDateOffset(0),
      createdAt: formatIsoOffset(0, 8, 30),
      mood: 4,
      energy: 3,
      tags: ['Chủ động', 'Hơi bận'],
      note: 'Thấy có 2 deadline trùng nhau sau 2 ngày nữa nên đang chia nhỏ subtask làm dần từ hôm nay.',
      isPrivate: true,
    },
  ];
}

export function createSampleNotifications(): AppNotification[] {
  return [
    {
      id: 'notif-deadline-collision',
      title: 'Cảnh báo trùng 2 hạn chót quan trọng vào 2 ngày tới',
      message:
        'Bạn có 2 bài tập ưu tiên cao cùng hạn nộp trong 2 ngày tới (Lab 02 IT1010 và Trắc nghiệm MI1110). Hãy chia nhỏ việc làm từ hôm nay.',
      category: 'deadline',
      priority: 'urgent',
      createdAt: formatIsoOffset(0, 7, 15),
      read: false,
      isSample: true,
      actionRoute: '/lich',
    },
    {
      id: 'notif-overdue-task',
      title: 'Nhắc hạn chưa hoàn thành: Xác nhận nhóm bài tập MI1110',
      message:
        'Công việc "Xác nhận danh sách nhóm bài tập lớn MI1110" đã qua mốc hẹn hôm qua. Kiểm tra và cập nhật trạng thái ngay nhé.',
      category: 'deadline',
      priority: 'urgent',
      createdAt: formatIsoOffset(0, 7, 30),
      read: false,
      isSample: true,
      actionRoute: '/lich',
    },
    {
      id: 'notif-schedule-today',
      title: 'Lịch học hôm nay: Nhập môn Lập trình tại B1-302',
      message:
        'Ca học bắt đầu lúc 07:30–09:50 tại Phòng B1-302, chiều học Tiếng Anh học thuật B1 tại B1-208 (13:30–15:20).',
      category: 'schedule',
      priority: 'important',
      createdAt: formatIsoOffset(0, 6, 45),
      read: false,
      isSample: true,
      actionRoute: '/lich',
    },
    {
      id: 'notif-group-session',
      title: 'Nhóm Cùng Code IT1010 có buổi ôn tập sắp tới',
      message:
        'Buổi rà soát Lab 02 diễn ra lúc 16:00–17:30 tại Phòng học nhóm tầng 2 - TV-01 sau 2 ngày nữa.',
      category: 'group',
      priority: 'important',
      createdAt: formatIsoOffset(-1, 18, 0),
      read: false,
      isSample: true,
      actionRoute: '/kham-pha',
    },
    {
      id: 'notif-event-updated',
      title: 'Cập nhật địa điểm Workshop Mở khóa Tư duy Lập trình',
      message:
        'CLB IT-Club thông báo chuyển địa điểm sang Phòng Lab B1-305 để tăng thêm 15 chỗ ngồi cho tân sinh viên.',
      category: 'event',
      priority: 'important',
      createdAt: formatIsoOffset(-1, 14, 10),
      read: true,
      isSample: true,
      actionRoute: '/kham-pha',
    },
    {
      id: 'notif-academic-flashcard',
      title: 'Bộ Flashcard & Đề cương ôn tập Giải tích 1 đã sẵn sàng',
      message:
        'Bạn còn 2 thẻ ghi nhớ mới chưa ôn trong môn Giải tích 1 & Đại số tuyến tính (MI1110).',
      category: 'academic',
      priority: 'normal',
      createdAt: formatIsoOffset(-2, 10, 0),
      read: false,
      isSample: true,
      actionRoute: '/mon-hoc/course-mi1110',
    },
    {
      id: 'notif-handbook-welcome',
      title: 'Gợi ý tuần đầu: Cẩm nang Tín chỉ, GPA & Quy chế điểm danh',
      message:
        'Xem bài hướng dẫn minh họa để hiểu cách tính GPA thang 4 và ngưỡng chuyên cần phổ biến.',
      category: 'academic',
      priority: 'normal',
      createdAt: formatIsoOffset(-3, 9, 0),
      read: true,
      isSample: true,
      actionRoute: '/kham-pha',
    },
  ];
}

export function createSampleModerationReports(): ModerationReport[] {
  return [
    {
      id: 'rep-demo-1',
      targetType: 'question',
      targetId: 'q-03',
      targetPreview:
        'Buổi trưa học ở B1 có chỗ nào yên tĩnh để nghỉ hoặc cắm sạc laptop không?',
      reason:
        'Kiểm tra xem câu hỏi có trùng với chủ đề đã có trong Cẩm nang khuôn viên hay nên gắn thẻ gợi ý vị trí TV-01.',
      reportedBy: 'Trợ lý kiểm duyệt mẫu (Editor)',
      createdAt: formatIsoOffset(-1, 15, 0),
      status: 'pending',
    },
    {
      id: 'rep-demo-2',
      targetType: 'group',
      targetId: 'grp-pomodoro',
      targetPreview: 'Phòng Tự học Pomodoro 25/5 — Chống Trì hoãn',
      reason:
        'Xác minh thông tin phòng học nhóm tầng 3 Thư viện TV-01 có phù hợp nội quy giữ yên lặng.',
      reportedBy: 'Thành viên cộng đồng (Minh họa)',
      createdAt: formatIsoOffset(0, 8, 0),
      status: 'pending',
    },
  ];
}

export function createSampleAuditLogs(): AdminAuditLog[] {
  return [
    {
      id: 'audit-demo-1',
      actorName: 'Ban Biên tập Nội dung Mẫu',
      actorRole: 'editor',
      action: 'Cập nhật Cẩm nang & Lịch sự kiện minh họa',
      targetLabel: '12 bài cẩm nang + 7 sự kiện khuôn viên',
      createdAt: formatIsoOffset(-2, 11, 30),
      details:
        'Gắn nhãn dữ liệu minh họa và bổ sung hướng dẫn kiểm tra cổng thông tin chính thức của trường.',
    },
    {
      id: 'audit-demo-2',
      actorName: 'Quản trị viên Hệ thống Mẫu',
      actorRole: 'admin',
      action: 'Khởi tạo bộ dữ liệu năm nhất K2026',
      targetLabel: 'Hệ thống UniBuddy Demo',
      createdAt: formatIsoOffset(-5, 9, 0),
      details: 'Thiết lập dữ liệu học tập, bản đồ 2D và cộng đồng minh họa.',
    },
  ];
}

export function createLifeAndSupportSeedData(): LifeAndSupportSeedData {
  return {
    expenses: createSampleExpenses(),
    budgetLimits: createSampleBudgetLimits(),
    lifeChecklist: createSampleLifeChecklist(),
    supportCenters: createSampleSupportCenters(),
    supportAppointments: createSampleSupportAppointments(),
    wellnessGuides: createSampleWellnessGuides(),
    moodCheckIns: createSampleMoodCheckIns(),
    notifications: createSampleNotifications(),
    moderationReports: createSampleModerationReports(),
    auditLogs: createSampleAuditLogs(),
  };
}

export const SAMPLE_BUDGET_LIMITS = createSampleBudgetLimits();
export const SAMPLE_EXPENSES = createSampleExpenses();
export const SAMPLE_LIFE_CHECKLIST = createSampleLifeChecklist();
export const SAMPLE_SUPPORT_CENTERS = createSampleSupportCenters();
export const SAMPLE_WELLNESS_GUIDES = createSampleWellnessGuides();
export const SAMPLE_NOTIFICATIONS = createSampleNotifications();
