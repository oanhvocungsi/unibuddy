import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ui';
import { createInitialSeedData } from '../../data';
import { AppStoreProvider } from '../../store/appStore';
import type { AppState } from '../../types/models';
import { formatFullDateVi, todayKey } from '../../utils/dateUtils';
import { DashboardPage } from './DashboardPage';

function renderDashboard(overrideState?: Partial<AppState>) {
  const base = createInitialSeedData();
  const initialState: AppState = {
    ...base,
    ...overrideState,
    profile: {
      ...base.profile,
      ...(overrideState?.profile ?? {}),
    },
    settings: {
      ...base.settings,
      ...(overrideState?.settings ?? {}),
    },
    simulation: {
      ...base.simulation,
      ...(overrideState?.simulation ?? {}),
    },
  };

  return render(
    <MemoryRouter>
      <ToastProvider>
        <AppStoreProvider initialState={initialState}>
          <DashboardPage />
        </AppStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders personalized greeting, formatted Vietnamese date, semester, and onboarding prompt when incomplete', () => {
    renderDashboard({
      profile: {
        ...createInitialSeedData().profile,
        onboardingCompleted: false,
      },
    });

    expect(
      screen.getByRole('heading', { name: 'Hôm nay', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Minh Anh')).toBeInTheDocument();
    expect(
      screen.getByText(formatFullDateVi(todayKey())),
    ).toBeInTheDocument();
    expect(screen.getByText('Học kỳ 1 (2026–2027)')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Thiết lập ngay/i }),
    ).toHaveAttribute('href', '/huong-dan-bat-dau');
  });

  it('displays same-day deadline collision warning and toggles quick-todo completion', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // Seed data intentionally places 2 todo tasks on today + 2
    expect(
      screen.getByText(/Cảnh báo trùng hạn nộp cùng ngày/i),
    ).toBeInTheDocument();

    const taskTitle =
      'Viết đoạn văn 150 từ: Thích nghi tuần đầu đại học';
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`Đánh dấu hoàn thành: ${taskTitle}`, 'i'),
    });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      expect(
        screen.queryByRole('checkbox', {
          name: new RegExp(`Đánh dấu hoàn thành: ${taskTitle}`, 'i'),
        }),
      ).not.toBeInTheDocument();
    });

    // Can inspect recently completed items and verify it was marked done
    await user.click(
      screen.getByRole('button', {
        name: /Xem \d+ việc đã hoàn thành gần đây/i,
      }),
    );
    expect(
      screen.getByRole('checkbox', {
        name: new RegExp(`Bỏ đánh dấu hoàn thành: ${taskTitle}`, 'i'),
      }),
    ).toBeChecked();
  });

  it('supports inline quick-add task and quick postpone (+1 ngày)', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const quickInput = screen.getByLabelText('Nội dung việc cần làm nhanh');
    await user.click(quickInput);
    await user.paste('Chuẩn bị thẻ sinh viên bản sao');
    await user.click(screen.getByRole('button', { name: 'Thêm việc' }));

    const todoList = screen.getByRole('list', {
      name: 'Danh sách việc cần làm',
    });
    expect(
      within(todoList).getByText('Chuẩn bị thẻ sinh viên bản sao'),
    ).toBeInTheDocument();

    const postponeBtn = within(todoList).getByRole('button', {
      name: 'Dời +1 ngày cho Chuẩn bị thẻ sinh viên bản sao',
    });
    await user.click(postponeBtn);
    expect(
      screen.getByText(/Đã dời "Chuẩn bị thẻ sinh viên bản sao" sang/i),
    ).toBeInTheDocument();
  });

  it('shows exact empty invitation when there is no schedule today and allows widget customization', async () => {
    const user = userEvent.setup();
    renderDashboard({ scheduleEvents: [] });

    expect(
      screen.getByText(
        'Bạn chưa có lịch học hôm nay. Thêm lịch đầu tiên hoặc mở thời khóa biểu.',
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Tùy chỉnh bảng tổng quan/i }),
    );
    expect(
      screen.getByText('Tùy chỉnh bố cục bảng tổng quan'),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Ẩn mục Lối tắt quan trọng' }),
    );
    expect(
      screen.queryByRole('heading', { name: 'Lối tắt quan trọng' }),
    ).not.toBeInTheDocument();

    // Reorder main widget up via keyboard-accessible button
    await user.click(
      screen.getByRole('button', {
        name: 'Di chuyển lên Việc sắp đến hạn & Việc cần làm',
      }),
    );
    const headings = screen
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent);
    const deadlinesIdx = headings.findIndex((t) =>
      t?.includes('Việc sắp đến hạn & Việc cần làm'),
    );
    const todayIdx = headings.findIndex((t) => t?.includes('Lịch hôm nay'));
    expect(deadlinesIdx).toBeGreaterThanOrEqual(0);
    expect(todayIdx).toBeGreaterThan(deadlinesIdx);
  });

  it('respects simulation loadingFeature and networkError states', async () => {
    const user = userEvent.setup();
    renderDashboard({
      simulation: {
        networkError: false,
        sessionExpired: false,
        loadingFeature: 'dashboard',
        isOffline: false,
      },
    });
    expect(
      screen.getByRole('status', {
        name: /Đang tải lịch học và việc hôm nay/i,
      }),
    ).toBeInTheDocument();

    renderDashboard({
      simulation: {
        networkError: true,
        sessionExpired: false,
        loadingFeature: null,
        isOffline: false,
      },
    });
    expect(
      screen.getByText(/Không thể đồng bộ dữ liệu bảng tổng quan/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
  });
});
