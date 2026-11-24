import type { ID, ISODateString } from './common';

export type GradeType = 'quiz' | 'assignment' | 'midterm' | 'final';

export interface Grade {
  id: ID;
  studentId: ID;
  subjectId: ID;
  classId: ID;
  teacherId: ID;
  /** e.g. «آزمون نوبت اول» */
  title: string;
  type: GradeType;
  /** Score out of `maxScore` (Iranian scale, usually 20) */
  score: number;
  maxScore: number;
  date: ISODateString;
}
