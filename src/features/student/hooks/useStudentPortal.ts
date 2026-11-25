import { useContext, useMemo } from 'react';
import { useAuth, useData } from '../../../hooks';
import {
  buildClassSchedule,
  buildStudentAcademicSummary,
  buildStudentAnnouncements,
  buildStudentAttendanceSummary,
  buildStudentDossier,
  buildStudentHomeworkList,
  resolveStudentRecord,
} from '../lib/studentAnalytics';
import { StudentSessionContext, type StudentSessionValue } from './student-session-context';

export function useStudentSession(): StudentSessionValue {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) {
    throw new Error('useStudentSession must be used inside <StudentSessionProvider>.');
  }
  return ctx;
}

/**
 * Unified student hook: joins the authenticated student user against the live
 * `AppContext` database (`useData().db`) plus runtime session state.
 *
 * Whenever Admin updates grades, attendance, homework, announcements, or
 * student profiles during the current session, all returned slices recompute
 * automatically.
 */
export function useStudentPortal() {
  const { currentUser } = useAuth();
  const { db, updateEntity } = useData();
  const session = useStudentSession();

  const student = useMemo(() => resolveStudentRecord(db, currentUser), [db, currentUser]);

  const dossier = useMemo(() => (student ? buildStudentDossier(db, student) : null), [db, student]);

  const academic = useMemo(
    () => (student ? buildStudentAcademicSummary(db, student) : null),
    [db, student],
  );

  const attendance = useMemo(
    () => (student ? buildStudentAttendanceSummary(db, student.id) : null),
    [db, student],
  );

  const schedule = useMemo(
    () => (student ? buildClassSchedule(db, student.classId) : null),
    [db, student],
  );

  const homeworkList = useMemo(
    () => (student ? buildStudentHomeworkList(db, student, session.submissions) : []),
    [db, student, session.submissions],
  );

  const announcements = useMemo(
    () => buildStudentAnnouncements(db, session.readAnnouncementIds),
    [db, session.readAnnouncementIds],
  );

  return {
    currentUser,
    db,
    updateEntity,
    student,
    dossier,
    academic,
    attendance,
    schedule,
    homeworkList,
    announcements,
    session,
  };
}
