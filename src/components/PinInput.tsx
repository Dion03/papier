import { forwardRef, useRef, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useControllable } from '../lib/useControllable';
import { Field } from './Field';

export interface PinInputProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  /** Number of boxes. */
  length?: number;
  /** The code; an empty box is a space, trailing spaces are left out. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once every box is filled, e.g. to submit the code. */
  onComplete?: (value: string) => void;
  /** `numeric` only takes digits and shows the number keypad. */
  type?: 'numeric' | 'alphanumeric';
  /** Hides the characters, as for a PIN. */
  mask?: boolean;
  /** Form name for the whole code. */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  id?: string;
  className?: string;
}

/**
 * A code split over a few boxes, e.g. a one-time sign-in code. Typing moves to the next
 * box, Backspace goes back, arrows move, and a pasted or autofilled code (SMS one-time-code)
 * fills every box at once. Each box is named "Teken 2 van 6"; the group carries the label,
 * hint and error. The ref points at the first box.
 */
export const PinInput = forwardRef<HTMLInputElement, PinInputProps>(function PinInput(
  { label, hint, error, hideLabel, length = 6, value: valueProp, defaultValue = '', onValueChange, onComplete, type = 'numeric', mask, name, disabled, required, autoFocus, id, className }, ref,
) {
  const labels = useLabels();
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange);
  const boxes = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, i) => (value[i] && value[i] !== ' ' ? value[i] : ''));
  const allowed = type === 'numeric' ? /\d/ : /[0-9a-z]/i;
  const clean = (text: string) => Array.from(text).filter((c) => allowed.test(c)).map((c) => c.toUpperCase());

  const focus = (i: number) => { const el = boxes.current[Math.max(0, Math.min(length - 1, i))]; el?.focus(); el?.select(); };
  const commit = (next: string[]) => {
    const text = next.map((c) => c || ' ').join('').trimEnd();
    setValue(text);
    if (next.every(Boolean)) onComplete?.(next.join(''));
  };
  /** Writes characters from box `start` onwards, as for typing, pasting and autofill. */
  const fill = (start: number, text: string) => {
    const incoming = clean(text);
    if (!incoming.length) return;
    const next = [...chars];
    incoming.slice(0, length - start).forEach((c, k) => { next[start + k] = c; });
    commit(next);
    focus(Math.min(start + incoming.length, length - 1));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...chars];
      if (next[i]) { next[i] = ''; commit(next); } else if (i > 0) { next[i - 1] = ''; commit(next); focus(i - 1); }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const next = [...chars]; next[i] = ''; commit(next);
    } else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { e.preventDefault(); focus(i - 1); }
    else if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { e.preventDefault(); focus(i + 1); }
    else if (e.key === 'Home') { e.preventDefault(); focus(0); }
    else if (e.key === 'End') { e.preventDefault(); focus(length - 1); }
  };

  return (
    <Field {...{ label, hint, error, hideLabel, required, id }} className={cx('pp-pin', className)}>
      {(control) => (
        <>
          <div className="pp-pin__boxes" role="group" aria-labelledby={`${control.id}-label`} aria-describedby={control['aria-describedby']}>
            {chars.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                  if (i === 0) { if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }
                }}
                id={i === 0 ? control.id : `${control.id}-${i}`}
                type={mask ? 'password' : 'text'}
                inputMode={type === 'numeric' ? 'numeric' : 'text'}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                autoCapitalize="characters"
                spellCheck={false}
                aria-label={labels.pinChar(i + 1, length)}
                aria-invalid={control['aria-invalid']}
                className="pp-pin__box"
                data-filled={c ? true : undefined}
                value={c}
                disabled={disabled}
                required={required && i === 0}
                autoFocus={autoFocus && i === 0}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => {
                  const typed = e.target.value;
                  // One key in a box that already held a character: keep only the new one, whether the
                  // caret sat after it ("35") or before it ("53"). A longer value is autofill or a paste.
                  const text = c && typed.length === 2 && typed.includes(c) ? (typed.startsWith(c) ? typed[1] : typed[0]) : typed;
                  if (!text) { const next = [...chars]; next[i] = ''; commit(next); return; }
                  fill(i, text);
                }}
                onKeyDown={(e) => onKeyDown(e, i)}
                onPaste={(e: ClipboardEvent<HTMLInputElement>) => { e.preventDefault(); fill(i, e.clipboardData.getData('text')); }}
              />
            ))}
          </div>
          {name && <input type="hidden" name={name} value={chars.join('')} disabled={disabled} />}
        </>
      )}
    </Field>
  );
});
