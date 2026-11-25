import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Wallet, GraduationCap } from 'lucide-react';
import { Avatar, Badge, EmptyState, Input, PageHeader, StatCard } from '../../../components';
import { useData } from '../../../hooks';
import { formatToman, toPersianDigits } from '../../../utils';

export default function ParentsPage() {
  const { db } = useData();
  const [query, setQuery] = useState('');
  const q = query.trim();
  const families = db.parents.filter(
    (parent) =>
      parent.name.includes(q) ||
      parent.phone.includes(q) ||
      db.students.some(
        (student) => parent.studentIds.includes(student.id) && student.name.includes(q),
      ),
  );
  const withDebt = db.parents.filter((parent) =>
    db.payments.some(
      (bill) => parent.studentIds.includes(bill.studentId) && bill.status !== 'paid',
    ),
  ).length;
  const linked = new Set(db.parents.flatMap((parent) => parent.studentIds)).size;

  return (
    <>
      <PageHeader
        title="خانواده‌ها"
        description="اطلاعات اولیا، فرزندان مرتبط و وضعیت شهریه در همین نسخه نمایشی"
        breadcrumbs={[{ label: 'مدرسه‌یار' }, { label: 'اولیا' }]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="خانواده‌های ثبت‌شده"
          value={toPersianDigits(db.parents.length)}
          icon={Users}
        />
        <StatCard
          title="فرزندان مرتبط"
          value={toPersianDigits(linked)}
          icon={GraduationCap}
          tone="info"
        />
        <StatCard
          title="خانواده‌های دارای بدهی"
          value={toPersianDigits(withDebt)}
          icon={Wallet}
          tone="warning"
        />
      </div>
      <div className="my-5 max-w-md">
        <Input
          aria-label="جست‌وجوی خانواده‌ها"
          placeholder="نام ولی، شماره تماس یا نام فرزند…"
          leftIcon={Search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {families.length === 0 ? (
        <EmptyState
          icon={Users}
          title="خانواده‌ای پیدا نشد"
          description="عبارت دیگری را جست‌وجو کنید."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {families.map((parent) => {
            const children = db.students.filter((student) =>
              parent.studentIds.includes(student.id),
            );
            const outstanding = db.payments
              .filter(
                (bill) => parent.studentIds.includes(bill.studentId) && bill.status !== 'paid',
              )
              .reduce((sum, bill) => sum + bill.amount, 0);
            const relation =
              parent.relation === 'mother'
                ? 'مادر'
                : parent.relation === 'father'
                  ? 'پدر'
                  : 'سرپرست';

            return (
              <article
                key={parent.id}
                className="rounded-card border border-border bg-surface p-5 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={parent.name} color={parent.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-text">{parent.name}</h2>
                    <p className="text-xs text-text-muted">
                      {relation} · {parent.occupation}
                    </p>
                    <a
                      href={`tel:${parent.phone}`}
                      dir="ltr"
                      className="mt-1 inline-block text-xs text-primary hover:underline"
                    >
                      {toPersianDigits(parent.phone)}
                    </a>
                  </div>
                  <Badge variant={outstanding > 0 ? 'warning' : 'success'}>
                    {outstanding > 0 ? 'مانده' : 'تسویه'}
                  </Badge>
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-2 text-xs font-bold text-text">فرزندان</p>
                  {children.length === 0 ? (
                    <p className="text-xs text-text-muted">پرونده دانش‌آموزی مرتبط پیدا نشد.</p>
                  ) : (
                    <ul className="space-y-2">
                      {children.map((student) => (
                        <li key={student.id} className="flex justify-between gap-2 text-xs">
                          <span className="font-medium text-text">{student.name}</span>
                          <span className="text-text-muted">
                            {student.gradeLevel} {student.field}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                  <span className="text-text-muted">مانده شهریه: {formatToman(outstanding)}</span>
                  <Link to="/admin/students" className="font-bold text-primary hover:underline">
                    پرونده‌ها
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
