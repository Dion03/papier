import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cx } from '../lib/cx';

interface FieldBase {
  label: ReactNode;
  /** Helper text below the field. */
  hint?: ReactNode;
  /** Error text. Sets aria-invalid and is announced with the field. */
  error?: ReactNode;
  /** Visually hides the label while keeping it as the accessible name. */
  hideLabel?: boolean;
}

export type TextFieldProps = FieldBase & InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
export type TextAreaProps = FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

function useFieldIds(id: string | undefined, hint: unknown, error: unknown) {
  const auto = useId();
  const fieldId = id ?? `pp-${auto}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  return { fieldId, hintId, errorId, describedBy: cx(errorId, hintId) || undefined };
}

function FieldShell({ fieldId, label, hint, error, hintId, errorId, hideLabel, required, children }: FieldBase & { fieldId: string; hintId?: string; errorId?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="pp-field" data-invalid={error ? true : undefined}>
      <label htmlFor={fieldId} className={cx('pp-field__label', hideLabel && 'pp-visually-hidden')}>
        {label}
        {required && <span className="pp-field__required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p id={errorId} className="pp-field__error"><span aria-hidden="true">! </span>{error}</p>}
      {hint && <p id={hintId} className="pp-field__hint">{hint}</p>}
    </div>
  );
}

/** A labelled text input in the portfolio's underlined widget style. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, hideLabel, id, className, required, multiline: _m, ...rest }, ref,
) {
  const ids = useFieldIds(id, hint, error);
  return (
    <FieldShell {...{ label, hint, error, hideLabel, required }} {...ids}>
      <input ref={ref} id={ids.fieldId} className={cx('pp-field__control', className)} required={required}
        aria-invalid={error ? true : undefined} aria-describedby={ids.describedBy} {...rest} />
    </FieldShell>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, Omit<TextAreaProps, 'multiline'>>(function TextArea(
  { label, hint, error, hideLabel, id, className, required, rows = 4, ...rest }, ref,
) {
  const ids = useFieldIds(id, hint, error);
  return (
    <FieldShell {...{ label, hint, error, hideLabel, required }} {...ids}>
      <textarea ref={ref} id={ids.fieldId} rows={rows} className={cx('pp-field__control', 'pp-field__control--area', className)} required={required}
        aria-invalid={error ? true : undefined} aria-describedby={ids.describedBy} {...rest} />
    </FieldShell>
  );
});
