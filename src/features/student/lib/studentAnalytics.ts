/**
 * Student feature — pure derivation & analytics helpers.
 *
 * Every helper takes the live `Database` snapshot from `useData()` (never a
 * module-level cached copy), so any change made in the Admin or Parent panel
 * during the current session is immediately reflected across the student UI.
 *
 * Strictly frontend-only: zero storage APIs, zero network calls.
 */

import type { Database } from '../../../data';
import type {
  Announcement,
  AnnouncementPriority,
  Attendance,
  AttendanceStatus,
  Grade,
  GradeType,
  Homework,
  Parent,
  ScheduleEntry,
  SchoolClass,
  Student,
  Subject,
  Teacher,
  User,
  Weekday,
} from '../../../types';
import { WEEKDAY_LABELS } from '../../../types';
import { parseDate, toPersianDigits } from '../../../utils';

/* -------------------------------------------------------------------------- */
/*                            Constants & metadata                            */
/* -------------------------------------------------------------------------- */

export const ACADEMIC_YEAR_LABEL = '۱۴۰۵–۱۴۰۴';
export const SCHOOL_NAME_LABEL = 'دبیرستان نمونه دولتی شهید بهشتی';
export const PASSING_SCORE = 10;

export const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  quiz: 'آزمون کلاسی',
  assignment: 'تکلیف / فعالیت',
  midterm: 'میان‌ترم',
  final: 'پایان‌ترم',
};

export const ATTENDANCE_STATUS_META: Record<
  AttendanceStatus,
  {
    label: string;
    badge: 'success' | 'warning' | 'danger' | 'info';
    description: string;
  }
> = {
  present: {
    label: 'حاضر',
    badge: 'success',
    description: 'حضور کامل و به‌موقع در کلاس',
  },
  late: {
    label: 'تأخیر',
    badge: 'warning',
    description: 'ورود با تأخیر به کلاس درس',
  },
  absent: {
    label: 'غایب',
    badge: 'danger',
    description: 'عدم حضور ثبت‌شده در جلسه',
  },
  excused: {
    label: 'غیبت موجه',
    badge: 'info',
    description: 'غیبت با گواهی یا اطلاع قبلی ولی',
  },
};

export const PRIORITY_META: Record<
  AnnouncementPriority,
  { label: string; badge: 'danger' | 'warning' | 'neutral' }
> = {
  urgent: { label: 'فوری', badge: 'danger' },
  important: { label: 'مهم', badge: 'warning' },
  normal: { label: 'عادی', badge: 'neutral' },
};

export const PARENT_RELATION_LABELS: Record<Parent['relation'], string> = {
  father: 'پدر',
  mother: 'مادر',
  guardian: 'سرپرست قانونی',
};

const SUBJECT_PALETTE = [
  '#2563EB', // Primary Blue
  '#0EA5E9', // Info Sky
  '#16A34A', // Success Green
  '#1E3A8A', // Dark Navy
  '#F59E0B', // Warning Amber
  '#0284C7',
  '#1D4ED8',
  '#059669',
] as const;

export function pickSubjectColor(index: number): string {
  return SUBJECT_PALETTE[Math.abs(index) % SUBJECT_PALETTE.length];
}

/* -------------------------------------------------------------------------- */
/*                               Math & numbers                               */
/* -------------------------------------------------------------------------- */

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

/** Persian decimal formatting with up to 2 decimals, e.g. ۱۸٫۷۵ or ۱۹ */
export function formatPersianDecimal(value: number, maxDecimals = 2): string {
  const rounded = round(value, maxDecimals);
  const formatted = rounded
    .toFixed(maxDecimals)
    .replace(/\.?0+$/, '')
    .replace('.', '٫');
  return toPersianDigits(formatted);
}

/** Persian percentage, e.g. «٪۹۲٫۵» or «۹۲٫۵٪» */
export function formatPersianPercent(value: number, maxDecimals = 1): string {
  return `${formatPersianDecimal(value, maxDecimals)}٪`;
}

/** Normalize any grade score to a 20-point scale. */
export function scoreOutOf20(grade: Grade): number {
  if (grade.maxScore <= 0) return 0;
  return round((grade.score / grade.maxScore) * 20, 2);
}

/** Contract §6 grade badge tone: ≥17 success · 12–17 warning · <12 danger */
export function gradeBadgeVariant(score20: number): 'success' | 'warning' | 'danger' {
  if (score20 >= 17) return 'success';
  if (score20 >= 12) return 'warning';
  return 'danger';
}

