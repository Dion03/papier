import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useIsoLayoutEffect } from '../lib/useIsoLayoutEffect';
import { useControllable } from '../lib/useControllable';

export interface SegmentOption<T extends string> { value: T; label: ReactNode; disabled?: boolean }

export interface SegmentedControlProps<T extends string> {
  /** Accessible name for the group. */
  label: string;
  options: Array<SegmentOption<T>>;
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A single choice between a few periods or views, e.g. Week / Maand / Jaar.
 * A radio group with roving focus and a highlight that slides to the choice.
 */
export function SegmentedControl<T extends string>({ label, options, value, defaultValue, onValueChange, size = 'md', className }: SegmentedControlProps<T>) {
  const [current, setCurrent] = useControllable<T>(value, defaultValue ?? options[0].value, onValueChange);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const groupRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const name = useId();
  const index = Math.max(0, options.findIndex((o) => o.value === current));

  useIsoLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[index];
      if (el) setIndicator({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (groupRef.current) ro?.observe(groupRef.current);
    return () => ro?.disconnect();
  }, [index, options.length]);

  const move = (from: number, dir: 1 | -1) => {
    for (let step = 1; step <= options.length; step++) {
      const i = (from + dir * step + options.length) % options.length;
      if (!options[i].disabled) return i;
    }
    return from;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = move(i, 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = move(i, -1);
    else if (e.key === 'Home') next = move(-1, 1);
    else if (e.key === 'End') next = move(options.length, -1);
    if (next === null) return;
    e.preventDefault();
    setCurrent(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div ref={groupRef} role="radiogroup" aria-label={label} className={cx('pp-segmented', className)} data-size={size} data-name={name}>
      {indicator && <span className="pp-segmented__indicator" aria-hidden="true" style={{ transform: `translateX(${indicator.x}px)`, width: indicator.w }} />}
      {options.map((o, i) => {
        const selected = i === index;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={o.disabled}
            className="pp-segmented__option"
            onClick={() => setCurrent(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
