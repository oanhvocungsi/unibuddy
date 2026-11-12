import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  DeletedContentState,
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingSkeleton,
  SampleDataBadge,
} from '../ui';

export function FeaturePlaceholder({
  title,
  subtitle,
  routeKey,
}: {
  title: string;
  subtitle: string;
  routeKey: string;
}) {
  const { state, setSimulation } = useAppStore();
  const navigate = useNavigate();
  const params = useParams();

  if (state.simulation.loadingFeature === routeKey) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <LoadingSkeleton rows={4} />
      </section>
    );
  }

  if (state.simulation.networkError) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <ErrorState
          onRetry={() => setSimulation({ networkError: false })}
          message="Mạng mô phỏng đang tạm ngắt. Nhấn Thử lại để khôi phục đồng bộ."
        />
      </section>
    );
  }

  if (
    routeKey === 'admin' &&
    state.profile.role !== 'admin' &&
    state.profile.role !== 'editor'
  ) {
    return (
      <ForbiddenState onBackHome={() => navigate('/')} />
    );
  }

  if (routeKey === 'course-detail' && params.id) {
    const course = state.courses.find((c) => c.id === params.id);
    if (!course) {
      return (
        <DeletedContentState
          title="Không tìm thấy học phần"
          description="Môn học này có thể đã bị xóa hoặc đường dẫn không hợp lệ."
          onBack={() => navigate('/mon-hoc')}
        />
      );
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
            {subtitle}
          </p>
        </div>
        <SampleDataBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Dữ liệu học tập sẵn sàng</CardTitle>
              <CardDescription>Đã kết nối với kho lưu trữ cục bộ</CardDescription>
            </div>
            <Badge variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
              Hoạt động
            </Badge>
          </CardHeader>
          <CardBody className="text-sm text-[var(--text-secondary)] space-y-1.5 tabular-nums">
            <p>Môn học đang theo dõi: {state.courses.length}</p>
            <p>Sự kiện thời khóa biểu: {state.scheduleEvents.length}</p>
            <p>Deadline & công việc: {state.tasks.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sổ tay & Campus</CardTitle>
              <CardDescription>Thông tin minh họa cho tân sinh viên</CardDescription>
            </div>
            <Badge variant="primary">Năm nhất</Badge>
          </CardHeader>
          <CardBody className="text-sm text-[var(--text-secondary)] space-y-1.5 tabular-nums">
            <p>Bài hướng dẫn sổ tay: {state.handbookArticles.length}</p>
            <p>Địa điểm bản đồ campus: {state.campusLocations.length}</p>
            <p>Câu lạc bộ & sự kiện: {state.clubs.length + state.events.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Trạng thái phiên</CardTitle>
              <CardDescription>Vai trò: {state.profile.role}</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="text-sm text-[var(--text-secondary)] space-y-3">
            <p>Hồ sơ mẫu: {state.profile.name}</p>
            <Link
              to="/tai-khoan"
              className="inline-flex items-center gap-1.5 font-medium text-[var(--accent-primary)] hover:underline"
            >
              <span>Mở cài đặt & mô phỏng</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardBody>
        </Card>
      </div>

      {state.courses.length === 0 && (
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="Chưa có dữ liệu môn học"
          description="Bạn có thể khởi tạo lại bộ dữ liệu mẫu hoặc thêm môn học mới."
          actionLabel="Mở trợ lý thiết lập"
          onAction={() => navigate('/huong-dan-bat-dau')}
        />
      )}
    </section>
  );
}

export function NotFoundView() {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto my-12 text-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 space-y-4">
      <p className="text-sm font-semibold text-[var(--accent-primary)] tabular-nums">
        404
      </p>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Không tìm thấy trang này
      </h1>
      <p className="text-sm text-[var(--text-secondary)]">
        Liên kết bạn truy cập không tồn tại hoặc đã được di chuyển trong UniBuddy.
      </p>
      <div className="pt-2 flex justify-center gap-3">
        <Button variant="primary" onClick={() => navigate('/')}>
          Về trang Hôm nay
        </Button>
        <Button variant="outline" onClick={() => navigate('/kham-pha')}>
          Mở Khám phá
        </Button>
      </div>
    </div>
  );
}
