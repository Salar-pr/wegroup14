# مدرسه‌یار — Integration Contract & Architecture Guide

**Owner:** Team Leader / Frontend Foundation (`chore/UH-01-project-foundation`)
**Audience:** Feature teams (Admin, Teacher, Student, Parent dashboards)
**Status:** Frozen contract — do not change shared APIs without notifying the team lead.

---

## 0. Golden rules (non-negotiable)

1. **Frontend-only.** No backend, no REST/GraphQL, no database, no Firebase/Supabase, no server-side auth, no external data service of any kind.
2. **No persistent browser storage.** `localStorage`, `sessionStorage`, `IndexedDB`, `Cookies` are **forbidden** for app data. Everything lives in React runtime memory (`AppContext`) and resets on reload — this is intentional.
3. **Persian + RTL everywhere.** `<html dir="rtl" lang="fa">`. All user-facing copy in Persian. Numbers rendered via `toPersianDigits`; dates via the Jalali helpers.
4. **One design system.** Use the shared components in `src/components/` and the design tokens in `tailwind.config.js` / `src/styles/index.css`. Do not invent new primary colors, radii, or shadows.
5. **All interactions are UI simulations** on top of mock data.

---

## 1. Repository map & ownership

```
src/
├── app/                    ← foundation (team lead)   — router, providers, guards, shells
├── components/             ← foundation (team lead)   — shared design system
│   ├── ui/                 Button, Input, Select, Modal, Table, Badge, Avatar, StatCard, EmptyState
│   ├── layout/             DashboardLayout, PageHeader
│   ├── navigation/         Sidebar, Header
│   ├── feedback/           Toaster
│   ├── common/             FeaturePlaceholder
│   └── index.ts            ← public barrel: `import { Button } from '@/components'` (relative path `../components`)
├── context/                ← foundation (team lead)   — AppContext (AppProvider, AppContextValue)
├── hooks/                  ← foundation (team lead)   — useApp, useAuth, useToast, useData, useUi
├── types/                  ← foundation (team lead)   — all domain interfaces
├── data/                   ← foundation (team lead)   — mock database + query helpers
├── constants/              ← foundation (team lead)   — ROUTES, ROLE_HOME, ROLE_LABELS, buildNavigation
├── utils/                  ← foundation (team lead)   — cn, persian digits, jalali dates, validators, delay
├── styles/                 ← foundation (team lead)   — tailwind entry + tokens + animations
├── features/
│   └── auth/               ← foundation (team lead)   — LoginPage
│   └── admin/  ← FEATURE TEAM (not implemented yet)
│   └── teacher/← FEATURE TEAM (not implemented yet)
│   └── student/← FEATURE TEAM (not implemented yet)
│   └── parent/ ← FEATURE TEAM (not implemented yet)
```

Feature teams create **only** their own `src/features/<role>/` folder (plus the tiny router edit described in §4). They must not modify `src/app`, `src/components`, `src/context`, `src/hooks`, `src/types`, `src/data`, `src/constants`, `src/utils`, `src/styles` without team-lead approval.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript (strict, `noUnusedLocals`) |
| Build | Vite 5 (`npm run dev` / `npm run build` = `tsc -b && vite build`) |
| Styling | Tailwind CSS **3.4** (compatible with this Vite setup) |
| Routing | react-router-dom 6 (`BrowserRouter`) |
| Icons | lucide-react |
| Charts | recharts 3 (installed & ready — use it for dashboards) |
| Font | Vazirmatn via self-hosted `@fontsource/vazirmatn` (no runtime external requests) |
| State | React Context (`src/context/AppContext.tsx`) — **no Redux, no Zustand, no react-query, no axios** |

```bash
npm install        # install deps
npm run dev        # dev server on 0.0.0.0:5173
npm run build      # MUST pass before any PR
npm run lint       # eslint, must be clean
```

Demo accounts (all roles): `admin@school.ir/admin123`, `teacher@school.ir/teacher123`, `student@school.ir/student123`, `parent@school.ir/parent123`.

