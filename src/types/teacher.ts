import type { ID, ISODateString } from './common';

export type TeacherStatus = 'active' | 'on_leave' | 'retired';

export interface Teacher {
  id: ID;
  employeeCode: string;
  name: string;
  phone: string;
  email: string;
  /** Names of the subject areas this teacher teaches */
  specialty: string;
  subjectIds: ID[];
  classIds: ID[];
  status: TeacherStatus;
  joinedAt: ISODateString;
  avatarColor: string;
}
