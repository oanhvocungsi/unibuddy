import type {
  CampusEvent,
  CampusEventCategory,
  Club,
  ClubField,
  CommunityQuestion,
  CommunityTopic,
  StudyGroup,
} from '../types/models';
import { formatDateOffset, formatIsoOffset } from './academicSeedData';

export const CLUB_FIELD_LABELS: Record<ClubField, string> = {
  academic: 'Học thuật & Chuyên môn',
  skills: 'Kỹ năng mềm & Nghề nghiệp',
  sports: 'Thể thao & Sức khỏe',
  volunteer: 'Tình nguyện & Cộng đồng',
  arts: 'Nghệ thuật & Truyền thông',
};

export const EVENT_CATEGORY_LABELS: Record<CampusEventCategory, string> = {
  orientation: 'Định hướng tân sinh viên',
  academic: 'Học thuật & Kỹ năng',
  club: 'Sinh hoạt CLB',
  career: 'Hướng nghiệp',
  sports: 'Thể thao',
  culture: 'Văn hóa & Giao lưu',
};

export const COMMUNITY_TOPIC_LABELS: Record<CommunityTopic, string> = {
  registration: 'Đăng ký môn học',
  courses: 'Môn học & Ôn thi',
  campus_life: 'Đời sống khuôn viên',
  housing: 'KTX & Nhà trọ',
  clubs: 'Câu lạc bộ',
  study_tips: 'Mẹo học tập',
};

export interface CommunitySeedData {
  clubs: Club[];
  events: CampusEvent[];
  questions: CommunityQuestion[];
  studyGroups: StudyGroup[];
}

