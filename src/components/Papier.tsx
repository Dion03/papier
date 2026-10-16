import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export type PapierTheme = 'light' | 'dark' | 'system';

export interface PapierProps extends HTMLAttributes<HTMLDivElement> {
  /** Colour theme for everything inside. `system` follows the OS setting. */
  theme?: PapierTheme;
  /** `reduced` makes every Papier transition instant, independent of the OS setting. */
  motion?: 'full' | 'reduced';
}

/** Root that applies Papier's typography, colours and theme to its children. */
export const Papier = forwardRef<HTMLDivElement, PapierProps>(function Papier(
  { theme = 'light', motion = 'full', className, ...rest }, ref,
) {
  return (
    <div
      ref={ref}
      data-papier-theme={theme}
      data-papier-motion={motion === 'reduced' ? 'reduced' : undefined}
      className={cx('papier', className)}
      {...rest}
    />
  );
});
