import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  FileCheck2,
  NotebookPen,
  Paperclip,
  Search,
  Send,
  UserRound,
} from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatCard,
} from '../../../components';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks';
import { cn, formatJalali, toPersianDigits } from '../../../utils';
import { HomeworkSubmissionModal } from '../components/HomeworkSubmissionModal';
import { useStudentPortal } from '../hooks/useStudentPortal';
import {
  HOMEWORK_STATUS_META,
  formatPersianDecimal,
  scoreOutOf20,
  type EnrichedHomework,
} from '../lib/studentAnalytics';

type FilterTab = 'all' | 'pending_group' | 'submitted_group' | 'overdue';

export default function HomeworkPage() {
  const { student, dossier, homeworkList, session } = useStudentPortal();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<EnrichedHomework | null>(null);

  const subjectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of homeworkList) {
      map.set(item.homework.subjectId, item.subjectName);
    }
    return [
      { value: 'all', label: 'همه دروس' },
      ...[...map.entries()].map(([value, label]) => ({ value, label })),
    ];
  }, [homeworkList]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim();
    return homeworkList.filter((item) => {
      if (activeTab === 'pending_group') {
        if (item.status === 'submitted' || item.status === 'graded') return false;
      } else if (activeTab === 'submitted_group') {
        if (item.status !== 'submitted' && item.status !== 'graded') return false;
      } else if (activeTab === 'overdue') {
        if (item.status !== 'overdue') return false;
      }

      if (subjectFilter !== 'all' && item.homework.subjectId !== subjectFilter) {
        return false;
      }

      if (
        q &&
        !item.homework.title.includes(q) &&
        !item.homework.description.includes(q) &&
        !item.subjectName.includes(q)
      ) {
        return false;
      }

      return true;
    });
  }, [homeworkList, activeTab, subjectFilter, searchQuery]);

  if (!student || !dossier) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="تکلیفی یافت نشد"
        description="اطلاعات کلاس شما در سامانه یافت نشد."
      />
    );
  }

  const totalCount = homeworkList.length;
  const completedCount = homeworkList.filter(
    (h) => h.status === 'submitted' || h.status === 'graded',
  ).length;
  const pendingCount = homeworkList.filter(
    (h) => h.status === 'pending' || h.status === 'due_soon',
  ).length;
  const overdueCount = homeworkList.filter((h) => h.status === 'overdue').length;

  const tabs: Array<{ id: FilterTab; label: string; count: number }> = [
    { id: 'all', label: 'همه تکالیف', count: totalCount },
    { id: 'pending_group', label: 'در انتظار ارسال', count: pendingCount + overdueCount },
    { id: 'submitted_group', label: 'تحویل‌داده‌شده / نمره‌دار', count: completedCount },
    { id: 'overdue', label: 'مهلت گذشته', count: overdueCount },
  ];

  // Keep modal synchronized with live state if open
  const liveSelectedItem = selectedItem
    ? (homeworkList.find((h) => h.homework.id === selectedItem.homework.id) ?? null)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="تکالیف و پروژه‌های کلاسی"
        description={`مشاهده شرح کامل تکالیف ${dossier.schoolClass?.name ?? ''}، مهلت تحویل و ارسال شبیه‌سازی‌شده پاسخ`}
        breadcrumbs={[{ label: 'مدرسه‌یار', to: ROUTES.STUDENT }, { label: 'تکالیف من' }]}
      />

      {/* 4 KPI StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل تکالیف کلاس"
          value={`${toPersianDigits(totalCount)} مورد`}
          icon={NotebookPen}
          tone="primary"
          hint={`کلاس ${dossier.schoolClass?.name ?? ''}`}
        />
        <StatCard
          title="تحویل‌داده‌شده"
          value={`${toPersianDigits(completedCount)} مورد`}
          icon={CheckCircle2}
          tone="success"
          hint={
            totalCount > 0
              ? `${toPersianDigits(Math.round((completedCount / totalCount) * 100))}٪ تکمیل‌شده`
              : undefined
          }
        />
        <StatCard
          title="در انتظار انجام"
          value={`${toPersianDigits(pendingCount)} مورد`}
          icon={Calendar}
          tone={pendingCount > 0 ? 'warning' : 'info'}
          hint="در مهلت قانونی تحویل"
        />
        <StatCard
          title="مهلت گذشته"
          value={`${toPersianDigits(overdueCount)} مورد`}
          icon={AlertTriangle}
          tone={overdueCount > 0 ? 'danger' : 'success'}
          hint={overdueCount > 0 ? 'نیازمند پیگیری فوری' : 'بدون تکلیف عقب‌افتاده'}
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-btn px-3.5 py-2 text-[12px] font-bold transition-colors',
                  active
                    ? 'bg-primary text-white shadow-sm'
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
              aria-label="جستجوی تکالیف"
              leftIcon={Search}
              placeholder="جستجو در عنوان تکلیف، شرح یا نام درس…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-4">
            <Select
              aria-label="فیلتر درس تکالیف"
              options={subjectOptions}
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Homework Cards List */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="تکلیفی با این مشخصات یافت نشد"
          description="فیلتر وضعیت یا درس را تغییر دهید تا سایر تکالیف نمایش داده شوند."
          actionLabel="نمایش همه تکالیف"
          onAction={() => {
            setActiveTab('all');
            setSubjectFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredList.map((item) => {
            const meta = HOMEWORK_STATUS_META[item.status];
            const isSubmitted = item.status === 'submitted' || item.status === 'graded';

            const remainingLabel =
              item.status === 'graded'
                ? 'نمره ثبت شده'
                : item.status === 'submitted'
                  ? 'تحویل داده شده'
                  : item.daysRemaining < 0
                    ? `${toPersianDigits(Math.abs(item.daysRemaining))} روز تأخیر`
                    : item.daysRemaining === 0
                      ? 'تحویل تا پایان امروز'
                      : `${toPersianDigits(item.daysRemaining)} روز فرصت باقی‌مانده`;

            return (
              <article
                key={item.homework.id}
                className="flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-cardHover"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" dot={false}>
                        {item.subjectName}
                      </Badge>
                      <Badge variant={meta.badge}>{meta.label}</Badge>
                    </div>
                    <span className="text-[11px] font-bold text-text-muted">
                      بارم: {toPersianDigits(item.homework.maxScore)} نمره
                    </span>
                  </div>

                  <h2 className="mt-3 text-[16px] font-extrabold text-text">
                    {item.homework.title}
                  </h2>

                  <p className="mt-1.5 text-[13px] leading-6 text-text-muted">
                    {item.homework.description}
                  </p>

                  {/* Submitted preview box */}
                  {item.simulatedSubmission && (
                    <div className="mt-3 rounded-btn border border-blue-200 bg-blue-50/50 p-3 text-[12px]">
                      <p className="flex items-center gap-1.5 font-bold text-primary-navy">
                        <FileCheck2 size={14} className="text-primary" aria-hidden="true" />
                        پاسخ ارسالی شما:
                      </p>
                      <p className="mt-1 line-clamp-2 text-text">
                        {item.simulatedSubmission.answerText}
                      </p>
                      {item.simulatedSubmission.attachmentName && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <Paperclip size={11} aria-hidden="true" />
                          {item.simulatedSubmission.attachmentName}
                        </p>
                      )}
                    </div>
                  )}

                  {item.recordedGrade && (
                    <div className="mt-3 flex items-center justify-between rounded-btn border border-green-200 bg-green-50/60 px-3 py-2 text-[12px]">
                      <span className="font-bold text-green-800">نمره ثبت‌شده در دفتر نمرات:</span>
                      <strong className="font-extrabold text-success">
                        {formatPersianDecimal(scoreOutOf20(item.recordedGrade))} از ۲۰
                      </strong>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
                  <div className="text-[11px] text-text-muted">
                    <p className="flex items-center gap-1.5">
                      <UserRound size={12} aria-hidden="true" />
                      دبیر: <strong className="text-text">{item.teacherName}</strong>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5">
                      <Calendar size={12} aria-hidden="true" />
                      مهلت:{' '}
                      <strong className="text-text">
                        {formatJalali(item.homework.dueDate)}
                      </strong>{' '}
                      <span>({remainingLabel})</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isSubmitted ? 'outline' : 'primary'}
                      size="sm"
                      leftIcon={isSubmitted ? Eye : Send}
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.status === 'graded'
                        ? 'مشاهده جزئیات'
                        : item.status === 'submitted'
                          ? 'مشاهده / ویرایش پاسخ'
                          : 'ثبت و ارسال تکلیف'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Submission & Details Modal */}
      <HomeworkSubmissionModal
        item={liveSelectedItem}
        open={liveSelectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onSubmit={(payload) => {
          session.submitHomework(payload);
          showToast(
            'success',
            'تکلیف شما با موفقیت ثبت شد (ذخیره موقت در حافظه نشست).',
            'ارسال موفق',
          );
        }}
        onWithdraw={(homeworkId) => {
          session.withdrawHomework(homeworkId);
          showToast('info', 'ارسال تکلیف لغو شد و به حالت در انتظار بازگشت.');
        }}
      />
    </div>
  );
}
