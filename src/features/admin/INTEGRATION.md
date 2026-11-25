# TASK 02 — School Administration Dashboard · راهنمای یکپارچه‌سازی

ویژگی «پنل مدیریت مدرسه» به‌طور کامل داخل `src/features/admin/` پیاده‌سازی شده است.
هیچ فایل مشترکی (`src/app/`, `src/components/`, `src/context/`, `src/hooks/`, `src/types/`,
`src/data/`, `package.json`, استایل‌های global) تغییر نکرده است.

> نکته: پوشه‌ی تحویل نهایی `src/features/admin/` است (نامی که در جلسه‌ی هماهنگی تیم انتخاب شد)؛
> ساختار و تمام قواعد TASK 02 دقیقاً رعایت شده‌اند. در صورت نیاز به نام `src/features/school/`
> کافی است پوشه تغییر نام داده و importهای نسبی سطح `features` به‌روزرسانی شوند
> (`../../../components` → `../../../components` بدون تغییر می‌ماند، چون عمق مسیر یکسان است).

---

## ۱) یک‌خط تغییر لازم در روتر (فقط با تأیید تیم‌لید)

مطابق `docs/INTEGRATION_CONTRACT.md` §4.1، جایگزینی placeholder بر عهده‌ی تیم اصلی است.
تنها تغییر لازم در `src/app/router.tsx`:

```diff
 import { LoginPage } from '../features/auth';
+import { AdminApp } from '../features/admin';
 import { RequireRole } from './RequireRole';
@@
         >
-          <Route index element={<FeaturePlaceholder role="admin" />} />
-          <Route path="*" element={<FeaturePlaceholder role="admin" />} />
+          <Route path="*" element={<AdminApp />} />
         </Route>
```

`AdminApp` خودش مسیر `index` (پیشخوان) را دارد، بنابراین حذف هر دو خط placeholder کافی است.

## ۲) پیش‌نمایش بدون تغییر روتر (dev-only)

برای بازبینی قبل از اعمال تغییر بالا:

```bash
npx vite --config tools/admin-preview/vite.preview.config.ts --port 5180
```

این پیکربندی، `preview.html` را در مسیر `/` سرو می‌کند و `<AdminApp />` را داخل
`DashboardLayout` با نشست دموی مدیر بالا می‌آورد. فایل‌های کمکی (همه جدید، قابل حذف):

- `preview.html`
- `src/features/admin/preview-main.tsx`
- `tools/admin-preview/vite.preview.config.ts`

## ۳) مسیرهای پوشش‌داده‌شده

| مسیر | صفحه | وضعیت |
| --- | --- | --- |
| `/admin` | پیشخوان | ✅ کامل |
| `/admin/students` | دانش‌آموزان | ✅ کامل |
| `/admin/teachers` | معلمان | ✅ کامل |
| `/admin/classes` | کلاس‌ها | ✅ کامل |
| `/admin/attendance` | حضور و غیاب | ✅ کامل |
| `/admin/grades` | نمرات | ✅ کامل |
| `/admin/homework` | تکالیف | ✅ کامل |
| `/admin/announcements` | اطلاعیه‌ها | ✅ کامل |
| `/admin/payments` | شهریه / مالی | ✅ کامل (`/admin/finance` → redirect) |
| `/admin/settings` | تنظیمات | ✅ کامل |
| `/admin/parents` `payroll` `reports` `schedule` `messages` | خارج از دامنه‌ی TASK 02 | صفحه‌ی اطلاع‌رسانی (لینک منو نمی‌شکند) |

## ۴) قراردادهای رعایت‌شده

- تمام CRUD از طریق `useData().updateEntity` روی حافظه‌ی React — بدون API، بدون `localStorage`.
- همه‌ی فرم‌ها/صفحات فارسی و RTL، اعداد با `toPersianDigits`/`formatToman`، تاریخ با `formatJalali`.
- استفاده از کامپوننت‌های مشترک: `Button, Input, Select, Modal, Table, Badge, Avatar, StatCard, PageHeader`.
- نمودارها با `recharts` و `ResponsiveContainer` (ریسپانسیو).
- رنگ‌ها/شعاع‌ها فقط از توکن‌های Tailwind پروژه (`primary`, `surface`, `border`, `rounded-card`, `rounded-btn`, `shadow-card`).
