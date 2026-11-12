import type {
  CampusLocation,
  CampusLocationCategory,
  CampusUtilityCategory,
  CampusUtilityService,
} from '../types/models';

export const CAMPUS_LOCATION_CATEGORY_LABELS: Record<
  CampusLocationCategory,
  string
> = {
  building: 'Giảng đường & Học tập',
  library: 'Thư viện',
  medical: 'Y tế',
  canteen: 'Nhà ăn & Căng-tin',
  restroom: 'Nhà vệ sinh & Nước uống',
  parking: 'Bãi gửi xe',
  admin: 'Hành chính & Hỗ trợ',
};

export const CAMPUS_UTILITY_CATEGORY_LABELS: Record<
  CampusUtilityCategory,
  string
> = {
  hours: 'Giờ mở cửa',
  procedure: 'Thủ tục cơ bản',
  contact: 'Đầu mối liên hệ',
  transport: 'Xe buýt & Gửi xe',
};

export interface CampusSeedData {
  campusLocations: CampusLocation[];
  campusUtilities: CampusUtilityService[];
}

export function createCampusLocations(): CampusLocation[] {
  return [
    {
      id: 'loc-admin-a1',
      code: 'A1-101',
      name: 'Tòa nhà Hành chính A1 — Bộ phận Một cửa & Phòng Đào tạo',
      category: 'admin',
      x: 50,
      y: 74,
      openHours: '07:30 – 11:30 & 13:30 – 17:00 (Thứ 2 – Thứ 6, Minh họa)',
      contactNote:
        'Email mẫu: hotro-daotao@demo-uni.edu.vn • Quầy Một cửa Tầng 1 (Thông tin minh họa)',
      floorGuide: [
        'Tầng 1 (A1-101): Bộ phận Một cửa tiếp nhận đơn từ, cấp giấy xác nhận sinh viên',
        'Tầng 2 (A1-202): Phòng Đào tạo đại học & Hỗ trợ đăng ký tín chỉ',
        'Tầng 3 (A1-301): Phòng Kế hoạch - Tài chính & Xác nhận công nợ học phí',
      ],
      routeFromMainGate: [
        'Từ Cổng chính (phía Nam bản đồ), đi thẳng trục đường trung tâm khoảng 80m.',
        'Qua bồn hoa trung tâm, tòa nhà A1 nằm ngay chính diện phía trước.',
        'Đi vào sảnh kính tầng 1 để lấy số thứ tự tại quầy Một cửa.',
      ],
      services: [
        'Cấp giấy xác nhận sinh viên (làm vé xe buýt, vay vốn, tạm hoãn nghĩa vụ)',
        'Hỗ trợ xử lý lỗi đăng ký tín chỉ',
        'Giải đáp bảng điểm & học phí',
      ],
      accessibilityNote: 'Có đường dốc cho xe lăn ở cửa chính và thang máy bên phải sảnh.',
      isSample: true,
    },
    {
      id: 'loc-admin-a2',
      code: 'A2-204',
      name: 'Nhà A2 — Công tác Sinh viên & Giảng đường Lý luận',
      category: 'admin',
      x: 34,
      y: 70,
      openHours: '07:30 – 17:00 (Thứ 2 – Thứ 6, Minh họa)',
      contactNote:
        'Email mẫu: ctsv-hotro@demo-uni.edu.vn • Phòng A2-104 (Thông tin minh họa)',
      floorGuide: [
        'Tầng 1 (A2-104): Văn phòng Công tác Sinh viên, hỗ trợ thẻ SV & học bổng',
        'Tầng 2 (A2-201 – A2-208): Các phòng học lý thuyết nhỏ (bao gồm A2-204)',
        'Tầng 3: Phòng sinh hoạt Đoàn Thanh niên – Hội Sinh viên',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng 60m, rẽ trái tại ngã tư đầu tiên trước Tòa A1.',
        'Đi thêm 40m là tới sảnh chính Nhà A2 bên tay phải.',
      ],
      services: [
        'Phát và cấp lại thẻ sinh viên',
        'Tiếp nhận hồ sơ học bổng, điểm rèn luyện',
        'Phòng học lý thuyết khu A2',
      ],
      accessibilityNote: 'Có lối dốc bậc thềm phía cửa bên và nhà vệ sinh tầng 1.',
      isSample: true,
    },
    {
      id: 'loc-parking-bx1',
      code: 'BX-01',
      name: 'Nhà xe Sinh viên Khu Chính (Cổng Tây)',
      category: 'parking',
      x: 15,
      y: 82,
      openHours: '06:00 – 21:30 hằng ngày (Minh họa)',
      contactNote: 'Chốt bảo vệ Bãi xe BX-01 — Kiểm tra quy định gửi xe tại trường bạn.',
      floorGuide: [
        'Khu A (gần cổng vào): Khu vực xe đạp & xe đạp điện',
        'Khu B (mái che trung tâm): Khu vực xe máy sinh viên',
        'Quầy đầu cổng: Đăng ký vé gửi xe theo tháng',
      ],
      routeFromMainGate: [
        'Ngay khi qua Cổng chính, rẽ trái đi dọc hàng rào khoảng 90m.',
        'Lối vào nhà xe nằm ở phía bên trái, đi chậm theo làn phân luồng.',
      ],
      services: [
        'Gửi xe đạp, xe máy theo lượt hoặc vé tháng',
        'Bơm xe miễn phí tại chốt bảo vệ đầu cổng',
      ],
      accessibilityNote: 'Mặt sân phẳng, không bậc cấp, có lối đi bộ riêng ra khu A2 & YT-01.',
      isSample: true,
    },
    {
      id: 'loc-parking-bx2',
      code: 'BX-02',
      name: 'Bãi xe Khu Đông & Trạm trung chuyển Xe buýt mẫu',
      category: 'parking',
      x: 84,
      y: 80,
      openHours: '05:45 – 21:00 hằng ngày (Minh họa)',
      contactNote: 'Điểm chờ xe buýt mẫu & gửi xe đạp Khu Đông (Thông tin minh họa).',
      floorGuide: [
        'Mặt trước cổng phụ: Điểm dừng tuyến xe buýt mẫu phục vụ sinh viên',
        'Khu trong mái che: Bãi xe đạp và xe máy dự phòng giờ cao điểm',
      ],
      routeFromMainGate: [
        'Từ Cổng chính rẽ phải theo đường vành đai phía Đông khoảng 100m.',
        'Gần cổng phụ phía Đông sẽ thấy biển chỉ dẫn Trạm xe buýt & Nhà xe BX-02.',
      ],
      services: [
        'Điểm đón/trả các tuyến xe buýt mẫu',
        'Gửi xe dự phòng khi BX-01 đông vào sáng Thứ 2',
      ],
      accessibilityNote: 'Có vỉa hè lát gạch dẫn hướng tới trạm chờ xe buýt.',
      isSample: true,
    },
    {
      id: 'loc-medical-yt',
      code: 'YT-01',
      name: 'Phòng Y tế & Sơ cứu Sinh viên',
      category: 'medical',
      x: 18,
      y: 58,
      openHours: '07:00 – 19:00 (Thứ 2 – Thứ 7) • Trực hỗ trợ trong giờ học (Minh họa)',
      contactNote:
        'Kênh minh họa: [Số trực y tế minh họa] — Kiểm tra số khẩn cấp của trường bạn.',
      floorGuide: [
        'Tầng 1 (YT-01): Phòng sơ cứu nhanh, đo huyết áp, phát thuốc thông thường',
        'Phòng nghỉ 101B: Giường nghỉ tạm cho sinh viên mệt hoặc say nắng',
        'Phòng 102: Xác nhận giấy nghỉ ốm học phần',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng rồi rẽ trái qua Nhà A2.',
        'Đi tiếp lên hướng Bắc khoảng 50m dọc lối cây xanh, tòa nhà mái ngói thấp có dấu chữ thập đỏ là YT-01.',
      ],
      services: [
        'Sơ cứu vết thương nhẹ, hạ sốt, cảm cúm thông thường',
        'Nghỉ ngơi khi tụt huyết áp giữa buổi học',
        'Cấp giấy xác nhận khám y tế trong trường',
      ],
      accessibilityNote: 'Cửa vào bằng phẳng ngang mặt sân, thuận tiện cáng hoặc xe lăn.',
      isSample: true,
    },
    {
      id: 'loc-building-b1',
      code: 'B1-302',
      name: 'Giảng đường B1 — Khu Thực hành CNTT & Ngoại ngữ',
      category: 'building',
      x: 28,
      y: 48,
      openHours: '06:30 – 21:00 (Thứ 2 – Thứ 7, Minh họa)',
      contactNote: 'Phòng trực kỹ thuật Lab B1-101 • Email mẫu: lab-b1@demo-uni.edu.vn',
      floorGuide: [
        'Tầng 1 (B1-101 – B1-108): Văn phòng kỹ thuật & sảnh tự học có ổ cắm',
        'Tầng 2 (B1-201 – B1-210): Phòng học Ngoại ngữ & Seminar (có B1-208)',
        'Tầng 3 (B1-301 – B1-308): Phòng Lab máy tính thực hành (có B1-302, B1-305)',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng qua Tòa A1 tới vòng xoay cây xanh giữa sân.',
        'Rẽ trái vào cụm giảng đường phía Tây khoảng 60m, tòa nhà 5 tầng gắn bảng "B1" ở mặt tiền.',
      ],
      services: [
        'Phòng Lab máy tính cho môn Nhập môn Lập trình (IT1010)',
        'Phòng học máy chiếu cho Tiếng Anh học thuật (FL1020)',
        'Ghế đá & ổ cắm sảnh tầng 1 nghỉ giữa tiết',
      ],
      accessibilityNote: 'Có 2 thang máy ở sảnh giữa và nhà vệ sinh tầng 1.',
      isSample: true,
    },
    {
      id: 'loc-building-c1',
      code: 'C1-102',
      name: 'Giảng đường C1 — Kỹ năng & Học phần Chung',
      category: 'building',
      x: 68,
      y: 62,
      openHours: '06:30 – 20:30 (Thứ 2 – Thứ 7, Minh họa)',
      contactNote: 'Quầy bảo vệ sảnh C1 (Thông tin minh họa).',
      floorGuide: [
        'Tầng 1 (C1-101 – C1-106): Phòng học thảo luận bàn ghép linh hoạt (có C1-102)',
        'Tầng 2–3: Các lớp học phần đại cương quy mô 40–60 sinh viên',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng 70m tới trước Tòa A1 rồi rẽ phải.',
        'Đi theo lối đi lát đá khoảng 50m, Tòa C1 nằm ngay bên tay trái.',
      ],
      services: [
        'Phòng học Kỹ năng học đại học (GE1005)',
        'Không gian làm việc nhóm nhỏ tại hành lang tầng 1',
      ],
      accessibilityNote: 'Phòng C1-102 nằm ngay tầng trệt, dễ tiếp cận không cần leo cầu thang.',
      isSample: true,
    },
    {
      id: 'loc-building-c2',
      code: 'C2-105',
      name: 'Giảng đường C2 — Hội trường Lớn & Toán Đại cương',
      category: 'building',
      x: 74,
      y: 44,
      openHours: '06:30 – 21:00 (Thứ 2 – Thứ 7, Minh họa)',
      contactNote: 'Phòng trực thiết bị giảng đường C2-100 (Thông tin minh họa).',
      floorGuide: [
        'Tầng 1 (C2-101 – C2-106): Giảng đường bậc thang 150 chỗ (bao gồm C2-105)',
        'Tầng 2 (C2-201 – C2-204): Phòng thi tập trung & hội thảo khoa học',
        'Tầng 3: Hội trường lớn tổ chức Sinh hoạt công dân & Talkshow',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng qua A1, rẽ phải đi ngang qua Tòa C1.',
        'Tiếp tục đi thẳng về phía Bắc 45m là tới sảnh rộng của Giảng đường C2.',
      ],
      services: [
        'Phòng học Giải tích & Đại số (MI1110)',
        'Địa điểm thi giữa kỳ và hội thảo hướng nghiệp',
      ],
      accessibilityNote: 'Có thang máy bên cánh phải và hàng ghế đầu dành riêng cho người cần hỗ trợ.',
      isSample: true,
    },
    {
      id: 'loc-library-tv',
      code: 'TV-01',
      name: 'Thư viện Trung tâm & Không gian Tự học Yên tĩnh',
      category: 'library',
      x: 50,
      y: 32,
      openHours: '07:00 – 21:30 (Thứ 2 – Thứ 7) • Mở tăng cường tuần thi (Minh họa)',
      contactNote:
        'Email mẫu: thuvien@demo-uni.edu.vn • Quầy thủ thư Tầng 1 (Thông tin minh họa)',
      floorGuide: [
        'Tầng 1 (TV-01): Quầy mượn/trả sách, tủ gửi đồ & khu đọc báo nhanh',
        'Tầng 2: Kho giáo trình năm nhất & phòng học nhóm (đặt trước theo khung giờ)',
        'Tầng 3: Khu tự học yên tĩnh tuyệt đối (có ổ cắm tại mỗi bàn)',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng suốt trục đường trung tâm qua Tòa A1 và sân cờ.',
        'Đi khoảng 180m, tòa nhà mặt kính rộng ở chính giữa khuôn viên là Thư viện TV-01.',
      ],
      services: [
        'Mượn giáo trình & tài liệu tham khảo miễn phí',
        'Đặt phòng thảo luận nhóm 3–6 người',
        'Wi-Fi tốc độ cao & khu tự học điều hòa',
      ],
      accessibilityNote: 'Cửa tự động tầng trệt, thang máy rộng và có bàn học điều chỉnh độ cao.',
      isSample: true,
    },
    {
      id: 'loc-canteen-ct1',
      code: 'CT-01',
      name: 'Căng-tin Trung tâm & Khu Ăn trưa Sinh viên',
      category: 'canteen',
      x: 80,
      y: 26,
      openHours: '06:30 – 19:30 (Thứ 2 – Thứ 7, Minh họa)',
      contactNote: 'Quầy phản ánh chất lượng dịch vụ tại sảnh CT-01 (Thông tin minh họa).',
      floorGuide: [
        'Tầng 1: Quầy cơm suất sinh viên, bún/phở sáng và quầy nước giải khát',
        'Tầng 2: Khu bàn ăn có quạt mát & ổ cắm ngồi làm bài buổi trưa',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng tới gần Thư viện TV-01 rồi rẽ phải qua phía sau Nhà C2.',
        'Đi thêm 40m là tới Căng-tin CT-01 nằm cạnh sân cây xanh phía Đông Bắc.',
      ],
      services: [
        'Suất cơm trưa sinh viên giá tiết kiệm',
        'Bữa sáng nhanh trước tiết 1',
        'Khu vực hâm nóng đồ ăn mang theo',
      ],
      accessibilityNote: 'Tầng 1 hoàn toàn bằng phẳng, lối đi rộng giữa các dãy bàn.',
      isSample: true,
    },
    {
      id: 'loc-canteen-ct2',
      code: 'CT-02',
      name: 'Quầy Cà phê Tự học & Đồ ăn nhẹ Sảnh B1',
      category: 'canteen',
      x: 36,
      y: 36,
      openHours: '07:00 – 18:00 (Thứ 2 – Thứ 6, Minh họa)',
      contactNote: 'Nằm giữa lối đi từ Giảng đường B1 sang Thư viện TV-01 (Minh họa).',
      floorGuide: [
        'Khu kiosk ngoài trời có mái che: Bánh mì, sữa hạt, cà phê & nước suối',
        'Dãy bàn cao ngoài trời cho nhóm trao đổi nhanh 15–30 phút',
      ],
      routeFromMainGate: [
        'Đi tới khu vực Giảng đường B1, nhìn về phía đường nối sang Thư viện TV-01.',
        'Quầy CT-02 nằm ngay dưới hàng mái che nối hai tòa nhà.',
      ],
      services: [
        'Đồ ăn nhẹ giờ giải lao 10 phút',
        'Chỗ ngồi trao đổi bài tập ngắn ngoài trời',
      ],
      isSample: true,
    },
    {
      id: 'loc-restroom-wc1',
      code: 'WC-B1',
      name: 'Khu Vệ sinh & Trạm Nước uống Miễn phí Khu Tây (B1)',
      category: 'restroom',
      x: 20,
      y: 36,
      openHours: '06:00 – 21:30 theo giờ mở cửa giảng đường (Minh họa)',
      contactNote: 'Nằm ở cánh Tây tầng 1 gần Giảng đường B1.',
      floorGuide: [
        'Sảnh ngoài: Máy lọc nước nóng/lạnh miễn phí (mang theo bình cá nhân)',
        'Bên trong: Khu vệ sinh nam/nữ riêng biệt & buồng tiếp cận xe lăn',
      ],
      routeFromMainGate: [
        'Đi tới Giảng đường B1 rồi vòng ra hành lang phía bên trái tầng 1.',
        'Biển chỉ dẫn màu xanh lam đặt ngay đầu hành lang cạnh trạm nước uống.',
      ],
      services: [
        'Trạm lấy nước uống miễn phí cho bình cá nhân',
        'Khu vệ sinh sạch sẽ có lối tiếp cận cho người khuyết tật',
      ],
      accessibilityNote: 'Có 1 buồng vệ sinh rộng kèm tay vịn ở tầng trệt.',
      isSample: true,
    },
    {
      id: 'loc-restroom-wc2',
      code: 'WC-C2',
      name: 'Khu Vệ sinh & Rửa tay Khu Đông (Gần C2 & CT-01)',
      category: 'restroom',
      x: 86,
      y: 42,
      openHours: '06:30 – 21:00 (Thứ 2 – Thứ 7, Minh họa)',
      contactNote: 'Nằm giữa Giảng đường C2 và lối lên Căng-tin CT-01.',
      floorGuide: [
        'Khu bồn rửa tay ngoài trời thuận tiện trước/sau giờ ăn trưa',
        'Khu vệ sinh tầng trệt phục vụ khu Đông',
      ],
      routeFromMainGate: [
        'Đi qua Giảng đường C2 theo lối hướng lên Căng-tin CT-01.',
        'Khu WC-C2 nằm bên phải lối đi có mái che.',
      ],
      services: [
        'Khu rửa tay trước giờ ăn',
        'Trạm nạp nước uống lọc RO miễn phí',
      ],
      isSample: true,
    },
    {
      id: 'loc-building-ht01',
      code: 'HT-01',
      name: 'Nhà Đa năng & Sân Sinh hoạt Câu lạc bộ',
      category: 'building',
      x: 50,
      y: 14,
      openHours: '07:00 – 21:30 hằng ngày (Minh họa)',
      contactNote:
        'Văn phòng Hội Sinh viên sảnh HT-01 • Email mẫu: clb-hoisv@demo-uni.edu.vn',
      floorGuide: [
        'Tầng 1: Sân cầu lông, bóng rổ trong nhà & khu tổ chức Ngày hội CLB',
        'Tầng 2: Phòng tập nhạc Acoustic, phòng họp các CLB kỹ năng',
      ],
      routeFromMainGate: [
        'Từ Cổng chính đi thẳng qua Tòa A1 và Thư viện TV-01 về phía cuối khuôn viên.',
        'Nhà mái vòm rộng ở phía Bắc chính là Nhà Đa năng HT-01.',
      ],
      services: [
        'Địa điểm tổ chức Ngày hội Tân sinh viên & giải thể thao',
        'Phòng sinh hoạt định kỳ cho các CLB văn nghệ, kỹ năng, thể thao',
      ],
      accessibilityNote: 'Cửa chính rộng, có lối dốc trực tiếp vào khán đài tầng 1.',
      isSample: true,
    },
  ];
}

