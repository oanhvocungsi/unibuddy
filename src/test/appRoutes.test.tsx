import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { Modal, SampleDataBadge, ToastProvider } from '../components/ui';
import { createInitialSeedData } from '../data';
import { AppStoreProvider } from '../store/appStore';

function renderAtRoute(route: string, role: 'student' | 'admin' = 'student') {
  const seed = createInitialSeedData();
  seed.profile.role = role;

  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AppStoreProvider initialState={seed}>
          <AppRoutes />
        </AppStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('AppRoutes integration & Modal focus stability', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it.each<{ path: string; heading: RegExp; role?: 'student' | 'admin' }>([
    { path: '/', heading: /Hôm nay/i },
    { path: '/lich', heading: /Lịch & Việc/i },
    { path: '/mon-hoc', heading: /Môn học của tôi/i },
    { path: '/mon-hoc/course-it1010', heading: /Nhập môn Lập trình/i },
    { path: '/kham-pha?tab=map', heading: /Khám phá & Cộng đồng/i },
    { path: '/ho-tro?tab=budget', heading: /Đời sống/i },
    { path: '/thong-bao', heading: /Trung tâm thông báo/i },
    { path: '/tai-khoan', heading: /Tài khoản/i },
    { path: '/huong-dan-bat-dau', heading: /Thiết lập nhanh/i },
    { path: '/dang-nhap', heading: /UniBuddy/i },
    { path: '/quan-tri', heading: /Khu vực Quản trị & Biên tập/i, role: 'admin' },
    { path: '/duong-dan-khong-ton-tai', heading: /Không tìm thấy trang này/i },
  ])('renders wired route $path cleanly', ({ path, heading, role }) => {
    renderAtRoute(path, role ?? 'student');
    expect(
      screen.getAllByRole('heading', { level: 1, name: heading }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders ForbiddenState on /quan-tri when role is student', () => {
    renderAtRoute('/quan-tri', 'student');
    expect(
      screen.getByText(/không có quyền truy cập/i),
    ).toBeInTheDocument();
  });

  it('keeps input focus stable inside Modal when parent re-renders on each keystroke', async () => {
    const user = userEvent.setup();

    function ModalFormHarness() {
      const [open, setOpen] = useState(true);
      const [text, setText] = useState('');
      return (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Kiểm tra giữ tiêu điểm"
        >
          <label htmlFor="modal-input">Tên môn học</label>
          <input
            id="modal-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Modal>
      );
    }

    render(<ModalFormHarness />);
    const input = screen.getByLabelText('Tên môn học');
    await user.click(input);
    await user.type(input, 'Giải tích 1');

    expect(input).toHaveValue('Giải tích 1');
    expect(document.activeElement).toBe(input);
  });

  it('manages mobile drawer focus and closes on Escape while restoring focus', async () => {
    const user = userEvent.setup();
    renderAtRoute('/');

    const menuButton = screen.getByRole('button', {
      name: /Mở menu điều hướng/i,
    });
    await user.click(menuButton);

    const closeBtn = screen.getByRole('button', { name: /Đóng menu/i });
    expect(document.activeElement).toBe(closeBtn);

    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: /Menu điều hướng/i }),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(menuButton);
  });

  it('allows long SampleDataBadge labels to wrap without overflow', () => {
    const { container } = render(
      <SampleDataBadge label="Nội dung minh họa — đối chiếu quy chế chính thức của trường" />,
    );
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain('whitespace-normal');
    expect(badge.className).toContain('max-w-full');
  });
});
