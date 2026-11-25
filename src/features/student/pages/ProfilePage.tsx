import { useState, type FormEvent } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Edit3,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { Avatar, Badge, Button, EmptyState, Input, Modal, PageHeader } from '../../../components';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks';
import { formatJalali, toPersianDigits } from '../../../utils';
import { SectionCard } from '../components/SectionCard';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { useStudentPortal } from '../hooks/useStudentPortal';
import {
  ACADEMIC_YEAR_LABEL,
  PARENT_RELATION_LABELS,
  SCHOOL_NAME_LABEL,
  formatPersianDecimal,
  formatPersianPercent,
} from '../lib/studentAnalytics';

export default function ProfilePage() {
  const { currentUser, db, updateEntity, student, dossier, academic, attendance, schedule } =
    useStudentPortal();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState<string | undefined>();

  if (!student || !dossier || !academic || !attendance) {
    return (
      <EmptyState
        icon={UserRound}
        title="پروفایل دانش‌آموزی یافت نشد"
        description="اطلاعات پرونده شما در سامانه موجود نیست."
      />
    );
  }

  // Unique teachers teaching this student's class
  const classTeacherIds = new Set<string>(
    (schedule?.entries ?? []).map((item) => item.entry.teacherId),
  );
  if (dossier.homeroomTeacher) {
    classTeacherIds.add(dossier.homeroomTeacher.id);
  }
  const classTeachers = db.teachers.filter((t) => classTeacherIds.has(t.id));

  const openEditModal = () => {
    setPhoneInput(student.phone);
    setPhoneError(undefined);
    setEditOpen(true);
  };

  const handleSavePhone = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = phoneInput.trim();
    if (!/^[0-9۰-۹]{10,11}$/.test(cleaned)) {
      setPhoneError('لطفاً یک شماره تلفن همراه معتبر ۱۰ یا ۱۱ رقمی وارد کنید.');
      return;
    }
    updateEntity('students', (items) =>
      items.map((item) => (item.id === student.id ? { ...item, phone: cleaned } : item)),
    );
    setEditOpen(false);
    showToast(
      'success',
      'شماره تماس دانش‌آموز در پرونده موقت به‌روزرسانی شد (قابل مشاهده برای مدیر و اولیا).',
      'به‌روزرسانی پرونده',
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="پروفایل و پرونده تحصیلی دانش‌آموز"
        description="مشخصات فردی، کد دانش‌آموزی، اطلاعات پایه و کلاس، سال تحصیلی و مشخصات تماس اولیا"
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'پروفایل من' }]}
        actions={
          <Button variant="outline" size="sm" leftIcon={Edit3} onClick={openEditModal}>
            ویرایش شماره تماس من
          </Button>
        }
      />

      {/* Full Student Profile Hero Card */}
      <StudentProfileCard
        dossier={dossier}
        weightedGpa={academic.weightedAverage}
        attendanceRate={attendance.attendanceRate}
      />

      {/* Detailed Two-Column Sections: Personal/Academic Info + Parent Contact */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Student Academic & Personal Record */}
        <SectionCard
          title="اطلاعات هویتی و تحصیلی"
          subtitle="ثبت‌شده در سامانه یکپارچه آموزش مدرسه"
          icon={Building2}
          className="lg:col-span-6"
        >
          <dl className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
            <InfoField icon={UserRound} label="نام و نام خانوادگی" value={student.name} />
            <InfoField
              icon={Hash}
              label="شماره / کد دانش‌آموزی"
              value={toPersianDigits(student.studentCode)}
            />
            <InfoField
              icon={BookOpen}
              label="پایه و رشته تحصیلی"
              value={`پایه ${student.gradeLevel} — رشته ${student.field}`}
            />
            <InfoField
              icon={MapPin}
              label="کلاس و شماره اتاق"
              value={`${dossier.schoolClass?.name ?? '—'} (${dossier.schoolClass?.room ?? '—'})`}
            />
            <InfoField icon={Calendar} label="سال تحصیلی جاری" value={ACADEMIC_YEAR_LABEL} />
            <InfoField icon={ShieldCheck} label="نام واحد آموزشی" value={SCHOOL_NAME_LABEL} />
            <InfoField
              icon={Phone}
              label="شماره همراه دانش‌آموز"
              value={toPersianDigits(student.phone)}
            />
            <InfoField
              icon={Mail}
              label="رایانامه حساب کاربری"
              value={currentUser?.email ?? 'student@school.ir'}
              ltr
            />
            <InfoField
              icon={Award}
              label="معدل وزنی جاری"
              value={`${formatPersianDecimal(academic.weightedAverage)} از ۲۰ (حضور: ${formatPersianPercent(attendance.attendanceRate)})`}
            />
            <InfoField
              icon={Calendar}
              label="تاریخ ثبت‌نام در مدرسه"
              value={formatJalali(student.enrolledAt)}
            />
          </dl>
        </SectionCard>

        {/* Parent / Guardian Contact Information */}
        <SectionCard
          title="مشخصات و اطلاعات تماس ولی / سرپرست"
          subtitle="هماهنگ با پنل والدین و پرونده اداری مدرسه"
          icon={Users}
          className="lg:col-span-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-card border border-border bg-background p-4">
              <Avatar
                name={student.guardianName}
                color={dossier.guardian?.avatarColor ?? '#2563EB'}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-extrabold text-text">{student.guardianName}</h3>
                  <Badge variant="primary" dot={false}>
                    {dossier.guardian
                      ? PARENT_RELATION_LABELS[dossier.guardian.relation]
                      : 'ولی دانش‌آموز'}
                  </Badge>
                </div>
                <p className="mt-1 text-[12px] text-text-muted">
                  شماره تماس اضطراری:{' '}
                  <strong className="font-bold text-text">
                    {toPersianDigits(student.guardianPhone)}
                  </strong>
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
              <InfoField icon={UserRound} label="نام کامل ولی" value={student.guardianName} />
              <InfoField
                icon={Phone}
                label="شماره تلفن همراه ولی"
                value={toPersianDigits(student.guardianPhone)}
              />
              <InfoField
                icon={UserCheck}
                label="شغل ولی"
                value={dossier.guardian?.occupation ?? 'ثبت‌شده در پرونده فیزیکی'}
              />
              <InfoField
                icon={Calendar}
                label="تاریخ ثبت پرونده اولیا"
                value={
                  dossier.guardian
                    ? formatJalali(dossier.guardian.registeredAt)
                    : formatJalali(student.enrolledAt)
                }
              />
            </dl>

            <div className="rounded-btn border border-blue-200 bg-blue-50/50 p-3.5 text-[12px] leading-6 text-text-muted">
              برای تغییر اطلاعات هویتی رسمی یا شماره تماس اولیا، ولی محترم باید با دفتر آموزش مدرسه
              هماهنگ نماید. تغییرات ثبت‌شده توسط مدیریت مدرسه بلافاصله در این صفحه منعکس می‌گردد.
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Teachers of Student's Class */}
      <SectionCard
        title="کادر آموزشی و دبیران کلاس من"
        subtitle={`فهرست دبیران کلاس ${dossier.schoolClass?.name ?? ''}`}
        icon={UserCheck}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classTeachers.map((teacher) => {
            const isHomeroom = dossier.homeroomTeacher?.id === teacher.id;
            return (
              <div
                key={teacher.id}
                className="flex items-center gap-3 rounded-btn border border-border bg-background p-3.5"
              >
                <Avatar name={teacher.name} color={teacher.avatarColor} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-bold text-text">{teacher.name}</p>
                    {isHomeroom && (
                      <Badge variant="primary" dot={false}>
                        معلم راهنما
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-text-muted">{teacher.specialty}</p>
                  <p className="mt-0.5 truncate text-[11px] text-text-muted" dir="ltr">
                    {teacher.email}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Simulated Contact Phone Update Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="به‌روزرسانی شماره همراه دانش‌آموز"
        description="این تغییر در حافظه مشترک برنامه (AppContext) اعمال می‌شود و در پنل مدیر و والدین نیز قابل مشاهده است."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePhone}>
              ذخیره تغییر
            </Button>
          </>
        }
      >
        <form onSubmit={handleSavePhone} className="space-y-3">
          <Input
            label="شماره تلفن همراه"
            required
            leftIcon={Phone}
            value={phoneInput}
            error={phoneError}
            onChange={(e) => {
              setPhoneInput(e.target.value);
              if (phoneError) setPhoneError(undefined);
            }}
            placeholder="09191111001"
          />
        </form>
      </Modal>
    </div>
  );
}

function InfoField({
  icon: Icon,
  label,
  value,
  ltr = false,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-btn border border-border bg-background p-3.5">
      <dt className="flex items-center gap-1.5 text-[11px] text-text-muted">
        <Icon size={13} className="text-primary" aria-hidden="true" />
        {label}
      </dt>
      <dd
        dir={ltr ? 'ltr' : undefined}
        className={`mt-1 font-bold text-text ${ltr ? 'text-end font-mono text-[12px]' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