---

## 3. Design system (mandatory)

### 3.1 Color palette (Tailwind names)

| Token | Hex | Usage |
|---|---|---|
| `primary` (DEFAULT) | `#2563EB` | primary actions, active nav, focus rings |
| `primary-dark` | `#1D4ED8` | hover |
| `primary-navy` | `#1E3A8A` | brand/auth panel |
| `background` | `#F8FAFC` | app canvas |
| `surface` | `#FFFFFF` | cards, header, sidebar |
| `text` | `#0F172A` | main text |
| `text-muted` | `#64748B` | secondary text |
| `border` | `#E2E8F0` | hairline borders |
| `success` / `warning` / `danger` / `info` | `#16A34A` / `#F59E0B` / `#DC2626` / `#0EA5E9` | semantic states |

Soft badge tones (`bg-*-50 text-*-700 ring-*-200`) are already wired into `<Badge variant="…">`.

### 3.2 Radii, elevation, sizing

- Cards: `rounded-card` (**14px**) · Buttons/inputs: `rounded-btn` / `rounded-input` (**10px**) · Modals: `rounded-modal` (**16px**)
- Shadows: `shadow-card` (resting), `shadow-cardHover`, `shadow-modal`
- Sidebar: 250px expanded / 76px collapsed (`lg:ps-sidebar` / `lg:ps-sidebar-collapsed` offset the content)
- Header: 72px (`h-header`), white/90 + `backdrop-blur`
- Layout container: `mx-auto w-full max-w-content-max`

### 3.3 Persian formatting helpers (`src/utils`)

```ts
import { toPersianDigits, formatNumber, formatToman, formatScore,
         formatJalali, formatJalaliShort, formatJalaliWithWeekday, formatRelativeTime, cn } from '../utils';

toPersianDigits(1402)        // «۱۴۰۲»
formatToman(4_800_000)       // «۴٬۸۰۰٬۰۰۰ تومان»
formatScore(18.75)           // «۱۸٫۷۵ از ۲۰»
formatJalali('2026-11-24')   // «۳ آذر ۱۴۰۵»
formatRelativeTime(msg.createdAt) // «۲ ساعت پیش»
```

**Rule:** never hard-code Persian digits or hand-format ISO dates in feature code.

### 3.4 RTL rules

- Prefer logical utilities: `ps-*`/`pe-*`, `ms-*`/`me-*`, `start-*`/`end-*`, `text-start`/`text-end`, `border-e`, `rounded-s-*`.
- Use `gap` (never `space-x-*`) for flex/grid spacing.
- Physical `left-*`/`right-*` only for cases that are direction-agnostic (e.g., the toast stack) — and document why.
- Icon buttons need Persian `aria-label`s.

---

## 4. Routing contract

```
/login                     public — LoginPage (role selection + demo accounts)
/                          role-aware redirect → /admin | /teacher | /student | /parent
/admin/*                   RequireRole("admin")   + DashboardLayout
/teacher/*                 RequireRole("teacher") + DashboardLayout
/student/*                 RequireRole("student") + DashboardLayout
/parent/*                  RequireRole("parent")  + DashboardLayout
*                          NotFoundPage (Persian 404)
```

- Anonymous users hitting a protected route → `Navigate` to `/login` (deep link preserved in `location.state.from`).
- Authenticated user with the wrong role → Persian **«دسترسی غیرمجاز» (403)** screen with a link back to their own dashboard.
- **Sessions die on refresh (by design)** — there is nothing in storage, so a reload lands on `/login`.

### 4.1 How feature teams replace the placeholder

Today every `/<role>/*` renders `<FeaturePlaceholder role="…" />` so deep links never dead-end. When your feature is ready, edit `src/app/router.tsx` (the only shared file you may touch, by arrangement):

