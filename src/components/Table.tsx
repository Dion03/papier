import { forwardRef, type ReactNode, type TableHTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Required: names the table for screen readers and the scroll region. */
  caption: string;
  /** Show the caption visually as well. */
  showCaption?: boolean;
  density?: 'comfortable' | 'compact';
  children: ReactNode;
}

/**
 * A native table in a focusable scroll region, so it never forces the page wider and
 * keyboard users can scroll it. Mark number cells with className="pp-num".
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { caption, showCaption, density = 'comfortable', className, children, ...rest }, ref,
) {
  return (
    <div className="pp-table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table ref={ref} className={cx('pp-table', className)} data-density={density} {...rest}>
        <caption className={showCaption ? 'pp-table__caption' : 'pp-visually-hidden'}>{caption}</caption>
        {children}
      </table>
    </div>
  );
});
