import { useMemo, useState } from 'react';
import {
  BellRing,
  Megaphone,
  Pin,
  Presentation,
  Search,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Badge, EmptyState, Input, PageHeader, StatCard } from '../../../components';
import { useAuth, useData } from '../../../hooks';
import { cn, formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import type { Announcement } from '../../../types';
import { AUDIENCE_LABELS } from '../../../constants';
import { useParentChild } from '../hooks/useParentChild';
import { teacherAnnouncements } from '../lib/parentAnalytics';
import { PriorityBadge } from '../components/DomainBadge';
import { SectionCard } from '../components/SectionCard';

type Tab = 'all' | 'school' | 'teacher';

const PRIORITY_ACCENT: Record<Announcement['priority'], string> = {
  urgent: 'border-e-4 border-e-danger bg-red-50/30',
  important: 'border-e-4 border-e-warning bg-amber-50/25',
  normal: 'border-e-4 border-e-slate-200',
};

export default function AnnouncementsPage() {
  const { currentUser } = useAuth();
  const { db } = useData();
  const { announcements } = useParentChild();

  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const schoolItems = useMemo(
    () => announcements.filter((item) => !teacherAnnouncements(db).some((t) => t.id === item.id)),
    [announcements, db],
  );
  const teacherItems = useMemo(() => teacherAnnouncements(db), [db]);

  const list = useMemo(() => {
    const base =
      tab === 'school' ? schoolItems : tab === 'teacher' ? teacherItems : announcements;
    const normalized = query.trim();
    if (normalized.length === 0) return base;
    return base.filter(
      (item) => item.title.includes(normalized) || item.body.includes(normalized),
    );
  }, [tab, announcements, schoolItems, teacherItems, query]);

  const pinnedCount = announcements.filter((item) => item.pinned).length;
  const urgentCount = announcements.filter((item) => item.priority === 'urgent').length;
  const unreadCount = db.messages.filter(
    (message) => message.to.id === (currentUser?.id ?? '') && !message.read,
  ).length;

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <>
      <PageHeader
        title="اطلاعیه‌ها"
        description="اطلاع‌رسانی‌های مدرسه و دبیران برای اولیا"
        breadcrumbs={[
          { label: 'مدرسه‌یار' },
          { label: 'پیشخوان اولیا', to: '/parent' },
          { label: 'اطلاعیه‌ها' },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل اطلاعیه‌ها"
          value={toPersianDigits(announcements.length)}
          icon={Megaphone}
          tone="primary"
          hint="برای اولیا و عموم"
        />
        <StatCard
          title="سنجاق‌شده"
          value={toPersianDigits(pinnedCount)}
          icon={Pin}
          tone="info"
          hint="در بالای فهرست"
        />
        <StatCard
          title="اطلاعیهٔ فوری"
          value={toPersianDigits(urgentCount)}
          icon={BellRing}
          tone={urgentCount > 0 ? 'danger' : 'success'}
          hint={urgentCount > 0 ? 'نیازمند توجه فوری' : 'مورد فوری وجود ندارد'}
        />
        <StatCard
          title="پیام خوانده‌نشده"
          value={toPersianDigits(unreadCount)}
          icon={Users}
          tone={unreadCount > 0 ? 'warning' : 'success'}
          hint="از سوی مدرسه"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Side rail: tabs + search */}
        <div className="flex flex-col gap-4">
          <SectionCard title="دسته‌بندی" icon={Megaphone}>
            <div className="flex flex-col gap-1.5">
              <TabButton
                active={tab === 'all'}
                onClick={() => setTab('all')}
                icon={Megaphone}
                label="همهٔ اطلاعیه‌ها"
                count={announcements.length}
              />
              <TabButton
                active={tab === 'school'}
                onClick={() => setTab('school')}
                icon={BellRing}
                label="اطلاعیه‌های مدرسه"
                count={schoolItems.length}
              />
              <TabButton
                active={tab === 'teacher'}
                onClick={() => setTab('teacher')}
                icon={Presentation}
                label="اطلاعیه‌های معلمان"
                count={teacherItems.length}
              />
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <Input
                label="جست‌وجو"
                placeholder="جست‌وجو در عنوان و متن…"
                leftIcon={Search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </SectionCard>

          <SectionCard title="راهنمای اهمیت" icon={Pin}>
            <ul className="space-y-2 text-[11px] text-text-muted">
              <li className="flex items-center gap-2">
                <PriorityBadge priority="urgent" /> نیازمند اقدام فوری
              </li>
              <li className="flex items-center gap-2">
                <PriorityBadge priority="important" /> مطلع شدن و اقدام در فرصت
              </li>
              <li className="flex items-center gap-2">
                <PriorityBadge priority="normal" /> اطلاع‌رسانی عمومی
              </li>
            </ul>
          </SectionCard>
        </div>

        {/* Announcement list */}
        <div className="xl:col-span-3">
          <SectionCard
            title={tab === 'teacher' ? 'اطلاعیه‌های معلمان' : tab === 'school' ? 'اطلاعیه‌های مدرسه' : 'همهٔ اطلاعیه‌ها'}
            description={`${toPersianDigits(list.length)} اطلاعیه نمایش داده می‌شود`}
            icon={Megaphone}
          >
            {list.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="اطلاعیه‌ای یافت نشد"
                description="عبارت جست‌وجو را تغییر دهید یا دستهٔ دیگری را انتخاب کنید."
                actionLabel="پاک کردن فیلترها"
                onAction={() => {
                  setQuery('');
                  setTab('all');
                }}
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {list.map((item) => {
                  const isOpen = expanded.includes(item.id);
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'rounded-card border border-border bg-surface p-3.5 transition-shadow hover:shadow-cardHover',
                        PRIORITY_ACCENT[item.priority],
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.pinned && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9.5px] font-bold text-primary ring-1 ring-inset ring-blue-200">
                                <Pin size={10} aria-hidden="true" />
                                سنجاق‌شده
                              </span>
                            )}
                            <PriorityBadge priority={item.priority} />
                            <Badge variant="neutral" dot={false}>
                              {AUDIENCE_LABELS[item.audience]}
                            </Badge>
                          </div>
                          <h3 className="mt-1.5 text-[13px] font-bold leading-6 text-text">
                            {item.title}
                          </h3>
                        </div>
                        <span className="shrink-0 text-[10px] text-text-muted">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p
                        className={cn(
                          'mt-1.5 text-[11.5px] leading-6 text-text-muted',
                          !isOpen && 'line-clamp-2',
                        )}
                      >
                        {item.body}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-text-muted">
                          <span className="font-semibold text-text">{item.authorName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatJalali(item.createdAt)}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.id)}
                          className="rounded-btn px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-blue-50"
                          aria-expanded={isOpen}
                        >
                          {isOpen ? 'بستن متن' : 'متن کامل'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <div className="mt-4 flex items-start gap-2 rounded-card border border-blue-200 bg-blue-50/60 px-4 py-3">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-[11px] leading-6 text-blue-900">
              اطلاعیه‌ها از سامانهٔ مرکزی مدرسه خوانده می‌شوند؛ اطلاعیهٔ جدیدی که مدیر یا معلم ثبت کند
              بلافاصله در این فهرست نمایش داده می‌شود.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Megaphone;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center gap-2 rounded-btn px-2.5 py-2 text-start text-[11.5px] font-semibold transition-colors',
        active ? 'bg-blue-50 text-primary' : 'text-text hover:bg-slate-50',
      )}
    >
      <Icon size={14} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-text-muted">
        {toPersianDigits(count)}
      </span>
    </button>
  );
}
