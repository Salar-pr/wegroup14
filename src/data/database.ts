import type {
  Student,
  Teacher,
  Parent,
  SchoolClass,
  Subject,
  Grade,
  Attendance,
  Homework,
  Announcement,
  Payment,
  Message,
  ScheduleEntry,
} from '../types';
import { mockStudents } from './students';
import { mockTeachers } from './teachers';
import { mockParents } from './parents';
import { mockClasses } from './classes';
import { mockSubjects } from './subjects';
import { mockGrades } from './grades';
import { mockAttendance } from './attendance';
import { mockHomework } from './homework';
import { mockAnnouncements } from './announcements';
import { mockPayments } from './payments';
import { mockMessages } from './messages';
import { mockSchedule } from './schedule';

/**
 * The in-memory database shape. All of these collections live exclusively
 * in React runtime memory and are reset on every page reload.
 */
export interface Database {
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  classes: SchoolClass[];
  subjects: Subject[];
  grades: Grade[];
  attendance: Attendance[];
  homework: Homework[];
  announcements: Announcement[];
  payments: Payment[];
  messages: Message[];
  schedule: ScheduleEntry[];
}

/** Builds a fresh copy of the mock database (used on provider mount / reset). */
export function createMockDatabase(): Database {
  return {
    students: [...mockStudents],
    teachers: [...mockTeachers],
    parents: [...mockParents],
    classes: [...mockClasses],
    subjects: [...mockSubjects],
    grades: [...mockGrades],
    attendance: [...mockAttendance],
    homework: [...mockHomework],
    announcements: [...mockAnnouncements],
    payments: [...mockPayments],
    messages: [...mockMessages],
    schedule: [...mockSchedule],
  };
}
