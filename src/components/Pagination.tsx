import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { ArrowLeft, ArrowRight } from './icons';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The current page, starting at 1. */
  page: number;
  pageCount: number;
  /** Called with the chosen page. Without getHref the pages are buttons. */
  onPageChange?: (page: number) => void;
  /** Makes every page a real link, so it can be opened in a new tab and crawled. */
  getHref?: (page: number) => string;
  /** Component for those links, e.g. Next.js `Link`. It gets href, className, aria-* and children. */
  linkAs?: ElementType;
  /** Pages shown on each side of the current one. */
  siblings?: number;
  /** Name of the landmark; defaults to the "pagination" label. */
  label?: string;
}

type Slot = number | 'gap-start' | 'gap-end';

/** Pages to show: first, last, the current one with its siblings, and gaps where pages are left out. */
export function paginationRange(page: number, count: number, siblings = 1): Slot[] {
  const total = siblings * 2 + 5;
  if (count <= total) return Array.from({ length: count }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(page - siblings, count - siblings * 2 - 2));
  const end = Math.min(count - 1, Math.max(page + siblings, siblings * 2 + 3));
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return [1, ...(start > 2 ? ['gap-start' as const] : []), ...middle, ...(end < count - 1 ? ['gap-end' as const] : []), count];
}

/**
 * Pages of a list, as links (getHref) or buttons (onPageChange). The current page has
 * aria-current="page"; on narrow screens only Previous, Next and "page 3 of 12" remain.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, pageCount, onPageChange, getHref, linkAs, siblings = 1, label, className, ...rest }, ref,
) {
  const labels = useLabels();
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), count);

  const control = (target: number, content: ReactNode, props: Record<string, unknown>) => {
    const go = () => { if (target !== current) onPageChange?.(target); };
    if (getHref) {
      const Comp = linkAs ?? 'a';
      return <Comp href={getHref(target)} onClick={go} {...props}>{content}</Comp>;
    }
    return <button type="button" onClick={go} {...props}>{content}</button>;
  };

  return (
    <nav ref={ref} aria-label={label ?? labels.pagination} className={cx('pp-pagination', className)} {...rest}>
      <ul className="pp-pagination__list">
        <li className="pp-pagination__step">
          {current > 1
            ? control(current - 1, <><ArrowLeft width={16} height={16} /><span>{labels.previous}</span></>, { className: 'pp-pagination__control', rel: getHref ? 'prev' : undefined })
            : <span className="pp-pagination__control" data-placeholder="" aria-hidden="true"><ArrowLeft width={16} height={16} /><span>{labels.previous}</span></span>}
        </li>
        {paginationRange(current, count, siblings).map((slot) => (
          typeof slot === 'number'
            ? (
              <li key={slot} className="pp-pagination__page">
                {control(slot, slot, {
                  className: 'pp-pagination__control', 'data-number': '',
                  'aria-label': labels.page(slot), 'aria-current': slot === current ? 'page' : undefined,
                })}
              </li>
            )
            : <li key={slot} className="pp-pagination__page pp-pagination__gap" aria-hidden="true">…</li>
        ))}
        <li className="pp-pagination__status">{labels.pageOf(current, count)}</li>
        <li className="pp-pagination__step">
          {current < count
            ? control(current + 1, <><span>{labels.next}</span><ArrowRight width={16} height={16} /></>, { className: 'pp-pagination__control', rel: getHref ? 'next' : undefined })
            : <span className="pp-pagination__control" data-placeholder="" aria-hidden="true"><span>{labels.next}</span><ArrowRight width={16} height={16} /></span>}
        </li>
      </ul>
    </nav>
  );
});
