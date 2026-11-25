# TASK 04 — PARENT DASHBOARD (UH-04)

**Role:** Senior Frontend Developer
**Branch:** `feat/UH-04-parent-dashboard` (created from `main` @ `ac82a3c`)
**Scope:** `src/features/parent/` + the single agreed router swap (`src/app/router.tsx`, contract §4.1)

---

## 1. Repository inspection (done before coding)

| Checked | Finding |
| --- | --- |
| `package.json` | React 18 + TS strict + Vite 5 + Tailwind 3.4 + react-router 6 + lucide-react + **recharts 3.11.1** already installed. No new dependencies added. |
| Architecture | `src/app` (router/providers/guards), `src/components` (design system), `src/context` (AppContext), `src/data` (mock db + query helpers), `src/types`, `src/constants` (`buildNavigation`), `src/utils` (Persian digits + Jalali). |
| Shared components | `Button, Input, Select, Modal, Table, Badge, Avatar, StatCard, EmptyState, PageHeader, DashboardLayout, Sidebar, Header, Toaster` — all used, none modified. |
| TypeScript interfaces | `Student, Parent, Grade, Attendance, Homework, Payment, Announcement, Message, ScheduleEntry, SchoolClass, Subject, Teacher` — all consumed as-is. |
| AppContext | `useAuth · useData { db, updateEntity, resetDemoData } · useToast · useUi`. Used as the single source of truth. |
| Integration doc | `docs/INTEGRATION_CONTRACT.md` — followed §0 (golden rules), §3 (design system), §4 (routing), §5 (context), §6 (component catalog), §10 (definition of done). |

**Baseline status of `main` before this work:** `npm run lint` clean; `npx vite build` succeeds;
`npm run build` (`tsc -b && vite build`) **already fails** on two shared files (see §8).

---

## 2. Created files (30 files, ~7,200 lines, all inside `src/features/parent/`)

### Entry / routes
| File | Purpose |
| --- | --- |
| `index.ts` | Public barrel — `export { default } from './ParentApp'` |
| `ParentApp.tsx` | Nested `<Routes>` for `/parent/*` + `ParentSessionProvider` + `ParentTopbar` |

### Pages (`pages/`)
| File | Route | Contents |
| --- | --- | --- |
| `DashboardPage.tsx` | `/parent` | Parent profile, children overview, 4 KPI cards, recent grades, attendance strip (14 days), pending homework, recent absences (with **fix status** action), finance snapshot, announcements, class facts |
| `ChildrenPage.tsx` | `/parent/child` | Child dossier: identity, class info, teachers + contacts, weekly timetable browser, siblings comparison, “پرونده کامل” modal |
| `GradesPage.tsx` | `/parent/grades` | KPIs, subject-average bar chart, grade-progress line chart, score distribution, subject radar, subject-average table, filterable/searchable grade list |
| `ComparePage.tsx` | `/parent/grades/compare` | Record comparison: multi-child grouped bars by metric (average / coefficient / grade count) **or** single-child “exam type vs overall average”; comparison table for all children |
| `AttendancePage.tsx` | `/parent/attendance` | KPIs, status composition bars, attendance calendar, filterable history table, teacher notes, **excuse-request flow** |
| `HomeworkPage.tsx` | `/parent/homework` | KPIs, status filter rail, homework cards (deadline, days left, description), **mark done / undo**, detail modal |
| `FinancePage.tsx` | `/parent/payments` | Tuition KPIs, payment progress donut, next due, invoice table (filterable), **payment simulation modal**, **receipt modal**, payment history |
| `AnnouncementsPage.tsx` | `/parent/announcements` | School vs. teacher announcements, priority badges, pinned items, search, expand/collapse |
| `MessagesPage.tsx` | `/parent/messages` | Inbox/outbox list, message detail + thread context, **compose modal with validation**, reply, mark-as-read |
| `SchedulePage.tsx` | `/parent/schedule` | Weekly timetable by day, class facts, teacher list |

### Components (`components/`)
`SectionCard.tsx` (card shell) · `ChildSelector.tsx` (multi-child dropdown) · `ChildProfileCard.tsx` ·
`AcademicSummary.tsx` · `AttendanceSummary.tsx` · `ParentTopbar.tsx` (persistent child context bar) ·
`StudentProfileModal.tsx` · `DomainBadge.tsx` (badge maps from contract §6) ·
`charts/AcademicCharts.tsx` (6 Recharts visualisations)

### Logic (`lib/`, `hooks/`)
`lib/parentAnalytics.ts` — pure derivations (weighted GPA, subject averages, pass rate, trend,
attendance rate, homework state, finance totals, class/teacher joins, parent record resolver)
`lib/chartTheme.ts` — chart palette + Persian formatters + typed tooltip formatters
`lib/demoFamily.ts` — demo second child (see §7)
`hooks/useParentChild.ts` — one hook that resolves the focused child + all summaries
`hooks/parent-session.ts` + `hooks/ParentSessionProvider.tsx` — runtime-only session state
`tests/e2e.mjs` — Playwright suite (60 checks)

