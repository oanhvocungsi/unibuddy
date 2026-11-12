import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { NotFoundView } from './components/layout/FeaturePlaceholder';
import { ToastProvider } from './components/ui';
import { AccountPage } from './features/account/AccountPage';
import { AdminPage } from './features/account/AdminPage';
import { AuthPage } from './features/account/AuthPage';
import { OnboardingPage } from './features/account/OnboardingPage';
import { CourseDetailPage, CoursesListPage } from './features/courses';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ExplorePage } from './features/explore';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { SchedulePage } from './features/schedule/SchedulePage';
import { SupportAndLifePage } from './features/support/SupportAndLifePage';
import { AppStoreProvider } from './store/appStore';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/dang-nhap"
        element={
          <div className="min-h-screen bg-[var(--bg-canvas)] p-4 sm:p-8 max-w-4xl mx-auto">
            <AuthPage />
          </div>
        }
      />
      <Route
        path="/huong-dan-bat-dau"
        element={
          <AppShell>
            <OnboardingPage />
          </AppShell>
        }
      />
      <Route
        path="/"
        element={
          <AppShell>
            <DashboardPage />
          </AppShell>
        }
      />
      <Route
        path="/lich"
        element={
          <AppShell>
            <SchedulePage />
          </AppShell>
        }
      />
      <Route
        path="/mon-hoc"
        element={
          <AppShell>
            <CoursesListPage />
          </AppShell>
        }
      />
      <Route
        path="/mon-hoc/:id"
        element={
          <AppShell>
            <CourseDetailPage />
          </AppShell>
        }
      />
      <Route
        path="/kham-pha"
        element={
          <AppShell>
            <ExplorePage />
          </AppShell>
        }
      />
      <Route
        path="/ho-tro"
        element={
          <AppShell>
            <SupportAndLifePage />
          </AppShell>
        }
      />
      <Route
        path="/thong-bao"
        element={
          <AppShell>
            <NotificationsPage />
          </AppShell>
        }
      />
      <Route
        path="/tai-khoan"
        element={
          <AppShell>
            <AccountPage />
          </AppShell>
        }
      />
      <Route
        path="/quan-tri"
        element={
          <AppShell>
            <AdminPage />
          </AppShell>
        }
      />
      <Route
        path="*"
        element={
          <AppShell>
            <NotFoundView />
          </AppShell>
        }
      />
    </Routes>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <AppStoreProvider>
          <AppRoutes />
        </AppStoreProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