export function createSampleClubs(): Club[] {
  return [
    {
      id: 'club-it',
      name: 'Câu lạc bộ Lập trình & Công nghệ Trẻ (IT-Club)',
      shortName: 'IT-Club',
      field: 'academic',
      description:
        'Nơi sinh viên năm nhất cùng luyện giải thuật căn bản, làm dự án web đầu tay và nhận kèm cặp 1-1 từ anh chị khóa trên.',
      meetingSchedule: 'Thứ 7 hằng tuần • 14:00–16:30',
      location: 'Phòng Lab B1-302 & B1-305',
      memberCount: 148,
      highlights: [
        'Lớp ôn Nhập môn Lập trình miễn phí trước kỳ thi',
        'Workshop Git & GitHub cho người mới bắt đầu',
        'Ghép nhóm làm đồ án nhỏ cuối học kỳ',
      ],
      contactNote: 'Email mẫu: itclub@demo-uni.edu.vn • Bàn tuyển TV tại HT-01',
      joined: true,
      isSample: true,
    },
    {
      id: 'club-eec',
      name: 'Câu lạc bộ Tiếng Anh Học thuật & Giao tiếp (EEC)',
      shortName: 'EEC',
      field: 'academic',
      description:
        'Không gian luyện nói tiếng Anh thân thiện không sợ sai, thực hành viết học thuật và chuẩn bị chứng chỉ ngoại ngữ.',
      meetingSchedule: 'Thứ 4 hằng tuần • 17:30–19:00',
      location: 'Sảnh tự học B1-208',
      memberCount: 112,
      highlights: [
        'Speaking Circle theo chủ đề đời sống sinh viên',
        'Sửa bài Academic Paragraph cùng mentor',
        'CLB đọc sách song ngữ mỗi tháng',
      ],
      contactNote: 'Email mẫu: eec-club@demo-uni.edu.vn',
      joined: false,
      isSample: true,
    },
    {
      id: 'club-skills',
      name: 'Câu lạc bộ Kỹ năng Mềm & Thuyết trình (SpeakUp)',
      shortName: 'SpeakUp',
      field: 'skills',
      description:
        'Giúp tân sinh viên tự tin thuyết trình trước đám đông, làm việc nhóm hiệu quả và rèn tư duy phản biện.',
      meetingSchedule: 'Thứ 5 cách tuần • 18:00–19:45',
      location: 'Phòng C1-102',
      memberCount: 95,
      highlights: [
        'Thực hành nói 3 phút trước nhóm nhỏ an toàn',
        'Kỹ năng thiết kế slide tối giản, dễ đọc',
        'Workshop quản lý thời gian mùa thi',
      ],
      contactNote: 'Email mẫu: speakup@demo-uni.edu.vn',
      joined: false,
      isSample: true,
    },
    {
      id: 'club-badminton',
      name: 'Câu lạc bộ Cầu lông Sinh viên Năm nhất (ShuttleK26)',
      shortName: 'ShuttleK26',
      field: 'sports',
      description:
        'Giao lưu cầu lông sau giờ học để giải tỏa căng thẳng, phù hợp cả với bạn mới tập cầm vợt lần đầu.',
      meetingSchedule: 'Thứ 3 & Thứ 6 • 17:15–19:00',
      location: 'Nhà Đa năng HT-01',
      memberCount: 84,
      highlights: [
        'Chia nhóm theo trình độ từ cơ bản đến nâng cao',
        'Cho mượn vợt dự phòng buổi trải nghiệm đầu tiên',
        'Giải giao hữu Tân sinh viên mỗi học kỳ',
      ],
      contactNote: 'Liên hệ tại quầy CLB sân HT-01 (Thông tin minh họa)',
      joined: false,
      isSample: true,
    },
    {
      id: 'club-volunteer',
      name: 'Đội Sinh viên Tình nguyện Tiếp sức (TSV)',
      shortName: 'TSV',
      field: 'volunteer',
      description:
        'Tham gia hoạt động hỗ trợ tân sinh viên nhập học, hiến máu nhân đạo và các chương trình cộng đồng vào cuối tuần.',
      meetingSchedule: 'Chủ nhật (2 lần/tháng) • 08:30–11:00',
      location: 'Sảnh Nhà A2 & Sân trung tâm',
      memberCount: 165,
      highlights: [
        'Đội hình hướng dẫn đường và thủ tục tuần đầu',
        'Chiến dịch xanh làm sạch khuôn viên',
        'Cấp giấy chứng nhận tham gia hoạt động minh họa',
      ],
      contactNote: 'Email mẫu: tinhnguyen-tsv@demo-uni.edu.vn',
      joined: false,
      isSample: true,
    },
    {
      id: 'club-music',
      name: 'Câu lạc bộ Guitar & Âm nhạc Acoustic (UniTone)',
      shortName: 'UniTone',
      field: 'arts',
      description:
        'Kết nối bạn yêu ca hát, chơi nhạc cụ và tổ chức các đêm nhạc giao lưu nhẹ nhàng giữa những tuần thi căng thẳng.',
      meetingSchedule: 'Thứ 6 hằng tuần • 18:30–20:30',
      location: 'Phòng tập tầng 2 — Nhà Đa năng HT-01',
      memberCount: 78,
      highlights: [
        'Lớp đệm hát cơ bản cho người chưa biết hợp âm',
        'Đêm nhạc Acoustic chào tân sinh viên hàng tháng',
      ],
      contactNote: 'Email mẫu: unitone-music@demo-uni.edu.vn',
      joined: false,
      isSample: true,
    },
    {
      id: 'club-media',
      name: 'Câu lạc bộ Truyền thông & Nhiếp ảnh (FocusLab)',
      shortName: 'FocusLab',
      field: 'arts',
      description:
        'Thực hành chụp ảnh sự kiện khuôn viên, viết bài truyền thông và thiết kế ấn phẩm cho các hoạt động sinh viên.',
      meetingSchedule: 'Thứ 7 cách tuần • 09:00–11:00',
      location: 'Phòng sinh hoạt A2-302',
      memberCount: 64,
      highlights: [
        'Thực hành bố cục ảnh bằng điện thoại',
        'Workshop thiết kế poster thông tin dễ đọc',
      ],
      contactNote: 'Email mẫu: focuslab@demo-uni.edu.vn',
      joined: false,
      isSample: true,
    },
  ];
}