export function gradeQualitativeLabel(score20: number): string {
  if (score20 >= 19) return 'عالی';
  if (score20 >= 17) return 'خیلی خوب';
  if (score20 >= 14) return 'خوب';
  if (score20 >= 12) return 'قابل قبول';
  if (score20 >= PASSING_SCORE) return 'مرز قبولی';
  return 'نیاز به تلاش بیشتر';
}

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetweenISO(fromISO: string, toISO: string): number {
  const from = parseDate(fromISO);
  const to = parseDate(toISO);
  const startUTC = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const endUTC = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((endUTC - startUTC) / 86_400_000);
}

/** Convert JavaScript Date.getDay() (0=Sun..6=Sat) to Persian school Weekday (0=Sat..5=Thu, null on Friday). */
export function currentPersianWeekday(now: Date = new Date()): Weekday | null {
  const jsDay = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (jsDay === 5) return null; // جمعه — تعطیل رسمی
  const mapped = jsDay === 6 ? 0 : jsDay + 1;
  return mapped as Weekday;
}

/* -------------------------------------------------------------------------- */
/*                         Student & dossier resolution                       */
/* -------------------------------------------------------------------------- */

export interface StudentDossier {
  student: Student;
  schoolClass?: SchoolClass;
  homeroomTeacher?: Teacher;
  guardian?: Parent;
  classmatesCount: number;
  classRank: number;
  classAverageGpa: number;
}

/**
 * Resolve the signed-in `User` (`u-student` in demo accounts) to the matching
 * centralized `Student` record (`s-01` سارا محمدی, or any student account).
 */
export function resolveStudentRecord(db: Database, user: User | null): Student | undefined {
  if (!user) return undefined;
  const byDirectId = db.students.find((s) => s.id === user.id);
  if (byDirectId) return byDirectId;

  const byPhone = db.students.find((s) => s.phone === user.phone);
  if (byPhone) return byPhone;

  const byNameAndClass = user.classId
    ? db.students.find((s) => s.name === user.name && s.classId === user.classId)
    : undefined;
  if (byNameAndClass) return byNameAndClass;

  const byName = db.students.find((s) => s.name === user.name);
  if (byName) return byName;

  if (user.classId) {
    const firstInClass = db.students.find((s) => s.classId === user.classId);
    if (firstInClass) return firstInClass;
  }

  return db.students[0];
}

/** Compute effective GPA for a student: live weighted grades if present, otherwise student.gpa. */
export function computeEffectiveGpa(db: Database, student: Student): number {
  const grades = db.grades.filter((g) => g.studentId === student.id);
  if (grades.length === 0) return student.gpa;

  let weightedSum = 0;
  let totalWeight = 0;
  for (const grade of grades) {
    const coeff = db.subjects.find((sub) => sub.id === grade.subjectId)?.coefficient ?? 1;
    weightedSum += scoreOutOf20(grade) * coeff;
    totalWeight += coeff;
  }
  return totalWeight > 0 ? round(weightedSum / totalWeight, 2) : student.gpa;
}

