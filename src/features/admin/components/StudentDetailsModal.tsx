/**
 * Admin feature — read-only student profile modal.
 * Shows identity, guardian, academic + attendance + payment summaries
 * derived live from the shared in-memory database.
 */
import { Badge, Button, Modal } from '../../../components';
import { getClassById, getPaymentsForStudent } from '../../../data';
import type { Database } from '../../../data';
import type { Student } from '../../../types';
import { formatJalali, formatToman, toPersianDigits } from '../../../utils';
import { ATTENDANCE_STATUS_LABELS, STUDENT_STATUS_LABELS } from '../lib/labels';

interface StudentDetailsModalProps {
  student: Student | null;
  db: Database;
  onClose: () => void;
}

export function StudentDetailsModal({ student, db, onClose }: StudentDetailsModalProps) {
  const status = student ? STUDENT_STATUS_LABELS[student.status] : null;
  const grades = student ? db.grades.filter((g) => g.studentId === student.id) : [];
  const attendance = student ? db.attendance.filter((a) => a.studentId === student.id) : [];
  const payments = student ? getPaymentsForStudent(db, student.id) : [];
  const outstanding = payments
    .filter((p) => p.status !== 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <Modal
      open={student !== null}
      onClose={onClose}
      title={student ? `پرونده ${student.name}` : 'پرونده دانش‌آموز'}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          بستن
        </Button>
      }
    >
      {student && status && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant="primary" dot={false}>
              {student.gradeLevel} {student.field}
            </Badge>
            <Badge variant="neutral" dot={false}>
              {getClassById(db, student.classId)?.name ?? 'بدون کلاس'}
            </Badge>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-3">
            <div className="rounded-btn bg-slate-50 p-3">
              <dt className="text-text-muted">کد دانش‌آموزی</dt>
              <dd className="mt-0.5 font-bold">{toPersianDigits(student.studentCode)}</dd>
            </div>
            <div className="rounded-btn bg-slate-50 p-3">
              <dt className="text-text-muted">معدل کل</dt>
              <dd className="mt-0.5 font-bold">{toPersianDigits(student.gpa)} از ۲۰</dd>
            </div>
            <div className="rounded-btn bg-slate-50 p-3">
              <dt className="text-text-muted">تاریخ ثبت‌نام</dt>
              <dd className="mt-0.5 font-bold">{formatJalali(student.enrolledAt)}</dd>
            </div>
            <div className="rounded-btn bg-slate-50 p-3">
              <dt className="text-text-muted">شماره تماس</dt>
              <dd className="mt-0.5 font-bold">{toPersianDigits(student.phone)}</dd>
            </div>
            <div className="rounded-btn bg-slate-50 p-3">
              <dt className="text-text-muted">نام ولی</dt>
              <dd className="mt-0.5 font-bold">{student.guardianName}</dd>
            </div>
            <div className="rounded-btn bg-slate-50 p-3">
              <dt className="text-text-muted">تماس ولی</dt>
              <dd className="mt-0.5 font-bold">{toPersianDigits(student.guardianPhone)}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-card border border-border p-4">
              <p className="text-[11px] font-semibold text-text-muted">نمرات ثبت‌شده</p>
              <p className="mt-1 text-lg font-extrabold text-text">{toPersianDigits(grades.length)} مورد</p>
              <p className="mt-1 text-[11px] leading-5 text-text-muted">
                {grades.length > 0
                  ? `میانگین ${toPersianDigits(Math.round((grades.reduce((a, g) => a + g.score, 0) / grades.length) * 100) / 100)} از ۲۰`
                  : 'هنوز نمره‌ای ثبت نشده است.'}
              </p>
            </div>
            <div className="rounded-card border border-border p-4">
              <p className="text-[11px] font-semibold text-text-muted">حضور و غیاب</p>
              <p className="mt-1 text-lg font-extrabold text-text">{toPersianDigits(attendance.length)} رکورد</p>
              <p className="mt-1 text-[11px] leading-5 text-text-muted">
                {attendance.length > 0
                  ? `${toPersianDigits(attendance.filter((a) => a.status === 'absent').length)} غیبت • ${toPersianDigits(attendance.filter((a) => a.status === 'late').length)} دیرکرد`
                  : 'هنوز رکوردی ثبت نشده است.'}
              </p>
            </div>
            <div className="rounded-card border border-border p-4">
              <p className="text-[11px] font-semibold text-text-muted">بدهی شهریه</p>
              <p className="mt-1 text-lg font-extrabold text-text">{formatToman(outstanding)}</p>
              <p className="mt-1 text-[11px] leading-5 text-text-muted">
                {payments.length > 0
                  ? `${toPersianDigits(payments.filter((p) => p.status === 'paid').length)} پرداخت انجام شده است.`
                  : 'پرداختی برای این دانش‌آموز ثبت نشده است.'}
              </p>
            </div>
          </div>

          {attendance.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-bold text-text">آخرین وضعیت‌های حضور</p>
              <div className="flex flex-wrap gap-1.5">
                {attendance
                  .slice(-6)
                  .map((record) => (
                    <Badge key={record.id} variant={ATTENDANCE_STATUS_LABELS[record.status].variant} dot={false}>
                      {formatJalali(record.date)} — {ATTENDANCE_STATUS_LABELS[record.status].label}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
