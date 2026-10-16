import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import { LabelsContext, dutchLabels, type PapierLabels } from '../lib/labels';

export type PapierTheme = 'light' | 'dark' | 'system';

export interface PapierProps extends HTMLAttributes<HTMLDivElement> {
  /** Colour theme for everything inside. `system` follows the OS setting. */
  theme?: PapierTheme;
  /** `reduced` makes every Papier transition instant, independent of the OS setting. */
  motion?: 'full' | 'reduced';
  /** Override built-in strings, e.g. `englishLabels` or a partial set. */
  labels?: Partial<PapierLabels>;
}

/** Root that applies Papier's typography, colours and theme to its children. */
export const Papier = forwardRef<HTMLDivElement, PapierProps>(function Papier(
  { theme = 'light', motion = 'full', labels, className, ...rest }, ref,
) {
  const merged = labels ? { ...dutchLabels, ...labels } : dutchLabels;
  return (
    <LabelsContext.Provider value={merged}>
    <div
      ref={ref}
      data-papier-theme={theme}
      data-papier-motion={motion === 'reduced' ? 'reduced' : undefined}
      className={cx('papier', className)}
      {...rest}
    />
    </LabelsContext.Provider>
  );
});
