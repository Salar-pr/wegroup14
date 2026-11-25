/**
 * Admin feature — class management (مدیریت کلاس‌ها).
 * Create / edit classes, assign homeroom teachers, view rosters,
 * capacity display. Deletion is blocked while students are enrolled.
 */
import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, School, Trash2, Users } from 'lucide-react';
import {
  Avatar,
  Button,
  PageHeader,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { useData, useToast } from '../../../hooks';
import { getStudentsByClass, getTeacherById } from '../../../data';
import { toPersianDigits } from '../../../utils';
import type { SchoolClass } from '../../../types';
import { ClassForm, type ClassFormValues } from '../components/ClassForm';
import { ClassStudentsModal } from '../components/ClassStudentsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { newId } from '../lib/labels';

export default function ClassesPage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [deleting, setDeleting] = useState<SchoolClass | null>(null);
  const [roster, setRoster] = useState<SchoolClass | null>(null);

  const totalCapacity = useMemo(
    () => db.classes.reduce((acc, c) => acc + c.capacity, 0),
    [db.classes],
  );
  const totalEnrolled = useMemo(
    () => db.classes.reduce((acc, c) => acc + c.enrolled, 0),
    [db.classes],
  );

  const handleSubmit = (values: ClassFormValues) => {
    if (editing) {
      updateEntity('classes', (items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                name: values.name,
                gradeLevel: values.gradeLevel,
                field: values.field,
                homeroomTeacherId: values.homeroomTeacherId,
                capacity: values.capacity,
                enrolled: values.enrolled,
                room: values.room,
              }
            : item,
        ),
      );
      showToast('success', `کلاس «${values.name}» با موفقیت به‌روزرسانی شد.`, 'کلاس ویرایش شد');
    } else {
      const schoolClass: SchoolClass = {
        id: newId('c'),
        name: values.name,
        gradeLevel: values.gradeLevel,
        field: values.field,
        homeroomTeacherId: values.homeroomTeacherId,
        capacity: values.capacity,
        enrolled: values.enrolled,
        room: values.room,
      };
      updateEntity('classes', (items) => [schoolClass, ...items]);
      showToast('success', `کلاس «${values.name}» با موفقیت ایجاد شد.`, 'کلاس جدید');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    const enrolledStudents = getStudentsByClass(db, deleting.id);
    if (enrolledStudents.length > 0) {
      showToast(
        'error',
        `کلاس «${deleting.name}» ${toPersianDigits(enrolledStudents.length)} دانش‌آموز ثبت‌شده دارد و قابل حذف نیست.`,
        'حذف ممکن نیست',
      );
      setDeleting(null);
      return;
    }
    updateEntity('classes', (items) => items.filter((item) => item.id !== deleting.id));
    showToast('success', `کلاس «${deleting.name}» حذف شد.`, 'حذف کلاس');
    setDeleting(null);
  };

  const columns: TableColumn<SchoolClass>[] = [
    {
      key: 'name',
      header: 'کلاس',
      sortValue: (c) => c.name,
      render: (c) => (
        <span>
          <span className="block font-bold">{c.name}</span>
          <span className="block text-[11px] text-text-muted">
            {c.gradeLevel} {c.field} • {c.room || 'بدون اتاق مشخص'}
          </span>
        </span>
      ),
    },
    {
      key: 'teacher',
      header: 'معلم کلاس',
      sortValue: (c) => getTeacherById(db, c.homeroomTeacherId)?.name ?? '',
      render: (c) => {
        const teacher = getTeacherById(db, c.homeroomTeacherId);
        return teacher ? (
          <span className="flex items-center gap-2">
            <Avatar name={teacher.name} color={teacher.avatarColor} size="xs" />
            {teacher.name}
          </span>
        ) : (
          '—'
        );
      },
    },
    {
      key: 'capacity',
      header: 'ظرفیت',
      align: 'center',
      sortValue: (c) => c.enrolled / c.capacity,
      render: (c) => {
        const percent = c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 0;
        return (
          <span className="inline-flex min-w-[110px] flex-col items-center gap-1">
            <span className="text-[12px] font-bold">
              {toPersianDigits(c.enrolled)} از {toPersianDigits(c.capacity)} ({toPersianDigits(percent)}٪)
            </span>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <span
                className={`block h-full rounded-full ${
                  percent >= 90 ? 'bg-danger' : percent >= 70 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </span>
          </span>
        );
      },
    },
    {
      key: 'roster',
      header: 'دانش‌آموزان ثبت‌شده',
      align: 'center',
      sortValue: (c) => getStudentsByClass(db, c.id).length,
      render: (c) => toPersianDigits(getStudentsByClass(db, c.id).length),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'end',
      render: (c) => (
        <span className="inline-flex items-center gap-1">
          <Button variant="ghost" size="sm" leftIcon={Eye} onClick={() => setRoster(c)} aria-label={`مشاهده دانش‌آموزان ${c.name}`}>
            دانش‌آموزان
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Pencil}
            onClick={() => {
              setEditing(c);
              setFormOpen(true);
            }}
            aria-label={`ویرایش ${c.name}`}
          >
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setDeleting(c)}
            aria-label={`حذف ${c.name}`}
          >
            حذف
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="مدیریت کلاس‌ها"
        description="ایجاد کلاس، تعیین معلم کلاس، مشاهده دانش‌آموزان و ظرفیت"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'کلاس‌ها' }]}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            ایجاد کلاس
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="تعداد کلاس‌ها"
          value={toPersianDigits(db.classes.length)}
          icon={School}
          tone="primary"
        />
        <StatCard
          title="ظرفیت کل"
          value={toPersianDigits(totalCapacity)}
          icon={Users}
          tone="info"
          hint="نفر"
        />
        <StatCard
          title="دانش‌آموزان ثبت‌نام‌شده"
          value={toPersianDigits(totalEnrolled)}
          icon={Users}
          tone="success"
          hint={`ظرفیت خالی: ${toPersianDigits(totalCapacity - totalEnrolled)} نفر`}
        />
      </div>

      <div className="mt-6">
        <Table<SchoolClass>
          data={db.classes}
          rowKey={(c) => c.id}
          caption="لیست کلاس‌ها"
          columns={columns}
          pageSize={8}
          emptyTitle="کلاسی وجود ندارد"
          emptyDescription="برای شروع، اولین کلاس مدرسه را ایجاد کنید."
          emptyIcon={School}
        />
      </div>

      <ClassForm
        open={formOpen}
        initial={editing}
        teachers={db.teachers}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="حذف کلاس"
        message={
          deleting
            ? `آیا از حذف کلاس «${deleting.name}» مطمئن هستید؟ اگر دانش‌آموزی در این کلاس ثبت شده باشد، حذف انجام نمی‌شود.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <ClassStudentsModal
        schoolClass={roster}
        students={roster ? getStudentsByClass(db, roster.id) : []}
        onClose={() => setRoster(null)}
      />
    </>
  );
}
