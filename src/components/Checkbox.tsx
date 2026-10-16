import {
  forwardRef, useId, useRef, type ForwardedRef, type InputHTMLAttributes, type ReactElement, type ReactNode, type Ref,
} from 'react';
import { cx } from '../lib/cx';
import { useMergedRefs } from '../lib/slot';
import { useControllable } from '../lib/useControllable';
import { useIsoLayoutEffect } from '../lib/useIsoLayoutEffect';
import { FieldError, FieldHint } from './Field';
import { Check, Minus } from './icons';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  /** Partly checked, e.g. "select all" when some rows are selected. Announced as "mixed". */
  indeterminate?: boolean;
  /** Error text, e.g. for terms that must be accepted. Sets aria-invalid. */
  error?: ReactNode;
}

/** A native checkbox with a Papier box; keyboard, forms and autofill keep working. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, error, id, className, 'aria-describedby': describedBy, ...rest }, ref,
) {
  const auto = useId();
  const inputId = id ?? `pp-${auto}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  // indeterminate only exists as a DOM property, not as an attribute.
  useIsoLayoutEffect(() => { if (input.current) input.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <div className={cx('pp-check', className)} data-invalid={error ? true : undefined}>
      {/* A label, so its 44px touch area (::before) toggles the input instead of covering it. */}
      <label className="pp-check__box">
        <input ref={inputRef} id={inputId} type="checkbox" className="pp-check__input"
          aria-describedby={cx(errorId, descId, describedBy) || undefined} aria-invalid={error ? true : undefined} {...rest} />
        <Check className="pp-check__mark" width={14} height={14} strokeWidth={2.4} />
        <Minus className="pp-check__dash" width={14} height={14} strokeWidth={2.4} />
      </label>
      <span className="pp-check__text">
        <label htmlFor={inputId} className="pp-check__label">{label}</label>
        {description && <span id={descId} className="pp-check__desc">{description}</span>}
        <FieldError id={errorId}>{error}</FieldError>
      </span>
    </div>
  );
});

export interface CheckboxOption<T extends string> { value: T; label: ReactNode; description?: ReactNode; disabled?: boolean }

export interface CheckboxGroupProps<T extends string> {
  legend: ReactNode;
  options: Array<CheckboxOption<T>>;
  /** The checked values, in the order of `options`. */
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (value: T[]) => void;
  /** Form name; every checked option is submitted under it. */
  name?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** `card` gives each option a bordered tile. */
  appearance?: 'list' | 'card';
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  className?: string;
}

/** A fieldset of native checkboxes for choosing several options, with a shared hint and error. */
export const CheckboxGroup = forwardRef(function CheckboxGroup<T extends string>(
  { legend, options, value, defaultValue = [], onValueChange, name, hint, error, appearance = 'list', orientation = 'vertical', disabled, className }: CheckboxGroupProps<T>,
  ref: ForwardedRef<HTMLFieldSetElement>,
) {
  const auto = `pp-${useId()}`;
  const [current, setCurrent] = useControllable<T[]>(value, defaultValue, onValueChange);
  const hintId = hint ? `${auto}-hint` : undefined;
  const errorId = error ? `${auto}-error` : undefined;
  const toggle = (v: T, on: boolean) => {
    const set = new Set(current);
    if (on) set.add(v); else set.delete(v);
    setCurrent(options.map((o) => o.value).filter((o) => set.has(o)));
  };
  return (
    <fieldset ref={ref} className={cx('pp-radio-group', 'pp-checkbox-group', className)} data-appearance={appearance} data-orientation={orientation}
      disabled={disabled} aria-describedby={cx(errorId, hintId) || undefined} aria-invalid={error ? true : undefined}>
      <legend className="pp-field__label pp-radio-group__legend">{legend}</legend>
      <FieldHint id={hintId}>{hint}</FieldHint>
      <div className="pp-radio-group__options">
        {options.map((o) => (
          <Checkbox key={o.value} id={`${auto}-${o.value}`} name={name} value={o.value} label={o.label} description={o.description}
            disabled={o.disabled} checked={current.includes(o.value)}
            onChange={(e) => toggle(o.value, e.target.checked)} />
        ))}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
}) as <T extends string>(props: CheckboxGroupProps<T> & { ref?: Ref<HTMLFieldSetElement> }) => ReactElement | null;
