import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useAuth, useData, useToast } from '../../../hooks';
import type { Message } from '../../../types';
import {
  ParentSessionContext,
  type ComparisonMetric,
  type ParentSessionValue,
} from './parent-session';

export function ParentSessionProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const childIds = useMemo(() => currentUser?.studentIds ?? [], [currentUser]);

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
        read: false,
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
