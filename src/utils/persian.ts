/**
 * Persian (Farsi) formatting helpers.
 * All UI numbers in the app should pass through these helpers so the
 * product always renders Persian digits consistently.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

/** Convert latin digits (0-9) in a string/number to Persian digits. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

/** Format a number with Persian thousands separators and Persian digits. */
export function formatNumber(value: number): string {
  return toPersianDigits(value.toLocaleString('en-US'));
}

/** Format an amount in Iranian Toman. Example: ۱۲٬۵۰۰٬۰۰۰ تومان */
export function formatToman(amount: number): string {
  return `${formatNumber(amount)} تومان`;
}

/** Format a score out of 20 the Persian way, e.g. «۱۹٫۵ از ۲۰». */
export function formatScore(score: number, maxScore = 20): string {
  return `${toPersianDigits(score)} از ${toPersianDigits(maxScore)}`;
}

/** Percentage change with sign, Persian digits. Example: «٪۱۲+» */
export function formatPercentChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${toPersianDigits(sign + value)}٪`;
}
