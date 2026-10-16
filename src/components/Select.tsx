import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import { Field } from './Field';
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
  { label, hint, error, hideLabel, options, placeholder, id, className, children, required, 'aria-describedby': describedBy, ...rest }, ref,
) {
  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy }}>
      {(control) => (
        <span className="pp-select">
          <select ref={ref} className={cx('pp-field__control', 'pp-select__control', className)} required={required} {...control} {...rest}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options?.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
            {children}
          </select>
          <ChevronDown className="pp-select__chevron" />
        </span>
      )}
    </Field>
  );
});
