import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
  CalendarCheck2,
  ChevronLeft,
  ClipboardList,
  Megaphone,
  MessageSquare,
  NotebookPen,
  TrendingUp,
  TriangleAlert,
  UserRound,
  UserX,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  StatCard,
} from '../../../components';
import { ROUTES } from '../../../constants';
import { useAuth, useData, useToast } from '../../../hooks';
import {
  cn,
  formatJalaliShort,
  formatRelativeTime,
  formatToman,
  toPersianDigits,
} from '../../../utils';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { useParentChild } from '../hooks/useParentChild';
import { useParentSession } from '../hooks/parent-session';
import {
  PARENT_RELATION_LABELS,
  buildDayMatrix,
  gradeTone,
  percentText,
  resolveParentRecord,
  scoreText,
  toTwenty,
} from '../lib/parentAnalytics';
import { AttendanceBadge, GradeTypeBadge, HomeworkBadge, PriorityBadge } from '../components/DomainBadge';
import { SectionCard } from '../components/SectionCard';

const PRIORITY_RING: Record<string, string> = {
  urgent: 'border-e-4 border-e-danger',
  important: 'border-e-4 border-e-warning',
  normal: 'border-e-4 border-e-slate-200',
};

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { db, updateEntity } = useData();
  const { showToast } = useToast();
  const { selectedChildId } = useParentSession();
  const [profileOpen, setProfileOpen] = useState(false);

  const {
    children,
    child,
    academic,
    attendance,
    homework,
    finance,
    classInfo,
    announcements,
  } = useParentChild();

  const parentRecord = useMemo(
    () => (currentUser ? resolveParentRecord(db, currentUser) : undefined),
    [db, currentUser],
  );

  const pendingHomework = homework.filter((item) => item.state !== 'completed');
  const unreadMessages = db.messages.filter(
    (message) => message.to.id === (currentUser?.id ?? '') && !message.read,
  );
  const lateOrAbsent = attendance
    ? [
        ...(attendance.absences ?? []).map((record) => ({ record, kind: 'absent' as const })),
        ...(attendance.lates ?? []).map((record) => ({ record, kind: 'late' as const })),
      ]
        .sort((a, b) => b.record.date.localeCompare(a.record.date))
        .slice(0, 4)
    : [];

  const dayMatrix = attendance ? buildDayMatrix(attendance.records).slice(-14) : [];

  const latestGrades = academic ? academic.gradeList.slice(0, 6) : [];

  // Parent children overview (all children, not only the focused one).
  const childOverview = useMemo(
    () =>
      children.map((item) => {
        const childAttendance = attendance && item.id === child?.id ? attendance : null;
        return {
          student: item,
          className: classInfo && item.id === child?.id ? classInfo.schoolClass?.name : undefined,
          gpa: item.gpa,
          attendanceRate: childAttendance?.rate,
        };
      }),
    [children, child, classInfo, attendance],
  );

  const handleFixAbsence = (recordId: string) => {
    updateEntity('attendance', (items) =>
      items.map((item) =>
        item.id === recordId
          ? {
              ...item,
              status: 'excused',
              note: 'اصلاح‌شده توسط ولی — غیبت موجه',
            }
          : item,
      ),
    );
    showToast(
      'success',
      'وضعیت غیبت به «موجه» اصلاح شد و در پنل مدیریت نیز به‌روزرسانی شد.',
      'ثبت شد',
    );
  };

  if (!child || !academic || !attendance || !finance) {
    return (
      <>
        <PageHeader
          title="پیشخوان اولیا"
          description="پیگیری عملکرد تحصیلی، حضور و وضعیت مالی فرزند"
        />
        <EmptyState
          icon={Users}
          title="هیچ فرزندی به این حساب متصل نیست"
          description="برای مشاهدهٔ پیشخوان، حساب فرزند شما باید توسط مدیر مدرسه به این حساب متصل شود."
        />
      </>
    );
  }

  const attendanceTone =
    attendance.rate >= 90 ? 'success' : attendance.rate >= 75 ? 'warning' : 'danger';

  return (
    <>
      <PageHeader
        title={`سلام ${currentUser?.name?.split(' ')[0] ?? ''} عزیز`}
        description={`گزارش جامع ${child.name} — ${classInfo?.schoolClass?.name ?? child.gradeLevel} · ${PARENT_RELATION_LABELS[parentRecord?.relation ?? 'guardian']}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={UserRound}
              onClick={() => setProfileOpen(true)}
            >
              پرونده فرزند
            </Button>
            <Link to={`${ROUTES.PARENT}/messages`}>
              <Button variant="primary" size="sm" leftIcon={MessageSquare}>
                پیام به مدرسه
              </Button>
            </Link>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="معدل کل فرزند"
          value={scoreText(academic.overallAverage)}
          icon={TrendingUp}
          tone={gradeTone(academic.overallAverage)}
          trend={{
            value:
              academic.trendDelta === 0
                ? 'ثابت'
                : `${academic.trendDelta > 0 ? '+' : ''}${scoreText(academic.trendDelta)}`,
            direction: academic.trendDelta > 0 ? 'up' : academic.trendDelta < 0 ? 'down' : 'flat',
            positive: academic.trendDelta > 0,
          }}
          hint={`از ${toPersianDigits(academic.totalGrades)} نمره ثبت‌شده`}
        />
        <StatCard
          title="درصد حضور"
          value={percentText(attendance.rate, 0)}
          icon={CalendarCheck2}
          tone={attendanceTone}
          trend={{
            value: `${toPersianDigits(attendance.attendedCount)} روز`,
            direction: 'flat',
            positive: attendance.rate >= 90,
          }}
          hint="حاضر یا موجه"
        />
        <StatCard
          title="تکالیف باقی‌مانده"
          value={toPersianDigits(pendingHomework.length)}
          icon={NotebookPen}
          tone={pendingHomework.some((item) => item.state === 'overdue') ? 'danger' : 'warning'}
          hint={
            pendingHomework.length === 0
              ? 'همهٔ تکالیف انجام شده است'
              : pendingHomework.some((item) => item.state === 'overdue')
                ? 'شامل تکلیف با مهلت گذشته'
                : 'بدون تکلیف معوق'
          }
        />
        <StatCard
          title="بدهی باقی‌مانده"
          value={finance.outstandingAmount === 0 ? 'تسویه‌شده' : formatToman(finance.outstandingAmount)}
          icon={Wallet}
          tone={finance.outstandingAmount === 0 ? 'success' : 'danger'}
          hint={
            finance.nextDue
              ? `نزدیک‌ترین سررسید: ${formatJalaliShort(finance.nextDue.dueDate)}`
              : 'شهریه‌ای در انتظار پرداخت نیست'
          }
        />
      </div>

      {/* Main grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left (wide) column */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Child card overview */}
          <SectionCard
            title="فرزندان من"
            description="وضعیت خلاصه هر فرزند در یک نگاه"
            icon={Users}
            action={
              <Link
                to={`${ROUTES.PARENT}/child`}
                className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
              >
                پرونده کامل
                <ArrowLeft size={13} aria-hidden="true" />
              </Link>
            }
          >
            <ul className="flex flex-col gap-2.5">
              {childOverview.map((item) => {
                const isActive = item.student.id === selectedChildId || item.student.id === child.id;
                return (
                  <li
                    key={item.student.id}
                    className={cn(
                      'flex flex-wrap items-center gap-3 rounded-btn border px-3 py-2.5 transition-colors',
                      isActive ? 'border-primary/40 bg-blue-50/40' : 'border-border bg-surface',
                    )}
                  >
                    <Avatar
                      name={item.student.name}
                      color={item.student.avatarColor}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-[13px] font-bold text-text">
                        {item.student.name}
                        {isActive && (
                          <Badge variant="primary" dot={false} className="shrink-0">
                            در حال نمایش
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-[10.5px] text-text-muted">
                        پایه {item.student.gradeLevel} {item.student.field} · کد{' '}
                        {toPersianDigits(item.student.studentCode)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-center">
                      <div>
                        <p className="text-[9.5px] text-text-muted">معدل</p>
                        <p className="text-[12px] font-extrabold text-text">
                          {scoreText(item.student.gpa)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] text-text-muted">حضور</p>
                        <p className="text-[12px] font-extrabold text-text">
                          {item.attendanceRate !== null && item.attendanceRate !== undefined
                            ? percentText(item.attendanceRate, 0)
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] text-text-muted">وضعیت</p>
                        <Badge
                          variant={item.student.status === 'active' ? 'success' : 'danger'}
                          className="mt-0.5"
                        >
                          {item.student.status === 'active' ? 'فعال' : 'معلق'}
                        </Badge>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {/* Recent grades */}
          <SectionCard
            title="نمرات اخیر"
            description="آخرین نمرات ثبت‌شده توسط معلمان"
            icon={ClipboardList}
            flush
            action={
              <Link
                to={`${ROUTES.PARENT}/grades`}
                className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
              >
                همهٔ نمرات
                <ArrowLeft size={13} aria-hidden="true" />
              </Link>
            }
          >
            {latestGrades.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={ClipboardList}
                  title="نمره‌ای ثبت نشده است"
                  description="به‌محض ثبت نمره توسط معلم، اینجا نمایش داده می‌شود."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/70 text-[11px] text-text-muted">
                      <th className="px-4 py-2.5 text-start font-bold">درس</th>
                      <th className="px-4 py-2.5 text-start font-bold">عنوان</th>
                      <th className="px-4 py-2.5 text-start font-bold">نوع</th>
                      <th className="px-4 py-2.5 text-center font-bold">نمره</th>
                      <th className="px-4 py-2.5 text-start font-bold">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestGrades.map((grade) => {
                      const scaled = toTwenty(grade);
                      const tone = gradeTone(scaled);
                      return (
                        <tr
                          key={grade.id}
                          className="border-b border-border last:border-0 hover:bg-slate-50/60"
                        >
                          <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold text-text">
                            {db.subjects.find((subject) => subject.id === grade.subjectId)?.name ??
                              '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-text-muted">
                            {grade.title}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5">
                            <GradeTypeBadge type={grade.type} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-center">
                            <span
                              className={cn(
                                'inline-flex min-w-[46px] justify-center rounded-full px-2 py-0.5 text-[11.5px] font-extrabold',
                                tone === 'success'
                                  ? 'bg-green-50 text-green-800'
                                  : tone === 'warning'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-red-50 text-red-700',
                              )}
                            >
                              {scoreText(scaled)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-text-muted">
                            {formatJalaliShort(grade.date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Attendance strip + pending homework */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard
              title="روزهای اخیر حضور"
              description="۱۴ روز کاری آخر"
              icon={CalendarCheck2}
              action={
                <Link
                  to={`${ROUTES.PARENT}/attendance`}
                  className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
                >
                  تاریخچه
                  <ArrowLeft size={13} aria-hidden="true" />
                </Link>
              }
            >
              {dayMatrix.length === 0 ? (
                <p className="text-[11px] text-text-muted">سابقهٔ حضوری ثبت نشده است.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {dayMatrix.map((day) => (
                    <span
                      key={day.date}
                      title={`${formatJalaliShort(day.date)} — ${day.status}`}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-btn text-[9.5px] font-bold',
                        day.status === 'present' && 'bg-green-50 text-green-800 ring-1 ring-green-200',
                        day.status === 'late' && 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
                        day.status === 'absent' && 'bg-red-50 text-red-700 ring-1 ring-red-200',
                        day.status === 'excused' && 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
                        day.status === 'none' && 'bg-slate-50 text-slate-500 ring-1 ring-slate-200',
                      )}
                    >
                      {formatJalaliShort(day.date).slice(0, 2)}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-[10.5px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden="true" />
                  <span className="text-text-muted">حاضر: {toPersianDigits(attendance.presentCount)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
                  <span className="text-text-muted">تأخیر: {toPersianDigits(attendance.lateCount)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                  <span className="text-text-muted">غیبت: {toPersianDigits(attendance.absentCount)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden="true" />
                  <span className="text-text-muted">موجه: {toPersianDigits(attendance.excusedCount)}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="تکالیف در پیش رو"
              description="نزدیک‌ترین مهلت‌ها"
              icon={NotebookPen}
              action={
                <Link
                  to={`${ROUTES.PARENT}/homework`}
                  className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
                >
                  همه تکالیف
                  <ArrowLeft size={13} aria-hidden="true" />
                </Link>
              }
            >
              {pendingHomework.length === 0 ? (
                <p className="rounded-btn bg-green-50 px-3 py-2.5 text-[11.5px] font-semibold text-green-800">
                  فرزند شما هیچ تکلیف انجام‌نشده‌ای ندارد. آفرین!
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {pendingHomework.slice(0, 4).map((item) => (
                    <li
                      key={item.homework.id}
                      className="rounded-btn border border-border px-2.5 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-text">
                            {item.homework.title}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {item.subjectName} · {item.teacherName}
                          </p>
                        </div>
                        <HomeworkBadge state={item.state} />
                      </div>
                      <p className="mt-1 text-[10px] text-text-muted">
                        مهلت: {formatJalaliShort(item.homework.dueDate)}
                        {item.daysLeft >= 0
                          ? ` (${toPersianDigits(item.daysLeft)} روز مانده)`
                          : ` (${toPersianDigits(Math.abs(item.daysLeft))} روز گذشته)`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          {/* Recent absences / late */}
          <SectionCard
            title="غیبت‌ها و تأخیرهای اخیر"
            description="در صورت موجه بودن، می‌توانید وضعیت را اصلاح کنید"
            icon={UserX}
            flush
          >
            {lateOrAbsent.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={BadgeCheck}
                  title="موردی برای پیگیری نیست"
                  description="هیچ غیبت یا تأخیری برای فرزند شما ثبت نشده است."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {lateOrAbsent.map(({ record, kind }) => (
                  <li
                    key={record.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <AttendanceBadge status={record.status} />
                        <span className="text-[12px] font-semibold text-text">
                          {db.subjects.find((subject) => subject.id === record.subjectId)?.name ?? '—'}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {formatJalaliShort(record.date)}
                        </span>
                      </div>
                      {record.note && (
                        <p className="mt-1 text-[10.5px] leading-5 text-text-muted">{record.note}</p>
                      )}
                    </div>
                    {kind === 'absent' && record.status === 'absent' && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={BadgeCheck}
                        onClick={() => handleFixAbsence(record.id)}
                      >
                        ثبت موجه بودن
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Right (narrow) column */}
        <div className="flex flex-col gap-4">
          {/* Guardian profile + quick facts */}
          <SectionCard title="حساب کاربری من" icon={Users}>
            <div className="flex items-center gap-3">
              <Avatar
                name={currentUser?.name ?? 'ولی'}
                color={currentUser?.avatarColor}
                size="lg"
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold text-text">
                  {currentUser?.name}
                </p>
                <p className="truncate text-[10.5px] text-text-muted">{currentUser?.email}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="primary" dot={false}>
                    ولی دانش‌آموز
                  </Badge>
                  {parentRecord && (
                    <Badge variant="neutral" dot={false}>
                      {PARENT_RELATION_LABELS[parentRecord.relation]}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">شماره تماس</dt>
                <dd className="font-mono font-semibold text-text" dir="ltr">
                  {toPersianDigits(parentRecord?.phone ?? currentUser?.phone ?? '—')}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">شغل</dt>
                <dd className="font-semibold text-text">{parentRecord?.occupation ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">تعداد فرزندان</dt>
                <dd className="font-semibold text-text">{toPersianDigits(children.length)} نفر</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">پیام‌های خوانده‌نشده</dt>
                <dd className="font-semibold text-text">{toPersianDigits(unreadMessages.length)}</dd>
              </div>
            </dl>
          </SectionCard>

          {/* Finance quick view */}
          <SectionCard
            title="وضعیت مالی"
            description={`${toPersianDigits(finance.paidCount)} پرداخت موفق`}
            icon={Wallet}
            action={
              <Link
                to={`${ROUTES.PARENT}/payments`}
                className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
              >
                مشاهده
                <ArrowLeft size={13} aria-hidden="true" />
              </Link>
            }
          >
            <div className="rounded-btn bg-slate-50/70 p-3">
              <p className="text-[10.5px] text-text-muted">جمع کل شهریه ثبت‌شده</p>
              <p className="mt-0.5 text-base font-extrabold text-text">
                {formatToman(finance.totalAmount)}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-success"
                  style={{ width: `${Math.min(100, finance.paidRatio)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-text-muted">
                {percentText(finance.paidRatio, 0)} پرداخت شده
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-btn border border-green-200 bg-green-50 px-2.5 py-2">
                <p className="text-[9.5px] text-green-800">پرداخت‌شده</p>
                <p className="text-[11.5px] font-extrabold text-green-900">
                  {formatToman(finance.paidAmount)}
                </p>
              </div>
              <div className="rounded-btn border border-red-200 bg-red-50 px-2.5 py-2">
                <p className="text-[9.5px] text-red-700">مانده بدهی</p>
                <p className="text-[11.5px] font-extrabold text-red-800">
                  {formatToman(finance.outstandingAmount)}
                </p>
              </div>
            </div>
            {finance.overdueCount > 0 && (
              <p className="mt-2 flex items-start gap-1.5 rounded-btn bg-red-50 px-2.5 py-2 text-[10.5px] font-semibold leading-5 text-red-700">
                <TriangleAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                {toPersianDigits(finance.overdueCount)} صورت‌حساب معوقه دارید. لطفاً به امور مالی
                مدرسه مراجعه کنید.
              </p>
            )}
          </SectionCard>

          {/* Announcements */}
          <SectionCard
            title="اطلاعیه‌های مدرسه"
            description="آخرین اطلاع‌رسانی‌ها برای اولیا"
            icon={Megaphone}
            action={
              <Link
                to={`${ROUTES.PARENT}/announcements`}
                className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
              >
                همه
                <ArrowLeft size={13} aria-hidden="true" />
              </Link>
            }
          >
            {announcements.length === 0 ? (
              <p className="text-[11px] text-text-muted">اطلاعیه‌ای ثبت نشده است.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {announcements.slice(0, 4).map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      'rounded-btn border border-border bg-surface px-2.5 py-2',
                      PRIORITY_RING[item.priority],
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[12px] font-bold leading-5 text-text">
                        {item.title}
                      </p>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-text-muted">
                      <span>{item.authorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatRelativeTime(item.createdAt)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Class & teachers shortcut */}
          <SectionCard title="کلاس فرزند" icon={BookOpenCheck}>
            <ul className="space-y-1.5 text-[11.5px]">
              <li className="flex justify-between gap-2">
                <span className="text-text-muted">کلاس</span>
                <span className="font-semibold text-text">
                  {classInfo?.schoolClass?.name ?? '—'}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-text-muted">مربی</span>
                <span className="font-semibold text-text">
                  {classInfo?.homeroomTeacher?.name ?? '—'}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-text-muted">تعداد دبیران</span>
                <span className="font-semibold text-text">
                  {toPersianDigits(classInfo?.teachers.length ?? 0)} نفر
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-text-muted">هم‌کلاسی‌ها</span>
                <span className="font-semibold text-text">
                  {toPersianDigits(classInfo?.classmates ?? 0)} نفر
                </span>
              </li>
            </ul>
            <Link
              to={`${ROUTES.PARENT}/child`}
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-btn border border-border px-2 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
            >
              مشاهدهٔ دبیران و برنامه
              <ChevronLeft size={13} aria-hidden="true" />
            </Link>
          </SectionCard>
        </div>
      </div>

      <StudentProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        student={child}
      />
    </>
  );
}
