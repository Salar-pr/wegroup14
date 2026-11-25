import { Check, ChevronDown, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../../components';
import { cn, toPersianDigits } from '../../../utils';
import type { SchoolClass, Student } from '../../../types';
import { useParentSession } from '../hooks/parent-session';

export interface ChildSelectorProps {
  children: Student[];
  classes: SchoolClass[];
  className?: string;
  /** Compact variant used in the page header on small screens. */
  variant?: 'panel' | 'inline';
}

/**
 * Multi-child switcher. Only rendered as a control when the account has more
 * than one child; otherwise it shows the single child as a static chip so the
 * parent always knows whose data is on screen.
 */
export function ChildSelector({
  children,
  classes,
  className,
  variant = 'panel',
}: ChildSelectorProps) {
  const { selectedChildId, selectChild } = useParentSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (children.length === 0) return null;

  const active = children.find((child) => child.id === selectedChildId) ?? children[0];
  const activeClass = classes.find((item) => item.id === active.classId);

  // Single child → static identity chip (no fake dropdown affordance).
  if (children.length === 1) {
    return (
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-card border border-border bg-surface px-3 py-2 shadow-card',
          className,
        )}
      >
        <Avatar name={active.name} color={active.avatarColor} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold text-text">{active.name}</p>
          <p className="truncate text-[10px] text-text-muted">
            {activeClass?.name ?? active.gradeLevel} · کد {toPersianDigits(active.studentCode)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="انتخاب فرزند"
        className={cn(
          'flex w-full items-center gap-2.5 rounded-card border border-border bg-surface px-3 py-2 text-start shadow-card transition-colors hover:border-slate-300',
          variant === 'inline' && 'w-auto',
        )}
      >
        <Avatar name={active.name} color={active.avatarColor} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold text-text">{active.name}</p>
          <p className="truncate text-[10px] text-text-muted">
            {activeClass?.name ?? active.gradeLevel}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-primary">
          <Users size={11} aria-hidden="true" />
          {toPersianDigits(children.length)} فرزند
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn('shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="فهرست فرزندان"
          className="animate-dropdown-in absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-card border border-border bg-surface p-1 shadow-cardHover sm:min-w-[260px]"
        >
          {children.map((child) => {
            const childClass = classes.find((item) => item.id === child.classId);
            const isActive = child.id === active.id;
            return (
              <button
                key={child.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  selectChild(child.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-btn px-2 py-2 text-start transition-colors',
                  isActive ? 'bg-blue-50' : 'hover:bg-slate-50',
                )}
              >
                <Avatar name={child.name} color={child.avatarColor} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-text">{child.name}</p>
                  <p className="truncate text-[10px] text-text-muted">
                    {childClass?.name ?? child.gradeLevel}
                  </p>
                </div>
                {isActive && <Check size={15} className="shrink-0 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