```tsx
// src/app/router.tsx
import { lazy, Suspense } from 'react';
import { LoadingFallback } from '../components'; // or your own skeleton

const AdminApp = lazy(() => import('../features/admin'));

<Route path={`${ROUTES.ADMIN}/*`} element={<RequireRole role="admin"><DashboardLayout /></RequireRole>}>
  <Route path="*" element={
    <Suspense fallback={<div className="p-8 text-text-muted">در حال بارگذاری…</div>}>
      <AdminApp />
    </Suspense>
  } />
</Route>
```

…with `src/features/admin/index.tsx` default-exporting your dashboard `<Routes>` (a nested `<Routes>` inside `/admin/*` works, or use react-router 6.4 `<Route object>` children — either is fine as long as `/admin` itself renders something meaningful).

### 4.2 Sidebar paths (already wired)

`buildNavigation(role)` in `src/constants/navigation.ts` produces role-filtered sections; `path` is **relative to the role home** (`/admin/students`, `/teacher/grades`, `/student/report-card`, `/parent/payments`, …). Every sidebar link resolves today (renders the placeholder); your nested routes take over all paths under `/<role>/*` automatically.

To add/rename a sidebar entry, coordinate with the team lead — `navigation.ts` is shared.

---

## 5. AppContext API (the single source of truth)

```tsx
import { useApp, useAuth, useData, useToast, useUi } from '../hooks';
```

### 5.1 Auth — `useAuth()`

```ts
const { currentUser, isAuthenticated, login, loginAsRole, logout, hasRole } = useAuth();

// login(email, password): Promise<{ ok: true; user: User } | { ok: false; error: string }>
//   — validates against the demo directory (src/data/users.ts) with ~750ms simulated latency.
// loginAsRole(role: UserRole): Promise<User>                      — one-click demo login
// logout(): void                                                 — clears runtime session
// hasRole(...roles: UserRole[]): boolean
```

`currentUser` is a `User` (never carries a password):

```ts
interface User {
  id: string; name: string; email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone: string; avatarColor: string;
  title?: string;              // «دبیر ریاضی و حسابان»
  classId?: string;            // students only
  studentIds?: string[];       // parents only
}
```

### 5.2 Data — `useData()`

The **entire mock database** lives here, in memory only:

```ts
const { db, updateEntity, resetDemoData } = useData();
```

```ts
interface Database {
  students: Student[]; teachers: Teacher[]; parents: Parent[];
  classes: SchoolClass[]; subjects: Subject[];
  grades: Grade[]; attendance: Attendance[]; homework: Homework[];
  announcements: Announcement[]; payments: Payment[];
  messages: Message[]; schedule: ScheduleEntry[];
}
```

**Reading (query helpers in `src/data`, all take a `db` snapshot):**

```ts
import { getStudentById, getStudentsByClass, getGradesForStudent,
         getPaymentsForStudent, getUnreadMessagesForUser,
         getScheduleForClass, getAnnouncementsForAudience } from '../data';
```

**Writing (type-safe generic updater):**

```ts
updateEntity('attendance', (items) =>
  items.map((a) => (a.studentId === studentId && a.date === today ? { ...a, status: 'present' } : a)),
);

updateEntity('messages', (items) => items.map((m) => (m.to.id === currentUser.id ? { ...m, read: true } : m)));

updateEntity('announcements', (items) => [
  { id: `an-${Date.now()}`, title, body, audience: 'all', priority: 'normal',
    authorName: currentUser.name, createdAt: new Date().toISOString(), pinned: false },
  ...items,
]);
```

`resetDemoData()` restores the pristine mock snapshot (useful for demos/tests).

### 5.3 Toasts — `useToast()`

```ts
const { showToast, dismissToast, toasts } = useToast();
showToast('success', 'کارنامه با موفقیت ثبت شد.');            // title optional (3rd arg)
showToast('error', 'ثبت با خطا مواجه شد.', 'خطا');
showToast('info' | 'warning', '…');
```

Toasts auto-dismiss (~4.5s), stack bottom-inline-end, Persian labels, `aria-live="polite"`. Render once via `<Toaster />` — already mounted in `Providers`.

### 5.4 Layout shell — `useUi()`

```ts
const { sidebarOpen, toggleSidebar, closeSidebar,        // mobile drawer
        sidebarCollapsed, toggleSidebarCollapsed } = useUi(); // desktop icon rail
```

Feature pages normally don't need this (Sidebar/Header handle it) — hook into it only for custom chrome.

---

## 6. Component catalog (import from `src/components`)

All components are RTL-first, responsive (mobile → desktop), and follow the §3 tokens. Every example below compiles against the current codebase.

### Button
```tsx
<Button variant="primary" size="md" leftIcon={Plus} isLoading={saving} onClick={save}>افزودن دانش‌آموز</Button>
// variants: primary | secondary | outline | ghost | danger | success
// sizes: sm | md | lg · fullWidth · disabled · type
```

### Input
```tsx
<Input label="نام و نام خانوادگی" required leftIcon={UserRound}
       error={errors.name} hint="مثال: سارا محمدی" value={name} onChange={…} />
// 10px radius, 44px height, accessible label/error/aria wiring included
```

### Select
```tsx
<Select label="پایه تحصیلی" options={[{ value: 'دهم', label: 'دهم' }, …]} placeholder="انتخاب کنید" … />
```

### Modal
```tsx
<Modal open={open} onClose={close} title="تأیید حذف" size="sm"
       footer={<>
         <Button variant="ghost" onClick={close}>انصراف</Button>
         <Button variant="danger" onClick={confirm}>حذف</Button>
       </>}>
  آیا از حذف این رکورد مطمئن هستید؟
</Modal>
// Portal, backdrop blur, Escape + overlay click close, body scroll lock, 16px radius
// sizes: sm | md | lg | xl
```

### Table (generic, typed)
```tsx
<Table<Student>
  data={filtered}
  rowKey={(s) => s.id}
  caption="لیست دانش‌آموزان"
  columns={[
    { key: 'name', header: 'نام', sortValue: (s) => s.name,
      render: (s) => <Avatar name={s.name} size="sm" color={s.avatarColor} /> },
    { key: 'class', header: 'کلاس', render: (s) => classNameOf(s.classId) },
    { key: 'gpa', header: 'معدل', sortValue: (s) => s.gpa, align: 'center',
      render: (s) => toPersianDigits(s.gpa) },
    { key: 'status', header: 'وضعیت', render: (s) => <Badge variant={s.status === 'active' ? 'success' : 'danger'}>{s.status === 'active' ? 'فعال' : 'معلق'}</Badge> },
  ]}
  pageSize={8}          // 0 disables pagination
  loading={isLoading}   // skeleton rows
  emptyTitle="دانش‌آموزی یافت نشد"
/>
// Built-in: sortable headers (fa locale), client pagination, skeleton loading, empty state
```

### Badge / Avatar
```tsx
<Badge variant="success | warning | danger | info | primary | neutral" dot>فعال</Badge>
<Avatar name="سارا محمدی" color={user.avatarColor} size="md" />
// sizes: xs | sm | md | lg | xl — initials (first+last word) auto-computed, Persian-safe
```

### StatCard / EmptyState / PageHeader
```tsx
<StatCard title="دانش‌آموزان فعال" value={toPersianDigits(312)} icon={GraduationCap} tone="primary"
          trend={{ value: '٪۴+', direction: 'up', positive: true }} hint="نسبت به ماه گذشته" />

<EmptyState icon={Inbox} title="پیامی ندارید" description="پیام‌های جدید اینجا نمایش داده می‌شود."
            actionLabel="پیام جدید" onAction={openCompose} />

<PageHeader title="مدیریت دانش‌آموزان" description="مشاهده، ویرایش و ثبت دانش‌آموزان مدرسه"
  breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'دانش‌آموزان' }]}
  actions={<Button leftIcon={Plus}>افزودن دانش‌آموز</Button>} />
```

### Status badge maps (suggested, keep consistent)

| Domain | Mapping |
|---|---|
| Payment | paid → `success` «پرداخت‌شده» · pending → `warning` «در انتظار» · overdue → `danger` «معوقه» |
| Attendance | present → `success` · late → `warning` · absent → `danger` · excused → `info` |
| Priority | urgent → `danger` · important → `warning` · normal → `neutral` |
| Grade | ≥17 `success` · 12–17 `warning` · <12 `danger` |

---

## 7. Domain models (full list — see `src/types`)

`Student, Teacher, Parent, SchoolClass, Subject, Grade, Attendance, Homework, Announcement, Payment, Message, ScheduleEntry` + `User/DemoAccount` + `Toast`.

Conventions:
- IDs are short strings (`s-01`, `t-03`, `c-01`, `sub-02`, `g-17`, …). Create new IDs with `crypto.randomUUID()` or a monotonic counter — never reuse.
- Dates are ISO strings. Jalali display happens **only** via `src/utils/date`.
- Money is integer **Toman**. Scores are 0–20.
- Payloads reference each other by ID — always join through `useData()` snapshots + helpers (`getClassById(db, …)`), never snapshot stale copies at module scope.

Mock data volumes: 24 students · 8 teachers · 10 parents · 6 classes · 12 subjects · 36 grades · 28 attendance records · 8 homework · 8 announcements · 10 payments · 8 messages · 34 schedule entries (full week for دهم ریاضی ۱).

---

## 8. Page template (copy-paste starting point)

```tsx
import { Button, PageHeader, StatCard, Table, Badge, Avatar } from '../../components';
import { useData, useToast } from '../../hooks';
import { toPersianDigits } from '../../utils';
import { getClassById } from '../../data';
import type { Student } from '../../types';

```tsx
export default function AdminStudentsPage() {
  const { db } = useData();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () => db.students.filter((s) => s.name.includes(query) || s.studentCode.includes(query)),
    [db.students, query],
  );

  return (
    <>
      <PageHeader title="دانش‌آموزان" description="لیست کامل دانش‌آموزان مدرسه"
        actions={<Button leftIcon={Plus} onClick={() => showToast('info', 'نمونه')}>افزودن دانش‌آموز</Button>} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="کل دانش‌آموزان" value={toPersianDigits(db.students.length)} icon={GraduationCap} />
        {/* … */}
      </div>
      <div className="mt-6">
        <Table data={rows} rowKey={(s) => s.id} columns={[/* … */]} />
      </div>
    </>
  );
}
```

---

## 9. Do / Don't

**Do**
- Import shared UI from `../components` (the barrel).
- Keep feature state local (`useState`/`useMemo`) and shared/demo state in `AppContext`.
- Run `npm run build` and `npm run lint` before pushing.
- Write Persian UI copy; use `toPersianDigits`/Jalali helpers.
- Ask before adding new shared components or tokens.

**Don't**
- ❌ `localStorage` / `sessionStorage` / `indexedDB` / cookies / any persistence
- ❌ `fetch`/`axios`/XHR/WebSocket to any server; no new data services
- ❌ new color systems or gradients per dashboard
- ❌ editing `src/styles` tokens or shared component APIs without team-lead sign-off
- ❌ deleting/rewriting shared files; feature branches only touch `src/features/<role>/` (+ the agreed router swap)
- ❌ business logic in components that belongs in `src/utils`

---

## 10. Definition of done for a feature dashboard

- [ ] Lives in `src/features/<role>/`, default-exported from `index.tsx`
- [ ] All its routes nested under `/<role>/*` (router swapped per §4.1)
- [ ] Uses only shared components or clearly-local subcomponents
- [ ] `npm run build && npm run lint` clean
- [ ] Zero network calls; zero storage APIs (grep for `localStorage|sessionStorage|indexedDB|document.cookie|fetch(|axios`)
- [ ] RTL + Persian digits + Jalali dates throughout
- [ ] Sidebar link expectations match `buildNavigation` paths

## 11. Change policy for shared contracts

Any change to `src/types`, `src/data` shapes, `AppContext` API, route bases, sidebar paths, or design tokens **requires a message to the team first**. Breaking a consumer silently violates the contract and will be reverted.
