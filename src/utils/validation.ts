/**
 * Live (non-persistent) form validators used by the auth flow.
 * Validation is UI-only; no server round-trips are performed.
 */

/** Persian, Arabic and Latin digits are all accepted and normalised. */
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function normalizeDigits(value: string): string {
  return value
    .split('')
    .map((char) => {
      const fa = FA_DIGITS.indexOf(char);
      if (fa !== -1) return String(fa);
      const ar = AR_DIGITS.indexOf(char);
      if (ar !== -1) return String(ar);
      return char;
    })
    .join('');
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  // Demo rule: at least 6 characters.
  return value.length >= 6;
}
