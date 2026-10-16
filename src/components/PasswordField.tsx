import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useControllable } from '../lib/useControllable';
import { Field } from './Field';
import { Eye, EyeOff } from './icons';

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'prefix'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  /** Whether the password shows as text. */
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

/**
 * A password input with a button that shows what you typed, so people can check it
 * instead of typing it twice. The button is a toggle (aria-pressed) and stays in the
 * Tab order. Set `autoComplete` to `current-password` or `new-password`.
 * The ref points at the input.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, hint, error, hideLabel, id, className, required, disabled, visible: visibleProp, defaultVisible = false, onVisibleChange, 'aria-describedby': describedBy, ...rest }, ref,
) {
  const labels = useLabels();
  const [visible, setVisible] = useControllable(visibleProp, defaultVisible, onVisibleChange);
  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy }} className={cx('pp-password', className)}>
      {(control) => (
        <span className="pp-field__group">
          <input ref={ref} type={visible ? 'text' : 'password'} className="pp-field__control" required={required} disabled={disabled}
            autoCapitalize="none" autoCorrect="off" spellCheck={false} {...control} {...rest} />
          <button type="button" className="pp-password__toggle" aria-pressed={visible} aria-controls={control.id} disabled={disabled}
            aria-label={labels.showPassword} onClick={() => setVisible(!visible)}>
            {visible ? <EyeOff width={18} height={18} /> : <Eye width={18} height={18} />}
          </button>
        </span>
      )}
    </Field>
  );
});
