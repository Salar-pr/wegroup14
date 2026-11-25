import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Info,
  Receipt,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  PageHeader,
  Select,
  StatCard,
  Table,
  type TableColumn,
} from '../../../components';
import { useData, useToast } from '../../../hooks';
import {
  cn,
  formatJalali,
  formatJalaliShort,
  formatRelativeTime,
  formatToman,
  toPersianDigits,
} from '../../../utils';
import type { Payment } from '../../../types';
import { useParentChild } from '../hooks/useParentChild';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_META,
  percentText,
} from '../lib/parentAnalytics';
import { PaymentBadge } from '../components/DomainBadge';
import { SectionCard } from '../components/SectionCard';

const STATUS_OPTIONS = [
  { value: 'all', label: 'همهٔ صورت‌حساب‌ها' },
  { value: 'paid', label: 'پرداخت‌شده' },
  { value: 'pending', label: 'در انتظار پرداخت' },
  { value: 'overdue', label: 'معوقه' },
];

export default function FinancePage() {
  const { db } = useData();
  const { showToast } = useToast();
  const { child, finance } = useParentChild();
  const [statusFilter, setStatusFilter] = useState('all');
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [payTarget, setPayTarget] = useState<Payment | null>(null);

  const rows = useMemo(() => {
    if (!finance) return [];
    if (statusFilter === 'all') return finance.payments;
    return finance.payments.filter((payment) => payment.status === statusFilter);
  }, [finance, statusFilter]);

  const columns: TableColumn<Payment>[] = [
    {
      key: 'title',
      header: 'عنوان صورت‌حساب',
      sortValue: (payment) => payment.title,
      render: (payment) => (
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-text">{payment.title}</p>
          <p className="text-[10px] text-text-muted">
            دانش‌آموز: {db.students.find((student) => student.id === payment.studentId)?.name ?? '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'مبلغ',
      sortValue: (payment) => payment.amount,
      render: (payment) => (
        <span className="text-[12px] font-bold text-text">{formatToman(payment.amount)}</span>
      ),
    },
    {
      key: 'dueDate',
      header: 'سررسید',
      sortValue: (payment) => payment.dueDate,
      render: (payment) => (
        <span
          className={cn(
            'text-[11.5px]',
            payment.status === 'overdue' ? 'font-bold text-danger' : 'text-text-muted',
          )}
        >
          {formatJalaliShort(payment.dueDate)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      sortValue: (payment) => payment.status,
      render: (payment) => <PaymentBadge status={payment.status} />,
    },
    {
      key: 'paidAt',
      header: 'پرداخت',
      render: (payment) =>
        payment.paidAt ? (
          <div>
            <p className="text-[11px] font-semibold text-text">
              {formatJalaliShort(payment.paidAt)}
            </p>
            <p className="text-[9.5px] text-text-muted">
              {payment.method ? PAYMENT_METHOD_LABELS[payment.method] : '—'}
            </p>
          </div>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        ),
    },
    {
      key: 'action',
      header: 'اقدام',
      align: 'center',
      render: (payment) =>
        payment.status === 'paid' ? (
          <Button
            variant="outline"
            size="sm"
            leftIcon={Receipt}
            aria-label={`مشاهدهٔ رسید ${payment.title}`}
            onClick={() => setReceipt(payment)}
          >
            رسید
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            leftIcon={CreditCard}
            aria-label={`پرداخت ${payment.title}`}
            onClick={() => setPayTarget(payment)}
          >
            پرداخت
          </Button>
        ),
    },
  ];

  if (!child || !finance) {
    return (
      <>
        <PageHeader title="شهریه و پرداخت" description="وضعیت مالی فرزند" />
        <EmptyState icon={Wallet} title="فرزندی به این حساب متصل نیست" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="شهریه و پرداخت"
        description={`وضعیت مالی ${child.name} — شهریه، پرداخت‌ها و مانده بدهی`}
        breadcrumbs={[
          { label: 'مدرسه‌یار' },
          { label: 'پیشخوان اولیا', to: '/parent' },
          { label: 'شهریه و پرداخت' },
        ]}
        actions={
          <Badge variant="info" dot={false}>
            <Info size={12} aria-hidden="true" />
            شبیه‌سازی نمایشی — بدون تراکنش واقعی
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="جمع کل شهریه"
          value={formatToman(finance.totalAmount)}
          icon={Receipt}
          tone="primary"
          hint={`${toPersianDigits(finance.payments.length)} صورت‌حساب`}
        />
        <StatCard
          title="پرداخت‌شده"
          value={formatToman(finance.paidAmount)}
          icon={BadgeCheck}
          tone="success"
          hint={`${toPersianDigits(finance.paidCount)} پرداخت موفق`}
        />
        <StatCard
          title="در انتظار پرداخت"
          value={formatToman(finance.pendingAmount)}
          icon={CalendarClock}
          tone="warning"
          hint={`${toPersianDigits(finance.pendingCount)} صورت‌حساب`}
        />
        <StatCard
          title="مانده بدهی"
          value={formatToman(finance.outstandingAmount)}
          icon={Wallet}
          tone={finance.outstandingAmount > 0 ? 'danger' : 'success'}
          hint={
            finance.overdueCount > 0
              ? `${toPersianDigits(finance.overdueCount)} مورد معوقه`
              : 'بدون مورد معوقه'
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Payment progress + next due */}
        <div className="flex flex-col gap-4">
          <SectionCard title="پیشرفت پرداخت" description="نسبت مبلغ پرداخت‌شده به کل شهریه" icon={Wallet}>
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90" aria-hidden="true">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(Math.min(100, finance.paidRatio) / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[15px] font-extrabold text-text">
                    {percentText(finance.paidRatio, 0)}
                  </span>
                  <span className="text-[9px] text-text-muted">پرداخت</span>
                </span>
              </div>
              <dl className="flex-1 space-y-1.5 text-[11.5px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">پرداخت‌شده</dt>
                  <dd className="font-bold text-success">{formatToman(finance.paidAmount)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">در انتظار</dt>
                  <dd className="font-bold text-warning">{formatToman(finance.pendingAmount)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">معوقه</dt>
                  <dd className="font-bold text-danger">{formatToman(finance.overdueAmount)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-border pt-1.5">
                  <dt className="text-text-muted">مانده کل</dt>
                  <dd className="font-extrabold text-text">
                    {formatToman(finance.outstandingAmount)}
                  </dd>
                </div>
              </dl>
            </div>
          </SectionCard>

          <SectionCard title="نزدیک‌ترین سررسید" icon={CalendarClock}>
            {finance.nextDue ? (
              <div className="rounded-btn border border-amber-200 bg-amber-50/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-bold text-text">
                      {finance.nextDue.title}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-text-muted">
                      سررسید: {formatJalali(finance.nextDue.dueDate)} (
                      {formatRelativeTime(finance.nextDue.dueDate)})
                    </p>
                  </div>
                  <PaymentBadge status={finance.nextDue.status} />
                </div>
                <p className="mt-2 text-[15px] font-extrabold text-text">
                  {formatToman(finance.nextDue.amount)}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="mt-2.5"
                  leftIcon={CreditCard}
                  onClick={() => setPayTarget(finance.nextDue ?? null)}
                >
                  پرداخت شهریه
                </Button>
              </div>
            ) : (
              <p className="rounded-btn bg-green-50 px-3 py-2.5 text-[11.5px] font-semibold text-green-800">
                همهٔ صورت‌حساب‌ها تسویه شده است. با تشکر از همراهی شما.
              </p>
            )}

            {finance.overdueCount > 0 && (
              <p className="mt-2 flex items-start gap-1.5 rounded-btn bg-red-50 px-3 py-2 text-[10.5px] leading-5 text-red-700">
                <TriangleAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                {toPersianDigits(finance.overdueCount)} صورت‌حساب معوقه دارید؛ برای جلوگیری از
                ایجاد وقفه در خدمات مدرسه، با امور مالی هماهنگ کنید.
              </p>
            )}
          </SectionCard>

          <SectionCard title="اطلاعات مهم" icon={Info}>
            <ul className="space-y-2 text-[10.5px] leading-5 text-text-muted">
              <li>• این صفحه فقط یک شبیه‌سازی نمایشی است و هیچ تراکنش واقعی انجام نمی‌شود.</li>
              <li>• مبالغ به تومان نمایش داده شده و از سامانهٔ مالی مدرسه خوانده می‌شوند.</li>
              <li>• با بارگذاری مجدد صفحه، تغییرات این نشست پاک می‌شود.</li>
            </ul>
          </SectionCard>
        </div>

        {/* Invoice table + history */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <SectionCard
            title="صورت‌حساب‌ها"
            description="همهٔ شهریه‌ها، خدماتی و هزینه‌های ثبت‌شده"
            icon={Receipt}
          >
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div className="w-full sm:max-w-[240px]">
                <Select
                  label="فیلتر وضعیت"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                />
              </div>
              <p className="pb-1 text-[11px] text-text-muted">
                نمایش {toPersianDigits(rows.length)} از {toPersianDigits(finance.payments.length)} صورت‌حساب
              </p>
            </div>
            {rows.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="صورت‌حسابی با این وضعیت وجود ندارد"
                actionLabel="نمایش همه"
                onAction={() => setStatusFilter('all')}
              />
            ) : (
              <Table<Payment>
                data={rows}
                rowKey={(payment) => payment.id}
                columns={columns}
                caption="صورت‌حساب‌های شهریه"
                pageSize={6}
              />
            )}
          </SectionCard>

          <SectionCard
            title="تاریخچهٔ پرداخت‌ها"
            description="پرداخت‌های موفق انجام‌شده"
            icon={BadgeCheck}
            flush
          >
            {finance.history.length === 0 ? (
              <p className="px-4 py-4 text-[11.5px] text-text-muted">
                هنوز پرداختی ثبت نشده است.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {finance.history.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-text">{payment.title}</p>
                      <p className="text-[10.5px] text-text-muted">
                        {payment.paidAt ? formatJalali(payment.paidAt) : '—'}
                        {payment.method ? ` · ${PAYMENT_METHOD_LABELS[payment.method]}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-success">
                        {formatToman(payment.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Receipt}
                        onClick={() => setReceipt(payment)}
                      >
                        رسید
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Payment simulation modal */}
      <Modal
        open={payTarget !== null}
        onClose={() => setPayTarget(null)}
        title="پرداخت شهریه (شبیه‌سازی)"
        description="این پنجره فقط برای نمایش تجربهٔ کاربری است؛ هیچ درگاه پرداخت واقعی متصل نیست."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayTarget(null)}>
              انصراف
            </Button>
            <Button
              variant="primary"
              leftIcon={CreditCard}
              onClick={() => {
                showToast(
                  'info',
                  'این نسخهٔ نمایشی است؛ پرداخت واقعی انجام نشد و هیچ مبلغی کسر نگردید.',
                  'شبیه‌سازی پرداخت',
                );
                setPayTarget(null);
              }}
            >
              تأیید و پرداخت
            </Button>
          </>
        }
      >
        {payTarget && (
          <div className="space-y-2.5 text-[12px]">
            <div className="rounded-btn bg-slate-50 px-3 py-2.5">
              <div className="flex justify-between gap-2">
                <span className="text-text-muted">عنوان</span>
                <span className="font-bold text-text">{payTarget.title}</span>
              </div>
              <div className="mt-1.5 flex justify-between gap-2">
                <span className="text-text-muted">مبلغ قابل پرداخت</span>
                <span className="font-extrabold text-text">{formatToman(payTarget.amount)}</span>
              </div>
              <div className="mt-1.5 flex justify-between gap-2">
                <span className="text-text-muted">سررسید</span>
                <span className="font-semibold text-text">{formatJalali(payTarget.dueDate)}</span>
              </div>
              <div className="mt-1.5 flex justify-between gap-2">
                <span className="text-text-muted">وضعیت</span>
                <PaymentBadge status={payTarget.status} />
              </div>
            </div>
            <p className="rounded-btn bg-amber-50 px-3 py-2 text-[10.5px] leading-5 text-amber-800">
              در نسخهٔ نمایشی، وضعیت پرداخت تغییر نمی‌کند و مبلغی از حساب شما کسر نمی‌شود. برای
              پرداخت واقعی به دفتر مدرسه مراجعه کنید.
            </p>
          </div>
        )}
      </Modal>

      {/* Receipt modal */}
      <Modal
        open={receipt !== null}
        onClose={() => setReceipt(null)}
        title="رسید پرداخت"
        description="نمای نمایشی رسید — فاقد اعتبار رسمی"
        size="sm"
        footer={
          <Button variant="ghost" onClick={() => setReceipt(null)}>
            بستن
          </Button>
        }
      >
        {receipt && (
          <div className="space-y-2 text-[12px]">
            <div className="rounded-card border border-dashed border-border p-3">
              <p className="text-center text-[13px] font-extrabold text-text">مدرسه‌یار</p>
              <p className="text-center text-[10px] text-text-muted">
                دبیرستان نمونه دولتی شهید بهشتی
              </p>
              <dl className="mt-3 space-y-1.5 border-t border-border pt-2.5">
                <Row label="شماره رسید" value={toPersianDigits(receipt.id.toUpperCase())} />
                <Row
                  label="دانش‌آموز"
                  value={db.students.find((student) => student.id === receipt.studentId)?.name ?? '—'}
                />
                <Row label="بابت" value={receipt.title} />
                <Row label="مبلغ" value={formatToman(receipt.amount)} />
                <Row
                  label="تاریخ پرداخت"
                  value={receipt.paidAt ? formatJalali(receipt.paidAt) : '—'}
                />
                <Row
                  label="روش پرداخت"
                  value={receipt.method ? PAYMENT_METHOD_LABELS[receipt.method] : '—'}
                />
                <Row label="وضعیت" value={PAYMENT_STATUS_META[receipt.status].label} />
              </dl>
            </div>
            <p className="text-center text-[10px] text-text-muted">
              این رسید صرفاً برای نمایش رابط کاربری تولید شده است.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-end font-semibold text-text">{value}</dd>
    </div>
  );
}
