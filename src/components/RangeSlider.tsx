import { forwardRef, useId, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useControllable } from '../lib/useControllable';

export type RangeValue = [number, number];

export interface RangeSliderProps {
  label: ReactNode;
  value?: RangeValue;
  defaultValue?: RangeValue;
  onValueChange?: (value: RangeValue) => void;
  /** Called when a thumb is let go or a key is released, e.g. to start a search only then. */
  onValueCommit?: (value: RangeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Smallest gap between the two thumbs. */
  minDistance?: number;
  /** Formats the visible values and each thumb's aria-valuetext. */
  formatValue?: (value: number) => string;
  /** Ticks under the track, optionally with a label, e.g. `[{ value: 1960, label: '1960' }]`. */
  marks?: Array<number | { value: number; label?: ReactNode }>;
  /** Form name; both values are submitted under it, low first. */
  name?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
}

/**
 * A range between two values, e.g. a price or year span: two native range inputs on one
 * track, so each thumb keeps the browser's keyboard and screen-reader support. Each thumb
 * is named after the label ("Jaar, van" and "Jaar, tot") and cannot pass the other.
 * Fills from the right in right-to-left text.
 */
export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(function RangeSlider(
  { label, value, defaultValue, onValueChange, onValueCommit, min = 0, max = 100, step = 1, minDistance = 0, formatValue = String, marks, name, disabled, hideLabel, className }, ref,
) {
  const labels = useLabels();
  const id = useId();
  const [range, setRange] = useControllable<RangeValue>(value, defaultValue ?? [min, max], onValueChange);
  const [lo, hi] = range;
  const span = max - min || 1;
  const pct = (v: number) => (v - min) / span;
  const gap = Math.max(minDistance, 0);

  const setLo = (v: number) => setRange([Math.min(v, hi - gap), hi]);
  const setHi = (v: number) => setRange([lo, Math.max(v, lo + gap)]);
  const commit = () => onValueCommit?.(range);

  const thumb = (which: 'start' | 'end') => {
    const v = which === 'start' ? lo : hi;
    return (
      <input
        type="range"
        className="pp-range__input"
        data-thumb={which}
        min={min} max={max} step={step} value={v} name={name} disabled={disabled}
        aria-labelledby={`${id}-label ${id}-${which}`}
        aria-valuetext={formatValue(v)}
        onChange={(e) => (which === 'start' ? setLo : setHi)(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
      />
    );
  };

  return (
    <div ref={ref} className={cx('pp-slider', 'pp-range', className)} data-disabled={disabled || undefined}>
      <div className={cx('pp-slider__head', hideLabel && 'pp-visually-hidden')}>
        <span id={`${id}-label`}>{label}</span>
        <span className="pp-slider__value" aria-hidden="true">{formatValue(lo)} – {formatValue(hi)}</span>
      </div>
      <span id={`${id}-start`} hidden>{labels.rangeStart}</span>
      <span id={`${id}-end`} hidden>{labels.rangeEnd}</span>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className="pp-range__track"
        // The lower thumb goes on top once it passes the middle, so two thumbs at max can still be pulled apart.
        data-start-on-top={pct(lo) > 0.5 || undefined}
        style={{ '--pp-lo': pct(lo), '--pp-hi': pct(hi) } as CSSProperties}
      >
        {thumb('start')}
        {thumb('end')}
      </div>
      {marks && marks.length > 0 && (
        <div className="pp-range__marks" aria-hidden="true">
          {marks.map((m) => {
            const mark = typeof m === 'number' ? { value: m, label: undefined } : m;
            const inside = mark.value >= lo && mark.value <= hi;
            return (
              <span key={mark.value} className="pp-range__mark" data-inside={inside || undefined} style={{ '--pp-at': pct(mark.value) } as CSSProperties}>
                {mark.label != null && <span className="pp-range__mark-label">{mark.label}</span>}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});
