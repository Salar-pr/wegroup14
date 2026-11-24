import type { ScheduleEntry, Weekday } from '../types';

const LESSON_TIMES: Array<{ start: string; end: string }> = [
  { start: '07:30', end: '08:20' },
  { start: '08:30', end: '09:20' },
  { start: '09:30', end: '10:20' },
  { start: '10:30', end: '11:20' },
  { start: '11:30', end: '12:20' },
];

let counter = 0;
function entry(
  classId: string,
  day: Weekday,
  period: number,
  subjectId: string,
  teacherId: string,
  room: string,
): ScheduleEntry {
  counter += 1;
  const time = LESSON_TIMES[period - 1];
  return {
    id: `sch-${String(counter).padStart(2, '0')}`,
    classId,
    day,
    period,
    start: time.start,
    end: time.end,
    subjectId,
    teacherId,
    room,
  };
}

export const mockSchedule: ScheduleEntry[] = [
  // ---- دهم ریاضی ۱ (c-01) — کامل ----
  entry('c-01', 0, 1, 'sub-01', 't-01', 'کلاس ۲'),
  entry('c-01', 0, 2, 'sub-03', 't-03', 'کلاس ۲'),
  entry('c-01', 0, 3, 'sub-06', 't-07', 'کلاس ۲'),
  entry('c-01', 0, 4, 'sub-07', 't-06', 'کلاس ۲'),
  entry('c-01', 1, 1, 'sub-08', 't-06', 'کلاس ۲'),
  entry('c-01', 1, 2, 'sub-01', 't-01', 'کلاس ۲'),
  entry('c-01', 1, 3, 'sub-09', 't-08', 'کلاس ۲'),
  entry('c-01', 1, 4, 'sub-10', 't-08', 'سالن ورزش'),
  entry('c-01', 2, 1, 'sub-03', 't-03', 'آزمایشگاه فیزیک'),
  entry('c-01', 2, 2, 'sub-01', 't-01', 'کلاس ۲'),
  entry('c-01', 2, 3, 'sub-07', 't-06', 'کلاس ۲'),
  entry('c-01', 2, 4, 'sub-05', 't-05', 'آزمایشگاه شیمی'),
  entry('c-01', 3, 1, 'sub-06', 't-07', 'کلاس ۲'),
  entry('c-01', 3, 2, 'sub-08', 't-06', 'کلاس ۲'),
  entry('c-01', 3, 3, 'sub-01', 't-01', 'کلاس ۲'),
  entry('c-01', 3, 4, 'sub-09', 't-08', 'کلاس ۲'),
  entry('c-01', 4, 1, 'sub-01', 't-01', 'کلاس ۲'),
  entry('c-01', 4, 2, 'sub-03', 't-03', 'کلاس ۲'),
  entry('c-01', 4, 3, 'sub-05', 't-05', 'آزمایشگاه شیمی'),
  entry('c-01', 4, 4, 'sub-12', 't-07', 'کلاس ۲'),
  entry('c-01', 5, 1, 'sub-10', 't-08', 'سالن ورزش'),
  entry('c-01', 5, 2, 'sub-11', 't-08', 'کلاس ۲'),

  // ---- سایر کلاس‌ها — نمونه ----
  entry('c-02', 0, 1, 'sub-04', 't-04', 'کلاس ۴'),
  entry('c-02', 0, 2, 'sub-06', 't-07', 'کلاس ۴'),
  entry('c-02', 1, 1, 'sub-05', 't-05', 'آزمایشگاه شیمی'),
  entry('c-02', 2, 1, 'sub-04', 't-04', 'کلاس ۴'),
  entry('c-03', 0, 1, 'sub-02', 't-02', 'کلاس ۵'),
  entry('c-03', 0, 2, 'sub-03', 't-03', 'کلاس ۵'),
  entry('c-04', 0, 1, 'sub-04', 't-04', 'کلاس ۷'),
  entry('c-04', 0, 2, 'sub-05', 't-05', 'کلاس ۷'),
  entry('c-05', 0, 1, 'sub-02', 't-02', 'کلاس ۸'),
  entry('c-05', 0, 2, 'sub-03', 't-03', 'کلاس ۸'),
  entry('c-06', 0, 1, 'sub-06', 't-07', 'کلاس ۹'),
  entry('c-06', 0, 2, 'sub-12', 't-07', 'کلاس ۹'),
];
