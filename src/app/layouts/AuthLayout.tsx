import type { ReactNode } from 'react';
import { CheckCircle2, GraduationCap } from 'lucide-react';

const HIGHLIGHTS = [
  'کارنامه و نمرات برخط برای والدین',
  'حضور و غیاب هوشمند با گزارش‌گیری لحظه‌ای',
  'پرداخت آنلاین شهریه با رسید الکترونیکی',
];

const STATS: Array<{ value: string; label: string }> = [
  { value: '۱٬۶۰۰+', label: 'دانش‌آموز' },
  { value: '۱۲۰+', label: 'معلم و کادر آموزشی' },
  { value: '۳۲', label: 'سال سابقه آموزشی' },
];

/**
 * Split-screen authentication shell.
 * Brand panel (RTL start/right) + form column. Used exclusively by auth pages.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* ---------- Brand panel (desktop) ---------- */}
      <aside
        aria-hidden="true"
        className="relative hidden flex-col justify-between overflow-hidden bg-primary-navy p-10 text-white lg:flex xl:p-14"
      >
        {/* Decorative pattern — subtle dot grid + glow circles */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern id="auth-dots" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-dots)" />
        </svg>
        <div
          className="pointer-events-none absolute -start-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -end-24 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur">
            <GraduationCap size={26} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-extrabold tracking-tight">مدرسه‌یار</p>
            <p className="text-[11px] text-blue-200">سامانه یکپارچه مدیریت مدرسه</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative max-w-lg">
          <h1 className="text-4xl font-extrabold leading-[1.35] tracking-tight xl:text-[44px]">
            مدیریت مدرسه،
            <br />
            <span className="text-sky-300">ساده و هوشمند</span>
          </h1>
          <p className="mt-5 text-[15px] leading-8 text-blue-100">
            دانش‌آموزان، معلمان، اولیا، نمرات، حضور و غیاب و شهریه — همه در یک
            سامانه یکپارچه و کاملاً فارسی، از هر کجا و در هر دستگاهی.
          </p>

          <ul className="mt-8 space-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[13px] text-blue-50">
                <CheckCircle2 size={19} className="shrink-0 text-sky-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative flex items-center gap-8 border-t border-white/10 pt-6">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-[11px] text-blue-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ---------- Form column ---------- */}
      <main className="relative flex min-h-screen items-center justify-center overflow-y-auto p-4 sm:p-8">
        {/* subtle backdrop accent for mobile */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 start-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl lg:hidden"
        />
        <div className="relative w-full max-w-md">{children}</div>
        <p className="absolute bottom-4 start-0 w-full text-center text-[10px] text-text-muted">
          © ۱۴۰۵ مدرسه‌یار — دبیرستان نمونه دولتی شهید بهشتی • نسخه نمایشی ۱٫۰
        </p>
      </main>
    </div>
  );
}
