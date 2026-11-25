/**
 * Admin feature — create / edit student form (modal content).
 * Controlled by the parent page; validation is local and Persian.
 */
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../../components';
import { JalaliDateField } from './JalaliDateField';
import type { SchoolClass, Student, StudentStatus } from '../../../types';
import { FIELDS, GRADE_LEVELS, isValidPhone, normalizeDigitsLocal } from '../lib/labels';

export interface StudentFormValues {
  name: string;
  studentCode: string;
  classId: string;
  gradeLevel: string;
  field: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  status: StudentStatus;
  gpa: number;
  enrolledAt: string;
}

interface StudentFormProps {
  open: boolean;
  initial: Student | null;
  classes: SchoolClass[];
  onClose: () => void;
  onSubmit: (values: StudentFormValues) => void;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'فعال' },
  { value: 'suspended', label: 'معلق' },
  { value: 'graduated', label: 'فارغ‌التحصیل' },
];

export function StudentForm({ open, initial, classes, onClose, onSubmit }: StudentFormProps) {
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [classId, setClassId] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>('دهم');
  const [field, setField] = useState<string>('ریاضی');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [status, setStatus] = useState<StudentStatus>('active');
  const [gpa, setGpa] = useState('');
  const [enrolledAt, setEnrolledAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setStudentCode(initial?.studentCode ?? '');
    setClassId(initial?.classId ?? classes[0]?.id ?? '');
    setGradeLevel(initial?.gradeLevel ?? 'دهم');
    setField(initial?.field ?? 'ریاضی');
    setPhone(initial?.phone ?? '');
    setGuardianName(initial?.guardianName ?? '');
    setGuardianPhone(initial?.guardianPhone ?? '');
    setStatus(initial?.status ?? 'active');
    setGpa(initial ? String(initial.gpa) : '');
    setEnrolledAt(initial?.enrolledAt ?? '');
    setErrors({});
  }, [open, initial, classes]);

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const normalizedPhone = normalizeDigitsLocal(phone);
    const normalizedGuardianPhone = normalizeDigitsLocal(guardianPhone);
    const gpaValue = Number(normalizeDigitsLocal(gpa).replace(',', '.'));

    if (!name.trim()) nextErrors.name = 'نام دانش‌آموز الزامی است.';
    if (!classId) nextErrors.classId = 'انتخاب کلاس الزامی است.';
    if (!isValidPhone(normalizedPhone))
      nextErrors.phone = 'شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (!guardianName.trim()) nextErrors.guardianName = 'نام ولی الزامی است.';
    if (!isValidPhone(normalizedGuardianPhone))
      nextErrors.guardianPhone = 'شماره تماس ولی باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (gpa !== '' && (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 20))
      nextErrors.gpa = 'معدل باید بین ۰ تا ۲۰ باشد.';
    if (enrolledAt && Number.isNaN(Date.parse(enrolledAt)))
      nextErrors.enrolledAt = 'تاریخ ثبت‌نام معتبر نیست.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      studentCode: studentCode.trim() || `1403${String(Date.now()).slice(-4)}`,
      classId,
      gradeLevel,
      field,
      phone: normalizedPhone,
      guardianName: guardianName.trim(),
      guardianPhone: normalizedGuardianPhone,
      status,
      gpa: gpa === '' ? 0 : gpaValue,
      enrolledAt: enrolledAt || new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'ویرایش دانش‌آموز' : 'افزودن دانش‌آموز جدید'}
      description="اطلاعات دانش‌آموز را وارد کنید. کد دانش‌آموزی در صورت خالی بودن به‌صورت خودکار ساخته می‌شود."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initial ? 'ذخیره تغییرات' : 'افزودن دانش‌آموز'}
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
          placeholder="مثال: سارا محمدی"
        />
        <Input
          label="کد دانش‌آموزی"
          value={studentCode}
          onChange={(e) => setStudentCode(normalizeDigitsLocal(e.target.value))}
          hint="در صورت خالی بودن خودکار ساخته می‌شود."
          placeholder="14031001"
          inputMode="numeric"
        />
        <Select
          label="کلاس"
          required
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          error={errors.classId}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="انتخاب کلاس"
        />
        <Select
          label="پایه تحصیلی"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          options={GRADE_LEVELS.map((g) => ({ value: g, label: g }))}
        />
        <Select
          label="رشته"
          value={field}
          onChange={(e) => setField(e.target.value)}
          options={FIELDS.map((f) => ({ value: f, label: f }))}
        />
        <Select
          label="وضعیت ثبت‌نام"
          value={status}
          onChange={(e) => setStatus(e.target.value as StudentStatus)}
          options={STATUS_OPTIONS}
        />
        <Input
          label="شماره تماس دانش‌آموز"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="09191111001"
          inputMode="tel"
          dir="ltr"
          className="[&_input]:text-left"
        />
        <Input
          label="معدل کل (از ۲۰)"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
          error={errors.gpa}
          placeholder="17.5"
          inputMode="decimal"
        />
        <Input
          label="نام ولی"
          required
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          error={errors.guardianName}
          placeholder="مثال: زهرا کریمی"
        />
        <Input
          label="شماره تماس ولی"
          required
          value={guardianPhone}
          onChange={(e) => setGuardianPhone(e.target.value)}
          error={errors.guardianPhone}
          placeholder="09121120001"
          inputMode="tel"
          dir="ltr"
          className="[&_input]:text-left"
        />
        <JalaliDateField
          label="تاریخ ثبت‌نام"
          value={enrolledAt}
          onChange={(e) => setEnrolledAt(e.target.value)}
          error={errors.enrolledAt}
        />
      </div>
    </Modal>
  );
}
