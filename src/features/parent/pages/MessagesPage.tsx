import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCheck,
  Inbox,
  Mail,
  MailOpen,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatCard,
} from '../../../components';
import { useAuth, useData, useToast } from '../../../hooks';
import { cn, formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import type { Message } from '../../../types';
import { useParentChild } from '../hooks/useParentChild';
import { useParentSession } from '../hooks/parent-session';
import { SectionCard } from '../components/SectionCard';

interface RecipientOption {
  id: string;
  name: string;
  role: Message['to']['role'];
  subtitle: string;
}

/**
 * Every message lives in the shared in-memory db (plus the session list for the
 * current conversation), so nothing is persisted and everything resets on
 * reload — per the frontend-only contract.
 */
export default function MessagesPage() {
  const { currentUser } = useAuth();
  const { db } = useData();
  const { showToast } = useToast();
  const { child, classInfo } = useParentChild();
  const { sentMessages, sendMessage, markThreadRead } = useParentSession();

  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientId, setRecipientId] = useState('office');
  const [aboutStudentId, setAboutStudentId] = useState<string>(child?.id ?? '');
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});

  const myId = currentUser?.id ?? 'u-parent';

  /** Messages I sent or received (db + this session's sent list, de-duplicated). */
  const allMessages = useMemo(() => {
    const map = new Map<string, Message>();
    for (const message of db.messages) {
      if (message.from.id === myId || message.to.id === myId) map.set(message.id, message);
    }
    for (const message of sentMessages) map.set(message.id, message);
    return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.messages, sentMessages, myId]);

  const inbox = allMessages.filter((message) => message.to.id === myId);
  const outbox = allMessages.filter((message) => message.from.id === myId);
  const unread = inbox.filter((message) => !message.read);

  const selected = allMessages.find((message) => message.id === selectedId) ?? null;

  /**
   * Recipients are built from the live db: the school office (admin account),
   * the homeroom teacher, and every teacher of the child's class.
   */
  const recipients = useMemo<RecipientOption[]>(() => {
    const options: RecipientOption[] = [
      {
        id: 'office',
        name: 'دفتر مدرسه (مدیریت)',
        role: 'admin',
        subtitle: 'امور اداری، شهریه و مجوزها',
      },
    ];

    if (classInfo?.homeroomTeacher) {
      options.push({
        id: classInfo.homeroomTeacher.id,
        name: `${classInfo.homeroomTeacher.name} (مربی کلاس)`,
        role: 'teacher',
        subtitle: classInfo.homeroomTeacher.specialty,
      });
    }

    for (const { teacher, subjects } of classInfo?.teachers ?? []) {
      if (teacher.id === classInfo?.homeroomTeacher?.id) continue;
      options.push({
        id: teacher.id,
        name: teacher.name,
        role: 'teacher',
        subtitle: subjects.map((item) => item.name).join('، '),
      });
    }

    return options;
  }, [classInfo]);

  const openCompose = (prefillRecipient?: string) => {
    setSubject('');
    setBody('');
    setErrors({});
    setRecipientId(prefillRecipient ?? 'office');
    setAboutStudentId(child?.id ?? '');
    setComposeOpen(true);
  };

  const handleSend = () => {
    const nextErrors: { subject?: string; body?: string } = {};
    if (subject.trim().length < 3) nextErrors.subject = 'موضوع پیام را وارد کنید (حداقل ۳ نویسه).';
    if (body.trim().length < 10)
      nextErrors.body = 'متن پیام باید حداقل ۱۰ نویسه باشد تا برای مدرسه قابل پیگیری باشد.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const recipient = recipients.find((option) => option.id === recipientId);
    const resolvedName =
      recipient?.id === 'office'
        ? 'دفتر مدرسه'
        : (db.teachers.find((teacher) => teacher.id === recipientId)?.name ??
          recipient?.name ??
          'دفتر مدرسه');

    sendMessage({
      subject: subject.trim(),
      body: body.trim(),
      recipientId: recipientId === 'office' ? 'u-admin' : recipientId,
      recipientName: resolvedName,
      recipientRole: recipient?.role ?? 'admin',
      aboutStudentId: aboutStudentId || null,
    });

    setComposeOpen(false);
  };

  const handleOpenMessage = (message: Message) => {
    setSelectedId(message.id);
    if (message.to.id === myId && !message.read) {
      markThreadRead(message.id);
    }
  };

  return (
    <>
      <PageHeader
        title="پیام‌ها"
        description="مکاتبات با دفتر مدرسه و دبیران — همهٔ پیام‌ها فقط در همین نشست نگه داشته می‌شوند"
        breadcrumbs={[
          { label: 'مدرسه‌یار' },
          { label: 'پیشخوان اولیا', to: '/parent' },
          { label: 'پیام‌ها' },
        ]}
        actions={
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => openCompose()}>
            پیام جدید
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="پیام‌های دریافتی"
          value={toPersianDigits(inbox.length)}
          icon={Inbox}
          tone="primary"
          hint="از مدرسه و دبیران"
        />
        <StatCard
          title="خوانده‌نشده"
          value={toPersianDigits(unread.length)}
          icon={Mail}
          tone={unread.length > 0 ? 'warning' : 'success'}
          hint={unread.length > 0 ? 'نیازمند مطالعه' : 'همه خوانده شده'}
        />
        <StatCard
          title="پیام‌های ارسالی"
          value={toPersianDigits(outbox.length)}
          icon={Send}
          tone="info"
          hint="در این نشست"
        />
        <StatCard
          title="مخاطبان فعال"
          value={toPersianDigits(recipients.length)}
          icon={UserRound}
          tone="success"
          hint="دفتر مدرسه و دبیران"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Inbox / outbox list */}
        <div className="flex flex-col gap-4 xl:col-span-1">
          <SectionCard
            title="صندوق پیام‌ها"
            description={`${toPersianDigits(allMessages.length)} پیام`}
            icon={MessageSquare}
            flush
            action={
              <Button variant="ghost" size="sm" leftIcon={Plus} onClick={() => openCompose()}>
                جدید
              </Button>
            }
          >
            {allMessages.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Inbox}
                  title="پیامی وجود ندارد"
                  description="اولین پیام خود را برای دفتر مدرسه یا دبیران ارسال کنید."
                  actionLabel="نوشتن پیام"
                  onAction={() => openCompose()}
                />
              </div>
            ) : (
              <ul className="max-h-[560px] divide-y divide-border overflow-y-auto scrollbar-thin">
                {allMessages.map((message) => {
                  const isMine = message.from.id === myId;
                  const isUnread = message.to.id === myId && !message.read;
                  const isActive = message.id === selectedId;
                  const counterpart = isMine ? message.to : message.from;
                  return (
                    <li key={message.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenMessage(message)}
                        className={cn(
                          'flex w-full items-start gap-2.5 px-3 py-3 text-start transition-colors',
                          isActive ? 'bg-blue-50/70' : 'hover:bg-slate-50',
                        )}
                      >
                        <Avatar name={counterpart.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                'truncate text-[11.5px]',
                                isUnread ? 'font-extrabold text-text' : 'font-semibold text-text',
                              )}
                            >
                              {counterpart.name}
                            </p>
                            <span className="shrink-0 text-[9.5px] text-text-muted">
                              {formatRelativeTime(message.createdAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'truncate text-[11px]',
                              isUnread ? 'font-bold text-text' : 'text-text-muted',
                            )}
                          >
                            {message.subject}
                          </p>
                          <p className="line-clamp-1 text-[10px] text-text-muted">{message.body}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            {isMine ? (
                              <Badge variant="neutral" dot={false}>
                                ارسالی
                              </Badge>
                            ) : (
                              <Badge variant={isUnread ? 'warning' : 'success'} dot={false}>
                                {isUnread ? 'جدید' : 'خوانده‌شده'}
                              </Badge>
                            )}
                            {message.to.role === 'admin' || message.from.role === 'admin' ? (
                              <Badge variant="info" dot={false}>
                                دفتر مدرسه
                              </Badge>
                            ) : (
                              <Badge variant="primary" dot={false}>
                                دبیر
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Message detail */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <SectionCard
            title={selected ? selected.subject : 'متن پیام'}
            description={
              selected
                ? `از ${selected.from.name} به ${selected.to.name}`
                : 'برای مشاهدهٔ متن، یک پیام را از فهرست انتخاب کنید'
            }
            icon={selected ? MailOpen : Mail}
            action={
              selected ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={ArrowLeft}
                  onClick={() => openCompose(selected.from.role === 'teacher' ? selected.from.id : 'office')}
                >
                  پاسخ
                </Button>
              ) : undefined
            }
          >
            {!selected ? (
              <EmptyState
                icon={Mail}
                title="پیامی انتخاب نشده است"
                description="از فهرست صندوق پیام‌ها یک مورد را انتخاب کنید یا پیام جدیدی بنویسید."
                actionLabel="نوشتن پیام جدید"
                onAction={() => openCompose()}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-slate-50/60 p-3">
                  <Avatar name={selected.from.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-text">{selected.from.name}</p>
                    <p className="text-[10.5px] text-text-muted">
                      {selected.from.role === 'parent' ? 'ولی دانش‌آموز' : 'دبیر / مدرسه'} →{' '}
                      {selected.to.name}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-[10.5px] text-text-muted">
                      {formatJalali(selected.createdAt)}
                    </p>
                    <p className="text-[9.5px] text-text-muted">
                      {formatRelativeTime(selected.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-card border border-border p-3.5">
                  <p className="whitespace-pre-line text-[12.5px] leading-7 text-text">
                    {selected.body}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <CheckCheck size={13} className="text-success" aria-hidden="true" />
                    {selected.read ? 'این پیام خوانده شده است' : 'این پیام هنوز خوانده نشده است'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Send}
                      onClick={() =>
                        openCompose(
                          selected.from.role === 'teacher' ? selected.from.id : 'office',
                        )
                      }
                    >
                      پاسخ
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Paperclip}
                      onClick={() =>
                        showToast(
                          'info',
                          'در نسخهٔ نمایشی امکان ارسال پیوست وجود ندارد.',
                          'پیوست فایل',
                        )
                      }
                    >
                      پاسخ با پیوست
                    </Button>
                  </div>
                </div>

                {/* Thread context: every message exchanged with the same person */}
                <div className="rounded-card border border-dashed border-border p-3">
                  <p className="mb-2 text-[11px] font-bold text-text">سایر پیام‌های این مکاتبه</p>
                  <ul className="space-y-1.5">
                    {allMessages
                      .filter(
                        (message) =>
                          message.id !== selected.id &&
                          (message.from.id === selected.from.id ||
                            message.to.id === selected.from.id),
                      )
                      .slice(0, 3)
                      .map((message) => (
                        <li key={message.id}>
                          <button
                            type="button"
                            onClick={() => handleOpenMessage(message)}
                            className="flex w-full items-center justify-between gap-2 rounded-btn bg-slate-50 px-2.5 py-1.5 text-start transition-colors hover:bg-slate-100"
                          >
                            <span className="truncate text-[11px] font-semibold text-text">
                              {message.subject}
                            </span>
                            <span className="shrink-0 text-[9.5px] text-text-muted">
                              {formatRelativeTime(message.createdAt)}
                            </span>
                          </button>
                        </li>
                      ))}
                    {allMessages.filter(
                      (message) =>
                        message.id !== selected.id &&
                        (message.from.id === selected.from.id ||
                          message.to.id === selected.from.id),
                    ).length === 0 && (
                      <li className="text-[10.5px] text-text-muted">
                        پیام دیگری با این مخاطب وجود ندارد.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </SectionCard>

          <div className="flex items-start gap-2 rounded-card border border-blue-200 bg-blue-50/60 px-4 py-3">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-[11px] leading-6 text-blue-900">
              پیام‌های ارسالی شما فقط در حافظهٔ همین مرورگر و برای مدت این نشست نگه داشته می‌شوند؛
              هیچ داده‌ای به سرور ارسال یا ذخیره نمی‌شود و با بارگذاری مجدد صفحه پاک می‌شود.
            </p>
          </div>
        </div>
      </div>

      {/* Compose modal */}
      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="پیام جدید"
        description="ارسال پیام نمایشی به دفتر مدرسه یا دبیران"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setComposeOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" leftIcon={Send} onClick={handleSend}>
              ارسال پیام
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="گیرنده"
              required
              options={recipients.map((option) => ({
                value: option.id,
                label: option.name,
              }))}
              value={recipientId}
              onChange={(event) => setRecipientId(event.target.value)}
              hint={recipients.find((option) => option.id === recipientId)?.subtitle}
            />
            <Select
              label="دربارهٔ فرزند"
              options={[
                { value: '', label: 'موضوع عمومی' },
                ...(child ? [{ value: child.id, label: child.name }] : []),
              ]}
              value={aboutStudentId}
              onChange={(event) => setAboutStudentId(event.target.value)}
              hint="نام فرزند به ابتدای پیام افزوده می‌شود"
            />
          </div>

          <Input
            label="موضوع"
            required
            placeholder="مثال: پیگیری نمرهٔ میان‌ترم ریاضی"
            value={subject}
            error={errors.subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setErrors((prev) => ({ ...prev, subject: undefined }));
            }}
          />

          <div>
            <label htmlFor="parent-message-body" className="mb-1.5 block text-[13px] font-medium text-text">
              متن پیام <span className="ms-1 text-danger">*</span>
            </label>
            <textarea
              id="parent-message-body"
              rows={6}
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setErrors((prev) => ({ ...prev, body: undefined }));
              }}
              placeholder="سلام، لطفاً در مورد … راهنمایی بفرمایید."
              className={cn(
                'w-full resize-y rounded-input border bg-surface px-3.5 py-2.5 text-sm leading-7 text-text transition-shadow',
                'focus:outline-none focus:ring-4',
                errors.body
                  ? 'border-danger focus:border-danger focus:ring-red-100'
                  : 'border-border focus:border-primary focus:ring-blue-100',
              )}
            />
            {errors.body ? (
              <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
                {errors.body}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-text-muted">
                {toPersianDigits(body.trim().length)} نویسه — پیام شما در تاریخچهٔ مکاتبات ذخیره
                می‌شود.
              </p>
            )}
          </div>

          <p className="rounded-btn bg-amber-50 px-3 py-2 text-[10.5px] leading-5 text-amber-800">
            این ارسال شبیه‌سازی است: پیام در فهرست مکاتبات همین صفحه نمایش داده می‌شود و به هیچ
            سامانهٔ بیرونی ارسال نمی‌گردد.
          </p>
        </div>
      </Modal>
    </>
  );
}
