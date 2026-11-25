import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth, useData, useToast } from '../../../hooks';
import type { Message } from '../../../types';
import {
  ParentSessionContext,
  type ComparisonMetric,
  type ParentSessionValue,
} from './parent-session';
import {
  DEMO_SECOND_CHILD,
  DEMO_SECOND_CHILD_ATTENDANCE,
  DEMO_SECOND_CHILD_GRADES,
  DEMO_SECOND_CHILD_PAYMENTS,
} from '../lib/demoFamily';

/**
 * Provides the runtime-only parent session.
 *
 * `selectedChildId` lives in React state here (not in AppContext) because it is
 * a *view preference* of the parent panel, while everything the parent reads
 * (students, grades, attendance, homework, payments, messages) comes from the
 * shared in-memory `db` via useData() — so admin / teacher / student changes
 * are always reflected live.
 */
export function ParentSessionProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const isDemoParent = currentUser?.role === 'parent' && currentUser.id === 'u-parent';

  /**
   * Seed the demo family's second child into the shared in-memory db once per
   * session (see `lib/demoFamily.ts` for the rationale). Guarded by a ref so
   * StrictMode double-mounts cannot duplicate records.
   */
  const seededRef = useRef(false);
  useEffect(() => {
    if (!isDemoParent || seededRef.current) return;
    seededRef.current = true;
    updateEntity('students', (items) =>
      items.some((item) => item.id === DEMO_SECOND_CHILD.id) ? items : [...items, DEMO_SECOND_CHILD],
    );
    updateEntity('attendance', (items) =>
      items.some((item) => item.studentId === DEMO_SECOND_CHILD.id)
        ? items
        : [...items, ...DEMO_SECOND_CHILD_ATTENDANCE],
    );
    updateEntity('grades', (items) =>
      items.some((item) => item.studentId === DEMO_SECOND_CHILD.id)
        ? items
        : [...items, ...DEMO_SECOND_CHILD_GRADES],
    );
    updateEntity('payments', (items) =>
      items.some((item) => item.studentId === DEMO_SECOND_CHILD.id)
        ? items
        : [...items, ...DEMO_SECOND_CHILD_PAYMENTS],
    );
  }, [isDemoParent, updateEntity]);

  /** Children of the account; the demo parent also gets the seeded sibling. */
  const childIds = useMemo(() => {
    const linked = currentUser?.studentIds ?? [];
    if (isDemoParent && !linked.includes(DEMO_SECOND_CHILD.id)) {
      return [...linked, DEMO_SECOND_CHILD.id];
    }
    return linked;
  }, [currentUser?.studentIds, isDemoParent]);

  const [activeChildId, setActiveChildId] = useState<string | null>(childIds[0] ?? null);
  const [completedHomeworkIds, setCompletedHomeworkIds] = useState<string[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>('average');

  const selectChild = useCallback((studentId: string) => {
    setActiveChildId(studentId);
  }, []);

  const toggleHomeworkDone = useCallback((homeworkId: string) => {
    setCompletedHomeworkIds((prev) =>
      prev.includes(homeworkId)
        ? prev.filter((id) => id !== homeworkId)
        : [...prev, homeworkId],
    );
  }, []);

  const sendMessage = useCallback(
    ({
      subject,
      body,
      recipientId,
      recipientName,
      recipientRole,
      aboutStudentId,
    }: {
      subject: string;
      body: string;
      recipientId: string;
      recipientName: string;
      recipientRole: Message['to']['role'];
      aboutStudentId: string | null;
    }): Message => {
      // Prefix the body with the child's name so the school office can route it.
      const childName = aboutStudentId
        ? db.students.find((student) => student.id === aboutStudentId)?.name
        : undefined;

      const message: Message = {
        id: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        from: {
          id: currentUser?.id ?? 'u-parent',
          name: currentUser?.name ?? 'ولی دانش‌آموز',
          role: 'parent',
        },
        to: { id: recipientId, name: recipientName, role: recipientRole },
        subject,
        body: childName ? `دربارهٔ ${childName}:\n${body}` : body,
        createdAt: new Date().toISOString(),
        read: true,
      };

      // Write into the shared in-memory db so the message shows up instantly in
      // the thread list, the header, and any other consumer of AppContext.
      updateEntity('messages', (items) => [message, ...items]);
      setSentMessages((prev) => [message, ...prev]);

      showToast(
        'success',
        `پیام شما برای ${recipientName} ثبت و در تاریخچهٔ مکاتبات ذخیره شد.`,
        'ارسال موفق',
      );
      return message;
    },
    [currentUser, db.students, updateEntity, showToast],
  );

  const markThreadRead = useCallback(
    (messageId: string) => {
      updateEntity('messages', (items) =>
        items.map((item) => (item.id === messageId ? { ...item, read: true } : item)),
      );
    },
    [updateEntity],
  );

  const value = useMemo<ParentSessionValue>(
    () => ({
      childIds,
      selectedChildId: activeChildId ?? childIds[0] ?? null,
      selectChild,
      completedHomeworkIds,
      toggleHomeworkDone,
      sentMessages,
      sendMessage,
      markThreadRead,
      comparisonMetric,
      setComparisonMetric,
    }),
    [
      childIds,
      activeChildId,
      selectChild,
      completedHomeworkIds,
      toggleHomeworkDone,
      sentMessages,
      sendMessage,
      markThreadRead,
      comparisonMetric,
    ],
  );

  return (
    <ParentSessionContext.Provider value={value}>{children}</ParentSessionContext.Provider>
  );
}
