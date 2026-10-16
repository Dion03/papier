import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

/** A key on the keyboard, e.g. <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>. Renders a native <kbd>. */
export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd({ className, ...rest }, ref) {
  return <kbd ref={ref} className={cx('pp-kbd', className)} {...rest} />;
});
