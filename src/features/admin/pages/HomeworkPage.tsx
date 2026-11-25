/**
 * Admin feature — homework management (مدیریت تکالیف).
 * Create / edit / delete assignments, set deadlines, assign classes and
 * review the submission status of each assignment's roster.
 */
import { useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Eye,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Modal,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { useData, useToast } from '../../../hooks';
import { getClassById, getStudentById, getSubjectById, getTeacherById } from '../../../data';
import { formatJalali, toPersianDigits } from '../../../utils';
import type { Homework } from '../../../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HomeworkForm, type HomeworkFormValues } from '../components/HomeworkForm';
import { newId, todayISO } from '../lib/labels';
import { HOMEWORK_STATUS_LABELS, homeworkStatus, homeworkSubmission } from '../lib/stats';

const STATUS_BADGE = {
  overdue: { variant: 'danger' as const, label: HOMEWORK_STATUS_LABELS.overdue },
  'due-soon': { variant: 'warning' as const, label: HOMEWORK_STATUS_LABELS['due-soon'] },
  active: { variant: 'info' as const, label: HOMEWORK_STATUS_LABELS.active },
};

export default function HomeworkPage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();
  const today = todayISO();

  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Homework | null>(null);
  const [deleting, setDeleting] = useState<Homework | null>(null);
  const [viewing, setViewing] = useState<Homework | null>(null);

  const rows = useMemo(
    () =>
      db.homework
        .filter((item) => (classFilter === 'all' ? true : item.classId === classFilter))
        .filter((item) =>
          statusFilter === 'all' ? true : homeworkStatus(item, today) === statusFilter,
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [db.homework, classFilter, statusFilter, today],
  );

  const activeCount = db.homework.filter((h) => homeworkStatus(h, today) !== 'overdue').length;
  const overdueCount = db.homework.filter((h) => homeworkStatus(h, today) === 'overdue').length;

  const handleSubmit = (values: HomeworkFormValues) => {
    if (editing) {
      updateEntity('homework', (items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                title: values.title,
                description: values.description,
                subjectId: values.subjectId,
                teacherId: values.teacherId,
                classId: values.classId,
                dueDate: values.dueDate,
                maxScore: values.maxScore,
              }
            : item,
        ),
      );
      showToast('success', `تکلیف «${values.title}» به‌روزرسانی شد.`, 'ویرایش تکلیف');
    } else {
      const homework: Homework = {
        id: newId('hw'),
        title: values.title,
        description: values.description,
        subjectId: values.subjectId,
        teacherId: values.teacherId,
        classId: values.classId,
        assignedAt: today,
        dueDate: values.dueDate,
        maxScore: values.maxScore,
      };
      updateEntity('homework', (items) => [homework, ...items]);
      showToast('success', `تکلیف «${values.title}» ایجاد شد.`, 'تکلیف جدید');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    updateEntity('homework', (items) => items.filter((item) => item.id !== deleting.id));
    showToast('success', 'تکلیف حذف شد.', 'حذف تکلیف');
    setDeleting(null);
  };

  const viewingSubmission = viewing ? homeworkSubmission(db, viewing) : null;

  const columns: TableColumn<Homework>[] = [
    {
      key: 'title',
      header: 'عنوان تکلیف',
      sortValue: (h) => h.title,
      render: (h) => (
        <span>
          <span className="block font-bold">{h.title}</span>
          <span className="block max-w-[320px] truncate text-[11px] text-text-muted">
            {h.description}
          </span>
        </span>
      ),
    },
    {
      key: 'class',
      header: 'کلاس / درس',
      sortValue: (h) => getClassById(db, h.classId)?.name ?? '',
      render: (h) => (
        <span>
          <span className="block">{getClassById(db, h.classId)?.name ?? '—'}</span>
          <span className="block text-[11px] text-text-muted">
            {getSubjectById(db, h.subjectId)?.name ?? ''}
          </span>
        </span>
      ),
    },
    {
      key: 'teacher',
      header: 'معلم',
      render: (h) => getTeacherById(db, h.teacherId)?.name ?? '—',
    },
    {
      key: 'dueDate',
      header: 'مهلت تحویل',
      sortValue: (h) => h.dueDate,
      render: (h) => (
        <span>
          <span className="block">{formatJalali(h.dueDate)}</span>
          <span className="block text-[11px] text-text-muted">
            {HOMEWORK_STATUS_LABELS[homeworkStatus(h, today)]}
          </span>
        </span>
      ),
    },
    {
      key: 'submission',
      header: 'وضعیت تحویل',
      align: 'center',
      sortValue: (h) => homeworkSubmission(db, h).percent,
      render: (h) => {
        const submission = homeworkSubmission(db, h);
        return (
          <span className="inline-flex min-w-[110px] flex-col items-center gap-1">
            <span className="text-[12px] font-bold">
              {toPersianDigits(submission.submitted)} از {toPersianDigits(submission.total)}
            </span>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <span
                className={`block h-full rounded-full ${
                  submission.percent >= 80
                    ? 'bg-success'
                    : submission.percent >= 40
                      ? 'bg-warning'
                      : 'bg-danger'
                }`}
                style={{ width: `${submission.percent}%` }}
              />
            </span>
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (h) => {
        const status = homeworkStatus(h, today);
        return <Badge variant={STATUS_BADGE[status].variant}>{STATUS_BADGE[status].label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'end',
      render: (h) => (
        <span className="inline-flex items-center gap-1">
          <Button variant="ghost" size="sm" leftIcon={Eye} onClick={() => setViewing(h)} aria-label={`تحویل‌های ${h.title}`}>
            تحویل‌ها
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Pencil}
            onClick={() => {
              setEditing(h);
              setFormOpen(true);
            }}
            aria-label={`ویرایش ${h.title}`}
          >
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setDeleting(h)}
            aria-label={`حذف ${h.title}`}
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
        title="مدیریت تکالیف"
        description="ایجاد و ویرایش تکالیف، تعیین مهلت، انتخاب کلاس و پیگیری تحویل"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'تکالیف' }]}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            تکلیف جدید
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="کل تکالیف"
          value={toPersianDigits(db.homework.length)}
          icon={NotebookPen}
          tone="primary"
        />
        <StatCard
          title="تکالیف فعال"
          value={toPersianDigits(activeCount)}
          icon={CalendarClock}
          tone="info"
        />
        <StatCard
          title="مهلت گذشته"
          value={toPersianDigits(overdueCount)}
          icon={CalendarClock}
          tone="danger"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr]">
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
          options={[
            { value: 'all', label: 'همه وضعیت‌ها' },
            { value: 'active', label: 'فعال' },
            { value: 'due-soon', label: 'مهلت نزدیک' },
            { value: 'overdue', label: 'مهلت گذشته' },
          ]}
        />
      </div>

      <div className="mt-4">
        <Table<Homework>
          data={rows}
          rowKey={(h) => h.id}
          caption="لیست تکالیف"
          columns={columns}
          pageSize={8}
          emptyTitle="تکلیفی یافت نشد"
          emptyDescription="فیلترها را تغییر دهید یا تکلیف جدیدی ایجاد کنید."
          emptyIcon={NotebookPen}
        />
      </div>

      <HomeworkForm
        open={formOpen}
        initial={editing}
        subjects={db.subjects}
        teachers={db.teachers}
        classes={db.classes}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="حذف تکلیف"
        message={deleting ? `آیا از حذف تکلیف «${deleting.title}» مطمئن هستید؟` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? `وضعیت تحویل — ${viewing.title}` : ''}
        description={
          viewing
            ? `${getClassById(db, viewing.classId)?.name ?? ''} • مهلت ${formatJalali(viewing.dueDate)}`
            : undefined
        }
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setViewing(null)}>
            بستن
          </Button>
        }
      >
        {viewingSubmission && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-btn border border-border p-3 text-center">
                <p className="text-[11px] text-text-muted">کل دانش‌آموزان</p>
                <p className="mt-1 text-lg font-extrabold text-text">
                  {toPersianDigits(viewingSubmission.total)}
                </p>
              </div>
              <div className="rounded-btn border border-success/30 bg-green-50 p-3 text-center">
                <p className="text-[11px] text-green-700">تحویل داده‌شده</p>
                <p className="mt-1 text-lg font-extrabold text-green-800">
                  {toPersianDigits(viewingSubmission.submitted)}
                </p>
              </div>
              <div className="rounded-btn border border-danger/30 bg-red-50 p-3 text-center">
                <p className="text-[11px] text-red-700">در انتظار تحویل</p>
                <p className="mt-1 text-lg font-extrabold text-red-800">
                  {toPersianDigits(viewingSubmission.pending)}
                </p>
              </div>
            </div>
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {viewingSubmission.rows.length === 0 && (
                <li className="py-6 text-center text-[12px] text-text-muted">
                  دانش‌آموزی در این کلاس ثبت نشده است.
                </li>
              )}
              {viewingSubmission.rows.map((row) => {
                const student = getStudentById(db, row.student.id);
                return (
                  <li
                    key={row.student.id}
                    className="flex items-center gap-3 rounded-btn border border-border p-2.5"
                  >
                    <Avatar name={row.student.name} color={row.student.avatarColor} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-text">
                      {student?.name ?? row.student.name}
                    </span>
                    {row.submitted ? (
                      <Badge variant="success" dot={false}>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          تحویل شده{row.score !== undefined ? ` • ${toPersianDigits(row.score)}` : ''}
                        </span>
                      </Badge>
                    ) : (
                      <Badge variant="warning">در انتظار</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted">
              <Users size={13} aria-hidden="true" />
              وضعیت تحویل از نمرات ثبت‌شده برای همین درس و کلاس محاسبه می‌شود.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}
