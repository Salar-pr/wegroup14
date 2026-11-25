/**
 * Admin feature — school settings (تنظیمات مدرسه).
 *
 * School profile (name, academic year, contact, address) and temporary
 * interface preferences. Everything is local component state only:
 * nothing is persisted, so the form resets on browser refresh as required.
 */
import { useState } from 'react';
import {
  Bell,
  Building2,
  CalendarDays,
  Clock,
  GraduationCap,
  Mail,
  Sparkles,
  MapPin,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Table2,
  UserRound,
} from 'lucide-react';
import { Button, Input, PageHeader, Select } from '../../../components';
import { useAuth, useToast } from '../../../hooks';
import { toPersianDigits } from '../../../utils';

interface SchoolProfile {
  name: string;
  motto: string;
  principal: string;
  academicYear: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  postalCode: string;
}

interface Preferences {
  density: 'comfortable' | 'compact';
  rowsPerPage: string;
  calendar: 'jalali' | 'gregorian';
  notifications: boolean;
  weeklyDigest: boolean;
  accent: 'blue' | 'navy' | 'sky';
}

const DEFAULT_PROFILE: SchoolProfile = {
  name: 'دبیرستان دوره دوم مدرسه‌یار',
  motto: 'دانش، اخلاق، آینده',
  principal: 'مدیر مدرسه',
  academicYear: '۱۴۰۵ - ۱۴۰۶',
  phone: '021-88776655',
  email: 'info@school.ir',
  website: 'school.ir',
  address: 'خیابان ولی‌عصر، نبش کوچه دانش، پلاک ۱۲',
  city: 'تهران',
  postalCode: '1234567890',
};

const DEFAULT_PREFERENCES: Preferences = {
  density: 'comfortable',
  rowsPerPage: '8',
  calendar: 'jalali',
  notifications: true,
  weeklyDigest: false,
  accent: 'blue',
};

