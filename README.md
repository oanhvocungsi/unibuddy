# UniBuddy — Đồng hành cùng sinh viên năm nhất

Ứng dụng web hỗ trợ sinh viên năm nhất ổn định nhịp học tập và đời sống đại học: theo dõi thời khóa biểu tuần, quản lý deadline và cảnh báo trùng hạn, không gian học tập theo từng môn, tra cứu sổ tay tân sinh viên, bản đồ campus tương tác, kết nối câu lạc bộ/nhóm học và quản lý chi tiêu cá nhân kèm nhật ký cân bằng tinh thần riêng tư.

> **Lưu ý về dữ liệu minh họa:** Toàn bộ dữ liệu có sẵn trong ứng dụng (tên trường mẫu, phòng học, tuyến xe buýt, địa chỉ liên hệ phòng ban, học phần, câu lạc bộ, sự kiện và bài viết sổ tay) đều là **dữ liệu mẫu minh họa** được gắn nhãn `Dữ liệu mẫu minh họa`. Khi áp dụng thực tế, sinh viên cần đối chiếu với cổng thông tin và văn bản chính thức của trường mình.

## Công nghệ sử dụng

- **Frontend:** React 19, TypeScript, Vite, React Router DOM
- **Giao diện:** Tailwind CSS v4, Lucide Icons, font `Be Vietnam Pro` & `Plus Jakarta Sans`
- **Lưu trữ:** `localStorage` (`unibuddy_v1_state`) hỗ trợ xuất/nhập bản sao lưu JSON và nhập/xuất lịch học chuẩn RFC-5545 (`.ics`)
- **Kiểm thử:** Vitest + React Testing Library + jsdom

## Cấu trúc thư mục chính

- `src/types/models.ts`: Hợp đồng kiểu dữ liệu TypeScript dùng chung cho toàn ứng dụng
- `src/data/`: Bộ dữ liệu mẫu tiếng Việt theo các nhóm học tập, sổ tay, bản đồ campus, cộng đồng và đời sống/hỗ trợ (ngày sự kiện và deadline tính động theo ngày hiện tại)
- `src/store/appStore.tsx`: Context store tập trung toàn bộ trạng thái, đồng bộ `localStorage`, giao diện Sáng/Tối, chế độ giảm chuyển động và các hành động CRUD
- `src/utils/`: Tiện ích xử lý ngày/giờ Việt Nam (`dateUtils.ts`), phân tích & xuất file lịch `.ics` (`icsUtils.ts`), gộp class (`cn.ts`)
- `src/components/ui/`: Hệ thống component tái sử dụng chuẩn WCAG (`Button`, `Card`, `Badge`, `Modal` có focus-trap/Escape, `Toast`, `StateViews`, `SampleDataBadge`)
- `src/components/layout/`: Khung điều hướng `AppShell` (sidebar desktop + bottom nav mobile + focus mode banner) và tìm kiếm nhanh `GlobalSearchModal` (`Ctrl+K`)

## Hướng dẫn chạy dự án

```bash
# 1. Cài đặt phụ thuộc
pnpm install

# 2. Chạy môi trường phát triển
pnpm dev

# 3. Kiểm tra kiểu TypeScript
npx tsc --noEmit

# 4. Chạy bộ kiểm thử đơn vị
pnpm test

# 5. Đóng gói bản production
pnpm build
```
