import { useMemo, useState } from 'react';
import { CalendarDays, GraduationCap, School, Users } from 'lucide-react';
import { Badge, EmptyState, PageHeader } from '../../../components';
import { useData } from '../../../hooks';
import { cn, toPersianDigits } from '../../../utils';
import { WEEKDAY_LABELS, type Weekday } from '../../../types';
import { useParentChild } from '../hooks/useParentChild';
import { buildAcademicSummary } from '../lib/parentAnalytics';
import { SectionCard } from '../components/SectionCard';

const DAYS: Weekday[] = [0, 1, 2, 3, 4, 5];

/**
 * Weekly timetable of the focused child. Read-only: the schedule belongs to the
 * school (admin/planner feature) and is displayed here from the shared db.
 */
export default function SchedulePage() {
  const { db } = useData();
  const { child, classInfo } = useParentChild();
  const [day, setDay] = useState<Weekday>(0);

  const entries = useMemo(() => {
    if (!child) return [];
    return db.schedule
      .filter((entry) => entry.classId === child.classId && entry.day === day)
      .sort((a, b) => a.period - b.period);
  }, [db.schedule, child, day]);

  const perDayCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    if (!child) return counts;
    for (const entry of db.schedule) {
      if (entry.classId !== child.classId) continue;
      counts[entry.day] = (counts[entry.day] ?? 0) + 1;
    }
    return counts;
  }, [db.schedule, child]);

  const academic = useMemo(
    () => (child ? buildAcademicSummary(db, child.id) : null),
    [db, child],
  );

  if (!child) {
    return (
      <>
        <PageHeader title="برنامه کلاسی" description="برنامه هفتگی فرزند" />
        <EmptyState icon={CalendarDays} title="فرزندی به این حساب متصل نیست" />
      </>
    );
  }

  const totalSessions = Object.values(perDayCounts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <PageHeader
        title="برنامه کلاسی"
        description={`${child.name} — ${classInfo?.schoolClass?.name ?? child.gradeLevel}`}
        breadcrumbs={[
          { label: 'مدرسه‌یار' },
          { label: 'پیشخوان اولیا', to: '/parent' },
          { label: 'برنامه کلاسی' },
        ]}
        actions={
          <Badge variant="info" dot={false}>
            <School size={12} aria-hidden="true" />
            {toPersianDigits(totalSessions)} جلسه در هفته
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="flex flex-col gap-4">
          <SectionCard title="روزهای هفته" icon={CalendarDays}>
            <div className="flex flex-col gap-1.5">
              {DAYS.map((item) => {
                const count = perDayCounts[item] ?? 0;
                const isActive = day === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDay(item)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-btn px-2.5 py-2 text-start text-[11.5px] font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : count === 0
                          ? 'text-slate-400 hover:bg-slate-50'
                          : 'text-text hover:bg-slate-50',
                    )}
                  >
                    <span>{WEEKDAY_LABELS[item]}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-text-muted',
                      )}
                    >
                      {count === 0 ? 'تعطیل' : `${toPersianDigits(count)} جلسه`}
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="مشخصات کلاس" icon={School}>
            <dl className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">کلاس</dt>
                <dd className="font-semibold text-text">{classInfo?.schoolClass?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">اتاق</dt>
                <dd className="font-semibold text-text">{classInfo?.schoolClass?.room ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">مربی</dt>
                <dd className="font-semibold text-text">
                  {classInfo?.homeroomTeacher?.name ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">تعداد دروس</dt>
                <dd className="font-semibold text-text">
                  {toPersianDigits(academic?.subjects.length ?? 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">ساعت هفتگی</dt>
                <dd className="font-semibold text-text">
                  {toPersianDigits(classInfo?.weeklyHours ?? 0)} ساعت
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="دبیران" icon={Users} flush>
            <ul className="divide-y divide-border">
              {(classInfo?.teachers ?? []).map(({ teacher, subjects }) => (
                <li key={teacher.id} className="px-3 py-2">
                  <p className="truncate text-[11.5px] font-bold text-text">{teacher.name}</p>
                  <p className="truncate text-[10px] text-text-muted">
                    {subjects.map((subject) => subject.name).join('، ')}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="xl:col-span-3">
          <SectionCard
            title={`برنامه ${WEEKDAY_LABELS[day]}`}
            description={entries.length === 0 ? 'بدون کلاس' : `${toPersianDigits(entries.length)} جلسه درسی`}
            icon={CalendarDays}
          >
            {entries.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="در این روز کلاسی برنامه‌ریزی نشده است"
                description="روز دیگری از هفته را انتخاب کنید."
              />
            ) : (
              <ol className="flex flex-col gap-2.5">
                {entries.map((entry) => {
                  const subject = db.subjects.find((item) => item.id === entry.subjectId);
                  const teacher = db.teachers.find((item) => item.id === entry.teacherId);
                  return (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center gap-3 rounded-card border border-border px-3 py-2.5 transition-shadow hover:shadow-card"
                    >
                      <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-btn bg-blue-50 text-primary">
                        <span className="text-[12px] font-extrabold">{toPersianDigits(entry.period)}</span>
                        <span className="text-[7.5px]">زنگ</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold text-text">
                          {subject?.name ?? '—'}
                        </p>
                        <p className="truncate text-[10.5px] text-text-muted">
                          <GraduationCap size={10} className="me-1 inline" aria-hidden="true" />
                          {teacher?.name ?? '—'} · {entry.room}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10.5px] font-bold text-slate-700">
                        {toPersianDigits(entry.start)} — {toPersianDigits(entry.end)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
