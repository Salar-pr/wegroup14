import type { ID } from './common';

export type GradeLevel = 'دهم' | 'یازدهم' | 'دوازدهم';

export interface SchoolClass {
  id: ID;
  /** e.g. «دهم ریاضی ۱» */
  name: string;
  gradeLevel: GradeLevel;
  /** e.g. «ریاضی»، «تجربی»، «انسانی» */
  field: string;
  homeroomTeacherId: ID;
  capacity: number;
  enrolled: number;
  room: string;
}
