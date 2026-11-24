import {
  Construction,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  Megaphone,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../../types';
import { ROLE_LABELS } from '../../constants/routes';
import { getRoleMeta } from '../../constants/roles';

interface PlaceholderFeature {
  icon: LucideIcon;
  label: string;
}

const FEATURES_BY_ROLE: Record<UserRole, PlaceholderFeature[]> = {
  admin: [
    { icon: ClipboardList, label: 'مدیریت کامل دانش‌آموزان و معلمان' },
    { icon: CalendarDays, label: 'برنامه‌ریزی کلاسی و تقویم مدرسه' },
    { icon: MessageSquare, label: 'ارتباط با اولیا و کارکنان' },
    { icon: Megaphone, label: 'اطلاعیه‌ها و گزارش‌های مدیریتی' },
  ],
  teacher: [
    { icon: ClipboardList, label: 'ثبت نمرات و حضور و غیاب' },
    { icon: CalendarDays, label: 'برنامه هفتگی کلاس‌های شما' },
    { icon: MessageSquare, label: 'پیام مستقیم به اولیا' },
    { icon: Megaphone, label: 'ارسال تکالیف و اطلاعیه‌ها' },
  ],
  student: [
    { icon: ClipboardList, label: 'مشاهده نمرات و کارنامه' },
    { icon: CalendarDays, label: 'برنامه کلاسی و تقویم امتحانی' },
    { icon: MessageSquare, label: 'پیام به معلمان' },
    { icon: Megaphone, label: 'اطلاعیه‌های مدرسه' },
  ],
  parent: [
    { icon: ClipboardList, label: 'پیگیری نمرات و حضور فرزند' },
    { icon: CalendarDays, label: 'برنامه کلاسی فرزند' },
    { icon: MessageSquare, label: 'ارتباط مستقیم با معلمان' },
    { icon: Megaphone, label: 'پرداخت شهریه و اطلاعیه‌ها' },
  ],
};

/**
 * Shown in place of a feature dashboard until the owning feature team
 * delivers it. Keeps every routed path functional (no dead ends).
 */
export function FeaturePlaceholder({ role }: { role: UserRole }) {
  const meta = getRoleMeta(role);
  const RoleIcon = meta.icon;
  const features = FEATURES_BY_ROLE[role];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-modal bg-blue-50 text-primary">
        <Construction size={36} aria-hidden="true" />
      </div>

      <h1 className="mt-6 text-2xl font-extrabold text-text">
        پنل {ROLE_LABELS[role]} در حال ساخت است
      </h1>
      <p className="mt-2 max-w-md text-[13px] leading-7 text-text-muted">
        این بخش توسط تیم توسعه مدرسه‌یار در حال پیاده‌سازی است و به‌زودی در دسترس
        قرار می‌گیرد. قابلیت‌هایی که در این پنل می‌بینید:
      </p>

      <ul className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li
              key={feature.label}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 text-start shadow-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-slate-100 text-primary">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="text-[12px] font-medium leading-6 text-text">
                {feature.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-[11px] font-semibold text-green-800 ring-1 ring-inset ring-green-200">
        <CheckCircle2 size={14} aria-hidden="true" />
        زیرساخت مشترک، احراز هویت و طراحی اختصاصی شما آماده است
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-[10px] text-text-muted">
        <RoleIcon size={12} aria-hidden="true" />
        ورود موفق به‌عنوان «{meta.label}» — حساب نمایشی
      </div>
    </div>
  );
}
