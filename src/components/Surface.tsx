import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export type SurfaceMaterial = 'paper' | 'sunken' | 'sage' | 'sage-soft' | 'coral' | 'ink';

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** The material of the module. Text colour follows it automatically. */
  material?: SurfaceMaterial;
  /** `object` adds the portfolio's tactile shadow with light top and dark bottom edge. Prose stays flat. */
  elevation?: 'flat' | 'raised' | 'object';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl';
}

/** A module: the rounded, material-backed block that carries an object or function. */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { as: Tag = 'div', material = 'paper', elevation = 'flat', padding = 'md', radius = 'lg', className, ...rest }, ref,
) {
  return <Tag ref={ref} className={cx('pp-surface', className)} data-material={material} data-elevation={elevation} data-padding={padding} data-radius={radius} {...rest} />;
});
