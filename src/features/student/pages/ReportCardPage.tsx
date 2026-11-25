import { Link } from 'react-router-dom';
import { Award, CheckCircle2, ClipboardList, FileText, Printer, ShieldCheck } from 'lucide-react';
import { Avatar, Badge, Button, EmptyState, PageHeader } from '../../../components';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks';
import { toPersianDigits } from '../../../utils';
import { useStudentPortal } from '../hooks/useStudentPortal';
import {
  ACADEMIC_YEAR_LABEL,
  PASSING_SCORE,
  SCHOOL_NAME_LABEL,
  formatPersianDecimal,
  formatPersianPercent,
  gradeBadgeVariant,
  gradeQualitativeLabel,
} from '../lib/studentAnalytics';

export default function ReportCardPage() {
  const { student, dossier, academic, attendance } = useStudentPortal();
  const { showToast } = useToast();

  if (!student || !dossier || !academic || !attendance) {
    return (
      <EmptyState
        icon={FileText}
        title="کارنامه در دسترس نیست"
        description="اطلاعات نمرات دانش‌آموز یافت نشد."
      />
    );
  }

  const gradedSubjects = academic.allClassSubjects;
  const weightedPoints = academic.subjectSummaries.reduce(
    (sum, s) => sum + s.average * s.coefficient,
    0,
  );
  const gradedCoefficients = academic.subjectSummaries.reduce((sum, s) => sum + s.coefficient, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="کارنامه تحصیلی نیم‌سال اول"
        description={`کارنامه رسمی مستخرج از نمرات ثبت‌شده در سال تحصیلی ${ACADEMIC_YEAR_LABEL}`}
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'کارنامه تحصیلی' }]}
        actions={
          <>
            <Link to={`${ROUTES.STUDENT}/grades`}>
              <Button variant="outline" size="sm" leftIcon={ClipboardList}>
                ریز نمرات آزمون‌ها
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Printer}
              onClick={() => {
                showToast(
                  'info',
                  'پیش‌نمایش چاپ کارنامه آماده شد (شبیه‌سازی نسخه نمایشی).',
                  'چاپ کارنامه',
                );
                window.print();
              }}
            >
              چاپ کارنامه
            </Button>
          </>
        }
      />

      {/* Official Report Card Sheet */}
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {/* Header Banner */}
        <div className="border-b border-border bg-slate-50/90 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-primary-navy text-white">
                <ShieldCheck size={26} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-text sm:text-lg">
                  {SCHOOL_NAME_LABEL}
                </h2>
                <p className="mt-0.5 text-[12px] text-text-muted">
                  کارنامه مستمر و میان‌ترم • سال تحصیلی {ACADEMIC_YEAR_LABEL}
                </p>
              </div>
            </div>

            <Badge variant="success">
              <CheckCircle2 size={13} className="me-1" aria-hidden="true" />
              تأییدشده در سامانه آموزش
            </Badge>
          </div>

          {/* Student summary strip */}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-btn border border-border bg-surface p-4 text-[12px] sm:grid-cols-4 lg:grid-cols-6">
            <div className="col-span-2 flex items-center gap-3">
              <Avatar name={student.name} color={student.avatarColor} size="md" />
              <div>
                <p className="text-[11px] text-text-muted">نام دانش‌آموز</p>
                <p className="font-extrabold text-text">{student.name}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-text-muted">کد دانش‌آموزی</p>
              <p className="mt-0.5 font-bold text-text">{toPersianDigits(student.studentCode)}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted">پایه و رشته</p>
              <p className="mt-0.5 font-bold text-text">
                {student.gradeLevel} {student.field}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted">کلاس</p>
              <p className="mt-0.5 font-bold text-text">{dossier.schoolClass?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted">رتبه در کلاس</p>
              <p className="mt-0.5 font-extrabold text-primary">
                رتبه {toPersianDigits(dossier.classRank)} از{' '}
                {toPersianDigits(dossier.classmatesCount)}
              </p>
            </div>
          </div>
        </div>

        {/* Grades Transcript Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <caption className="sr-only">جدول کارنامه دروس و ضرایب</caption>
            <thead>
              <tr className="border-b border-border bg-slate-50/60 text-[11px] font-bold text-text-muted">
                <th scope="col" className="px-4 py-3 text-start">
                  ردیف
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  کد و نام درس
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  دبیر درس
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  واحد / ضریب
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  نمره مأخوذه (از ۲۰)
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  میانگین کلاس
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  نمره تراز (ضریب × نمره)
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  وضعیت قبولی
                </th>
              </tr>
            </thead>
            <tbody>
              {gradedSubjects.map((sub, index) => {
                const hasGrade = sub.gradesCount > 0;
                const passed = hasGrade && sub.average >= PASSING_SCORE;
                return (
                  <tr
                    key={sub.subjectId}
                    className="border-b border-border transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3.5 text-text-muted">{toPersianDigits(index + 1)}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-text">{sub.subjectName}</span>
                      <span
                        dir="ltr"
                        className="ms-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-text-muted"
                      >
                        {sub.subjectCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-text-muted">{sub.teacherName}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-text">
                      {toPersianDigits(sub.coefficient)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {hasGrade ? (
                        <span className="font-extrabold text-text">
                          {formatPersianDecimal(sub.average)}
                        </span>
                      ) : (
                        <span className="text-[12px] text-text-muted">در انتظار ثبت</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-[12px] text-text-muted">
                      {sub.classAverage > 0 ? formatPersianDecimal(sub.classAverage) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-text">
                      {hasGrade ? formatPersianDecimal(sub.average * sub.coefficient) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {hasGrade ? (
                        <Badge variant={gradeBadgeVariant(sub.average)}>
                          {passed ? gradeQualitativeLabel(sub.average) : 'نیازمند جبران'}
                        </Badge>
                      ) : (
                        <Badge variant="neutral" dot={false}>
                          ثبت‌نشده
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50/50 font-bold text-text">
                <td colSpan={3} className="px-4 py-4 text-start">
                  جمع واحدهای دارای نمره و معدل وزنی نیم‌سال
                </td>
                <td className="px-4 py-4 text-center">
                  {toPersianDigits(gradedCoefficients)} واحد
                </td>
                <td className="px-4 py-4 text-center text-base font-extrabold text-primary">
                  {formatPersianDecimal(academic.weightedAverage)} از ۲۰
                </td>
                <td className="px-4 py-4 text-center text-[12px] text-text-muted">
                  {formatPersianDecimal(dossier.classAverageGpa)}
                </td>
                <td className="px-4 py-4 text-center">{formatPersianDecimal(weightedPoints)}</td>
                <td className="px-4 py-4 text-center">
                  <Badge variant={gradeBadgeVariant(academic.weightedAverage)}>
                    <Award size={12} className="me-1" aria-hidden="true" />
                    {gradeQualitativeLabel(academic.weightedAverage)}
                  </Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Summary Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-slate-50/60 px-5 py-4 text-[12px] text-text-muted">
          <span>
            وضعیت انضباط و حضور در کلاس:{' '}
            <strong className="font-bold text-success">
              {formatPersianPercent(attendance.attendanceRate)} حضور مؤثر
            </strong>
          </span>
          <span>
            معلم راهنما:{' '}
            <strong className="text-text">{dossier.homeroomTeacher?.name ?? '—'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
