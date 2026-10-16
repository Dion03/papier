import { forwardRef, useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useControllable } from '../lib/useControllable';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  /** Formats the visible value and aria-valuetext, e.g. seconds as 1:24. */
  formatValue?: (value: number) => string;
  hideLabel?: boolean;
}

/** A native range input with a filled track, visible value and readable valuetext. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, value, defaultValue, min = 0, max = 100, step = 1, onValueChange, formatValue = String, hideLabel, id, className, ...rest }, ref,
) {
  const auto = useId();
  const inputId = id ?? `pp-${auto}`;
  const [v, setV] = useControllable(value, defaultValue ?? min, onValueChange);
  const pct = max === min ? 0 : ((v - min) / (max - min)) * 100;
  return (
    <div className={cx('pp-slider', className)}>
      <div className={cx('pp-slider__head', hideLabel && 'pp-visually-hidden')}>
        <label htmlFor={inputId}>{label}</label>
        <output htmlFor={inputId} className="pp-slider__value">{formatValue(v)}</output>
      </div>
      <input
        ref={ref}
        id={inputId}
        type="range"
        className="pp-slider__input"
        min={min} max={max} step={step} value={v}
        aria-valuetext={formatValue(v)}
        style={{ '--pp-fill': `${pct}%` } as CSSProperties}
        onChange={(e) => setV(Number(e.target.value))}
        {...rest}
      />
    </div>
  );
});