const ACADEMIC_YEARS = ['۱۴۰۳ - ۱۴۰۴', '۱۴۰۴ - ۱۴۰۵', '۱۴۰۵ - ۱۴۰۶'];

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<SchoolProfile>({
    ...DEFAULT_PROFILE,
    principal: currentUser?.name ?? DEFAULT_PROFILE.principal,
  });
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [savedProfile, setSavedProfile] = useState<SchoolProfile>(profile);
  const [savedPreferences, setSavedPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty =
    JSON.stringify(profile) !== JSON.stringify(savedProfile) ||
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const setProfileField = <K extends keyof SchoolProfile>(key: K, value: SchoolProfile[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPreferences((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile.name.trim()) nextErrors.name = 'نام مدرسه الزامی است.';
    if (!profile.academicYear.trim()) nextErrors.academicYear = 'سال تحصیلی الزامی است.';
    if (!profile.phone.trim()) nextErrors.phone = 'شماره تماس الزامی است.';
    if (!profile.address.trim()) nextErrors.address = 'آدرس مدرسه الزامی است.';
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      nextErrors.email = 'قالب ایمیل صحیح نیست.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('error', 'لطفاً خطاهای فرم را برطرف کنید.', 'ذخیره نشد');
      return;
    }
    setSavedProfile(profile);
    setSavedPreferences(preferences);
    showToast(
      'success',
      'تنظیمات مدرسه در حافظه اجرایی ذخیره شد (با بازخوانی صفحه بازنشانی می‌شود).',
      'تنظیمات ذخیره شد',
    );
  };

  const handleReset = () => {
    setProfile(savedProfile);
    setPreferences(savedPreferences);
    setErrors({});
    showToast('info', 'تغییرات ذخیره‌نشده بازگردانی شد.', 'بازگردانی فرم');
  };

  return (
    <>
      <PageHeader
        title="تنظیمات مدرسه"
        description="اطلاعات مدرسه، سال تحصیلی، راه‌های ارتباطی و ترجیحات موقت رابط کاربری"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'تنظیمات' }]}
        actions={
          <>
            <Button variant="ghost" leftIcon={RotateCcw} onClick={handleReset} disabled={!dirty}>
              بازگردانی
            </Button>
            <Button leftIcon={Save} onClick={handleSave}>
              ذخیره تنظیمات
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* School profile */}
        <section className="rounded-card border border-border bg-surface p-5 shadow-card xl:col-span-2">
          <header className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-blue-50 text-primary">
              <Building2 size={17} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[14px] font-extrabold text-text">اطلاعات مدرسه</h2>
              <p className="text-[11px] text-text-muted">نام، شعار، مدیر و سال تحصیلی جاری</p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="نام مدرسه"
              value={profile.name}
              onChange={(e) => setProfileField('name', e.target.value)}
              error={errors.name}
              leftIcon={GraduationCap}
            />
            <Input
              label="شعار مدرسه"
              value={profile.motto}
              onChange={(e) => setProfileField('motto', e.target.value)}
              leftIcon={Sparkles}
            />
            <Input
              label="نام مدیر"
              value={profile.principal}
              onChange={(e) => setProfileField('principal', e.target.value)}
              leftIcon={UserRound}
            />
            <Select
              label="سال تحصیلی"
              value={profile.academicYear}
              onChange={(e) => setProfileField('academicYear', e.target.value)}
              error={errors.academicYear}
              options={ACADEMIC_YEARS.map((year) => ({ value: year, label: year }))}
            />
          </div>

          <header className="mb-4 mt-6 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-blue-50 text-primary">
              <Phone size={17} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[14px] font-extrabold text-text">اطلاعات تماس و آدرس</h2>
              <p className="text-[11px] text-text-muted">راه‌های ارتباطی مدرسه با اولیا و دانش‌آموزان</p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="شماره تماس"
              value={profile.phone}
              onChange={(e) => setProfileField('phone', e.target.value)}
              error={errors.phone}
              leftIcon={Phone}
              dir="ltr"
            />
            <Input
              label="ایمیل"
              type="email"
              value={profile.email}
              onChange={(e) => setProfileField('email', e.target.value)}
              error={errors.email}
              leftIcon={Mail}
              dir="ltr"
            />
            <Input
              label="وب‌سایت"
              value={profile.website}
              onChange={(e) => setProfileField('website', e.target.value)}
              leftIcon={Clock}
              dir="ltr"
            />
            <Input
              label="کد پستی"
              value={profile.postalCode}
              onChange={(e) => setProfileField('postalCode', e.target.value)}
              dir="ltr"
            />
            <Input
              label="شهر"
              value={profile.city}
              onChange={(e) => setProfileField('city', e.target.value)}
              leftIcon={MapPin}
            />
            <Input
              label="آدرس"
              value={profile.address}
              onChange={(e) => setProfileField('address', e.target.value)}
              error={errors.address}
              leftIcon={MapPin}
            />
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-card border border-border bg-surface p-5 shadow-card">
          <header className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-blue-50 text-primary">
              <Palette size={17} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[14px] font-extrabold text-text">ترجیحات رابط کاربری</h2>
              <p className="text-[11px] text-text-muted">موقت — با بازخوانی صفحه بازنشانی می‌شود</p>
            </div>
          </header>

          <div className="flex flex-col gap-4">
            <Select
              label="تراکم نمایش جدول‌ها"
              value={preferences.density}
              onChange={(e) =>
                setPreference('density', e.target.value as Preferences['density'])
              }
              options={[
                { value: 'comfortable', label: 'راحت (پیش‌فرض)' },
                { value: 'compact', label: 'فشرده' },
              ]}
            />
            <Select
              label="تعداد سطر در هر صفحه"
              value={preferences.rowsPerPage}
              onChange={(e) => setPreference('rowsPerPage', e.target.value)}
              options={['5', '8', '10', '15'].map((value) => ({
                value,
                label: `${toPersianDigits(value)} سطر`,
              }))}
            />
            <Select
              label="تقویم نمایش تاریخ"
              value={preferences.calendar}
              onChange={(e) =>
                setPreference('calendar', e.target.value as Preferences['calendar'])
              }
              options={[
                { value: 'jalali', label: 'شمسی (جلالی)' },
                { value: 'gregorian', label: 'میلادی' },
              ]}
            />
            <Select
              label="رنگ تأکیدی"
              value={preferences.accent}
              onChange={(e) => setPreference('accent', e.target.value as Preferences['accent'])}
              options={[
                { value: 'blue', label: 'آبی اصلی (#2563EB)' },
                { value: 'navy', label: 'سرمه‌ای (#1E3A8A)' },
                { value: 'sky', label: 'آبی روشن (#0EA5E9)' },
              ]}
            />

            <div className="rounded-btn border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-text">
                <Bell size={14} aria-hidden="true" />
                اعلان‌ها
              </p>
              <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-[12px] text-text">
                اعلان رویدادهای مهم
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#2563EB]"
                  checked={preferences.notifications}
                  onChange={(e) => setPreference('notifications', e.target.checked)}
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-[12px] text-text">
                خلاصه هفتگی ایمیلی
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#2563EB]"
                  checked={preferences.weeklyDigest}
                  onChange={(e) => setPreference('weeklyDigest', e.target.checked)}
                />
              </label>
            </div>

            <div className="rounded-btn bg-slate-50 p-3 text-[11px] leading-5 text-text-muted">
              <p className="flex items-center gap-1.5 font-bold text-text">
                <Table2 size={13} aria-hidden="true" />
                ترجیح فعلی نمایش
              </p>
              {preferences.density === 'compact' ? 'فشرده' : 'راحت'} •{' '}
              {toPersianDigits(preferences.rowsPerPage)} سطر در صفحه •{' '}
              {preferences.calendar === 'jalali' ? 'تقویم شمسی' : 'تقویم میلادی'}
            </div>
          </div>
        </section>
      </div>

      {/* Preview card */}
      <section className="mt-4 rounded-card border border-border bg-surface p-5 shadow-card">
        <header className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-blue-50 text-primary">
            <CalendarDays size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[14px] font-extrabold text-text">پیش‌نمایش اطلاعات مدرسه</h2>
            <p className="text-[11px] text-text-muted">همان چیزی که در سربرگ گزارش‌ها استفاده می‌شود</p>
          </div>
        </header>
        <div className="grid grid-cols-1 gap-3 text-[12px] md:grid-cols-3">
          <div className="rounded-btn border border-border p-3">
            <p className="text-[11px] text-text-muted">مدرسه</p>
            <p className="mt-1 font-bold text-text">{profile.name || '—'}</p>
            <p className="mt-0.5 text-text-muted">{profile.motto}</p>
          </div>
          <div className="rounded-btn border border-border p-3">
            <p className="text-[11px] text-text-muted">سال تحصیلی / مدیر</p>
            <p className="mt-1 font-bold text-text">{profile.academicYear}</p>
            <p className="mt-0.5 text-text-muted">{profile.principal || '—'}</p>
          </div>
          <div className="rounded-btn border border-border p-3">
            <p className="text-[11px] text-text-muted">تماس</p>
            <p className="mt-1 font-bold text-text" dir="ltr">
              {toPersianDigits(profile.phone) || '—'}
            </p>
            <p className="mt-0.5 text-text-muted">{profile.city} — {profile.address}</p>
          </div>
        </div>
      </section>
    </>
  );
}
