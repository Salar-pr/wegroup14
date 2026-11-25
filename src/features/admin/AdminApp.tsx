/**
 * Admin feature — route table for the school administration area.
 *
 * Mounted by the app router under `/admin/*`. Paths mirror
 * `buildNavigation('admin')` from `src/constants/navigation.ts` so every
 * sidebar link resolves. Sections that belong to other teams' tasks
 * (parents, payroll, reports, schedule, messages) render an informative
 * notice instead of a dead link.
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import { Construction, Mail, type LucideIcon } from 'lucide-react';
import { PageHeader } from '../../components';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import ClassesPage from './pages/ClassesPage';
import AttendancePage from './pages/AttendancePage';
import GradesPage from './pages/GradesPage';
import HomeworkPage from './pages/HomeworkPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';

interface DeferredProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Shown for admin sections owned by other feature tasks. */
function DeferredSection({ title, description, icon: Icon }: DeferredProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: title }]}
      />
      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center shadow-card">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary">
          <Icon size={26} aria-hidden="true" />
        </span>
        <h2 className="text-[16px] font-extrabold text-text">این بخش در وظایف این نسخه نیست</h2>
        <p className="mt-2 max-w-md text-[13px] leading-6 text-text-muted">
          {description} لینک این بخش در منوی اصلی باقی مانده تا ناوبری کامل بماند؛ محتوای آن توسط
          تیم مربوطه در نسخه‌های بعدی تکمیل می‌شود.
        </p>
      </div>
    </>
  );
}

export function AdminApp() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="students/*" element={<StudentsPage />} />
      <Route path="teachers" element={<TeachersPage />} />
      <Route path="teachers/*" element={<TeachersPage />} />
      <Route path="classes" element={<ClassesPage />} />
      <Route path="classes/*" element={<ClassesPage />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="grades" element={<GradesPage />} />
      <Route path="homework" element={<HomeworkPage />} />
      <Route path="announcements" element={<AnnouncementsPage />} />
      <Route path="payments" element={<FinancePage />} />
      <Route path="finance" element={<Navigate to="/admin/payments" replace />} />
      <Route path="settings" element={<SettingsPage />} />

      {/* Sections owned by other feature teams (kept working, not dead links). */}
      <Route
        path="parents"
        element={
          <DeferredSection
            title="اولیا"
            description="مدیریت پرونده اولیا و ارتباط با خانواده‌ها."
            icon={Mail}
          />
        }
      />
      <Route
        path="payroll"
        element={
          <DeferredSection
            title="حقوق و دستمزد"
            description="محاسبه و پرداخت حقوق کادر آموزشی و اداری."
            icon={Construction}
          />
        }
      />
      <Route
        path="reports"
        element={
          <DeferredSection
            title="گزارش‌ها"
            description="گزارش‌های تحلیلی عملکرد تحصیلی، حضور و مالی."
            icon={Construction}
          />
        }
      />
      <Route
        path="schedule"
        element={
          <DeferredSection
            title="برنامه هفتگی"
            description="برنامه درسی هفتگی کلاس‌ها و معلمان."
            icon={Construction}
          />
        }
      />
      <Route
        path="messages"
        element={
          <DeferredSection
            title="پیام‌ها"
            description="پیام‌رسانی داخلی میان مدیر، معلمان و اولیا."
            icon={Mail}
          />
        }
      />

      {/* Unknown admin path → back to the dashboard instead of a blank page. */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
