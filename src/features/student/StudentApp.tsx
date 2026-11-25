import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { StudentQuickBar } from './components/StudentQuickBar';
import { StudentSessionProvider } from './hooks/StudentSessionProvider';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AttendancePage from './pages/AttendancePage';
import DashboardPage from './pages/DashboardPage';
import GradesPage from './pages/GradesPage';
import HomeworkPage from './pages/HomeworkPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import ReportCardPage from './pages/ReportCardPage';
import SchedulePage from './pages/SchedulePage';

/**
 * Student Dashboard feature router (`src/features/student/`).
 *
 * Mounted under `/student/*` via `<Route path="*" element={<StudentApp />} />`.
 * Covers all required TASK 03 pages plus every sidebar link from
 * `buildNavigation('student')`:
 *   /student                  → DashboardPage
 *   /student/schedule         → SchedulePage
 *   /student/grades           → GradesPage
 *   /student/attendance       → AttendancePage
 *   /student/homework         → HomeworkPage
 *   /student/announcements    → AnnouncementsPage
 *   /student/profile          → ProfilePage
 *   /student/report-card      → ReportCardPage (sidebar item)
 *   /student/messages         → MessagesPage   (sidebar item)
 */
export function StudentApp() {
  return (
    <StudentSessionProvider>
      <StudentQuickBar />
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="homework" element={<HomeworkPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="report-card" element={<ReportCardPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="*" element={<Navigate to={ROUTES.STUDENT} replace />} />
      </Routes>
    </StudentSessionProvider>
  );
}

export default StudentApp;
