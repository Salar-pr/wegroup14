import type { ID, ISODateString } from './common';

export type AnnouncementAudience = 'all' | 'admins' | 'teachers' | 'students' | 'parents';
export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: ID;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  authorName: string;
  createdAt: ISODateString;
  pinned: boolean;
}
