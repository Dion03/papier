import { forwardRef, type CSSProperties } from 'react';
import { cx } from '../lib/cx';

export interface SkeletonProps {
  shape?: 'text' | 'block' | 'circle';
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** Number of text lines; the last one is shorter. */
  lines?: number;
  className?: string;
}

/**
 * A placeholder while content loads. Decorative: put aria-busy="true" on the region
 * that is loading and announce the result there.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton({ shape = 'text', width, height, lines = 1, className }, ref) {
  if (shape === 'text' && lines > 1) {
    return (
      <span ref={ref} className={cx('pp-skeleton-lines', className)} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => <span key={i} className="pp-skeleton" data-shape="text" style={{ width: i === lines - 1 ? '62%' : width }} />)}
      </span>
    );
  }
  return <span ref={ref} className={cx('pp-skeleton', className)} data-shape={shape} style={{ width, height }} aria-hidden="true" />;
});
