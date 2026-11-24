import { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  LogOut,
  X,
} from 'lucide-react';
import { buildNavigation } from '../../constants/navigation';
import { ROLE_LABELS, ROUTES } from '../../constants/routes';
import { useAuth, useData, useUi } from '../../hooks';
import { cn, toPersianDigits } from '../../utils';
import { Avatar } from '../ui/Avatar';

const SCHOOL_NAME = 'دبیرستان نمونه دولتی شهید بهشتی';
const SCHOOL_YEAR = 'سال تحصیلی ۱۴۰۵–۱۴۰۴';

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { db } = useData();
  const {
    sidebarOpen,
    closeSidebar,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useUi();
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  // Escape closes the drawer + lock body scroll while it is open
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen, closeSidebar]);

  if (!currentUser) return null;

  const role = currentUser.role;
  const sections = buildNavigation(role);
  const unreadMessages = db.messages.filter(
    (message) => message.to.id === currentUser.id && !message.read,
  ).length;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 cursor-default bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        aria-label="منوی اصلی"
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-[280px] flex-col border-e border-border bg-surface transition-all duration-300 ease-in-out',
          // Mobile: drawer slides in from the inline-start edge (right in RTL)
          sidebarOpen ? 'translate-x-0' : 'translate-x-full',
          // Desktop: static rail, always visible
          'lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-sidebar-collapsed' : 'lg:w-sidebar',
        )}
      >
        {/* Brand */}
        <div className="flex h-header shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <GraduationCap size={24} aria-hidden="true" />
            </div>
            <div className={cn('min-w-0', sidebarCollapsed && 'lg:hidden')}>
              <p className="text-[15px] font-extrabold leading-5 text-text">مدرسه‌یار</p>
              <p className="mt-0.5 truncate text-[10px] text-text-muted">
                {SCHOOL_NAME}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="بستن منو"
            className="rounded-btn p-2 text-text-muted transition-colors hover:bg-slate-100 hover:text-text lg:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* School year tag */}
        <div
          className={cn(
            'border-b border-border px-4 py-2.5',
            sidebarCollapsed && 'lg:hidden',
          )}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-800 ring-1 ring-inset ring-blue-200">
            {SCHOOL_YEAR}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <div className="flex flex-col gap-5">
            {sections.map((section) => (
              <div key={section.id}>
                {section.title && (
                  <p
                    className={cn(
                      'mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted',
                      sidebarCollapsed && 'lg:hidden',
                    )}
                  >
                    {section.title}
                  </p>
                )}
                <ul className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isDashboard = item.path === '/';
                    const badgeCount = item.showUnreadBadge ? unreadMessages : 0;
                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.to}
                          end={isDashboard}
                          title={sidebarCollapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            cn(
                              'group relative flex h-11 items-center gap-3 rounded-btn px-3 text-[13px] font-medium transition-colors duration-150',
                              isActive
                                ? 'bg-blue-50 font-bold text-primary'
                                : 'text-text-muted hover:bg-slate-100 hover:text-text',
                              sidebarCollapsed && 'lg:justify-center lg:px-0',
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-y-2 start-0 w-1 rounded-full bg-primary"
                                />
                              )}
                              <Icon
                                size={20}
                                aria-hidden="true"
                                className={cn(
                                  'shrink-0',
                                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-text',
                                )}
                              />
                              <span className={cn('min-w-0 flex-1 truncate', sidebarCollapsed && 'lg:hidden')}>
                                {item.label}
                              </span>
                              {badgeCount > 0 && (
                                <span
                                  aria-label={`${toPersianDigits(badgeCount)} پیام خوانده‌نشده`}
                                  className={cn(
                                    'flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white',
                                    sidebarCollapsed &&
                                      'lg:absolute lg:end-1.5 lg:top-1.5 lg:h-2.5 lg:min-w-0 lg:w-2.5 lg:px-0 lg:text-[0]',
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
              </div>
            ))}
          </div>
        </nav>

        {/* Footer: user + actions */}
        <div className="shrink-0 border-t border-border p-3">
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-btn bg-slate-50 p-2',
              sidebarCollapsed && 'lg:justify-center lg:bg-transparent lg:p-0',
            )}
          >
            <Avatar
              name={currentUser.name}
              color={currentUser.avatarColor}
              size="sm"
            />
            <div className={cn('min-w-0 flex-1', sidebarCollapsed && 'lg:hidden')}>
              <p className="truncate text-[12px] font-bold leading-5 text-text">
                {currentUser.name}
              </p>
              <p className="truncate text-[10px] leading-4 text-text-muted">
                {ROLE_LABELS[role]}
                {currentUser.title ? ` — ${currentUser.title}` : ''}
              </p>
            </div>
            <div className={cn('flex shrink-0 items-center gap-1', sidebarCollapsed && 'lg:hidden')}>
              <button
                type="button"
                onClick={handleLogout}
                title="خروج از حساب"
                aria-label="خروج از حساب"
                className="rounded-btn p-2 text-text-muted transition-colors hover:bg-red-50 hover:text-danger"
              >
                <LogOut size={17} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? 'باز کردن نوار کناری' : 'بستن نوار کناری'}
            className="mt-2 hidden h-9 w-full items-center justify-center gap-2 rounded-btn text-[11px] font-medium text-text-muted transition-colors hover:bg-slate-100 hover:text-text lg:flex"
          >
            {sidebarCollapsed ? (
              <ChevronsLeft size={16} aria-hidden="true" />
            ) : (
              <>
                <ChevronsRight size={16} aria-hidden="true" />
                <span>بستن نوار کناری</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
