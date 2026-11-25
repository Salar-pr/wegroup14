/**
 * Admin feature — create / edit class form (modal content).
 */
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../../components';
import type { SchoolClass, Teacher } from '../../../types';
import { FIELDS, GRADE_LEVELS, normalizeDigitsLocal } from '../lib/labels';

export interface ClassFormValues {
  name: string;
  gradeLevel: SchoolClass['gradeLevel'];
  field: string;
  homeroomTeacherId: string;
  capacity: number;
  enrolled: number;
  room: string;
}

interface ClassFormProps {
  open: boolean;
  initial: SchoolClass | null;
  teachers: Teacher[];
  onClose: () => void;
  onSubmit: (values: ClassFormValues) => void;
}

export function ClassForm({ open, initial, teachers, onClose, onSubmit }: ClassFormProps) {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<SchoolClass['gradeLevel']>('دهم');
  const [field, setField] = useState<string>('ریاضی');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [enrolled, setEnrolled] = useState('');
  const [room, setRoom] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setGradeLevel(initial?.gradeLevel ?? 'دهم');
    setField(initial?.field ?? 'ریاضی');
    setHomeroomTeacherId(initial?.homeroomTeacherId ?? teachers[0]?.id ?? '');
    setCapacity(initial ? String(initial.capacity) : '');
    setEnrolled(initial ? String(initial.enrolled) : '');
    setRoom(initial?.room ?? '');
    setErrors({});
  }, [open, initial, teachers]);

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const capacityValue = Number(normalizeDigitsLocal(capacity));
    const enrolledValue = Number(normalizeDigitsLocal(enrolled));

    if (!name.trim()) nextErrors.name = 'نام کلاس الزامی است.';
    if (!homeroomTeacherId) nextErrors.homeroomTeacherId = 'انتخاب معلم کلاس الزامی است.';
    if (capacity === '' || Number.isNaN(capacityValue) || capacityValue <= 0)
      nextErrors.capacity = 'ظرفیت باید عدد مثبت باشد.';
    if (enrolled === '' || Number.isNaN(enrolledValue) || enrolledValue < 0)
      nextErrors.enrolled = 'تعداد دانش‌آموزان باید عدد نامنفی باشد.';
    else if (!Number.isNaN(capacityValue) && enrolledValue > capacityValue)
      nextErrors.enrolled = 'تعداد دانش‌آموزان نمی‌تواند از ظرفیت بیشتر باشد.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      gradeLevel,
      field,
      homeroomTeacherId,
      capacity: capacityValue,
      enrolled: enrolledValue,
      room: room.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'ویرایش کلاس' : 'ایجاد کلاس جدید'}
      description="مشخصات کلاس و معلم کلاس را تعیین کنید."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initial ? 'ذخیره تغییرات' : 'ایجاد کلاس'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="نام کلاس"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="مثال: دهم ریاضی ۲"
        />
        <Select
          label="پایه تحصیلی"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value as SchoolClass['gradeLevel'])}
          options={GRADE_LEVELS.map((g) => ({ value: g, label: g }))}
        />
        <Select
          label="رشته"
          value={field}
          onChange={(e) => setField(e.target.value)}
          options={FIELDS.map((f) => ({ value: f, label: f }))}
        />
        <Select
          label="معلم کلاس"
          required
          value={homeroomTeacherId}
          onChange={(e) => setHomeroomTeacherId(e.target.value)}
          error={errors.homeroomTeacherId}
          options={teachers.map((t) => ({ value: t.id, label: t.name }))}
          placeholder="انتخاب معلم"
        />
        <Input
          label="ظرفیت کلاس"
          required
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          error={errors.capacity}
          placeholder="32"
          inputMode="numeric"
        />
        <Input
          label="تعداد دانش‌آموزان"
          required
          value={enrolled}
          onChange={(e) => setEnrolled(e.target.value)}
          error={errors.enrolled}
          placeholder="28"
          inputMode="numeric"
        />
        <Input
          label="شماره کلاس / اتاق"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="مثال: کلاس ۲"
        />
      </div>
    </Modal>
  );
}
