# TASK 03 — Student Dashboard (`feat/UH-03-student-dashboard`)

## راهنمای یکپارچه‌سازی و گزارش تحویل (Integration & Handover Guide)

تمامی صفحات، کامپوننت‌ها، نمودارها و منطق مشتق‌سازی **پنل دانش‌آموز** به‌صورت کاملاً ماژولار و ایزوله در مسیر اختصاصی `src/features/student/` پیاده‌سازی شده است.

---

## ۱. رعایت محدودیت‌های معماری مشترک

مطابق قوانین سخت‌گیرانه تسک (بخش ۲ و ۵)، **هیچ فایل مشترکی در کل مخزن تغییر نکرده است**:

- `src/app/` — بدون تغییر
- `src/components/` — بدون تغییر (استفاده مستقیم از `Button`, `Input`, `Select`, `Modal`, `Table`, `Badge`, `Avatar`, `StatCard`, `EmptyState`, `PageHeader`)
- `src/context/`، `src/hooks/`، `src/types/`، `src/data/`، `src/constants/`، `src/utils/`، `src/styles/`، `package.json` — همگی کاملاً دست‌نخورده

---

## ۲. دستورالعمل اتصال به روتر اصلی (`src/app/router.tsx`)

مطابق `docs/INTEGRATION_CONTRACT.md` (بخش ۴.۱)، تیم‌لید محترم هنگام ادغام نهایی تنها کافی است placeholder نقش `student` در `src/app/router.tsx` را با کامپوننت `StudentApp` جایگزین کند:

