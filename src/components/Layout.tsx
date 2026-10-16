import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  direction?: 'column' | 'row';
  /** Gap as a step of the Papier space scale (4 to 72 px). */
  gap?: Space;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
}

/** Lays children out in a column or row with a token gap. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as: Tag = 'div', direction = 'column', gap = 4, align, justify, wrap, className, style, ...rest }, ref,
) {
  return (
    <Tag ref={ref} className={cx('pp-stack', className)} data-direction={direction}
      style={{ gap: `var(--papier-space-${gap})`, alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : undefined, ...style }} {...rest} />
  );
});

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** sm 720, md 1040, lg 1300 (the portfolio field), full. */
  size?: 'sm' | 'md' | 'lg' | 'full';
}

/** Centres content with the portfolio's gutter (24 to 72 px, 18 px on the smallest screens). */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { as: Tag = 'div', size = 'lg', className, ...rest }, ref,
) {
  return <Tag ref={ref} className={cx('pp-container', className)} data-size={size} {...rest} />;
});
