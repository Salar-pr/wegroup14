import { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  UserRound,
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
import { ROUTES } from '../../../constants/routes';
import { WEEKDAY_LABELS, type Weekday } from '../../../types';
import { cn, toPersianDigits } from '../../../utils';
import { SectionCard } from '../components/SectionCard';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { useStudentPortal } from '../hooks/useStudentPortal';
import { currentPersianWeekday, type EnrichedScheduleEntry } from '../lib/studentAnalytics';

const DAYS_ORDER: Weekday[] = [0, 1, 2, 3, 4, 5];

export default function SchedulePage() {
  const { student, dossier, schedule } = useStudentPortal();

  const todayWeekday = currentPersianWeekday();
  const [activeDay, setActiveDay] = useState<Weekday | 'all'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<EnrichedScheduleEntry | null>(null);

  const subjectOptions = useMemo(() => {
    if (!schedule) return [{ value: 'all', label: 'همه دروس برنامه' }];
    const map = new Map<string, string>();
    for (const item of schedule.entries) {
      map.set(item.entry.subjectId, item.subjectName);
    }
    return [
      { value: 'all', label: 'همه دروس برنامه' },
      ...[...map.entries()].map(([value, label]) => ({ value, label })),
    ];
  }, [schedule]);

  if (!student || !dossier || !schedule) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="برنامه کلاسی در دسترس نیست"
        description="اطلاعات کلاس شما در سامانه یافت نشد."
      />
    );
  }

  const roomsSet = new Set(schedule.entries.map((e) => e.entry.room));
  const teachersSet = new Set(schedule.entries.map((e) => e.entry.teacherId));

  return (
    <div className="space-y-6">
      <PageHeader
        title="برنامه هفتگی من"
        description={`جدول زمان‌بندی کلاس‌های ${dossier.schoolClass?.name ?? ''} به تفکیک روز، زنگ، دبیر و شماره کلاس`}
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'برنامه کلاسی' }]}
        actions={
          <>
            {todayWeekday !== null && (
              <Button
                variant={activeDay === todayWeekday ? 'primary' : 'outline'}
                size="sm"
                leftIcon={CalendarDays}
                onClick={() =>
                  setActiveDay((prev) => (prev === todayWeekday ? 'all' : todayWeekday))
                }
              >
                {activeDay === todayWeekday
                  ? 'نمایش کل هفته'
                  : `فقط برنامه امروز (${WEEKDAY_LABELS[todayWeekday]})`}
              </Button>
            )}
            {(activeDay !== 'all' || subjectFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={RotateCcw}
                onClick={() => {
                  setActiveDay('all');
                  setSubjectFilter('all');
                }}
              >
                پاک کردن فیلترها
              </Button>
            )}
          </>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="مجموع جلسات هفتگی"
          value={`${toPersianDigits(schedule.totalWeeklyPeriods)} زنگ`}
          icon={Clock}
          tone="primary"
          hint="از شنبه تا پنج‌شنبه"
        />
        <StatCard
          title="تعداد دروس فعال"
          value={`${toPersianDigits(schedule.uniqueSubjectsCount)} درس`}
          icon={BookOpen}
          tone="info"
          hint={`پایه ${student.gradeLevel} ${student.field}`}
        />
        <StatCard
          title="دبیران کلاس"
          value={`${toPersianDigits(teachersSet.size)} دبیر`}
          icon={UserRound}
          tone="success"
          hint={`معلم راهنما: ${dossier.homeroomTeacher?.name ?? '—'}`}
        />
        <StatCard
          title="کلاس اصلی و آزمایشگاه‌ها"
          value={dossier.schoolClass?.room ?? 'کلاس ۲'}
          icon={MapPin}
          tone="warning"
          hint={`${toPersianDigits(roomsSet.size)} فضای آموزشی متفاوت در هفته`}
        />
      </div>

      {/* Filter Controls: Day Tabs + Subject Select */}
      <div className="flex flex-col justify-between gap-4 rounded-card border border-border bg-surface p-4 shadow-card lg:flex-row lg:items-center">
        <div
          role="tablist"
          aria-label="فیلتر روز هفته"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeDay === 'all'}
            onClick={() => setActiveDay('all')}
            className={cn(
              'rounded-btn px-3.5 py-2 text-[12px] font-bold transition-colors',
              activeDay === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-background text-text-muted hover:bg-slate-100 hover:text-text',
            )}
          >
            کل هفته
          </button>
          {DAYS_ORDER.map((day) => {
            const count = schedule.byDay.find((d) => d.day === day)?.entries.length ?? 0;
            const selected = activeDay === day;
            const isToday = todayWeekday === day;
            return (
              <button
                key={day}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveDay(day)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-bold transition-colors',
                  selected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background text-text-muted hover:bg-slate-100 hover:text-text',
                )}
              >
                <span>{WEEKDAY_LABELS[day]}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px]',
                    selected
                      ? 'bg-white/20 text-white'
                      : isToday
                        ? 'bg-blue-100 text-primary'
                        : 'bg-slate-200/70 text-text-muted',
                  )}
                >
                  {toPersianDigits(count)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full lg:w-64">
          <Select
            aria-label="فیلتر بر اساس نام درس"
            options={subjectOptions}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Weekly Timetable Component */}
      <WeeklySchedule
        byDay={schedule.byDay}
        periods={schedule.periods}
        activeDay={activeDay}
        highlightDay={todayWeekday}
        subjectFilter={subjectFilter}
        onSelectSession={(sessionItem) => setSelectedSession(sessionItem)}
      />

      {/* Course & Teacher Directory for this Class */}
      <SectionCard
        title="فهرست دروس، دبیران و ساعات هفتگی"
        subtitle="برای مشاهده جزئیات هر زنگ روی خانه‌های جدول بالا کلیک کنید"
        icon={BookOpen}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjectOptions
            .filter((opt) => opt.value !== 'all')
            .map((opt) => {
              const sample = schedule.entries.find((e) => e.entry.subjectId === opt.value);
              const sessionsCount = schedule.entries.filter(
                (e) => e.entry.subjectId === opt.value,
              ).length;
              if (!sample) return null;

              return (
                <div
                  key={opt.value}
                  className="flex items-center justify-between gap-3 rounded-btn border border-border bg-background p-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: sample.color }}
                        aria-hidden="true"
                      />
                      <p className="truncate text-[13px] font-bold text-text">
                        {sample.subjectName}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-text-muted">
                      دبیر: {sample.teacherName} • ضریب{' '}
                      {toPersianDigits(sample.subject?.coefficient ?? 1)}
                    </p>
                  </div>
                  <Badge variant="info" dot={false}>
                    {toPersianDigits(sessionsCount)} جلسه
                  </Badge>
                </div>
              );
            })}
        </div>
      </SectionCard>

      {/* Session Details Modal */}
      <Modal
        open={selectedSession !== null}
        onClose={() => setSelectedSession(null)}
        title={
          selectedSession
            ? `درس ${selectedSession.subjectName} — ${selectedSession.dayLabel}`
            : undefined
        }
        description={
          selectedSession
            ? `زنگ ${toPersianDigits(selectedSession.entry.period)} (${toPersianDigits(selectedSession.entry.start)} تا ${toPersianDigits(selectedSession.entry.end)})`
            : undefined
        }
        footer={
          <Button variant="primary" size="sm" onClick={() => setSelectedSession(null)}>
            بستن
          </Button>
        }
      >
        {selectedSession && (
          <dl className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="text-[11px] text-text-muted">نام و کد درس</dt>
              <dd className="mt-1 font-bold text-text">
                {selectedSession.subjectName} ({selectedSession.subjectCode})
              </dd>
            </div>
            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="text-[11px] text-text-muted">مکان تشکیل کلاس</dt>
              <dd className="mt-1 font-bold text-primary">{selectedSession.entry.room}</dd>
            </div>
            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="text-[11px] text-text-muted">دبیر مربوطه</dt>
              <dd className="mt-1 font-bold text-text">{selectedSession.teacherName}</dd>
              {selectedSession.teacher?.specialty && (
                <p className="mt-0.5 text-[11px] text-text-muted">
                  گروه آموزشی: {selectedSession.teacher.specialty}
                </p>
              )}
            </div>
            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="text-[11px] text-text-muted">ضریب و ساعات مصوب</dt>
              <dd className="mt-1 font-bold text-text">
                ضریب {toPersianDigits(selectedSession.subject?.coefficient ?? 1)} •{' '}
                {toPersianDigits(selectedSession.subject?.weeklyHours ?? 2)} ساعت هفتگی
              </dd>
            </div>
            {selectedSession.teacher && (
              <div className="rounded-btn border border-border bg-background p-3.5 sm:col-span-2">
                <dt className="text-[11px] text-text-muted">راه‌های ارتباطی با دبیر</dt>
                <dd className="mt-1.5 flex flex-wrap items-center gap-4 text-[12px] font-semibold text-text">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={14} className="text-primary" aria-hidden="true" />
                    <span dir="ltr">{selectedSession.teacher.email}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={14} className="text-primary" aria-hidden="true" />
                    <span>{toPersianDigits(selectedSession.teacher.phone)}</span>
                  </span>
                </dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </div>
  );
}
