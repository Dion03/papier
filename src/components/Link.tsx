import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import { ArrowUpRight } from './icons';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `underline`: a resting line that darkens on hover. `quiet`: the line rises only on hover. `arrow`: label with a thin arrow that nudges up-right. */
  variant?: 'underline' | 'quiet' | 'arrow' | 'accent';
  /** Opens in a new tab with safe rel and an announced hint. */
  external?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant = 'underline', external, className, children, target, rel, ...rest }, ref,
) {
  return (
    <a
      ref={ref}
      className={cx('pp-link', className)}
      data-variant={variant}
      target={external ? '_blank' : target}
      rel={external ? cx('noopener noreferrer', rel) : rel}
      {...rest}
    >
      <span className="pp-link__label">{children}</span>
      {variant === 'arrow' && <ArrowUpRight className="pp-link__arrow" />}
      {external && <span className="pp-visually-hidden"> (opent in een nieuw tabblad)</span>}
    </a>
  );
});