export function createSampleEvents(): CampusEvent[] {
  return [
    {
      id: 'evt-orientation-fair',
      title: 'Ngày hội Tân sinh viên & Kết nối Câu lạc bộ K2026',
      organizer: 'Hội Sinh viên & Tổ Hỗ trợ Năm nhất (Minh họa)',
      category: 'orientation',
      date: formatDateOffset(1),
      startTime: '15:30',
      endTime: '17:30',
      location: 'Nhà Đa năng HT-01',
      description:
        'Tham quan 15 gian hàng CLB, nhận bản đồ khuôn viên bản cứng, hỏi đáp trực tiếp về tín chỉ và giao lưu cùng mentor khóa trên.',
      status: 'upcoming',
      capacity: 220,
      registeredCount: 168,
      registered: true,
      addedToCalendar: true,
      isSample: true,
    },
    {
      id: 'evt-volunteer-orientation',
      title: 'Buổi gặp mặt làm quen Đội Tình nguyện Tiếp sức (TSV)',
      organizer: 'Đội Sinh viên Tình nguyện Tiếp sức',
      clubId: 'club-volunteer',
      category: 'club',
      date: formatDateOffset(2),
      startTime: '17:45',
      endTime: '19:15',
      location: 'Sảnh tầng 1 Nhà A2',
      description:
        'Giới thiệu lịch hoạt động thiện nguyện tháng này, chia ban hậu cần/truyền thông và làm quen bạn mới cùng khóa.',
      status: 'upcoming',
      capacity: 60,
      registeredCount: 41,
      registered: false,
      addedToCalendar: false,
      isSample: true,
    },
    {
      id: 'evt-study-skills',
      title: 'Chuyên đề: Ghi chép Cornell & Quản lý tuần thi không thức đêm',
      organizer: 'CLB Kỹ năng Mềm SpeakUp & Phòng Đào tạo (Minh họa)',
      clubId: 'club-skills',
      category: 'academic',
      date: formatDateOffset(3),
      startTime: '16:00',
      endTime: '17:45',
      location: 'Phòng C1-102',
      description:
        'Chia sẻ cách phân bổ 168 giờ/tuần, xử lý tuần trùng nhiều deadline và tránh học dồn trước ngày thi.',
      status: 'upcoming',
      capacity: 80,
      registeredCount: 74,
      registered: false,
      addedToCalendar: false,
      isSample: true,
    },
    {
      id: 'evt-coding-bootcamp',
      title: 'Workshop Mở khóa Tư duy Lập trình & Gỡ lỗi cho K2026',
      organizer: 'CLB Lập trình IT-Club',
      clubId: 'club-it',
      category: 'club',
      date: formatDateOffset(4),
      startTime: '14:00',
      endTime: '16:30',
      location: 'Phòng Lab B1-305',
      description:
        'Hướng dẫn cách đọc thông báo lỗi biên dịch, dùng debugger từng bước và ôn tập trọng tâm môn IT1010.',
      status: 'updated',
      statusNote:
        'Đã chuyển từ B1-302 sang Phòng Lab B1-305 để tăng thêm 15 chỗ ngồi.',
      capacity: 65,
      registeredCount: 53,
      registered: false,
      addedToCalendar: false,
      isSample: true,
    },
    {
      id: 'evt-badminton-friendly',
      title: 'Giao lưu Cầu lông Chào tân sinh viên ShuttleK26',
      organizer: 'CLB Cầu lông ShuttleK26',
      clubId: 'club-badminton',
      category: 'sports',
      date: formatDateOffset(5),
      startTime: '17:30',
      endTime: '19:30',
      location: 'Nhà Đa năng HT-01',
      description:
        'Buổi đánh giao hữu đôi nam nữ và hướng dẫn kỹ thuật cầm vợt cơ bản cho người mới.',
      status: 'cancelled',
      statusNote:
        'Tạm hoãn để bảo trì mặt sân Nhà Đa năng HT-01; ban tổ chức sẽ thông báo lịch bù mới.',
      capacity: 40,
      registeredCount: 32,
      registered: false,
      addedToCalendar: false,
      isSample: true,
    },
    {
      id: 'evt-career-talk',
      title: 'Tọa đàm: Sinh viên năm nhất chuẩn bị gì cho lộ trình 4 năm?',
      organizer: 'Trung tâm Hỗ trợ Nghề nghiệp (Minh họa)',
      category: 'career',
      date: formatDateOffset(6),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Hội trường C2-105',
      description:
        'Gặp gỡ cựu sinh viên chia sẻ về chọn môn tự chọn, xây dựng hồ sơ dự án nhỏ và cân bằng học ngoại ngữ sớm.',
      status: 'upcoming',
      capacity: 150,
      registeredCount: 109,
      registered: false,
      addedToCalendar: false,
      isSample: true,
    },
    {
      id: 'evt-acoustic-night',
      title: 'Đêm nhạc Acoustic Tháng 11: Giai điệu Mùa Tựu trường',
      organizer: 'CLB Âm nhạc UniTone',
      clubId: 'club-music',
      category: 'culture',
      date: formatDateOffset(7),
      startTime: '19:00',
      endTime: '21:00',
      location: 'Sân khấu nhỏ Nhà Đa năng HT-01',
      description:
        'Thưởng thức các tiết mục hát mộc, giao lưu kết bạn cùng sinh viên nhiều khoa và thưởng thức trà nóng miễn phí.',
      status: 'upcoming',
      capacity: 120,
      registeredCount: 88,
      registered: false,
      addedToCalendar: false,
      isSample: true,
    },
  ];
}

