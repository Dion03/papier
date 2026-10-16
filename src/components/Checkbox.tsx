import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Check } from './icons';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

/** A native checkbox with a Papier box; keyboard, forms and autofill keep working. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, id, className, ...rest }, ref,
) {
  const auto = useId();
  const inputId = id ?? `pp-${auto}`;
  const descId = description ? `${inputId}-desc` : undefined;
  return (
    <div className={cx('pp-check', className)}>
      <span className="pp-check__box">
        <input ref={ref} id={inputId} type="checkbox" className="pp-check__input" aria-describedby={descId} {...rest} />
        <Check className="pp-check__mark" width={14} height={14} strokeWidth={2.4} />
      </span>
      <span className="pp-check__text">
        <label htmlFor={inputId} className="pp-check__label">{label}</label>
        {description && <span id={descId} className="pp-check__desc">{description}</span>}
      </span>
    </div>
  );
});
