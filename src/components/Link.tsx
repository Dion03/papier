import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Slot, slotChild } from '../lib/slot';
import { ArrowUpRight } from './icons';
import { useLabels } from '../lib/labels';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `underline`: a resting line that darkens on hover. `quiet`: the line rises only on hover. `arrow`: label with a thin arrow that nudges up-right. */
  variant?: 'underline' | 'quiet' | 'arrow' | 'accent';
  /** Opens in a new tab with safe rel and an announced hint. */
  external?: boolean;
  /** Render the single child element (e.g. Next.js or React Router `Link`) with Papier's link style. */
  asChild?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant = 'underline', external, asChild, className, children, target, rel, ...rest }, ref,
) {
  const labels = useLabels();
  const props = {
    className: cx('pp-link', className),
    'data-variant': variant,
    target: external ? '_blank' : target,
    rel: external ? cx('noopener noreferrer', rel) : rel,
    ...rest,
  };
  const inner = (label: ReactNode) => (
    <>
      <span className="pp-link__label">{label}</span>
      {variant === 'arrow' && <ArrowUpRight className="pp-link__arrow" />}
      {external && <span className="pp-visually-hidden"> {labels.externalLink}</span>}
    </>
  );
  if (asChild) return <Slot ref={ref} {...props}>{slotChild(children, inner)}</Slot>;
  return <a ref={ref} {...props}>{inner(children)}</a>;
});
