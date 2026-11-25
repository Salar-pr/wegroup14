import { Navigate, Route, Routes } from 'react-router-dom';
import { ParentSessionProvider } from './hooks/ParentSessionProvider';
import { ParentTopbar } from './components/ParentTopbar';
import DashboardPage from './pages/DashboardPage';
import ChildrenPage from './pages/ChildrenPage';
import GradesPage from './pages/GradesPage';
import ComparePage from './pages/ComparePage';
import AttendancePage from './pages/AttendancePage';
import HomeworkPage from './pages/HomeworkPage';
import FinancePage from './pages/FinancePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MessagesPage from './pages/MessagesPage';
import SchedulePage from './pages/SchedulePage';

/**
 * Parent area — nested routes mounted by the app router at `/parent/*`.
 *
 * Paths match `buildNavigation('parent')` from the shared constants so every
 * sidebar link resolves to a real page:
 *   /parent                  پیشخوان
 *   /parent/child            فرزند من
 *   /parent/grades           نمرات
 *   /parent/grades/compare   مقایسهٔ عملکرد
 *   /parent/attendance       حضور و غیاب
 *   /parent/homework         تکالیف
 *   /parent/payments         شهریه و پرداخت
 *   /parent/announcements    اطلاعیه‌ها
 *   /parent/messages         پیام‌ها
 *   /parent/schedule         برنامه کلاسی
 */
export default function ParentApp() {
  return (
    <ParentSessionProvider>
      <ParentTopbar />
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="child" element={<ChildrenPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="grades/compare" element={<ComparePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="homework" element={<HomeworkPage />} />
        <Route path="payments" element={<FinancePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        {/* Any unknown /parent/* path falls back to the dashboard. */}
        <Route path="*" element={<Navigate to="/parent" replace />} />
      </Routes>
    </ParentSessionProvider>
  );
}