export function createSampleQuestions(): CommunityQuestion[] {
  return [
    {
      id: 'q-01',
      title: 'Lỡ đăng ký trùng giờ hai môn tự chọn ở tuần đầu thì xử lý thế nào?',
      content:
        'Mình mới xem lại thời khóa biểu trên cổng đào tạo thì phát hiện 2 lớp bị trùng tiết chiều Thứ 4. Trường hợp này mình tự đổi trên web hay phải nộp đơn lên Phòng Đào tạo ạ?',
      topic: 'registration',
      authorName: 'Trần Hoàng Long',
      authorCohort: 'K2026 • Khoa Cơ khí',
      createdAt: formatIsoOffset(-3, 10, 20),
      tags: ['đăng ký tín chỉ', 'trùng lịch', 'add/drop'],
      votes: 24,
      resolved: true,
      isSample: true,
      answers: [
        {
          id: 'ans-01-1',
          questionId: 'q-01',
          authorName: 'Lê Bảo Ngọc',
          authorRoleLabel: 'Mentor K2024',
          content:
            'Nếu vẫn đang trong đợt điều chỉnh đăng ký (add/drop) 2 tuần đầu kỳ, bạn vào cổng đào tạo hủy 1 lớp và chọn nhóm lớp khác còn chỗ trống là được. Chỉ khi đã khóa cổng mới cần nộp đơn tại A1-101 nhé.',
          createdAt: formatIsoOffset(-3, 11, 5),
          votes: 19,
          isHelpfulAccepted: true,
        },
        {
          id: 'ans-01-2',
          questionId: 'q-01',
          authorName: 'Nguyễn Minh Anh',
          authorRoleLabel: 'Sinh viên K2026',
          content:
            'Cảm ơn chị, nhớ chụp ảnh xác nhận lại sau khi đổi để đối chiếu học phí nữa nha bạn!',
          createdAt: formatIsoOffset(-3, 14, 12),
          votes: 5,
        },
      ],
    },
    {
      id: 'q-02',
      title: 'Môn Giải tích 1 & Đại số tuyến tính nên ôn từ đâu để không bị ngợp?',
      content:
        'Mấy buổi đầu giảng viên đi tốc độ khá nhanh so với cấp 3. Các anh chị cho mình xin kinh nghiệm học để theo kịp và chuẩn bị cho bài kiểm tra giữa kỳ với ạ.',
      topic: 'courses',
      authorName: 'Phạm Quỳnh Chi',
      authorCohort: 'K2026 • Khoa CNTT',
      createdAt: formatIsoOffset(-2, 16, 40),
      tags: ['MI1110', 'giải tích', 'ôn thi giữa kỳ'],
      votes: 31,
      resolved: true,
      isSample: true,
      answers: [
        {
          id: 'ans-02-1',
          questionId: 'q-02',
          authorName: 'Đỗ Quang Huy',
          authorRoleLabel: 'Trợ giảng CLB Học thuật',
          content:
            'Đừng cố thuộc công thức rời rạc ngay. Sau mỗi buổi học, bạn làm lại ngay 3–5 bài tập mẫu cuối slide, ghi chú dạng bài hay sai vào Sổ tay môn học và ôn thẻ flashcard định nghĩa trước khi vào phần chứng minh.',
          createdAt: formatIsoOffset(-2, 18, 10),
          votes: 22,
          isHelpfulAccepted: true,
        },
      ],
    },
    {
      id: 'q-03',
      title: 'Buổi trưa học ở B1 có chỗ nào yên tĩnh để nghỉ hoặc cắm sạc laptop không?',
      content:
        'Sáng mình học ở B1-302, chiều học tiếp B1-208 nên muốn ở lại trường luôn. Có khu nào mát, có ổ cắm mà không phải đi quá xa không mọi người?',
      topic: 'campus_life',
      authorName: 'Võ Gia Bảo',
      authorCohort: 'K2026 • Khoa Điện - Điện tử',
      createdAt: formatIsoOffset(-1, 12, 15),
      tags: ['giảng đường B1', 'ổ cắm', 'buổi trưa'],
      votes: 15,
      resolved: false,
      isSample: true,
      answers: [
        {
          id: 'ans-03-1',
          questionId: 'q-03',
          authorName: 'Hoàng Thu Trang',
          authorRoleLabel: 'Sinh viên K2025',
          content:
            'Bạn đi bộ sang Thư viện TV-01 tầng 3 có ổ cắm từng bàn rất yên tĩnh, hoặc ngồi sảnh tầng 1 B1-101 cũng có dãy ghế nhưng buổi trưa sẽ hơi đông hơn chút.',
          createdAt: formatIsoOffset(-1, 13, 0),
          votes: 11,
        },
      ],
    },
    {
      id: 'q-04',
      title: 'Chưa có xe máy thì ở KTX hay tìm trọ gần tuyến xe buýt mẫu tiện hơn?',
      content:
        'Mình ở tỉnh lên nhập học, hiện chưa có xe máy. Mọi người chia sẻ giúp ưu nhược điểm giữa ở KTX và thuê phòng trọ gần trường cho năm nhất nhé.',
      topic: 'housing',
      authorName: 'Lê Thanh Thảo',
      authorCohort: 'K2026 • Kinh tế Số',
      createdAt: formatIsoOffset(-4, 20, 0),
      tags: ['KTX', 'nhà trọ', 'xe buýt'],
      votes: 28,
      resolved: true,
      isSample: true,
      answers: [
        {
          id: 'ans-04-1',
          questionId: 'q-04',
          authorName: 'Nguyễn Đức Thịnh',
          authorRoleLabel: 'Đội Tình nguyện TSV',
          content:
            'Kỳ đầu chưa quen đường, KTX lợi về chi phí, an ninh và đi bộ/đi buýt tới lớp dễ hơn nhiều. Nếu thuê trọ ngoài, bạn ưu tiên chỗ cách điểm dừng xe buýt dưới 500m và kiểm tra kỹ hợp đồng giá điện nước nhé.',
          createdAt: formatIsoOffset(-4, 21, 10),
          votes: 20,
          isHelpfulAccepted: true,
        },
      ],
    },
    {
      id: 'q-05',
      title: 'Kỳ 1 mình muốn tham gia 2 CLB cùng lúc có bị quá tải không?',
      content:
        'Mình thích cả CLB Lập trình IT-Club và CLB Cầu lông để rèn sức khỏe, nhưng sợ lịch sinh hoạt đè lên lịch ôn thi.',
      topic: 'clubs',
      authorName: 'Bùi Nhật Nam',
      authorCohort: 'K2026 • Khoa CNTT',
      createdAt: formatIsoOffset(-1, 9, 45),
      tags: ['câu lạc bộ', 'cân bằng thời gian'],
      votes: 12,
      resolved: false,
      isSample: true,
      answers: [
        {
          id: 'ans-05-1',
          questionId: 'q-05',
          authorName: 'Trần Khánh Linh',
          authorRoleLabel: 'Chủ nhiệm CLB SpeakUp (Minh họa)',
          content:
            '1 CLB học thuật + 1 CLB thể thao là công thức khá đẹp vì không bị trùng mục tiêu và giúp đổi gió sau giờ ngồi máy. Lưu ý chọn CLB thể thao linh hoạt buổi tập vào cuối tuần hoặc chiều muộn bạn rảnh.',
          createdAt: formatIsoOffset(-1, 10, 30),
          votes: 9,
        },
      ],
    },
    {
      id: 'q-06',
      title: 'Cách tính GPA thang điểm 4 ở năm nhất và môn 2 tín chỉ ảnh hưởng thế nào?',
      content:
        'Mình nghe nói các môn nhiều tín chỉ kéo GPA mạnh hơn môn 2 tín chỉ. Có công thức đơn giản để tự nhẩm mục tiêu điểm cuối kỳ không?',
      topic: 'study_tips',
      authorName: 'Đặng Minh Thư',
      authorCohort: 'K2026 • Quản trị Kinh doanh',
      createdAt: formatIsoOffset(-5, 19, 20),
      tags: ['GPA', 'tín chỉ', 'mục tiêu học tập'],
      votes: 36,
      resolved: true,
      isSample: true,
      answers: [
        {
          id: 'ans-06-1',
          questionId: 'q-06',
          authorName: 'Lê Bảo Ngọc',
          authorRoleLabel: 'Mentor K2024',
          content:
            'Đúng rồi bạn: GPA = Tổng (Điểm hệ 4 × Số tín chỉ) / Tổng số tín chỉ. Ví dụ môn 4 tín chỉ như IT1010 hay MI1110 tác động gấp đôi môn 2 tín chỉ như GE1005. Bạn xem bài "Hiểu đúng về Tín chỉ & GPA" trong Cẩm nang để rõ ví dụ hơn nhé.',
          createdAt: formatIsoOffset(-5, 20, 5),
          votes: 27,
          isHelpfulAccepted: true,
        },
      ],
    },
    {
      id: 'q-07',
      title: 'Thẻ sinh viên bản cứng chưa phát kịp thì mượn sách thư viện bằng gì?',
      content:
        'Lớp mình tuần sau mới nhận thẻ cứng nhưng giảng viên đã dặn lên Thư viện TV-01 mượn giáo trình Giải tích. Không biết dùng mã hồ sơ tạm có được không?',
      topic: 'campus_life',
      authorName: 'Phan Gia Khánh',
      authorCohort: 'K2026 • Kỹ thuật Máy tính',
      createdAt: formatIsoOffset(0, 8, 10),
      tags: ['thẻ sinh viên', 'thư viện', 'giáo trình'],
      votes: 8,
      resolved: false,
      isSample: true,
      answers: [
        {
          id: 'ans-07-1',
          questionId: 'q-07',
          authorName: 'Nguyễn Minh Anh',
          authorRoleLabel: 'Sinh viên K2026',
          content:
            'Hôm qua mình hỏi quầy thủ thư tầng 1 TV-01 thì được hướng dẫn mang CCCD kèm màn hình đăng nhập cổng sinh viên để đọc tại chỗ, còn mượn về nhà sẽ kích hoạt sau khi có mã thẻ chính thức (tùy quy định từng trường).',
          createdAt: formatIsoOffset(0, 8, 40),
          votes: 4,
        },
      ],
    },
  ];
}

