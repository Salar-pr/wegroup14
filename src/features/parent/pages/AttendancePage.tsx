import { useMemo, useState } from 'react';
import {
  CalendarCheck2,
  CalendarDays,
  Clock,
  Percent,
  ShieldAlert,
  UserX,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  Modal,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { useData, useToast } from '../../../hooks';
import { cn, formatJalali, formatJalaliShort, toPersianDigits } from '../../../utils';
import type { Attendance, AttendanceStatus } from '../../../types';
import { useParentChild } from '../hooks/useParentChild';
import { ATTENDANCE_META, AttendanceBadge } from '../components/DomainBadge';
import { SectionCard } from '../components/SectionCard';
import { buildDayMatrix, percentText, round } from '../lib/parentAnalytics';

const STATUS_OPTIONS = [
  { value: 'all', label: 'همهٔ وضعیت‌ها' },
  { value: 'present', label: 'حاضر' },
  { value: 'late', label: 'تأخیر' },
  { value: 'absent', label: 'غایب' },
  { value: 'excused', label: 'غیبت موجه' },
];

const STATUS_TILE: Record<
  AttendanceStatus,
  { label: string; icon: typeof CalendarCheck2; text: string; bg: string; ring: string }
> = {
  present: {
    label: 'حاضر',
    icon: CalendarCheck2,
    text: 'text-success',
    bg: 'bg-green-50',
    ring: 'ring-green-200',
  },
  late: { label: 'تأخیر', icon: Clock, text: 'text-warning', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  absent: { label: 'غیبت', icon: UserX, text: 'text-danger', bg: 'bg-red-50', ring: 'ring-red-200' },
  excused: {
    label: 'غیبت موجه',
    icon: ShieldAlert,
    text: 'text-info',
    bg: 'bg-sky-50',
    ring: 'ring-sky-200',
  },
};

export default function AttendancePage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();
  const { child, attendance } = useParentChild();
  const [statusFilter, setStatusFilter] = useState('all');
  const [noteOpen, setNoteOpen] = useState<Attendance | null>(null);

  const rows = useMemo(() => {
    if (!attendance) return [];
    if (statusFilter === 'all') return attendance.records;
    return attendance.records.filter((record) => record.status === statusFilter);
  }, [attendance, statusFilter]);

  const dayMatrix = useMemo(
    () => (attendance ? buildDayMatrix(attendance.records) : []),
    [attendance],
  );

  /**
   * Parent-side simulated excuse request: flips an `absent` record to
   * `excused` in the SHARED db, so admin/teacher views update too.
   */
  const requestExcuse = (record: Attendance) => {
    updateEntity('attendance', (items) =>
      items.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: 'excused',
              note: item.note
                ? `${item.note} — درخواست توجیه توسط ولی ثبت شد`
                : 'درخواست توجیه توسط ولی ثبت شد',
            }
          : item,
      ),
    );
    setNoteOpen(null);
    showToast(
      'success',
      'درخواست توجیه غیبت ثبت شد. وضعیت این روز به «غیبت موجه» تغییر کرد.',
      'ثبت درخواست',
    );
  };

  const columns: TableColumn<Attendance>[] = [
    {
      key: 'date',
      header: 'تاریخ',
      sortValue: (record) => record.date,
      render: (record) => (
        <span className="text-[12px] font-semibold text-text">
          {formatJalali(record.date)}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'درس',
      render: (record) => (
        <span className="text-[11.5px] text-text-muted">
          {db.subjects.find((subject) => subject.id === record.subjectId)?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      sortValue: (record) => record.status,
      render: (record) => <AttendanceBadge status={record.status} />,
    },
    {
      key: 'note',
      header: 'توضیحات',
      render: (record) =>
        record.note ? (
          <span className="line-clamp-2 whitespace-normal text-[11px] text-text-muted">
            {record.note}
          </span>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        ),
    },
    {
      key: 'action',
      header: 'اقدام',
      align: 'center',
      render: (record) =>
        record.status === 'absent' ? (
          <Button variant="outline" size="sm" onClick={() => setNoteOpen(record)}>
            درخواست توجیه
          </Button>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        ),
    },
  ];

  if (!child || !attendance) {
    return (
      <>
        <PageHeader title="حضور و غیاب" description="وضعیت حضور فرزند" />
        <EmptyState icon={CalendarCheck2} title="فرزندی به این حساب متصل نیست" />
      </>
    );
  }

  const rateTone =
    attendance.rate >= 90 ? 'success' : attendance.rate >= 75 ? 'warning' : 'danger';

  return (
    <>
      <PageHeader
        title="حضور و غیاب"
        description={`${child.name} — ${toPersianDigits(attendance.total)} روز ثبت‌شده`}
        breadcrumbs={[
          { label: 'مدرسه‌یار' },
          { label: 'پیشخوان اولیا', to: '/parent' },
          { label: 'حضور و غیاب' },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="درصد حضور"
          value={percentText(attendance.rate, 0)}
          icon={Percent}
          tone={rateTone}
          hint={`${toPersianDigits(attendance.attendedCount)} روز حاضر یا موجه`}
        />
        <StatCard
          title="روزهای غیبت"
          value={toPersianDigits(attendance.absentCount)}
          icon={UserX}
          tone={attendance.absentCount > 0 ? 'danger' : 'success'}
          hint={attendance.absentCount > 0 ? 'نیازمند پیگیری' : 'بدون غیبت'}
        />
        <StatCard
          title="تأخیرها"
          value={toPersianDigits(attendance.lateCount)}
          icon={Clock}
          tone={attendance.lateCount > 0 ? 'warning' : 'success'}
          hint={attendance.lateCount > 0 ? 'ورود با تأخیر به کلاس' : 'بدون تأخیر'}
        />
        <StatCard
          title="غیبت موجه"
          value={toPersianDigits(attendance.excusedCount)}
          icon={ShieldAlert}
          tone="info"
          hint="تأییدشده با مدارک"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Breakdown + calendar */}
        <div className="flex flex-col gap-4">
          <SectionCard title="ترکیب وضعیت‌ها" description="سهم هر وضعیت از کل روزها" icon={CalendarDays}>
            <ul className="flex flex-col gap-2.5">
              {(Object.keys(STATUS_TILE) as AttendanceStatus[]).map((status) => {
                const meta = STATUS_TILE[status];
                const Icon = meta.icon;
                const count =
                  status === 'present'
                    ? attendance.presentCount
                    : status === 'late'
                      ? attendance.lateCount
                      : status === 'absent'
                        ? attendance.absentCount
                        : attendance.excusedCount;
                const share =
                  attendance.total > 0 ? round((count / attendance.total) * 100, 0) : 0;
                return (
                  <li key={status}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="flex items-center gap-1.5 font-semibold text-text">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-inset',
                            meta.bg,
                            meta.ring,
                          )}
                        >
                          <Icon size={12} className={meta.text} aria-hidden="true" />
                        </span>
                        {meta.label}
                      </span>
                      <span className="text-text-muted">
                        {toPersianDigits(count)} روز · {toPersianDigits(share)}٪
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          status === 'present'
                            ? 'bg-success'
                            : status === 'late'
                              ? 'bg-warning'
                              : status === 'absent'
                                ? 'bg-danger'
                                : 'bg-info',
                        )}
                        style={{ width: `${Math.max(share, count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard
            title="تقویم حضور"
            description="وضعیت روزهای ثبت‌شده به ترتیب تاریخ"
            icon={CalendarDays}
          >
            {dayMatrix.length === 0 ? (
              <p className="text-[11px] text-text-muted">سابقه‌ای ثبت نشده است.</p>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1.5">
                  {dayMatrix.map((day) => (
                    <div
                      key={day.date}
                      title={`${formatJalali(day.date)} — ${ATTENDANCE_META[day.status as AttendanceStatus]?.label ?? ''}`}
                      className={cn(
                        'flex h-10 flex-col items-center justify-center rounded-btn text-[9px] font-bold',
                        day.status === 'present' && 'bg-green-50 text-green-800 ring-1 ring-green-200',
                        day.status === 'late' && 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
                        day.status === 'absent' && 'bg-red-50 text-red-700 ring-1 ring-red-200',
                        day.status === 'excused' && 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
                      )}
                    >
                      <span>{formatJalaliShort(day.date).slice(0, 2)}</span>
                      <span className="text-[8px] opacity-70">
                        {formatJalaliShort(day.date).slice(3, 5)}
                      </span>
                    </div>
                  ))}
                </div>
                <ul className="mt-3 flex flex-wrap gap-2 border-t border-border pt-2.5 text-[10px]">
                  {(Object.keys(STATUS_TILE) as AttendanceStatus[]).map((status) => (
                    <li key={status} className="flex items-center gap-1.5 text-text-muted">
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-sm',
                          status === 'present'
                            ? 'bg-green-500'
                            : status === 'late'
                              ? 'bg-amber-500'
                              : status === 'absent'
                                ? 'bg-red-500'
                                : 'bg-sky-500',
                        )}
                        aria-hidden="true"
                      />
                      {STATUS_TILE[status].label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </SectionCard>
        </div>

        {/* History table + notes */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <SectionCard
            title="تاریخچهٔ حضور"
            description="فهرست کامل روزهای ثبت‌شده"
            icon={CalendarCheck2}
          >
            <div className="mb-3 max-w-xs">
              <Select
                label="فیلتر وضعیت"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              />
            </div>
            {rows.length === 0 ? (
              <EmptyState
                icon={CalendarCheck2}
                title="رکوردی با این وضعیت وجود ندارد"
                actionLabel="نمایش همه"
                onAction={() => setStatusFilter('all')}
              />
            ) : (
              <Table<Attendance>
                data={rows}
                rowKey={(record) => record.id}
                columns={columns}
                caption="تاریخچه حضور و غیاب"
                pageSize={8}
              />
            )}
          </SectionCard>

          <SectionCard
            title="توضیحات و دلایل ثبت‌شده"
            description="یادداشت‌های معلم یا دفتر مدرسه"
            icon={ShieldAlert}
            flush
          >
            {attendance.notes.length === 0 ? (
              <p className="px-4 py-4 text-[11.5px] text-text-muted">
                یادداشتی برای حضور و غیاب ثبت نشده است.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {attendance.notes.map(({ record, subjectName }) => (
                  <li key={record.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <AttendanceBadge status={record.status} />
                      <span className="text-[11.5px] font-semibold text-text">{subjectName}</span>
                      <span className="text-[10.5px] text-text-muted">
                        {formatJalali(record.date)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-6 text-text-muted">{record.note}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Excuse modal */}
      <Modal
        open={noteOpen !== null}
        onClose={() => setNoteOpen(null)}
        title="ثبت درخواست توجیه غیبت"
        description="این درخواست به‌صورت نمایشی در سامانه ثبت می‌شود؛ هیچ پیامی به سرور ارسال نمی‌شود."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNoteOpen(null)}>
              انصراف
            </Button>
            <Button
              variant="primary"
              onClick={() => noteOpen && requestExcuse(noteOpen)}
              leftIcon={ShieldAlert}
            >
              ثبت درخواست
            </Button>
          </>
        }
      >
        {noteOpen && (
          <div className="space-y-2 text-[12px] leading-6 text-text-muted">
            <p>
              تاریخ:{' '}
              <span className="font-bold text-text">{formatJalali(noteOpen.date)}</span>
            </p>
            <p>
              درس:{' '}
              <span className="font-bold text-text">
                {db.subjects.find((subject) => subject.id === noteOpen.subjectId)?.name ?? '—'}
              </span>
            </p>
            <p>
              وضعیت فعلی: <AttendanceBadge status={noteOpen.status} />
            </p>
            <p className="rounded-btn bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              با تأیید، وضعیت این روز از «غایب» به «غیبت موجه» تغییر می‌کند و در پنل مدیر و معلم نیز
              منعکس می‌شود. این تغییر با بارگذاری مجدد صفحه به حالت اولیه بازمی‌گردد.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
