import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'sage' | 'coral' | 'accent' | 'outline';
}

/** A small label for categories, languages or states. Never the only carrier of meaning. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({ tone = 'neutral', className, ...rest }, ref) {
  return <span ref={ref} className={cx('pp-tag', className)} data-tone={tone} {...rest} />;
});
