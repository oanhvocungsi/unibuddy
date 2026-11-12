import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ui';
import { createInitialSeedData } from '../../data';
import { AppStoreProvider, STORAGE_KEY, useAppStore } from '../../store/appStore';
import type { AppState } from '../../types/models';
import { ExplorePage } from './ExplorePage';

function ScheduleCountProbe() {
  const { state } = useAppStore();
  return (
    <div data-testid="schedule-events-probe">
      {state.scheduleEvents.length}
    </div>
  );
}

function renderExplore(
  initialRoute = '/kham-pha',
  overrideState?: (base: AppState) => AppState,
) {
  const base = createInitialSeedData();
  const initialState = overrideState ? overrideState(base) : base;

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ToastProvider>
        <AppStoreProvider initialState={initialState}>
          <ScheduleCountProbe />
          <Routes>
            <Route path="/kham-pha" element={<ExplorePage />} />
            <Route path="/lich" element={<div>Trang Lịch</div>} />
            <Route path="/tai-khoan" element={<div>Trang Tài khoản</div>} />
          </Routes>
        </AppStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('ExplorePage (/kham-pha)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to handbook tab and gracefully falls back on unknown ?tab param', () => {
    renderExplore('/kham-pha?tab=unknown-xyz');

    const handbookTab = screen.getByRole('tab', { name: /Cẩm nang/i });
    expect(handbookTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('heading', { name: /Cẩm nang sinh viên năm nhất/i }),
    ).toBeInTheDocument();
  });

  it('filters handbook by category and supports helpful voting with live count & toast', async () => {
    const user = userEvent.setup();
    renderExplore('/kham-pha?tab=handbook');

    // Filter to "Tín chỉ, GPA, học lại"
    const categoryGroup = screen.getByRole('group', {
      name: /Lọc cẩm nang theo chuyên mục/i,
    });
    const gpaCategoryBtn = within(categoryGroup).getByRole('button', {
      name: /Tín chỉ, GPA, học lại/i,
    });
    await user.click(gpaCategoryBtn);

    expect(
      screen.getAllByText(/Hiểu đúng về Tín chỉ, Thang điểm 4 \(GPA\)/i).length,
    ).toBeGreaterThanOrEqual(1);

    // SampleDataBadge is shown with required official disclaimer
    expect(
      screen.getAllByText(
        /Nội dung minh họa — đối chiếu quy chế chính thức của trường/i,
      ).length,
    ).toBeGreaterThanOrEqual(1);

    // Vote "Có" on the active article (initial helpfulYes = 95 -> 96)
    const yesVoteBtn = screen.getByRole('button', { name: /^Có \(95\)$/i });
    await user.click(yesVoteBtn);

    expect(
      screen.getByRole('button', { name: /^Có \(96\)$/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByText(/Cảm ơn phản hồi! Bài viết đã được ghi nhận là hữu ích/i),
    ).toBeInTheDocument();
  });

  it('searches campus map by room code and updates route directions by origin', async () => {
    const user = userEvent.setup();
    renderExplore('/kham-pha?tab=map');

    expect(
      screen.getByText(
        /Sơ đồ & giờ mở cửa minh họa — không phải bản đồ\/liên hệ chính thức/i,
      ),
    ).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', {
      name: /Tìm theo mã phòng hoặc tên địa điểm/i,
    });
    await user.type(searchInput, 'B1-302');

    // Focuses Giảng đường B1 details and shows route from main gate
    expect(
      screen.getByRole('heading', {
        name: /Giảng đường B1 — Khu Thực hành CNTT & Ngoại ngữ/i,
      }),
    ).toBeInTheDocument();

    const routeList = screen.getByRole('list', {
      name: /Chỉ dẫn đường đi từng bước/i,
    });
    expect(within(routeList).getByText(/Từ Cổng chính/i)).toBeInTheDocument();

    // Change origin from Cổng chính to TV-01 (Thư viện Trung tâm)
    const originSelect = screen.getByLabelText(/Chọn điểm xuất phát/i);
    await user.selectOptions(originSelect, 'loc-library-tv');

    expect(
      within(routeList).getByText(/Rời khu vực TV-01/i),
    ).toBeInTheDocument();
  });

  it('registers for a club event, adds it to personal schedule, and shows interest recommendations', async () => {
    const user = userEvent.setup();
    renderExplore('/kham-pha?tab=clubs');

    // Personalized recommendations strip visible
    expect(
      screen.getByText(/Gợi ý theo sở thích của bạn/i),
    ).toBeInTheDocument();

    const beforeCount = Number(
      screen.getByTestId('schedule-events-probe').textContent,
    );

    // Find the coding bootcamp event card ("Workshop Mở khóa Tư duy Lập trình & Gỡ lỗi cho K2026")
    const eventHeading = screen.getByRole('heading', {
      name: /Workshop Mở khóa Tư duy Lập trình & Gỡ lỗi cho K2026/i,
    });
    const eventCard = eventHeading.closest('div.rounded-xl') as HTMLElement;
    expect(eventCard).toBeTruthy();

    // Initial capacity: 53 / 65 (Còn 12 chỗ)
    expect(within(eventCard).getByText(/53 \/ 65/)).toBeInTheDocument();

    // Register
    const registerBtn = within(eventCard).getByRole('button', {
      name: /Đăng ký tham dự/i,
    });
    await user.click(registerBtn);

    expect(within(eventCard).getByText(/54 \/ 65/)).toBeInTheDocument();
    expect(
      within(eventCard).getByRole('button', { name: /Hủy đăng ký/i }),
    ).toBeInTheDocument();

    // Add to personal calendar
    const addCalBtn = within(eventCard).getByRole('button', {
      name: /Thêm vào lịch của tôi/i,
    });
    await user.click(addCalBtn);

    await waitFor(() => {
      expect(
        within(eventCard).getByRole('button', { name: /Đã có trong lịch/i }),
      ).toBeDisabled();
    });

    const afterCount = Number(
      screen.getByTestId('schedule-events-probe').textContent,
    );
    expect(afterCount).toBe(beforeCount + 1);

    // Persisted in localStorage
    const saved = window.localStorage.getItem(STORAGE_KEY);
    expect(saved).toContain('Workshop Mở khóa Tư duy Lập trình');
  });

  it('suggests similar existing questions live while typing a new Q&A question', async () => {
    const user = userEvent.setup();
    renderExplore('/kham-pha?tab=community');

    const askBtn = screen.getByRole('button', { name: /Đặt câu hỏi mới/i });
    await user.click(askBtn);

    const titleInput = screen.getByLabelText(/Tiêu đề câu hỏi/i);
    await user.type(titleInput, 'trùng lịch');

    const similarRegion = await screen.findByRole('region', {
      name: /Câu hỏi tương tự đã có/i,
    });
    expect(
      within(similarRegion).getByText(
        /Lỡ đăng ký trùng giờ hai môn tự chọn ở tuần đầu thì xử lý thế nào/i,
      ),
    ).toBeInTheDocument();
  });

  it('respects state.simulation loading and networkError states', async () => {
    const user = userEvent.setup();
    renderExplore('/kham-pha?tab=handbook', (base) => ({
      ...base,
      simulation: { ...base.simulation, networkError: true },
    }));

    expect(
      screen.getByText(/Không thể tải dữ liệu mục Khám phá/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Thử lại/i }));
    expect(
      screen.getByRole('heading', { name: /Cẩm nang sinh viên năm nhất/i }),
    ).toBeInTheDocument();
  });

  it('supports study group session scheduling in CommunityView', async () => {
    const user = userEvent.setup();
    renderExplore('/kham-pha?tab=groups');

    const beforeCount = Number(
      screen.getByTestId('schedule-events-probe').textContent,
    );

    const addSessionButtons = screen.getAllByRole('button', {
      name: /Thêm buổi học vào lịch/i,
    });
    await user.click(addSessionButtons[0]);

    const afterCount = Number(
      screen.getByTestId('schedule-events-probe').textContent,
    );
    expect(afterCount).toBe(beforeCount + 1);
  });
});
