/**
 * Admin feature — school dashboard (پیشخوان).
 *
 * Live overview computed from the shared in-memory database:
 * key counts, attendance + academic charts, absent students,
 * pending assignments, recent activities and announcements.
 */
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  NotebookPen,
  Presentation,
  School,
  UserX,
  Wallet,
} from 'lucide-react';
import { Avatar, Badge, Button, PageHeader, StatCard } from '../../../components';
import { useAuth, useData } from '../../../hooks';
import { getClassById, getStudentById } from '../../../data';
import { formatJalali, formatJalaliShort, toPersianDigits } from '../../../utils';
import { ChartCard } from '../components/ChartCard';
import {
  ANNOUNCEMENT_PRIORITY_LABELS,
  ATTENDANCE_STATUS_LABELS,
  todayISO,
} from '../lib/labels';
import {
  attendanceByDate,
  attendanceSummary,
  averageBySubject,
  homeworkStatus,
  recentActivities,
} from '../lib/stats';

const ACTIVITY_ICONS = {
  announcement: Megaphone,
  grade: ClipboardCheck,
  payment: NotebookPen,
  attendance: UserX,
  homework: CalendarClock,
} as const;

export default function DashboardPage() {
  const { db } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const today = todayISO();

  const summary = useMemo(() => attendanceSummary(db), [db]);
  const attendanceChart = useMemo(
    () =>
      attendanceByDate(db).map((point) => ({
        ...point,
        label: formatJalaliShort(point.date),
      })),
    [db],
  );
  const subjectChart = useMemo(() => averageBySubject(db), [db]);
  const activities = useMemo(() => recentActivities(db, 7), [db]);

  const absentStudents = useMemo(
    () =>
      db.attendance
        .filter((record) => record.status === 'absent')
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [db],
  );

  const pendingHomework = useMemo(
    () =>
      db.homework
        .filter((item) => homeworkStatus(item, today) !== 'overdue')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [db, today],
  );

  const recentAnnouncements = useMemo(
    () =>
      [...db.announcements]
        .sort(
          (a, b) =>
            Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt),
        )
        .slice(0, 4),
    [db],
  );

  const activeStudents = db.students.filter((s) => s.status === 'active').length;
  const activeTeachers = db.teachers.filter((t) => t.status === 'active').length;

  return (
    <>
      <PageHeader
        title={`سلام، ${currentUser?.name ?? 'مدیر'} 👋`}
        description={`نمای کلی مدرسه در ${formatJalali(today)} — همه آمار به‌صورت زنده از داده‌های سامانه محاسبه می‌شود.`}
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'پیشخوان' }]}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={Megaphone}
              onClick={() => navigate('/admin/announcements')}
            >
              اطلاعیه جدید
            </Button>
            <Button leftIcon={GraduationCap} onClick={() => navigate('/admin/students')}>
              افزودن دانش‌آموز
            </Button>
          </>
        }
      />

      {/* ---- Key statistics ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="دانش‌آموزان فعال"
          value={toPersianDigits(activeStudents)}
          icon={GraduationCap}
          tone="primary"
          hint={`از مجموع ${toPersianDigits(db.students.length)} دانش‌آموز`}
        />
        <StatCard
          title="معلمان فعال"
          value={toPersianDigits(activeTeachers)}
          icon={Presentation}
          tone="success"
          hint={`از مجموع ${toPersianDigits(db.teachers.length)} معلم`}
        />
        <StatCard
          title="کلاس‌های فعال"
          value={toPersianDigits(db.classes.length)}
          icon={School}
          tone="info"
          hint={`${toPersianDigits(db.subjects.length)} درس در برنامه`}
        />
        <StatCard
          title="نرخ حضور"
          value={`${toPersianDigits(summary.rate)}٪`}
          icon={ClipboardCheck}
          tone={summary.rate >= 85 ? 'success' : 'warning'}
          hint={`${toPersianDigits(summary.present)} حاضر از ${toPersianDigits(summary.total)} رکورد`}
        />
      </div>

      {/* ---- Charts ---- */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="روند حضور و غیاب"
          description="تعداد حاضر، غایب و دیرکرد به تفکیک روز"
          action={
            <Link to="/admin/attendance" className="text-[12px] font-bold text-primary hover:underline">
              مشاهده حضور و غیاب
            </Link>
          }
        >
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChart} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(value) => [toPersianDigits(Number(value)), '']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" name="حاضر" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="دیرکرد" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="غایب" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="عملکرد تحصیلی دروس"
          description="میانگین نمره هر درس از ۲۰"
          action={
            <Link to="/admin/grades" className="text-[12px] font-bold text-primary hover:underline">
              مشاهده نمرات
            </Link>
          }
        >
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChart} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  domain={[0, 20]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(value: number) => toPersianDigits(value)}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(value) => [`${toPersianDigits(Number(value))} از ۲۰`, 'میانگین']}
                />
                <Bar dataKey="average" name="میانگین نمره" radius={[4, 4, 0, 0]}>
                  {subjectChart.map((entry) => (
                    <Cell
                      key={entry.subjectId}
                      fill={entry.average >= 17 ? '#2563EB' : entry.average >= 12 ? '#F59E0B' : '#DC2626'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ---- Lists ---- */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="غایبان اخیر"
          description="آخرین غیبت‌های ثبت‌شده"
          action={
            <Link to="/admin/attendance" className="text-[12px] font-bold text-primary hover:underline">
              همه
            </Link>
          }
        >
          {absentStudents.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-text-muted">غیبتی ثبت نشده است.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {absentStudents.map((record) => {
                const student = getStudentById(db, record.studentId);
                return (
                  <li key={record.id} className="flex items-center gap-3">
                    {student && <Avatar name={student.name} color={student.avatarColor} size="sm" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-text">
                        {student?.name ?? 'دانش‌آموز'}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">
                        {getClassById(db, record.classId)?.name ?? ''} • {formatJalali(record.date)}
                        {record.note ? ` • ${record.note}` : ''}
                      </p>
                    </div>
                    <Badge variant={ATTENDANCE_STATUS_LABELS.absent.variant}>غایب</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>

        <ChartCard
          title="تکالیف در انتظار"
          description="تکالیف فعال با نزدیک‌ترین مهلت"
          action={
            <Link to="/admin/homework" className="text-[12px] font-bold text-primary hover:underline">
              همه
            </Link>
          }
        >
          {pendingHomework.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-text-muted">تکلیف فعالی وجود ندارد.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pendingHomework.map((item) => {
                const status = homeworkStatus(item, today);
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-blue-50 text-primary">
                      <NotebookPen size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-text">{item.title}</p>
                      <p className="truncate text-[11px] text-text-muted">
                        {getClassById(db, item.classId)?.name ?? ''} • مهلت {formatJalali(item.dueDate)}
                      </p>
                    </div>
                    <Badge variant={status === 'due-soon' ? 'warning' : 'info'}>
                      {status === 'due-soon' ? 'مهلت نزدیک' : 'فعال'}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>

        <ChartCard
          title="فعالیت‌های اخیر"
          description="آخرین رویدادهای سامانه"
        >
          <ul className="flex flex-col gap-3">
            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.kind];
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-slate-100 text-text-muted">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-text">{activity.title}</p>
                    <p className="truncate text-[11px] text-text-muted">{activity.detail}</p>
                    <p className="mt-0.5 text-[10px] text-text-muted">{formatJalali(activity.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </ChartCard>
      </div>

      {/* ---- Announcements + quick links ---- */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="اطلاعیه‌های اخیر"
          description="آخرین اطلاعیه‌های منتشرشده"
          className="xl:col-span-2"
          action={
            <Link to="/admin/announcements" className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
              همه اطلاعیه‌ها <ArrowLeft size={13} aria-hidden="true" />
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recentAnnouncements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-card border border-border p-4 transition-shadow hover:shadow-cardHover"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={ANNOUNCEMENT_PRIORITY_LABELS[announcement.priority].variant}>
                    {ANNOUNCEMENT_PRIORITY_LABELS[announcement.priority].label}
                  </Badge>
                  {announcement.pinned && <Badge variant="primary">سنجاق‌شده</Badge>}
                  <span className="text-[10px] text-text-muted">{formatJalali(announcement.createdAt)}</span>
                </div>
                <h3 className="mt-2 text-[13px] font-extrabold leading-6 text-text">{announcement.title}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-6 text-text-muted">{announcement.body}</p>
              </article>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="دسترسی سریع" description="بخش‌های پرکاربرد مدیریت">
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/admin/students', label: 'دانش‌آموزان', icon: GraduationCap },
              { to: '/admin/teachers', label: 'معلمان', icon: Presentation },
              { to: '/admin/classes', label: 'کلاس‌ها', icon: School },
              { to: '/admin/attendance', label: 'حضور و غیاب', icon: ClipboardCheck },
              { to: '/admin/grades', label: 'نمرات', icon: NotebookPen },
              { to: '/admin/payments', label: 'شهریه', icon: Wallet },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 rounded-btn border border-border p-3 text-[12px] font-bold text-text transition-colors hover:border-primary hover:text-primary"
              >
                <item.icon size={16} aria-hidden="true" className="shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}
