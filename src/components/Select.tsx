import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import { ChevronDown } from './icons';

export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  /** Options; or pass <option>/<optgroup> children yourself. */
  options?: SelectOption[];
  placeholder?: string;
}

/**
 * A styled native <select>. Native keeps the phone's own picker, typeahead and
 * screen-reader support, which a custom listbox would have to rebuild.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, hideLabel, options, placeholder, id, className, children, required, ...rest }, ref,
) {
  const auto = useId();
  const sid = id ?? `pp-${auto}`;
  const hintId = hint ? `${sid}-hint` : undefined;
  const errorId = error ? `${sid}-error` : undefined;
  return (
    <div className="pp-field" data-invalid={error ? true : undefined}>
      <label htmlFor={sid} className={cx('pp-field__label', hideLabel && 'pp-visually-hidden')}>
        {label}{required && <span className="pp-field__required" aria-hidden="true"> *</span>}
      </label>
      <span className="pp-select">
        <select ref={ref} id={sid} className={cx('pp-field__control', 'pp-select__control', className)} required={required}
          aria-invalid={error ? true : undefined} aria-describedby={cx(errorId, hintId) || undefined} {...rest}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options?.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
          {children}
        </select>
        <ChevronDown className="pp-select__chevron" />
      </span>
      {error && <p id={errorId} className="pp-field__error"><span aria-hidden="true">! </span>{error}</p>}
      {hint && <p id={hintId} className="pp-field__hint">{hint}</p>}
    </div>
  );
});
