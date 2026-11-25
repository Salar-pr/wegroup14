import { Badge } from '../../../components';
import type {
  Announcement,
  Attendance,
  Grade,
  Payment,
} from '../../../types';
import { HOMEWORK_STATE_META, PAYMENT_STATUS_META, type HomeworkState } from '../lib/parentAnalytics';

/**
 * Domain → Badge mappings taken from the shared contract (§6, "Status badge
 * maps") so the parent panel looks identical to the admin/teacher panels.
 */

const ATTENDANCE_META: Record<
  Attendance['status'],
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }
> = {
  present: { label: 'حاضر', variant: 'success' },
  late: { label: 'تأخیر', variant: 'warning' },
  absent: { label: 'غایب', variant: 'danger' },
  excused: { label: 'غیبت موجه', variant: 'info' },
};

const GRADE_TYPE_META: Record<Grade['type'], string> = {
  quiz: 'آزمون کلاسی',
  assignment: 'تکلیف',
  midterm: 'میان‌ترم',
  final: 'پایان‌ترم',
};

const PRIORITY_META: Record<
  Announcement['priority'],
  { label: string; variant: 'danger' | 'warning' | 'neutral' }
> = {
  urgent: { label: 'فوری', variant: 'danger' },
  important: { label: 'مهم', variant: 'warning' },
  normal: { label: 'عادی', variant: 'neutral' },
};

export function AttendanceBadge({ status }: { status: Attendance['status'] }) {
  const meta = ATTENDANCE_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function PaymentBadge({ status }: { status: Payment['status'] }) {
  const meta = PAYMENT_STATUS_META[status];
  return <Badge variant={meta.badge}>{meta.label}</Badge>;
}

export function HomeworkBadge({ state }: { state: HomeworkState }) {
  const meta = HOMEWORK_STATE_META[state];
  return <Badge variant={meta.badge}>{meta.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Announcement['priority'] }) {
  const meta = PRIORITY_META[priority];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function GradeTypeBadge({ type }: { type: Grade['type'] }) {
  return (
    <Badge variant="neutral" dot={false}>
      {GRADE_TYPE_META[type]}
    </Badge>
  );
}

export { ATTENDANCE_META, GRADE_TYPE_META, PRIORITY_META };

/**
 * Inline "score bar" used inside the subject-average table so the parent can
 * read the value at a glance without a separate chart.
 */
export function SubjectAverageBar({
  value,
  color,
  tone,
}: {
  value: number;
  color: string;
  tone: 'success' | 'warning' | 'danger';
}) {
  const width = Math.max(3, Math.min(100, (value / 20) * 100));
  const textClass =
    tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-danger';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full max-w-[110px] overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className={`shrink-0 text-[11.5px] font-extrabold ${textClass}`}>
        {value.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
