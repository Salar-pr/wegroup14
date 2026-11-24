import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { cn, toPersianDigits } from '../../utils';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

export interface TableColumn<T> {
  /** Unique column id; also used as the sort key. */
  key: string;
  header: ReactNode;
  /** Custom cell renderer. Defaults to `(row as Record<string, unknown>)[key]`. */
  render?: (row: T) => ReactNode;
  /** Value used for sorting this column. Omit to make it unsortable. */
  sortValue?: (row: T) => string | number;
  align?: 'start' | 'center' | 'end';
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  /** Rows per page. Default 8. Pass 0 to disable pagination. */
  pageSize?: number;
  onRowClick?: (row: T) => void;
  /** Accessible caption describing the table. */
  caption?: string;
}

type SortDirection = 'asc' | 'desc';

const ALIGN_CLASS = { start: 'text-start', center: 'text-center', end: 'text-end' } as const;

export function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyTitle = 'داده‌ای برای نمایش وجود ندارد',
  emptyDescription,
  emptyIcon,
  pageSize = 8,
  onRowClick,
  caption,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find((item) => item.key === sortKey);
    if (!column?.sortValue) return data;
    const getValue = column.sortValue;
    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * direction;
      }
      return String(valueA).localeCompare(String(valueB), 'fa') * direction;
    });
  }, [data, sortKey, sortDirection, columns]);

  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pagedData = useMemo(() => {
    if (pageSize <= 0) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((item) => item.key === columnKey);
    if (!column?.sortValue) return;
    if (sortKey === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon ?? Inbox}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const rangeStart = sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd =
    pageSize > 0 ? Math.min(sortedData.length, page * pageSize) : sortedData.length;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-border bg-slate-50/70">
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sortKey === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={
                      active
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-text-muted',
                      ALIGN_CLASS[column.align ?? 'start'],
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="inline-flex items-center gap-1 rounded px-1 py-0.5 font-bold transition-colors hover:text-text"
                      >
                        {column.header}
                        {active ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp size={12} aria-hidden="true" />
                          ) : (
                            <ArrowDown size={12} aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown size={12} aria-hidden="true" className="opacity-60" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: pageSize > 0 ? Math.min(pageSize, 6) : 6 }).map(
                  (_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`} className="border-b border-border last:border-0">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3.5">
                          <div className="animate-skeleton h-4 w-3/4 rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ),
                )
              : pagedData.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'border-b border-border transition-colors last:border-0 hover:bg-slate-50/70',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {columns.map((column) => {
                      const cell =
                        column.render?.(row) ??
                        ((row as Record<string, unknown>)[column.key] as ReactNode);
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            'whitespace-nowrap px-4 py-3.5 align-middle text-text',
                            ALIGN_CLASS[column.align ?? 'start'],
                          )}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {pageSize > 0 && sortedData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-xs text-text-muted">
            نمایش{' '}
            <span className="font-bold text-text">
              {toPersianDigits(`${rangeStart}`)} تا {toPersianDigits(`${rangeEnd}`)}
            </span>{' '}
            از {toPersianDigits(`${sortedData.length}`)} ردیف
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              قبلی
            </Button>
            <span className="text-xs font-semibold text-text-muted">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              بعدی
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