export function createCampusUtilities(): CampusUtilityService[] {
  return [
    {
      id: 'util-hours-campus',
      title: 'Giờ mở cửa Giảng đường, Thư viện & Khu Tự học',
      category: 'hours',
      summary:
        'Khung giờ hoạt động phổ biến của các tòa nhà học tập và không gian tự học trong tuần.',
      details: [
        'Giảng đường B1, C1, C2 mở cửa từ 06:30 đến 21:00 (Thứ 2 – Thứ 7).',
        'Thư viện TV-01 mở cửa 07:00 – 21:30; tầng 3 phục vụ tự học yên tĩnh.',
        'Ngày Chủ nhật chỉ mở khu vực Nhà Đa năng HT-01 và một số phòng tự học theo thông báo tuần thi.',
      ],
      scheduleOrHours: '06:30 – 21:30 (Thứ 2 – Thứ 7) • Minh họa',
      contactNote: 'Xem thông báo điều chỉnh giờ nghỉ lễ tại cổng thông tin trường bạn.',
      officialGuidance:
        'Thông tin minh họa giúp bạn làm quen bố cục trường; hãy kiểm tra giờ mở cửa chính thức tại trường của bạn.',
      isSample: true,
    },
    {
      id: 'util-hours-canteen',
      title: 'Khung giờ phục vụ Căng-tin & Trạm nước uống miễn phí',
      category: 'hours',
      summary:
        'Nắm khung giờ cao điểm ăn trưa để tránh phải xếp hàng quá lâu giữa hai ca học.',
      details: [
        'Căng-tin CT-01 phục vụ bữa sáng từ 06:30 và cơm trưa từ 10:45 – 13:30.',
        'Khung giờ đông nhất thường rơi vào 11:45 – 12:25; bạn có thể ghé sớm lúc 11:15 nếu tan ca sớm.',
        'Các trạm nước lọc miễn phí tại WC-B1, WC-C2 và sảnh TV-01 hoạt động suốt giờ mở cửa tòa nhà.',
      ],
      scheduleOrHours: '06:30 – 19:30 (Thứ 2 – Thứ 7) • Minh họa',
      contactNote: 'Góp ý dịch vụ căng-tin qua hòm thư sảnh CT-01 (Minh họa).',
      officialGuidance:
        'Mức giá và giờ mở cửa mang tính minh họa cho sinh viên năm nhất tham khảo.',
      isSample: true,
    },
    {
      id: 'util-proc-onestop',
      title: 'Quy trình xin giấy xác nhận sinh viên tại Bộ phận Một cửa',
      category: 'procedure',
      summary:
        'Các bước phổ biến để xin giấy xác nhận đang theo học (làm vé xe buýt, vay vốn hoặc hồ sơ cá nhân).',
      details: [
        'Bước 1: Gửi yêu cầu trực tuyến trên cổng sinh viên (nếu trường hỗ trợ) hoặc điền phiếu tại quầy A1-101.',
        'Bước 2: Xuất trình Thẻ sinh viên hoặc CCCD để đối chiếu thông tin MSSV và lớp sinh hoạt.',
        'Bước 3: Nhận giấy hẹn (thường sau 1–2 ngày làm việc) và kiểm tra kỹ dấu mộc trước khi rời quầy.',
      ],
      scheduleOrHours: '07:30 – 11:30 & 13:30 – 17:00 (Thứ 2 – Thứ 6) • Minh họa',
      contactNote: 'Email mẫu: hotro-daotao@demo-uni.edu.vn • Quầy A1-101.',
      officialGuidance:
        'Nội dung minh họa quy trình hành chính phổ biến; kiểm tra hướng dẫn chính thức của trường bạn.',
      isSample: true,
    },
    {
      id: 'util-proc-lostfound',
      title: 'Thủ tục báo mất & nhận lại đồ thất lạc trong khuôn viên',
      category: 'procedure',
      summary:
        'Làm gì ngay khi bỏ quên bình nước, thẻ sinh viên, USB hoặc áo khoác tại giảng đường?',
      details: [
        'Quay lại phòng học ngay giờ giải lao kế tiếp hoặc hỏi phòng trực kỹ thuật/bảo vệ tại tầng 1 tòa nhà đó.',
        'Nếu đồ nhặt được đã chuyển về điểm tập trung, tới Phòng Công tác Sinh viên A2-104 để mô tả đặc điểm và ký nhận.',
        'Trường hợp mất thẻ sinh viên hoặc chìa khóa xe, báo khóa thẻ ngay để tránh phát sinh rắc rối.',
      ],
      scheduleOrHours: 'Tiếp nhận trong giờ hành chính tại A2-104 (Minh họa)',
      contactNote: 'Email mẫu: ctsv-hotro@demo-uni.edu.vn • Phòng trực các tòa nhà.',
      officialGuidance:
        'Quy trình minh họa; kiểm tra kênh thông báo đồ thất lạc chính thức của trường/đoàn hội bạn.',
      isSample: true,
    },
    {
      id: 'util-contact-academic',
      title: 'Đầu mối Phòng Đào tạo & Cố vấn Học tập năm nhất',
      category: 'contact',
      summary:
        'Kênh liên hệ mẫu khi cần hỏi về đăng ký môn học, trùng lịch thi hoặc kế hoạch học tập học kỳ 1.',
      details: [
        'Hỏi về đăng ký tín chỉ, rút môn, chuyển nhóm lớp: Phòng Đào tạo (A1-202).',
        'Hỏi về lộ trình môn chuyên ngành, phương pháp học, điểm số: Cố vấn học tập lớp sinh hoạt.',
        'Khi gửi email, luôn dùng email sinh viên và ghi rõ: [Họ tên - MSSV - Lớp - Vấn đề cần hỗ trợ].',
      ],
      scheduleOrHours: 'Phản hồi mẫu trong 1–2 ngày làm việc (Thứ 2 – Thứ 6)',
      contactNote:
        'Email mẫu: hotro-daotao@demo-uni.edu.vn • [Số điện thoại minh họa]',
      officialGuidance:
        'Thông tin liên hệ mẫu để minh họa; vui lòng tra cứu danh bạ chính thức trên website trường bạn.',
      isSample: true,
    },
    {
      id: 'util-contact-it',
      title: 'Hỗ trợ kỹ thuật: Tài khoản Email trường, LMS & Wi-Fi',
      category: 'contact',
      summary:
        'Cách xử lý nhanh khi quên mật khẩu cổng đào tạo hoặc không kết nối được Wi-Fi tại giảng đường.',
      details: [
        'Thử đăng nhập lại bằng trình duyệt ẩn danh nếu hệ thống LMS báo hết phiên đột ngột.',
        'Nếu quên mật khẩu tài khoản trường, mang CCCD/Thẻ SV tới quầy hỗ trợ CNTT hoặc gửi email từ địa chỉ dự phòng đã đăng ký.',
        'Không chia sẻ mật khẩu cổng đào tạo hoặc mã OTP cho người lạ.',
      ],
      scheduleOrHours: '07:30 – 17:00 (Thứ 2 – Thứ 6) • Minh họa',
      contactNote: 'Email mẫu: it-support@demo-uni.edu.vn • Quầy tầng 1 B1-101 (Minh họa)',
      officialGuidance:
        'Kênh hỗ trợ minh họa; kiểm tra hướng dẫn kỹ thuật từ Trung tâm CNTT của trường bạn.',
      isSample: true,
    },
    {
      id: 'util-trans-bus',
      title: 'Tuyến xe buýt minh họa kết nối Cổng trường & Khu KTX',
      category: 'transport',
      summary:
        'Gợi ý cách theo dõi điểm dừng xe buýt gần cổng Đông (BX-02) và mẹo đi buýt giờ cao điểm.',
      details: [
        'Tuyến mẫu B01 (Minh họa): Cổng Đông BX-02 ↔ Khu KTX sinh viên ↔ Ga trung chuyển (tần suất 12–15 phút/chuyến).',
        'Tuyến mẫu B02 (Minh họa): Cổng Chính ↔ Bến xe khu vực ↔ Cụm trọ phía Nam (tần suất 15–20 phút/chuyến).',
        'Mẹo năm nhất: Xuất phát sớm hơn 15 phút vào sáng Thứ 2 và mang theo vé tháng/tiền lẻ.',
      ],
      scheduleOrHours: '05:30 – 21:00 hằng ngày (Lịch trình minh họa)',
      contactNote: 'Trạm chờ BX-02 (Cổng phụ phía Đông). Xem bản đồ giao thông địa phương thực tế.',
      officialGuidance:
        'Các mã tuyến B01/B02 là dữ liệu minh họa; hãy tra cứu tuyến xe buýt thực tế của thành phố bạn.',
      isSample: true,
    },
    {
      id: 'util-trans-parking',
      title: 'Hướng dẫn gửi xe đạp, xe máy & làm vé tháng trong trường',
      category: 'transport',
      summary:
        'Phân khu nhà xe BX-01/BX-02, lưu ý giữ thẻ từ và khung giờ cao điểm đầu buổi sáng.',
      details: [
        'Luôn khóa cổ và cất mũ bảo hiểm gọn vào cốp hoặc treo chắc chắn trước khi rời bãi xe.',
        'Vé tháng sinh viên thường mở đăng ký vào tuần đầu mỗi tháng tại chốt bảo vệ BX-01 (mang theo Thẻ SV & giấy đăng ký xe).',
        'Nếu đến sát giờ vào lớp (07:20–07:35), cân nhắc bãi BX-02 để tránh ùn ứ cổng chính.',
      ],
      scheduleOrHours: '06:00 – 21:30 hằng ngày (Minh họa)',
      contactNote: 'Chốt bảo vệ BX-01 & BX-02 (Thông tin minh họa).',
      officialGuidance:
        'Nội quy minh họa; hãy tuân theo mức phí và quy định gửi xe chính thức của trường bạn.',
      isSample: true,
    },
  ];
}

export function createCampusSeedData(): CampusSeedData {
  return {
    campusLocations: createCampusLocations(),
    campusUtilities: createCampusUtilities(),
  };
}

export const SAMPLE_CAMPUS_LOCATIONS = createCampusLocations();
export const SAMPLE_CAMPUS_UTILITIES = createCampusUtilities();
