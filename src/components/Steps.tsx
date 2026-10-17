import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { Check } from './icons';

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
  /** Marks a step that needs attention, e.g. a form section with errors. */
  error?: boolean;
}

export interface StepsProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: StepItem[];
  /** The current step, starting at 0. Steps before it count as completed. */
  current: number;
  /** `vertical` stacks the steps with room for descriptions, e.g. in a sidebar. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Makes completed steps (and the current one) buttons, so people can go back. Later
   * steps stay plain text: you only reach them by finishing the current one.
   */
  onStepClick?: (index: number) => void;
  /** Name of the landmark; defaults to the "steps" label. */
  label?: string;
}

/**
 * Progress through a flow of a few steps, such as checkout or onboarding: a named nav with
 * an ordered list. The current step has aria-current="step", completed ones say so, and
 * the state is shown by a number, a tick or a mark, never by colour alone. On narrow
 * screens a horizontal row keeps only the current step's title.
 */
export const Steps = forwardRef<HTMLElement, StepsProps>(function Steps(
  { items, current, orientation = 'horizontal', onStepClick, label, className, ...rest }, ref,
) {
  const labels = useLabels();
  const at = Math.max(0, Math.min(current, items.length - 1));
  return (
    <nav ref={ref} aria-label={label ?? labels.steps} className={cx('pp-steps', className)} data-orientation={orientation} {...rest}>
      <p className="pp-steps__position" aria-hidden="true">{labels.stepOf(at + 1, items.length)}</p>
      <ol className="pp-steps__list">
        {items.map((step, i) => {
          const state = i < at ? 'complete' : i === at ? 'current' : 'upcoming';
          const marker = step.error ? '!' : state === 'complete' ? <Check width={14} height={14} strokeWidth={2.4} /> : i + 1;
          const content = (
            <>
              <span className="pp-steps__marker" aria-hidden="true">{marker}</span>
              <span className="pp-steps__text">
                <span className="pp-steps__title">
                  {step.title}
                  {state === 'complete' && <span className="pp-visually-hidden"> ({labels.stepComplete})</span>}
                  {step.error && <span className="pp-visually-hidden"> ({labels.stepError})</span>}
                </span>
                {step.description && <span className="pp-steps__desc">{step.description}</span>}
              </span>
            </>
          );
          const clickable = onStepClick && i <= at;
          return (
            <li key={i} className="pp-steps__item" data-state={state} data-error={step.error || undefined} aria-current={state === 'current' ? 'step' : undefined}>
              {clickable
                ? <button type="button" className="pp-steps__control" onClick={() => onStepClick(i)}>{content}</button>
                : <span className="pp-steps__control">{content}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
