import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  NotebookPen,
  UserRound,
} from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { cn, toPersianDigits } from '../../../utils';
import { useStudentPortal } from '../hooks/useStudentPortal';

const NAV_TABS = [
  { to: ROUTES.STUDENT, label: 'پیشخوان', icon: LayoutDashboard, end: true },
  { to: `${ROUTES.STUDENT}/schedule`, label: 'برنامه هفتگی', icon: CalendarDays },
  { to: `${ROUTES.STUDENT}/grades`, label: 'نمرات من', icon: ClipboardList },
  { to: `${ROUTES.STUDENT}/attendance`, label: 'حضور و غیاب', icon: ClipboardCheck },
  { to: `${ROUTES.STUDENT}/homework`, label: 'تکالیف', icon: NotebookPen },
  { to: `${ROUTES.STUDENT}/announcements`, label: 'اطلاعیه‌ها', icon: Megaphone },
  { to: `${ROUTES.STUDENT}/profile`, label: 'پروفایل دانش‌آموزی', icon: UserRound },
  { to: `${ROUTES.STUDENT}/report-card`, label: 'کارنامه', icon: FileText },
  { to: `${ROUTES.STUDENT}/messages`, label: 'پیام‌ها', icon: MessageSquare },
];

/**
 * Clean quick-navigation bar inside the student feature workspace.
 * Complements the global right-side Sidebar and guarantees direct one-click
 * access to `/student/profile` as well as unread/pending counters.
 */
export function StudentQuickBar() {
  const { homeworkList, announcements, db, currentUser } = useStudentPortal();

  const pendingHomework = homeworkList.filter(
    (h) => h.status !== 'submitted' && h.status !== 'graded',
  ).length;
  const unreadAnnouncements = announcements.filter((a) => !a.isRead).length;
  const unreadMessages = currentUser
    ? db.messages.filter((m) => m.to.id === currentUser.id && !m.read).length
    : 0;

  return (
    <nav
      aria-label="ناوبری سریع پنل دانش‌آموز"
      className="mb-6 overflow-x-auto rounded-card border border-border bg-surface p-2 shadow-card scrollbar-thin"
    >
      <ul className="flex min-w-max items-center gap-1">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const badgeCount = tab.to.endsWith('/homework')
            ? pendingHomework
            : tab.to.endsWith('/announcements')
              ? unreadAnnouncements
              : tab.to.endsWith('/messages')
                ? unreadMessages
                : 0;

          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-semibold transition-colors duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:bg-slate-100 hover:text-text',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} aria-hidden="true" />
                    <span>{tab.label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                          isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-primary',
                        )}
                      >
                        {toPersianDigits(badgeCount)}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
