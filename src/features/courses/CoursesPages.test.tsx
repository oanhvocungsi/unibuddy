import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ui';
import { createInitialSeedData } from '../../data';
import { AppStoreProvider, STORAGE_KEY } from '../../store/appStore';
import type { AppState } from '../../types/models';
import { CourseDetailPage } from './CourseDetailPage';
import { CoursesListPage } from './CoursesListPage';

function renderCoursesApp(
  initialEntries: string[] = ['/mon-hoc'],
  initialState?: AppState,
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastProvider>
        <AppStoreProvider initialState={initialState}>
          <Routes>
            <Route path="/mon-hoc" element={<CoursesListPage />} />
            <Route path="/mon-hoc/:id" element={<CourseDetailPage />} />
          </Routes>
        </AppStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('CoursesListPage & CourseDetailPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('validates, adds, searches, and deletes a course with confirmation modal', async () => {
    const user = userEvent.setup();
    renderCoursesApp(['/mon-hoc']);

    expect(
      screen.getByRole('heading', { name: 'Môn học của tôi', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Nhập môn Lập trình')).toBeInTheDocument();

    // Open Add Course modal
    await user.click(screen.getByRole('button', { name: /Thêm môn học/i }));
    const dialog = screen.getByRole('dialog', { name: /Thêm môn học mới/i });

    // Submit empty to trigger validation
    await user.click(
      within(dialog).getByRole('button', { name: 'Thêm môn học' }),
    );
    expect(
      within(dialog).getByText('Vui lòng nhập tên môn học.'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Vui lòng nhập mã học phần/i),
    ).toBeInTheDocument();

    // Fill valid course details
    fireEvent.change(within(dialog).getByLabelText(/Tên môn học/i), {
      target: { value: 'Cấu trúc dữ liệu và Giải thuật' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Mã học phần/i), {
      target: { value: 'IT2030' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Số tín chỉ/i), {
      target: { value: '4' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Giảng viên phụ trách/i), {
      target: { value: 'TS. Lê Hoàng Minh' },
    });
    fireEvent.change(within(dialog).getByLabelText(/Phòng học/i), {
      target: { value: 'B1-405' },
    });

    await user.click(
      within(dialog).getByRole('button', { name: 'Thêm môn học' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByText('Cấu trúc dữ liệu và Giải thuật'),
    ).toBeInTheDocument();
    expect(screen.getByText('IT2030')).toBeInTheDocument();

    // Search by code
    const searchInput = screen.getByRole('searchbox', {
      name: /Tìm kiếm môn học/i,
    });
    fireEvent.change(searchInput, { target: { value: 'IT2030' } });
    expect(
      screen.getByText('Cấu trúc dữ liệu và Giải thuật'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Triết học Mác - Lênin')).not.toBeInTheDocument();

    // Delete with confirmation modal
    await user.click(
      screen.getByRole('button', {
        name: /Xóa môn Cấu trúc dữ liệu và Giải thuật/i,
      }),
    );
    const confirmDialog = screen.getByRole('dialog', {
      name: /Xác nhận xóa môn học/i,
    });
    await user.click(
      within(confirmDialog).getByRole('button', { name: 'Xóa môn học' }),
    );

    expect(
      screen.queryByText('Cấu trúc dữ liệu và Giải thuật'),
    ).not.toBeInTheDocument();
  });

  it('respects simulation loading and networkError states', () => {
    const loadingState = createInitialSeedData();
    loadingState.simulation.loadingFeature = 'courses';
    const { unmount } = renderCoursesApp(['/mon-hoc'], loadingState);
    expect(
      screen.getByRole('status', { name: /Đang tải danh sách môn học/i }),
    ).toHaveAttribute('aria-busy', 'true');
    unmount();

    const errorState = createInitialSeedData();
    errorState.simulation.networkError = true;
    renderCoursesApp(['/mon-hoc'], errorState);
    expect(screen.getByRole('alert')).toHaveTextContent(
      /Không thể tải danh sách môn học/i,
    );
  });

  it('shows DeletedContentState for unknown course id and navigates back to /mon-hoc', async () => {
    const user = userEvent.setup();
    renderCoursesApp(['/mon-hoc/course-khong-ton-tai']);

    expect(
      screen.getByRole('heading', {
        name: /Môn học không tồn tại hoặc đã bị xóa/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Quay lại danh sách môn học/i }),
    );
    expect(
      screen.getByRole('heading', { name: 'Môn học của tôi', level: 1 }),
    ).toBeInTheDocument();
  });

  it('navigates to CourseDetailPage, updates progress, adds inline task, and switches tabs via keyboard', async () => {
    const user = userEvent.setup();
    renderCoursesApp(['/mon-hoc']);

    await user.click(
      screen.getByRole('link', { name: 'Nhập môn Lập trình' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Nhập môn Lập trình', level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Nhóm học tập/i }),
    ).toHaveAttribute('href', '/kham-pha?tab=community');

    // Update self-reported progress slider
    const slider = screen.getByRole('slider', {
      name: /Tiến độ tự đánh giá môn học/i,
    });
    fireEvent.change(slider, { target: { value: '75' } });
    expect(screen.getByText('75%')).toBeInTheDocument();

    // Add inline task for this course in Overview tab
    await user.click(
      screen.getByRole('button', {
        name: /Thêm bài tập \/ hạn nộp cho môn này/i,
      }),
    );
    fireEvent.change(screen.getByLabelText(/Tên bài tập \/ hạn nộp/i), {
      target: { value: 'Nộp bài Lab 03 hàm và đệ quy' },
    });
    await user.click(screen.getByRole('button', { name: 'Lưu hạn nộp' }));
    expect(
      screen.getByText('Nộp bài Lab 03 hàm và đệ quy'),
    ).toBeInTheDocument();

    // Move to Notes tab via ArrowRight keyboard navigation
    const overviewTab = screen.getByRole('tab', {
      name: /Tổng quan & Hạn nộp/i,
    });
    overviewTab.focus();
    await user.keyboard('{ArrowRight}');
    const notesTab = screen.getByRole('tab', { name: /Ghi chú theo buổi/i });
    expect(notesTab).toHaveAttribute('aria-selected', 'true');
  });

  it('creates, pins, and deletes session notes in Ghi chú theo buổi tab', async () => {
    const user = userEvent.setup();
    renderCoursesApp(['/mon-hoc/course-it1010?tab=notes']);

    expect(
      screen.getByRole('tab', { name: /Ghi chú theo buổi/i }),
    ).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('button', { name: /Thêm ghi chú mới/i }));
    fireEvent.change(screen.getByLabelText(/Tiêu đề ghi chú/i), {
      target: { value: 'Tóm tắt đệ quy tuyến tính' },
    });
    fireEvent.change(screen.getByLabelText(/Buổi \/ Chương/i), {
      target: { value: 'Buổi 5' },
    });
    fireEvent.change(screen.getByLabelText(/Nội dung ghi chú/i), {
      target: { value: '- Luôn có **điều kiện dừng**' },
    });
    await user.click(screen.getByRole('button', { name: 'Lưu ghi chú' }));

    expect(screen.getByText('Tóm tắt đệ quy tuyến tính')).toBeInTheDocument();
    expect(screen.getByText('Buổi 5')).toBeInTheDocument();
    expect(screen.getByText('điều kiện dừng')).toBeInTheDocument();
  });

  it('flips flashcards on click and keyboard, updates mastery, and manages revision checklist', async () => {
    const user = userEvent.setup();
    renderCoursesApp(['/mon-hoc/course-it1010?tab=revision']);

    const revisionTab = screen.getByRole('tab', {
      name: /Ôn tập & Thẻ ghi nhớ/i,
    });
    expect(revisionTab).toHaveAttribute('aria-selected', 'true');

    // Toggle a checklist item
    const toggleChkBtn = screen.getByRole('button', {
      name: /Đánh dấu hoàn thành: Ôn lại hàm truyền tham trị/i,
    });
    await user.click(toggleChkBtn);
    expect(screen.getByText(/Đã hoàn thành 3\/3 mục/i)).toBeInTheDocument();

    // Flip flashcard on click
    expect(
      screen.getByText(/Mặt trước — Câu hỏi gợi nhớ/i),
    ).toBeInTheDocument();
    const cardBtn = screen.getByRole('button', {
      name: /Mặt trước câu hỏi:/i,
    });
    await user.click(cardBtn);
    expect(
      screen.getByText(/Mặt sau — Đáp án \/ Giải thích/i),
    ).toBeInTheDocument();
    expect(cardBtn).toHaveAttribute('aria-pressed', 'true');

    // Flip back using Enter key
    cardBtn.focus();
    await user.keyboard('{Enter}');
    expect(
      screen.getByText(/Mặt trước — Câu hỏi gợi nhớ/i),
    ).toBeInTheDocument();

    // Flip using Space key
    await user.keyboard(' ');
    expect(
      screen.getByText(/Mặt sau — Đáp án \/ Giải thích/i),
    ).toBeInTheDocument();

    // Navigate to next card & mark mastery
    await user.click(screen.getByRole('button', { name: /Thẻ tiếp/i }));
    expect(screen.getByText(/Thẻ 2 \/ 3/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Đã thuộc' }));
    expect(
      screen.getByText(/Đã đánh dấu thẻ: Đã thuộc/i),
    ).toBeInTheDocument();
  });

  it('distinguishes resource origins, adds/deletes personal resource, and submits moderation report', async () => {
    const user = userEvent.setup();
    renderCoursesApp(['/mon-hoc/course-it1010?tab=resources']);

    const resourcesTab = screen.getByRole('tab', {
      name: /Tài liệu học tập/i,
    });
    expect(resourcesTab).toHaveAttribute('aria-selected', 'true');

    // Verify origin distinctions
    expect(
      screen.getAllByText('Tài liệu trường (minh họa)').length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText('Cộng đồng chia sẻ').length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText(/không phải văn bản chính thức từ nhà trường/i),
    ).toBeInTheDocument();

    // Add & delete personal resource
    await user.click(screen.getByRole('button', { name: /Thêm tài liệu/i }));
    fireEvent.change(screen.getByLabelText(/Tiêu đề tài liệu/i), {
      target: { value: 'Tóm tắt ôn thi cuối kỳ tự ghi' },
    });
    await user.click(screen.getByRole('button', { name: 'Lưu tài liệu' }));
    expect(
      screen.getByText('Tóm tắt ôn thi cuối kỳ tự ghi'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Ghi chú / Tài liệu cá nhân').length,
    ).toBeGreaterThanOrEqual(2);

    await user.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(
      screen.queryByText('Tóm tắt ôn thi cuối kỳ tự ghi'),
    ).not.toBeInTheDocument();

    // Report a resource via modal
    const reportButtons = screen.getAllByRole('button', {
      name: /Báo cáo tài liệu/i,
    });
    await user.click(reportButtons[0]);

    const reportDialog = screen.getByRole('dialog', {
      name: /Báo cáo tài liệu/i,
    });
    await user.click(
      within(reportDialog).getByRole('radio', { name: 'Lỗi thời' }),
    );
    await user.type(
      within(reportDialog).getByLabelText(/Chi tiết bổ sung/i),
      'Đề cương đã cập nhật tỷ trọng mới.',
    );
    await user.click(
      within(reportDialog).getByRole('button', { name: 'Gửi báo cáo' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Đã gửi báo cáo tài liệu tới ban biên tập/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Đã báo cáo')).toBeInTheDocument();

    const persisted = window.localStorage.getItem(STORAGE_KEY);
    expect(persisted).toContain('Đề cương đã cập nhật tỷ trọng mới.');
  });
});
