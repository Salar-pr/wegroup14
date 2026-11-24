import type { ID } from './common';

export interface Subject {
  id: ID;
  name: string;
  /** Short subject code, e.g. «MAT-201» */
  code: string;
  /** Weekly hours */
  weeklyHours: number;
  /** Coefficient used when computing GPA */
  coefficient: number;
  teacherId: ID;
}
