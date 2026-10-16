import { forwardRef, useImperativeHandle, useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { prefersReducedMotion } from '../lib/motion';
import { ChevronDown } from './icons';

export interface DisclosureProps extends Omit<HTMLAttributes<HTMLDetailsElement>, 'onToggle'> {
  summary: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const OPEN_MS = 420;
const CLOSE_MS = 290;
const EASE = 'cubic-bezier(.16, 1, .3, 1)';

/**
 * A native <details> that unfolds in 420ms and folds in 290ms, as in the portfolio.
 * The native open state changes immediately for assistive tech; only the height animates.
 * Without Web Animations or with reduced motion it toggles instantly. Find-in-page still opens it.
 */
export const Disclosure = forwardRef<HTMLDetailsElement, DisclosureProps>(function Disclosure(
  { summary, defaultOpen, onOpenChange, className, children, ...rest }, ref,
) {
  const el = useRef<HTMLDetailsElement>(null);
  const anim = useRef<Animation | null>(null);
  useImperativeHandle(ref, () => el.current!);

  const onSummaryClick = (e: MouseEvent<HTMLElement>) => {
    const d = el.current;
    if (!d || typeof d.animate !== 'function' || prefersReducedMotion(d)) return; // native toggle
    e.preventDefault();
    const summaryEl = d.querySelector('summary')!;
    const closed = `${summaryEl.offsetHeight}px`;
    const from = `${d.offsetHeight}px`;
    const wasClosing = !!d.dataset.closing;
    anim.current?.cancel();
    d.style.overflow = 'hidden';
    const finish = () => { d.style.height = ''; d.style.overflow = ''; anim.current = null; };
    if (!d.open || wasClosing) {
      delete d.dataset.closing;
      d.open = true;
      const to = `${d.scrollHeight}px`;
      anim.current = d.animate({ height: [from, to] }, { duration: OPEN_MS, easing: EASE });
      anim.current.onfinish = finish;
    } else {
      d.dataset.closing = 'true';
      anim.current = d.animate({ height: [from, closed] }, { duration: CLOSE_MS, easing: EASE });
      anim.current.onfinish = () => { d.open = false; delete d.dataset.closing; finish(); };
    }
  };

  return (
    <details
      ref={el}
      open={defaultOpen}
      className={cx('pp-disclosure', className)}
      onToggle={(e) => onOpenChange?.((e.currentTarget as HTMLDetailsElement).open)}
      {...rest}
    >
      <summary className="pp-disclosure__summary" onClick={onSummaryClick}>
        <span className="pp-disclosure__label">{summary}</span>
        <ChevronDown className="pp-disclosure__chevron" />
      </summary>
      <div className="pp-disclosure__content">{children}</div>
    </details>
  );
});
