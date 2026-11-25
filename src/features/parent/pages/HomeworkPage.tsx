import { useMemo, useState } from 'react';
import {
  AlarmClock,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  FileText,
  Filter,
  NotebookPen,
  Undo2,
} from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  PageHeader,
  Select,
  StatCard,
} from '../../../components';
import { useToast } from '../../../hooks';
import { cn, formatJalali, formatJalaliWithWeekday, toPersianDigits } from '../../../utils';
import { useParentChild } from '../hooks/useParentChild';
import { useParentSession } from '../hooks/parent-session';
import {
  HOMEWORK_STATE_META,
  scoreText,
  type HomeworkItem,
  type HomeworkState,
} from '../lib/parentAnalytics';
import { HomeworkBadge } from '../components/DomainBadge';
import { SectionCard } from '../components/SectionCard';

const STATE_OPTIONS = [
  { value: 'all', label: 'همهٔ تکالیف' },
  { value: 'pending', label: 'در انتظار انجام' },
  { value: 'due-soon', label: 'نزدیک مهلت' },
  { value: 'overdue', label: 'مهلت گذشته' },
  { value: 'completed', label: 'انجام‌شده' },
];

const STATE_ACCENT: Record<HomeworkState, string> = {
  overdue: 'border-e-4 border-e-danger',
  'due-soon': 'border-e-4 border-e-warning',
  pending: 'border-e-4 border-e-info',
  completed: 'border-e-4 border-e-success',
};

