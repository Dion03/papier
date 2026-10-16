import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Purely visual: hidden from screen readers. Defaults to true; set false between real sections. */
  decorative?: boolean;
  /** A word in the middle of a horizontal line, e.g. "of" between two ways to sign in. It is read out. */
  label?: ReactNode;
}

/** A thin line between groups of content, horizontal or vertical, optionally with a word in it. */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = true, label, className, ...rest }, ref,
) {
  const props = { className: cx('pp-separator', className), 'data-orientation': orientation, ...rest };
  if (label != null && orientation === 'horizontal') {
    return <div ref={ref} {...props} data-label=""><span className="pp-separator__label">{label}</span></div>;
  }
  if (decorative) return <div ref={ref} aria-hidden="true" {...props} />;
  return <div ref={ref} role="separator" aria-orientation={orientation} {...props} />;
});
