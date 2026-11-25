import { useEffect, useState, type FormEvent } from 'react';
import {
  Calendar,
  CheckCircle2,
  FileCheck2,
  Paperclip,
  RotateCcw,
  Send,
  UserRound,
} from 'lucide-react';
import { Badge, Button, Input, Modal } from '../../../components';
import { formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import {
  HOMEWORK_STATUS_META,
  formatPersianDecimal,
  scoreOutOf20,
  type EnrichedHomework,
} from '../lib/studentAnalytics';

export interface HomeworkSubmissionModalProps {
  item: EnrichedHomework | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { homeworkId: string; answerText: string; attachmentName?: string }) => void;
  onWithdraw: (homeworkId: string) => void;
}

const SAMPLE_FILES = [
  'پاسخنامه_تمرین_کلاسی.pdf',
  'تصویر_دفتر_حل_تمرین.jpg',
  'گزارش_پروژه_درسی.docx',
];

/**
 * Interactive assignment details + simulated submission modal using React state.
 * Supports initial submission, editing an existing simulated submission, and
 * withdrawing a submission before teacher grading.
 */
export function HomeworkSubmissionModal({
  item,
  open,
  onClose,
  onSubmit,
  onWithdraw,
}: HomeworkSubmissionModalProps) {
  const [answerText, setAnswerText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!item) return;
    setAnswerText(item.simulatedSubmission?.answerText ?? '');
    setAttachmentName(item.simulatedSubmission?.attachmentName ?? '');
    setError(undefined);
  }, [item, open]);

  if (!item) return null;

  const { homework, status, simulatedSubmission, recordedGrade } = item;
  const statusMeta = HOMEWORK_STATUS_META[status];
  const isGraded = Boolean(recordedGrade);

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (answerText.trim().length < 10) {
      setError('لطفاً پاسخ یا توضیح تکلیف را حداقل در ۱۰ نویسه وارد کنید.');
      return;
    }
    onSubmit({
      homeworkId: homework.id,
      answerText,
      attachmentName: attachmentName || undefined,
    });
    onClose();
  };

  const deadlineNote =
    item.daysRemaining < 0
      ? `${toPersianDigits(Math.abs(item.daysRemaining))} روز از مهلت گذشته`
      : item.daysRemaining === 0
        ? 'مهلت تحویل: پایان امروز'
        : `${toPersianDigits(item.daysRemaining)} روز تا پایان مهلت`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={homework.title}
      description={`درس ${item.subjectName} (${item.subjectCode}) • دبیر: ${item.teacherName}`}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div>
            {simulatedSubmission && !isGraded && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={RotateCcw}
                onClick={() => {
                  onWithdraw(homework.id);
                  onClose();
                }}
              >
                لغو ارسال و بازگردانی به در انتظار
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              بستن
            </Button>
            {!isGraded && (
              <Button variant="primary" size="sm" leftIcon={Send} onClick={handleFormSubmit}>
                {simulatedSubmission ? 'به‌روزرسانی پاسخ ارسالی' : 'ثبت و ارسال تکلیف'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-[13px]">
        {/* Metadata strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-btn border border-border bg-background p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusMeta.badge}>{statusMeta.label}</Badge>
            <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
              <Calendar size={14} className="text-primary" aria-hidden="true" />
              مهلت تحویل:{' '}
              <strong className="font-bold text-text">{formatJalali(homework.dueDate)}</strong> (
              {deadlineNote})
            </span>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-primary">
            بارم تکلیف: {toPersianDigits(homework.maxScore)} نمره
          </span>
        </div>

        {/* Assignment description */}
        <div>
          <h3 className="text-[12px] font-bold text-text-muted">شرح کامل تکلیف</h3>
          <p className="mt-1.5 rounded-btn border border-border bg-surface p-3.5 leading-7 text-text">
            {homework.description}
          </p>
          <p className="mt-1.5 flex items-center gap-3 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1">
              <UserRound size={12} aria-hidden="true" />
              تعریف‌شده توسط {item.teacherName} در تاریخ {formatJalali(homework.assignedAt)}
            </span>
          </p>
        </div>

        {/* Graded feedback state */}
        {recordedGrade && (
          <div className="rounded-card border border-green-200 bg-green-50/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-[13px] font-bold text-green-800">
                <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                این تکلیف توسط دبیر بررسی و نمره‌دهی شده است
              </span>
              <Badge variant="success">
                نمره معادل: {formatPersianDecimal(scoreOutOf20(recordedGrade))} از ۲۰
              </Badge>
            </div>
            <p className="mt-1.5 text-[12px] text-green-800/90">
              عنوان ارزشیابی: «{recordedGrade.title}» • تاریخ ثبت نمره:{' '}
              {formatJalali(recordedGrade.date)}
            </p>
          </div>
        )}

        {/* Previous simulated submission summary */}
        {simulatedSubmission && !recordedGrade && (
          <div className="rounded-card border border-blue-200 bg-blue-50/60 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary-navy">
                <FileCheck2 size={16} className="text-primary" aria-hidden="true" />
                پاسخ شما در این نشست ثبت شده است
              </span>
              <span className="text-[11px] text-text-muted">
                زمان ارسال: {formatRelativeTime(simulatedSubmission.submittedAt)}
              </span>
            </div>
            {simulatedSubmission.attachmentName && (
              <p className="mt-1 text-[11px] text-primary">
                پیوست انتخابی: {simulatedSubmission.attachmentName}
              </p>
            )}
          </div>
        )}

        {/* Simulated submission form */}
        {!isGraded && (
          <form onSubmit={handleFormSubmit} className="space-y-4 border-t border-border pt-4">
            <div>
              <label
                htmlFor="hw-answer-textarea"
                className="mb-1.5 block text-[13px] font-medium text-text"
              >
                متن پاسخ یا گزارش انجام تکلیف <span className="text-danger">*</span>
              </label>
              <textarea
                id="hw-answer-textarea"
                rows={4}
                value={answerText}
                onChange={(e) => {
                  setAnswerText(e.target.value);
                  if (error) setError(undefined);
                }}
                placeholder="پاسخ تمرین‌ها، خلاصه نکات یا توضیحات مربوط به انجام تکلیف را اینجا بنویسید…"
                className="w-full rounded-input border border-border bg-surface p-3 text-sm leading-6 text-text transition-shadow focus:border-primary focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
              {error && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
                  {error}
                </p>
              )}
            </div>

            <div>
              <Input
                label="نام فایل پیوست (شبیه‌سازی پیوست بدون آپلود سرور)"
                leftIcon={Paperclip}
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="مثال: پاسخ_تمرین_فصل_سوم.pdf"
                hint="می‌توانید یکی از فایل‌های نمونه زیر را با یک کلیک پیوست کنید."
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {SAMPLE_FILES.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setAttachmentName(sample)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-text-muted transition-colors hover:border-primary hover:bg-blue-50 hover:text-primary"
                  >
                    <Paperclip size={11} aria-hidden="true" />
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
