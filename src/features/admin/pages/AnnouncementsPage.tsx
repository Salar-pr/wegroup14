/**
 * Admin feature — announcements (مدیریت اطلاعیه‌ها).
 * Create / edit / delete announcements, choose the audience, pin important
 * items and browse the full publication history.
 */
import { useMemo, useState } from 'react';
import { Megaphone, Pencil, Pin, Plus, Search, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Input,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { useAuth, useData, useToast } from '../../../hooks';
import { formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import type { Announcement, AnnouncementAudience } from '../../../types';
import { AnnouncementForm, type AnnouncementFormValues } from '../components/AnnouncementForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ANNOUNCEMENT_AUDIENCE_LABELS, ANNOUNCEMENT_PRIORITY_LABELS, newId } from '../lib/labels';

export default function AnnouncementsPage() {
  const { db, updateEntity } = useData();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const rows = useMemo(() => {
    const q = query.trim();
    return [...db.announcements]
      .filter((item) => (audienceFilter === 'all' ? true : item.audience === audienceFilter))
      .filter(
        (item) =>
          q === '' || item.title.includes(q) || item.body.includes(q) || item.authorName.includes(q),
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  }, [db.announcements, query, audienceFilter]);

  const pinnedCount = db.announcements.filter((a) => a.pinned).length;
  const urgentCount = db.announcements.filter((a) => a.priority === 'urgent').length;

  const handleSubmit = (values: AnnouncementFormValues) => {
    const authorName = currentUser?.name ?? 'مدیر مدرسه';
    if (editing) {
      updateEntity('announcements', (items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                title: values.title,
                body: values.body,
                audience: values.audience,
                priority: values.priority,
                pinned: values.pinned,
                authorName,
              }
            : item,
        ),
      );
      showToast('success', `اطلاعیه «${values.title}» به‌روزرسانی شد.`, 'ویرایش اطلاعیه');
    } else {
      const announcement: Announcement = {
        id: newId('ann'),
        title: values.title,
        body: values.body,
        audience: values.audience,
        priority: values.priority,
        pinned: values.pinned,
        authorName,
        createdAt: new Date().toISOString(),
      };
      updateEntity('announcements', (items) => [announcement, ...items]);
      showToast(
        'success',
        `اطلاعیه برای «${ANNOUNCEMENT_AUDIENCE_LABELS[values.audience]}» منتشر شد.`,
        'اطلاعیه جدید',
      );
    }
    setFormOpen(false);
    setEditing(null);
  };

  const togglePin = (announcement: Announcement) => {
    updateEntity('announcements', (items) =>
      items.map((item) => (item.id === announcement.id ? { ...item, pinned: !item.pinned } : item)),
    );
    showToast(
      'info',
      announcement.pinned ? 'اطلاعیه از حالت سنجاق خارج شد.' : 'اطلاعیه سنجاق شد.',
      'اطلاعیه',
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    updateEntity('announcements', (items) => items.filter((item) => item.id !== deleting.id));
    showToast('success', 'اطلاعیه حذف شد.', 'حذف اطلاعیه');
    setDeleting(null);
  };

  const columns: TableColumn<Announcement>[] = [
    {
      key: 'title',
      header: 'عنوان',
      sortValue: (a) => a.title,
      render: (a) => (
        <span>
          <span className="flex items-center gap-1.5 font-bold">
            {a.pinned && <Pin size={13} className="text-primary" aria-label="سنجاق‌شده" />}
            {a.title}
          </span>
          <span className="mt-0.5 block max-w-[380px] truncate text-[11px] text-text-muted">
            {a.body}
          </span>
        </span>
      ),
    },
    {
      key: 'audience',
      header: 'مخاطبان',
      sortValue: (a) => ANNOUNCEMENT_AUDIENCE_LABELS[a.audience],
      render: (a) => (
        <Badge variant="info" dot={false}>
          {ANNOUNCEMENT_AUDIENCE_LABELS[a.audience]}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'اهمیت',
      render: (a) => (
        <Badge variant={ANNOUNCEMENT_PRIORITY_LABELS[a.priority].variant}>
          {ANNOUNCEMENT_PRIORITY_LABELS[a.priority].label}
        </Badge>
      ),
    },
    {
      key: 'author',
      header: 'نویسنده',
      render: (a) => a.authorName,
    },
    {
      key: 'createdAt',
      header: 'تاریخ انتشار',
      sortValue: (a) => a.createdAt,
      render: (a) => (
        <span>
          <span className="block">{formatJalali(a.createdAt)}</span>
          <span className="block text-[11px] text-text-muted">{formatRelativeTime(a.createdAt)}</span>
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'end',
      render: (a) => (
        <span className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Pin}
            onClick={() => togglePin(a)}
            aria-label={a.pinned ? `برداشتن سنجاق ${a.title}` : `سنجاق کردن ${a.title}`}
          >
            {a.pinned ? 'برداشتن سنجاق' : 'سنجاق'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Pencil}
            onClick={() => {
              setEditing(a);
              setFormOpen(true);
            }}
            aria-label={`ویرایش ${a.title}`}
          >
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setDeleting(a)}
            aria-label={`حذف ${a.title}`}
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
        title="مدیریت اطلاعیه‌ها"
        description="انتشار اطلاعیه برای مخاطبان مختلف و مشاهده تاریخچه اطلاعیه‌ها"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'اطلاعیه‌ها' }]}
        actions={
          <Button
            leftIcon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            اطلاعیه جدید
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="کل اطلاعیه‌ها"
          value={toPersianDigits(db.announcements.length)}
          icon={Megaphone}
          tone="primary"
        />
        <StatCard
          title="سنجاق‌شده"
          value={toPersianDigits(pinnedCount)}
          icon={Pin}
          tone="info"
        />
        <StatCard
          title="فوری"
          value={toPersianDigits(urgentCount)}
          icon={Megaphone}
          tone="danger"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
        <Input
          placeholder="جست‌وجو در عنوان، متن یا نویسنده اطلاعیه…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={Search}
          aria-label="جست‌وجوی اطلاعیه"
        />
        <Select
          aria-label="فیلتر مخاطبان"
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          options={[
            { value: 'all', label: 'همه مخاطبان' },
            ...(Object.keys(ANNOUNCEMENT_AUDIENCE_LABELS) as AnnouncementAudience[]).map(
              (audience) => ({ value: audience, label: ANNOUNCEMENT_AUDIENCE_LABELS[audience] }),
            ),
          ]}
        />
      </div>

      <div className="mt-4">
        <Table<Announcement>
          data={rows}
          rowKey={(a) => a.id}
          caption="تاریخچه اطلاعیه‌ها"
          columns={columns}
          pageSize={8}
          emptyTitle="اطلاعیه‌ای یافت نشد"
          emptyDescription="عبارت جست‌وجو را تغییر دهید یا اطلاعیه جدیدی منتشر کنید."
          emptyIcon={Megaphone}
        />
      </div>

      <AnnouncementForm
        open={formOpen}
        initial={editing}
        authorName={currentUser?.name ?? 'مدیر مدرسه'}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="حذف اطلاعیه"
        message={deleting ? `آیا از حذف اطلاعیه «${deleting.title}» مطمئن هستید؟` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
