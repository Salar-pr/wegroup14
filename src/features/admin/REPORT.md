# TASK 02 — گزارش تحویل

## فایل‌های ایجادشده (همه جدید، هیچ فایل مشترکی تغییر نکرده)

```
src/features/admin/
├── AdminApp.tsx                    ← جدول مسیرهای /admin/*
├── index.ts                        ← barrel عمومی
├── INTEGRATION.md                  ← راهنمای اتصال به روتر
├── REPORT.md                       ← همین فایل
├── lib/
│   ├── labels.ts                   ← برچسب‌های فارسی وضعیت‌ها + کمک‌تابع‌ها
│   └── stats.ts                    ← آمار مشتق‌شده (حضور، نمره، مالی، فعالیت، تحویل تکلیف)
├── components/
│   ├── ChartCard.tsx
│   ├── ConfirmDialog.tsx
│   ├── JalaliDateField.tsx
│   ├── StudentForm.tsx
│   ├── TeacherForm.tsx
│   ├── ClassForm.tsx
│   ├── GradeForm.tsx
│   ├── HomeworkForm.tsx
│   ├── AnnouncementForm.tsx
│   ├── StudentDetailsModal.tsx
│   ├── ClassStudentsModal.tsx
│   └── PaymentModal.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── StudentsPage.tsx
│   ├── TeachersPage.tsx
│   ├── ClassesPage.tsx
│   ├── AttendancePage.tsx
│   ├── GradesPage.tsx
│   ├── HomeworkPage.tsx
│   ├── AnnouncementsPage.tsx
│   ├── FinancePage.tsx
│   └── SettingsPage.tsx
└── preview-main.tsx                ← فقط برای پیش‌نمایش dev
preview.html                        ← فقط برای پیش‌نمایش dev
tools/admin-preview/
├── vite.preview.config.ts          ← فقط برای پیش‌نمایش dev
└── smoke-test.mjs                  ← تست رندر همه مسیرها (node)
```

**فایل‌های مشترک تغییرکرده: هیچ‌کدام.**

## نتیجه‌ی بیلد

- `npm run lint` → **۰ خطا** (۱ هشدار مربوط به فایل پیش‌نمایش dev).
- `npx vite build` → **موفق**.
- بیلد بسته‌ی مدیریت (با recharts) → **موفق** (هشدار حجم chunk؛ طبیعی برای recharts).
- `npx tsc -b` → برای `src/features/admin/**` **بدون خطا**؛ تنها خطای باقی‌مانده
  از فایل‌های دیگر تیم است:

```
src/lib/axios.ts(1,19)        TS2307: Cannot find module 'axios'
src/lib/queryClient.ts(1,29)  TS2307: Cannot find module '@tanstack/react-query'
```

این دو فایل در `main` کامیت شده‌اند اما پکیج‌هایشان در `package.json` نیست؛ به همین دلیل
`npm run build` (که `tsc -b && vite build` است) از قبل از این تسک هم شکسته بود.
مطابق قواعد، فایل توسعه‌دهنده‌ی دیگر و `package.json` را تغییر ندادم — نیازمند تصمیم تیم‌لید:
حذف این دو فایل (چون پروژه frontend-only و بدون API است) یا افزودن پکیج.
