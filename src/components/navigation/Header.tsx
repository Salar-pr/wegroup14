import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  GraduationCap,
  LogOut,
  Megaphone,
  Menu,
  Presentation,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { buildNavigation } from '../../constants/navigation';
import { ROLE_HOME, ROLE_LABELS, ROUTES, AUDIENCE_LABELS } from '../../constants/routes';
import { useAuth, useData, useToast, useUi } from '../../hooks';
import { cn, formatJalali, formatRelativeTime, toPersianDigits } from '../../utils';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { getClassById, getSubjectById } from '../../data';

type Panel = 'search' | 'bell' | 'profile' | null;
type SearchResult =
  | { kind: 'student'; id: string }
  | { kind: 'teacher'; id: string }
  | { kind: 'announcement'; id: string }
  | { kind: 'profile' };
type EntitySearchResult = Exclude<SearchResult, { kind: 'profile' }>;

const PRIORITY_BADGE = {
  urgent: { variant: 'danger' as const, label: 'فوری' },
  important: { variant: 'warning' as const, label: 'مهم' },
  normal: { variant: 'neutral' as const, label: 'عادی' },
};

export function Header() {
  const { currentUser, logout } = useAuth();
  const { db } = useData();
  const { showToast } = useToast();
  const { toggleSidebar } = useUi();
  const location = useLocation();
  const navigate = useNavigate();

  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [readIds, setReadIds] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const closePanels = useCallback(() => setOpenPanel(null), []);

  // Close panels on outside click
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        closePanels();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [closePanels]);

  // Close panels on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanels();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePanels]);

  const audienceRole = currentUser?.role;

  // Announcements relevant to this role (safe with anonymous sessions)
  const roleAudience: 'all' | 'admins' | 'teachers' | 'students' | 'parents' =
    audienceRole === 'admin' ? 'admins' : audienceRole === 'teacher' ? 'teachers' : audienceRole === 'student' ? 'students' : audienceRole === 'parent' ? 'parents' : 'all';
  const roleAnnouncements = useMemo(
    () =>
      db.announcements
        .filter((item) => item.audience === 'all' || item.audience === roleAudience)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.announcements, roleAudience],
  );
  const visibleAnnouncements = roleAnnouncements.slice(0, 6);
  const unreadCount = roleAnnouncements.filter((item) => !readIds.includes(item.id)).length;

  // Search across the in-memory DB (min 2 characters)
  const trimmedQuery = query.trim();
  const searchResults = useMemo<EntitySearchResult[]>(() => {
    if (trimmedQuery.length < 2) return [];
    const q = trimmedQuery.toLowerCase();
    const results: EntitySearchResult[] = [];
    for (const student of db.students) {
      if (student.name.includes(trimmedQuery) || student.studentCode.includes(q)) {
        results.push({ kind: 'student', id: student.id });
      }
    }
    for (const teacher of db.teachers) {
      if (teacher.name.includes(trimmedQuery) || teacher.specialty.includes(trimmedQuery)) {
        results.push({ kind: 'teacher', id: teacher.id });
      }
    }
    for (const announcement of db.announcements) {
      if (announcement.title.includes(trimmedQuery)) {
        results.push({ kind: 'announcement', id: announcement.id });
      }
    }
    return results.slice(0, 7);
  }, [db.students, db.teachers, db.announcements, trimmedQuery]);

  if (!currentUser) return null;

  const role = currentUser.role;
  const roleHome = ROLE_HOME[role];

  // Breadcrumb: current page label derived from the navigation contract
  const navItems = buildNavigation(role).flatMap((section) => section.items);
  const currentPage = navItems.find(
    (item) => item.to === location.pathname || (item.path === '/' && location.pathname === roleHome),
  );
  const pageTitle = currentPage?.label ?? 'پیشخوان';

  const handleLogout = () => {
    logout();
    closePanels();
    showToast('success', 'با موفقیت از حساب خود خارج شدید.', 'خداحافظ');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const markAllRead = () => {
    setReadIds(roleAnnouncements.map((item) => item.id));
  };

  const selectedStudent =
    selectedResult?.kind === 'student'
      ? db.students.find((student) => student.id === selectedResult.id)
      : undefined;
  const selectedTeacher =
    selectedResult?.kind === 'teacher'
      ? db.teachers.find((teacher) => teacher.id === selectedResult.id)
      : undefined;
  const selectedAnnouncement =
    selectedResult?.kind === 'announcement'
      ? db.announcements.find((item) => item.id === selectedResult.id)
      : undefined;

  return (
    <header className="sticky top-0 z-20 flex h-header items-center border-b border-border bg-white/90 px-4 backdrop-blur-md sm:px-6">
      {/* Start: hamburger + breadcrumb */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="باز کردن منو"
          className="rounded-btn p-2 text-text-muted transition-colors hover:bg-slate-100 hover:text-text lg:hidden"
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <nav aria-label="مسیر صفحه" className="flex min-w-0 items-center gap-1.5 text-[12px]">
          <span className="hidden text-text-muted sm:inline">مدرسه‌یار</span>
          <ChevronLeft
            size={14}
            aria-hidden="true"
            className="hidden shrink-0 text-slate-300 sm:inline"
          />
          <span className="truncate text-[13px] font-bold text-text">{pageTitle}</span>
        </nav>
      </div>

      {/* End: search + bell + profile */}
      <div ref={actionsRef} className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpenPanel('search');
            }}
            onFocus={() => setOpenPanel('search')}
            placeholder="جستجوی دانش‌آموز، معلم یا اطلاعیه…"
            aria-label="جستجوی سراسری"
            aria-expanded={openPanel === 'search'}
            className="h-10 w-44 rounded-input border border-border bg-slate-50 ps-9 pe-8 text-[13px] text-text placeholder:text-slate-400 transition-all duration-200 focus:w-64 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 xl:w-52"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="پاک کردن جستجو"
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:bg-slate-200 hover:text-text"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}

          {/* Search results dropdown */}
          {openPanel === 'search' && trimmedQuery.length >= 2 && (
            <div className="animate-dropdown-in absolute start-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-card border border-border bg-surface shadow-cardHover">
              <p className="border-b border-border px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                نتایج جستجو برای «{trimmedQuery}»
              </p>
              {searchResults.length === 0 ? (
                <p className="px-4 py-6 text-center text-[12px] text-text-muted">
                  نتیجه‌ای یافت نشد.
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto p-1.5 scrollbar-thin">
                  {searchResults.map((result) => {
                    const item =
                      result.kind === 'student'
                        ? db.students.find((s) => s.id === result.id)
                        : result.kind === 'teacher'
                          ? db.teachers.find((t) => t.id === result.id)
                          : db.announcements.find((a) => a.id === result.id);
                    if (!item) return null;
                    const Icon =
                      result.kind === 'student'
                        ? GraduationCap
                        : result.kind === 'teacher'
                          ? Presentation
                          : Megaphone;
                    const subtitle =
                      result.kind === 'student'
                        ? `کد: ${'studentCode' in item ? item.studentCode : ''}`
                        : result.kind === 'teacher'
                          ? 'specialty' in item
                            ? item.specialty
                            : ''
                          : 'announcement';
                    return (
                      <li key={`${result.kind}-${result.id}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedResult(result);
                            closePanels();
                          }}
                          className="flex w-full items-center gap-3 rounded-btn px-2.5 py-2.5 text-start transition-colors hover:bg-slate-50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-slate-100 text-text-muted">
                            <Icon size={16} aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-semibold text-text">
                              {'name' in item ? item.name : item.title}
                            </span>
                            <span className="block truncate text-[10px] text-text-muted">
                              {result.kind === 'student' && 'دانش‌آموز'}
                              {result.kind === 'teacher' && 'معلم'}
                              {result.kind === 'announcement' && 'اطلاعیه'}
                              {subtitle && subtitle !== 'announcement' ? ` — ${subtitle}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => setOpenPanel((prev) => (prev === 'bell' ? null : 'bell'))}
          aria-label={`اعلان‌ها${unreadCount > 0 ? ` — ${toPersianDigits(unreadCount)} خوانده‌نشده` : ''}`}
          aria-expanded={openPanel === 'bell'}
          className="relative rounded-btn p-2.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
        >
          <Bell size={21} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute end-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white ring-2 ring-white">
              {toPersianDigits(Math.min(unreadCount, 9))}
            </span>
          )}
        </button>

        {/* Notifications dropdown */}
        {openPanel === 'bell' && (
          <div className="animate-dropdown-in absolute end-0 top-full z-30 mt-2 flex max-h-[480px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-cardHover">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <p className="text-[13px] font-bold text-text">
                اعلان‌ها{' '}
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold text-danger">
                    ({toPersianDigits(unreadCount)} جدید)
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-semibold text-primary transition-colors hover:text-primary-dark"
              >
                همه را خوانده‌ام
              </button>
            </div>
            <ul className="overflow-y-auto p-1.5 scrollbar-thin">
              {visibleAnnouncements.map((announcement) => {
                const unread = !readIds.includes(announcement.id);
                const priority = PRIORITY_BADGE[announcement.priority];
                return (
                  <li key={announcement.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setReadIds((prev) =>
                          prev.includes(announcement.id) ? prev : [...prev, announcement.id],
                        );
                        setSelectedResult({ kind: 'announcement', id: announcement.id });
                      }}
                      className="flex w-full items-start gap-3 rounded-btn px-2.5 py-2.5 text-start transition-colors hover:bg-slate-50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-blue-50 text-primary">
                        <Megaphone size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              'block flex-1 truncate text-[12px] leading-5',
                              unread ? 'font-bold text-text' : 'font-medium text-text-muted',
                            )}
                          >
                            {announcement.title}
                          </span>
                          {unread && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-primary"
                              aria-label="خوانده‌نشده"
                            />
                          )}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-[10px] text-text-muted">
                          <Badge variant={priority.variant} dot={false} className="px-2 py-0.5 text-[9px]">
                            {priority.label}
                          </Badge>
                          <span>{AUDIENCE_LABELS[announcement.audience]}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(announcement.createdAt)}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                closePanels();
                navigate(`${roleHome}/announcements`);
              }}
              className="border-t border-border px-4 py-2.5 text-center text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
            >
              مشاهده همه اطلاعیه‌ها
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

        {/* Profile */}
        <button
          type="button"
          onClick={() => setOpenPanel((prev) => (prev === 'profile' ? null : 'profile'))}
          aria-expanded={openPanel === 'profile'}
          aria-label="منوی حساب کاربری"
          className="flex items-center gap-2 rounded-btn p-1.5 transition-colors hover:bg-slate-100"
        >
          <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
          <span className="hidden max-w-[140px] text-start lg:block">
            <span className="block truncate text-[12px] font-bold leading-4 text-text">
              {currentUser.name}
            </span>
            <span className="block text-[10px] leading-4 text-text-muted">
              {ROLE_LABELS[role]}
            </span>
          </span>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={cn(
              'hidden text-text-muted transition-transform duration-200 sm:block',
              openPanel === 'profile' && 'rotate-180',
            )}
          />
        </button>

        {/* Profile dropdown */}
        {openPanel === 'profile' && (
          <div className="animate-dropdown-in absolute end-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-card border border-border bg-surface shadow-cardHover">
            <div className="flex items-center gap-3 border-b border-border bg-slate-50/60 p-4">
              <Avatar name={currentUser.name} color={currentUser.avatarColor} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-text">{currentUser.name}</p>
                <p className="truncate text-[10px] text-text-muted">{currentUser.email}</p>
                <Badge variant="primary" dot={false} className="mt-1.5 px-2 py-0.5 text-[9px]">
                  {ROLE_LABELS[role]}
                </Badge>
              </div>
            </div>
            <div className="p-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedResult({ kind: 'profile' });
                  closePanels();
                }}
                className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-[12px] font-medium text-text transition-colors hover:bg-slate-50"
              >
                <UserRound size={16} aria-hidden="true" className="text-text-muted" />
                پروفایل من
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-[12px] font-medium text-danger transition-colors hover:bg-red-50"
              >
                <LogOut size={16} aria-hidden="true" />
                خروج از حساب
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Details modal (search results / profile) ---------- */}
      <Modal
        open={selectedResult !== null}
        onClose={() => setSelectedResult(null)}
        title={
          selectedResult?.kind === 'student'
            ? 'مشخصات دانش‌آموز'
            : selectedResult?.kind === 'teacher'
              ? 'مشخصات معلم'
              : selectedResult?.kind === 'announcement'
                ? 'متن اطلاعیه'
                : 'پروفایل من'
        }
        description={
          selectedResult?.kind === 'profile'
            ? 'اطلاعات حساب کاربری شما در سامانه مدرسه‌یار'
            : undefined
        }
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedResult(null)}>
            بستن
          </Button>
        }
      >
        {selectedStudent && (
          <dl className="grid grid-cols-2 gap-4 text-[12px]">
            <div>
              <dt className="text-text-muted">نام و نام خانوادگی</dt>
              <dd className="mt-0.5 font-bold text-text">{selectedStudent.name}</dd>
            </div>
            <div>
              <dt className="text-text-muted">کد دانش‌آموزی</dt>
              <dd className="mt-0.5 font-bold text-text">
                {toPersianDigits(selectedStudent.studentCode)}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">پایه و رشته</dt>
              <dd className="mt-0.5 font-bold text-text">
                {selectedStudent.gradeLevel} {selectedStudent.field}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">کلاس</dt>
              <dd className="mt-0.5 font-bold text-text">
                {getClassById(db, selectedStudent.classId)?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">معدل کل</dt>
              <dd className="mt-0.5 font-bold text-text">
                {toPersianDigits(selectedStudent.gpa)} از ۲۰
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">نام ولی</dt>
              <dd className="mt-0.5 font-bold text-text">{selectedStudent.guardianName}</dd>
            </div>
          </dl>
        )}
        {selectedTeacher && (
          <dl className="grid grid-cols-2 gap-4 text-[12px]">
            <div>
              <dt className="text-text-muted">نام و نام خانوادگی</dt>
              <dd className="mt-0.5 font-bold text-text">{selectedTeacher.name}</dd>
            </div>
            <div>
              <dt className="text-text-muted">تخصص</dt>
              <dd className="mt-0.5 font-bold text-text">{selectedTeacher.specialty}</dd>
            </div>
            <div>
              <dt className="text-text-muted">شماره تماس</dt>
              <dd className="mt-0.5 font-bold text-text">
                {toPersianDigits(selectedTeacher.phone)}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">ایمیل</dt>
              <dd className="mt-0.5 font-bold text-text" dir="ltr">
                {selectedTeacher.email}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-text-muted">دروس تدریسی</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {selectedTeacher.subjectIds.map((subjectId) => (
                  <Badge key={subjectId} variant="info" dot={false}>
                    {getSubjectById(db, subjectId)?.name ?? subjectId}
                  </Badge>
                ))}
              </dd>
            </div>
          </dl>
        )}
        {selectedAnnouncement && (
          <div className="text-[13px]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={PRIORITY_BADGE[selectedAnnouncement.priority].variant}>
                {PRIORITY_BADGE[selectedAnnouncement.priority].label}
              </Badge>
              <Badge variant="neutral" dot={false}>
                {AUDIENCE_LABELS[selectedAnnouncement.audience]}
              </Badge>
              <span className="text-[11px] text-text-muted">
                {formatJalali(selectedAnnouncement.createdAt)}
              </span>
            </div>
            <p className="mt-3 text-[15px] font-bold leading-7 text-text">
              {selectedAnnouncement.title}
            </p>
            <p className="mt-2 leading-7 text-text-muted">{selectedAnnouncement.body}</p>
            <p className="mt-3 text-[11px] text-text-muted">
              نویسنده: {selectedAnnouncement.authorName}
            </p>
          </div>
        )}
        {selectedResult?.kind === 'profile' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} size="xl" />
            <div>
              <p className="text-base font-extrabold text-text">{currentUser.name}</p>
              <p className="mt-0.5 text-[12px] text-text-muted">{currentUser.title ?? ROLE_LABELS[role]}</p>
            </div>
            <dl className="grid w-full grid-cols-1 gap-3 text-start text-[12px] sm:grid-cols-2">
              <div className="rounded-btn bg-slate-50 p-3">
                <dt className="text-text-muted">ایمیل</dt>
                <dd className="mt-0.5 font-bold" dir="ltr">
                  {currentUser.email}
                </dd>
              </div>
              <div className="rounded-btn bg-slate-50 p-3">
                <dt className="text-text-muted">شماره تماس</dt>
                <dd className="mt-0.5 font-bold">{toPersianDigits(currentUser.phone)}</dd>
              </div>
              <div className="rounded-btn bg-slate-50 p-3">
                <dt className="text-text-muted">نقش</dt>
                <dd className="mt-0.5 font-bold">{ROLE_LABELS[role]}</dd>
              </div>
              <div className="rounded-btn bg-slate-50 p-3">
                <dt className="text-text-muted">نوع نشست</dt>
                <dd className="mt-0.5 font-bold">نمایشی (بدون ذخیره‌سازی)</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </header>
  );
}
