import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Close } from './icons';

export interface DialogProps {
  open: boolean;
  /** Called for Escape, the close button and (by default) a backdrop click. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Actions, e.g. Cancel and Confirm buttons. */
  footer?: ReactNode;
  closeLabel?: string;
  dismissOnBackdrop?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A modal on the native <dialog> element: real focus trap, Escape, inert background,
 * and focus returns to whatever opened it.
 */
export function Dialog({ open, onClose, title, description, children, footer, closeLabel = 'Sluiten', dismissOnBackdrop = true, size = 'md', className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onNativeClose = () => { opener.current?.focus?.(); if (open) onClose(); };
    d.addEventListener('close', onNativeClose);
    return () => d.removeEventListener('close', onNativeClose);
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      className={cx('pp-dialog', className)}
      data-size={size}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (dismissOnBackdrop && e.target === e.currentTarget) onClose(); }}
    >
      <div className="pp-dialog__panel">
        <header className="pp-dialog__header">
          <h2 id={`${id}-title`} className="pp-dialog__title">{title}</h2>
          <button type="button" className="pp-dialog__close" aria-label={closeLabel} onClick={onClose}><Close /></button>
        </header>
        {description && <p id={`${id}-desc`} className="pp-dialog__desc">{description}</p>}
        {children && <div className="pp-dialog__body">{children}</div>}
        {footer && <footer className="pp-dialog__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
