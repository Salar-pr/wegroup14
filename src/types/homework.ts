import type { ID, ISODateString } from './common';

export interface Homework {
  id: ID;
  title: string;
  description: string;
  subjectId: ID;
  teacherId: ID;
  classId: ID;
  assignedAt: ISODateString;
  dueDate: ISODateString;
  maxScore: number;
}
