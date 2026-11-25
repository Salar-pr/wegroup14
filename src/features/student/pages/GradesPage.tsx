import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  ClipboardList,
  FileText,
  FilterX,
  Minus,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { ROUTES } from '../../../constants/routes';
import { formatJalali, toPersianDigits } from '../../../utils';
import { GradeTrendLineChart, SubjectPerformanceBarChart } from '../components/AcademicCharts';
import { GradeCard } from '../components/GradeCard';
import { SectionCard } from '../components/SectionCard';
import { useStudentPortal } from '../hooks/useStudentPortal';
import {
  GRADE_TYPE_LABELS,
  formatPersianDecimal,
  gradeBadgeVariant,
  gradeQualitativeLabel,
  type EnrichedGrade,
} from '../lib/studentAnalytics';

export default function GradesPage() {
  const { student, dossier, academic, session } = useStudentPortal();

  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllClassSubjects, setShowAllClassSubjects] = useState<boolean>(false);

  const subjectOptions = useMemo(() => {
    if (!academic) return [{ value: 'all', label: 'همه دروس' }];
    return [
      { value: 'all', label: 'همه دروس' },
      ...academic.subjectSummaries.map((sub) => ({
        value: sub.subjectId,
        label: sub.subjectName,
      })),
    ];
  }, [academic]);

  const typeOptions = [
    { value: 'all', label: 'همه انواع ارزشیابی' },
    { value: 'quiz', label: GRADE_TYPE_LABELS.quiz },
    { value: 'assignment', label: GRADE_TYPE_LABELS.assignment },
    { value: 'midterm', label: GRADE_TYPE_LABELS.midterm },
    { value: 'final', label: GRADE_TYPE_LABELS.final },
  ];

  const filteredGrades = useMemo(() => {
    if (!academic) return [];
    const q = searchQuery.trim();
    return academic.grades.filter((item) => {
      if (subjectFilter !== 'all' && item.grade.subjectId !== subjectFilter) return false;
      if (typeFilter !== 'all' && item.grade.type !== typeFilter) return false;
      if (
        q &&
        !item.subjectName.includes(q) &&
        !item.grade.title.includes(q) &&
        !item.teacherName.includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [academic, subjectFilter, typeFilter, searchQuery]);

  if (!student || !dossier || !academic) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="اطلاعات نمرات یافت نشد"
        description="پرونده تحصیلی شما در حال حاضر فاقد اطلاعات نمره است."
      />
    );
  }

  const displayedSubjectCards = showAllClassSubjects
    ? academic.allClassSubjects
    : academic.subjectSummaries;

  const columns: Array<TableColumn<EnrichedGrade>> = [
    {
      key: 'subject',
      header: 'نام درس',
      sortValue: (row) => row.subjectName,
      render: (row) => (
        <div>
          <p className="font-bold text-text">{row.subjectName}</p>
          <p className="text-[11px] text-text-muted">
            ضریب {toPersianDigits(row.coefficient)} • دبیر: {row.teacherName}
          </p>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'عنوان آزمون / ارزشیابی',
      sortValue: (row) => row.grade.title,
      render: (row) => <span className="font-medium text-text">{row.grade.title}</span>,
    },
    {
      key: 'type',
      header: 'نوع',
      sortValue: (row) => row.grade.type,
      render: (row) => (
        <Badge variant="info" dot={false}>
          {GRADE_TYPE_LABELS[row.grade.type]}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'تاریخ ثبت',
      sortValue: (row) => row.grade.date,
      render: (row) => (
        <span className="text-[12px] text-text-muted">{formatJalali(row.grade.date)}</span>
      ),
    },
    {
      key: 'score',
      header: 'نمره کسب‌شده',
      align: 'center',
      sortValue: (row) => row.score20,
      render: (row) => (
        <span className="font-extrabold text-text">
          {formatPersianDecimal(row.grade.score)} از {toPersianDigits(row.grade.maxScore)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت کیفی',
      align: 'center',
      sortValue: (row) => row.score20,
      render: (row) => (
        <Badge variant={gradeBadgeVariant(row.score20)}>{gradeQualitativeLabel(row.score20)}</Badge>
      ),
    },
  ];

  const hasFilters =
    subjectFilter !== 'all' || typeFilter !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="نمرات و عملکرد تحصیلی من"
        description="بررسی نمرات به تفکیک درس، نتایج آزمون‌ها، نمودارهای پیشرفت و تغییرات اخیر نمرات"
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'نمرات من' }]}
        actions={
          <Link to={`${ROUTES.STUDENT}/report-card`}>
            <Button variant="primary" size="sm" leftIcon={FileText}>
              کارنامه کامل نیم‌سال
            </Button>
          </Link>
        }
      />

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="معدل وزنی نمرات ثبت‌شده"
          value={`${formatPersianDecimal(academic.weightedAverage)} از ۲۰`}
          icon={Award}
          tone="primary"
          hint={`میانگین ساده: ${formatPersianDecimal(academic.simpleAverage)} از ۲۰`}
        />
        <StatCard
          title="بالاترین نمره کسب‌شده"
          value={`${formatPersianDecimal(academic.highestScore)} از ۲۰`}
          icon={Sparkles}
          tone="success"
          hint={
            academic.subjectSummaries[0]
              ? `قوی‌ترین درس: ${academic.subjectSummaries[0].subjectName}`
              : undefined
          }
        />
        <StatCard
          title="تعداد ارزشیابی‌های ثبت‌شده"
          value={`${toPersianDigits(academic.totalGrades)} نمره`}
          icon={ClipboardList}
          tone="info"
          hint={`در ${toPersianDigits(academic.subjectSummaries.length)} درس نمره‌دار`}
        />
        <StatCard
          title="معدل هدف انتخابی شما"
          value={`${formatPersianDecimal(session.targetGpa)} از ۲۰`}
          icon={TrendingUp}
          tone={academic.weightedAverage >= session.targetGpa ? 'success' : 'warning'}
          hint={
            academic.weightedAverage >= session.targetGpa
              ? 'به هدف تحصیلی خود رسیده‌اید!'
              : `${formatPersianDecimal(session.targetGpa - academic.weightedAverage)} نمره تا هدف`
          }
        />
      </div>

      {/* Interactive Target GPA Simulator */}
      <div className="flex flex-col justify-between gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center">
        <div>
          <p className="text-[13px] font-bold text-text">
            هدف‌گذاری معدل نیم‌سال (شبیه‌ساز انگیزشی در نشست فعلی)
          </p>
          <p className="mt-0.5 text-[12px] text-text-muted">
            خط هدف سبز در نمودار روند پیشرفت بر اساس مقدار انتخابی شما تنظیم می‌شود.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[17.5, 18.5, 19.25, 19.75].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => session.setTargetGpa(preset)}
              className={`rounded-btn border px-3 py-1.5 text-[12px] font-bold transition-colors ${
                session.targetGpa === preset
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-background text-text-muted hover:border-primary hover:text-primary'
              }`}
            >
              {formatPersianDecimal(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Grade Cards */}
      <SectionCard
        title="میانگین نمرات به تفکیک درس"
        subtitle="برای فیلتر کردن جدول آزمون‌ها روی کارت هر درس کلیک کنید"
        icon={BarChart3}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllClassSubjects((prev) => !prev)}
          >
            {showAllClassSubjects
              ? 'فقط دروس دارای نمره'
              : `نمایش همه دروس کلاس (${toPersianDigits(academic.allClassSubjects.length)})`}
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSubjectCards.map((sub) => (
            <GradeCard
              key={sub.subjectId}
              subject={sub}
              selected={subjectFilter === sub.subjectId}
              onSelect={(id) => setSubjectFilter((prev) => (prev === id ? 'all' : id))}
            />
          ))}
        </div>
      </SectionCard>

      {/* Academic Performance Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SectionCard
          title="نمودار مقایسه میانگین دروس با کلاس"
          subtitle="مقایسه میانگین نمرات شما در هر درس با میانگین کل کلاس"
          icon={BarChart3}
          className="lg:col-span-6"
        >
          <SubjectPerformanceBarChart subjects={academic.subjectSummaries} height={280} />
        </SectionCard>

        <SectionCard
          title="روند تغییرات نمرات در طول نیم‌سال"
          subtitle="نمرات آزمون‌ها به ترتیب زمانی به همراه میانگین تجمعی و خط هدف"
          icon={TrendingUp}
          className="lg:col-span-6"
        >
          <GradeTrendLineChart
            series={academic.progressSeries}
            targetGpa={session.targetGpa}
            height={280}
          />
        </SectionCard>
      </div>

      {/* Recent Grade Changes */}
      <SectionCard
        title="تغییرات اخیر نمرات"
        subtitle="مقایسه هر نمره ثبت‌شده با نمره قبلی همان درس یا معدل کل شما"
        icon={Sparkles}
      >
        {academic.recentChanges.length === 0 ? (
          <p className="text-center text-[13px] text-text-muted">تغییری ثبت نشده است.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {academic.recentChanges.slice(0, 6).map(({ grade, previousScore, delta }) => {
              const numericDelta = delta ?? 0;
              return (
                <div
                  key={grade.grade.id}
                  className="flex items-center justify-between gap-3 rounded-btn border border-border bg-background p-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-text">
                      {grade.subjectName} — {grade.grade.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {previousScore !== undefined
                        ? `نمره قبلی درس: ${formatPersianDecimal(previousScore)}`
                        : 'اولین نمره ثبت‌شده درس'}{' '}
                      • {formatJalali(grade.grade.date)}
                    </p>
                  </div>

                  <div className="shrink-0 text-end">
                    <p className="text-[14px] font-extrabold text-text">
                      {formatPersianDecimal(grade.score20)}
                    </p>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                        numericDelta > 0
                          ? 'text-success'
                          : numericDelta < 0
                            ? 'text-danger'
                            : 'text-text-muted'
                      }`}
                    >
                      {numericDelta > 0 ? (
                        <ArrowUpRight size={13} aria-hidden="true" />
                      ) : numericDelta < 0 ? (
                        <ArrowDownRight size={13} aria-hidden="true" />
                      ) : (
                        <Minus size={13} aria-hidden="true" />
                      )}
                      {numericDelta > 0 ? '+' : ''}
                      {formatPersianDecimal(numericDelta)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Filterable Exam Results Table */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 rounded-card border border-border bg-surface p-4 shadow-card md:grid-cols-12">
          <div className="md:col-span-5">
            <Input
              aria-label="جستجو در عنوان آزمون یا نام درس"
              leftIcon={Search}
              placeholder="جستجو در نام درس، عنوان آزمون یا نام دبیر…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              aria-label="فیلتر درس"
              options={subjectOptions}
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              aria-label="فیلتر نوع آزمون"
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center md:col-span-1">
            <Button
              variant="outline"
              size="md"
              fullWidth
              disabled={!hasFilters}
              onClick={() => {
                setSubjectFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              title="حذف فیلترها"
              aria-label="حذف فیلترهای نمرات"
            >
              <FilterX size={17} aria-hidden="true" />
            </Button>
          </div>
        </div>

        <Table<EnrichedGrade>
          data={filteredGrades}
          rowKey={(row) => row.grade.id}
          caption="جدول کامل نتایج آزمون‌ها و ارزشیابی‌های دانش‌آموز"
          columns={columns}
          pageSize={8}
          emptyTitle="نمره‌ای مطابق فیلتر انتخابی یافت نشد"
          emptyDescription="فیلتر درس یا نوع آزمون را تغییر دهید تا سایر رکوردها نمایش داده شوند."
        />
      </div>
    </div>
  );
}
