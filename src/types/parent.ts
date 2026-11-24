import type { ID, ISODateString } from './common';

export type ParentRelation = 'father' | 'mother' | 'guardian';

export interface Parent {
  id: ID;
  name: string;
  phone: string;
  relation: ParentRelation;
  occupation: string;
  /** Linked children (student IDs) */
  studentIds: ID[];
  registeredAt: ISODateString;
  avatarColor: string;
}
