import {
  createContext, forwardRef, useContext, useId, useRef,
  type HTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type PointerEvent, type ReactNode, type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../lib/cx';
import { useMergedRefs } from '../lib/slot';
import { useIsoLayoutEffect } from '../lib/useIsoLayoutEffect';

export interface UseFieldOptions {
  /** Id for the control; generated when left out. */
  id?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Extra ids for aria-describedby, after the error and hint. */
  describedBy?: string;
}

/** Props that connect any input to its label, hint and error. Spread them on the control. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

export interface FieldState {
  ids: { control: string; label: string; hint?: string; error?: string };
  controlProps: FieldControlProps;
  labelProps: { id: string; htmlFor: string };
  hintProps: { id?: string };
  errorProps: { id?: string };
}

/**
 * The ids and ARIA links of a field: label → control via htmlFor, error and hint via
 * aria-describedby (error first), aria-invalid only when there is an error.
 * For a control that is not a native input, also set aria-labelledby={ids.label}.
 */
export function useField({ id, hint, error, describedBy }: UseFieldOptions = {}): FieldState {
  const auto = useId();
  const control = id ?? `pp-${auto}`;
  const label = `${control}-label`;
  const hintId = hint ? `${control}-hint` : undefined;
  const errorId = error ? `${control}-error` : undefined;
  return {
    ids: { control, label, hint: hintId, error: errorId },
    controlProps: { id: control, 'aria-describedby': cx(errorId, hintId, describedBy) || undefined, 'aria-invalid': error ? true : undefined },
    labelProps: { id: label, htmlFor: control },
    hintProps: { id: hintId },
    errorProps: { id: errorId },
  };
}

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Adds a decorative asterisk; mark the control itself as required too. */
  required?: boolean;
  /** Visually hides the label while keeping it as the accessible name. */
  visuallyHidden?: boolean;
}

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(function FieldLabel({ required, visuallyHidden, className, children, ...rest }, ref) {
  return (
    <label ref={ref} className={cx('pp-field__label', visuallyHidden && 'pp-visually-hidden', className)} {...rest}>
      {children}
      {required && <span className="pp-field__required" aria-hidden="true"> *</span>}
    </label>
  );
});

/** Helper text below a field. Renders nothing without children. */
export const FieldHint = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function FieldHint({ className, children, ...rest }, ref) {
  if (!children) return null;
  return <p ref={ref} className={cx('pp-field__hint', className)} {...rest}>{children}</p>;
});

/** Error text below a field, with a mark so colour is not the only signal. Renders nothing without children. */
export const FieldError = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function FieldError({ className, children, ...rest }, ref) {
  if (!children) return null;
  return <p ref={ref} className={cx('pp-field__error', className)} {...rest}><span aria-hidden="true">! </span>{children}</p>;
});

const FieldContext = createContext<FieldState | null>(null);

/** Inside <Field>: the props to spread on your own control. */
export function useFieldControl(): FieldControlProps {
  const f = useContext(FieldContext);
  if (!f) throw new Error('useFieldControl must be used inside <Field>');
  return f.controlProps;
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
  label: ReactNode;
  /** Helper text below the field. */
  hint?: ReactNode;
  /** Error text. Sets aria-invalid and is announced with the field. */
  error?: ReactNode;
  /** Visually hides the label while keeping it as the accessible name. */
  hideLabel?: boolean;
  /** Shows the asterisk; set `required` on the control as well. */
  required?: boolean;
  /** Id for the control. */
  id?: string;
  /** Extra ids for the control's aria-describedby. */
  describedBy?: string;
  /** The control: a render function that gets the props, or elements that call useFieldControl(). */
  children: ReactNode | ((control: FieldControlProps) => ReactNode);
}