## 3. Modified files (1)

| File | Change |
| --- | --- |
| `src/app/router.tsx` | Replaced `<FeaturePlaceholder role="parent" />` with a **lazy-loaded** `<ParentApp />` inside `<Suspense>` — the integration point explicitly allowed by contract §4.1. `admin / teacher / student` routes untouched. |

No other shared file was touched: `src/components`, `src/context`, `src/hooks`, `src/types`,
`src/data`, `src/constants`, `src/utils`, `src/styles`, `package.json` are all unmodified.

---

## 4. Implemented features vs. requirements

| Requirement | Status |
| --- | --- |
| Parent profile | ✅ profile card (name, relation, phone, occupation, children count, unread) |
| Child information | ✅ dossier, class, room, capacity, homeroom teacher, enrolled date |
| Academic average | ✅ **weighted** by subject coefficient + simple average |
| Attendance percentage | ✅ present + late + excused ÷ recorded days |
| Recent grades | ✅ dashboard table + full filterable list |
| Recent absences | ✅ dashboard list, with working “ثبت موجه بودن” action |
| Pending homework | ✅ status-classified cards (overdue / due-soon / pending / completed) |
| School announcements | ✅ dashboard + full page (school & teacher tabs) |
| Child selector (multi) | ✅ dropdown in the persistent top bar, works on every page |
| View teachers / academic details | ✅ teacher list with subjects, phone (`tel:`) and email |
| Subject averages / exam results | ✅ per-subject table (best/worst/count/coefficient) + charts |
| Performance charts | ✅ 6 Recharts charts, fully Persian-labelled |
| Compare available records | ✅ sibling comparison + single-child record comparison |
| Attendance history / absent / late / statistics | ✅ table, calendar, composition bars, notes |
| Homework deadlines / completion / descriptions | ✅ + detail modal |
| Tuition / status / history / outstanding | ✅ **visual simulation only** — no transaction anywhere |
| Messages + simulated send + history | ✅ compose modal, validation, written to shared `db.messages` |
| Shared data integration | ✅ reads live `db`; a change made by admin/teacher/student shows immediately |
| No duplicate student records | ✅ all joins go through `db` (see §7 for the one additive demo child) |
| No placeholder pages / dead buttons | ✅ every button does something real or explains the simulation via toast |
| Persian + RTL + Vazirmatn + blue palette | ✅ verified in-browser (`dir=rtl`, `lang=fa`, computed font = Vazirmatn) |
| Responsive desktop / tablet / mobile | ✅ 0 px horizontal overflow at 1440, 834 and 390 px |

### Everything resets on refresh
All mutations live in `AppContext` / local React state. Verified in-browser: reloading any
`/parent/*` page returns to `/login` and the mock db is re-created.

### Simulated interactions (all in-memory, all reversible)
1. **Mark homework done / undo** — session state, toast feedback.
2. **Excuse request** — flips an `absent` record to `excused` in the shared `db.attendance`
   (visible to admin/teacher views too).
3. **Send message** — prepends to `db.messages` + local thread list, validation on subject/body.
4. **Read receipt** — `db.messages.read = true`.
5. **Payment / receipt** — explicit simulation, no state change, clear disclaimer.

---

## 5. Build & quality results

```text
npx tsc -b              → ✅ 0 errors in src/features/parent (and everywhere else)
npx eslint .            → ✅ 0 errors, 0 warnings
npx vite build          → ✅ built successfully  (main chunk 270.95 kB gzip 81.65 kB
                                                    parent chunk 647 kB gzip 178 kB, lazy)
npm run build           → ⚠️ fails ONLY on 2 pre-existing shared files (see §8)
```

### Automated browser validation (`src/features/parent/tests/e2e.mjs`)
```text
$ node src/features/parent/tests/e2e.mjs      # requires the dev server on :5173
60/60 checks passed
```
Covers: parent login → dashboard content → all 8 sidebar routes → homework page →
6 charts + Persian axis digits → grade filter + search → compare page + metric switch →
homework toggle → attendance excuse flow → message send + open + validation →
finance simulation + receipt → announcements expand + teacher tab → link to compare →
child selector (2 children, persists across pages) → reload resets session →
mobile (390 px) 5 pages, no overflow → tablet (834 px) → **zero console/page errors**.

---

## 6. Integration instructions

Nothing is required beyond merging the branch — the router already points at the feature:

