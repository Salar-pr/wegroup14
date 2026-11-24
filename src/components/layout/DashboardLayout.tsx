import { Outlet } from 'react-router-dom';
import { cn } from '../../utils';
import { useUi } from '../../hooks';
import { Sidebar } from '../navigation/Sidebar';
import { Header } from '../navigation/Header';

/**
 * Authenticated application shell: right-side sidebar + white header +
 * scrollable content area on a #F8FAFC background.
 * Feature teams render their pages inside this layout via <Outlet />.
 */
export function DashboardLayout() {
  const { sidebarCollapsed } = useUi();

  return (
    <div className="min-h-screen bg-background text-text">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ps-sidebar-collapsed' : 'lg:ps-sidebar',
        )}
      >
        <Header />
        <main className="mx-auto w-full max-w-content-max flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="border-t border-border py-4">
          <p className="text-center text-[11px] text-text-muted">
            مدرسه‌یار — سامانه یکپارچه مدیریت مدرسه • نسخۀ نمایشی، همۀ داده‌ها صرفاً محلی و موقت هستند.
          </p>
        </footer>
      </div>
    </div>
  );
}
