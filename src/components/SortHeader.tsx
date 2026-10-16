import { forwardRef, useCallback, useMemo, useState, type ReactNode, type ThHTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { ArrowDown, ArrowUp, Sort } from './icons';

export type SortDirection = 'ascending' | 'descending';

export interface SortHeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick' | 'align'> {
  /** This column's sort direction, or none when another column (or nothing) is sorted. */
  sort?: SortDirection | 'none';
  /** Called when the header is activated; decide the next direction yourself or use useTableSort. */
  onSort: () => void;
  /** `end` for number columns, so the header lines up with `pp-num` cells. */
  align?: 'start' | 'end';
  children: ReactNode;
}

/**
 * A column header in a Table that sorts the rows: a <th> with aria-sort and a button
 * inside, so the column name stays the header and the state is announced with it.
 */
export const SortHeader = forwardRef<HTMLTableCellElement, SortHeaderProps>(function SortHeader(
  { sort = 'none', onSort, align = 'start', className, children, scope = 'col', ...rest }, ref,
) {
  const Icon = sort === 'ascending' ? ArrowUp : sort === 'descending' ? ArrowDown : Sort;
  return (
    <th ref={ref} scope={scope} aria-sort={sort === 'none' ? undefined : sort} className={cx('pp-sort-header', align === 'end' && 'pp-num', className)} {...rest}>
      <button type="button" className="pp-sort" data-sorted={sort === 'none' ? undefined : sort} onClick={onSort}>
        <span>{children}</span>
        <Icon className="pp-sort__icon" width={14} height={14} />
      </button>
    </th>
  );
});

export interface TableSortState<K extends string> { key: K | null; direction: SortDirection }

/**
 * Sort state for a Table: `headerProps(key)` goes on a SortHeader, `sortRows(rows, get)`
 * returns a sorted copy. A first click sorts ascending, a second descending, a third
 * clears. Text compares in the Papier locale with numbers in natural order (2 before 10).
 */
export function useTableSort<K extends string>(initial: TableSortState<K> = { key: null, direction: 'ascending' }) {
  const { locale } = useLabels();
  const [state, setState] = useState<TableSortState<K>>(initial);
  const collator = useMemo(() => new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }), [locale]);

  const toggle = useCallback((key: K) => setState((s) =>
    s.key !== key ? { key, direction: 'ascending' } : s.direction === 'ascending' ? { key, direction: 'descending' } : { key: null, direction: 'ascending' }), []);

  const headerProps = (key: K) => ({
    sort: state.key === key ? state.direction : ('none' as const),
    onSort: () => toggle(key),
  });

  const sortRows = <T,>(rows: readonly T[], get: (row: T, key: K) => unknown): T[] => {
    const { key, direction } = state;
    if (key === null) return [...rows];
    const sign = direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = get(a, key);
      const y = get(b, key);
      if (x == null || y == null) return x == null ? (y == null ? 0 : 1) : -1; // empty cells last
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * sign;
      if (x instanceof Date && y instanceof Date) return (x.getTime() - y.getTime()) * sign;
      return collator.compare(String(x), String(y)) * sign;
    });
  };

  return { ...state, setSort: setState, toggle, headerProps, sortRows };
}
