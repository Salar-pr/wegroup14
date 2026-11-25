/**
 * Admin feature — create / edit announcement form (modal content).
 */
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../../components';
import type { Announcement, AnnouncementAudience, AnnouncementPriority } from '../../../types';
import { ANNOUNCEMENT_AUDIENCE_LABELS, ANNOUNCEMENT_PRIORITY_LABELS } from '../lib/labels';

export interface AnnouncementFormValues {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  pinned: boolean;
}

interface AnnouncementFormProps {
  open: boolean;
  initial: Announcement | null;
  authorName: string;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues) => void;
}

const AUDIENCE_OPTIONS = (Object.keys(ANNOUNCEMENT_AUDIENCE_LABELS) as AnnouncementAudience[]).map(
  (audience) => ({ value: audience, label: ANNOUNCEMENT_AUDIENCE_LABELS[audience] }),
);

const PRIORITY_OPTIONS = (
  Object.keys(ANNOUNCEMENT_PRIORITY_LABELS) as AnnouncementPriority[]
).map((priority) => ({
  value: priority,
  label: ANNOUNCEMENT_PRIORITY_LABELS[priority].label,
}));

export function AnnouncementForm({
  open,
  initial,
  authorName,
  onClose,
  onSubmit,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>('all');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [pinned, setPinned] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? '');
    setBody(initial?.body ?? '');
    setAudience(initial?.audience ?? 'all');
    setPriority(initial?.priority ?? 'normal');
    setPinned(initial?.pinned ?? false);
    setErrors({});
  }, [open, initial]);

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = 'عنوان اطلاعیه الزامی است.';
    if (!body.trim()) nextErrors.body = 'متن اطلاعیه الزامی است.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      audience,
      priority,
      pinned,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'ویرایش اطلاعیه' : 'انتشار اطلاعیه جدید'}
      description={`اطلاعیه با نام «${authorName}» منتشر می‌شود.`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initial ? 'ذخیره تغییرات' : 'انتشار اطلاعیه'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="عنوان اطلاعیه"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="مثال: برگزاری آزمون‌های میان‌ترم"
        />
        <div>
          <label htmlFor="ann-body" className="mb-1.5 block text-[13px] font-medium text-text">
            متن اطلاعیه <span className="ms-1 text-danger">*</span>
          </label>
          <textarea
            id="ann-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="متن کامل اطلاعیه را بنویسید…"
            aria-invalid={errors.body ? true : undefined}
            className={`w-full rounded-input border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-slate-400 transition-shadow duration-150 focus:outline-none focus:ring-4 ${
              errors.body
                ? 'border-danger focus:border-danger focus:ring-red-100'
                : 'border-border focus:border-primary focus:ring-blue-100'
            }`}
          />
          {errors.body && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.body}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="مخاطبان"
            value={audience}
            onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
            options={AUDIENCE_OPTIONS}
          />
          <Select
            label="اولویت"
            value={priority}
            onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
            options={PRIORITY_OPTIONS}
          />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-text">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 accent-[#2563EB]"
          />
          سنجاق کردن اطلاعیه (نمایش در بالای لیست)
        </label>
      </div>
    </Modal>
  );
}
