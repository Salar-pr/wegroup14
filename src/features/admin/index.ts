/**
 * Admin feature barrel — the single public entry point of TASK 02.
 *
 * Integration (see docs/INTEGRATION_CONTRACT.md §4.1):
 *   import { AdminApp } from '../features/admin';
 *   …
 *   <Route path={`${ROUTES.ADMIN}/*`} element={<RequireRole role="admin"><DashboardLayout /></RequireRole>}>
 *     <Route path="*" element={<AdminApp />} />
 *   </Route>
 */
export { AdminApp } from './AdminApp';

/* Pages — exported for reuse / testing */
export { default as AdminDashboardPage } from './pages/DashboardPage';
export { default as AdminStudentsPage } from './pages/StudentsPage';
export { default as AdminTeachersPage } from './pages/TeachersPage';
export { default as AdminClassesPage } from './pages/ClassesPage';
export { default as AdminAttendancePage } from './pages/AttendancePage';
export { default as AdminGradesPage } from './pages/GradesPage';
export { default as AdminHomeworkPage } from './pages/HomeworkPage';
export { default as AdminAnnouncementsPage } from './pages/AnnouncementsPage';
export { default as AdminFinancePage } from './pages/FinancePage';
export { default as AdminSettingsPage } from './pages/SettingsPage';

/* Reusable feature components */
export { ChartCard } from './components/ChartCard';
export { ConfirmDialog } from './components/ConfirmDialog';
export { StudentForm } from './components/StudentForm';
export { TeacherForm } from './components/TeacherForm';
export { ClassForm } from './components/ClassForm';
export { GradeForm } from './components/GradeForm';
export { HomeworkForm } from './components/HomeworkForm';
export { AnnouncementForm } from './components/AnnouncementForm';
export { StudentDetailsModal } from './components/StudentDetailsModal';
export { ClassStudentsModal } from './components/ClassStudentsModal';
export { PaymentModal } from './components/PaymentModal';
