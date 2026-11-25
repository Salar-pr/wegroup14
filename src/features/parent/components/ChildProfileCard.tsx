import {
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  Hash,
  Phone,
  School,
  UserRound,
} from 'lucide-react';
import { Avatar } from '../../../components';
import { cn, formatJalali, toPersianDigits } from '../../../utils';
import type { Parent, Student } from '../../../types';
import type { AttendanceSummary, FinanceSummary } from '../lib/parentAnalytics';
import { percentText, scoreText, buildClassInfo } from '../lib/parentAnalytics';
import type { Database } from '../../../data';
import type { AcademicSummary } from '../lib/parentAnalytics';

export interface ChildProfileCardProps {
  student: Student;
  db: Database;
  parent: Parent | undefined;
  academic: AcademicSummary | null;
  attendance: AttendanceSummary | null;
  finance: FinanceSummary | null;
  className?: string;
}

const RELATION_LABELS: Record<Parent['relation'], string> = {
  father: 'پدر',
  mother: 'مادر',
  guardian: 'سرپرست',
};

const STATUS_LABELS: Record<Student['status'], { label: string; className: string }> = {
  active: { label: 'در حال تحصیل', className: 'bg-green-50 text-green-800 ring-green-200' },
  suspended: { label: 'معلق', className: 'bg-red-50 text-red-700 ring-red-200' },
  graduated: { label: 'فارغ‌التحصیل', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

/**
 * Full profile of the focused child: identity, class, guardian, and the three
 * headline numbers (average / attendance / outstanding balance).
 */
export function ChildProfileCard({
  student,
  db,
  parent,
  academic,
  attendance,
  finance,
  className,
}: ChildProfileCardProps) {
  const classInfo = buildClassInfo(db, student);
  const status = STATUS_LABELS[student.status];
  const classLabel = classInfo.schoolClass?.name ?? '—';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-border bg-surface shadow-card',
        className,
      )}
    >
      {/* Identity band */}
      <div className="relative border-b border-border bg-gradient-to-l from-blue-50/80 via-slate-50 to-surface px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start gap-3.5">
          <Avatar name={student.name} color={student.avatarColor} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-text sm:text-lg">{student.name}</h2>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset',
                  status.className,
                )}
              >
                <BadgeCheck size={11} aria-hidden="true" />
                {status.label}
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
              <span className="inline-flex items-center gap-1">
                <School size={12} aria-hidden="true" />
                {classLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <GraduationCap size={12} aria-hidden="true" />
                پایه {student.gradeLevel} — رشته {student.field}
              </span>
              <span className="inline-flex items-center gap-1">
                <Hash size={12} aria-hidden="true" />
                کد دانش‌آموزی {toPersianDigits(student.studentCode)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border border-b border-border">
        <div className="px-3 py-3 text-center">
          <p className="text-[10px] text-text-muted">معدل کل</p>
          <p className="mt-1 text-lg font-extrabold text-text">
            {academic ? scoreText(academic.overallAverage) : '—'}
          </p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-[10px] text-text-muted">درصد حضور</p>
          <p
            className={cn(
              'mt-1 text-lg font-extrabold',
              attendance && attendance.rate >= 90
                ? 'text-success'
                : attendance && attendance.rate >= 75
                  ? 'text-warning'
                  : 'text-danger',
            )}
          >
            {attendance ? percentText(attendance.rate) : '—'}
          </p>
        </div>
        <div className="px-3 py-3 text-center">
          <p className="text-[10px] text-text-muted">بدهی باقی‌مانده</p>
          <p
            className={cn(
              'mt-1 text-[13px] font-extrabold',
              finance && finance.outstandingAmount > 0 ? 'text-danger' : 'text-success',
            )}
          >
            {finance
              ? finance.outstandingAmount > 0
                ? `${toPersianDigits(finance.outstandingAmount.toLocaleString('en-US'))} تومان`
                : 'تسویه'
              : '—'}
          </p>
        </div>
      </div>

      {/* Details */}
      <dl className="divide-y divide-border">
        <DetailRow
          icon={UserRound}
          label="نام ولی"
          value={parent ? `${parent.name} (${RELATION_LABELS[parent.relation]})` : student.guardianName}
        />
        <DetailRow
          icon={Phone}
          label="شماره تماس ولی"
          value={toPersianDigits(parent?.phone ?? student.guardianPhone)}
          ltr
        />
        <DetailRow
          icon={Phone}
          label="تماس دانش‌آموز"
          value={toPersianDigits(student.phone)}
          ltr
        />
        <DetailRow
          icon={CalendarDays}
          label="تاریخ ثبت‌نام"
          value={formatJalali(student.enrolledAt)}
        />
        <DetailRow
          icon={School}
          label="مدرسه / اتاق"
          value={`دبیرستان شهید بهشتی — ${classInfo.schoolClass?.room ?? '—'}`}
        />
        <DetailRow
          icon={GraduationCap}
          label="مربی / مشاور کلاس"
          value={classInfo.homeroomTeacher?.name ?? '—'}
        />
      </dl>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  ltr = false,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5 sm:px-5">
      <dt className="flex shrink-0 items-center gap-1.5 text-[11px] text-text-muted">
        <Icon size={13} aria-hidden="true" className="text-slate-400" />
        {label}
      </dt>
      <dd
        className={cn('min-w-0 text-end text-[12px] font-semibold text-text', ltr && 'font-mono')}
        dir={ltr ? 'ltr' : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
