import { ArrowDownRight, ArrowUpRight, Minus, BookOpen, UserRound } from 'lucide-react';
import { Badge } from '../../../components';
import { cn, formatJalali, toPersianDigits } from '../../../utils';
import {
  formatPersianDecimal,
  gradeBadgeVariant,
  gradeQualitativeLabel,
  type SubjectGradeSummary,
} from '../lib/studentAnalytics';

export interface GradeCardProps {
  subject: SubjectGradeSummary;
  selected?: boolean;
  onSelect?: (subjectId: string) => void;
}

/**
 * Subject grade summary card displaying average out of 20, coefficient,
 * teacher name, class comparison, and recent score trend.
 */
export function GradeCard({ subject, selected = false, onSelect }: GradeCardProps) {
  const hasGrades = subject.gradesCount > 0;
  const variant = hasGrades ? gradeBadgeVariant(subject.average) : 'neutral';
  const progressPercent = hasGrades ? Math.min(100, Math.max(0, (subject.average / 20) * 100)) : 0;

  const barColor =
    variant === 'success'
      ? 'bg-success'
      : variant === 'warning'
        ? 'bg-warning'
        : variant === 'danger'
          ? 'bg-danger'
          : 'bg-slate-300';

  const interactive = Boolean(onSelect);

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onSelect ? () => onSelect(subject.subjectId) : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(subject.subjectId);
              }
            }
          : undefined
      }
      className={cn(
        'flex flex-col justify-between rounded-card border bg-surface p-4 shadow-card transition-all duration-150',
        interactive && 'cursor-pointer hover:border-primary/50 hover:shadow-cardHover',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border',
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: subject.color }}
                aria-hidden="true"
              />
              <h3 className="truncate text-[14px] font-bold text-text">{subject.subjectName}</h3>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-text-muted">
              <UserRound size={12} aria-hidden="true" />
              <span>{subject.teacherName}</span>
              <span>•</span>
              <span>ضریب {toPersianDigits(subject.coefficient)}</span>
            </p>
          </div>

          <Badge variant={variant} dot={false}>
            {hasGrades ? gradeQualitativeLabel(subject.average) : 'بدون نمره'}
          </Badge>
        </div>

        {/* Score display + progress bar */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-text">
                {hasGrades ? formatPersianDecimal(subject.average) : '—'}
              </span>
              {hasGrades && <span className="text-[11px] font-medium text-text-muted">از ۲۰</span>}
            </div>

            {subject.trendDelta !== undefined ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-[11px] font-bold',
                  subject.trendDelta > 0
                    ? 'text-success'
                    : subject.trendDelta < 0
                      ? 'text-danger'
                      : 'text-text-muted',
                )}
              >
                {subject.trendDelta > 0 ? (
                  <ArrowUpRight size={13} aria-hidden="true" />
                ) : subject.trendDelta < 0 ? (
                  <ArrowDownRight size={13} aria-hidden="true" />
                ) : (
                  <Minus size={13} aria-hidden="true" />
                )}
                {subject.trendDelta > 0 ? '+' : ''}
                {formatPersianDecimal(subject.trendDelta)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                <BookOpen size={12} aria-hidden="true" />
                {toPersianDigits(subject.gradesCount)} نمره ثبت‌شده
              </span>
            )}
          </div>

          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={hasGrades ? Math.round(subject.average) : 0}
            aria-valuemin={0}
            aria-valuemax={20}
            aria-label={`میانگین درس ${subject.subjectName}`}
          >
            <div
              className={cn('h-full rounded-full transition-all duration-300', barColor)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 text-[11px] text-text-muted">
        {hasGrades && subject.latestGrade ? (
          <>
            <span>
              آخرین: <strong className="text-text">{subject.latestGrade.grade.title}</strong> (
              {formatPersianDecimal(subject.latestGrade.score20)})
            </span>
            <span>{formatJalali(subject.latestGrade.grade.date)}</span>
          </>
        ) : (
          <span>هنوز نمره‌ای برای این درس ثبت نشده است</span>
        )}
      </div>
    </div>
  );
}
