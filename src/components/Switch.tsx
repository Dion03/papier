import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useControllable } from '../lib/useControllable';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'defaultValue'> {
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** An on/off switch for settings that apply immediately. Uses role="switch". */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { label, description, checked, defaultChecked = false, onCheckedChange, id, className, disabled, onClick, ...rest }, ref,
) {
  const auto = useId();
  const btnId = id ?? `pp-${auto}`;
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  return (
    <div className={cx('pp-switch', className)}>
      <span className="pp-check__text">
        <label htmlFor={btnId} className="pp-check__label">{label}</label>
        {description && <span id={`${btnId}-desc`} className="pp-check__desc">{description}</span>}
      </span>
      <button
        ref={ref}
        id={btnId}
        type="button"
        role="switch"
        aria-checked={on}
        aria-describedby={description ? `${btnId}-desc` : undefined}
        disabled={disabled}
        className="pp-switch__track"
        onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) setOn(!on); }}
        {...rest}
      >
        <span className="pp-switch__thumb" />
      </button>
    </div>
  );
});
