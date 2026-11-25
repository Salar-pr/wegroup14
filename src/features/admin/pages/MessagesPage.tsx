import { useState } from 'react';
import { Inbox, Mail, Search, Send } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Input,
  PageHeader,
  StatCard,
} from '../../../components';
import { useAuth, useData, useToast } from '../../../hooks';
import { cn, formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import type { Message } from '../../../types';

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const { db, updateEntity } = useData();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const myId = currentUser?.id ?? '';

  const messages = db.messages
    .filter((msg) => msg.to.id === myId || msg.from.id === myId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const filtered = messages.filter((msg) =>
    `${msg.subject} ${msg.body} ${msg.from.name} ${msg.to.name}`.includes(query.trim()),
  );
  const selected = filtered.find((msg) => msg.id === selectedId) ?? filtered[0];
  const unread = messages.filter((msg) => msg.to.id === myId && !msg.read).length;

  const openMessage = (msg: Message) => {
    setSelectedId(msg.id);
    setReply('');
    if (msg.to.id === myId && !msg.read) {
      updateEntity('messages', (items) =>
        items.map((item) => (item.id === msg.id ? { ...item, read: true } : item)),
      );
    }
  };

  const sendReply = () => {
    if (!currentUser || !selected || reply.trim().length < 3) return;
    const to = selected.from.id === myId ? selected.to : selected.from;
    const msg: Message = {
      id: `m-${crypto.randomUUID()}`,
      from: { id: currentUser.id, name: currentUser.name, role: 'admin' },
      to,
      subject: selected.subject.startsWith('پاسخ:')
        ? selected.subject
        : `پاسخ: ${selected.subject}`,
      body: reply.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    updateEntity('messages', (items) => [msg, ...items]);
    setSelectedId(msg.id);
    setReply('');
    showToast('success', `پاسخ برای ${to.name} ثبت شد.`);
  };

  return (
    <>
      <PageHeader
        title="پیام‌های مدرسه"
        description="مکاتبات مدیر با دانش‌آموزان، اولیا و معلمان؛ فقط در همین نشست"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'پیام‌ها' }]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="همه مکاتبات" value={toPersianDigits(messages.length)} icon={Mail} />
        <StatCard title="خوانده‌نشده" value={toPersianDigits(unread)} icon={Inbox} tone="warning" />
        <StatCard
          title="پاسخ‌های مدیر"
          value={toPersianDigits(messages.filter((msg) => msg.from.id === myId).length)}
          icon={Send}
          tone="info"
        />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,350px)_minmax(0,1fr)]">
        <section
          className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
          aria-label="فهرست مکاتبات"
        >
          <div className="border-b border-border p-3">
            <Input
              aria-label="جست‌وجوی پیام‌ها"
              placeholder="جست‌وجو در پیام‌ها…"
              leftIcon={Search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={Inbox} title="پیامی پیدا نشد" className="m-3" />
          ) : (
            <ul className="max-h-[600px] divide-y divide-border overflow-y-auto">
              {filtered.map((msg) => {
                const incoming = msg.to.id === myId;
                const person = incoming ? msg.from : msg.to;
                return (
                  <li key={msg.id}>
                    <button
                      type="button"
                      aria-pressed={selected?.id === msg.id}
                      onClick={() => openMessage(msg)}
                      className={cn(
                        'flex w-full gap-3 p-3 text-start hover:bg-slate-50',
                        selected?.id === msg.id && 'bg-blue-50',
                      )}
                    >
                      <Avatar name={person.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2 text-xs font-bold text-text">
                          <span className="truncate">
                            {incoming ? 'از' : 'به'} {person.name}
                          </span>
                          {incoming && !msg.read && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-primary"
                              aria-label="خوانده‌نشده"
                            />
                          )}
                        </span>
                        <span className="mt-1 block truncate text-xs text-text">{msg.subject}</span>
                        <span className="mt-1 block text-[11px] text-text-muted">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section
          className="min-w-0 rounded-card border border-border bg-surface p-5 shadow-card"
          aria-label="متن پیام"
        >
          {!selected ? (
            <EmptyState
              icon={Mail}
              title="پیامی برای نمایش نیست"
              description="یک پیام را از فهرست انتخاب کنید."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
                <Avatar name={selected.from.name} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-text">{selected.subject}</h2>
                  <p className="mt-1 text-xs text-text-muted">
                    {selected.from.name} به {selected.to.name} · {formatJalali(selected.createdAt)}
                  </p>
                </div>
                <Badge variant={selected.to.id === myId ? 'primary' : 'neutral'}>
                  {selected.to.id === myId ? 'دریافتی' : 'ارسالی'}
                </Badge>
              </div>
              <p className="min-h-32 whitespace-pre-wrap py-5 text-sm leading-7 text-text">
                {selected.body}
              </p>
              <div className="border-t border-border pt-4">
                <label htmlFor="admin-reply" className="block text-xs font-bold text-text">
                  پاسخ به {selected.from.id === myId ? selected.to.name : selected.from.name}
                </label>
                <textarea
                  id="admin-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={3}
                  placeholder="متن پاسخ را بنویسید…"
                  className="mt-2 w-full rounded-input border border-border bg-surface p-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
                <Button
                  onClick={sendReply}
                  disabled={reply.trim().length < 3}
                  leftIcon={Send}
                  className="mt-2"
                >
                  ارسال پاسخ نمایشی
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
