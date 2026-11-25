import { Link } from 'react-router-dom';
import { CalendarCheck2, GraduationCap, MessageSquare, NotebookPen, Wallet } from 'lucide-react';
import { useAuth, useData } from '../../../hooks';
import { cn, toPersianDigits } from '../../../utils';
import { ROUTES } from '../../../constants';
import { useParentChild } from '../hooks/useParentChild';
import { percentText, scoreText } from '../lib/parentAnalytics';
import { ChildSelector } from './ChildSelector';

const QUICK_LINKS = [
  { to: `${ROUTES.PARENT}/grades`, label: 'نمرات', icon: GraduationCap },
  { to: `${ROUTES.PARENT}/attendance`, label: 'حضور', icon: CalendarCheck2 },
  { to: `${ROUTES.PARENT}/homework`, label: 'تکالیف', icon: NotebookPen },
  { to: `${ROUTES.PARENT}/payments`, label: 'شهریه', icon: Wallet },
  { to: `${ROUTES.PARENT}/messages`, label: 'پیام‌ها', icon: MessageSquare },
];

/**
 * Persistent context bar above every parent page:
 * which child is in focus, their headline numbers, and quick links.
 * Keeps the child selection visible and switchable from anywhere.
 */
export function ParentTopbar() {
  const { currentUser } = useAuth();
  const { db } = useData();
  const { children, child, academic, attendance, finance } = useParentChild();

  if (!child || !academic || !attendance || !finance) return null;

  const unread = db.messages.filter(
    (message) => message.to.id === currentUser?.id && !message.read,
  ).length;

  return (
    <div className="mb-4 rounded-card border border-border bg-surface p-2.5 shadow-card sm:p-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <ChildSelector
          children={children}
          classes={db.classes}
          className="w-full sm:w-auto sm:min-w-[240px]"
        />

        {/* Focused child headline numbers */}
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          <Chip label="معدل" value={scoreText(academic.overallAverage)} tone="success" />
          <Chip
            label="حضور"
            value={percentText(attendance.rate, 0)}
            tone={attendance.rate >= 90 ? 'success' : attendance.rate >= 75 ? 'warning' : 'danger'}
          />
          <Chip
            label="بدهی"
            value={
              finance.outstandingAmount === 0
                ? 'تسویه'
                : `${toPersianDigits(Math.round(finance.outstandingAmount / 1000))} هزار`
            }
            tone={finance.outstandingAmount === 0 ? 'success' : 'danger'}
          />
        </div>

        {/* Quick links */}
        <nav aria-label="دسترسی سریع" className="flex w-full flex-wrap items-center gap-1 sm:w-auto">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex items-center gap-1 rounded-btn border border-border px-2 py-1.5 text-[10.5px] font-bold text-text transition-colors hover:border-primary hover:bg-blue-50 hover:text-primary"
              >
                <Icon size={12} aria-hidden="true" />
                {link.label}
                {link.label === 'پیام‌ها' && unread > 0 && (
                  <span className="rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                    {toPersianDigits(unread)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function Chip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-green-50 text-green-800 ring-green-200'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-800 ring-amber-200'
        : 'bg-red-50 text-red-700 ring-red-200';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ring-1 ring-inset',
        toneClass,
      )}
    >
      <span className="opacity-80">{label}</span>
      <span>{value}</span>
    </span>
  );
}
