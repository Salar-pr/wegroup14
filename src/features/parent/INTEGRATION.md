# پنل اولیا

روتر اصلی `ParentApp` را زیر `/parent/*` بارگذاری می‌کند. فرزندهای هر حساب از `studentIds` حساب و جدول `db.parents` می‌آیند. علی محمدی (`s-25`) از شروع برنامه در `src/data/` حاضر است؛ برای دیدن فرزند دوم دیگر نیازی به باز کردن پنل اولیا نیست.

مسیرها: `/parent`، `/parent/child`، `/parent/grades`، `/parent/grades/compare`، `/parent/attendance`، `/parent/homework`، `/parent/payments`، `/parent/messages`، `/parent/announcements` و `/parent/schedule`.

پیام‌ها و تغییر حضور در `AppContext` نگه‌داری می‌شوند. پرداخت فقط شبیه‌سازی است؛ درخواست توجیه غیبت در این نسخه نمایشی همان‌جا وضعیت رکورد را تغییر می‌دهد. برای بررسی بیشتر، سرور را روشن کنید و `node src/features/parent/tests/e2e.mjs` را اجرا کنید.
