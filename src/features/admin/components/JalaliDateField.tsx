/**
 * Admin feature — date field that keeps the Persian (Jalali) reading visible.
 *
 * Data is stored as ISO (`YYYY-MM-DD`) in the shared in-memory database, while
 * the user sees the Shamsi equivalent printed under the field, so every date
 * entry stays understandable in a fully Persian/RTL interface.
 */
import { Input, type InputProps } from '../../../components';
import { formatJalali } from '../../../utils';

type JalaliDateFieldProps = Omit<InputProps, 'type'>;

export function JalaliDateField({ value, hint, ...rest }: JalaliDateFieldProps) {
  const iso = typeof value === 'string' ? value : '';
  const jalaliHint = iso ? `معادل شمسی: ${formatJalali(iso)}` : 'تاریخ را انتخاب کنید';

  return <Input type="date" value={value} hint={hint ?? jalaliHint} {...rest} />;
}
