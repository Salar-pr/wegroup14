import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  NotebookPen,
  School,
  Settings,
  UserRound,
  Users,
  Presentation,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types';
import { ROLE_HOME } from './routes';

/**
 * Sidebar navigation contract.
 *
 * `path` is RELATIVE to the role home (e.g. '/students' for the admin).
 * Feature teams must register their pages under `<ROLE_HOME[role]><path>`.
 * Every path below is guaranteed to render (placeholder until the owning
 * feature team replaces it), so sidebar links never dead-end.
 */
export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  /** Show the current user's unread-message badge on this item. */
  showUnreadBadge?: boolean;
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

const DASHBOARD_ITEM: NavItem = {
  label: 'پیشخوان',
  path: '/',
  icon: LayoutDashboard,
  roles: ['admin', 'teacher', 'student', 'parent'],
};

const ALL_ITEMS: NavItem[] = [
  DASHBOARD_ITEM,

  // ---- مدیریت ----
  { label: 'دانش‌آموزان', path: '/students', icon: GraduationCap, roles: ['admin'] },
  { label: 'معلمان', path: '/teachers', icon: Presentation, roles: ['admin'] },
  { label: 'اولیا', path: '/parents', icon: Users, roles: ['admin'] },
  { label: 'کلاس‌ها', path: '/classes', icon: School, roles: ['admin'] },
  { label: 'کارکنان و حقوق', path: '/payroll', icon: CreditCard, roles: ['admin'] },
  { label: 'گزارش‌ها', path: '/reports', icon: FileText, roles: ['admin'] },
  { label: 'تنظیمات مدرسه', path: '/settings', icon: Settings, roles: ['admin'] },

  // ---- آموزش ----
  { label: 'کلاس‌های من', path: '/my-classes', icon: School, roles: ['teacher'] },
  { label: 'نمرات', path: '/grades', icon: ClipboardList, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'حضور و غیاب', path: '/attendance', icon: ClipboardCheck, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'تکالیف', path: '/homework', icon: NotebookPen, roles: ['teacher', 'student'] },
  { label: 'کارنامه', path: '/report-card', icon: FileText, roles: ['student'] },
  { label: 'برنامه کلاسی', path: '/schedule', icon: CalendarDays, roles: ['admin', 'teacher', 'student', 'parent'] },

  // ---- اولیا ----
  { label: 'فرزند من', path: '/child', icon: UserRound, roles: ['parent'] },
  { label: 'شهریه و پرداخت', path: '/payments', icon: Wallet, roles: ['admin', 'parent'] },

  // ---- ارتباطات ----
  { label: 'پیام‌ها', path: '/messages', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent'], showUnreadBadge: true },
  { label: 'اطلاعیه‌ها', path: '/announcements', icon: Megaphone, roles: ['admin', 'teacher', 'student', 'parent'] },
];

export interface ResolvedNavSection {
  id: string;
  title?: string;
  items: Array<NavItem & { to: string }>;
}

/** Build the role-filtered, path-resolved navigation for the sidebar. */
export function buildNavigation(role: UserRole): ResolvedNavSection[] {
  const home = ROLE_HOME[role];
  const visible = ALL_ITEMS.filter((item) => item.roles.includes(role));

  const dashboard = visible.filter((item) => item.path === '/');
  const management = visible.filter((item) =>
    ['/students', '/teachers', '/parents', '/classes', '/payroll', '/reports', '/settings'].includes(item.path),
  );
  const academic = visible.filter((item) =>
    ['/my-classes', '/grades', '/attendance', '/homework', '/report-card', '/schedule', '/child', '/payments'].includes(item.path),
  );
  const communication = visible.filter((item) =>
    ['/messages', '/announcements'].includes(item.path),
  );

  const sections: ResolvedNavSection[] = [];
  const push = (id: string, title: string | undefined, items: NavItem[]) => {
    if (items.length > 0) {
      sections.push({
        id,
        title,
        items: items.map((item) => ({
          ...item,
          to: item.path === '/' ? home : `${home}${item.path}`,
        })),
      });
    }
  };

  push('main', undefined, dashboard);
  push('management', 'مدیریت', management);
  push('academic', role === 'parent' ? 'پیگیری فرزند' : 'آموزش', academic);
  push('communication', 'ارتباطات', communication);

  return sections;
}