```tsx
// src/app/router.tsx
import { lazy, Suspense } from 'react';

const StudentApp = lazy(() => import('../features/student'));

// در بخش Student area:
<Route
  path={`${ROUTES.STUDENT}/*`}
  element={
    <RequireRole role="student">
      <DashboardLayout />
    </RequireRole>
  }
>
  <Route
    path="*"
    element={
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center p-8 text-sm text-text-muted">
            در حال بارگذاری پنل دانش‌آموز…
          </div>
        }
      >
        <StudentApp />
      </Suspense>
    }
  />
</Route>;
```

> همچنین `StudentApp` به‌صورت named export (`import { StudentApp } from '../features/student'`) نیز صادر شده است.

---

## ۳. جدول مسیرها و صفحات پیاده‌سازی‌شده

تمامی صفحات الزامی TASK 03 و همچنین تمام لینک‌های تعریف‌شده برای نقش `student` در `buildNavigation('student')` پوشش داده شده‌اند تا هیچ لینک منویی بدون صفحه نماند:

| مسیر                     | فایل صفحه                     | شرح قابلیت‌ها                                                                                                                                                                |
| ------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/student`               | `pages/DashboardPage.tsx`     | خلاصه پروفایل، پایه و کلاس، معدل وزنی، درصد حضور، کلاس‌های پیش‌رو، تکالیف در انتظار (با ارسال سریع)، نمودار عملکرد، نمرات اخیر و اطلاعیه‌های اخیر                            |
| `/student/schedule`      | `pages/SchedulePage.tsx`      | جدول برنامه هفتگی کامل (شنبه تا پنج‌شنبه)، نام درس، دبیر، ساعت زنگ، شماره کلاس/آزمایشگاه، فیلتر روز و درس و مودال جزئیات هر جلسه                                             |
| `/student/grades`        | `pages/GradesPage.tsx`        | کارت‌های درس (`GradeCard`)، نتایج آزمون‌ها، میانگین وزنی و ساده، نمودار میله‌ای مقایسه با کلاس و نمودار خطی روند پیشرفت (`Recharts`)، شبیه‌ساز معدل هدف و تغییرات اخیر نمرات |
| `/student/attendance`    | `pages/AttendancePage.tsx`    | تاریخچه کامل حضور و غیاب، روزهای حاضر، غایب، تأخیر و غیبت موجه، درصد حضور، نمودار دونات ترکیب حضور و فیلتر بر اساس وضعیت و درس                                               |
| `/student/homework`      | `pages/HomeworkPage.tsx`      | لیست تکالیف کلاس، شرح کامل، مهلت تحویل، وضعیت تحویل، مودال جزئیات و **ارسال شبیه‌سازی‌شده تکلیف با React state** (امکان ثبت، ویرایش و لغو ارسال)                             |
| `/student/announcements` | `pages/AnnouncementsPage.tsx` | اطلاعیه‌های مرتبط با دانش‌آموزان، عنوان و شرح، تاریخ شمسی، دسته‌بندی هوشمند، اولویت و مدیریت وضعیت خوانده‌شده / خوانده‌نشده                                                  |
| `/student/profile`       | `pages/ProfilePage.tsx`       | نام کامل، کد دانش‌آموزی، آواتار، پایه و کلاس، اطلاعات تماس اولیا، سال تحصیلی، لیست دبیران کلاس و ویرایش شبیه‌سازی‌شده شماره تماس در `AppContext`                             |
| `/student/report-card`   | `pages/ReportCardPage.tsx`    | کارنامه رسمی نیم‌سال منطبق با لینک «کارنامه» در سایدبار مشترک، محاسبه ضرایب و تراز نمرات + پیش‌نمایش چاپ                                                                     |
| `/student/messages`      | `pages/MessagesPage.tsx`      | صندوق پیام‌های دانش‌آموز منطبق با لینک «پیام‌ها» در سایدبار مشترک، خواندن پیام‌ها و ارسال پیام جدید به دبیران و مدیر از طریق `updateEntity('messages', ...)`                 |

---

## ۴. یکپارچگی داده‌ها با پنل مدیر و والدین

- حساب نمایشی دانش‌آموز (`student@school.ir` / `student123` — سارا محمدی) به‌صورت خودکار از طریق `resolveStudentRecord` به رکورد متمرکز `s-01` در `db.students` و کلاس `c-01` (`دهم ریاضی ۱`) متصل می‌شود.
- هیچ دیتاست موازی یا مستقلی ساخته نشده است؛ تمامی محاسبات (معدل وزنی، رتبه در کلاس، درصد حضور، تکالیف نمره‌دهی‌شده، اطلاعیه‌ها) به‌صورت زنده از `useData().db` مشتق می‌شوند.
- در صورت تغییر نمره، حضور و غیاب، تکلیف یا اطلاعیه توسط **مدیر** یا **اولیا** در طول نشست فعلی، پنل دانش‌آموز بلافاصله مقادیر جدید را نمایش می‌دهد.
- با بارگذاری مجدد مرورگر (Refresh)، تمامی تغییرات شبیه‌سازی‌شده به حالت اولیه بازمی‌گردند (بدون هیچ‌گونه استفاده از `localStorage`, `sessionStorage`, `IndexedDB` یا کوکی).

---

## ۵. نکات گزارش‌شده به تیم‌لید (Shared Files Feedback)

1. **لینک پروفایل در سایدبار مشترک (`src/constants/navigation.ts`):** در فایل مشترک `navigation.ts` آیتم اختصاصی `/profile` در لیست منوی سایدبار تعریف نشده است (منوی هدر یک مودال خلاصه باز می‌کند). بدون دست زدن به فایل مشترک، دسترسی مستقیم به صفحه کامل `/student/profile` هم از طریق نوار ناوبری سریع دانش‌آموز (`StudentQuickBar`) در بالای صفحات و هم دکمه «پروفایل کامل» روی `StudentProfileCard` فراهم شده است. در صورت تمایل تیم‌لید می‌توان آیتم `{ label: 'پروفایل من', path: '/profile', icon: UserRound, roles: ['student'] }` را به `navigation.ts` افزود.
2. **خطای از قبل موجود در `src/lib/` روی شاخه `main`:** دو فایل مشترک `src/lib/axios.ts` و `src/lib/queryClient.ts` که از قبل در `main` وجود دارند به پکیج‌های نصب‌نشده `axios` و `@tanstack/react-query` اشاره می‌کنند (در حالی که پروژه طبق قرارداد فاقد API و کاملاً Frontend-Only است). پیشنهاد می‌شود تیم‌لید این دو فایل بدون استفاده را در `main` حذف کند تا دستور `tsc -b` در اسکریپت `npm run build` در سطح کل ریپو نیز بدون خطا اجرا شود. تمامی فایل‌های `src/features/student/**` در بررسی مستقیم `tsc` و `eslint` و باندل `vite build` دارای **صفر خطا** هستند.
