import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Visible label; also the accessible name. */
  label: ReactNode;
  /** Omit for an indeterminate state. */
  value?: number;
  max?: number;
  /** Text shown next to the label, e.g. "3 van 5". Defaults to a percentage. */
  valueText?: string;
  hideLabel?: boolean;
  tone?: 'action' | 'accent';
}

/** A determinate or indeterminate progress bar with a real label and value text. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { label, value, max = 100, valueText, hideLabel, tone = 'action', className, ...rest }, ref,
) {
  const id = useId();
  const determinate = typeof value === 'number';
  const pct = determinate ? Math.min(100, Math.max(0, (value! / max) * 100)) : 0;
  const text = valueText ?? (determinate ? `${Math.round(pct)}%` : undefined);
  return (
    <div ref={ref} className={cx('pp-progress', className)} data-tone={tone} {...rest}>
      <div className={cx('pp-progress__head', hideLabel && 'pp-visually-hidden')}>
        <span id={`${id}-label`}>{label}</span>
        {text && <span className="pp-progress__value" aria-hidden="true">{text}</span>}
      </div>
      <div
        className="pp-progress__track"
        role="progressbar"
        aria-labelledby={`${id}-label`}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuemax={determinate ? max : undefined}
        aria-valuenow={determinate ? value : undefined}
        aria-valuetext={text}
        data-indeterminate={!determinate || undefined}
      >
        <span className="pp-progress__bar" style={determinate ? { transform: `scaleX(${pct / 100})` } : undefined} />
      </div>
    </div>
  );
});
