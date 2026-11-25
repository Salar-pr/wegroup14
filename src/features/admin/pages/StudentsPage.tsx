/**
 * Admin feature — student management (مدیریت دانش‌آموزان).
 * Listing with search + filters, add / edit / delete, details modal,
 * enrollment status. All mutations go through the shared in-memory
 * database (`updateEntity`) and reset on browser refresh.
 */
import { useMemo, useState } from 'react';
import { Eye, GraduationCap, Pencil, Plus, Search, Trash2, UserCheck, UserX } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Input,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { useData, useToast } from '../../../hooks';
import { getClassById } from '../../../data';
import { toPersianDigits } from '../../../utils';
import type { Student } from '../../../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StudentDetailsModal } from '../components/StudentDetailsModal';
import { StudentForm, type StudentFormValues } from '../components/StudentForm';
import { STUDENT_STATUS_LABELS, newId, pickAvatarColor } from '../lib/labels';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'active', label: 'فعال' },
  { value: 'suspended', label: 'معلق' },
  { value: 'graduated', label: 'فارغ‌التحصیل' },
];

export default function StudentsPage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [details, setDetails] = useState<Student | null>(null);

  const rows = useMemo(() => {
    const q = query.trim();
    return db.students.filter((student) => {
      if (classFilter !== 'all' && student.classId !== classFilter) return false;
      if (statusFilter !== 'all' && student.status !== statusFilter) return false;
      if (q === '') return true;
      return (
        student.name.includes(q) ||
        student.studentCode.includes(q) ||
        student.guardianName.includes(q) ||
        student.phone.includes(q)
      );
    });
  }, [db.students, query, classFilter, statusFilter]);

  const activeCount = db.students.filter((s) => s.status === 'active').length;
  const suspendedCount = db.students.filter((s) => s.status === 'suspended').length;

  const handleSubmit = (values: StudentFormValues) => {
    if (editing) {
      const oldClassId = editing.classId;
      updateEntity('students', (items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                name: values.name,
                studentCode: values.studentCode,
                classId: values.classId,
                gradeLevel: values.gradeLevel,
                field: values.field,
                phone: values.phone,
                guardianName: values.guardianName,
                guardianPhone: values.guardianPhone,
                status: values.status,
                gpa: values.gpa,
                enrolledAt: values.enrolledAt,
              }
            : item,
        ),
      );
      // Keep class enrollment counters in sync when the student moves class.
      if (oldClassId !== values.classId) {
        updateEntity('classes', (items) =>
          items.map((item) => {
            if (item.id === oldClassId) return { ...item, enrolled: Math.max(0, item.enrolled - 1) };
            if (item.id === values.classId) return { ...item, enrolled: item.enrolled + 1 };
            return item;
          }),
        );
      }
      showToast('success', `اطلاعات «${values.name}» با موفقیت به‌روزرسانی شد.`, 'دانش‌آموز ویرایش شد');
    } else {
      const student: Student = {
        id: newId('s'),
        studentCode: values.studentCode,
        name: values.name,
        classId: values.classId,
        gradeLevel: values.gradeLevel,
        field: values.field,
        phone: values.phone,
        guardianName: values.guardianName,
        guardianPhone: values.guardianPhone,
        status: values.status,
        gpa: values.gpa,
        enrolledAt: values.enrolledAt,
        avatarColor: pickAvatarColor(values.name),
      };
      updateEntity('students', (items) => [student, ...items]);
      updateEntity('classes', (items) =>
        items.map((item) =>
          item.id === values.classId ? { ...item, enrolled: item.enrolled + 1 } : item,
        ),
      );
      showToast('success', `«${values.name}» با موفقیت ثبت شد.`, 'دانش‌آموز جدید');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    const classId = deleting.classId;
    updateEntity('students', (items) => items.filter((item) => item.id !== deleting.id));
    updateEntity('classes', (items) =>
      items.map((item) =>
        item.id === classId ? { ...item, enrolled: Math.max(0, item.enrolled - 1) } : item,
      ),
    );
    showToast('success', `«${deleting.name}» حذف شد.`, 'حذف دانش‌آموز');
    setDeleting(null);
  };

  const columns: TableColumn<Student>[] = [
    {
      key: 'name',
      header: 'دانش‌آموز',
      sortValue: (s) => s.name,
      render: (s) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={s.name} color={s.avatarColor} size="sm" />
          <span>
            <span className="block font-bold">{s.name}</span>
            <span className="block text-[11px] text-text-muted">
              کد {toPersianDigits(s.studentCode)}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'class',
      header: 'کلاس',
      sortValue: (s) => getClassById(db, s.classId)?.name ?? '',
      render: (s) => getClassById(db, s.classId)?.name ?? '—',
    },
    {
      key: 'grade',
      header: 'پایه / رشته',
      render: (s) => `${s.gradeLevel} ${s.field}`,
    },
    {
      key: 'gpa',
      header: 'معدل',
      align: 'center',
      sortValue: (s) => s.gpa,
      render: (s) => toPersianDigits(s.gpa),
    },
    {
      key: 'guardian',
      header: 'ولی',
      render: (s) => (
        <span>
          <span className="block">{s.guardianName}</span>
          <span className="block text-[11px] text-text-muted">{toPersianDigits(s.guardianPhone)}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت ثبت‌نام',
      render: (s) => (
        <Badge variant={STUDENT_STATUS_LABELS[s.status].variant}>
          {STUDENT_STATUS_LABELS[s.status].label}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'end',
      render: (s) => (
        <span
          className="inline-flex items-center gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Button variant="ghost" size="sm" leftIcon={Eye} onClick={() => setDetails(s)} aria-label={`مشاهده پرونده ${s.name}`}>
            جزئیات
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Pencil}
            onClick={() => {
              setEditing(s);
              setFormOpen(true);
            }}
            aria-label={`ویرایش ${s.name}`}
          >
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setDeleting(s)}
            aria-label={`حذف ${s.name}`}
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
        title="مدیریت دانش‌آموزان"
        description="مشاهده، جست‌وجو، افزودن و ویرایش دانش‌آموزان مدرسه"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'دانش‌آموزان' }]}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            افزودن دانش‌آموز
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="کل دانش‌آموزان"
          value={toPersianDigits(db.students.length)}
          icon={GraduationCap}
          tone="primary"
        />
        <StatCard
          title="دانش‌آموزان فعال"
          value={toPersianDigits(activeCount)}
          icon={UserCheck}
          tone="success"
        />
        <StatCard
          title="دانش‌آموزان معلق"
          value={toPersianDigits(suspendedCount)}
          icon={UserX}
          tone="danger"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_220px]">
        <Input
          placeholder="جست‌وجو با نام، کد دانش‌آموزی، ولی یا شماره تماس…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={Search}
          aria-label="جست‌وجوی دانش‌آموز"
        />
        <Select
          aria-label="فیلتر کلاس"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          options={[
            { value: 'all', label: 'همه کلاس‌ها' },
            ...db.classes.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          aria-label="فیلتر وضعیت"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_FILTER_OPTIONS}
        />
      </div>

      <div className="mt-4">
        <Table<Student>
          data={rows}
          rowKey={(s) => s.id}
          caption="لیست دانش‌آموزان"
          columns={columns}
          pageSize={8}
          emptyTitle="دانش‌آموزی یافت نشد"
          emptyDescription="عبارت جست‌وجو یا فیلترها را تغییر دهید، یا دانش‌آموز جدیدی اضافه کنید."
          emptyIcon={GraduationCap}
          onRowClick={(s) => setDetails(s)}
        />
      </div>

      <StudentForm
        open={formOpen}
        initial={editing}
        classes={db.classes}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="حذف دانش‌آموز"
        message={
          deleting
            ? `آیا از حذف «${deleting.name}» (کد ${deleting.studentCode}) مطمئن هستید؟ این عمل قابل بازگشت نیست.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <StudentDetailsModal student={details} db={db} onClose={() => setDetails(null)} />
    </>
  );
}
