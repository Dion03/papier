import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { Check, Close, Copy } from './icons';
import type { ButtonVariant } from './Button';

export interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'children' | 'onCopy'> {
  /** The text to copy, or a function that returns it at the moment of copying. */
  value: string | (() => string);
  /** Visible label. Without it the button shows only an icon, named by the "copy" label. */
  children?: ReactNode;
  /** Label while the copy is confirmed; defaults to the "copied" label. */
  copiedLabel?: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  /** How long the confirmation stays, in ms. */
  timeout?: number;
  onCopy?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
}

async function writeText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  // Older browsers and pages that are not served over https.
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.append(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

/**
 * Copies text to the clipboard and confirms it in place: the icon becomes a tick and the
 * result is announced, also when copying fails. With children it is a labelled Button,
 * without them a compact icon button.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, children, copiedLabel, variant = 'secondary', size = 'sm', timeout = 2000, onCopy, onCopyError, onClick, className, type = 'button', ...rest }, ref,
) {
  const labels = useLabels();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const text = typeof value === 'function' ? value() : value;
    window.clearTimeout(timer.current);
    try {
      await writeText(text);
      setState('copied');
      onCopy?.(text);
    } catch (error) {
      setState('failed');
      onCopyError?.(error);
    }
    timer.current = window.setTimeout(() => setState('idle'), timeout);
  };

  const icon = state === 'copied' ? <Check width={16} height={16} /> : state === 'failed' ? <Close width={16} height={16} /> : <Copy width={16} height={16} />;
  const message = state === 'copied' ? labels.copied : state === 'failed' ? labels.copyFailed : '';
  const iconOnly = children == null;

  return (
    <>
    <button
      ref={ref}
      type={type}
      className={cx(iconOnly ? 'pp-icon-button' : 'pp-button', 'pp-copy', className)}
      data-variant={iconOnly ? 'ghost' : variant}
      data-size={size}
      data-state={state}
      aria-label={iconOnly ? labels.copy : undefined}
      title={iconOnly ? labels.copy : undefined}
      onClick={copy}
      {...rest}
    >
      <span className="pp-copy__icon" aria-hidden="true">{icon}</span>
      {!iconOnly && <span className="pp-button__label">{state === 'copied' ? (copiedLabel ?? labels.copied) : state === 'failed' ? labels.copyFailed : children}</span>}
    </button>
    {/* Outside the button, so the announcement never becomes part of its name. */}
    <span className="pp-visually-hidden" role="status">{message}</span>
    </>
  );
});
