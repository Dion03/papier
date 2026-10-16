import { forwardRef, useEffect, useId, useRef, type ReactNode } from 'react';
import { useMergedRefs } from '../lib/slot';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { Close } from './icons';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Visually hide the title (it stays the accessible name), e.g. for a navigation sheet. */
  hideTitle?: boolean;
  side?: 'right' | 'left' | 'bottom' | 'top';
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * A panel that slides in from an edge: the mobile navigation sheet, filters, details.
 * Built on the native modal <dialog>, like Dialog.
 */
export const Sheet = forwardRef<HTMLDialogElement, SheetProps>(function Sheet({ open, onClose, title, hideTitle, side = 'right', children, footer, className }, forwardedRef) {
  const labels = useLabels();
  const ref = useRef<HTMLDialogElement>(null);
  const dialogRef = useMergedRefs(ref, forwardedRef);
  const opener = useRef<HTMLElement | null>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { opener.current = document.activeElement as HTMLElement | null; d.showModal(); }
    else if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onNativeClose = () => { opener.current?.focus?.(); if (open) onClose(); };
    d.addEventListener('close', onNativeClose);
    return () => d.removeEventListener('close', onNativeClose);
  }, [open, onClose]);
  return (
    <dialog ref={dialogRef} className={cx('pp-sheet', className)} data-side={side} aria-labelledby={`${id}-title`}
      onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pp-sheet__panel">
        <header className="pp-sheet__header">
          <h2 id={`${id}-title`} className={cx('pp-dialog__title', hideTitle && 'pp-visually-hidden')}>{title}</h2>
          <button type="button" className="pp-dialog__close" aria-label={labels.close} onClick={onClose}><Close /></button>
        </header>
        <div className="pp-sheet__body">{children}</div>
        {footer && <footer className="pp-dialog__footer">{footer}</footer>}
      </div>
    </dialog>
  );
});