export default function HomeworkPage() {
  const { showToast } = useToast();
  const { child, homework } = useParentChild();
  const { toggleHomeworkDone, completedHomeworkIds } = useParentSession();
  const [stateFilter, setStateFilter] = useState('all');
  const [detail, setDetail] = useState<HomeworkItem | null>(null);

  const filtered = useMemo(() => {
    if (stateFilter === 'all') return homework;
    return homework.filter((item) => item.state === stateFilter);
  }, [homework, stateFilter]);

  const counts = useMemo(
    () => ({
      all: homework.length,
      pending: homework.filter((item) => item.state === 'pending').length,
      dueSoon: homework.filter((item) => item.state === 'due-soon').length,
      overdue: homework.filter((item) => item.state === 'overdue').length,
      completed: homework.filter((item) => item.state === 'completed').length,
    }),
    [homework],
  );

  const handleToggle = (item: HomeworkItem) => {
    const wasDone = item.state === 'completed';
    toggleHomeworkDone(item.homework.id);
    showToast(
      wasDone ? 'info' : 'success',
      wasDone
        ? `وضعیت «${item.homework.title}» به انجام‌نشده بازگردانده شد.`
        : `«${item.homework.title}» با موفقیت به‌عنوان انجام‌شده علامت‌گذاری شد.`,
      wasDone ? 'بازگردانی شد' : 'ثبت شد',
    );
  };

  if (!child) {
    return (
      <>
        <PageHeader title="تکالیف" description="پیگیری تکالیف فرزند" />
        <EmptyState icon={NotebookPen} title="فرزندی به این حساب متصل نیست" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="تکالیف"
        description={`تکالیف کلاس ${child.name} — مهلت‌ها، وضعیت انجام و توضیحات`}
        breadcrumbs={[
          { label: 'مدرسه‌یار' },
          { label: 'پیشخوان اولیا', to: '/parent' },
          { label: 'تکالیف' },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل تکالیف کلاس"
          value={toPersianDigits(counts.all)}
          icon={ClipboardList}
          tone="primary"
          hint="تکالیف فعال این کلاس"
        />
        <StatCard
          title="نزدیک مهلت"
          value={toPersianDigits(counts.dueSoon)}
          icon={Clock3}
          tone={counts.dueSoon > 0 ? 'warning' : 'success'}
          hint="تا ۳ روز آینده"
        />
        <StatCard
          title="مهلت گذشته"
          value={toPersianDigits(counts.overdue)}
          icon={AlarmClock}
          tone={counts.overdue > 0 ? 'danger' : 'success'}
          hint={counts.overdue > 0 ? 'نیازمند پیگیری فوری' : 'بدون تکلیف معوق'}
        />
        <StatCard
          title="انجام‌شده (در این نشست)"
          value={toPersianDigits(counts.completed)}
          icon={CheckCircle2}
          tone="success"
          hint="علامت‌گذاری‌شده توسط شما"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Filter rail */}
        <div className="flex flex-col gap-4">
          <SectionCard title="فیلتر" icon={Filter}>
            <Select
              label="وضعیت تکلیف"
              options={STATE_OPTIONS}
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
            />
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              {(Object.keys(HOMEWORK_STATE_META) as HomeworkState[]).map((state) => {
                const meta = HOMEWORK_STATE_META[state];
                const count =
                  state === 'pending'
                    ? counts.pending
                    : state === 'due-soon'
                      ? counts.dueSoon
                      : state === 'overdue'
                        ? counts.overdue
                        : counts.completed;
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setStateFilter(state)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-btn px-2 py-1.5 text-start text-[11.5px] transition-colors',
                      stateFilter === state ? 'bg-blue-50' : 'hover:bg-slate-50',
                    )}
                  >
                    <span className="flex items-center gap-1.5 font-semibold text-text">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          state === 'overdue'
                            ? 'bg-danger'
                            : state === 'due-soon'
                              ? 'bg-warning'
                              : state === 'pending'
                                ? 'bg-info'
                                : 'bg-success',
                        )}
                        aria-hidden="true"
                      />
                      {meta.label}
                    </span>
                    <span className="text-text-muted">{toPersianDigits(count)}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setStateFilter('all')}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-btn px-2 py-1.5 text-start text-[11.5px] transition-colors',
                  stateFilter === 'all' ? 'bg-blue-50' : 'hover:bg-slate-50',
                )}
              >
                <span className="font-semibold text-text">همهٔ تکالیف</span>
                <span className="text-text-muted">{toPersianDigits(counts.all)}</span>
              </button>
            </div>
          </SectionCard>

          <SectionCard title="راهنما" icon={NotebookPen}>
            <ul className="space-y-2 text-[11px] leading-6 text-text-muted">
              <li className="flex gap-1.5">
                <CheckCircle2 size={13} className="mt-1 shrink-0 text-success" aria-hidden="true" />
                با زدن دکمهٔ «انجام شد» وضعیت تکلیف در همین نشست به‌روزرسانی می‌شود.
              </li>
              <li className="flex gap-1.5">
                <Undo2 size={13} className="mt-1 shrink-0 text-info" aria-hidden="true" />
                هر زمان می‌توانید علامت انجام را برداشته و تکلیف را به حالت قبل برگردانید.
              </li>
              <li className="flex gap-1.5">
                <FileText size={13} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
                برای دیدن توضیحات کامل، روی کارت تکلیف کلیک کنید.
              </li>
            </ul>
            <p className="mt-3 rounded-btn bg-blue-50 px-2.5 py-2 text-[10.5px] leading-5 text-blue-900">
              وضعیت انجام تکالیف فقط در مرورگر شما نگه داشته می‌شود و با بارگذاری مجدد صفحه پاک می‌شود.
            </p>
          </SectionCard>
        </div>

        {/* Homework cards */}
        <div className="xl:col-span-3">
          <SectionCard
            title="فهرست تکالیف"
            description={`${toPersianDigits(filtered.length)} تکلیف نمایش داده می‌شود`}
            icon={ClipboardList}
          >
            {filtered.length === 0 ? (
              <EmptyState
                icon={NotebookPen}
                title="تکلیفی با این وضعیت وجود ندارد"
                description="برای دیدن همهٔ تکالیف، فیلتر را تغییر دهید."
                actionLabel="نمایش همهٔ تکالیف"
                onAction={() => setStateFilter('all')}
              />
            ) : (
              <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {filtered.map((item) => {
                  const isDone = completedHomeworkIds.includes(item.homework.id);
                  const daysLabel =
                    item.daysLeft > 0
                      ? `${toPersianDigits(item.daysLeft)} روز تا مهلت`
                      : item.daysLeft === 0
                        ? 'مهلت امروز'
                        : `${toPersianDigits(Math.abs(item.daysLeft))} روز از مهلت گذشته`;
                  return (
                    <li
                      key={item.homework.id}
                      className={cn(
                        'flex flex-col rounded-card border border-border bg-surface p-3.5 transition-shadow hover:shadow-cardHover',
                        STATE_ACCENT[item.state],
                        isDone && 'bg-green-50/30',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setDetail(item)}
                          className="min-w-0 flex-1 text-start"
                        >
                          <p className="truncate text-[13px] font-bold text-text hover:text-primary">
                            {item.homework.title}
                          </p>
                          <p className="mt-0.5 truncate text-[10.5px] text-text-muted">
                            {item.subjectName} · {item.teacherName}
                          </p>
                        </button>
                        <HomeworkBadge state={item.state} />
                      </div>

                      <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-text-muted">
                        {item.homework.description}
                      </p>

                      <dl className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-border pt-2 text-[10.5px]">
                        <div>
                          <dt className="text-text-muted">تاریخ اعلام</dt>
                          <dd className="font-semibold text-text">
                            {formatJalali(item.homework.assignedAt)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-text-muted">مهلت تحویل</dt>
                          <dd
                            className={cn(
                              'font-semibold',
                              item.state === 'overdue' ? 'text-danger' : 'text-text',
                            )}
                          >
                            {formatJalali(item.homework.dueDate)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-text-muted">بارم</dt>
                          <dd className="font-semibold text-text">
                            {toPersianDigits(item.homework.maxScore)} نمره
                          </dd>
                        </div>
                        <div>
                          <dt className="text-text-muted">زمان باقی‌مانده</dt>
                          <dd
                            className={cn(
                              'font-semibold',
                              item.daysLeft < 0
                                ? 'text-danger'
                                : item.daysLeft <= 3
                                  ? 'text-warning'
                                  : 'text-text',
                            )}
                          >
                            {daysLabel}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant={isDone ? 'secondary' : 'primary'}
                          leftIcon={isDone ? Undo2 : CheckCircle2}
                          onClick={() => handleToggle(item)}
                        >
                          {isDone ? 'بازگردانی' : 'انجام شد'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setDetail(item)}
                          className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
                        >
                          مشاهدهٔ توضیحات
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.homework.title}
        description={
          detail ? `${detail.subjectName} — دبیر: ${detail.teacherName}` : undefined
        }
        size="md"
        footer={
          detail ? (
            <>
              <Button variant="ghost" onClick={() => setDetail(null)}>
                بستن
              </Button>
              <Button
                variant={
                  completedHomeworkIds.includes(detail.homework.id) ? 'secondary' : 'primary'
                }
                leftIcon={
                  completedHomeworkIds.includes(detail.homework.id) ? Undo2 : CheckCircle2
                }
                onClick={() => {
                  handleToggle(detail);
                  setDetail(null);
                }}
              >
                {completedHomeworkIds.includes(detail.homework.id) ? 'بازگردانی وضعیت' : 'انجام شد'}
              </Button>
            </>
          ) : undefined
        }
      >
        {detail && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <HomeworkBadge state={detail.state} />
              <Badge variant="neutral" dot={false}>
                بارم {toPersianDigits(detail.homework.maxScore)} نمره
              </Badge>
              {detail.submittedScore !== undefined && (
                <Badge variant="success" dot={false}>
                  نمرهٔ ثبت‌شده: {scoreText(detail.submittedScore)}
                </Badge>
              )}
            </div>
            <p className="rounded-btn bg-slate-50 px-3 py-2.5 text-[12px] leading-7 text-text">
              {detail.homework.description}
            </p>
            <dl className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">تاریخ اعلام</dt>
                <dd className="font-semibold text-text">
                  {formatJalaliWithWeekday(detail.homework.assignedAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">مهلت تحویل</dt>
                <dd className="font-semibold text-text">
                  {formatJalaliWithWeekday(detail.homework.dueDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">درس</dt>
                <dd className="font-semibold text-text">{detail.subjectName}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">دبیر</dt>
                <dd className="font-semibold text-text">{detail.teacherName}</dd>
              </div>
            </dl>
            <p className="flex items-start gap-1.5 rounded-btn bg-amber-50 px-3 py-2 text-[10.5px] leading-5 text-amber-800">
              <Circle size={11} className="mt-1 shrink-0" aria-hidden="true" />
              تکالیف فقط توسط معلم در سامانه ارزیابی می‌شوند؛ علامت «انجام شد» در این پنل برای پیگیری
              شخصی شماست.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
