import { useMemo } from 'react';
import { ArrowRight, BarChart3, GitCompareArrows, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, Badge, EmptyState, PageHeader, StatCard, Table, type TableColumn } from '../../../components';
import { ROUTES } from '../../../constants';
import { useData } from '../../../hooks';
import { cn, toPersianDigits } from '../../../utils';
import { useParentChild } from '../hooks/useParentChild';
import { useParentSession, type ComparisonMetric } from '../hooks/parent-session';
import {
  buildAcademicSummary,
  buildAttendanceSummary,
  gradeTone,
  percentText,
  scoreText,
  subjectColor,
} from '../lib/parentAnalytics';
import { ChildComparisonChart, type ComparisonSeries } from '../components/charts/AcademicCharts';
import { SectionCard } from '../components/SectionCard';

interface CompareRow {
  key: string;
  label: string;
  values: Array<{ childId: string; display: string; numeric: number | null; tone?: 'success' | 'warning' | 'danger' }>;
}

const METRICS: Array<{ id: ComparisonMetric; label: string; hint: string }> = [
  { id: 'average', label: 'میانگین درس', hint: 'میانگین نمرات هر درس (از ۲۰)' },
  { id: 'coefficient', label: 'ضریب درس', hint: 'اهمیت درس در محاسبهٔ معدل' },
  { id: 'trend', label: 'تعداد نمره', hint: 'تعداد ارزشیابی‌های ثبت‌شده در آن درس' },
];

