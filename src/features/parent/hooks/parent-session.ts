/**
 * Parent session state — runtime only.
 *
 * Holds the things the parent panel "owns" during a session:
 *  - which child (of possibly several) is currently in focus,
 *  - the local message history + drafts (simulated, shared with AppContext),
 *  - which homework items the parent marked as done,
 *  - UI preferences such as the academic comparison metric.
 *
 * Nothing is written to localStorage / sessionStorage / cookies / IndexedDB:
 * a browser refresh resets the whole demo, by design (contract §0.2).
 */

import { createContext, useContext } from 'react';
import type { Message } from '../../../types';

export type ComparisonMetric = 'average' | 'coefficient' | 'trend';

export interface ParentSessionValue {
  /** Students linked to the signed-in parent. */
  childIds: string[];
  /** Currently selected child (drives every page). */
  selectedChildId: string | null;
  selectChild: (studentId: string) => void;

  /** Homework the parent marked as done in this session. */
  completedHomeworkIds: string[];
  toggleHomeworkDone: (homeworkId: string) => void;

  /** Messages authored in this session (parent → school). */
  sentMessages: Message[];
  sendMessage: (input: {
    subject: string;
    body: string;
    recipientId: string;
    recipientName: string;
    recipientRole: Message['to']['role'];
    aboutStudentId: string | null;
  }) => Message;
  /** Mark a message as read on the shared db (parent is the recipient). */
  markThreadRead: (messageId: string) => void;

  comparisonMetric: ComparisonMetric;
  setComparisonMetric: (metric: ComparisonMetric) => void;
}

export const ParentSessionContext = createContext<ParentSessionValue | null>(null);

export function useParentSession(): ParentSessionValue {
  const context = useContext(ParentSessionContext);
  if (!context) {
    throw new Error('useParentSession must be used within <ParentSessionProvider>');
  }
  return context;
}
