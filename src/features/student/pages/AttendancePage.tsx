import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck,
  PieChart as PieChartIcon,
  RotateCcw,
} from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { ROUTES } from '../../../constants/routes';
import { cn, formatJalali, formatJalaliWithWeekday, toPersianDigits } from '../../../utils';
import type { AttendanceStatus } from '../../../types';
import { AttendanceBreakdownChart } from '../components/AcademicCharts';
import { SectionCard } from '../components/SectionCard';
import { useStudentPortal } from '../hooks/useStudentPortal';
import {
  ATTENDANCE_STATUS_META,
  formatPersianPercent,
  type EnrichedAttendance,
} from '../lib/studentAnalytics';

export default function AttendancePage() {
  const { student, dossier, attendance } = useStudentPortal();
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const subjectOptions = useMemo(() => {
    if (!attendance) return [{ value: 'all', label: 'همه دروس' }];
    const map = new Map<string, string>();
    for (const item of attendance.records) {
      map.set(item.record.subjectId, item.subjectName);
    }
    return [
      { value: 'all', label: 'همه دروس' },
      ...[...map.entries()].map(([value, label]) => ({ value, label })),
    ];
  }, [attendance]);

  const filteredRecords = useMemo(() => {
    if (!attendance) return [];
    return attendance.records.filter((item) => {
      if (statusFilter !== 'all' && item.record.status !== statusFilter) return false;
      if (subjectFilter !== 'all' && item.record.subjectId !== subjectFilter) return false;
      return true;
    });
  }, [attendance, statusFilter, subjectFilter]);

  if (!student || !dossier || !attendance) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="سوابق حضور و غیاب یافت نشد"
        description="اطلاعات حضور و غیاب برای پرونده شما در دسترس نیست."
      />
    );
  }

  const columns: Array<TableColumn<EnrichedAttendance>> = [
    {
      key: 'date',
      header: 'تاریخ و روز هفته',
      sortValue: (row) => row.record.date,
      render: (row) => (
        <span className="font-bold text-text">{formatJalaliWithWeekday(row.record.date)}</span>
      ),
    },
    {
      key: 'subject',
      header: 'درس / کلاس',
      sortValue: (row) => row.subjectName,
      render: (row) => (
        <div>
          <p className="font-semibold text-text">{row.subjectName}</p>
          <p className="text-[11px] text-text-muted">دبیر: {row.teacherName}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت حضور',
      align: 'center',
      sortValue: (row) => row.record.status,
      render: (row) => {
        const meta = ATTENDANCE_STATUS_META[row.record.status];
        return <Badge variant={meta.badge}>{meta.label}</Badge>;
      },
    },
    {
      key: 'note',
      header: 'توضیحات دبیر / دفتر مدرسه',
      render: (row) => (
        <span className="text-[12px] text-text-muted">
          {row.record.note ?? ATTENDANCE_STATUS_META[row.record.status].description}
        </span>
      ),
    },
  ];

  const statusTabs: Array<{ id: 'all' | AttendanceStatus; label: string; count: number }> = [
    { id: 'all', label: 'همه جلسات', count: attendance.total },
    { id: 'present', label: 'حاضر', count: attendance.present },
    { id: 'late', label: 'تأخیر', count: attendance.late },
    { id: 'absent', label: 'غایب', count: attendance.absent },
    { id: 'excused', label: 'غیبت موجه', count: attendance.excused },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="وضعیت حضور و غیاب من"
        description="مشاهده آمار حضور، غیبت‌ها، تأخیرهای ورود و تاریخچه کامل جلسات ثبت‌شده"
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'حضور و غیاب' }]}
        actions={
          (statusFilter !== 'all' || subjectFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={() => {
                setStatusFilter('all');
                setSubjectFilter('all');
              }}
            >
              نمایش همه رکوردها
            </Button>
          )
        }
      />

      {/* 4 KPI StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="درصد حضور کل"
          value={formatPersianPercent(attendance.attendanceRate)}
          icon={ClipboardCheck}
          tone={attendance.attendanceRate >= 90 ? 'success' : 'warning'}
          hint={`نظم ورود به‌موقع: ${formatPersianPercent(attendance.punctualityRate)}`}
        />
        <StatCard
          title="روزهای حضور کامل"
          value={`${toPersianDigits(attendance.present)} روز`}
          icon={CheckCircle2}
          tone="primary"
          hint={`از مجموع ${toPersianDigits(attendance.total)} جلسه ثبت‌شده`}
        />
        <StatCard
          title="غیبت‌های ثبت‌شده"
          value={`${toPersianDigits(attendance.absent)} روز`}
          icon={AlertCircle}
          tone={attendance.absent > 0 ? 'danger' : 'success'}
          hint={
            attendance.excused > 0
              ? `به همراه ${toPersianDigits(attendance.excused)} غیبت موجه`
              : 'بدون غیبت غیرموجه'
          }
        />
        <StatCard
          title="تأخیر در ورود"
          value={`${toPersianDigits(attendance.late)} مورد`}
          icon={Clock}
          tone={attendance.late > 0 ? 'warning' : 'info'}
          hint="ثبت‌شده توسط دبیر در ابتدای زنگ"
        />
      </div>

      {/* Visual Breakdown + Recent Session Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SectionCard
          title="نمودار ترکیب حضور و غیاب"
          subtitle="سهم هر وضعیت از کل جلسات ثبت‌شده در نیم‌سال جاری"
          icon={PieChartIcon}
          className="lg:col-span-5"
        >
          <AttendanceBreakdownChart summary={attendance} height={235} />
        </SectionCard>

        <SectionCard
          title="نوار زمانی جلسات اخیر"
          subtitle="وضعیت حضور شما به ترتیب آخرین روزهای ثبت‌شده در مدرسه"
          icon={FileCheck}
          className="lg:col-span-7"
        >
          {attendance.records.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-text-muted">
              هنوز جلسه‌ای در سامانه ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Visual progress meter */}
              <div className="rounded-btn border border-border bg-background p-4">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-bold text-text">شاخص انضباط و حضور در کلاس</span>
                  <span className="font-extrabold text-primary">
                    {formatPersianPercent(attendance.attendanceRate)}
                  </span>
                </div>
                <div className="mt-2.5 flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  {attendance.total > 0 && (
                    <>
                      <div
                        style={{
                          width: `${(attendance.present / attendance.total) * 100}%`,
                        }}
                        className="bg-success"
                        title="حاضر"
                      />
                      <div
                        style={{
                          width: `${(attendance.late / attendance.total) * 100}%`,
                        }}
                        className="bg-warning"
                        title="تأخیر"
                      />
                      <div
                        style={{
                          width: `${(attendance.excused / attendance.total) * 100}%`,
                        }}
                        className="bg-info"
                        title="غیبت موجه"
                      />
                      <div
                        style={{
                          width: `${(attendance.absent / attendance.total) * 100}%`,
                        }}
                        className="bg-danger"
                        title="غایب"
                      />
                    </>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-text-muted">
                  در صورت تغییر وضعیت حضور توسط مدیر یا اولیا در نشست جاری، این شاخص بلافاصله به‌روز
                  می‌شود.
                </p>
              </div>

              {/* Recent session chips */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {attendance.records.slice(0, 6).map((item) => {
                  const meta = ATTENDANCE_STATUS_META[item.record.status];
                  return (
                    <div
                      key={item.record.id}
                      className="flex items-center justify-between gap-2 rounded-btn border border-border bg-surface p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-text">
                          {formatJalali(item.record.date)}
                        </p>
                        <p className="truncate text-[11px] text-text-muted">
                          {item.subjectName}
                          {item.record.note ? ` • ${item.record.note}` : ''}
                        </p>
                      </div>
                      <Badge variant={meta.badge}>{meta.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Filter Bar + Attendance History Table */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 rounded-card border border-border bg-surface p-4 shadow-card lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-1.5">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-bold transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-background text-text-muted hover:bg-slate-100 hover:text-text',
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px]',
                      active ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-text-muted',
                    )}
                  >
                    {toPersianDigits(tab.count)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full lg:w-60">
            <Select
              aria-label="فیلتر درس حضور و غیاب"
              options={subjectOptions}
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            />
          </div>
        </div>

        <Table<EnrichedAttendance>
          data={filteredRecords}
          rowKey={(row) => row.record.id}
          caption="تاریخچه حضور و غیاب دانش‌آموز"
          columns={columns}
          pageSize={8}
          emptyTitle="رکورد حضوری مطابق فیلتر یافت نشد"
          emptyDescription="وضعیت دیگری را از نوار بالا انتخاب کنید."
        />
      </div>
    </div>
  );
}
