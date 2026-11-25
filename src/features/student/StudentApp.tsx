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
