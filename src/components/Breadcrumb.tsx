import { forwardRef, type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { ChevronRight } from './icons';
import { Link } from './Link';

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Name of the landmark; defaults to the "breadcrumb" label. */
  label?: string;
  children: ReactNode;
}

/** A trail of links to the pages above this one, as a named nav with an ordered list. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb({ label, className, children, ...rest }, ref) {
  const labels = useLabels();
  return (
    <nav ref={ref} aria-label={label ?? labels.breadcrumb} className={cx('pp-breadcrumb', className)} {...rest}>
      <ol className="pp-breadcrumb__list">{children}</ol>
    </nav>
  );
});

export interface BreadcrumbItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  href?: string;
  /** The page you are on. An item without href or asChild is the current page too. */
  current?: boolean;
  /** Render the single child (e.g. Next.js or React Router `Link`) as the item's link. */
  asChild?: boolean;
  children: ReactNode;
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, current, asChild, className, children, ...rest }, ref,
) {
  const isLink = asChild || href !== undefined;
  const isCurrent = current || !isLink;
  const aria = isCurrent ? ('page' as const) : undefined;
  return (
    <li ref={ref} className={cx('pp-breadcrumb__item', className)} {...rest}>
      <ChevronRight className="pp-breadcrumb__sep" width={14} height={14} aria-hidden="true" />
      {isLink
        ? <Link asChild={asChild} href={asChild ? undefined : href} variant="underline" aria-current={aria} className="pp-breadcrumb__link">{children}</Link>
        : <span aria-current={aria} className="pp-breadcrumb__current">{children}</span>}
    </li>
  );
});
