import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from './SectionCard';
import type { AcademicSummary as AcademicSummaryModel } from '../lib/parentAnalytics';
import { gradeTone, scoreText } from '../lib/parentAnalytics';
import { cn, formatJalaliShort, toPersianDigits } from '../../../utils';
import { ROUTES } from '../../../constants';
import { GRADE_TYPE_META } from './DomainBadge';

const TONE_TEXT: Record<'success' | 'warning' | 'danger', string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/**
 * Academic average card: weighted average, pass rate, best/weakest subject and
 * the three most recent grades — the parent's at-a-glance academic picture.
 */
export function AcademicSummaryCard({
  academic,
  className,
}: {
  academic: AcademicSummaryModel;
  className?: string;
}) {
  const tone = gradeTone(academic.overallAverage);
  const recent = academic.gradeList.slice(0, 3);
  const trendUp = academic.trendDelta > 0.05;
  const trendDown = academic.trendDelta < -0.05;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;

  return (
    <SectionCard
      title="خلاصه عملکرد تحصیلی"
      description="میانگین وزنی نمرات ثبت‌شده در سامانه"
      icon={TrendingUp}
      className={className}
      action={
        <Link
          to={`${ROUTES.PARENT}/grades`}
          className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
        >
          کارنامه کامل
          <ArrowLeft size={13} aria-hidden="true" />
        </Link>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-text-muted">معدل کل (از ۲۰)</p>
          <p className={cn('mt-1 text-3xl font-extrabold tracking-tight', TONE_TEXT[tone])}>
            {scoreText(academic.overallAverage)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
              trendUp
                ? 'bg-green-50 text-green-800 ring-green-200'
                : trendDown
                  ? 'bg-red-50 text-red-700 ring-red-200'
                  : 'bg-slate-100 text-slate-700 ring-slate-200',
            )}
          >
            <TrendIcon size={13} aria-hidden="true" />
            {trendUp || trendDown
              ? `${academic.trendDelta > 0 ? '+' : ''}${scoreText(academic.trendDelta)} نمره`
              : 'بدون تغییر'}
          </span>
          <span className="text-[10px] text-text-muted">روند نمرات اخیر</span>
        </div>
      </div>

      {/* rate bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-text-muted">نرخ قبولی در آزمون‌ها</span>
          <span className="font-bold text-text">
            {toPersianDigits(academic.passedCount)} از {toPersianDigits(academic.totalGrades)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100" role="presentation">
          <div
            className={cn(
              'h-full rounded-full',
              academic.passRate >= 90
                ? 'bg-success'
                : academic.passRate >= 70
                  ? 'bg-warning'
                  : 'bg-danger',
            )}
            style={{ width: `${Math.max(2, Math.min(100, academic.passRate))}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-btn border border-border bg-slate-50/60 px-3 py-2">
          <p className="text-[10px] text-text-muted">قوی‌ترین درس</p>
          <p className="mt-0.5 truncate text-[12px] font-bold text-text">
            {academic.bestSubject?.subjectName ?? '—'}
          </p>
          <p className="text-[11px] font-bold text-success">
            {academic.bestSubject ? scoreText(academic.bestSubject.average) : '—'}
          </p>
        </div>
        <div className="rounded-btn border border-border bg-slate-50/60 px-3 py-2">
          <p className="text-[10px] text-text-muted">نیازمند تقویت</p>
          <p className="mt-0.5 truncate text-[12px] font-bold text-text">
            {academic.weakestSubject?.subjectName ?? '—'}
          </p>
          <p
            className={cn(
              'text-[11px] font-bold',
              academic.weakestSubject
                ? TONE_TEXT[gradeTone(academic.weakestSubject.average)]
                : 'text-text-muted',
            )}
          >
            {academic.weakestSubject ? scoreText(academic.weakestSubject.average) : '—'}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-bold text-text">آخرین نمرات ثبت‌شده</p>
        {recent.length === 0 ? (
          <p className="text-[11px] text-text-muted">هنوز نمره‌ای ثبت نشده است.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {recent.map((grade) => {
              const scaled = grade.maxScore > 0 ? (grade.score / grade.maxScore) * 20 : 0;
              return (
                <li
                  key={grade.id}
                  className="flex items-center justify-between gap-2 rounded-btn bg-slate-50/70 px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-semibold text-text">
                      {GRADE_TYPE_META[grade.type]} — {grade.title}
                    </p>
                    <p className="text-[10px] text-text-muted">{formatJalaliShort(grade.date)}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold',
                      gradeTone(scaled) === 'success'
                        ? 'bg-green-50 text-green-800'
                        : gradeTone(scaled) === 'warning'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-700',
                    )}
                  >
                    {scoreText(scaled)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
