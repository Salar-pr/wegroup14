/**
 * Admin feature — attendance taking (حضور و غیاب).
 * Pick a class, date and subject, mark each student present / absent /
 * late / excused, then save. Records are upserted into the shared
 * in-memory database and reset on browser refresh.
 */
import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, ClipboardCheck, Save, UserCheck, UserX } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { useData, useToast } from '../../../hooks';
import { getClassById, getStudentById, getSubjectById } from '../../../data';
import { formatJalali, toPersianDigits } from '../../../utils';
import type { Attendance, AttendanceStatus, Student } from '../../../types';
import { JalaliDateField } from '../components/JalaliDateField';
import { ATTENDANCE_STATUS_LABELS, newId, todayISO } from '../lib/labels';
import { attendanceSummary } from '../lib/stats';

const STATUS_ORDER: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

export default function AttendancePage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const [classId, setClassId] = useState(db.classes[0]?.id ?? '');
  const [subjectId, setSubjectId] = useState(db.subjects[0]?.id ?? '');
  const [date, setDate] = useState(todayISO());
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [dirty, setDirty] = useState(false);

  const students = useMemo<Student[]>(
    () => db.students.filter((s) => s.classId === classId),
    [db.students, classId],
  );

  // Initialise the marking sheet from saved records whenever the
  // class / date / subject selection changes.
  useEffect(() => {
    const next: Record<string, AttendanceStatus> = {};
    for (const student of db.students.filter((s) => s.classId === classId)) {
      const existing = db.attendance.find(
        (a) =>
          a.studentId === student.id &&
          a.classId === classId &&
          a.subjectId === subjectId &&
          a.date === date,
      );
      next[student.id] = existing?.status ?? 'present';
    }
    setStatuses(next);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subjectId, date]);

  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };
    for (const student of students) {
      const status = statuses[student.id];
      if (status) result[status] += 1;
    }
    return result;
  }, [students, statuses]);

  const overall = useMemo(() => attendanceSummary(db), [db]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setDirty(true);
  };

  const markAllPresent = () => {
    const next: Record<string, AttendanceStatus> = {};
    for (const student of students) next[student.id] = 'present';
    setStatuses(next);
    setDirty(true);
  };

  const handleSave = () => {
    const className = getClassById(db, classId)?.name ?? '';
    const subjectName = getSubjectById(db, subjectId)?.name ?? '';
    updateEntity('attendance', (items) => {
      const next = [...items];
      for (const student of students) {
        const status = statuses[student.id] ?? 'present';
        const index = next.findIndex(
          (a) =>
            a.studentId === student.id &&
            a.classId === classId &&
            a.subjectId === subjectId &&
            a.date === date,
        );
        if (index >= 0) {
          next[index] = { ...next[index], status };
        } else {
          next.push({
            id: newId('att'),
            studentId: student.id,
            classId,
            subjectId,
            date,
            status,
          });
        }
      }
      return next;
    });
    setDirty(false);
    showToast(
      'success',
      `حضور و غیاب ${className} (${subjectName}) برای ${formatJalali(date)} ذخیره شد.`,
      'ثبت حضور و غیاب',
    );
  };

  const recentRecords: Attendance[] = useMemo(
    () =>
      [...db.attendance]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10),
    [db.attendance],
  );

  const columns: TableColumn<Attendance>[] = [
    {
      key: 'student',
      header: 'دانش‌آموز',
      sortValue: (a) => getStudentById(db, a.studentId)?.name ?? '',
      render: (a) => {
        const student = getStudentById(db, a.studentId);
        return student ? (
          <span className="flex items-center gap-2.5">
            <Avatar name={student.name} color={student.avatarColor} size="sm" />
            <span className="font-bold">{student.name}</span>
          </span>
        ) : (
          '—'
        );
      },
    },
    {
      key: 'class',
      header: 'کلاس',
      render: (a) => getClassById(db, a.classId)?.name ?? '—',
    },
    {
      key: 'subject',
      header: 'درس',
      render: (a) => getSubjectById(db, a.subjectId)?.name ?? '—',
    },
    {
      key: 'date',
      header: 'تاریخ',
      sortValue: (a) => a.date,
      render: (a) => formatJalali(a.date),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (a) => (
        <Badge variant={ATTENDANCE_STATUS_LABELS[a.status].variant}>
          {ATTENDANCE_STATUS_LABELS[a.status].label}
        </Badge>
      ),
    },
    {
      key: 'note',
      header: 'یادداشت',
      render: (a) => (
        <span className="whitespace-normal text-[12px] text-text-muted">{a.note ?? '—'}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="حضور و غیاب"
        description="ثبت وضعیت حضور دانش‌آموزان برای یک کلاس، درس و تاریخ مشخص"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'حضور و غیاب' }]}
        actions={
          <Button leftIcon={Save} onClick={handleSave} disabled={!dirty || students.length === 0}>
            ذخیره حضور و غیاب
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="حاضر"
          value={toPersianDigits(counts.present)}
          icon={UserCheck}
          tone="success"
        />
        <StatCard
          title="غایب"
          value={toPersianDigits(counts.absent)}
          icon={UserX}
          tone="danger"
        />
        <StatCard
          title="دیرکرد"
          value={toPersianDigits(counts.late)}
          icon={CalendarCheck}
          tone="warning"
        />
        <StatCard
          title="موجه"
          value={toPersianDigits(counts.excused)}
          icon={Check}
          tone="info"
        />
        <StatCard
          title="نرخ حضور کل مدرسه"
          value={`${toPersianDigits(overall.rate)}٪`}
          icon={ClipboardCheck}
          tone="primary"
          hint={`از ${toPersianDigits(overall.total)} رکورد`}
        />
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <Select
            label="کلاس"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            options={db.classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="درس"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            options={db.subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <JalaliDateField
            label="تاریخ"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button variant="outline" leftIcon={UserCheck} onClick={markAllPresent} disabled={students.length === 0}>
              همه حاضر
            </Button>
          </div>
        </div>
        {dirty && (
          <p className="mt-3 rounded-btn bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            تغییرات ذخیره نشده است — برای اعمال، «ذخیره حضور و غیاب» را بزنید.
          </p>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {students.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-text-muted">
            دانش‌آموزی در این کلاس ثبت نشده است.
          </p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70">
                <th scope="col" className="px-4 py-3 text-start text-[11px] font-bold uppercase tracking-wide text-text-muted">
                  دانش‌آموز
                </th>
                <th scope="col" className="px-4 py-3 text-start text-[11px] font-bold uppercase tracking-wide text-text-muted">
                  وضعیت حضور
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const current = statuses[student.id] ?? 'present';
                return (
                  <tr key={student.id} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={student.name} color={student.avatarColor} size="sm" />
                        <span>
                          <span className="block font-bold">{student.name}</span>
                          <span className="block text-[11px] text-text-muted">
                            کد {toPersianDigits(student.studentCode)}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`وضعیت حضور ${student.name}`}>
                        {STATUS_ORDER.map((status) => {
                          const active = current === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setStatus(student.id, status)}
                              className={`rounded-btn border px-3 py-1.5 text-[12px] font-bold transition-colors ${
                                active
                                  ? status === 'present'
                                    ? 'border-success bg-green-50 text-green-800'
                                    : status === 'absent'
                                      ? 'border-danger bg-red-50 text-red-700'
                                      : status === 'late'
                                        ? 'border-warning bg-amber-50 text-amber-800'
                                        : 'border-info bg-sky-50 text-sky-800'
                                  : 'border-border text-text-muted hover:bg-slate-50'
                              }`}
                            >
                              {ATTENDANCE_STATUS_LABELS[status].label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mb-3 mt-8 text-[15px] font-extrabold text-text">آخرین رکوردهای ثبت‌شده</h2>
      <Table<Attendance>
        data={recentRecords}
        rowKey={(a) => a.id}
        caption="آخرین رکوردهای حضور و غیاب"
        columns={columns}
        pageSize={10}
        emptyTitle="رکوردی ثبت نشده است"
        emptyDescription="پس از ذخیره حضور و غیاب، رکوردها اینجا نمایش داده می‌شوند."
        emptyIcon={ClipboardCheck}
      />
    </>
  );
}
