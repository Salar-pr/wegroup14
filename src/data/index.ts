import type { Database } from './database';

export { demoAccounts, getDemoAccountByRole, findDemoAccountByCredentials } from './users';
export { mockStudents } from './students';
export { mockTeachers } from './teachers';
export { mockParents } from './parents';
export { mockClasses } from './classes';
export { mockSubjects } from './subjects';
export { mockGrades } from './grades';
export { mockAttendance } from './attendance';
export { mockHomework } from './homework';
export { mockAnnouncements } from './announcements';
export { mockPayments } from './payments';
export { mockMessages } from './messages';
export { mockSchedule } from './schedule';
export { createMockDatabase } from './database';
export type { Database } from './database';

/* ---------- Lookup helpers (work on snapshots; safe to use with `db` from context) ---------- */

export const getStudentById = (db: Database, id: string) =>
  db.students.find((student) => student.id === id);

export const getTeacherById = (db: Database, id: string) =>
  db.teachers.find((teacher) => teacher.id === id);

export const getParentById = (db: Database, id: string) =>
  db.parents.find((parent) => parent.id === id);

export const getClassById = (db: Database, id: string) =>
  db.classes.find((schoolClass) => schoolClass.id === id);

export const getSubjectById = (db: Database, id: string) =>
  db.subjects.find((subject) => subject.id === id);

export const getStudentsByClass = (db: Database, classId: string) =>
  db.students.filter((student) => student.classId === classId);

export const getGradesForStudent = (db: Database, studentId: string) =>
  db.grades.filter((grade) => grade.studentId === studentId);

export const getAttendanceForStudent = (db: Database, studentId: string) =>
  db.attendance.filter((record) => record.studentId === studentId);

export const getPaymentsForStudent = (db: Database, studentId: string) =>
  db.payments.filter((payment) => payment.studentId === studentId);

export const getMessagesForUser = (db: Database, userId: string) =>
  db.messages.filter((message) => message.to.id === userId || message.from.id === userId);

export const getUnreadMessagesForUser = (db: Database, userId: string) =>
  db.messages.filter((message) => message.to.id === userId && !message.read);

export const getScheduleForClass = (db: Database, classId: string) =>
  db.schedule
    .filter((entry) => entry.classId === classId)
    .sort((a, b) => a.day - b.day || a.period - b.period);

export const getAnnouncementsForAudience = (
  db: Database,
  audience: 'all' | 'admins' | 'teachers' | 'students' | 'parents',
) =>
  db.announcements
    .filter((item) => item.audience === 'all' || item.audience === audience)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));

/**
 * Note: prefer the `db`-snapshot helpers above (paired with `useData()`)
 * so every consumer reads the same live in-memory collections.
 */
