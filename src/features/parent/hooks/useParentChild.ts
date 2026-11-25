import { useMemo } from 'react';
import { useData } from '../../../hooks';
import type { Student } from '../../../types';
import {
  buildAcademicSummary,
  buildAttendanceSummary,
  buildClassInfo,
  buildFinanceSummary,
  buildHomeworkItems,
  getChildren,
  parentAnnouncements,
  type AcademicSummary,
  type AttendanceSummary,
  type ChildClassInfo,
  type FinanceSummary,
  type HomeworkItem,
} from '../lib/parentAnalytics';
import { useParentSession } from './parent-session';

export interface ParentScope {
  /** Students linked to the signed-in parent account. */
  children: Student[];
  /** The child every page currently focuses on. */
  child: Student | null;
  hasChildren: boolean;
  academic: AcademicSummary | null;
  attendance: AttendanceSummary | null;
  homework: HomeworkItem[];
  finance: FinanceSummary | null;
  classInfo: ChildClassInfo | null;
  announcements: ReturnType<typeof parentAnnouncements>;
  /** Live lookups for joins inside pages. */
  subjectName: (subjectId: string) => string;
  teacherName: (teacherId: string) => string;
  className: (classId: string) => string;
}

/**
 * Single entry point for every parent page.
 *
 * All values are derived from the live `db` in AppContext on each render, so a
 * change performed elsewhere in the app (e.g. the teacher enters a grade) is
 * reflected here immediately without any refresh or storage.
 */
export function useParentChild(): ParentScope {
  const { db } = useData();
  const { selectedChildId, completedHomeworkIds, childIds } = useParentSession();

  const children = useMemo(() => getChildren(db, childIds), [db, childIds]);

  const child = useMemo(() => {
    if (children.length === 0) return null;
    return children.find((item) => item.id === selectedChildId) ?? children[0];
  }, [children, selectedChildId]);

  const academic = useMemo(
    () => (child ? buildAcademicSummary(db, child.id) : null),
    [db, child],
  );

  const attendance = useMemo(
    () => (child ? buildAttendanceSummary(db, child.id) : null),
    [db, child],
  );

  const homework = useMemo(
    () =>
      child
        ? buildHomeworkItems(db, child, { completedIds: completedHomeworkIds })
        : [],
    [db, child, completedHomeworkIds],
  );

  const finance = useMemo(
    () => (child ? buildFinanceSummary(db, child.id) : null),
    [db, child],
  );

  const classInfo = useMemo(
    () => (child ? buildClassInfo(db, child) : null),
    [db, child],
  );

  const announcements = useMemo(() => parentAnnouncements(db), [db]);

  const className = useMemo(() => {
    const map = new Map(db.classes.map((item) => [item.id, item.name]));
    return (classId: string) => map.get(classId) ?? '—';
  }, [db.classes]);

  const subjectName = useMemo(() => {
    const map = new Map(db.subjects.map((item) => [item.id, item.name]));
    return (subjectId: string) => map.get(subjectId) ?? '—';
  }, [db.subjects]);

  const teacherName = useMemo(() => {
    const map = new Map(db.teachers.map((item) => [item.id, item.name]));
    return (teacherId: string) => map.get(teacherId) ?? '—';
  }, [db.teachers]);

  return {
    children,
    child,
    hasChildren: children.length > 0,
    academic,
    attendance,
    homework,
    finance,
    classInfo,
    announcements,
    subjectName,
    teacherName,
    className,
  };
}
