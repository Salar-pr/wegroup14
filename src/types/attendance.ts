import type { ID, ISODateString } from './common';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: ID;
  studentId: ID;
  classId: ID;
  subjectId: ID;
  date: ISODateString;
  status: AttendanceStatus;
  /** Optional note, e.g. reason for absence */
  note?: string;
}
