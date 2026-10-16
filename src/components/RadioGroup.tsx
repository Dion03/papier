import { useId, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useControllable } from '../lib/useControllable';

export interface RadioOption<T extends string> { value: T; label: ReactNode; description?: ReactNode; disabled?: boolean }

export interface RadioGroupProps<T extends string> {
  legend: ReactNode;
  options: Array<RadioOption<T>>;
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  name?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** `card` gives each option a bordered tile, handy for plans or modes. */
  appearance?: 'list' | 'card';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/** A fieldset of native radio buttons: arrow keys, form submit and labels all work natively. */
export function RadioGroup<T extends string>({ legend, options, value, defaultValue, onValueChange, name, hint, error, appearance = 'list', orientation = 'vertical', className }: RadioGroupProps<T>) {
  const auto = useId();
  const groupName = name ?? `pp-${auto}`;
  const [current, setCurrent] = useControllable<T | undefined>(value, defaultValue, (v) => v !== undefined && onValueChange?.(v));
  const hintId = hint ? `${groupName}-hint` : undefined;
  const errorId = error ? `${groupName}-error` : undefined;
  return (
    <fieldset className={cx('pp-radio-group', className)} data-appearance={appearance} data-orientation={orientation}
      aria-describedby={cx(errorId, hintId) || undefined} aria-invalid={error ? true : undefined}>
      <legend className="pp-field__label pp-radio-group__legend">{legend}</legend>
      {hint && <p id={hintId} className="pp-field__hint">{hint}</p>}
      <div className="pp-radio-group__options">
        {options.map((o) => {
          const id = `${groupName}-${o.value}`;
          return (
            <div key={o.value} className="pp-radio" data-checked={current === o.value || undefined} data-disabled={o.disabled || undefined}>
              <input type="radio" id={id} name={groupName} value={o.value} checked={current === o.value} disabled={o.disabled}
                onChange={() => setCurrent(o.value)} className="pp-radio__input" aria-describedby={o.description ? `${id}-desc` : undefined} />
              <span className="pp-check__text">
                <label htmlFor={id} className="pp-check__label">{o.label}</label>
                {o.description && <span id={`${id}-desc`} className="pp-check__desc">{o.description}</span>}
              </span>
            </div>
          );
        })}
      </div>
      {error && <p id={errorId} className="pp-field__error"><span aria-hidden="true">! </span>{error}</p>}
    </fieldset>
  );
}