export function buildStudentDossier(db: Database, student: Student): StudentDossier {
  const schoolClass = db.classes.find((c) => c.id === student.classId);
  const homeroomTeacher = schoolClass
    ? db.teachers.find((t) => t.id === schoolClass.homeroomTeacherId)
    : undefined;
  const guardian =
    db.parents.find((p) => p.studentIds.includes(student.id)) ??
    db.parents.find((p) => p.phone === student.guardianPhone || p.name === student.guardianName);

  const classmates = db.students.filter((s) => s.classId === student.classId);
  const ranked = [...classmates]
    .map((mate) => ({ id: mate.id, gpa: computeEffectiveGpa(db, mate) }))
    .sort((a, b) => b.gpa - a.gpa);

  const rankIndex = ranked.findIndex((item) => item.id === student.id);
  const classAverageGpa = round(average(ranked.map((r) => r.gpa)), 2);

  return {
    student,
    schoolClass,
    homeroomTeacher,
    guardian,
    classmatesCount: classmates.length,
    classRank: rankIndex >= 0 ? rankIndex + 1 : 1,
    classAverageGpa,
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Grades                                   */
/* -------------------------------------------------------------------------- */

export interface EnrichedGrade {
  grade: Grade;
  score20: number;
  subject?: Subject;
  subjectName: string;
  subjectCode: string;
  coefficient: number;
  teacher?: Teacher;
  teacherName: string;
  deltaFromPrevious?: number;
}

export interface SubjectGradeSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  coefficient: number;
  weeklyHours: number;
  teacherName: string;
  gradesCount: number;
  average: number;
  classAverage: number;
  highest: number;
  lowest: number;
  latestGrade?: EnrichedGrade;
  trendDelta?: number;
  color: string;
}

export interface StudentAcademicSummary {
  /** Live weighted GPA computed from `db.grades` (falls back to `student.gpa` if no grades). */
  weightedAverage: number;
  /** Simple unweighted mean of recorded grades (out of 20). */
  simpleAverage: number;
  /** Official record GPA on `student.gpa` (updated if admin edits student profile). */
  recordedGpa: number;
  totalGrades: number;
  totalCoefficients: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  grades: EnrichedGrade[];
  subjectSummaries: SubjectGradeSummary[];
  allClassSubjects: SubjectGradeSummary[];
  recentChanges: Array<{
    grade: EnrichedGrade;
    previousScore?: number;
    delta?: number;
  }>;
  progressSeries: Array<{
    index: number;
    label: string;
    date: string;
    title: string;
    subjectName: string;
    score: number;
    rollingAverage: number;
  }>;
}

export function buildStudentAcademicSummary(
  db: Database,
  student: Student,
): StudentAcademicSummary {
  const rawGrades = db.grades.filter((g) => g.studentId === student.id);

  // Sort chronologically ascending first to compute per-subject deltas
  const ascGrades = [...rawGrades].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );

  const lastBySubject = new Map<string, number>();
  const enrichedAsc: EnrichedGrade[] = ascGrades.map((grade) => {
    const subject = db.subjects.find((s) => s.id === grade.subjectId);
    const teacher =
      db.teachers.find((t) => t.id === grade.teacherId) ??
      (subject ? db.teachers.find((t) => t.id === subject.teacherId) : undefined);
    const s20 = scoreOutOf20(grade);
    const prev = lastBySubject.get(grade.subjectId);
    const delta = prev !== undefined ? round(s20 - prev, 2) : undefined;
    lastBySubject.set(grade.subjectId, s20);

    return {
      grade,
      score20: s20,
      subject,
      subjectName: subject?.name ?? 'درس نامشخص',
      subjectCode: subject?.code ?? '—',
      coefficient: subject?.coefficient ?? 1,
      teacher,
      teacherName: teacher?.name ?? '—',
      deltaFromPrevious: delta,
    };
  });

  // Descending (newest first) for tables & feeds
  const grades = [...enrichedAsc].reverse();

  const scores = enrichedAsc.map((item) => item.score20);
  const simpleAverage = scores.length > 0 ? round(average(scores), 2) : student.gpa;
  const weightedAverage = computeEffectiveGpa(db, student);
  const highestScore = scores.length > 0 ? Math.max(...scores) : student.gpa;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : student.gpa;
  const passedCount = scores.filter((s) => s >= PASSING_SCORE).length;

  // Subjects taught in the student's class (schedule + graded subjects)
  const classSubjectIds = new Set<string>();
  for (const entry of db.schedule) {
    if (entry.classId === student.classId) classSubjectIds.add(entry.subjectId);
  }
  for (const g of rawGrades) {
    classSubjectIds.add(g.subjectId);
  }

  const classSubjects = db.subjects.filter((s) => classSubjectIds.has(s.id));

  const buildSubjectSummary = (subject: Subject, index: number): SubjectGradeSummary => {
    const subGradesAsc = enrichedAsc.filter((g) => g.grade.subjectId === subject.id);
    const subScores = subGradesAsc.map((g) => g.score20);
    const teacher = db.teachers.find((t) => t.id === subject.teacherId);

    const classGradesForSub = db.grades.filter(
      (g) => g.classId === student.classId && g.subjectId === subject.id,
    );
    const classAvg =
      classGradesForSub.length > 0 ? round(average(classGradesForSub.map(scoreOutOf20)), 2) : 0;

    const latest = subGradesAsc[subGradesAsc.length - 1];
    const previous = subGradesAsc.length >= 2 ? subGradesAsc[subGradesAsc.length - 2] : undefined;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      coefficient: subject.coefficient,
      weeklyHours: subject.weeklyHours,
      teacherName: teacher?.name ?? '—',
      gradesCount: subGradesAsc.length,
      average: subScores.length > 0 ? round(average(subScores), 2) : 0,
      classAverage: classAvg,
      highest: subScores.length > 0 ? Math.max(...subScores) : 0,
      lowest: subScores.length > 0 ? Math.min(...subScores) : 0,
      latestGrade: latest,
      trendDelta: latest && previous ? round(latest.score20 - previous.score20, 2) : undefined,
      color: pickSubjectColor(index),
    };
  };

  const allClassSubjects = classSubjects.map((subject, idx) => buildSubjectSummary(subject, idx));
  const subjectSummaries = allClassSubjects
    .filter((item) => item.gradesCount > 0)
    .sort((a, b) => b.average - a.average);

  const totalCoefficients = allClassSubjects.reduce((sum, item) => sum + item.coefficient, 0);

  // Recent grade changes: compare against previous grade in same subject or overall average
  const recentChanges = grades.map((enriched) => {
    const previousScore =
      enriched.deltaFromPrevious !== undefined
        ? round(enriched.score20 - enriched.deltaFromPrevious, 2)
        : undefined;
    const delta =
      enriched.deltaFromPrevious !== undefined
        ? enriched.deltaFromPrevious
        : round(enriched.score20 - weightedAverage, 2);
    return {
      grade: enriched,
      previousScore,
      delta,
    };
  });

  // Chronological progress series
  const running: number[] = [];
  const progressSeries = enrichedAsc.map((item, idx) => {
    running.push(item.score20);
    return {
      index: idx + 1,
      label: `${item.subjectName} (${toPersianDigits(idx + 1)})`,
      date: item.grade.date,
      title: item.grade.title,
      subjectName: item.subjectName,
      score: item.score20,
      rollingAverage: round(average(running), 2),
    };
  });

  return {
    weightedAverage,
    simpleAverage,
    recordedGpa: student.gpa,
    totalGrades: grades.length,
    totalCoefficients,
    highestScore,
    lowestScore,
    passedCount,
    grades,
    subjectSummaries,
    allClassSubjects,
    recentChanges,
    progressSeries,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Schedule                                  */
/* -------------------------------------------------------------------------- */

export interface EnrichedScheduleEntry {
  entry: ScheduleEntry;
  dayLabel: string;
  subject?: Subject;
  subjectName: string;
  subjectCode: string;
  teacher?: Teacher;
  teacherName: string;
  color: string;
}

export interface DayScheduleGroup {
  day: Weekday;
  dayLabel: string;
  entries: EnrichedScheduleEntry[];
}

export function buildClassSchedule(
  db: Database,
  classId: string,
): {
  entries: EnrichedScheduleEntry[];
  byDay: DayScheduleGroup[];
  periods: Array<{ period: number; start: string; end: string }>;
  totalWeeklyPeriods: number;
  uniqueSubjectsCount: number;
} {
  const subjectOrder = db.subjects.map((s) => s.id);

  const raw = db.schedule
    .filter((item) => item.classId === classId)
    .sort((a, b) => a.day - b.day || a.period - b.period);

  const entries: EnrichedScheduleEntry[] = raw.map((entry) => {
    const subject = db.subjects.find((s) => s.id === entry.subjectId);
    const teacher = db.teachers.find((t) => t.id === entry.teacherId);
    const colorIdx = Math.max(0, subjectOrder.indexOf(entry.subjectId));
    return {
      entry,
      dayLabel: WEEKDAY_LABELS[entry.day],
      subject,
      subjectName: subject?.name ?? '—',
      subjectCode: subject?.code ?? '—',
      teacher,
      teacherName: teacher?.name ?? '—',
      color: pickSubjectColor(colorIdx),
    };
  });

  const days: Weekday[] = [0, 1, 2, 3, 4, 5];
  const byDay: DayScheduleGroup[] = days.map((day) => ({
    day,
    dayLabel: WEEKDAY_LABELS[day],
    entries: entries.filter((e) => e.entry.day === day),
  }));

  const periodMap = new Map<number, { period: number; start: string; end: string }>();
  for (const item of raw) {
    if (!periodMap.has(item.period)) {
      periodMap.set(item.period, {
        period: item.period,
        start: item.start,
        end: item.end,
      });
    }
  }
  const periods = [...periodMap.values()].sort((a, b) => a.period - b.period);
  const uniqueSubjectsCount = new Set(raw.map((r) => r.subjectId)).size;

  return {
    entries,
    byDay,
    periods,
    totalWeeklyPeriods: entries.length,
    uniqueSubjectsCount,
  };
}

/** Pick upcoming classes relative to current weekday & time (falls back to Saturday if Friday/after hours). */
export function getUpcomingClasses(
  db: Database,
  classId: string,
  limit = 4,
  now: Date = new Date(),
): {
  referenceDayLabel: string;
  isToday: boolean;
  items: EnrichedScheduleEntry[];
} {
  const { entries } = buildClassSchedule(db, classId);
  if (entries.length === 0) {
    return { referenceDayLabel: WEEKDAY_LABELS[0], isToday: false, items: [] };
  }

  const todayWeekday = currentPersianWeekday(now);
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (todayWeekday !== null) {
    const remainingToday = entries.filter(
      (e) => e.entry.day === todayWeekday && e.entry.end >= nowHHMM,
    );
    if (remainingToday.length > 0) {
      return {
        referenceDayLabel: `امروز (${WEEKDAY_LABELS[todayWeekday]})`,
        isToday: true,
        items: remainingToday.slice(0, limit),
      };
    }
    const todayAll = entries.filter((e) => e.entry.day === todayWeekday);
    // Find next school day with classes
    for (let offset = 1; offset <= 6; offset += 1) {
      const candidateDay = ((todayWeekday + offset) % 6) as Weekday;
      const nextEntries = entries.filter((e) => e.entry.day === candidateDay);
      if (nextEntries.length > 0) {
        return {
          referenceDayLabel:
            offset === 1 && todayWeekday < 5
              ? `فردا (${WEEKDAY_LABELS[candidateDay]})`
              : `روز آینده (${WEEKDAY_LABELS[candidateDay]})`,
          isToday: false,
          items: nextEntries.slice(0, limit),
        };
      }
    }
    if (todayAll.length > 0) {
      return {
        referenceDayLabel: WEEKDAY_LABELS[todayWeekday],
        isToday: true,
        items: todayAll.slice(0, limit),
      };
    }
  }

  // Friday or fallback: Saturday classes
  const saturday = entries.filter((e) => e.entry.day === 0);
  return {
    referenceDayLabel: `شنبه آینده`,
    isToday: false,
    items: (saturday.length > 0 ? saturday : entries).slice(0, limit),
  };
}

/* -------------------------------------------------------------------------- */
/*                                 Attendance                                 */
/* -------------------------------------------------------------------------- */

export interface EnrichedAttendance {
  record: Attendance;
  subjectName: string;
  teacherName: string;
}

export interface StudentAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  /** (present + late + excused) / total * 100 — consistent with Parent dashboard */
  attendanceRate: number;
  /** Strict on-time presence percentage */
  punctualityRate: number;
  records: EnrichedAttendance[];
}

