import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calendar,
  Hash,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  UserRound,
} from 'lucide-react';
import { Avatar, Badge, Button } from '../../../components';
import { ROUTES } from '../../../constants/routes';
import { formatJalali, toPersianDigits } from '../../../utils';
import {
  ACADEMIC_YEAR_LABEL,
  PARENT_RELATION_LABELS,
  SCHOOL_NAME_LABEL,
  formatPersianDecimal,
  formatPersianPercent,
  type StudentDossier,
} from '../lib/studentAnalytics';

export interface StudentProfileCardProps {
  dossier: StudentDossier;
  weightedGpa: number;
  attendanceRate: number;
  compact?: boolean;
}

/**
 * Student identity & academic status card.
 * Used both as a compact hero summary on the Student Dashboard and as the
 * comprehensive student ID card on the Profile page.
 */
export function StudentProfileCard({
  dossier,
  weightedGpa,
  attendanceRate,
  compact = false,
}: StudentProfileCardProps) {
  const { student, schoolClass, homeroomTeacher, guardian, classRank, classmatesCount } = dossier;

  const statusBadge =
    student.status === 'active'
      ? { variant: 'success' as const, label: 'مشغول به تحصیل' }
      : student.status === 'suspended'
        ? { variant: 'danger' as const, label: 'وضعیت تعلیق' }
        : { variant: 'info' as const, label: 'فارغ‌التحصیل' };

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      {/* Subtle navy/blue accent bar — solid professional SaaS header, no loud gradients */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-slate-50/80 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary-navy">
            <ShieldCheck size={15} className="text-primary" aria-hidden="true" />
            {SCHOOL_NAME_LABEL}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <span className="text-[12px] font-medium text-text-muted">
            سال تحصیلی {ACADEMIC_YEAR_LABEL}
          </span>
        </div>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <Avatar name={student.name} color={student.avatarColor} size={compact ? 'lg' : 'xl'} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-text sm:text-xl">{student.name}</h2>
                <Badge variant="primary" dot={false}>
                  پایه {student.gradeLevel} {student.field}
                </Badge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <Hash size={13} aria-hidden="true" />
                  کد دانش‌آموزی:{' '}
                  <strong className="font-bold text-text">
                    {toPersianDigits(student.studentCode)}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={13} aria-hidden="true" />
                  کلاس: <strong className="font-bold text-text">{schoolClass?.name ?? '—'}</strong>
                </span>
                {schoolClass?.room && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} aria-hidden="true" />
                    محل تشکیل: <strong className="font-bold text-text">{schoolClass.room}</strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Key quick metrics / CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-btn border border-border bg-background px-3.5 py-2 text-center">
              <p className="text-[11px] text-text-muted">معدل مؤثر</p>
              <p className="mt-0.5 text-base font-extrabold text-primary">
                {formatPersianDecimal(weightedGpa)}
                <span className="ms-1 text-[11px] font-medium text-text-muted">از ۲۰</span>
              </p>
            </div>
            <div className="rounded-btn border border-border bg-background px-3.5 py-2 text-center">
              <p className="text-[11px] text-text-muted">درصد حضور</p>
              <p className="mt-0.5 text-base font-extrabold text-success">
                {formatPersianPercent(attendanceRate)}
              </p>
            </div>
            <div className="rounded-btn border border-border bg-background px-3.5 py-2 text-center">
              <p className="text-[11px] text-text-muted">رتبه در کلاس</p>
              <p className="mt-0.5 text-base font-extrabold text-text">
                {toPersianDigits(classRank)}
                <span className="ms-1 text-[11px] font-medium text-text-muted">
                  از {toPersianDigits(classmatesCount)}
                </span>
              </p>
            </div>

            {compact && (
              <Link to={`${ROUTES.STUDENT}/profile`}>
                <Button variant="outline" size="sm" leftIcon={UserRound}>
                  پروفایل کامل
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Extended dossier grid when not compact */}
        {!compact && (
          <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-5 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <UserCheck size={14} className="text-primary" aria-hidden="true" />
                معلم راهنما (مسئول کلاس)
              </dt>
              <dd className="mt-1 font-bold text-text">{homeroomTeacher?.name ?? 'تعیین‌نشده'}</dd>
              {homeroomTeacher && (
                <p className="mt-0.5 text-[11px] text-text-muted">
                  تخصص: {homeroomTeacher.specialty}
                </p>
              )}
            </div>

            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <UserRound size={14} className="text-primary" aria-hidden="true" />
                ولی / سرپرست دانش‌آموز
              </dt>
              <dd className="mt-1 font-bold text-text">{student.guardianName}</dd>
              <p className="mt-0.5 text-[11px] text-text-muted">
                نسبت: {guardian ? PARENT_RELATION_LABELS[guardian.relation] : 'ولی قانونی'}
                {guardian?.occupation ? ` • ${guardian.occupation}` : ''}
              </p>
            </div>

            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <Phone size={14} className="text-primary" aria-hidden="true" />
                تلفن تماس اضطراری ولی
              </dt>
              <dd className="mt-1 font-bold text-text">{toPersianDigits(student.guardianPhone)}</dd>
              <p className="mt-0.5 text-[11px] text-text-muted">
                همراه دانش‌آموز: {toPersianDigits(student.phone)}
              </p>
            </div>

            <div className="rounded-btn border border-border bg-background p-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <Calendar size={14} className="text-primary" aria-hidden="true" />
                تاریخ ثبت‌نام و پرونده
              </dt>
              <dd className="mt-1 font-bold text-text">{formatJalali(student.enrolledAt)}</dd>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-text-muted">
                <Award size={12} className="text-warning" aria-hidden="true" />
                معدل پایه ثبت‌شده: {formatPersianDecimal(student.gpa)} از ۲۰
              </p>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