export function createSampleStudyGroups(): StudyGroup[] {
  return [
    {
      id: 'grp-it1010',
      name: 'Nhóm Cùng Code IT1010 — K2026',
      courseCode: 'IT1010',
      courseName: 'Nhập môn Lập trình',
      topic: 'Ôn vòng lặp, mảng 1 chiều và rà soát bài Lab hằng tuần',
      description:
        'Nhóm học tập 4–6 bạn cùng lớp CNTT giúp nhau đọc hiểu đề bài Lab, tập viết test case biên và không copy code.',
      scheduleNote: 'Thứ 4 & Chủ nhật • 16:00–17:30',
      locationNote: 'Phòng học nhóm tầng 2 — Thư viện TV-01',
      memberCount: 5,
      maxMembers: 8,
      joined: true,
      members: [
        'Nguyễn Minh Anh (Bạn)',
        'Phạm Quỳnh Chi',
        'Bùi Nhật Nam',
        'Lê Minh Khoa',
        'Trần Bảo Châu',
      ],
      isSample: true,
      sessions: [
        {
          id: 'sess-it-1',
          groupId: 'grp-it1010',
          title: 'Rà soát bài tập Lab 02: Vòng lặp & Mảng 1 chiều',
          date: formatDateOffset(2),
          startTime: '16:00',
          endTime: '17:30',
          locationOrLink: 'Phòng học nhóm tầng 2 - TV-01',
          agenda:
            'Mỗi bạn trình bày 1 bài và cùng nhau kiểm tra các test biên (n = 0, số âm).',
          addedToCalendar: true,
        },
        {
          id: 'sess-it-2',
          groupId: 'grp-it1010',
          title: 'Luyện đề mẫu trước kiểm tra thực hành giữa kỳ',
          date: formatDateOffset(6),
          startTime: '15:00',
          endTime: '17:00',
          locationOrLink: 'Sảnh tự học B1-101',
          agenda: 'Bấm giờ làm thử 2 bài thuật toán cơ bản trong 60 phút.',
          addedToCalendar: false,
        },
      ],
    },
    {
      id: 'grp-mi1110',
      name: 'Ôn Toán Đại Cương MI1110 (Từ Gốc đến Vững)',
      courseCode: 'MI1110',
      courseName: 'Giải tích 1 & Đại số tuyến tính ứng dụng',
      topic: 'Luyện bài tập Giới hạn, Đạo hàm và Ma trận trước kỳ thi giữa kỳ',
      description:
        'Nhóm dành cho bạn nào thấy tiến độ trên giảng đường hơi nhanh, cùng chữa bài từng bước từ dễ đến khó.',
      scheduleNote: 'Thứ 3 & Thứ 6 • 15:30–17:00',
      locationNote: 'Tầng 2 Thư viện TV-01 (Bàn nhóm 04)',
      memberCount: 6,
      maxMembers: 10,
      joined: false,
      members: [
        'Đỗ Quang Huy (Mentor)',
        'Võ Gia Bảo',
        'Phan Gia Khánh',
        'Nguyễn Thảo Vy',
        'Trần Gia Huy',
        'Hoàng Anh Tuấn',
      ],
      isSample: true,
      sessions: [
        {
          id: 'sess-mi-1',
          groupId: 'grp-mi1110',
          title: 'Tổng ôn 4 dạng vô định & Bảng vô cùng bé tương đương',
          date: formatDateOffset(1),
          startTime: '15:30',
          endTime: '17:00',
          locationOrLink: 'Tầng 2 Thư viện TV-01',
          agenda: 'Chữa 10 bài tập trọng tâm và ghi chú mẹo nhận diện nhanh.',
          addedToCalendar: false,
        },
        {
          id: 'sess-mi-2',
          groupId: 'grp-mi1110',
          title: 'Giải thử đề giữa kỳ MI1110 trong 60 phút',
          date: formatDateOffset(4),
          startTime: '15:30',
          endTime: '17:00',
          locationOrLink: 'Phòng tự học TV-01',
          agenda: 'Thi thử nghiêm túc và chấm chéo để phát hiện lỗi tính toán.',
          addedToCalendar: false,
        },
      ],
    },
    {
      id: 'grp-fl1020',
      name: 'Luyện Viết & Nói Tiếng Anh Học thuật B1 Mỗi Tuần',
      courseCode: 'FL1020',
      courseName: 'Tiếng Anh học thuật B1',
      topic: 'Đọc góp ý đoạn văn 150 từ và luyện phản xạ nói theo cặp',
      description:
        'Không gian luyện tiếng Anh nhẹ nhàng, không chê bai lỗi phát âm, tập trung sửa cấu trúc câu học thuật.',
      scheduleNote: 'Thứ 5 • 17:00–18:15',
      locationNote: 'Khu bàn cao Quầy CT-02 hoặc Online',
      memberCount: 4,
      maxMembers: 6,
      joined: false,
      members: [
        'Hoàng Thu Trang',
        'Lê Thanh Thảo',
        'Nguyễn Bảo Trâm',
        'Đặng Minh Thư',
      ],
      isSample: true,
      sessions: [
        {
          id: 'sess-fl-1',
          groupId: 'grp-fl1020',
          title: 'Peer-review đoạn văn chủ đề University Transition',
          date: formatDateOffset(3),
          startTime: '17:00',
          endTime: '18:15',
          locationOrLink: 'Khu bàn cao CT-02 (Sảnh B1)',
          agenda: 'Đổi bài đọc chéo theo cặp và luyện đọc tóm tắt 2 phút.',
          addedToCalendar: false,
        },
      ],
    },
    {
      id: 'grp-ss1010',
      name: 'Sơ đồ hóa Triết học Mác - Lênin & Thảo luận',
      courseCode: 'SS1010',
      courseName: 'Triết học Mác - Lênin',
      topic: 'Vẽ sơ đồ tư duy các quy luật và chuẩn bị câu hỏi thảo luận lớp',
      description:
        'Thay vì học vẹt từng trang dài, cả nhóm cùng chuyển hóa kiến thức thành sơ đồ ngắn kèm ví dụ đời sống sinh viên.',
      scheduleNote: 'Thứ 7 • 09:00–10:30',
      locationNote: 'Phòng C1-102',
      memberCount: 5,
      maxMembers: 8,
      joined: false,
      members: [
        'Nguyễn Hải Yến',
        'Trần Hoàng Long',
        'Lê Minh Khôi',
        'Phạm Ngọc Hân',
        'Vũ Đức Anh',
      ],
      isSample: true,
      sessions: [
        {
          id: 'sess-ss-1',
          groupId: 'grp-ss1010',
          title: 'Vẽ sơ đồ 2 nguyên lý & 3 quy luật phép biện chứng',
          date: formatDateOffset(5),
          startTime: '09:00',
          endTime: '10:30',
          locationOrLink: 'Phòng C1-102',
          agenda: 'Mỗi người chuẩn bị 1 ví dụ thực tế gắn với việc học đại học.',
          addedToCalendar: false,
        },
      ],
    },
    {
      id: 'grp-pomodoro',
      name: 'Phòng Tự học Pomodoro 25/5 — Chống Trì hoãn',
      topic: 'Ngồi học tập trung cùng nhau 2 tiếng vào buổi tối không lướt điện thoại',
      description:
        'Nhóm mở cho sinh viên mọi khoa: đầu giờ viết 2 mục tiêu cần xong, tắt chuông điện thoại và chạy 3 phiên Pomodoro 25 phút.',
      scheduleNote: 'Thứ 2 & Thứ 5 • 19:00–21:00',
      locationNote: 'Khu Yên tĩnh Tầng 3 — Thư viện TV-01',
      memberCount: 7,
      maxMembers: 12,
      joined: false,
      members: [
        'Lê Bảo Ngọc',
        'Trần Khánh Linh',
        'Võ Gia Bảo',
        'Đặng Minh Thư',
        'Phan Gia Khánh',
        'Bùi Nhật Nam',
        'Nguyễn Thảo Vy',
      ],
      isSample: true,
      sessions: [
        {
          id: 'sess-pomo-1',
          groupId: 'grp-pomodoro',
          title: 'Phiên Tự học Tập trung Buổi tối (3 chu kỳ 25/5)',
          date: formatDateOffset(1),
          startTime: '19:00',
          endTime: '21:00',
          locationOrLink: 'Tầng 3 Thư viện TV-01',
          agenda: 'Check-in mục tiêu 5 phút đầu, tự học yên tĩnh, tổng kết lúc 20:55.',
          addedToCalendar: false,
        },
      ],
    },
  ];
}

export function createCommunitySeedData(): CommunitySeedData {
  return {
    clubs: createSampleClubs(),
    events: createSampleEvents(),
    questions: createSampleQuestions(),
    studyGroups: createSampleStudyGroups(),
  };
}

export const SAMPLE_CLUBS = createSampleClubs();
export const SAMPLE_EVENTS = createSampleEvents();
export const SAMPLE_QUESTIONS = createSampleQuestions();
export const SAMPLE_STUDY_GROUPS = createSampleStudyGroups();
