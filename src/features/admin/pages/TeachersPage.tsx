/**
 * Admin feature — teacher management (مدیریت معلمان).
 * Listing with search + subject filter, add / edit / delete.
 */
import { useMemo, useState } from 'react';
import { Pencil, Plus, Presentation, Search, Trash2, UserCheck, UserX } from 'lucide-react';
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
import { getSubjectById } from '../../../data';
import { formatJalali, toPersianDigits } from '../../../utils';
import type { Teacher } from '../../../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TeacherForm, type TeacherFormValues } from '../components/TeacherForm';
import { TEACHER_STATUS_LABELS, newId, pickAvatarColor } from '../lib/labels';

export default function TeachersPage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState<Teacher | null>(null);

  const rows = useMemo(() => {
    const q = query.trim();
    return db.teachers.filter((teacher) => {
      if (subjectFilter !== 'all' && !teacher.subjectIds.includes(subjectFilter)) return false;
      if (q === '') return true;
      return (
        teacher.name.includes(q) ||
        teacher.employeeCode.includes(q) ||
        teacher.specialty.includes(q) ||
        teacher.phone.includes(q) ||
        teacher.email.includes(q)
      );
    });
  }, [db.teachers, query, subjectFilter]);

  const activeCount = db.teachers.filter((t) => t.status === 'active').length;
  const onLeaveCount = db.teachers.filter((t) => t.status === 'on_leave').length;

  const handleSubmit = (values: TeacherFormValues) => {
    if (editing) {
      updateEntity('teachers', (items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                name: values.name,
                employeeCode: values.employeeCode,
                phone: values.phone,
                email: values.email,
                specialty: values.specialty,
                subjectIds: values.subjectIds,
                status: values.status,
                joinedAt: values.joinedAt,
              }
            : item,
        ),
      );
      showToast('success', `اطلاعات «${values.name}» با موفقیت به‌روزرسانی شد.`, 'معلم ویرایش شد');
    } else {
      const teacher: Teacher = {
        id: newId('t'),
        employeeCode: values.employeeCode,
        name: values.name,
        phone: values.phone,
        email: values.email,
        specialty: values.specialty,
        subjectIds: values.subjectIds,
        classIds: [],
        status: values.status,
        joinedAt: values.joinedAt,
        avatarColor: pickAvatarColor(values.name),
      };
      updateEntity('teachers', (items) => [teacher, ...items]);
      showToast('success', `«${values.name}» با موفقیت ثبت شد.`, 'معلم جدید');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    updateEntity('teachers', (items) => items.filter((item) => item.id !== deleting.id));
    showToast('success', `«${deleting.name}» حذف شد.`, 'حذف معلم');
    setDeleting(null);
  };

  const columns: TableColumn<Teacher>[] = [
    {
      key: 'name',
      header: 'معلم',
      sortValue: (t) => t.name,
      render: (t) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={t.name} color={t.avatarColor} size="sm" />
          <span>
            <span className="block font-bold">{t.name}</span>
            <span className="block text-[11px] text-text-muted">
              کد پرسنلی {t.employeeCode}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'specialty',
      header: 'تخصص',
      sortValue: (t) => t.specialty,
      render: (t) => t.specialty,
    },
    {
      key: 'subjects',
      header: 'دروس تدریسی',
      render: (t) => (
        <span className="flex flex-wrap gap-1">
          {t.subjectIds.length === 0 && <span className="text-text-muted">—</span>}
          {t.subjectIds.map((subjectId) => (
            <Badge key={subjectId} variant="info" dot={false}>
              {getSubjectById(db, subjectId)?.name ?? subjectId}
            </Badge>
          ))}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'تماس',
      render: (t) => (
        <span>
          <span className="block">{toPersianDigits(t.phone)}</span>
          <span className="block text-[11px] text-text-muted" dir="ltr">
            {t.email}
          </span>
        </span>
      ),
    },
    {
      key: 'joined',
      header: 'شروع همکاری',
      sortValue: (t) => t.joinedAt,
      render: (t) => formatJalali(t.joinedAt),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (t) => (
        <Badge variant={TEACHER_STATUS_LABELS[t.status].variant}>
          {TEACHER_STATUS_LABELS[t.status].label}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'end',
      render: (t) => (
        <span className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Pencil}
            onClick={() => {
              setEditing(t);
              setFormOpen(true);
            }}
            aria-label={`ویرایش ${t.name}`}
          >
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setDeleting(t)}
            aria-label={`حذف ${t.name}`}
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
        title="مدیریت معلمان"
        description="مشاهده، جست‌وجو، افزودن و ویرایش کادر آموزشی مدرسه"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'معلمان' }]}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            افزودن معلم
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="کل معلمان"
          value={toPersianDigits(db.teachers.length)}
          icon={Presentation}
          tone="primary"
        />
        <StatCard
          title="معلمان فعال"
          value={toPersianDigits(activeCount)}
          icon={UserCheck}
          tone="success"
        />
        <StatCard
          title="در مرخصی"
          value={toPersianDigits(onLeaveCount)}
          icon={UserX}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
        <Input
          placeholder="جست‌وجو با نام، کد پرسنلی، تخصص، ایمیل یا شماره تماس…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={Search}
          aria-label="جست‌وجوی معلم"
        />
        <Select
          aria-label="فیلتر درس"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          options={[
            { value: 'all', label: 'همه دروس' },
            ...db.subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </div>

      <div className="mt-4">
        <Table<Teacher>
          data={rows}
          rowKey={(t) => t.id}
          caption="لیست معلمان"
          columns={columns}
          pageSize={8}
          emptyTitle="معلمی یافت نشد"
          emptyDescription="عبارت جست‌وجو یا فیلتر درس را تغییر دهید، یا معلم جدیدی اضافه کنید."
          emptyIcon={Presentation}
        />
      </div>

      <TeacherForm
        open={formOpen}
        initial={editing}
        subjects={db.subjects}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="حذف معلم"
        message={
          deleting
            ? `آیا از حذف «${deleting.name}» (کد پرسنلی ${deleting.employeeCode}) مطمئن هستید؟ این عمل قابل بازگشت نیست.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