export default function ComparePage() {
  const { db } = useData();
  const { children, child } = useParentChild();
  const { comparisonMetric, setComparisonMetric } = useParentSession();

  const summaries = useMemo(
    () =>
      children.map((student, index) => ({
        student,
        academic: buildAcademicSummary(db, student.id),
        attendance: buildAttendanceSummary(db, student.id),
        color: subjectColor(index),
      })),
    [children, db],
  );

  // ---- chart series, switched by the selected metric -----------------------
  const series: ComparisonSeries[] = useMemo(
    () =>
      summaries.map((item) => ({
        childId: item.student.id,
        childName: item.student.name,
        color: item.color,
        values: item.academic.subjects.map((subject) => ({
          subjectName: subject.subjectName,
          value:
            comparisonMetric === 'average'
              ? subject.average
              : comparisonMetric === 'coefficient'
                ? subject.coefficient
                : subject.count,
        })),
      })),
    [summaries, comparisonMetric],
  );

  /**
   * With a single child there is nobody to compare against, so we compare the
   * child's own records: average per exam type vs. the overall average. With
   * several children we compare the three children across the chosen metric.
   */
  const singleChild = children.length === 1;

  const recordSeries: ComparisonSeries[] = useMemo(() => {
    if (!singleChild || summaries.length === 0) return [];
    const only = summaries[0];
    const byType = new Map<string, number[]>();
    for (const grade of only.academic.gradeList) {
      const scaled = (grade.score / grade.maxScore) * 20;
      const list = byType.get(grade.type) ?? [];
      list.push(scaled);
      byType.set(grade.type, list);
    }
    const typeLabels: Record<string, string> = {
      quiz: 'آزمون کلاسی',
      assignment: 'تکلیف',
      midterm: 'میان‌ترم',
      final: 'پایان‌ترم',
    };
    return [
      {
        childId: only.student.id,
        childName: 'میانگین هر نوع ارزشیابی',
        color: only.color,
        values: Array.from(byType.entries()).map(([type, scores]) => ({
          subjectName: typeLabels[type] ?? type,
          value: Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 100) / 100,
        })),
      },
      {
        childId: `${only.student.id}-avg`,
        childName: 'میانگین کل',
        color: '#94A3B8',
        values: [
          {
            subjectName: 'میانگین کل',
            value: only.academic.overallAverage,
          },
        ],
      },
    ];
  }, [singleChild, summaries]);

  const metricLabel = comparisonMetric === 'average' ? 'میانگین' : comparisonMetric === 'coefficient' ? 'ضریب' : 'تعداد نمره';
  const maxValue = comparisonMetric === 'average' ? 20 : comparisonMetric === 'coefficient' ? 4 : 6;

  // ---- side-by-side comparison rows ---------------------------------------
  const rows: CompareRow[] = useMemo(() => {
    if (summaries.length === 0) return [];
    const build = (
      key: string,
      label: string,
      pick: (item: (typeof summaries)[number]) => { display: string; numeric: number | null; tone?: 'success' | 'warning' | 'danger' },
    ): CompareRow => ({
      key,
      label,
      values: summaries.map((item) => ({ childId: item.student.id, ...pick(item) })),
    });

    return [
      build('gpa', 'معدل کل', (item) => ({
        display: scoreText(item.academic.overallAverage),
        numeric: item.academic.overallAverage,
        tone: gradeTone(item.academic.overallAverage),
      })),
      build('simple', 'میانگین ساده', (item) => ({
        display: scoreText(item.academic.simpleAverage),
        numeric: item.academic.simpleAverage,
        tone: gradeTone(item.academic.simpleAverage),
      })),
      build('count', 'تعداد نمره', (item) => ({
        display: toPersianDigits(item.academic.totalGrades),
        numeric: item.academic.totalGrades,
      })),
      build('subjects', 'تعداد درس', (item) => ({
        display: toPersianDigits(item.academic.subjects.length),
        numeric: item.academic.subjects.length,
      })),
      build('pass', 'نرخ قبولی', (item) => ({
        display: percentText(item.academic.passRate, 0),
        numeric: item.academic.passRate,
        tone: item.academic.passRate >= 90 ? 'success' : item.academic.passRate >= 70 ? 'warning' : 'danger',
      })),
      build('attendance', 'درصد حضور', (item) => ({
        display: percentText(item.attendance.rate, 0),
        numeric: item.attendance.rate,
        tone: item.attendance.rate >= 90 ? 'success' : item.attendance.rate >= 75 ? 'warning' : 'danger',
      })),
      build('absent', 'روزهای غیبت', (item) => ({
        display: toPersianDigits(item.attendance.absentCount),
        numeric: item.attendance.absentCount,
        tone: item.attendance.absentCount === 0 ? 'success' : item.attendance.absentCount > 2 ? 'danger' : 'warning',
      })),
      build('late', 'تأخیرها', (item) => ({
        display: toPersianDigits(item.attendance.lateCount),
        numeric: item.attendance.lateCount,
        tone: item.attendance.lateCount === 0 ? 'success' : 'warning',
      })),
      build('best', 'قوی‌ترین درس', (item) => ({
        display: item.academic.bestSubject?.subjectName ?? '—',
        numeric: item.academic.bestSubject?.average ?? null,
      })),
      build('weakest', 'ضعیف‌ترین درس', (item) => ({
        display: item.academic.weakestSubject?.subjectName ?? '—',
        numeric: item.academic.weakestSubject?.average ?? null,
      })),
      build('status', 'وضعیت', (item) => ({
        display: item.student.status === 'active' ? 'فعال' : 'معلق',
        numeric: null,
      })),
    ];
  }, [summaries]);

  const columns: TableColumn<CompareRow>[] = [
    {
      key: 'label',
      header: 'شاخص',
      render: (row) => (
        <span className="text-[11.5px] font-semibold text-text">{row.label}</span>
      ),
    },
    ...summaries.map((item) => ({
      key: item.student.id,
      header: (
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          {item.student.name}
        </span>
      ),
      align: 'center' as const,
      render: (row: CompareRow) => {
        const value = row.values.find((entry) => entry.childId === item.student.id);
        if (!value) return <span className="text-text-muted">—</span>;
        return (
          <span
            className={cn(
              'text-[11.5px] font-bold',
              value.tone === 'success'
                ? 'text-success'
                : value.tone === 'warning'
                  ? 'text-warning'
                  : value.tone === 'danger'
                    ? 'text-danger'
                    : 'text-text',
            )}
          >
            {value.display}
          </span>
        );
      },
    })),
  ];

  if (children.length === 0) {
    return (
      <>
        <PageHeader title="مقایسهٔ عملکرد" description="مقایسهٔ سوابق تحصیلی" />
        <EmptyState icon={Users} title="فرزندی به این حساب متصل نیست" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={singleChild ? 'تحلیل عملکرد تحصیلی' : 'مقایسهٔ عملکرد فرزندان'}
        description={
          singleChild
            ? `${child?.name} — مقایسهٔ دروس و ارزشیابی‌های ثبت‌شده`
            : 'مقایسهٔ شاخص‌های تحصیلی و حضوری فرزندان بر اساس داده‌های زندهٔ سامانه'
        }
        breadcrumbs={[
          { label: 'مدرسه‌یار' },
          { label: 'پیشخوان اولیا', to: '/parent' },
          { label: 'نمرات', to: `${ROUTES.PARENT}/grades` },
          { label: 'مقایسه' },
        ]}
        actions={
          <Link to={`${ROUTES.PARENT}/grades`}>
            <Badge variant="primary" dot={false}>
              <ArrowRight size={12} aria-hidden="true" />
              بازگشت به کارنامه
            </Badge>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="تعداد فرزندان"
          value={toPersianDigits(children.length)}
          icon={Users}
          tone="primary"
          hint="متصل به این حساب"
        />
        <StatCard
          title="بیشترین معدل"
          value={
            summaries.length > 0
              ? scoreText(Math.max(...summaries.map((item) => item.academic.overallAverage)))
              : '—'
          }
          icon={GraduationCap}
          tone="success"
          hint="در بین فرزندان"
        />
        <StatCard
          title="کمترین معدل"
          value={
            summaries.length > 0
              ? scoreText(Math.min(...summaries.map((item) => item.academic.overallAverage)))
              : '—'
          }
          icon={BarChart3}
          tone="warning"
          hint="در بین فرزندان"
        />
        <StatCard
          title="شاخص‌های مقایسه"
          value={toPersianDigits(rows.length)}
          icon={GitCompareArrows}
          tone="info"
          hint="ردیف در جدول مقایسه"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <SectionCard
          title={singleChild ? 'مقایسهٔ انواع ارزشیابی' : 'نمودار مقایسه'}
          description={
            singleChild
              ? 'میانگین فرزند شما در هر نوع ارزشیابی در برابر میانگین کل'
              : 'انتخاب شاخص برای مقایسهٔ دروس'
          }
          icon={BarChart3}
          action={
            singleChild ? undefined : (
            <div className="flex flex-wrap gap-1">
              {METRICS.map((metric) => (
                <button
                  key={metric.id}
                  type="button"
                  title={metric.hint}
                  aria-pressed={comparisonMetric === metric.id}
                  onClick={() => setComparisonMetric(metric.id)}
                  className={cn(
                    'rounded-btn px-2.5 py-1 text-[10.5px] font-bold transition-colors',
                    comparisonMetric === metric.id
                      ? 'bg-primary text-white'
                      : 'border border-border bg-surface text-text hover:bg-slate-50',
                  )}
                >
                  {metric.label}
                </button>
              ))}
            </div>
            )
          }
        >
          {series.every((item) => item.values.length === 0) ? (
            <EmptyState
              icon={BarChart3}
              title="نمره‌ای برای مقایسه ثبت نشده است"
              description="به‌محض ثبت نمره توسط معلمان، نمودار مقایسه در این بخش نمایش داده می‌شود."
            />
          ) : (
            <ChildComparisonChart
              series={singleChild ? recordSeries : series}
              metricLabel={
                singleChild
                  ? 'نمره'
                  : metricLabel === 'ضریب'
                    ? 'ضریب'
                    : metricLabel === 'تعداد نمره'
                      ? 'تعداد'
                      : 'نمره'
              }
              maxValue={singleChild ? 20 : maxValue}
            />
          )}
          {!singleChild && (
            <p className="mt-2 text-center text-[10.5px] text-text-muted">
              {METRICS.find((metric) => metric.id === comparisonMetric)?.hint}
            </p>
          )}
        </SectionCard>

        <SectionCard
          title={singleChild ? 'شاخص‌های عملکرد فرزند شما' : 'جدول مقایسهٔ فرزندان'}
          description={
            singleChild
              ? 'خلاصهٔ شاخص‌های کلیدی این دانش‌آموز'
              : 'شاخص‌های کلیدی در کنار هم'
          }
          icon={GitCompareArrows}
        >
          {summaries.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {summaries.map((item) => (
                <span
                  key={item.student.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-2.5 py-1"
                >
                  <Avatar name={item.student.name} color={item.student.avatarColor} size="xs" />
                  <span className="text-[11px] font-bold text-text">{item.student.name}</span>
                </span>
              ))}
            </div>
          )}
          <Table<CompareRow>
            data={rows}
            rowKey={(row) => row.key}
            columns={columns}
            caption="جدول مقایسهٔ عملکرد"
            pageSize={0}
          />
        </SectionCard>
      </div>
    </>
  );
}
