import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { SimulatedSubmission } from '../lib/studentAnalytics';
import { StudentSessionContext, type StudentSessionValue } from './student-session-context';

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Record<string, SimulatedSubmission>>({});
  const [readIds, setReadIds] = useState<string[]>([]);
  const [targetGpa, setTargetGpaState] = useState<number>(19.25);

  const submitHomework = useCallback(
    ({
      homeworkId,
      answerText,
      attachmentName,
    }: {
      homeworkId: string;
      answerText: string;
      attachmentName?: string;
    }) => {
      setSubmissions((prev) => ({
        ...prev,
        [homeworkId]: {
          homeworkId,
          submittedAt: new Date().toISOString(),
          answerText: answerText.trim(),
          attachmentName: attachmentName?.trim() || undefined,
        },
      }));
    },
    [],
  );

  const withdrawHomework = useCallback((homeworkId: string) => {
    setSubmissions((prev) => {
      const next = { ...prev };
      delete next[homeworkId];
      return next;
    });
  }, []);

  const readAnnouncementIds = useMemo(() => new Set(readIds), [readIds]);

  const markAnnouncementRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const toggleAnnouncementRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const markAllAnnouncementsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const merged = new Set([...prev, ...ids]);
      return [...merged];
    });
  }, []);

  const setTargetGpa = useCallback((gpa: number) => {
    const clamped = Math.min(20, Math.max(10, Math.round(gpa * 4) / 4));
    setTargetGpaState(clamped);
  }, []);

  const value = useMemo<StudentSessionValue>(
    () => ({
      submissions,
      submitHomework,
      withdrawHomework,
      readAnnouncementIds,
      markAnnouncementRead,
      toggleAnnouncementRead,
      markAllAnnouncementsRead,
      targetGpa,
      setTargetGpa,
    }),
    [
      submissions,
      submitHomework,
      withdrawHomework,
      readAnnouncementIds,
      markAnnouncementRead,
      toggleAnnouncementRead,
      markAllAnnouncementsRead,
      targetGpa,
      setTargetGpa,
    ],
  );

  return <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>;
}
