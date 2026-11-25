/**
 * Admin feature — finance / tuition (مدیریت شهریه).
 * Shows tuition totals, paid / unpaid amounts, outstanding balances,
 * a per-student balance table and the full payment history. Payments can
 * be marked as settled from the UI (runtime memory only).
 */
import { useMemo, useState } from 'react';
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  CreditCard,
  Receipt,
  Search,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
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
import { getStudentById } from '../../../data';
import { formatJalali, formatToman, toPersianDigits } from '../../../utils';
import type { Payment, PaymentStatus } from '../../../types';
import { PaymentModal } from '../components/PaymentModal';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, todayISO } from '../lib/labels';
import { financeSummary } from '../lib/stats';

interface StudentBalance {
  studentId: string;
  name: string;
  avatarColor: string;
  total: number;
  paid: number;
  outstanding: number;
  invoices: number;
}

export default function FinancePage() {
  const { db, updateEntity } = useData();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'balances' | 'history'>('balances');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paying, setPaying] = useState<Payment | null>(null);

  const summary = useMemo(() => financeSummary(db), [db]);

  const balances = useMemo<StudentBalance[]>(() => {
    const map = new Map<string, StudentBalance>();
    for (const payment of db.payments) {
      const student = getStudentById(db, payment.studentId);
      const current = map.get(payment.studentId) ?? {
        studentId: payment.studentId,
        name: student?.name ?? 'دانش‌آموز',
        avatarColor: student?.avatarColor ?? '#2563EB',
        total: 0,
        paid: 0,
        outstanding: 0,
        invoices: 0,
      };
      current.total += payment.amount;
      current.invoices += 1;
      if (payment.status === 'paid') current.paid += payment.amount;
      else current.outstanding += payment.amount;
      map.set(payment.studentId, current);
    }
    const q = query.trim();
    return [...map.values()]
      .filter((row) => q === '' || row.name.includes(q))
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [db, query]);

  const payments = useMemo(() => {
    const q = query.trim();
    return [...db.payments]
      .filter((payment) => (statusFilter === 'all' ? true : payment.status === statusFilter))
      .filter((payment) => {
        if (q === '') return true;
        const student = getStudentById(db, payment.studentId);
        return payment.title.includes(q) || (student?.name.includes(q) ?? false);
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [db, query, statusFilter]);

  const handlePaid = (method: Payment['method'], paidAt: string) => {
    if (!paying) return;
    updateEntity('payments', (items) =>
      items.map((item) =>
        item.id === paying.id ? { ...item, status: 'paid', method, paidAt } : item,
      ),
    );
    const student = getStudentById(db, paying.studentId);
    showToast(
      'success',
      `پرداخت ${formatToman(paying.amount)} برای «${student?.name ?? 'دانش‌آموز'}» ثبت شد.`,
      'ثبت پرداخت',
    );
    setPaying(null);
  };

  const balanceColumns: TableColumn<StudentBalance>[] = [
    {
      key: 'name',
      header: 'دانش‌آموز',
      sortValue: (row) => row.name,
      render: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={row.name} color={row.avatarColor} size="sm" />
          <span>
            <span className="block font-bold">{row.name}</span>
            <span className="block text-[11px] text-text-muted">
              {toPersianDigits(row.invoices)} صورتحساب
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'total',
      header: 'کل شهریه',
      align: 'end',
      sortValue: (row) => row.total,
      render: (row) => formatToman(row.total),
    },
    {
      key: 'paid',
      header: 'پرداخت‌شده',
      align: 'end',
      sortValue: (row) => row.paid,
      render: (row) => <span className="font-bold text-green-700">{formatToman(row.paid)}</span>,
    },
    {
      key: 'outstanding',
      header: 'بدهی باقی‌مانده',
      align: 'end',
      sortValue: (row) => row.outstanding,
      render: (row) =>
        row.outstanding > 0 ? (
          <span className="font-bold text-red-700">{formatToman(row.outstanding)}</span>
        ) : (
          <Badge variant="success">تسویه شده</Badge>
        ),
    },
    {
      key: 'progress',
      header: 'درصد پرداخت',
      align: 'center',
      sortValue: (row) => row.paid / (row.total || 1),
      render: (row) => {
        const percent = row.total > 0 ? Math.round((row.paid / row.total) * 100) : 0;
        return (
          <span className="inline-flex min-w-[100px] flex-col items-center gap-1">
            <span className="text-[12px] font-bold">{toPersianDigits(percent)}٪</span>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <span
                className={`block h-full rounded-full ${
                  percent >= 100 ? 'bg-success' : percent >= 50 ? 'bg-primary' : 'bg-warning'
                }`}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </span>
          </span>
        );
      },
    },
  ];

  const paymentColumns: TableColumn<Payment>[] = [
    {
      key: 'student',
      header: 'دانش‌آموز',
      sortValue: (p) => getStudentById(db, p.studentId)?.name ?? '',
      render: (p) => {
        const student = getStudentById(db, p.studentId);
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
      key: 'title',
      header: 'عنوان',
      sortValue: (p) => p.title,
      render: (p) => p.title,
    },
    {
      key: 'amount',
      header: 'مبلغ',
      align: 'end',
      sortValue: (p) => p.amount,
      render: (p) => formatToman(p.amount),
    },
    {
      key: 'dueDate',
      header: 'سررسید',
      sortValue: (p) => p.dueDate,
      render: (p) => formatJalali(p.dueDate),
    },
    {
      key: 'paidAt',
      header: 'تاریخ پرداخت',
      render: (p) => (p.paidAt ? formatJalali(p.paidAt) : '—'),
    },
    {
      key: 'method',
      header: 'روش',
      render: (p) => (p.method ? PAYMENT_METHOD_LABELS[p.method] : '—'),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (p) => (
        <Badge variant={PAYMENT_STATUS_LABELS[p.status].variant}>
          {PAYMENT_STATUS_LABELS[p.status].label}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'end',
      render: (p) =>
        p.status === 'paid' ? (
          <span className="text-[11px] text-text-muted">تسویه شده</span>
        ) : (
          <Button
            variant="success"
            size="sm"
            leftIcon={CreditCard}
            onClick={() => setPaying(p)}
            aria-label={`ثبت پرداخت ${p.title}`}
          >
            ثبت پرداخت
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="مدیریت مالی و شهریه"
        description="مشاهده شهریه، مبالغ پرداخت‌شده و بدهی‌های باقی‌مانده دانش‌آموزان"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'شهریه' }]}
        actions={
          <Badge variant={summary.overdue > 0 ? 'danger' : 'success'} dot>
            {summary.overdue > 0
              ? `${toPersianDigits(summary.overdueCount)} صورتحساب معوق`
              : 'همه صورتحساب‌ها به‌روز'}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="کل شهریه"
          value={formatToman(summary.total)}
          icon={Wallet}
          tone="primary"
          hint={`${toPersianDigits(db.payments.length)} صورتحساب`}
        />
        <StatCard
          title="پرداخت‌شده"
          value={formatToman(summary.paid)}
          icon={BanknoteArrowDown}
          tone="success"
          hint={`${toPersianDigits(summary.paidCount)} پرداخت`}
        />
        <StatCard
          title="در انتظار پرداخت"
          value={formatToman(summary.pending)}
          icon={BanknoteArrowUp}
          tone="warning"
          hint={`${toPersianDigits(summary.pendingCount)} صورتحساب`}
        />
        <StatCard
          title="بدهی معوق"
          value={formatToman(summary.overdue)}
          icon={TriangleAlert}
          tone="danger"
          hint={`${toPersianDigits(summary.overdueCount)} صورتحساب`}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-btn border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab('balances')}
            className={`rounded-[8px] px-4 py-2 text-[13px] font-bold transition-colors ${
              tab === 'balances' ? 'bg-primary text-white' : 'text-text-muted hover:text-text'
            }`}
          >
            بدهی دانش‌آموزان
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`rounded-[8px] px-4 py-2 text-[13px] font-bold transition-colors ${
              tab === 'history' ? 'bg-primary text-white' : 'text-text-muted hover:text-text'
            }`}
          >
            تاریخچه پرداخت‌ها
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px] md:w-[480px]">
          <Input
            placeholder="جست‌وجو با نام دانش‌آموز یا عنوان…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={Search}
            aria-label="جست‌وجوی مالی"
          />
          {tab === 'history' && (
            <Select
              aria-label="فیلتر وضعیت پرداخت"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'همه وضعیت‌ها' },
                ...(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => ({
                  value: status,
                  label: PAYMENT_STATUS_LABELS[status].label,
                })),
              ]}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        {tab === 'balances' ? (
          <Table<StudentBalance>
            data={balances}
            rowKey={(row) => row.studentId}
            caption="بدهی دانش‌آموزان"
            columns={balanceColumns}
            pageSize={8}
            emptyTitle="صورتحسابی ثبت نشده است"
            emptyDescription="پس از صدور صورتحساب، بدهی دانش‌آموزان اینجا نمایش داده می‌شود."
            emptyIcon={Wallet}
          />
        ) : (
          <Table<Payment>
            data={payments}
            rowKey={(p) => p.id}
            caption="تاریخچه پرداخت‌ها"
            columns={paymentColumns}
            pageSize={8}
            emptyTitle="پرداختی یافت نشد"
            emptyDescription="فیلتر وضعیت یا عبارت جست‌وجو را تغییر دهید."
            emptyIcon={Receipt}
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h2 className="text-[14px] font-extrabold text-text">خلاصه مالی</h2>
          <dl className="mt-3 flex flex-col gap-2 text-[13px]">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <dt className="text-text-muted">مجموع دریافتی</dt>
              <dd className="font-bold text-green-700">{formatToman(summary.paid)}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <dt className="text-text-muted">مجموع بدهی (در انتظار + معوق)</dt>
              <dd className="font-bold text-red-700">{formatToman(summary.outstanding)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-muted">نرخ وصول</dt>
              <dd className="font-bold text-primary">
                {toPersianDigits(summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0)}٪
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h2 className="text-[14px] font-extrabold text-text">اقساط نزدیک به سررسید</h2>
          <ul className="mt-3 flex flex-col gap-2 text-[13px]">
            {db.payments
              .filter((p) => p.status !== 'paid')
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .slice(0, 4)
              .map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-text">
                      {getStudentById(db, payment.studentId)?.name ?? '—'}
                    </span>
                    <span className="block text-[11px] text-text-muted">
                      {payment.title} • {formatJalali(payment.dueDate)}
                      {payment.dueDate < todayISO() ? ' (معوق)' : ''}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-text">{formatToman(payment.amount)}</span>
                </li>
              ))}
            {db.payments.filter((p) => p.status !== 'paid').length === 0 && (
              <li className="py-4 text-center text-[12px] text-text-muted">
                صورتحساب پرداخت‌نشده‌ای وجود ندارد.
              </li>
            )}
          </ul>
        </div>
      </div>

      <PaymentModal payment={paying} onClose={() => setPaying(null)} onConfirm={handlePaid} />
    </>
  );
}
