import { ArrowLeft, CalendarCheck2, Clock, ShieldAlert, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from './SectionCard';
import type { AttendanceSummary as AttendanceSummaryModel } from '../lib/parentAnalytics';
import { percentText } from '../lib/parentAnalytics';
import { ROUTES } from '../../../constants';
import { cn, formatJalaliShort, toPersianDigits } from '../../../utils';
import { ATTENDANCE_META } from './DomainBadge';

const TILES = [
  { key: 'present', label: 'حاضر', icon: CalendarCheck2, color: 'text-success', bg: 'bg-green-50' },
  { key: 'late', label: 'تأخیر', icon: Clock, color: 'text-warning', bg: 'bg-amber-50' },
  { key: 'absent', label: 'غیبت', icon: UserX, color: 'text-danger', bg: 'bg-red-50' },
  { key: 'excused', label: 'موجه', icon: ShieldAlert, color: 'text-info', bg: 'bg-sky-50' },
] as const;

/**
 * Attendance snapshot: percentage plus the four status counters and the most
 * recent absence / late arrival, so the parent instantly sees what needs follow-up.
 */
export function AttendanceSummaryCard({
  attendance,
  className,
}: {
  attendance: AttendanceSummaryModel;
  className?: string;
}) {
  const counts: Record<(typeof TILES)[number]['key'], number> = {
    present: attendance.presentCount,
    late: attendance.lateCount,
    absent: attendance.absentCount,
    excused: attendance.excusedCount,
  };

  const latestIssue = [...attendance.absences, ...attendance.lates].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];

  return (
    <SectionCard
      title="حضور و غیاب"
      description="وضعیت حضور فرزند در کلاس‌های ثبت‌شده"
      icon={CalendarCheck2}
      className={className}
      action={
        <Link
          to={`${ROUTES.PARENT}/attendance`}
          className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
        >
          جزئیات
          <ArrowLeft size={13} aria-hidden="true" />
        </Link>
      }
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden="true">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={
                attendance.rate >= 90 ? '#16A34A' : attendance.rate >= 75 ? '#F59E0B' : '#DC2626'
              }
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${(Math.min(100, attendance.rate) / 100) * 97.4} 97.4`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-text">
            {percentText(attendance.rate, 0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-text-muted">درصد حضور</p>
          <p className="text-[12px] font-bold text-text">
            از {toPersianDigits(attendance.total)} روز ثبت‌شده،{' '}
            {toPersianDigits(attendance.attendedCount)} روز حاضر بوده است.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.key}
              className="flex flex-col items-center gap-1 rounded-btn border border-border px-1.5 py-2"
            >
              <span
                className={cn('flex h-7 w-7 items-center justify-center rounded-full', tile.bg)}
              >
                <Icon size={14} className={tile.color} aria-hidden="true" />
              </span>
              <span className="text-[13px] font-extrabold text-text">
                {toPersianDigits(counts[tile.key])}
              </span>
              <span className="text-[10px] text-text-muted">{tile.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-btn border border-border bg-slate-50/60 px-3 py-2">
        {latestIssue ? (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted">آخرین مورد نیازمند پیگیری</p>
              <p className="truncate text-[11.5px] font-semibold text-text">
                {ATTENDANCE_META[latestIssue.status].label} — {formatJalaliShort(latestIssue.date)}
              </p>
              {latestIssue.note && (
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-text-muted">
                  {latestIssue.note}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[11px] font-semibold text-success">
            هیچ غیبت یا تأخیری ثبت نشده است — وضعیت حضور مطلوب است.
          </p>
        )}
      </div>
    </SectionCard>
  );
}
