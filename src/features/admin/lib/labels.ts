/**
 * Admin feature — Persian labels & small shared helpers.
 *
 * Everything here is presentation-only: it maps the shared domain enums
 * (src/types) to the Persian wording + <Badge> variants used across the
 * admin dashboard, so every page renders statuses consistently.
 */
import type {
  AnnouncementAudience,
  AnnouncementPriority,
  AttendanceStatus,
  GradeType,
  PaymentMethod,
  PaymentStatus,
  StudentStatus,
  TeacherStatus,
} from '../../../types';
import type { BadgeVariant } from '../../../components';

/* ------------------------------------------------------------------ */
/* Badge label maps                                                    */
/* ------------------------------------------------------------------ */

export interface LabelEntry {
  label: string;
  variant: BadgeVariant;
}

export const STUDENT_STATUS_LABELS: Record<StudentStatus, LabelEntry> = {
  active: { label: 'فعال', variant: 'success' },
  suspended: { label: 'معلق', variant: 'danger' },
  graduated: { label: 'فارغ‌التحصیل', variant: 'info' },
};

export const TEACHER_STATUS_LABELS: Record<TeacherStatus, LabelEntry> = {
  active: { label: 'فعال', variant: 'success' },
  on_leave: { label: 'در مرخصی', variant: 'warning' },
  retired: { label: 'بازنشسته', variant: 'neutral' },
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, LabelEntry> = {
  present: { label: 'حاضر', variant: 'success' },
  absent: { label: 'غایب', variant: 'danger' },
  late: { label: 'دیرکرد', variant: 'warning' },
  excused: { label: 'موجه', variant: 'info' },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, LabelEntry> = {
  paid: { label: 'پرداخت‌شده', variant: 'success' },
  pending: { label: 'در انتظار', variant: 'warning' },
  overdue: { label: 'معوقه', variant: 'danger' },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'کارت بانکی',
  online: 'آنلاین',
  cash: 'نقدی',
  transfer: 'انتقال بانکی',
};

export const ANNOUNCEMENT_PRIORITY_LABELS: Record<AnnouncementPriority, LabelEntry> = {
  normal: { label: 'عادی', variant: 'neutral' },
  important: { label: 'مهم', variant: 'warning' },
  urgent: { label: 'فوری', variant: 'danger' },
};

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: 'همه',
  admins: 'مدیران',
  teachers: 'معلمان',
  students: 'دانش‌آموزان',
  parents: 'اولیا',
};

export const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  quiz: 'آزمون کلاسی',
  assignment: 'تکلیف',
  midterm: 'میان‌ترم',
  final: 'پایان‌ترم',
};

/* ------------------------------------------------------------------ */
/* Option lists                                                        */
/* ------------------------------------------------------------------ */

export const GRADE_LEVELS = ['دهم', 'یازدهم', 'دوازدهم'] as const;

export const FIELDS = ['ریاضی', 'تجربی', 'انسانی'] as const;

/** Avatar chip palette used for newly created students / teachers. */
export const AVATAR_PALETTE = [
  '#2563EB',
  '#16A34A',
  '#DC2626',
  '#F59E0B',
  '#0EA5E9',
  '#7C3AED',
  '#DB2777',
  '#059669',
] as const;

export function pickAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

/* ------------------------------------------------------------------ */
/* Small utilities                                                     */
/* ------------------------------------------------------------------ */

/** Local (not UTC) ISO date string `yyyy-mm-dd` for "today". */
export function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Short unique id for newly created records, e.g. `s-lx3k9q2`. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, '0')}`;
}

/** Badge variant for a score out of 20 (contract §6 mapping). */
export function gradeVariant(score: number): BadgeVariant {
  if (score >= 17) return 'success';
  if (score >= 12) return 'warning';
  return 'danger';
}

/** Iranian mobile number check (09xxxxxxxxx, Persian digits tolerated). */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  return /^09\d{9}$/.test(digits.trim());
}

/** Normalise Persian/Arabic digits to Latin digits. */
export function normalizeDigitsLocal(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (d) => {
    const fa = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
    if (fa !== -1) return String(fa);
    return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  });
}
