/**
 * Demo family extension — ONE extra child for the demo parent account.
 *
 * Why this exists
 * ---------------
 * `src/data/users.ts` links the demo parent (`u-parent`) to a single child
 * (`s-01`), so the multi-child features required by UH-04 (child selector,
 * sibling comparison) would have nothing to display.
 *
 * `src/data` is owned by the team lead and must not be modified by feature
 * teams, so instead of duplicating a student record we inject ONE additional
 * child into the **shared in-memory database** at session start. The injected
 * record then behaves exactly like the seeded ones for every consumer (it is
 * the same `db.students` entry — not a parallel copy), and it disappears on
 * reload together with the rest of the demo data.
 *
 * Recommended follow-up for the team lead (optional, then delete this file):
 *   - add `s-25` to `src/data/students.ts`
 *   - add `'s-25'` to the demo parent's `studentIds` in `src/data/users.ts`
 *   - add the grades / attendance / payments below to their seed files
 */
import type { Attendance, Grade, Payment, Student } from '../../../types';

/** The demo parent's second child. */
export const DEMO_SECOND_CHILD: Student = {
  id: 's-25',
  studentCode: '14021025',
  name: 'علی محمدی',
  classId: 'c-01',
  gradeLevel: 'دهم',
  field: 'ریاضی',
  phone: '09191111025',
  guardianName: 'زهرا کریمی',
  guardianPhone: '09121120001',
  status: 'active',
  gpa: 16.1,
  enrolledAt: '2026-09-21',
  avatarColor: '#0EA5E9',
};

/** Attendance for the second child (includes one absence + one late arrival). */
export const DEMO_SECOND_CHILD_ATTENDANCE: Attendance[] = [
  { id: 'att-x-01', studentId: 's-25', classId: 'c-01', subjectId: 'sub-01', date: '2026-11-15', status: 'present' },
  { id: 'att-x-02', studentId: 's-25', classId: 'c-01', subjectId: 'sub-03', date: '2026-11-16', status: 'present' },
  { id: 'att-x-03', studentId: 's-25', classId: 'c-01', subjectId: 'sub-06', date: '2026-11-17', status: 'present' },
  {
    id: 'att-x-04',
    studentId: 's-25',
    classId: 'c-01',
    subjectId: 'sub-01',
    date: '2026-11-18',
    status: 'absent',
    note: 'غیبت بدون اطلاع قبلی',
  },
  {
    id: 'att-x-05',
    studentId: 's-25',
    classId: 'c-01',
    subjectId: 'sub-05',
    date: '2026-11-22',
    status: 'late',
    note: 'تأخیر ۱۵ دقیقه‌ای',
  },
];

/** Grades for the second child, so comparisons and charts have real data. */
export const DEMO_SECOND_CHILD_GRADES: Grade[] = [
  {
    id: 'g-x-01',
    studentId: 's-25',
    subjectId: 'sub-01',
    classId: 'c-01',
    teacherId: 't-01',
    title: 'آزمون کلاسی ۱',
    type: 'quiz',
    score: 16.5,
    maxScore: 20,
    date: '2026-10-07',
  },
  {
    id: 'g-x-02',
    studentId: 's-25',
    subjectId: 'sub-03',
    classId: 'c-01',
    teacherId: 't-03',
    title: 'میان‌ترم',
    type: 'midterm',
    score: 17.25,
    maxScore: 20,
    date: '2026-11-04',
  },
  {
    id: 'g-x-03',
    studentId: 's-25',
    subjectId: 'sub-06',
    classId: 'c-01',
    teacherId: 't-07',
    title: 'تکلیف فصل ۱',
    type: 'assignment',
    score: 14.5,
    maxScore: 20,
    date: '2026-10-18',
  },
];

/** One paid + one pending invoice for the second child. */
export const DEMO_SECOND_CHILD_PAYMENTS: Payment[] = [
  {
    id: 'pay-x-01',
    studentId: 's-25',
    title: 'کتاب و لوازم‌التحریر',
    amount: 950_000,
    dueDate: '2026-10-20',
    paidAt: '2026-10-17T11:05:00',
    status: 'paid',
    method: 'online',
  },
  {
    id: 'pay-x-02',
    studentId: 's-25',
    title: 'شهریه نوبت اول',
    amount: 4_800_000,
    dueDate: '2026-12-10',
    status: 'pending',
  },
];

/** True when the second child (or its data) already exists in a collection. */
export const hasSecondChild = (items: Array<{ id: string }>): boolean =>
  items.some((item) => item.id === DEMO_SECOND_CHILD.id) ||
  items.some((item) => item.id.startsWith('att-x-')) ||
  items.some((item) => item.id.startsWith('g-x-')) ||
  items.some((item) => item.id.startsWith('pay-x-'));
