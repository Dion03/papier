import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What is missing, e.g. "Nog geen platen". */
  title: ReactNode;
  /** Why, and what to do about it. */
  description?: ReactNode;
  /** An icon or small illustration. Decorative. */
  icon?: ReactNode;
  /** The way forward, e.g. a Button. */
  action?: ReactNode;
  /** Level of the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
  size?: 'sm' | 'md';
}

/** What a list, search or page shows when there is nothing yet, with a way forward. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { title, description, icon, action, headingLevel = 3, size = 'md', className, ...rest }, ref,
) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div ref={ref} className={cx('pp-empty', className)} data-size={size} {...rest}>
      {icon && <div className="pp-empty__icon" aria-hidden="true">{icon}</div>}
      <Heading className="pp-empty__title">{title}</Heading>
      {description && <p className="pp-empty__desc">{description}</p>}
      {action && <div className="pp-empty__action">{action}</div>}
    </div>
  );
});
