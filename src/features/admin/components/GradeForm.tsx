/**
 * Admin feature — create / edit grade form (modal content).
 * The teacher is derived from the selected subject (subject.teacherId).
 */
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../../components';
import { JalaliDateField } from './JalaliDateField';
import type { Grade, GradeType, Student, Subject } from '../../../types';
import { GRADE_TYPE_LABELS, normalizeDigitsLocal } from '../lib/labels';

export interface GradeFormValues {
  studentId: string;
  subjectId: string;
  title: string;
  type: GradeType;
  score: number;
  maxScore: number;
  date: string;
}

interface GradeFormProps {
  open: boolean;
  initial: Grade | null;
  students: Student[];
  subjects: Subject[];
  defaultStudentId?: string;
  defaultSubjectId?: string;
  onClose: () => void;
  onSubmit: (values: GradeFormValues) => void;
}

const TYPE_OPTIONS = (Object.keys(GRADE_TYPE_LABELS) as GradeType[]).map((type) => ({
  value: type,
  label: GRADE_TYPE_LABELS[type],
}));

export function GradeForm({
  open,
  initial,
  students,
  subjects,
  defaultStudentId,
  defaultSubjectId,
  onClose,
  onSubmit,
}: GradeFormProps) {
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GradeType>('quiz');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('20');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setStudentId(initial?.studentId ?? defaultStudentId ?? students[0]?.id ?? '');
    setSubjectId(initial?.subjectId ?? defaultSubjectId ?? subjects[0]?.id ?? '');
    setTitle(initial?.title ?? '');
    setType(initial?.type ?? 'quiz');
    setScore(initial ? String(initial.score) : '');
    setMaxScore(initial ? String(initial.maxScore) : '20');
    setDate(initial?.date ?? '');
    setErrors({});
  }, [open, initial, students, subjects, defaultStudentId, defaultSubjectId]);

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const scoreValue = Number(normalizeDigitsLocal(score).replace(',', '.'));
    const maxScoreValue = Number(normalizeDigitsLocal(maxScore).replace(',', '.'));

    if (!studentId) nextErrors.studentId = 'انتخاب دانش‌آموز الزامی است.';
    if (!subjectId) nextErrors.subjectId = 'انتخاب درس الزامی است.';
    if (!title.trim()) nextErrors.title = 'عنوان آزمون/تکلیف الزامی است.';
    if (score === '' || Number.isNaN(scoreValue) || scoreValue < 0)
      nextErrors.score = 'نمره باید عدد نامنفی باشد.';
    if (maxScore === '' || Number.isNaN(maxScoreValue) || maxScoreValue <= 0)
      nextErrors.maxScore = 'حداکثر نمره باید عدد مثبت باشد.';
    else if (!Number.isNaN(scoreValue) && scoreValue > maxScoreValue)
      nextErrors.score = 'نمره نمی‌تواند از حداکثر نمره بیشتر باشد.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      studentId,
      subjectId,
      title: title.trim(),
      type,
      score: scoreValue,
      maxScore: maxScoreValue,
      date: date || new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'ویرایش نمره' : 'ثبت نمره جدید'}
      description="نمره را برای دانش‌آموز و درس مشخص ثبت کنید."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initial ? 'ذخیره تغییرات' : 'ثبت نمره'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="دانش‌آموز"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          error={errors.studentId}
          options={students.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="انتخاب دانش‌آموز"
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
        <Input
          label="عنوان"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="مثال: آزمون کلاسی ۲"
        />
        <Select
          label="نوع ارزیابی"
          value={type}
          onChange={(e) => setType(e.target.value as GradeType)}
          options={TYPE_OPTIONS}
        />
        <Input
          label="نمره"
          required
          value={score}
          onChange={(e) => setScore(e.target.value)}
          error={errors.score}
          placeholder="17.5"
          inputMode="decimal"
        />
        <Input
          label="حداکثر نمره"
          required
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          error={errors.maxScore}
          placeholder="20"
          inputMode="decimal"
        />
        <JalaliDateField
          label="تاریخ ثبت"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </Modal>
  );
}
