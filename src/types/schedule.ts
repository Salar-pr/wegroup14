import type { ID } from './common';

/**
 * Persian school-week days. 0 = Saturday (شنبه) … 5 = Thursday (پنجشنبه).
 * Friday is a holiday and intentionally absent.
 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'شنبه',
  1: 'یکشنبه',
  2: 'دوشنبه',
  3: 'سه‌شنبه',
  4: 'چهارشنبه',
  5: 'پنجشنبه',
};

export interface ScheduleEntry {
  id: ID;
  classId: ID;
  day: Weekday;
  /** Lesson period number, 1-based */
  period: number;
  /** "08:00" — 24h local time */
  start: string;
  end: string;
  subjectId: ID;
  teacherId: ID;
  room: string;
}
