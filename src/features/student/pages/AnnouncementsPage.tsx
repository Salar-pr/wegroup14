import { useMemo, useState } from 'react';
import { BellRing, CheckCheck, CheckCircle2, Circle, Megaphone, Pin, Search } from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatCard,
} from '../../../components';
import { AUDIENCE_LABELS, ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks';
import { cn, formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import { useStudentPortal } from '../hooks/useStudentPortal';
import {
  ANNOUNCEMENT_CATEGORY_LABELS,
  PRIORITY_META,
  type AnnouncementCategory,
  type EnrichedAnnouncement,
} from '../lib/studentAnalytics';

type ReadFilter = 'all' | 'unread' | 'read';

export default function AnnouncementsPage() {
  const { announcements, session } = useStudentPortal();
  const { showToast } = useToast();

  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AnnouncementCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<EnrichedAnnouncement | null>(null);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim();
    return announcements.filter((item) => {
      if (readFilter === 'unread' && item.isRead) return false;
      if (readFilter === 'read' && !item.isRead) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (
        q &&
        !item.announcement.title.includes(q) &&
        !item.announcement.body.includes(q) &&
        !item.announcement.authorName.includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [announcements, readFilter, categoryFilter, searchQuery]);

  const totalCount = announcements.length;
  const unreadCount = announcements.filter((a) => !a.isRead).length;
  const pinnedCount = announcements.filter((a) => a.announcement.pinned).length;
  const urgentCount = announcements.filter(
    (a) => a.announcement.priority === 'urgent' || a.announcement.priority === 'important',
  ).length;

  const categoryOptions = [
    { value: 'all', label: 'همه دسته‌بندی‌ها' },
    { value: 'exam', label: ANNOUNCEMENT_CATEGORY_LABELS.exam },
    { value: 'holiday', label: ANNOUNCEMENT_CATEGORY_LABELS.holiday },
    { value: 'event', label: ANNOUNCEMENT_CATEGORY_LABELS.event },
    { value: 'general', label: ANNOUNCEMENT_CATEGORY_LABELS.general },
  ];

  const liveSelected = selectedItem
    ? (announcements.find((a) => a.announcement.id === selectedItem.announcement.id) ?? null)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="اطلاعیه‌ها و اخبار مدرسه"
        description="اطلاعیه‌های رسمی مدیریت، معاونت آموزشی و دبیران مرتبط با دانش‌آموزان"
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'اطلاعیه‌ها' }]}
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={CheckCheck}
              onClick={() => {
                session.markAllAnnouncementsRead(announcements.map((a) => a.announcement.id));
                showToast('success', 'همه اطلاعیه‌ها به عنوان خوانده‌شده علامت‌گذاری شدند.');
              }}
            >
              علامت‌گذاری همه به عنوان خوانده‌شده
            </Button>
          )
        }
      />

      {/* 4 KPI StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل اطلاعیه‌های مرتبط"
          value={`${toPersianDigits(totalCount)} اطلاعیه`}
          icon={Megaphone}
          tone="primary"
          hint="ویژه دانش‌آموزان و عمومی مدرسه"
        />
        <StatCard
          title="خوانده‌نشده"
          value={`${toPersianDigits(unreadCount)} مورد`}
          icon={BellRing}
          tone={unreadCount > 0 ? 'warning' : 'success'}
          hint={unreadCount > 0 ? 'برای ثبت مطالعه روی کارت کلیک کنید' : 'همه مطالعه شده‌اند'}
        />
        <StatCard
          title="سنجاق‌شده در تابلو"
          value={`${toPersianDigits(pinnedCount)} مورد`}
          icon={Pin}
          tone="info"
          hint="اطلاعیه‌های دارای اولویت نمایش"
        />
        <StatCard
          title="فوری و مهم"
          value={`${toPersianDigits(urgentCount)} مورد`}
          icon={CheckCircle2}
          tone={urgentCount > 0 ? 'danger' : 'primary'}
          hint="اطلاعیه‌های امتحانی و انضباطی"
        />
      </div>

      {/* Filters Bar */}
      <div className="space-y-3 rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all' as const, label: 'همه', count: totalCount },
            { id: 'unread' as const, label: 'خوانده‌نشده', count: unreadCount },
            {
              id: 'read' as const,
              label: 'خوانده‌شده',
              count: totalCount - unreadCount,
            },
          ].map((tab) => {
            const active = readFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReadFilter(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-btn px-3.5 py-2 text-[12px] font-bold transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-muted hover:bg-slate-100 hover:text-text',
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px]',
                    active ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-text-muted',
                  )}
                >
                  {toPersianDigits(tab.count)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-12">
          <div className="md:col-span-8">
            <Input
              aria-label="جستجو در متن و عنوان اطلاعیه‌ها"
              leftIcon={Search}
              placeholder="جستجو در عنوان، متن یا منتشرکننده اطلاعیه…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-4">
            <Select
              aria-label="فیلتر دسته‌بندی اطلاعیه"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | AnnouncementCategory)}
            />
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="اطلاعیه‌ای مطابق فیلتر شما یافت نشد"
          description="فیلتر وضعیت مطالعه یا دسته‌بندی را تغییر دهید."
          actionLabel="نمایش همه اطلاعیه‌ها"
          onAction={() => {
            setReadFilter('all');
            setCategoryFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const priority = PRIORITY_META[item.announcement.priority];
            return (
              <article
                key={item.announcement.id}
                className={cn(
                  'rounded-card border bg-surface p-5 shadow-card transition-all duration-150 hover:shadow-cardHover',
                  !item.isRead ? 'border-primary/40' : 'border-border',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.announcement.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-primary">
                        <Pin size={12} aria-hidden="true" />
                        سنجاق‌شده
                      </span>
                    )}
                    <Badge variant={priority.badge}>{priority.label}</Badge>
                    <Badge variant="info" dot={false}>
                      {item.categoryLabel}
                    </Badge>
                    <Badge variant="neutral" dot={false}>
                      مخاطب: {AUDIENCE_LABELS[item.announcement.audience]}
                    </Badge>
                  </div>

                  <button
                    type="button"
                    onClick={() => session.toggleAnnouncementRead(item.announcement.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-btn border px-3 py-1.5 text-[11px] font-bold transition-colors',
                      item.isRead
                        ? 'border-border bg-background text-text-muted hover:text-text'
                        : 'border-blue-200 bg-blue-50 text-primary hover:bg-blue-100',
                    )}
                  >
                    {item.isRead ? (
                      <>
                        <CheckCircle2 size={13} className="text-success" aria-hidden="true" />
                        خوانده‌شده
                      </>
                    ) : (
                      <>
                        <Circle size={13} className="text-primary" aria-hidden="true" />
                        علامت به عنوان خوانده‌شده
                      </>
                    )}
                  </button>
                </div>

                <h2 className="mt-3 text-[16px] font-extrabold text-text">
                  {item.announcement.title}
                </h2>
                <p className="mt-2 text-[13px] leading-7 text-text-muted">
                  {item.announcement.body}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-[12px] text-text-muted">
                  <span>
                    منتشرکننده:{' '}
                    <strong className="font-bold text-text">{item.announcement.authorName}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <span>
                      تاریخ انتشار: {formatJalali(item.announcement.createdAt)} (
                      {formatRelativeTime(item.announcement.createdAt)})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        session.markAnnouncementRead(item.announcement.id);
                        setSelectedItem(item);
                      }}
                    >
                      نمای کامل
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full Announcement Modal */}
      <Modal
        open={liveSelected !== null}
        onClose={() => setSelectedItem(null)}
        title={liveSelected?.announcement.title}
        description={
          liveSelected
            ? `${liveSelected.announcement.authorName} • ${formatJalali(liveSelected.announcement.createdAt)}`
            : undefined
        }
        footer={
          <div className="flex items-center gap-2">
            {liveSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => session.toggleAnnouncementRead(liveSelected.announcement.id)}
              >
                {liveSelected.isRead ? 'برگرداندن به خوانده‌نشده' : 'علامت به عنوان خوانده‌شده'}
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => setSelectedItem(null)}>
              بستن
            </Button>
          </div>
        }
      >
        {liveSelected && (
          <div className="space-y-4 text-[13px]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={PRIORITY_META[liveSelected.announcement.priority].badge}>
                {PRIORITY_META[liveSelected.announcement.priority].label}
              </Badge>
              <Badge variant="info" dot={false}>
                {liveSelected.categoryLabel}
              </Badge>
              <Badge variant={liveSelected.isRead ? 'success' : 'warning'} dot>
                {liveSelected.isRead ? 'خوانده‌شده' : 'خوانده‌نشده'}
              </Badge>
            </div>
            <p className="rounded-btn border border-border bg-background p-4 leading-8 text-text">
              {liveSelected.announcement.body}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