/**
 * Label, control, error and hint with Papier's layout and ARIA links, for any input:
 * your own, or one from another library.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, hint, error, hideLabel, required, id, describedBy, className, children, ...rest }, ref,
) {
  const field = useField({ id, hint, error, describedBy });
  return (
    <FieldContext.Provider value={field}>
      <div ref={ref} className={cx('pp-field', className)} data-invalid={error ? true : undefined} {...rest}>
        <FieldLabel {...field.labelProps} visuallyHidden={hideLabel} required={required}>{label}</FieldLabel>
        {typeof children === 'function' ? children(field.controlProps) : children}
        <FieldError {...field.errorProps}>{error}</FieldError>
        <FieldHint {...field.hintProps}>{hint}</FieldHint>
      </div>
    </FieldContext.Provider>
  );
});

interface FieldBase {
  label: ReactNode;
  /** Helper text below the field. */
  hint?: ReactNode;
  /** Error text. Sets aria-invalid and is announced with the field. */
  error?: ReactNode;
  /** Visually hides the label while keeping it as the accessible name. */
  hideLabel?: boolean;
}

export type TextFieldProps = FieldBase & Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  multiline?: false;
  /** Before the value: an icon or a unit such as €. Decorative, so name the unit in the label or hint too. */
  prefix?: ReactNode;
  /** After the value: an icon or a unit such as kg. Decorative, so name the unit in the label or hint too. */
  suffix?: ReactNode;
};
export type TextAreaProps = FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement> & {
  multiline: true;
  /** Grows with its content instead of scrolling, from `rows` up to `maxRows`. */
  autoResize?: boolean;
  /** With autoResize: the height at which it stops growing and scrolls. */
  maxRows?: number;
};

/** A pointer down on a prefix or suffix focuses the input, like a click on the field would. */
const focusInput = (e: PointerEvent<HTMLSpanElement>) => {
  const input = e.currentTarget.querySelector('input');
  if (input && e.target !== input) { e.preventDefault(); input.focus(); }
};

/** A labelled text input in the portfolio's underlined widget style. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, hideLabel, id, className, required, prefix, suffix, multiline: _m, 'aria-describedby': describedBy, ...rest }, ref,
) {
  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy }}>
      {(control) => {
        const input = <input ref={ref} className={cx('pp-field__control', className)} required={required} {...control} {...rest} />;
        if (prefix == null && suffix == null) return input;
        return (
          <span className="pp-field__group" onPointerDown={focusInput}>
            {prefix != null && <span className="pp-field__affix" data-slot="prefix" aria-hidden="true">{prefix}</span>}
            {input}
            {suffix != null && <span className="pp-field__affix" data-slot="suffix" aria-hidden="true">{suffix}</span>}
          </span>
        );
      }}
    </Field>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, Omit<TextAreaProps, 'multiline'>>(function TextArea(
  { label, hint, error, hideLabel, id, className, required, rows = 4, autoResize, maxRows, onInput, 'aria-describedby': describedBy, ...rest }, ref,
) {
  const area = useRef<HTMLTextAreaElement>(null);
  const areaRef = useMergedRefs(area, ref);
  const resize = () => {
    const t = area.current;
    if (!t || !autoResize) return;
    const cs = getComputedStyle(t);
    const px = (v: string) => parseFloat(v) || 0;
    const border = px(cs.borderTopWidth) + px(cs.borderBottomWidth);
    const max = maxRows ? (px(cs.lineHeight) || 24) * maxRows + px(cs.paddingTop) + px(cs.paddingBottom) + border : Infinity;
    t.style.height = 'auto';
    const needed = t.scrollHeight + border;
    t.style.height = `${Math.min(needed, max)}px`;
    t.style.overflowY = needed > max ? 'auto' : 'hidden';
  };
  useIsoLayoutEffect(resize, [rest.value, autoResize, maxRows]);
  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy }}>
      {(control) => (
        <textarea ref={areaRef} rows={rows} className={cx('pp-field__control', 'pp-field__control--area', className)} required={required}
          data-autoresize={autoResize || undefined} onInput={(e) => { resize(); onInput?.(e); }} {...control} {...rest} />
      )}
    </Field>
  );
});
