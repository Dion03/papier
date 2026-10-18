import {
  forwardRef, useEffect, useMemo, useRef, useState,
  type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useMergedRefs } from '../lib/slot';
import { useControllable } from '../lib/useControllable';
import { Field } from './Field';
import { Minus, Plus } from './icons';

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step' | 'prefix'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  /** The number, or null when the field is empty. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Step for the buttons and arrow keys; PageUp and PageDown take ten steps. */
  step?: number;
  /** Intl.NumberFormat options, e.g. `{ style: 'currency', currency: 'EUR' }` or `{ style: 'percent' }`. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Locale for formatting and parsing. Defaults to the `locale` of the Papier labels. */
  locale?: string;
  /** Hides the − and + buttons; the arrow keys still step. */
  hideStepper?: boolean;
  /** Before the value: an icon or unit. Decorative, so name the unit in the label or hint too. */
  prefix?: ReactNode;
  /** After the value: an icon or unit. Decorative, so name the unit in the label or hint too. */
  suffix?: ReactNode;
}

const decimals = (n: number) => {
  const s = String(n);
  if (s.includes('e-')) return Number(s.split('e-')[1]);
  return s.includes('.') ? s.split('.')[1].length : 0;
};

// Minus signs and dashes people type for a negative number; spaces, including no-break ones.
const DASHES = new RegExp(`[${String.fromCharCode(0x2212, 0x2012, 0x2013)}]`, 'g');
const SPACES = new RegExp(`[\\s${String.fromCharCode(0xa0, 0x202f)}]`, 'g');

/** Reads a number typed in `locale`: group separators, currency and unit signs are ignored. */
export function parseNumber(text: string, locale: string, options: Intl.NumberFormatOptions = {}): number | null {
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((p) => p.type === 'group')?.value ?? ',';
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';
  let t = text.trim().replace(DASHES, '-').replace(SPACES, '');
  if (!t) return null;
  // A dot typed in a comma locale: 24.95 is a decimal, 1.234 a thousand. A group never
  // follows a leading zero or more than three digits, so 0.125 and 1234.567 are decimals too.
  const dot = /(\d*)\.(\d+)\D*$/.exec(t);
  if (decimal !== '.' && !t.includes(decimal) && (t.match(/\./g) ?? []).length === 1 && dot
    && (dot[2].length !== 3 || /^0*$/.test(dot[1]) || dot[1].length > 3)) t = t.replace('.', decimal);
  t = t.split(group).join('').split(decimal).join('.').replace(/[^\d.-]/g, '');
  const negative = t.startsWith('-');
  t = t.replace(/-/g, '');
  if (!t || t === '.') return null;
  let n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (negative) n = -n;
  return options.style === 'percent' ? n / 100 : n;
}

