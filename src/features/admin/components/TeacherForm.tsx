/**
 * Admin feature — create / edit teacher form (modal content).
 */
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../../components';
import { JalaliDateField } from './JalaliDateField';
import type { Subject, Teacher, TeacherStatus } from '../../../types';
import { isValidPhone, normalizeDigitsLocal } from '../lib/labels';
import { isValidEmail } from '../../../utils';

export interface TeacherFormValues {
  name: string;
  employeeCode: string;
  phone: string;
  email: string;
  specialty: string;
  subjectIds: string[];
  status: TeacherStatus;
  joinedAt: string;
}

interface TeacherFormProps {
  open: boolean;
  initial: Teacher | null;
  subjects: Subject[];
  onClose: () => void;
  onSubmit: (values: TeacherFormValues) => void;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'فعال' },
  { value: 'on_leave', label: 'در مرخصی' },
  { value: 'retired', label: 'بازنشسته' },
];

export function TeacherForm({ open, initial, subjects, onClose, onSubmit }: TeacherFormProps) {
  const [name, setName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [status, setStatus] = useState<TeacherStatus>('active');
  const [joinedAt, setJoinedAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setEmployeeCode(initial?.employeeCode ?? '');
    setPhone(initial?.phone ?? '');
    setEmail(initial?.email ?? '');
    setSpecialty(initial?.specialty ?? '');
    setSubjectIds(initial?.subjectIds ?? []);
    setStatus(initial?.status ?? 'active');
    setJoinedAt(initial?.joinedAt ?? '');
    setErrors({});
  }, [open, initial]);

  const toggleSubject = (subjectId: string) => {
    setSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    );
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const normalizedPhone = normalizeDigitsLocal(phone);

    if (!name.trim()) nextErrors.name = 'نام معلم الزامی است.';
    if (!isValidPhone(normalizedPhone))
      nextErrors.phone = 'شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (!isValidEmail(email)) nextErrors.email = 'ایمیل معتبر وارد کنید.';
    if (!specialty.trim()) nextErrors.specialty = 'تخصص الزامی است.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      employeeCode: employeeCode.trim() || `EMP-${1000 + Math.floor(Math.random() * 9000)}`,
      phone: normalizedPhone,
      email: email.trim(),
      specialty: specialty.trim(),
      subjectIds,
      status,
      joinedAt: joinedAt || new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'ویرایش معلم' : 'افزودن معلم جدید'}
      description="اطلاعات همکار را وارد کنید و دروس تدریسی او را انتخاب کنید."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initial ? 'ذخیره تغییرات' : 'افزودن معلم'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="نام و نام خانوادگی"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="مثال: علی رستمی"
        />
        <Input
          label="کد پرسنلی"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          hint="در صورت خالی بودن خودکار ساخته می‌شود."
          placeholder="EMP-1001"
          dir="ltr"
          className="[&_input]:text-left"
        />
        <Input
          label="شماره تماس"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="09121110001"
          inputMode="tel"
          dir="ltr"
          className="[&_input]:text-left"
        />
        <Input
          label="ایمیل"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="a.rostami@school.ir"
          dir="ltr"
          className="[&_input]:text-left"
        />
        <Input
          label="تخصص"
          required
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          error={errors.specialty}
          placeholder="مثال: ریاضی و حسابان"
        />
        <Select
          label="وضعیت همکاری"
          value={status}
          onChange={(e) => setStatus(e.target.value as TeacherStatus)}
          options={STATUS_OPTIONS}
        />
        <JalaliDateField
          label="تاریخ شروع همکاری"
          value={joinedAt}
          onChange={(e) => setJoinedAt(e.target.value)}
        />
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[13px] font-medium text-text">دروس تدریسی</p>
          <div className="flex flex-wrap gap-2 rounded-input border border-border bg-surface p-3">
            {subjects.map((subject) => {
              const checked = subjectIds.includes(subject.id);
              return (
                <label
                  key={subject.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-btn border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    checked
                      ? 'border-primary bg-blue-50 text-primary'
                      : 'border-border text-text-muted hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSubject(subject.id)}
                    className="h-3.5 w-3.5 accent-[#2563EB]"
                  />
                  {subject.name}
                </label>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            {subjectIds.length > 0
              ? `${subjectIds.length} درس انتخاب شده است.`
              : 'حداقل یک درس انتخاب کنید (اختیاری).'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