```tsx
// src/app/router.tsx (already committed on this branch)
const ParentApp = lazy(() => import('../features/parent'));

<Route path={`${ROUTES.PARENT}/*`} element={<RequireRole role="parent"><DashboardLayout /></RequireRole>}>
  <Route path="*" element={
    <Suspense fallback={<FeatureFallback />}><ParentApp /></Suspense>
  } />
</Route>
```

Login with the demo account **`parent@school.ir` / `parent123`** (or the “ورود با حساب نمایشی” button)
→ lands on `/parent`.

Routing map (matches `buildNavigation('parent')`):

| Path | Page |
| --- | --- |
| `/parent` | Dashboard |
| `/parent/child` | فرزند من |
| `/parent/grades` | Grades |
| `/parent/grades/compare` | Performance comparison (linked from the Grades header) |
| `/parent/attendance` | Attendance |
| `/parent/homework` | Homework (linked from the dashboard) |
| `/parent/payments` | Finance |
| `/parent/announcements` | Announcements |
| `/parent/messages` | Messages |
| `/parent/schedule` | Schedule |

Repo hygiene: `dist/` is git-ignored; `playwright` was installed locally with `--no-save`
so `package.json` / `package-lock.json` are untouched. To re-run the browser suite:
`npm i -D playwright --no-save && npx playwright install chromium && npm run dev`
then `node src/features/parent/tests/e2e.mjs`.

---

## 7. Things the team lead should know

### 7.1 Demo parent has only ONE child → multi-child features had nothing to show
`src/data/users.ts` links `u-parent` to `['s-01']`, so the child selector would render as a
static chip and the sibling comparison would have nothing to compare.

**How I handled it (no shared file touched, no duplicated record):**
`src/features/parent/lib/demoFamily.ts` defines ONE extra child (`s-25 علی محمدی`, same class
`c-01`, with 5 attendance rows, 3 grades and 2 invoices). `ParentSessionProvider` seeds it **once
per session into the shared in-memory `db`** (`db.students`, `db.grades`, `db.attendance`,
`db.payments`) — so it is a genuine db record that every consumer sees, not a parallel copy.
It disappears on reload like all other demo data.

**Recommended permanent fix (then delete `demoFamily.ts` and its seeding effect):**
1. add `s-25` to `src/data/students.ts`
2. add `'s-25'` to the demo parent's `studentIds` in `src/data/users.ts`
3. move the 5 attendance / 3 grade / 2 payment rows from `demoFamily.ts` into their seed files
4. delete `src/features/parent/lib/demoFamily.ts` and the seeding `useEffect`

The panel works with 1 child or with N children with no code change.

### 7.2 Sidebar gap: «تکالیف» is not in the parent navigation
In `src/constants/navigation.ts` the `homework` item is `roles: ['teacher', 'student']`, so
parents have **no sidebar link** to the Homework page. As instructed, I did **not** modify the
shared constant. The page is fully implemented and reachable from the dashboard
(“همه تکالیف” link) and the persistent top-bar quick link “تکالیف”.

**Requested change (shared file, needs team-lead sign-off):**
```diff
- { label: 'تکالیف', path: '/homework', icon: NotebookPen, roles: ['teacher', 'student'] },
+ { label: 'تکالیف', path: '/homework', icon: NotebookPen, roles: ['teacher', 'student', 'parent'] },
```

### 7.3 Navigation gap: no sidebar entry for the comparison page
There is no nav item for `/parent/grades/compare`; it is reached from the Grades page header
button. If you want it in the sidebar, add:
`{ label: 'مقایسهٔ عملکرد', path: '/grades/compare', icon: GitCompareArrows, roles: ['parent'] }`
(and include `/grades/compare` in the `academic` group of `buildNavigation`).

### 7.4 Pre-existing build failure on `main` (NOT caused by this feature)
`src/lib/axios.ts` imports `axios` and `src/lib/queryClient.ts` imports `@tanstack/react-query`;
neither package is in `package.json`, so `tsc -b` (and therefore `npm run build`) fails.
Nothing in the app imports `src/lib/*`, and both files violate the frontend-only contract.
**Recommendation:** delete `src/lib/axios.ts` and `src/lib/queryClient.ts` (or add the deps).
The parent feature compiles and bundles cleanly — `npx vite build` succeeds.

### 7.5 Bundle size note
Recharts is the bulk of the parent chunk. It is imported only inside
`src/features/parent/`, which is lazy-loaded, so admin/teacher/student bundles are unchanged
(main chunk stayed at ~271 kB). If a production budget matters, `manualChunks` for
`recharts` in `vite.config.ts` (shared file) would split it further.

### 7.6 Chart notes
- All axes/tooltips/labels are Persian-ised through `lib/chartTheme.ts` helpers (no inline
  `toLocaleString` in pages).
- The subject-profile radar falls back to a readable list when a child has fewer than
  3 graded subjects (a radar with 1–2 axes is a degenerate line).

---

## 8. Final checklist (contract §10)

- [x] Lives in `src/features/parent/`, default-exported from `index.ts`
- [x] All routes nested under `/parent/*`; router swapped per §4.1
- [x] Only shared components + local subcomponents
- [x] `npx tsc -b` clean · `npm run lint` clean
- [x] Zero storage / network APIs (grep-verified: `localStorage|sessionStorage|indexedDB|document.cookie|fetch(|axios|XMLHttpRequest|WebSocket|firebase|supabase` → no matches)
- [x] RTL + Persian digits + Jalali dates throughout
- [x] Sidebar link expectations match `buildNavigation` (except the two gaps reported in §7.2/§7.3)
- [x] No placeholder pages, no non-functional buttons
- [x] Only `src/features/parent/` + the agreed `src/app/router.tsx` change