/**
 * A number input with − and + buttons (WAI-ARIA spinbutton). Arrow keys step, PageUp and
 * PageDown take ten steps, Home and End go to min and max. Typed text is read in the
 * locale (24,95 in Dutch) and formatted on leaving, clamped to min and max. Holding a
 * button keeps stepping. The ref points at the input.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    label, hint, error, hideLabel, required, disabled, readOnly, id, name, className, value: valueProp, defaultValue = null, onValueChange,
    min, max, step = 1, formatOptions, locale: localeProp, hideStepper, prefix, suffix, onBlur, onKeyDown, 'aria-describedby': describedBy, ...rest
  }, ref,
) {
  const labels = useLabels();
  const locale = localeProp ?? labels.locale;
  const [value, setValue] = useControllable<number | null>(valueProp, defaultValue, onValueChange);
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 20, ...formatOptions }), [locale, formatOptions]);
  const format = (n: number | null) => (n === null ? '' : fmt.format(n));
  const [text, setText] = useState(() => format(value));
  const [editing, setEditing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  const repeat = useRef<number | undefined>(undefined);
  const stepRef = useRef<(count: number) => void>(() => {});

  // Show the formatted value whenever it changes from outside or the field is left.
  useEffect(() => { if (!editing) setText(format(value)); }, [value, fmt, editing]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => window.clearTimeout(repeat.current), []);

  const precision = Math.max(decimals(step), min !== undefined ? decimals(min) : 0);
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const round = (n: number) => Number(n.toFixed(Math.min(20, precision)));

  const commit = (raw = text) => {
    const parsed = parseNumber(raw, locale, formatOptions);
    const next = parsed === null ? null : clamp(parsed);
    if (next !== value) setValue(next);
    setText(format(next));
    return next;
  };

  const stepBy = (count: number) => {
    if (disabled || readOnly) return;
    const typed = editing ? parseNumber(text, locale, formatOptions) : value;
    const base = typed ?? (count > 0 ? (min ?? 0) - step : (max ?? 0) + step);
    // Snap to the step grid (from min, or 0) before stepping, so 7 with step 5 goes to 10, not 12.
    const origin = min ?? 0;
    const offset = (base - origin) / step;
    const snapped = Number.isInteger(round(offset)) ? round(offset) : count > 0 ? Math.floor(offset) : Math.ceil(offset);
    const next = clamp(round(origin + (snapped + count) * step));
    setValue(next);
    setText(format(next));
  };

  stepRef.current = stepBy;
  const startRepeat = (count: number) => {
    stepBy(count);
    // Through a ref, so every repeat steps from the value of the latest render.
    const loop = (wait: number) => { repeat.current = window.setTimeout(() => { stepRef.current(count); loop(60); }, wait); };
    loop(400);
  };
  const stopRepeat = () => window.clearTimeout(repeat.current);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const keys: Record<string, () => void> = {
      ArrowUp: () => stepBy(1), ArrowDown: () => stepBy(-1), PageUp: () => stepBy(10), PageDown: () => stepBy(-10),
      Home: () => { if (min !== undefined) { setValue(min); setText(format(min)); } },
      End: () => { if (max !== undefined) { setValue(max); setText(format(max)); } },
      Enter: () => { commit(); },
    };
    if (keys[e.key] && !(e.key === 'Enter' && !editing)) {
      if (e.key !== 'Enter') e.preventDefault();
      keys[e.key]();
    }
  };

  const atMin = value !== null && min !== undefined && value <= min;
  const atMax = value !== null && max !== undefined && value >= max;
  const integer = Number.isInteger(step) && (min === undefined || Number.isInteger(min)) && formatOptions?.style !== 'percent' && formatOptions?.style !== 'currency';
  const button = (count: 1 | -1, blocked: boolean, controls: string) => (
    <button
      type="button"
      tabIndex={-1}
      className="pp-number__step"
      aria-label={count > 0 ? labels.increment : labels.decrement}
      aria-controls={controls}
      disabled={disabled || readOnly || blocked}
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => { if (e.button === 0) { e.currentTarget.setPointerCapture?.(e.pointerId); startRepeat(count); } }}
      onPointerUp={stopRepeat}
      onPointerCancel={stopRepeat}
      onLostPointerCapture={stopRepeat}
      onClick={(e) => { if (e.detail === 0) stepBy(count); /* keyboard or assistive tech click */ }}
    >
      {count > 0 ? <Plus width={16} height={16} /> : <Minus width={16} height={16} />}
    </button>
  );

  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy }} className={cx('pp-number', className)}>
      {(control) => (
        <>
          <span className="pp-field__group pp-number__group" data-disabled={disabled || undefined}>
            {!hideStepper && button(-1, atMin, control.id)}
            {prefix != null && <span className="pp-field__affix" data-slot="prefix" aria-hidden="true">{prefix}</span>}
            <input
              ref={inputRef}
              type="text"
              role="spinbutton"
              inputMode={integer && (min ?? -1) >= 0 ? 'numeric' : 'decimal'}
              autoComplete="off"
              className="pp-field__control pp-number__input"
              aria-valuenow={value ?? undefined}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuetext={value === null ? undefined : format(value)}
              value={text}
              required={required}
              disabled={disabled}
              readOnly={readOnly}
              onChange={(e) => { setText(e.target.value); setEditing(true); }}
              onKeyDown={onKey}
              onBlur={(e: FocusEvent<HTMLInputElement>) => { if (editing) commit(); setEditing(false); onBlur?.(e); }}
              {...control}
              {...rest}
            />
            {suffix != null && <span className="pp-field__affix" data-slot="suffix" aria-hidden="true">{suffix}</span>}
            {!hideStepper && button(1, atMax, control.id)}
          </span>
          {name && <input type="hidden" name={name} value={value ?? ''} disabled={disabled} />}
        </>
      )}
    </Field>
  );
});
