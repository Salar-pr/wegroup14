import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  School,
  UserRound,
  Users,
} from 'lucide-react';
import { Avatar, Badge, Button, Modal } from '../../../components';
import { ROUTES } from '../../../constants';
import { useData } from '../../../hooks';
import { formatJalali, toPersianDigits } from '../../../utils';
import type { Student } from '../../../types';
import {
  buildAcademicSummary,
  buildClassInfo,
  scoreText,
} from '../lib/parentAnalytics';
import { SectionCard } from './SectionCard';

export interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

/**
 * Read-only dossier of one child: identity, class, teachers and academic
 * details. Every value is joined from the live db, so it stays in sync with
 * the rest of the app.
 */
export function StudentProfileModal({ open, onClose, student }: StudentProfileModalProps) {
  const { db } = useData();

  if (!student) return null;

  const classInfo = buildClassInfo(db, student);
  const academic = buildAcademicSummary(db, student.id);
  const parent = db.parents.find((item) => item.studentIds.includes(student.id));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="پروندهٔ دانش‌آموز"
      description={`${student.name} — ${classInfo.schoolClass?.name ?? student.gradeLevel}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>
          <Link to={`${ROUTES.PARENT}/grades`}>
            <Button variant="primary" leftIcon={GraduationCap}>
              مشاهدهٔ کارنامه
            </Button>
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Identity */}
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-slate-50/60 p-3">
          <Avatar name={student.name} color={student.avatarColor} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-text">{student.name}</p>
            <p className="text-[11px] text-text-muted">
              پایه {student.gradeLevel} · رشته {student.field} · کد{' '}
              {toPersianDigits(student.studentCode)}
            </p>
          </div>
          <Badge variant={student.status === 'active' ? 'success' : 'danger'}>
            {student.status === 'active' ? 'در حال تحصیل' : 'معلق'}
          </Badge>
        </div>

        {/* Facts */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SectionCard title="مشخصات تحصیلی" icon={School}>
            <dl className="space-y-1.5 text-[11.5px]">
              <Row icon={School} label="کلاس" value={classInfo.schoolClass?.name ?? '—'} />
              <Row icon={UserRound} label="مربی کلاس" value={classInfo.homeroomTeacher?.name ?? '—'} />
              <Row
                icon={CalendarDays}
                label="تاریخ ثبت‌نام"
                value={formatJalali(student.enrolledAt)}
              />
              <Row icon={BookOpen} label="ساعت هفتگی" value={`${toPersianDigits(classInfo.weeklyHours)} ساعت`} />
              <Row icon={Users} label="هم‌کلاسی‌ها" value={`${toPersianDigits(classInfo.classmates)} نفر`} />
              <Row icon={GraduationCap} label="معدل ثبت‌شده" value={scoreText(academic.overallAverage)} />
            </dl>
          </SectionCard>

          <SectionCard title="اطلاعات تماس" icon={Phone}>
            <dl className="space-y-1.5 text-[11.5px]">
              <Row
                icon={Phone}
                label="تلفن دانش‌آموز"
                value={toPersianDigits(student.phone)}
                ltr
              />
              <Row icon={UserRound} label="نام ولی" value={parent?.name ?? student.guardianName} />
              <Row
                icon={Phone}
                label="تلفن ولی"
                value={toPersianDigits(parent?.phone ?? student.guardianPhone)}
                ltr
              />
              <Row icon={Mail} label="اتاق کلاس" value={classInfo.schoolClass?.room ?? '—'} />
              <Row
                icon={Users}
                label="ظرفیت کلاس"
                value={`${toPersianDigits(classInfo.schoolClass?.enrolled ?? 0)} از ${toPersianDigits(classInfo.schoolClass?.capacity ?? 0)}`}
              />
            </dl>
          </SectionCard>
        </div>

        {/* Teachers */}
        <SectionCard title="دبیران این کلاس" description={`${toPersianDigits(classInfo.teachers.length)} دبیر`} icon={Users} flush>
          {classInfo.teachers.length === 0 ? (
            <p className="px-4 py-3 text-[11.5px] text-text-muted">دبیری ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-border">
              {classInfo.teachers.map(({ teacher, subjects }) => (
                <li key={teacher.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar name={teacher.name} color={teacher.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-text">{teacher.name}</p>
                    <p className="truncate text-[10.5px] text-text-muted">{teacher.specialty}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {subjects.map((subject) => (
                      <Badge key={subject.id} variant="neutral" dot={false}>
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Subject averages snapshot */}
        <SectionCard title="میانگین دروس" icon={GraduationCap}>
          {academic.subjects.length === 0 ? (
            <p className="text-[11.5px] text-text-muted">نمره‌ای ثبت نشده است.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {academic.subjects.map((subject) => (
                <li
                  key={subject.subjectId}
                  className="flex items-center justify-between gap-2 rounded-btn border border-border px-2.5 py-1.5"
                >
                  <span className="truncate text-[11.5px] font-semibold text-text">
                    {subject.subjectName}
                  </span>
                  <span className="shrink-0 text-[11.5px] font-extrabold text-primary">
                    {scoreText(subject.average)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </Modal>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  ltr = false,
}: {
  icon: typeof School;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="flex shrink-0 items-center gap-1.5 text-text-muted">
        <Icon size={12} aria-hidden="true" className="text-slate-400" />
        {label}
      </dt>
      <dd
        className={`min-w-0 text-end font-semibold text-text ${ltr ? 'font-mono' : ''}`}
        dir={ltr ? 'ltr' : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
