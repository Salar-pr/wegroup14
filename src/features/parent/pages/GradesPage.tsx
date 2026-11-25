import { useMemo, useState } from 'react';
import {
  BarChart3,
  ClipboardList,
  Download,
  GraduationCap,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { Link } from 'react-router-dom';
import { GitCompareArrows } from 'lucide-react';
import { ROUTES } from '../../../constants';
import { useData, useToast } from '../../../hooks';
import { cn, formatJalali, formatJalaliShort, toPersianDigits } from '../../../utils';
import type { Grade } from '../../../types';
import { useParentChild } from '../hooks/useParentChild';
import {
  buildProgressSeries,
  gradeTone,
  percentText,
  scoreText,
  toTwenty,
} from '../lib/parentAnalytics';
import { SectionCard } from '../components/SectionCard';
import {
  GradeTypeBadge,
  SubjectAverageBar,
} from '../components/DomainBadge';
import { GradeProgressChart, ScoreDistributionChart, SubjectAverageChart, SubjectRadarChart } from '../components/charts/AcademicCharts';

const TYPE_OPTIONS = [
  { value: 'all', label: 'همهٔ انواع' },
  { value: 'quiz', label: 'آزمون کلاسی' },
  { value: 'assignment', label: 'تکلیف' },
  { value: 'midterm', label: 'میان‌ترم' },
  { value: 'final', label: 'پایان‌ترم' },
];

export default function GradesPage() {
  const { db } = useData();
  const { showToast } = useToast();
  const { child, academic } = useParentChild();
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const progress = useMemo(
    () => (child ? buildProgressSeries(db, child.id) : []),
    [db, child],
  );

  const subjectOptions = useMemo(
    () => [
      { value: 'all', label: 'همهٔ دروس' },
      ...(academic?.subjects ?? []).map((subject) => ({
        value: subject.subjectId,
        label: subject.subjectName,
      })),
    ],
    [academic?.subjects],
  );

  const rows = useMemo(() => {
    if (!academic) return [];
    const normalized = query.trim();
    return academic.gradeList.filter((grade) => {
      if (subjectFilter !== 'all' && grade.subjectId !== subjectFilter) return false;
      if (typeFilter !== 'all' && grade.type !== typeFilter) return false;
      if (normalized.length > 0) {
        const subjectName =
          db.subjects.find((subject) => subject.id === grade.subjectId)?.name ?? '';
        if (!subjectName.includes(normalized) && !grade.title.includes(normalized)) return false;
      }
      return true;
    });
  }, [academic, query, subjectFilter, typeFilter, db.subjects]);

  const columns: TableColumn<Grade>[] = [
    {
      key: 'subject',
      header: 'درس',
      sortValue: (grade) =>
        db.subjects.find((subject) => subject.id === grade.subjectId)?.name ?? '',
      render: (grade) => (
        <span className="text-[12px] font-semibold text-text">
          {db.subjects.find((subject) => subject.id === grade.subjectId)?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'عنوان ارزشیابی',
      sortValue: (grade) => grade.title,
      render: (grade) => <span className="text-[12px] text-text-muted">{grade.title}</span>,
    },
    {
      key: 'type',
      header: 'نوع',
      render: (grade) => <GradeTypeBadge type={grade.type} />,
    },
    {
      key: 'teacher',
      header: 'دبیر',
      render: (grade) => (
        <span className="text-[11.5px] text-text-muted">
          {db.teachers.find((teacher) => teacher.id === grade.teacherId)?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'score',
      header: 'نمره',
      align: 'center',
      sortValue: (grade) => toTwenty(grade),
      render: (grade) => {
        const scaled = toTwenty(grade);
        const tone = gradeTone(scaled);
        return (
          <span
            className={cn(
              'inline-flex min-w-[52px] justify-center rounded-full px-2 py-0.5 text-[12px] font-extrabold',
              tone === 'success'
                ? 'bg-green-50 text-green-800'
                : tone === 'warning'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-red-50 text-red-700',
            )}
          >
            {scoreText(scaled)}
          </span>
        );
      },
    },
    {
      key: 'max',
      header: 'از',
      align: 'center',
      render: (grade) => (
        <span className="text-[11px] text-text-muted">{toPersianDigits(grade.maxScore)}</span>
      ),
    },
    {
      key: 'date',
      header: 'تاریخ',
      sortValue: (grade) => grade.date,
      render: (grade) => (
        <span className="text-[11px] text-text-muted">{formatJalaliShort(grade.date)}</span>
      ),
    },
  ];

  if (!child || !academic) {
    return (
      <>
        <PageHeader title="کارنامه و نمرات" description="عملکرد تحصیلی فرزند" />
        <EmptyState icon={ClipboardList} title="فرزندی به این حساب متصل نیست" />
      </>
    );
  }

  const topSubject = academic.bestSubject;
  const weakest = academic.weakestSubject;

  return (
    <>
      <PageHeader
        title="کارنامه و نمرات"
        description={`${child.name} — ${toPersianDigits(academic.totalGrades)} نمره ثبت‌شده در ${toPersianDigits(academic.subjects.length)} درس`}
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'پیشخوان اولیا', to: '/parent' }, { label: 'نمرات' }]}
        actions={
          <>
            <Link to={`${ROUTES.PARENT}/grades/compare`}>
              <Button variant="outline" size="sm" leftIcon={GitCompareArrows}>
                مقایسهٔ عملکرد
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Download}
              onClick={() =>
                showToast(
                  'info',
                  'در نسخهٔ نمایشی امکان دریافت فایل وجود ندارد؛ کارنامه فقط در همین صفحه قابل مشاهده است.',
                  'خروجی کارنامه',
                )
              }
            >
              دریافت کارنامه
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="معدل وزنی کل"
          value={scoreText(academic.overallAverage)}
          icon={GraduationCap}
          tone={gradeTone(academic.overallAverage)}
          hint="بر اساس ضریب دروس"
        />
        <StatCard
          title="میانگین ساده"
          value={scoreText(academic.simpleAverage)}
          icon={BarChart3}
          tone="info"
          hint={`از ${toPersianDigits(academic.totalGrades)} نمره`}
        />
        <StatCard
          title="نرخ قبولی"
          value={percentText(academic.passRate, 0)}
          icon={Target}
          tone={academic.passRate >= 90 ? 'success' : academic.passRate >= 70 ? 'warning' : 'danger'}
          hint={`${toPersianDigits(academic.passedCount)} نمرهٔ قبولی`}
        />
        <StatCard
          title="روند نمرات"
          value={
            academic.trendDelta === 0
              ? 'بدون تغییر'
              : `${academic.trendDelta > 0 ? '+' : ''}${scoreText(academic.trendDelta)}`
          }
          icon={TrendingUp}
          tone={academic.trendDelta >= 0 ? 'success' : 'danger'}
          hint="مقایسهٔ نمرات اخیر با گذشته"
        />
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <SectionCard
          title="میانگین هر درس"
          description="مقایسه با حد نصاب ۱۰ از ۲۰"
          icon={BarChart3}
        >
          <SubjectAverageChart subjects={academic.subjects} />
        </SectionCard>

        <SectionCard
          title="روند نمرات"
          description="نمرهٔ هر ارزشیابی به ترتیب تاریخ"
          icon={TrendingUp}
        >
          {progress.length === 0 ? (
            <EmptyState icon={TrendingUp} title="داده‌ای برای نمودار وجود ندارد" />
          ) : (
            <GradeProgressChart points={progress} />
          )}
        </SectionCard>

        <SectionCard
          title="توزیع نمرات"
          description="پراکندگی نمرات در بازه‌های چهارگانه"
          icon={Target}
        >
          <ScoreDistributionChart distribution={academic.distribution} />
        </SectionCard>

        <SectionCard
          title="پروفایل درسی"
          description="نقشهٔ قوت و ضعف دروس"
          icon={GraduationCap}
        >
          <SubjectRadarChart subjects={academic.subjects} />
        </SectionCard>
      </div>

      {/* Subject averages table */}
      <div className="mt-4">
        <SectionCard
          title="میانگین دروس"
          description="میانگین، بهترین و ضعیف‌ترین نمرهٔ هر درس"
          icon={ClipboardList}
          flush
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 text-[11px] text-text-muted">
                  <th className="px-4 py-2.5 text-start font-bold">درس</th>
                  <th className="px-4 py-2.5 text-start font-bold">دبیر</th>
                  <th className="px-4 py-2.5 text-center font-bold">ضریب</th>
                  <th className="px-4 py-2.5 text-center font-bold">تعداد نمره</th>
                  <th className="px-4 py-2.5 text-center font-bold">بهترین</th>
                  <th className="px-4 py-2.5 text-center font-bold">ضعیف‌ترین</th>
                  <th className="px-4 py-2.5 text-start font-bold">میانگین</th>
                </tr>
              </thead>
              <tbody>
                {academic.subjects.map((subject) => (
                  <tr
                    key={subject.subjectId}
                    className="border-b border-border last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: subject.color }}
                          aria-hidden="true"
                        />
                        <span className="text-[12px] font-semibold text-text">
                          {subject.subjectName}
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11.5px] text-text-muted">
                      {subject.teacherName}
                    </td>
                    <td className="px-4 py-2.5 text-center text-[11.5px] text-text-muted">
                      {toPersianDigits(subject.coefficient)}
                    </td>
                    <td className="px-4 py-2.5 text-center text-[11.5px] text-text-muted">
                      {toPersianDigits(subject.count)}
                    </td>
                    <td className="px-4 py-2.5 text-center text-[11.5px] font-bold text-success">
                      {scoreText(subject.best)}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-center text-[11.5px] font-bold',
                        gradeTone(subject.worst) === 'danger' ? 'text-danger' : 'text-text',
                      )}
                    >
                      {scoreText(subject.worst)}
                    </td>
                    <td className="px-4 py-2.5">
                      <SubjectAverageBar
                        value={subject.average}
                        color={subject.color}
                        tone={gradeTone(subject.average)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Grade list */}
      <div className="mt-4">
        <SectionCard
          title="فهرست نمرات"
          description="جست‌وجو و فیلتر بر اساس درس و نوع ارزشیابی"
          icon={Search}
        >
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              placeholder="جست‌وجوی درس یا عنوان…"
              leftIcon={Search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="جست‌وجوی نمرات"
            />
            <Select
              options={subjectOptions}
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              aria-label="فیلتر درس"
            />
            <Select
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="فیلتر نوع ارزشیابی"
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="نمره‌ای با این فیلتر یافت نشد"
              description="فیلترها را تغییر دهید یا عبارت جست‌وجو را پاک کنید."
              actionLabel="پاک کردن فیلترها"
              onAction={() => {
                setQuery('');
                setSubjectFilter('all');
                setTypeFilter('all');
              }}
            />
          ) : (
            <Table<Grade>
              data={rows}
              rowKey={(grade) => grade.id}
              columns={columns}
              caption="فهرست نمرات دانش‌آموز"
              pageSize={8}
            />
          )}
        </SectionCard>
      </div>

      {/* Insight strip */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {topSubject && (
          <div className="rounded-card border border-green-200 bg-green-50/60 px-4 py-3">
            <p className="text-[11px] font-bold text-green-900">
              قوی‌ترین درس: {topSubject.subjectName}
            </p>
            <p className="mt-1 text-[11px] leading-6 text-green-800">
              میانگین {scoreText(topSubject.average)} از ۲۰ در {toPersianDigits(topSubject.count)}{' '}
              ارزشیابی. آخرین نمره: {scoreText(topSubject.lastScore)} ({topSubject.lastTitle} —{' '}
              {formatJalali(topSubject.lastDate)}).
            </p>
          </div>
        )}
        {weakest && (
          <div className="rounded-card border border-amber-200 bg-amber-50/60 px-4 py-3">
            <p className="text-[11px] font-bold text-amber-900">
              نیازمند توجه: {weakest.subjectName}
            </p>
            <p className="mt-1 text-[11px] leading-6 text-amber-800">
              میانگین {scoreText(weakest.average)} از ۲۰. پیشنهاد می‌شود برای هماهنگی جلسهٔ مشاوره با
              دبیر {weakest.teacherName} از بخش پیام‌ها اقدام کنید.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
