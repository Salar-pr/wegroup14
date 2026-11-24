/**
 * Persian (Jalali / Shamsi) date helpers built on the platform Intl API.
 * No external date library is required.
 */

const dateTimeFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeWithWeekdayFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat('fa-IR', {
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Parse an ISO date string safely.
 * Date-only strings («2026-11-24») are interpreted in local time to avoid
 * off-by-one day shifts across UTC offsets.
 */
export function parseDate(iso: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(iso);
}

/** «۳ آذر ۱۴۰۵» */
export function formatJalali(iso: string): string {
  return dateTimeFormat.format(parseDate(iso));
}

/** «دوشنبه ۳ آذر ۱۴۰۵» */
export function formatJalaliWithWeekday(iso: string): string {
  return dateTimeWithWeekdayFormat.format(parseDate(iso));
}

/** «۰۳/۰۹/۱۴۰۵» — compact numeric form for tables */
export function formatJalaliShort(iso: string): string {
  return shortDateFormat.format(parseDate(iso));
}

/** «۱۴:۳۰» */
export function formatTime(iso: string): string {
  return timeFormat.format(parseDate(iso));
}

/** Relative Persian time such as «۲ روز پیش» or «۳ ساعت دیگر». */
export function formatRelativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });
  const diffMs = parseDate(iso).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);

  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 60) return rtf.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');

  return rtf.format(Math.round(diffMonths / 12), 'year');
}
