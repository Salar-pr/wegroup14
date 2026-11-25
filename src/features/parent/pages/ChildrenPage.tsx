import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  School,
  UserRound,
  Users,
} from 'lucide-react';
import { Avatar, Button, EmptyState, PageHeader } from '../../../components';
import { useData } from '../../../hooks';
import { cn, formatJalali, toPersianDigits } from '../../../utils';
import { WEEKDAY_LABELS, type Weekday } from '../../../types';
import { useParentChild } from '../hooks/useParentChild';
import { useParentSession } from '../hooks/parent-session';
import {
  buildAcademicSummary,
  buildAttendanceSummary,
  buildClassInfo,
  percentText,
  scoreText,
} from '../lib/parentAnalytics';
import { ChildProfileCard } from '../components/ChildProfileCard';
import { SectionCard } from '../components/SectionCard';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { AttendanceBadge } from '../components/DomainBadge';
import { resolveParentRecord } from '../lib/parentAnalytics';
import { useAuth } from '../../../hooks';

const DAYS: Weekday[] = [0, 1, 2, 3, 4, 5];

export default function ChildrenPage() {
  const { db } = useData();
  const { currentUser } = useAuth();
  const { selectedChildId } = useParentSession();
  const { children, child, academic, attendance, finance, classInfo } = useParentChild();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scheduleDay, setScheduleDay] = useState<Weekday>(0);

  const parentRecord = useMemo(
    () => (currentUser ? resolveParentRecord(db, currentUser) : undefined),
    [db, currentUser],
  );

  // Per-child cards (all children, each with its own live summaries).
  const cards = useMemo(
    () =>
      children.map((student) => ({
        student,
        academic: buildAcademicSummary(db, student.id),
        attendance: buildAttendanceSummary(db, student.id),
        classInfo: buildClassInfo(db, student),
        parent: db.parents.find((item) => item.studentIds.includes(student.id)),
      })),
    [children, db],
  );

  const dayEntries = useMemo(() => {
    if (!child) return [];
    return db.schedule
      .filter((entry) => entry.classId === child.classId && entry.day === scheduleDay)
      .sort((a, b) => a.period - b.period);
  }, [db.schedule, child, scheduleDay]);

  if (!child || !academic || !attendance || !finance) {
    return (
      <>
        <PageHeader title="فرزند من" description="پروندهٔ تحصیلی و آموزشی فرزند شما" />
        <EmptyState
          icon={Users}
          title="فرزندی به این حساب متصل نیست"
          description="برای مشاهدهٔ پرونده، با دفتر مدرسه تماس بگیرید."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="فرزند من"
        description="اطلاعات کامل دانش‌آموز، کلاس، دبیران، برنامه هفتگی و عملکرد تحصیلی"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'پیشخوان اولیا', to: '/parent' }, { label: 'فرزند من' }]}
        actions={
          <Button variant="outline" size="sm" leftIcon={UserRound} onClick={() => setProfileOpen(true)}>
            پرونده کامل
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Profile column */}
        <div className="flex flex-col gap-4">
          <ChildProfileCard
            student={child}
            db={db}
            parent={parentRecord}
            academic={academic}
            attendance={attendance}
            finance={finance}
          />
        </div>

        {/* Details column */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Class info */}
          <SectionCard
            title="اطلاعات کلاس"
            description={classInfo?.schoolClass?.name}
            icon={School}
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <Info label="پایه" value={child.gradeLevel} />
              <Info label="رشته" value={child.field} />
              <Info label="کلاس" value={classInfo?.schoolClass?.name ?? '—'} />
              <Info label="اتاق" value={classInfo?.schoolClass?.room ?? '—'} />
              <Info
                label="ظرفیت کلاس"
                value={`${toPersianDigits(classInfo?.schoolClass?.enrolled ?? 0)} از ${toPersianDigits(classInfo?.schoolClass?.capacity ?? 0)}`}
              />
              <Info
                label="مربی کلاس"
                value={classInfo?.homeroomTeacher?.name ?? '—'}
              />
              <Info
                label="تعداد دروس"
                value={`${toPersianDigits(classInfo?.subjects.length ?? 0)} درس`}
              />
              <Info
                label="ساعت هفتگی"
                value={`${toPersianDigits(classInfo?.weeklyHours ?? 0)} ساعت`}
              />
              <Info
                label="هم‌کلاسی‌ها"
                value={`${toPersianDigits(classInfo?.classmates ?? 0)} نفر`}
              />
            </div>
          </SectionCard>

          {/* Teachers */}
          <SectionCard
            title="دبیران و دروس"
            description={`${toPersianDigits(classInfo?.teachers.length ?? 0)} دبیر در این کلاس`}
            icon={Users}
            flush
          >
            {!classInfo || classInfo.teachers.length === 0 ? (
              <p className="px-4 py-4 text-[11.5px] text-text-muted">دبیری ثبت نشده است.</p>
            ) : (
              <ul className="divide-y divide-border">
                {classInfo.teachers.map(({ teacher, subjects }) => (
                  <li key={teacher.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <Avatar name={teacher.name} color={teacher.avatarColor} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-text">
                        {teacher.name}
                        {teacher.id === classInfo.schoolClass?.homeroomTeacherId && (
                          <span className="ms-1.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            مربی
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[10.5px] text-text-muted">{teacher.specialty}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {subjects.map((subject) => (
                        <span
                          key={subject.id}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${teacher.phone}`}
                        aria-label={`تماس با ${teacher.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        <Phone size={14} aria-hidden="true" />
                      </a>
                      <span
                        title={teacher.email}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-border text-text-muted"
                      >
                        <Mail size={14} aria-hidden="true" />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Weekly schedule */}
          <SectionCard
            title="برنامه هفتگی"
            description="برنامهٔ کلاسی فرزند بر اساس روز هفته"
            icon={CalendarDays}
          >
            <div className="mb-3 flex flex-wrap gap-1.5">
              {DAYS.map((day) => {
                const hasLesson = db.schedule.some(
                  (entry) => entry.classId === child.classId && entry.day === day,
                );
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setScheduleDay(day)}
                    aria-pressed={scheduleDay === day}
                    disabled={!hasLesson}
                    className={cn(
                      'rounded-btn px-3 py-1.5 text-[11.5px] font-bold transition-colors',
                      scheduleDay === day
                        ? 'bg-primary text-white'
                        : hasLesson
                          ? 'border border-border bg-surface text-text hover:bg-slate-50'
                          : 'cursor-not-allowed border border-dashed border-border text-slate-300',
                    )}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                );
              })}
            </div>

            {dayEntries.length === 0 ? (
              <p className="rounded-btn border border-dashed border-border px-3 py-4 text-center text-[11.5px] text-text-muted">
                در این روز کلاسی برنامه‌ریزی نشده است (تعطیل).
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayEntries.map((entry) => {
                  const subject = db.subjects.find((item) => item.id === entry.subjectId);
                  const teacher = db.teachers.find((item) => item.id === entry.teacherId);
                  return (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center gap-3 rounded-btn border border-border px-3 py-2"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-blue-50 text-[11px] font-extrabold text-primary">
                        {toPersianDigits(entry.period)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-text">
                          {subject?.name ?? '—'}
                        </p>
                        <p className="truncate text-[10px] text-text-muted">
                          {teacher?.name ?? '—'} · {entry.room}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10.5px] font-bold text-slate-700">
                        {toPersianDigits(entry.start)} — {toPersianDigits(entry.end)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      {/* All children comparison list */}
      {cards.length > 1 && (
        <div className="mt-4">
          <SectionCard
            title="مقایسهٔ فرزندان"
            description="وضعیت تحصیلی و حضوری همهٔ فرزندان متصل به این حساب"
            icon={GraduationCap}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => {
                const isSelected = card.student.id === selectedChildId;
                return (
                  <div
                    key={card.student.id}
                    className={cn(
                      'rounded-card border p-3 transition-colors',
                      isSelected ? 'border-primary/40 bg-blue-50/30' : 'border-border bg-surface',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={card.student.name}
                        color={card.student.avatarColor}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold text-text">
                          {card.student.name}
                        </p>
                        <p className="truncate text-[10px] text-text-muted">
                          {card.classInfo.schoolClass?.name ?? card.student.gradeLevel}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-2.5 space-y-1 border-t border-border pt-2 text-[11px]">
                      <div className="flex justify-between">
                        <dt className="text-text-muted">معدل</dt>
                        <dd className="font-extrabold text-text">
                          {scoreText(card.academic.overallAverage)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-text-muted">حضور</dt>
                        <dd className="font-extrabold text-text">
                          {percentText(card.attendance.rate, 0)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-text-muted">غیبت</dt>
                        <dd className="font-bold text-danger">
                          {toPersianDigits(card.attendance.absentCount)} روز
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-text-muted">آخرین وضعیت</dt>
                        <dd>
                          {card.attendance.records[0] ? (
                            <AttendanceBadge status={card.attendance.records[0].status} />
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-text-muted">ثبت‌نام</dt>
                        <dd className="text-text-muted">{formatJalali(card.student.enrolledAt)}</dd>
                      </div>
                    </dl>
                    <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-success">
                      <BadgeCheck size={12} aria-hidden="true" />
                      وضعیت پرونده: کامل
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      <div className="mt-4 rounded-card border border-blue-200 bg-blue-50/60 px-4 py-3">
        <p className="flex items-start gap-2 text-[11px] leading-6 text-blue-900">
          <BookOpen size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          اطلاعات این صفحه به‌صورت زنده از سامانهٔ مرکزی مدرسه خوانده می‌شود؛ هر تغییری که مدیر یا
          معلم در نمرات، حضور و غیاب یا اطلاعات کلاس ثبت کند، بلافاصله در این پرونده قابل مشاهده است.
        </p>
      </div>

      <StudentProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        student={child}
      />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-btn border border-border bg-slate-50/60 px-2.5 py-2">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-bold text-text">{value}</p>
    </div>
  );
}
