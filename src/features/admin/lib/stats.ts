/**
 * Admin feature — derived statistics over the in-memory mock database.
 *
 * All helpers are pure functions of a `Database` snapshot (from `useData()`),
 * so every number on the dashboard is computed live from the same data the
 * CRUD pages edit. No storage, no network — runtime memory only.
 */
import type { Database } from '../../../data';
import type { AttendanceStatus, Homework, PaymentStatus } from '../../../types';
import { formatJalali, formatScore, formatToman } from '../../../utils';
import { ANNOUNCEMENT_AUDIENCE_LABELS, todayISO } from './labels';

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  /** present + late as a percentage of all records (0–100). */
  rate: number;
}

export function attendanceSummary(db: Database): AttendanceSummary {
  const total = db.attendance.length;
  const present = db.attendance.filter((a) => a.status === 'present').length;
  const absent = db.attendance.filter((a) => a.status === 'absent').length;
  const late = db.attendance.filter((a) => a.status === 'late').length;
  const excused = db.attendance.filter((a) => a.status === 'excused').length;
  const rate = total === 0 ? 0 : Math.round(((present + late) / total) * 100);
  return { total, present, absent, late, excused, rate };
}

export interface AttendanceDayPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

/** Attendance counts grouped by date, ascending (for the trend chart). */
export function attendanceByDate(db: Database): AttendanceDayPoint[] {
  const byDate = new Map<string, AttendanceDayPoint>();
  for (const record of db.attendance) {
    const point = byDate.get(record.date) ?? {
      date: record.date,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };
    point[record.status as AttendanceStatus] += 1;
    byDate.set(record.date, point);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/* ------------------------------------------------------------------ */
/* Grades                                                              */
/* ------------------------------------------------------------------ */

export interface SubjectAverage {
  subjectId: string;
  subjectName: string;
  average: number;
  count: number;
}

/** Average score per subject (for the academic performance chart). */
export function averageBySubject(db: Database): SubjectAverage[] {
  const groups = new Map<string, { sum: number; count: number }>();
  for (const grade of db.grades) {
    const group = groups.get(grade.subjectId) ?? { sum: 0, count: 0 };
    group.sum += grade.score;
    group.count += 1;
    groups.set(grade.subjectId, group);
  }
  return [...groups.entries()]
    .map(([subjectId, group]) => ({
      subjectId,
      subjectName: db.subjects.find((s) => s.id === subjectId)?.name ?? subjectId,
      average: Math.round((group.sum / group.count) * 100) / 100,
      count: group.count,
    }))
    .sort((a, b) => b.average - a.average);
}

export interface GradeSummary {
  count: number;
  average: number;
  highest: number;
  lowest: number;
}

export function gradeSummary(db: Database): GradeSummary {
  if (db.grades.length === 0) {
    return { count: 0, average: 0, highest: 0, lowest: 0 };
  }
  const scores = db.grades.map((g) => g.score);
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return {
    count: db.grades.length,
    average: Math.round((sum / scores.length) * 100) / 100,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
  };
}

/* ------------------------------------------------------------------ */
/* Homework                                                            */
/* ------------------------------------------------------------------ */

export type HomeworkStatus = 'overdue' | 'due-soon' | 'active';

export function homeworkStatus(homework: Homework, today: string = todayISO()): HomeworkStatus {
  if (homework.dueDate < today) return 'overdue';
  const diffDays = Math.ceil(
    (new Date(homework.dueDate).getTime() - new Date(today).getTime()) / 86_400_000,
  );
  if (diffDays <= 2) return 'due-soon';
  return 'active';
}

export const HOMEWORK_STATUS_LABELS: Record<HomeworkStatus, string> = {
  overdue: 'مهلت گذشته',
  'due-soon': 'مهلت نزدیک',
  active: 'فعال',
};

/* ------------------------------------------------------------------ */
/* Finance                                                             */
/* ------------------------------------------------------------------ */

export interface FinanceSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  /** Outstanding = pending + overdue amounts. */
  outstanding: number;
}

export function financeSummary(db: Database): FinanceSummary {
  const sum = (status: PaymentStatus) =>
    db.payments.filter((p) => p.status === status).reduce((acc, p) => acc + p.amount, 0);
  const count = (status: PaymentStatus) =>
    db.payments.filter((p) => p.status === status).length;
  const paid = sum('paid');
  const pending = sum('pending');
  const overdue = sum('overdue');
  return {
    total: paid + pending + overdue,
    paid,
    pending,
    overdue,
    paidCount: count('paid'),
    pendingCount: count('pending'),
    overdueCount: count('overdue'),
    outstanding: pending + overdue,
  };
}

/* ------------------------------------------------------------------ */
/* Recent activity feed                                                */
/* ------------------------------------------------------------------ */

export interface ActivityItem {
  id: string;
  kind: 'announcement' | 'grade' | 'payment' | 'attendance' | 'homework';
  title: string;
  detail: string;
  at: string;
}

/** A merged "recent activities" feed derived from the live collections. */
export function recentActivities(db: Database, limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const announcement of db.announcements) {
    items.push({
      id: `act-${announcement.id}`,
      kind: 'announcement',
      title: announcement.title,
      detail: `اطلاعیه برای «${ANNOUNCEMENT_AUDIENCE_LABELS[announcement.audience]}» منتشر شد`,
      at: announcement.createdAt,
    });
  }
  for (const grade of db.grades) {
    const student = db.students.find((s) => s.id === grade.studentId);
    const subject = db.subjects.find((s) => s.id === grade.subjectId);
    items.push({
      id: `act-${grade.id}`,
      kind: 'grade',
      title: `ثبت نمره ${subject?.name ?? ''} — ${student?.name ?? ''}`,
      detail: `نمره ${formatScore(grade.score)} از ${formatScore(grade.maxScore)} (${grade.title})`,
      at: `${grade.date}T12:00:00`,
    });
  }
  for (const payment of db.payments) {
    if (!payment.paidAt) continue;
    const student = db.students.find((s) => s.id === payment.studentId);
    items.push({
      id: `act-${payment.id}`,
      kind: 'payment',
      title: `پرداخت ${payment.title} — ${student?.name ?? ''}`,
      detail: `${formatToman(payment.amount)} پرداخت شد`,
      at: payment.paidAt,
    });
  }
  for (const homework of db.homework) {
    items.push({
      id: `act-${homework.id}`,
      kind: 'homework',
      title: `تکلیف جدید: ${homework.title}`,
      detail: `مهلت تحویل ${formatJalali(homework.dueDate)}`,
      at: `${homework.assignedAt}T09:00:00`,
    });
  }
  for (const record of db.attendance) {
    if (record.status !== 'absent') continue;
    const student = db.students.find((s) => s.id === record.studentId);
    items.push({
      id: `act-${record.id}`,
      kind: 'attendance',
      title: `غیبت ${student?.name ?? ''}`,
      detail: record.note ?? 'غیبت ثبت شد',
      at: `${record.date}T08:00:00`,
    });
  }

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Homework submission status                                          */
/* ------------------------------------------------------------------ */

export interface SubmissionRow {
  student: {
    id: string;
    name: string;
    avatarColor: string;
  };
  submitted: boolean;
  score?: number;
}

export interface HomeworkSubmission {
  total: number;
  submitted: number;
  pending: number;
  percent: number;
  rows: SubmissionRow[];
}

/**
 * Derives the submission state of a homework assignment from the
 * in-memory data: a student counts as "submitted" once a grade for the
 * same class + subject has been recorded on or after the assignment date.
 * No storage is involved — everything is recomputed from `db`.
 */
export function homeworkSubmission(db: Database, homework: Homework): HomeworkSubmission {
  const students = db.students.filter((student) => student.classId === homework.classId);
  const rows: SubmissionRow[] = students.map((student) => {
    const grade = db.grades.find(
      (item) =>
        item.studentId === student.id &&
        item.classId === homework.classId &&
        item.subjectId === homework.subjectId &&
        item.date >= homework.assignedAt,
    );
    return {
      student: { id: student.id, name: student.name, avatarColor: student.avatarColor },
      submitted: grade !== undefined,
      score: grade?.score,
    };
  });
  const submitted = rows.filter((row) => row.submitted).length;
  return {
    total: rows.length,
    submitted,
    pending: rows.length - submitted,
    percent: rows.length === 0 ? 0 : Math.round((submitted / rows.length) * 100),
    rows,
  };
}
