import type { ID, ISODateString } from './common';

export type StudentStatus = 'active' | 'suspended' | 'graduated';

export interface Student {
  id: ID;
  /** Persian school-issued student code, e.g. «14021123» */
  studentCode: string;
  name: string;
  classId: ID;
  /** e.g. «دهم»، «یازدهم»، «دوازدهم» */
  gradeLevel: string;
  field: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  status: StudentStatus;
  /** Grade point average (0–20) */
  gpa: number;
  enrolledAt: ISODateString;
  avatarColor: string;
}
