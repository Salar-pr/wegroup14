import { createContext } from 'react';
import type { SimulatedSubmission } from '../lib/studentAnalytics';

/**
 * Runtime-only student session state (lives exclusively in React memory —
 * zero browser storage; refreshing the page resets everything by design).
 */
export interface StudentSessionValue {
  /** Homework assignments submitted by the student during this session. */
  submissions: Record<string, SimulatedSubmission>;
  submitHomework: (payload: {
    homeworkId: string;
    answerText: string;
    attachmentName?: string;
  }) => void;
  withdrawHomework: (homeworkId: string) => void;

  /** Announcement IDs marked as read during this session. */
  readAnnouncementIds: ReadonlySet<string>;
  markAnnouncementRead: (announcementId: string) => void;
  toggleAnnouncementRead: (announcementId: string) => void;
  markAllAnnouncementsRead: (ids: string[]) => void;

  /** Personal study note / target GPA simulation (in-memory only). */
  targetGpa: number;
  setTargetGpa: (gpa: number) => void;
}

export const StudentSessionContext = createContext<StudentSessionValue | null>(null);
