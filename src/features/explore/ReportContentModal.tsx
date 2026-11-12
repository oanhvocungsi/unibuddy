import { useEffect, useState, type FormEvent } from 'react';
import { Flag } from 'lucide-react';
import { Button, Modal, useToast } from '../../components/ui';
import { useAppStore } from '../../store/appStore';
import type { ModerationTargetType } from '../../types/models';

export interface ReportTarget {
  targetType: ModerationTargetType;
  targetId: string;
  parentId?: string;
  targetPreview: string;
}

const REPORT_REASONS = [
  'Thông tin chưa chính xác hoặc gây hiểu nhầm thủ tục',
  'Nội dung trùng lặp / spam quảng cáo',
  'Ngôn từ thiếu tôn trọng hoặc không phù hợp môi trường học đường',
  'Tiết lộ thông tin cá nhân nhạy cảm',
];

export function ReportContentModal({
  target,
  onClose,
}: {
  target: ReportTarget | null;
  onClose: () => void;
}) {
  const { submitModerationReport } = useAppStore();
  const { showToast } = useToast();

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (target) {
      setSelectedReason(REPORT_REASONS[0]);
      setCustomNote('');
    }
  }, [target]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!target) return;
    const finalReason = customNote.trim()
      ? `${selectedReason} — ${customNote.trim()}`
      : selectedReason;

    submitModerationReport({
      targetType: target.targetType,
      targetId: target.targetId,
      parentId: target.parentId,
      targetPreview: target.targetPreview,
      reason: finalReason,
    });
    showToast(
      'Đã gửi báo cáo tới bộ phận kiểm duyệt nội dung.',
      'success',
    );
    onClose();
  };

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onClose}
      title="Báo cáo nội dung"
      description="Báo cáo sẽ được chuyển tới khu vực Kiểm duyệt (/quan-tri) để xem xét."
      size="md"
    >
      {target && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface-subtle)]/70 p-3 text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              Nội dung được báo cáo:{' '}
            </span>
            <span className="line-clamp-2">{target.targetPreview}</span>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-[var(--text-primary)]">
              Chọn lý do báo cáo
            </legend>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-start gap-2.5 rounded-lg border border-[var(--border-hairline)] p-3 text-sm text-[var(--text-primary)] cursor-pointer hover:border-[var(--border-strong)]"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-1 h-4 w-4 accent-[var(--accent-primary)]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <label
              htmlFor="report-custom-note"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Mô tả thêm (không bắt buộc)
            </label>
            <textarea
              id="report-custom-note"
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ghi chú ngắn giúp kiểm duyệt viên xử lý chính xác hơn..."
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="danger"
              leftIcon={<Flag className="h-4 w-4" aria-hidden="true" />}
            >
              Gửi báo cáo
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
