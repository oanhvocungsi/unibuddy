import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ui';
import { createInitialSeedData } from '../../data';
import { AppStoreProvider, STORAGE_KEY } from '../../store/appStore';
import type { AppState } from '../../types/models';
import { AccountPage } from '../account/AccountPage';
import { AdminPage } from '../account/AdminPage';
import { AuthPage } from '../account/AuthPage';
import { OnboardingPage } from '../account/OnboardingPage';
import { NotificationsPage } from '../notifications/NotificationsPage';
import { SupportAndLifePage } from './SupportAndLifePage';

function renderWithAppProviders(
  initialEntries: string[],
  customState?: AppState,
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastProvider>
        <AppStoreProvider initialState={customState}>
          <Routes>
            <Route path="/" element={<div>Trang chủ Hôm nay</div>} />
            <Route path="/ho-tro" element={<SupportAndLifePage />} />
            <Route path="/thong-bao" element={<NotificationsPage />} />
            <Route path="/huong-dan-bat-dau" element={<OnboardingPage />} />
            <Route path="/dang-nhap" element={<AuthPage />} />
            <Route path="/tai-khoan" element={<AccountPage />} />
            <Route path="/quan-tri" element={<AdminPage />} />
          </Routes>
        </AppStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('Support, Notifications, Account & Admin Features', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('adds an expense and triggers budget limit warning when >= 80% or > 100%', async () => {
    const user = userEvent.setup();
    renderWithAppProviders(['/ho-tro?tab=budget']);

    expect(
      screen.getByText(/Quản lý thu chi thủ công — không yêu cầu kết nối tài khoản ngân hàng/i),
    ).toBeInTheDocument();

    // Sample food expenses total 585,000 / 1,900,000 (31%). Adding 1,500,000 crosses 100%!
    await user.type(
      screen.getByLabelText(/Tên khoản chi/i),
      'Mua đồ nấu ăn tháng mới',
    );
    await user.type(screen.getByLabelText(/Số tiền \(VND\)/i), '1500000');
    await user.click(screen.getByRole('button', { name: /Thêm khoản chi/i }));

    const alertRegion = await screen.findByRole('alert', {
      name: /Cảnh báo ngân sách/i,
    });
    expect(alertRegion).toBeInTheDocument();
    expect(within(alertRegion).getByText(/Vượt ngân sách/i)).toBeInTheDocument();
    expect(
      within(alertRegion).getByText(/Ăn uống hằng ngày/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Mua đồ nấu ăn tháng mới')).toBeInTheDocument();
  });

  it('displays explicit privacy lock banner and saves a private mood check-in', async () => {
    const user = userEvent.setup();
    renderWithAppProviders(['/ho-tro?tab=mood']);

    expect(
      screen.getByText(
        /Hoàn toàn riêng tư — dữ liệu cảm xúc chỉ lưu trên máy bạn và không bao giờ hiển thị cho bạn bè hay quản trị viên/i,
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Tâm trạng mức 5: Rất phấn khởi/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /Năng lượng mức 4: Đủ sức học/i }),
    );
    await user.type(
      screen.getByLabelText(/Ghi chú riêng tư/i),
      'Hoàn thành xong bài lab đầu tiên nên thấy nhẹ nhõm hơn hẳn.',
    );
    await user.click(
      screen.getByRole('button', { name: /Lưu check-in riêng tư/i }),
    );

    expect(
      await screen.findByText(
        'Hoàn thành xong bài lab đầu tiên nên thấy nhẹ nhõm hơn hẳn.',
      ),
    ).toBeInTheDocument();

    const savedRaw = window.localStorage.getItem(STORAGE_KEY);
    expect(savedRaw).toContain('"isPrivate":true');
    expect(savedRaw).toContain(
      'Hoàn thành xong bài lab đầu tiên nên thấy nhẹ nhõm hơn hẳn.',
    );
  });

  it('renders ForbiddenState on AdminPage when role is student and renders admin tabs when role is admin', async () => {
    const user = userEvent.setup();
    const studentSeed = createInitialSeedData();
    studentSeed.profile.role = 'student';

    const firstRender = renderWithAppProviders(['/quan-tri'], studentSeed);

    expect(
      screen.getByText(/Bạn không có quyền truy cập khu vực quản trị nội dung/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /Đăng thông báo mẫu/i }),
    ).not.toBeInTheDocument();

    firstRender.unmount();

    const adminSeed = createInitialSeedData();
    adminSeed.profile.role = 'admin';
    renderWithAppProviders(['/quan-tri'], adminSeed);

    expect(
      screen.getByRole('tab', { name: /Đăng thông báo mẫu/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Quản lý Cẩm nang/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Quản lý Sự kiện & Địa điểm/i }),
    ).toBeInTheDocument();

    const modTab = screen.getByRole('tab', { name: /Kiểm duyệt & Nhật ký/i });
    await user.click(modTab);
    expect(
      screen.getByRole('heading', { name: /Kiểm duyệt báo cáo/i }),
    ).toBeInTheDocument();
  });

  it('allows skipping OnboardingPage cleanly and validates AuthPage email', async () => {
    const user = userEvent.setup();
    const obRender = renderWithAppProviders(['/huong-dan-bat-dau']);

    await user.click(screen.getByRole('button', { name: /^Bỏ qua$/i }));
    expect(await screen.findByText('Trang chủ Hôm nay')).toBeInTheDocument();
    obRender.unmount();

    renderWithAppProviders(['/dang-nhap']);
    expect(
      screen.getAllByText(/Xác thực mô phỏng cục bộ/i).length,
    ).toBeGreaterThanOrEqual(1);

    const emailInput = screen.getByLabelText(/Email sinh viên/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'khong-hop-le');
    await user.click(
      screen.getByRole('button', { name: /Đăng nhập cục bộ/i }),
    );

    expect(
      await screen.findByText(/Vui lòng nhập địa chỉ email hợp lệ/i),
    ).toBeInTheDocument();
  });

  it('shows invalid JSON error on AccountPage restore and marks notifications read', async () => {
    const user = userEvent.setup();
    const accRender = renderWithAppProviders(['/tai-khoan']);

    await user.type(
      screen.getByLabelText(/Hoặc dán chuỗi JSON sao lưu/i),
      'not-valid-json',
    );
    await user.click(screen.getByRole('button', { name: /^Khôi phục$/i }));
    expect(
      await screen.findByText(/Không thể đọc tệp JSON/i),
    ).toBeInTheDocument();
    accRender.unmount();

    renderWithAppProviders(['/thong-bao']);
    const markAllBtn = screen.getByRole('button', {
      name: /Đánh dấu tất cả đã đọc/i,
    });
    await user.click(markAllBtn);
    expect(screen.getByText('0 chưa đọc')).toBeInTheDocument();
  });
});
