/**
 * Admin feature — grade management (مدیریت نمرات).
 * Filter by class / subject / student, add / edit / delete grades,
 * and review averages. All data lives in the shared in-memory database.
 */
import { useMemo, useState } from 'react';
import { ClipboardList, Pencil, Plus, Search, Trash2, TrendingUp } from 'lucide-react';
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
import { getClassById, getStudentById, getSubjectById, getTeacherById } from '../../../data';
import { formatJalali, toPersianDigits } from '../../../utils';
import type { Grade } from '../../../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { GradeForm, type GradeFormValues } from '../components/GradeForm';
import { GRADE_TYPE_LABELS, gradeVariant, newId } from '../lib/labels';
import { gradeSummary } from '../lib/stats';

export default function GradesPage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [deleting, setDeleting] = useState<Grade | null>(null);

  const studentsInFilter = useMemo(() => {
    if (classFilter === 'all') return db.students;
    return db.students.filter((s) => s.classId === classFilter);
  }, [db.students, classFilter]);

  const rows = useMemo(() => {
    const q = query.trim();
    return db.grades.filter((grade) => {
      if (classFilter !== 'all' && grade.classId !== classFilter) return false;
      if (subjectFilter !== 'all' && grade.subjectId !== subjectFilter) return false;
      if (studentFilter !== 'all' && grade.studentId !== studentFilter) return false;
      if (q === '') return true;
      const student = getStudentById(db, grade.studentId);
      return (
        grade.title.includes(q) ||
        (student?.name.includes(q) ?? false) ||
        (getSubjectById(db, grade.subjectId)?.name.includes(q) ?? false)
      );
    });
  }, [db, query, classFilter, subjectFilter, studentFilter]);

  const summary = useMemo(() => gradeSummary(db), [db]);

  const handleSubmit = (values: GradeFormValues) => {
    const student = getStudentById(db, values.studentId);
    const subject = getSubjectById(db, values.subjectId);
    const teacherId = subject?.teacherId ?? db.teachers[0]?.id ?? '';
    const classId = student?.classId ?? db.classes[0]?.id ?? '';

    if (editing) {
      updateEntity('grades', (items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                studentId: values.studentId,
                subjectId: values.subjectId,
                classId,
                teacherId,
                title: values.title,
                type: values.type,
                score: values.score,
                maxScore: values.maxScore,
                date: values.date,
              }
            : item,
        ),
      );
      showToast('success', 'نمره با موفقیت به‌روزرسانی شد.', 'ویرایش نمره');
    } else {
      const grade: Grade = {
        id: newId('g'),
        studentId: values.studentId,
        subjectId: values.subjectId,
        classId,
        teacherId,
        title: values.title,
        type: values.type,
        score: values.score,
        maxScore: values.maxScore,
        date: values.date,
      };
      updateEntity('grades', (items) => [grade, ...items]);
      showToast('success', 'نمره با موفقیت ثبت شد.', 'نمره جدید');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    updateEntity('grades', (items) => items.filter((item) => item.id !== deleting.id));
    showToast('success', 'نمره حذف شد.', 'حذف نمره');
    setDeleting(null);
  };

  const columns: TableColumn<Grade>[] = [
    {
      key: 'student',
      header: 'دانش‌آموز',
      sortValue: (g) => getStudentById(db, g.studentId)?.name ?? '',
      render: (g) => {
        const student = getStudentById(db, g.studentId);
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
      key: 'subject',
      header: 'درس',
      sortValue: (g) => getSubjectById(db, g.subjectId)?.name ?? '',
      render: (g) => getSubjectById(db, g.subjectId)?.name ?? '—',
    },
    {
      key: 'title',
      header: 'عنوان',
      sortValue: (g) => g.title,
      render: (g) => (
        <span>
          <span className="block font-bold">{g.title}</span>
          <span className="block text-[11px] text-text-muted">
            {GRADE_TYPE_LABELS[g.type]} • {getClassById(db, g.classId)?.name ?? ''}
          </span>
        </span>
      ),
    },
    {
      key: 'score',
      header: 'نمره',
      align: 'center',
      sortValue: (g) => g.score,
      render: (g) => (
        <Badge variant={gradeVariant(g.score)}>
          {toPersianDigits(g.score)} از {toPersianDigits(g.maxScore)}
        </Badge>
      ),
    },
    {
      key: 'teacher',
      header: 'معلم',
      render: (g) => getTeacherById(db, g.teacherId)?.name ?? '—',
    },
    {
      key: 'date',
      header: 'تاریخ',
      sortValue: (g) => g.date,
      render: (g) => formatJalali(g.date),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'end',
      render: (g) => (
        <span className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Pencil}
            onClick={() => {
              setEditing(g);
              setFormOpen(true);
            }}
            aria-label="ویرایش نمره"
          >
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setDeleting(g)}
            aria-label="حذف نمره"
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
        title="مدیریت نمرات"
        description="ثبت و ویرایش نمرات دانش‌آموزان و مشاهده میانگین‌ها"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'نمرات' }]}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            ثبت نمره
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="تعداد نمرات ثبت‌شده"
          value={toPersianDigits(summary.count)}
          icon={ClipboardList}
          tone="primary"
        />
        <StatCard
          title="میانگین کل"
          value={`${toPersianDigits(summary.average)} از ۲۰`}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="بالاترین نمره"
          value={`${toPersianDigits(summary.highest)} از ۲۰`}
          icon={TrendingUp}
          tone="info"
        />
        <StatCard
          title="پایین‌ترین نمره"
          value={`${toPersianDigits(summary.lowest)} از ۲۰`}
          icon={TrendingUp}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_200px_200px_220px]">
        <Input
          placeholder="جست‌وجو با نام دانش‌آموز، درس یا عنوان…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={Search}
          aria-label="جست‌وجوی نمره"
        />
        <Select
          aria-label="فیلتر کلاس"
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setStudentFilter('all');
          }}
          options={[
            { value: 'all', label: 'همه کلاس‌ها' },
            ...db.classes.map((c) => ({ value: c.id, label: c.name })),
          ]}
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
        <Select
          aria-label="فیلتر دانش‌آموز"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          options={[
            { value: 'all', label: 'همه دانش‌آموزان' },
            ...studentsInFilter.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
      </div>

      <div className="mt-4">
        <Table<Grade>
          data={rows}
          rowKey={(g) => g.id}
          caption="لیست نمرات"
          columns={columns}
          pageSize={8}
          emptyTitle="نمره‌ای یافت نشد"
          emptyDescription="فیلترها را تغییر دهید یا نمره جدیدی ثبت کنید."
          emptyIcon={ClipboardList}
        />
      </div>

      <GradeForm
        open={formOpen}
        initial={editing}
        students={studentsInFilter}
        subjects={db.subjects}
        defaultStudentId={studentFilter !== 'all' ? studentFilter : undefined}
        defaultSubjectId={subjectFilter !== 'all' ? subjectFilter : undefined}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="حذف نمره"
        message="آیا از حذف این نمره مطمئن هستید؟ این عمل قابل بازگشت نیست."
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