export function buildStudentAttendanceSummary(
  db: Database,
  studentId: string,
): StudentAttendanceSummary {
  const raw = db.attendance
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const present = raw.filter((a) => a.status === 'present').length;
  const absent = raw.filter((a) => a.status === 'absent').length;
  const late = raw.filter((a) => a.status === 'late').length;
  const excused = raw.filter((a) => a.status === 'excused').length;
  const total = raw.length;

  const attended = present + late + excused;
  const attendanceRate = total > 0 ? round((attended / total) * 100, 1) : 100;
  const punctualityRate = total > 0 ? round((present / total) * 100, 1) : 100;

  const records: EnrichedAttendance[] = raw.map((record) => {
    const subject = db.subjects.find((s) => s.id === record.subjectId);
    const teacher = subject ? db.teachers.find((t) => t.id === subject.teacherId) : undefined;
    return {
      record,
      subjectName: subject?.name ?? 'عمومی کلاس',
      teacherName: teacher?.name ?? '—',
    };
  });

  return {
    total,
    present,
    absent,
    late,
    excused,
    attendanceRate,
    punctualityRate,
    records,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Homework                                  */
/* -------------------------------------------------------------------------- */

export type HomeworkSubmissionStatus = 'submitted' | 'graded' | 'due_soon' | 'pending' | 'overdue';

export interface SimulatedSubmission {
  homeworkId: string;
  submittedAt: string;
  answerText: string;
  attachmentName?: string;
}

export interface EnrichedHomework {
  homework: Homework;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  status: HomeworkSubmissionStatus;
  daysRemaining: number;
  simulatedSubmission?: SimulatedSubmission;
  recordedGrade?: Grade;
}

export const HOMEWORK_STATUS_META: Record<
  HomeworkSubmissionStatus,
  { label: string; badge: 'success' | 'primary' | 'warning' | 'info' | 'danger' }
> = {
  graded: { label: 'نمره‌دهی‌شده', badge: 'success' },
  submitted: { label: 'تحویل‌داده‌شده', badge: 'primary' },
  due_soon: { label: 'نزدیک به مهلت', badge: 'warning' },
  pending: { label: 'در انتظار تحویل', badge: 'info' },
  overdue: { label: 'مهلت گذشته', badge: 'danger' },
};

export function buildStudentHomeworkList(
  db: Database,
  student: Student,
  submissions: Record<string, SimulatedSubmission>,
  today: string = todayISO(),
): EnrichedHomework[] {
  const classHomework = db.homework.filter((hw) => hw.classId === student.classId);

  return classHomework
    .map((homework) => {
      const subject = db.subjects.find((s) => s.id === homework.subjectId);
      const teacher = db.teachers.find((t) => t.id === homework.teacherId);
      const daysRemaining = daysBetweenISO(today, homework.dueDate);
      const simulatedSubmission = submissions[homework.id];

      // Check if teacher/admin recorded an assignment grade on or after assignedAt
      const recordedGrade = db.grades.find(
        (g) =>
          g.studentId === student.id &&
          g.subjectId === homework.subjectId &&
          g.type === 'assignment' &&
          g.date >= homework.assignedAt,
      );

      let status: HomeworkSubmissionStatus;
      if (recordedGrade) {
        status = 'graded';
      } else if (simulatedSubmission) {
        status = 'submitted';
      } else if (daysRemaining < 0) {
        status = 'overdue';
      } else if (daysRemaining <= 2) {
        status = 'due_soon';
      } else {
        status = 'pending';
      }

      return {
        homework,
        subjectName: subject?.name ?? '—',
        subjectCode: subject?.code ?? '—',
        teacherName: teacher?.name ?? '—',
        status,
        daysRemaining,
        simulatedSubmission,
        recordedGrade,
      };
    })
    .sort((a, b) => {
      const order: Record<HomeworkSubmissionStatus, number> = {
        overdue: 0,
        due_soon: 1,
        pending: 2,
        submitted: 3,
        graded: 4,
      };
      return (
        order[a.status] - order[b.status] || a.homework.dueDate.localeCompare(b.homework.dueDate)
      );
    });
}

/* -------------------------------------------------------------------------- */
/*                                Announcements                               */
/* -------------------------------------------------------------------------- */

export type AnnouncementCategory = 'exam' | 'event' | 'holiday' | 'general';

export const ANNOUNCEMENT_CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  exam: 'امتحانات و ارزشیابی',
  holiday: 'وضعیت تشکیل کلاس‌ها',
  event: 'اردو و فرهنگی',
  general: 'اطلاعیه عمومی',
};

export function inferAnnouncementCategory(item: Announcement): AnnouncementCategory {
  const text = `${item.title} ${item.body}`;
  if (text.includes('آزمون') || text.includes('امتحان') || text.includes('کارنامه')) {
    return 'exam';
  }
  if (text.includes('تعطیل') || text.includes('مجازی') || text.includes('برودت')) {
    return 'holiday';
  }
  if (
    text.includes('اردو') ||
    text.includes('مسابق') ||
    text.includes('جشنواره') ||
    text.includes('کتاب')
  ) {
    return 'event';
  }
  return 'general';
}

export interface EnrichedAnnouncement {
  announcement: Announcement;
  category: AnnouncementCategory;
  categoryLabel: string;
  isRead: boolean;
}

export function buildStudentAnnouncements(
  db: Database,
  readAnnouncementIds: ReadonlySet<string>,
): EnrichedAnnouncement[] {
  return db.announcements
    .filter((item) => item.audience === 'all' || item.audience === 'students')
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
    .map((announcement) => {
      const category = inferAnnouncementCategory(announcement);
      return {
        announcement,
        category,
        categoryLabel: ANNOUNCEMENT_CATEGORY_LABELS[category],
        isRead: readAnnouncementIds.has(announcement.id),
      };
    });
}
