import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ui';
import { createInitialSeedData } from '../../data';
import { AppStoreProvider } from '../../store/appStore';
import type { AppState } from '../../types/models';
import { todayKey } from '../../utils/dateUtils';
import { SchedulePage } from './SchedulePage';

function renderSchedule(overrideState?: Partial<AppState>) {
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
          <SchedulePage />
        </AppStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('SchedulePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('validates event time range and displays exact error "Giờ kết thúc phải sau giờ bắt đầu"', async () => {
    const user = userEvent.setup();
    renderSchedule();

    await user.click(screen.getByRole('button', { name: 'Thêm lịch' }));

    const dialog = screen.getByRole('dialog');
    const titleInput = within(dialog).getByLabelText(/Tên lịch \/ Môn học/i);
    await user.click(titleInput);
    await user.paste('Học nhóm Cấu trúc dữ liệu');

    const startInput = within(dialog).getByLabelText('Giờ bắt đầu');
    const endInput = within(dialog).getByLabelText('Giờ kết thúc');
    await user.clear(startInput);
    await user.type(startInput, '10:00');
    await user.clear(endInput);
    await user.type(endInput, '09:00');

    await user.click(
      within(dialog).getByRole('button', { name: 'Thêm vào lịch' }),
    );

    expect(
      within(dialog).getByText('Giờ kết thúc phải sau giờ bắt đầu'),
    ).toBeInTheDocument();

    // Fix endTime and submit
    await user.clear(endInput);
    await user.type(endInput, '11:30');
    await user.click(
      within(dialog).getByRole('button', { name: 'Thêm vào lịch' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByText('Học nhóm Cấu trúc dữ liệu'),
    ).toBeInTheDocument();
  });

  it('detects schedule overlaps and switches between Day, Week, and Month views', async () => {
    const user = userEvent.setup();
    const today = todayKey();
    const seed = createInitialSeedData();

    renderSchedule({
      scheduleEvents: [
        ...seed.scheduleEvents,
        {
          id: 'sched-overlap-test',
          title: 'Họp CLB trùng giờ sáng',
          category: 'event',
          date: today,
          startTime: '08:00',
          endTime: '09:00',
          location: 'Sảnh A2',
          recurrence: 'none',
          source: 'personal',
        },
      ],
    });

    expect(
      screen.getByText(/Phát hiện \d+ cặp lịch trùng khung giờ/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ngày' }));
    expect(
      screen.getByText('Họp CLB trùng giờ sáng'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tháng' }));
    expect(screen.getByText(/^Tháng \d+\/\d{4}$/)).toBeInTheDocument();
  });

  it('shows deadline collision banner and generates 4 freshman milestones in Tasks tab', async () => {
    const user = userEvent.setup();
    renderSchedule();

    await user.click(
      screen.getByRole('tab', { name: /Nhắc việc & Hạn nộp/i }),
    );

    expect(
      screen.getByText(/Cảnh báo trùng hạn nộp/i),
    ).toBeInTheDocument();

    const milestoneButtons = screen.getAllByRole('button', {
      name: /Gợi ý chia mốc bài tập lớn/i,
    });
    await user.click(milestoneButtons[0]);

    expect(
      screen.getAllByText('Đọc kỹ đề bài, tiêu chí chấm & mốc nộp bài')
        .length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(
        'Kiểm tra lại lỗi, định dạng & nộp bài trước hạn 3 giờ',
      ).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders today study gaps and interactive Focus Timer in Focus Planner tab', async () => {
    const user = userEvent.setup();
    renderSchedule();

    await user.click(
      screen.getByRole('tab', { name: /Lập kế hoạch & Tập trung/i }),
    );

    expect(
      screen.getByText('Khoảng trống giữa các buổi học hôm nay'),
    ).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '45 phút' }));
    expect(screen.getByText('45:00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    expect(
      screen.getByRole('button', { name: 'Tạm dừng' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Chế độ Tập trung đang bật/i),
    ).toBeInTheDocument();
  });

  it('imports valid .ics calendar text into timetable', async () => {
    const user = userEvent.setup();
    renderSchedule();

    await user.click(screen.getByRole('button', { name: /Nhập \.ics/i }));
    const dialog = screen.getByRole('dialog');
    const textarea = within(dialog).getByLabelText(/Hoặc dán trực tiếp nội dung VCALENDAR/i);
    const todayCompact = todayKey().replace(/-/g, '');
    await user.click(textarea);
    await user.paste(
      `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Seminar K2026 Tuần Đầu\nDTSTART:${todayCompact}T160000\nDTEND:${todayCompact}T173000\nLOCATION:Hội trường A2\nEND:VEVENT\nEND:VCALENDAR`,
    );

    await user.click(
      within(dialog).getByRole('button', { name: /Nhập vào thời khóa biểu/i }),
    );
    expect(screen.getByText('Seminar K2026 Tuần Đầu')).toBeInTheDocument();
  });
});
