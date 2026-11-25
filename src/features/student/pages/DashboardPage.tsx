import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Megaphone,
  NotebookPen,
  Send,
  TrendingUp,
} from 'lucide-react';
import { Badge, Button, EmptyState, Modal, PageHeader, StatCard } from '../../../components';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks';
import { formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import { SubjectPerformanceBarChart } from '../components/AcademicCharts';
import { HomeworkSubmissionModal } from '../components/HomeworkSubmissionModal';
import { SectionCard } from '../components/SectionCard';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { useStudentPortal } from '../hooks/useStudentPortal';
import {
  GRADE_TYPE_LABELS,
  HOMEWORK_STATUS_META,
  PRIORITY_META,
  formatPersianDecimal,
  formatPersianPercent,
  getUpcomingClasses,
  gradeBadgeVariant,
  type EnrichedAnnouncement,
  type EnrichedHomework,
} from '../lib/studentAnalytics';

export default function DashboardPage() {
  const { db, student, dossier, academic, attendance, homeworkList, announcements, session } =
    useStudentPortal();
  const { showToast } = useToast();

  const [selectedHomework, setSelectedHomework] = useState<EnrichedHomework | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<EnrichedAnnouncement | null>(
    null,
  );

  if (!student || !dossier || !academic || !attendance) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="پرونده دانش‌آموزی یافت نشد"
        description="اطلاعات حساب کاربری شما در پایگاه داده موقت یافت نشد."
      />
    );
  }

  const upcoming = getUpcomingClasses(db, student.classId, 4);
  const pendingHomework = homeworkList.filter(
    (item) => item.status !== 'submitted' && item.status !== 'graded',
  );
  const recentGrades = academic.grades.slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 4);
  const unreadAnnouncementsCount = announcements.filter((a) => !a.isRead).length;

  const gpaDiffFromClass =
    Math.round((academic.weightedAverage - dossier.classAverageGpa) * 100) / 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`خوش آمدید، ${student.name}`}
        description="نمای یکپارچه وضعیت تحصیلی، برنامه کلاس‌های پیش‌رو، تکالیف در انتظار و اطلاعیه‌های مدرسه"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'پیشخوان دانش‌آموز' }]}
        actions={
          <>
            <Link to={`${ROUTES.STUDENT}/homework`}>
              <Button variant="outline" size="sm" leftIcon={NotebookPen}>
                تکالیف من ({toPersianDigits(pendingHomework.length)})
              </Button>
            </Link>
            <Link to={`${ROUTES.STUDENT}/report-card`}>
              <Button variant="primary" size="sm" leftIcon={FileText}>
                مشاهده کارنامه
              </Button>
            </Link>
          </>
        }
      />

      {/* Student Profile Summary Card */}
      <StudentProfileCard
        dossier={dossier}
        weightedGpa={academic.weightedAverage}
        attendanceRate={attendance.attendanceRate}
        compact
      />

      {/* 4 Key KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="معدل وزنی نیم‌سال"
          value={`${formatPersianDecimal(academic.weightedAverage)} از ۲۰`}
          icon={Award}
          tone="primary"
          trend={{
            value: `${gpaDiffFromClass >= 0 ? '+' : ''}${formatPersianDecimal(gpaDiffFromClass)}`,
            direction: gpaDiffFromClass > 0 ? 'up' : gpaDiffFromClass < 0 ? 'down' : 'flat',
            positive: gpaDiffFromClass >= 0,
          }}
          hint={`نسبت به میانگین کلاس (${formatPersianDecimal(dossier.classAverageGpa)})`}
        />

        <StatCard
          title="درصد حضور در کلاس‌ها"
          value={formatPersianPercent(attendance.attendanceRate)}
          icon={ClipboardCheck}
          tone={attendance.attendanceRate >= 90 ? 'success' : 'warning'}
          hint={`${toPersianDigits(attendance.present)} حاضر • ${toPersianDigits(attendance.late)} تأخیر • ${toPersianDigits(attendance.absent)} غیبت`}
        />

        <StatCard
          title="تکالیف در انتظار تحویل"
          value={toPersianDigits(pendingHomework.length)}
          icon={NotebookPen}
          tone={pendingHomework.length > 0 ? 'warning' : 'success'}
          hint={`از مجموع ${toPersianDigits(homeworkList.length)} تکلیف کلاس ${dossier.schoolClass?.name ?? ''}`}
        />

        <StatCard
          title="پایه و کلاس فعلی"
          value={dossier.schoolClass?.name ?? `${student.gradeLevel} ${student.field}`}
          icon={BookOpen}
          tone="info"
          hint={`رتبه ${toPersianDigits(dossier.classRank)} از ${toPersianDigits(dossier.classmatesCount)} دانش‌آموز`}
        />
      </div>

      {/* Main 2-column grid: Upcoming Classes + Pending Homework */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Upcoming Classes */}
        <SectionCard
          title="کلاس‌های پیش‌رو"
          subtitle={`برنامه ${upcoming.referenceDayLabel} • ${dossier.schoolClass?.name ?? ''}`}
          icon={CalendarClock}
          className="lg:col-span-6"
          action={
            <Link
              to={`${ROUTES.STUDENT}/schedule`}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-dark"
            >
              برنامه کامل هفتگی
              <ChevronLeft size={14} aria-hidden="true" />
            </Link>
          }
        >
          {upcoming.items.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="کلاسی در برنامه ثبت نشده است"
              description="برنامه هفتگی کلاس شما خالی است."
            />
          ) : (
            <div className="space-y-3">
              {upcoming.items.map((sessionItem) => (
                <div
                  key={sessionItem.entry.id}
                  className="flex items-center justify-between gap-3 rounded-btn border border-border bg-background p-3.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-btn bg-blue-50 text-primary">
                      <span className="text-[10px] font-medium leading-none">زنگ</span>
                      <span className="mt-0.5 text-sm font-extrabold leading-none">
                        {toPersianDigits(sessionItem.entry.period)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-text">
                        {sessionItem.subjectName}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-text-muted">
                        <span>دبیر: {sessionItem.teacherName}</span>
                        <span className="inline-flex items-center gap-1 text-primary">
                          <MapPin size={11} aria-hidden="true" />
                          {sessionItem.entry.room}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-text ring-1 ring-inset ring-border">
                      <Clock size={12} className="text-primary" aria-hidden="true" />
                      {toPersianDigits(sessionItem.entry.start)} تا{' '}
                      {toPersianDigits(sessionItem.entry.end)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Pending Homework */}
        <SectionCard
          title="تکالیف در انتظار انجام"
          subtitle="اولویت‌بندی‌شده بر اساس نزدیک‌ترین مهلت تحویل"
          icon={NotebookPen}
          className="lg:col-span-6"
          action={
            <Link
              to={`${ROUTES.STUDENT}/homework`}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-dark"
            >
              همه تکالیف
              <ChevronLeft size={14} aria-hidden="true" />
            </Link>
          }
        >
          {pendingHomework.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="همه تکالیف را تحویل داده‌اید!"
              description="هیچ تکلیف معوق یا در انتظاری برای شما باقی نمانده است."
            />
          ) : (
            <div className="space-y-3">
              {pendingHomework.slice(0, 4).map((hw) => {
                const meta = HOMEWORK_STATUS_META[hw.status];
                return (
                  <div
                    key={hw.homework.id}
                    className="flex flex-col justify-between gap-3 rounded-btn border border-border bg-background p-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={meta.badge}>{meta.label}</Badge>
                        <span className="text-[11px] font-semibold text-primary">
                          {hw.subjectName}
                        </span>
                      </div>
                      <h3 className="mt-1.5 truncate text-[13px] font-bold text-text">
                        {hw.homework.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        مهلت تحویل: {formatJalali(hw.homework.dueDate)} • بارم:{' '}
                        {toPersianDigits(hw.homework.maxScore)} نمره
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Send}
                      onClick={() => setSelectedHomework(hw)}
                      className="shrink-0"
                    >
                      ارسال تکلیف
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Academic Performance Chart + Recent Grades */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SectionCard
          title="نمودار عملکرد تحصیلی در مقایسه با کلاس"
          subtitle="مقایسه میانگین نمرات شما با میانگین هم‌کلاسی‌ها در هر درس (از ۲۰)"
          icon={TrendingUp}
          className="lg:col-span-7"
          action={
            <Link
              to={`${ROUTES.STUDENT}/grades`}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-dark"
            >
              تحلیل کامل نمرات
              <ChevronLeft size={14} aria-hidden="true" />
            </Link>
          }
        >
          <SubjectPerformanceBarChart subjects={academic.subjectSummaries} height={275} />
        </SectionCard>

        <SectionCard
          title="آخرین نمرات ثبت‌شده"
          subtitle="به‌روزرسانی آنی با سامانه مدیریت و دبیران"
          icon={ClipboardList}
          className="lg:col-span-5"
          action={
            <Link
              to={`${ROUTES.STUDENT}/grades`}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-dark"
            >
              همه نمرات
              <ChevronLeft size={14} aria-hidden="true" />
            </Link>
          }
        >
          {recentGrades.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="نمره‌ای ثبت نشده است"
              description="پس از ثبت نمرات توسط دبیران یا مدیر، در این قسمت نمایش داده می‌شود."
            />
          ) : (
            <div className="divide-y divide-border">
              {recentGrades.map((item) => (
                <div
                  key={item.grade.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-bold text-text">
                        {item.subjectName}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        ({GRADE_TYPE_LABELS[item.grade.type]})
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-text-muted">
                      {item.grade.title} • {formatJalali(item.grade.date)}
                    </p>
                  </div>

                  <Badge variant={gradeBadgeVariant(item.score20)} dot={false}>
                    {formatPersianDecimal(item.score20)} از ۲۰
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Recent School Announcements */}
      <SectionCard
        title="اطلاعیه‌های اخیر مدرسه"
        subtitle={
          unreadAnnouncementsCount > 0
            ? `${toPersianDigits(unreadAnnouncementsCount)} اطلاعیه خوانده‌نشده برای دانش‌آموزان`
            : 'همه اطلاعیه‌های اخیر را مطالعه کرده‌اید'
        }
        icon={Megaphone}
        action={
          <Link
            to={`${ROUTES.STUDENT}/announcements`}
            className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-dark"
          >
            همه اطلاعیه‌ها
            <ChevronLeft size={14} aria-hidden="true" />
          </Link>
        }
      >
        {recentAnnouncements.length === 0 ? (
          <EmptyState icon={Megaphone} title="اطلاعیه‌ای منتشر نشده است" />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recentAnnouncements.map((item) => {
              const priority = PRIORITY_META[item.announcement.priority];
              return (
                <button
                  key={item.announcement.id}
                  type="button"
                  onClick={() => {
                    session.markAnnouncementRead(item.announcement.id);
                    setSelectedAnnouncement(item);
                  }}
                  className="flex flex-col justify-between rounded-btn border border-border bg-background p-4 text-start transition-all duration-150 hover:border-primary hover:bg-blue-50/30"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={priority.badge}>{priority.label}</Badge>
                        <Badge variant="info" dot={false}>
                          {item.categoryLabel}
                        </Badge>
                      </div>
                      {!item.isRead && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          جدید
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2.5 text-[14px] font-bold text-text">
                      {item.announcement.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-6 text-text-muted">
                      {item.announcement.body}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-text-muted">
                    <span>{item.announcement.authorName}</span>
                    <span>
                      {formatJalali(item.announcement.createdAt)} (
                      {formatRelativeTime(item.announcement.createdAt)})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Homework Quick Submission Modal */}
      <HomeworkSubmissionModal
        item={selectedHomework}
        open={selectedHomework !== null}
        onClose={() => setSelectedHomework(null)}
        onSubmit={(payload) => {
          session.submitHomework(payload);
          showToast('success', 'پاسخ تکلیف شما با موفقیت در سامانه ثبت شد.', 'ارسال موفق تکلیف');
        }}
        onWithdraw={(homeworkId) => {
          session.withdrawHomework(homeworkId);
          showToast('info', 'ارسال تکلیف لغو شد و به حالت در انتظار بازگشت.');
        }}
      />

      {/* Announcement Quick View Modal */}
      <Modal
        open={selectedAnnouncement !== null}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.announcement.title}
        description={
          selectedAnnouncement
            ? `${selectedAnnouncement.announcement.authorName} • ${formatJalali(selectedAnnouncement.announcement.createdAt)}`
            : undefined
        }
        footer={
          <Button variant="primary" size="sm" onClick={() => setSelectedAnnouncement(null)}>
            متوجه شدم
          </Button>
        }
      >
        {selectedAnnouncement && (
          <div className="space-y-3 text-[13px]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={PRIORITY_META[selectedAnnouncement.announcement.priority].badge}>
                {PRIORITY_META[selectedAnnouncement.announcement.priority].label}
              </Badge>
              <Badge variant="info" dot={false}>
                {selectedAnnouncement.categoryLabel}
              </Badge>
              <Badge variant="success" dot={false}>
                خوانده‌شده
              </Badge>
            </div>
            <p className="leading-7 text-text">{selectedAnnouncement.announcement.body}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
