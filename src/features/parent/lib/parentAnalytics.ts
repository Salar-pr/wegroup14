/**
 * Parent dashboard — derivation helpers.
 *
 * Every function here is PURE: it receives the live `db` snapshot from
 * `useData()` (or slices of it) and returns derived view models.
 * No module-level caching of entities, so a grade / attendance / homework
 * change made anywhere in the app immediately shows up in the parent panel.
 */

import type {
  Attendance,
  Grade,
  Homework,
  Parent,
  Payment,
  SchoolClass,
  Student,
  Subject,
  Teacher,
} from '../../../types';
import type { Database } from '../../../data';
import { parseDate } from '../../../utils';

/* -------------------------------------------------------------------------- */
/*                                Basic maths                                 */
/* -------------------------------------------------------------------------- */

/** Average of a numeric list, or 0 for an empty list. */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Round to `decimals` places without floating point noise (e.g. 17.349 → 17.35). */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Persian score formatting with 2 smart decimals: ۱۸٫۷۵ / ۱۹ / ۱۹٫۵ */
export function scoreText(value: number): string {
  return round(value, 2).toLocaleString('fa-IR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Percentage (0–100) formatted for Persian UI: «۹۲٫۹٪» */
export function percentText(value: number, decimals = 1): string {
  return `${round(value, decimals).toLocaleString('fa-IR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })}٪`;
}

/** Clamp a number into a range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Grade tone thresholds (shared contract §6):
 * ≥17 success · 12–17 warning · <12 danger
 */
export function gradeTone(scoreOutOf20: number): 'success' | 'warning' | 'danger' {
  if (scoreOutOf20 >= 17) return 'success';
  if (scoreOutOf20 >= 12) return 'warning';
  return 'danger';
}

/* -------------------------------------------------------------------------- */
/*                              Children lookups                              */
/* -------------------------------------------------------------------------- */

/** Students linked to a parent account (parent → child relationship from mock data). */
export function getChildren(db: Database, studentIds: string[]): Student[] {
  return studentIds
    .map((id) => db.students.find((student) => student.id === id))
    .filter((student): student is Student => Boolean(student));
}

/** Percent every child still needs to keep the demo passing mark (10/20). */
export const PASSING_SCORE = 10;

/* -------------------------------------------------------------------------- */
/*                                   Grades                                   */
/* -------------------------------------------------------------------------- */

export interface SubjectAverage {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  /** Weighted by maxScore, scaled to 20. */
  average: number;
  coefficient: number;
  /** How many recorded grades this average is based on. */
  count: number;
  best: number;
  worst: number;
  /** Most recent grade of this subject (for trends / comparisons). */
  lastScore: number;
  lastTitle: string;
  lastDate: string;
  color: string;
}

const SERIES_COLORS = [
  '#2563EB', // primary
  '#0EA5E9', // info
  '#16A34A', // success
  '#F59E0B', // warning
  '#7C3AED',
  '#DB2777',
  '#0891B2',
  '#65A30D',
  '#DC2626',
  '#475569',
  '#9333EA',
  '#0284C7',
];

export function subjectColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

/** Score scaled to a 20-point base (maxScore is usually 20, but never assume). */
export function toTwenty(grade: Grade): number {
  if (grade.maxScore <= 0) return 0;
  return round((grade.score / grade.maxScore) * 20, 2);
}

export function sortGradesByDate(grades: Grade[]): Grade[] {
  return [...grades].sort((a, b) => b.date.localeCompare(a.date));
}

export interface AcademicSummary {
  /** Weighted overall average (0–20), the number shown as «معدل کل». */
  overallAverage: number;
  /** Simple (unweighted) average, used for comparisons. */
  simpleAverage: number;
  totalGrades: number;
  passedCount: number;
  failedCount: number;
  /** 0–100 */
  passRate: number;
  bestSubject?: SubjectAverage;
  weakestSubject?: SubjectAverage;
  /** Per-subject averages, sorted best → weakest. */
  subjects: SubjectAverage[];
  gradeList: Grade[];
  /** Mean score of the most recent third vs the older third (for the trend chip). */
  trendDelta: number;
  /** Recorded score distribution buckets for charts. */
  distribution: Array<{ label: string; count: number; tone: string }>;
}

export function buildAcademicSummary(
  db: Database,
  studentId: string,
): AcademicSummary {
  const gradeList = sortGradesByDate(db.grades.filter((grade) => grade.studentId === studentId));
  const totalGrades = gradeList.length;

  const scaled = gradeList.map((grade) => ({ grade, value: toTwenty(grade) }));
  const simpleAverage = round(average(scaled.map((item) => item.value)));

  // Weighted by subject coefficient (contract: coefficient is used for GPA).
  const coefficientOf = (subjectId: string): number =>
    db.subjects.find((subject) => subject.id === subjectId)?.coefficient ?? 1;

  const weightedSum = scaled.reduce(
    (sum, item) => sum + item.value * coefficientOf(item.grade.subjectId),
    0,
  );
  const weightTotal = scaled.reduce(
    (sum, item) => sum + coefficientOf(item.grade.subjectId),
    0,
  );
  const overallAverage = weightTotal > 0 ? round(weightedSum / weightTotal) : 0;

  const passedCount = scaled.filter((item) => item.value >= PASSING_SCORE).length;
  const failedCount = totalGrades - passedCount;

  // ---- group by subject ----
  const bySubject = new Map<string, Grade[]>();
  for (const grade of gradeList) {
    const list = bySubject.get(grade.subjectId) ?? [];
    list.push(grade);
    bySubject.set(grade.subjectId, list);
  }

  const subjects: SubjectAverage[] = Array.from(bySubject.entries()).map(
    ([subjectId, grades], index) => {
      const subject = db.subjects.find((item) => item.id === subjectId);
      const teacher = subject
        ? db.teachers.find((item) => item.id === subject.teacherId)
        : undefined;
      const values = grades.map(toTwenty);
      const chronological = [...grades].sort((a, b) => a.date.localeCompare(b.date));
      const last = chronological[chronological.length - 1];

      return {
        subjectId,
        subjectName: subject?.name ?? 'نامشخص',
        subjectCode: subject?.code ?? '—',
        teacherName: teacher?.name ?? '—',
        average: round(average(values)),
        coefficient: subject?.coefficient ?? 1,
        count: grades.length,
        best: Math.max(...values),
        worst: Math.min(...values),
        lastScore: toTwenty(last),
        lastTitle: last.title,
        lastDate: last.date,
        color: subjectColor(index),
      };
    },
  );

  const ranked = [...subjects].sort((a, b) => b.average - a.average);

  // ---- trend: newest third vs older third of the chronological list ----
  const chronological = [...scaled].sort((a, b) => a.grade.date.localeCompare(b.grade.date));
  const trendDelta =
    chronological.length >= 4
      ? round(
          average(chronological.slice(-2).map((item) => item.value)) -
            average(chronological.slice(0, 2).map((item) => item.value)),
        )
      : 0;

  const distribution = [
    { label: '۱۷ تا ۲۰', count: scaled.filter((item) => item.value >= 17).length, tone: 'success' },
    {
      label: '۱۴ تا ۱۷',
      count: scaled.filter((item) => item.value >= 14 && item.value < 17).length,
      tone: 'info',
    },
    {
      label: '۱۲ تا ۱۴',
      count: scaled.filter((item) => item.value >= 12 && item.value < 14).length,
      tone: 'warning',
    },
    { label: 'زیر ۱۲', count: scaled.filter((item) => item.value < 12).length, tone: 'danger' },
  ];

  return {
    overallAverage,
    simpleAverage,
    totalGrades,
    passedCount,
    failedCount,
    passRate: totalGrades > 0 ? round((passedCount / totalGrades) * 100, 1) : 0,
    bestSubject: ranked[0],
    weakestSubject: ranked.length > 1 ? ranked[ranked.length - 1] : undefined,
    subjects: ranked,
    gradeList,
    trendDelta,
    distribution,
  };
}

/** Chronological point for the progress line chart. */
export interface ProgressPoint {
  index: number;
  label: string;
  title: string;
  subjectName: string;
  score: number;
  date: string;
  /** Rolling mean up to this point — smooths the reading. */
  rolling: number;
}

export function buildProgressSeries(db: Database, studentId: string): ProgressPoint[] {
  const chronological = [...db.grades.filter((grade) => grade.studentId === studentId)].sort(
    (a, b) => a.date.localeCompare(b.date),
  );

  const values: number[] = [];
  return chronological.map((grade, index) => {
    const score = toTwenty(grade);
    values.push(score);
    return {
      index: index + 1,
      label: `نمره ${(index + 1).toLocaleString('fa-IR')}`,
      title: grade.title,
      subjectName: db.subjects.find((subject) => subject.id === grade.subjectId)?.name ?? '—',
      score,
      date: grade.date,
      rolling: round(average(values)),
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                                 Attendance                                 */
/* -------------------------------------------------------------------------- */

export interface AttendanceSummary {
  total: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  /** present + late + excused — i.e. days the student was actually accounted for. */
  attendedCount: number;
  /** 0–100, «درصد حضور» */
  rate: number;
  records: Attendance[];
  absences: Attendance[];
  lates: Attendance[];
  /** Per-record notes that carry a reason. */
  notes: Array<{ record: Attendance; subjectName: string }>;
}

export function buildAttendanceSummary(db: Database, studentId: string): AttendanceSummary {
  const records = db.attendance
    .filter((record) => record.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = records.filter((record) => record.status === 'present').length;
  const absentCount = records.filter((record) => record.status === 'absent').length;
  const lateCount = records.filter((record) => record.status === 'late').length;
  const excusedCount = records.filter((record) => record.status === 'excused').length;
  const total = records.length;
  const attendedCount = presentCount + lateCount + excusedCount;

  return {
    total,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    attendedCount,
    rate: total > 0 ? round((attendedCount / total) * 100, 1) : 0,
    records,
    absences: records.filter((record) => record.status === 'absent'),
    lates: records.filter((record) => record.status === 'late'),
    notes: records
      .filter((record) => Boolean(record.note))
      .map((record) => ({
        record,
        subjectName:
          db.subjects.find((subject) => subject.id === record.subjectId)?.name ?? '—',
      })),
  };
}

/**
 * Session-level flag: was the child absent on the most recent recorded day?
 * Used on the dashboard as an actionable «پیگیری غیبت» card — fixing the
 * record inside the panel removes the card immediately (shared state proof).
 */
export function buildDayMatrix(records: Attendance[]): Array<{
  date: string;
  status: Attendance['status'] | 'none';
}> {
  const byDate = new Map<string, Attendance['status']>();
  for (const record of records) {
    const current = byDate.get(record.date);
    // Worst status wins for a given day: absent > late > excused > present
    const priority: Record<Attendance['status'], number> = {
      absent: 4,
      late: 3,
      excused: 2,
      present: 1,
    };
    if (!current || priority[record.status] > priority[current]) {
      byDate.set(record.date, record.status);
    }
  }
  return Array.from(byDate.entries())
    .map(([date, status]) => ({ date, status }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* -------------------------------------------------------------------------- */
/*                                  Homework                                  */
/* -------------------------------------------------------------------------- */

export type HomeworkState = 'pending' | 'due-soon' | 'overdue' | 'completed';

export interface HomeworkItem {
  homework: Homework;
  subjectName: string;
  subjectColor: string;
  teacherName: string;
  state: HomeworkState;
  /** Whole days between today and the due date (negative = past due). */
  daysLeft: number;
  /** Submitted marks recorded in the gradebook for this homework (demo link). */
  submittedScore?: number;
}

/** Days are compared on a date-only basis so the demo is timezone safe. */
export function daysBetween(fromISO: string, toISO: string): number {
  const from = parseDate(fromISO);
  const to = parseDate(toISO);
  const dayFrom = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const dayTo = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((dayTo - dayFrom) / 86_400_000);
}

export function todayISO(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function buildHomeworkItems(
  db: Database,
  student: Student,
  options: { today?: string; completedIds?: string[]; dueSoonDays?: number } = {},
): HomeworkItem[] {
  const today = options.today ?? todayISO();
  const completedIds = options.completedIds ?? [];
  const dueSoonDays = options.dueSoonDays ?? 3;

  const subjectIndex = new Map(db.subjects.map((subject) => [subject.id, subject]));
  const order = Array.from(subjectIndex.keys());

  return db.homework
    .filter((homework) => homework.classId === student.classId)
    .map((homework) => {
      const subject = subjectIndex.get(homework.subjectId);
      const teacher = db.teachers.find((item) => item.id === homework.teacherId);
      const daysLeft = daysBetween(today, homework.dueDate);
      const submitted = db.grades.find(
        (grade) =>
          grade.studentId === student.id &&
          grade.subjectId === homework.subjectId &&
          grade.type === 'assignment',
      );

      let state: HomeworkState;
      if (completedIds.includes(homework.id)) state = 'completed';
      else if (daysLeft < 0) state = 'overdue';
      else if (daysLeft <= dueSoonDays) state = 'due-soon';
      else state = 'pending';

      return {
        homework,
        subjectName: subject?.name ?? '—',
        subjectColor: subjectColor(Math.max(0, order.indexOf(homework.subjectId))),
        teacherName: teacher?.name ?? '—',
        state,
        daysLeft,
        submittedScore: submitted ? toTwenty(submitted) : undefined,
      };
    })
    .sort((a, b) => {
      // Unfinished first, then by nearest deadline.
      const weight: Record<HomeworkState, number> = {
        overdue: 0,
        'due-soon': 1,
        pending: 2,
        completed: 3,
      };
      return weight[a.state] - weight[b.state] || a.daysLeft - b.daysLeft;
    });
}

export const HOMEWORK_STATE_META: Record<
  HomeworkState,
  { label: string; badge: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
> = {
  overdue: { label: 'مهلت گذشته', badge: 'danger' },
  'due-soon': { label: 'نزدیک مهلت', badge: 'warning' },
  pending: { label: 'در انتظار انجام', badge: 'info' },
  completed: { label: 'انجام‌شده', badge: 'success' },
};

/* -------------------------------------------------------------------------- */
/*                                  Payments                                  */
/* -------------------------------------------------------------------------- */

export interface FinanceSummary {
  payments: Payment[];
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  /** pending + overdue — «مانده بدهی» */
  outstandingAmount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  /** 0–100 */
  paidRatio: number;
  nextDue?: Payment;
  history: Payment[];
}

export function buildFinanceSummary(db: Database, studentId: string): FinanceSummary {
  const payments = [...db.payments]
    .filter((payment) => payment.studentId === studentId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const sumBy = (status: Payment['status']): number =>
    payments
      .filter((payment) => payment.status === status)
      .reduce((sum, payment) => sum + payment.amount, 0);

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = sumBy('paid');
  const pendingAmount = sumBy('pending');
  const overdueAmount = sumBy('overdue');

  const unpaid = payments.filter((payment) => payment.status !== 'paid');
  const nextDue = [...unpaid].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return {
    payments,
    totalAmount,
    paidAmount,
    pendingAmount,
    overdueAmount,
    outstandingAmount: pendingAmount + overdueAmount,
    paidCount: payments.filter((payment) => payment.status === 'paid').length,
    pendingCount: payments.filter((payment) => payment.status === 'pending').length,
    overdueCount: payments.filter((payment) => payment.status === 'overdue').length,
    paidRatio: totalAmount > 0 ? round((paidAmount / totalAmount) * 100, 1) : 0,
    nextDue,
    history: payments
      .filter((payment) => payment.status === 'paid')
      .sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? '')),
  };
}

export const PAYMENT_STATUS_META: Record<
  Payment['status'],
  { label: string; badge: 'success' | 'warning' | 'danger' }
> = {
  paid: { label: 'پرداخت‌شده', badge: 'success' },
  pending: { label: 'در انتظار پرداخت', badge: 'warning' },
  overdue: { label: 'معوقه', badge: 'danger' },
};

export const PAYMENT_METHOD_LABELS: Record<NonNullable<Payment['method']>, string> = {
  card: 'کارت بانکی',
  online: 'درگاه اینترنتی',
  cash: 'نقدی — دفتر مدرسه',
  transfer: 'انتقال بانکی',
};

/* -------------------------------------------------------------------------- */
/*                             Class & teachers                                */
/* -------------------------------------------------------------------------- */

export interface ChildClassInfo {
  schoolClass?: SchoolClass;
  homeroomTeacher?: Teacher;
  teachers: Array<{ teacher: Teacher; subjects: Subject[] }>;
  subjects: Subject[];
  classmates: number;
  weeklyHours: number;
}

export function buildClassInfo(db: Database, student: Student): ChildClassInfo {
  const schoolClass = db.classes.find((item) => item.id === student.classId);
  const homeroomTeacher = schoolClass
    ? db.teachers.find((teacher) => teacher.id === schoolClass.homeroomTeacherId)
    : undefined;

  // Subjects taught in this class: from the timetable + any subject a teacher
  // of this class teaches.
  const subjectIds = new Set<string>();
  for (const entry of db.schedule.filter((item) => item.classId === student.classId)) {
    subjectIds.add(entry.subjectId);
  }
  for (const teacher of db.teachers) {
    if (!teacher.classIds.includes(student.classId)) continue;
    for (const subjectId of teacher.subjectIds) subjectIds.add(subjectId);
  }

  const subjects = db.subjects.filter((subject) => subjectIds.has(subject.id));

  const teacherMap = new Map<string, Subject[]>();
  for (const subject of subjects) {
    const list = teacherMap.get(subject.teacherId) ?? [];
    list.push(subject);
    teacherMap.set(subject.teacherId, list);
  }

  const teachers = Array.from(teacherMap.entries())
    .map(([teacherId, teacherSubjects]) => ({
      teacher: db.teachers.find((item) => item.id === teacherId) as Teacher,
      subjects: teacherSubjects,
    }))
    .filter((item) => Boolean(item.teacher));

  return {
    schoolClass,
    homeroomTeacher,
    teachers,
    subjects,
    classmates: db.students.filter((item) => item.classId === student.classId).length,
    weeklyHours: subjects.reduce((sum, subject) => sum + subject.weeklyHours, 0),
  };
}

/* -------------------------------------------------------------------------- */
/*                                Announcements                               */
/* -------------------------------------------------------------------------- */

/** Announcements addressed to parents or to everyone (pinned first, newest next). */
export function parentAnnouncements(db: Database) {
  return db.announcements
    .filter((item) => item.audience === 'all' || item.audience === 'parents')
    .sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt),
    );
}

/** Teacher-authored announcements (not school-wide), shown as a separate tab. */
export function teacherAnnouncements(db: Database) {
  return parentAnnouncements(db).filter(
    (item) => item.authorName.includes('دبیر') || item.authorName.includes('معاون'),
  );
}

/* -------------------------------------------------------------------------- */
/*                              Parent performance                            */
/* -------------------------------------------------------------------------- */

/** Total graded lessons waiting for a parent to acknowledge (used on dashboard). */
export function unreadParentMessages(db: Database, parentUserId: string) {
  return db.messages.filter(
    (message) => message.to.id === parentUserId && !message.read,
  );
}

/* -------------------------------------------------------------------------- */
/*                            Parent record lookup                            */
/* -------------------------------------------------------------------------- */

/**
 * Resolve the `Parent` record for the signed-in user.
 * The demo session user (`u-parent`) is not the same id as the parent record
 * (`p-01`), so the record is matched through the shared parent→child links,
 * then by name, then by phone. No new records are created.
 */
export function resolveParentRecord(
  db: Database,
  user: { name: string; phone: string; studentIds?: string[] },
): Parent | undefined {
  const linkedIds = user.studentIds ?? [];
  const byChildren = db.parents.find((parent) =>
    parent.studentIds.some((studentId) => linkedIds.includes(studentId)),
  );
  if (byChildren) return byChildren;
  const byName = db.parents.find((parent) => parent.name === user.name);
  if (byName) return byName;
  return db.parents.find((parent) => parent.phone === user.phone);
}

/** Persian label for a parent relation. */
export const PARENT_RELATION_LABELS: Record<Parent['relation'], string> = {
  father: 'پدر',
  mother: 'مادر',
  guardian: 'سرپرست',
};
