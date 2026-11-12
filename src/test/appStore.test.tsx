import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createInitialSeedData } from '../data';
import { STORAGE_KEY } from '../store/appStore';

describe('UniBuddy App Shell & Store Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders seed data anchored to today and supports Ctrl+K search modal', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Hôm nay', level: 1 }),
    ).toBeInTheDocument();

    const searchBtn = screen.getByRole('button', {
      name: /Tìm kiếm nhanh/i,
    });
    await user.click(searchBtn);

    const searchInput = screen.getByRole('searchbox', {
      name: /Từ khóa tìm kiếm toàn hệ thống/i,
    });
    await user.type(searchInput, 'IT1010');

    expect(
      screen.getAllByText(/Nhập môn Lập trình \(IT1010\)/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('toggles dark theme onto documentElement and persists state', async () => {
    const user = userEvent.setup();
    render(<App />);

    const themeBtn = screen.getByRole('button', { name: /Đổi giao diện/i });
    // system -> light -> dark
    await user.click(themeBtn);
    await user.click(themeBtn);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    const saved = window.localStorage.getItem(STORAGE_KEY);
    expect(saved).toBeTruthy();
    expect(saved).toContain('"theme":"dark"');
  });

  it('seeds complete domain collections with relative dates and sample badges', () => {
    const seed = createInitialSeedData();
    expect(seed.courses.length).toBeGreaterThanOrEqual(5);
    expect(seed.handbookArticles.length).toBeGreaterThanOrEqual(10);
    expect(seed.campusLocations.length).toBeGreaterThanOrEqual(12);
    expect(seed.clubs.length).toBeGreaterThanOrEqual(6);
    expect(seed.events.length).toBeGreaterThanOrEqual(6);
    expect(seed.questions.length).toBeGreaterThanOrEqual(6);
    expect(seed.studyGroups.length).toBeGreaterThanOrEqual(4);
    expect(seed.flashcards.length).toBeGreaterThanOrEqual(10);
    expect(seed.handbookArticles.every((a) => a.isSample)).toBe(true);
    expect(seed.moodCheckIns.every((m) => m.isPrivate)).toBe(true);
  });
});
