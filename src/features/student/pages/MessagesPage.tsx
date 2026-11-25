import { useMemo, useState, type FormEvent } from 'react';
import { CheckCheck, Inbox, MailOpen, MessageSquare, Plus, Send } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
} from '../../../components';
import { ROLE_LABELS, ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks';
import { cn, formatJalali, formatRelativeTime, toPersianDigits } from '../../../utils';
import type { Message } from '../../../types';
import { useStudentPortal } from '../hooks/useStudentPortal';

type BoxFilter = 'all' | 'inbox' | 'sent';

export default function MessagesPage() {
  const { currentUser, db, updateEntity, student, schedule } = useStudentPortal();
  const { showToast } = useToast();

  const [boxFilter, setBoxFilter] = useState<BoxFilter>('all');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  // Compose state
  const [recipientId, setRecipientId] = useState('u-teacher');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  const userId = currentUser?.id ?? 'u-student';

  const userMessages = useMemo(() => {
    return db.messages
      .filter(
        (m) =>
          m.to.id === userId ||
          m.from.id === userId ||
          (student && (m.to.id === student.id || m.from.id === student.id)),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.messages, userId, student]);

  const filteredMessages = useMemo(() => {
    return userMessages.filter((m) => {
      const isSent = m.from.id === userId || (student && m.from.id === student.id);
      if (boxFilter === 'sent') return Boolean(isSent);
      if (boxFilter === 'inbox') return !isSent;
      return true;
    });
  }, [userMessages, boxFilter, userId, student]);

  const recipientOptions = useMemo(() => {
    const classTeacherIds = new Set((schedule?.entries ?? []).map((e) => e.entry.teacherId));
    const teachers = db.teachers.filter((t) => classTeacherIds.has(t.id));
    return [
      { value: 'u-teacher', label: 'مریم کریمی — دبیر ریاضی و حسابان' },
      { value: 'u-admin', label: 'امیر قاسمی — مدیریت مدرسه' },
      ...teachers.map((t) => ({
        value: t.id,
        label: `${t.name} — دبیر ${t.specialty}`,
      })),
    ];
  }, [db.teachers, schedule]);

  const selectedMessage: Message | undefined =
    filteredMessages.find((m) => m.id === selectedMessageId) ?? filteredMessages[0];

  const unreadCount = userMessages.filter((m) => m.to.id === userId && !m.read).length;

  const markAsRead = (messageId: string) => {
    updateEntity('messages', (items) =>
      items.map((item) =>
        item.id === messageId && item.to.id === userId ? { ...item, read: true } : item,
      ),
    );
  };

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (subject.trim().length < 3 || body.trim().length < 8) {
      setFormError('لطفاً موضوع پیام (حداقل ۳ نویسه) و متن پیام (حداقل ۸ نویسه) را وارد کنید.');
      return;
    }

    const chosenOption = recipientOptions.find((o) => o.value === recipientId);
    const recipientName = chosenOption ? chosenOption.label.split('—')[0].trim() : 'کادر آموزشی';
    const recipientRole = recipientId === 'u-admin' ? 'admin' : 'teacher';

    const newMsg: Message = {
      id: `m-stu-${Date.now()}`,
      from: {
        id: userId,
        name: student?.name ?? currentUser?.name ?? 'دانش‌آموز',
        role: 'student',
      },
      to: {
        id: recipientId,
        name: recipientName,
        role: recipientRole,
      },
      subject: subject.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    updateEntity('messages', (items) => [newMsg, ...items]);
    setSelectedMessageId(newMsg.id);
    setSubject('');
    setBody('');
    setFormError(undefined);
    setComposeOpen(false);
    showToast('success', 'پیام شما برای دبیر / مدیریت ارسال شد.', 'ارسال پیام');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="پیام‌ها و ارتباط با دبیران"
        description="ارسال پرسش درسی یا اداری به دبیران و مدیریت مدرسه در محیط یکپارچه مدرسه‌یار"
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'پیام‌ها' }]}
        actions={
          <>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={CheckCheck}
                onClick={() => {
                  updateEntity('messages', (items) =>
                    items.map((m) => (m.to.id === userId ? { ...m, read: true } : m)),
                  );
                  showToast('success', 'همه پیام‌های دریافتی خوانده شدند.');
                }}
              >
                خواندن همه ({toPersianDigits(unreadCount)})
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => {
                setFormError(undefined);
                setComposeOpen(true);
              }}
            >
              پیام جدید به دبیر
            </Button>
          </>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-card border border-border bg-surface p-3 shadow-card">
        {[
          { id: 'all' as const, label: 'همه مکاتبات' },
          { id: 'inbox' as const, label: 'دریافتی' },
          { id: 'sent' as const, label: 'ارسالی من' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setBoxFilter(tab.id)}
            className={cn(
              'rounded-btn px-3.5 py-2 text-[12px] font-bold transition-colors',
              boxFilter === tab.id
                ? 'bg-primary text-white'
                : 'bg-background text-text-muted hover:bg-slate-100 hover:text-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Master-Detail Message View */}
      {filteredMessages.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="پیامی در این بخش وجود ندارد"
          description="می‌توانید سوال درسی یا درخواست خود را برای دبیران ارسال کنید."
          actionLabel="ارسال اولین پیام"
          onAction={() => setComposeOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Thread list */}
          <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card lg:col-span-5">
            <div className="divide-y divide-border">
              {filteredMessages.map((msg) => {
                const isSent = msg.from.id === userId;
                const counterpart = isSent ? msg.to : msg.from;
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = !isSent && !msg.read;

                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => {
                      setSelectedMessageId(msg.id);
                      if (isUnread) markAsRead(msg.id);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 p-4 text-start transition-colors',
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50',
                    )}
                  >
                    <Avatar name={counterpart.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-bold text-text">
                          {isSent ? `به: ${counterpart.name}` : counterpart.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-text-muted">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'mt-0.5 truncate text-[12px]',
                          isUnread ? 'font-bold text-primary' : 'font-semibold text-text',
                        )}
                      >
                        {msg.subject}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-text-muted">{msg.body}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail reader */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-card lg:col-span-7">
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={selectedMessage.from.id === userId ? 'info' : 'primary'}
                        dot={false}
                      >
                        {selectedMessage.from.id === userId ? 'پیام ارسالی شما' : 'پیام دریافتی'}
                      </Badge>
                      <Badge variant="neutral" dot={false}>
                        {
                          ROLE_LABELS[
                            selectedMessage.from.id === userId
                              ? selectedMessage.to.role
                              : selectedMessage.from.role
                          ]
                        }
                      </Badge>
                    </div>
                    <h2 className="mt-2 text-base font-extrabold text-text">
                      {selectedMessage.subject}
                    </h2>
                    <p className="mt-1 text-[12px] text-text-muted">
                      فرستنده: <strong className="text-text">{selectedMessage.from.name}</strong> •
                      گیرنده: <strong className="text-text">{selectedMessage.to.name}</strong>
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                    <MailOpen size={14} aria-hidden="true" />
                    {formatJalali(selectedMessage.createdAt)}
                  </span>
                </div>

                <p className="rounded-btn border border-border bg-background p-4 text-[13px] leading-8 text-text">
                  {selectedMessage.body}
                </p>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={MessageSquare}
                    onClick={() => {
                      const target =
                        selectedMessage.from.id === userId
                          ? selectedMessage.to
                          : selectedMessage.from;
                      setRecipientId(target.id);
                      setSubject(
                        selectedMessage.subject.startsWith('پاسخ:')
                          ? selectedMessage.subject
                          : `پاسخ: ${selectedMessage.subject}`,
                      );
                      setBody('');
                      setComposeOpen(true);
                    }}
                  >
                    ارسال پیام پیرو این موضوع
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="ارسال پیام جدید به کادر آموزشی"
        description="پیام شما در پایگاه داده مشترک (AppContext) ثبت شده و برای گیرنده قابل مشاهده خواهد بود."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setComposeOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" leftIcon={Send} onClick={handleSend}>
              ارسال پیام
            </Button>
          </>
        }
      >
        <form onSubmit={handleSend} className="space-y-4">
          <Select
            label="گیرنده پیام"
            required
            options={recipientOptions}
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />
          <Input
            label="موضوع پیام"
            required
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (formError) setFormError(undefined);
            }}
            placeholder="مثال: سوال درباره تمرین فصل سوم ریاضی"
          />
          <div>
            <label
              htmlFor="student-msg-body"
              className="mb-1.5 block text-[13px] font-medium text-text"
            >
              متن پیام <span className="text-danger">*</span>
            </label>
            <textarea
              id="student-msg-body"
              rows={4}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (formError) setFormError(undefined);
              }}
              placeholder="متن پیام خود را محترمانه و دقیق بنویسید…"
              className="w-full rounded-input border border-border bg-surface p-3 text-sm leading-6 text-text focus:border-primary focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>
          {formError && (
            <p role="alert" className="text-xs font-medium text-danger">
              {formError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
