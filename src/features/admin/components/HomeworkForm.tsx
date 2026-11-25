/**
 * Admin feature — create / edit homework (assignment) form (modal content).
 */
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../../components';
import { JalaliDateField } from './JalaliDateField';
import type { Homework, SchoolClass, Subject, Teacher } from '../../../types';
import { normalizeDigitsLocal } from '../lib/labels';

export interface HomeworkFormValues {
  title: string;
  description: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  dueDate: string;
  maxScore: number;
}

interface HomeworkFormProps {
  open: boolean;
  initial: Homework | null;
  subjects: Subject[];
  teachers: Teacher[];
  classes: SchoolClass[];
  onClose: () => void;
  onSubmit: (values: HomeworkFormValues) => void;
}

export function HomeworkForm({
  open,
  initial,
  subjects,
  teachers,
  classes,
  onClose,
  onSubmit,
}: HomeworkFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('2');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setSubjectId(initial?.subjectId ?? subjects[0]?.id ?? '');
    setTeacherId(initial?.teacherId ?? teachers[0]?.id ?? '');
    setClassId(initial?.classId ?? classes[0]?.id ?? '');
    setDueDate(initial?.dueDate ?? '');
    setMaxScore(initial ? String(initial.maxScore) : '2');
    setErrors({});
  }, [open, initial, subjects, teachers, classes]);

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const maxScoreValue = Number(normalizeDigitsLocal(maxScore).replace(',', '.'));

    if (!title.trim()) nextErrors.title = 'عنوان تکلیف الزامی است.';
    if (!subjectId) nextErrors.subjectId = 'انتخاب درس الزامی است.';
    if (!teacherId) nextErrors.teacherId = 'انتخاب معلم الزامی است.';
    if (!classId) nextErrors.classId = 'انتخاب کلاس الزامی است.';
    if (!dueDate) nextErrors.dueDate = 'مهلت تحویل الزامی است.';
    if (maxScore === '' || Number.isNaN(maxScoreValue) || maxScoreValue <= 0)
      nextErrors.maxScore = 'حداکثر نمره باید عدد مثبت باشد.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      subjectId,
      teacherId,
      classId,
      dueDate,
      maxScore: maxScoreValue,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'ویرایش تکلیف' : 'ایجاد تکلیف جدید'}
      description="تکلیف را برای یک کلاس و درس مشخص تعریف کنید."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initial ? 'ذخیره تغییرات' : 'ایجاد تکلیف'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="عنوان تکلیف"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="مثال: حل تمرینات فصل ۳"
        />
        <Select
          label="درس"
          required
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          error={errors.subjectId}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="انتخاب درس"
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
          label="معلم"
          required
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          error={errors.teacherId}
          options={teachers.map((t) => ({ value: t.id, label: t.name }))}
          placeholder="انتخاب معلم"
        />
        <JalaliDateField
          label="مهلت تحویل"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
        />
        <Input
          label="حداکثر نمره"
          required
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          error={errors.maxScore}
          placeholder="2"
          inputMode="decimal"
        />
        <div className="sm:col-span-2">
          <label htmlFor="hw-description" className="mb-1.5 block text-[13px] font-medium text-text">
            توضیحات تکلیف
          </label>
          <textarea
            id="hw-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="شرح تکلیف، صفحات موردنظر و نکات مهم…"
            className="w-full rounded-input border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-slate-400 transition-shadow duration-150 focus:border-primary focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>
    </Modal>
  );
}
