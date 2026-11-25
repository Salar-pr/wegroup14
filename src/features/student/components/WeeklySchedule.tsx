import { Clock, MapPin, UserRound } from 'lucide-react';
import { Badge } from '../../../components';
import { cn, toPersianDigits } from '../../../utils';
import type { Weekday } from '../../../types';
import type { DayScheduleGroup, EnrichedScheduleEntry } from '../lib/studentAnalytics';

export interface WeeklyScheduleProps {
  byDay: DayScheduleGroup[];
  periods: Array<{ period: number; start: string; end: string }>;
  activeDay: Weekday | 'all';
  highlightDay?: Weekday | null;
  subjectFilter?: string;
  onSelectSession?: (session: EnrichedScheduleEntry) => void;
}

/**
 * Responsive weekly timetable component:
 * - When `activeDay === 'all'`, renders a desktop timetable matrix (Saturday → Thursday
 *   across lesson periods) and an adaptive day-by-day stack on smaller viewports.
 * - When a specific weekday is chosen, renders detailed session cards for that day.
 */
export function WeeklySchedule({
  byDay,
  periods,
  activeDay,
  highlightDay = null,
  subjectFilter = 'all',
  onSelectSession,
}: WeeklyScheduleProps) {
  const matchesFilter = (item: EnrichedScheduleEntry) =>
    subjectFilter === 'all' || item.entry.subjectId === subjectFilter;

  if (activeDay !== 'all') {
    const group = byDay.find((d) => d.day === activeDay);
    const filteredEntries = (group?.entries ?? []).filter(matchesFilter);

    return (
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center text-[13px] text-text-muted">
            برای روز انتخاب‌شده با فیلتر فعلی کلاسی در برنامه ثبت نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredEntries.map((session) => (
              <SessionDetailCard
                key={session.entry.id}
                session={session}
                onSelect={onSelectSession}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Desktop full matrix (lg and up) */}
      <div className="hidden overflow-hidden rounded-card border border-border bg-surface shadow-card lg:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">برنامه هفتگی کلاس</caption>
            <thead>
              <tr className="border-b border-border bg-slate-50/80">
                <th
                  scope="col"
                  className="w-32 border-e border-border px-4 py-3.5 text-start text-[12px] font-bold text-text-muted"
                >
                  روز هفته
                </th>
                {periods.map((slot) => (
                  <th
                    key={slot.period}
                    scope="col"
                    className="border-e border-border px-3.5 py-3 text-start last:border-e-0"
                  >
                    <span className="block text-[12px] font-bold text-text">
                      زنگ {toPersianDigits(slot.period)}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
                      <Clock size={11} aria-hidden="true" />
                      {toPersianDigits(slot.start)} تا {toPersianDigits(slot.end)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byDay.map((dayGroup) => {
                const isToday = highlightDay === dayGroup.day;
                return (
                  <tr
                    key={dayGroup.day}
                    className={cn(
                      'border-b border-border last:border-b-0',
                      isToday ? 'bg-blue-50/35' : 'bg-surface',
                    )}
                  >
                    <th
                      scope="row"
                      className="border-e border-border px-4 py-4 text-start align-middle"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[13px] font-extrabold text-text">
                          {dayGroup.dayLabel}
                        </span>
                        {isToday && (
                          <Badge variant="primary" dot>
                            امروز
                          </Badge>
                        )}
                      </div>
                    </th>

                    {periods.map((slot) => {
                      const session = dayGroup.entries.find(
                        (item) => item.entry.period === slot.period,
                      );
                      const dimmed = session && !matchesFilter(session);

                      return (
                        <td
                          key={`${dayGroup.day}-${slot.period}`}
                          className="border-e border-border p-2.5 align-top last:border-e-0"
                        >
                          {session ? (
                            <button
                              type="button"
                              onClick={() => onSelectSession?.(session)}
                              className={cn(
                                'flex w-full flex-col items-start rounded-btn border border-border bg-background p-3 text-start transition-all duration-150 hover:border-primary hover:bg-blue-50/50',
                                dimmed && 'opacity-30',
                              )}
                            >
                              <div className="flex w-full items-center justify-between gap-1.5">
                                <span className="flex items-center gap-1.5 truncate text-[13px] font-bold text-text">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: session.color }}
                                    aria-hidden="true"
                                  />
                                  {session.subjectName}
                                </span>
                                <span
                                  dir="ltr"
                                  className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-text-muted"
                                >
                                  {session.subjectCode}
                                </span>
                              </div>

                              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-text-muted">
                                <UserRound size={12} aria-hidden="true" />
                                {session.teacherName}
                              </span>

                              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                                <MapPin size={12} aria-hidden="true" />
                                {session.entry.room}
                              </span>
                            </button>
                          ) : (
                            <div className="flex h-[84px] items-center justify-center rounded-btn border border-dashed border-slate-200 text-[11px] text-slate-400">
                              زنگ آزاد
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet & Mobile day cards (< lg) */}
      <div className="space-y-4 lg:hidden">
        {byDay.map((dayGroup) => {
          const daySessions = dayGroup.entries.filter(matchesFilter);
          const isToday = highlightDay === dayGroup.day;
          return (
            <div
              key={dayGroup.day}
              className={cn(
                'overflow-hidden rounded-card border bg-surface shadow-card',
                isToday ? 'border-primary' : 'border-border',
              )}
            >
              <div className="flex items-center justify-between border-b border-border bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-text">{dayGroup.dayLabel}</h3>
                  {isToday && <Badge variant="primary">امروز</Badge>}
                </div>
                <span className="text-[11px] font-semibold text-text-muted">
                  {toPersianDigits(daySessions.length)} جلسه
                </span>
              </div>

              {daySessions.length === 0 ? (
                <p className="p-4 text-center text-[12px] text-text-muted">کلاسی ثبت نشده است.</p>
              ) : (
                <div className="divide-y divide-border">
                  {daySessions.map((session) => (
                    <button
                      key={session.entry.id}
                      type="button"
                      onClick={() => onSelectSession?.(session)}
                      className="flex w-full items-center justify-between gap-3 p-3.5 text-start transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                            زنگ {toPersianDigits(session.entry.period)}
                          </span>
                          <span className="truncate text-[13px] font-bold text-text">
                            {session.subjectName}
                          </span>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <UserRound size={12} aria-hidden="true" />
                            {session.teacherName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary">
                            <MapPin size={12} aria-hidden="true" />
                            {session.entry.room}
                          </span>
                        </p>
                      </div>
                      <div className="shrink-0 text-end text-[11px] font-semibold text-text-muted">
                        <span className="block text-text">
                          {toPersianDigits(session.entry.start)}
                        </span>
                        <span>تا {toPersianDigits(session.entry.end)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessionDetailCard({
  session,
  onSelect,
}: {
  session: EnrichedScheduleEntry;
  onSelect?: (session: EnrichedScheduleEntry) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(session)}
      className="flex items-start justify-between gap-4 rounded-card border border-border bg-surface p-4 text-start shadow-card transition-all duration-150 hover:border-primary hover:shadow-cardHover"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" dot={false}>
            زنگ {toPersianDigits(session.entry.period)}
          </Badge>
          <h3 className="text-[15px] font-bold text-text">{session.subjectName}</h3>
          <span
            dir="ltr"
            className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-text-muted"
          >
            {session.subjectCode}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <UserRound size={14} className="text-primary" aria-hidden="true" />
            دبیر: <strong className="font-semibold text-text">{session.teacherName}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" aria-hidden="true" />
            مکان: <strong className="font-semibold text-text">{session.entry.room}</strong>
          </span>
        </div>
      </div>

      <div className="shrink-0 rounded-btn border border-border bg-background px-3 py-2 text-center">
        <span className="block text-[12px] font-extrabold text-primary">
          {toPersianDigits(session.entry.start)}
        </span>
        <span className="block text-[11px] text-text-muted">
          تا {toPersianDigits(session.entry.end)}
        </span>
      </div>
    </button>
  );
}
