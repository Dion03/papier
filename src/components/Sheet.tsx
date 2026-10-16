import { forwardRef, useId, useRef, type ReactNode, type RefObject } from 'react';
import { useModalDialog } from '../lib/useModalDialog';
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
  /** Where focus goes after closing. Defaults to the element that opened it. */
  returnFocusTo?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * A panel that slides in from an edge: the mobile navigation sheet, filters, details.
 * Built on the native modal <dialog>, like Dialog.
 */
export const Sheet = forwardRef<HTMLDialogElement, SheetProps>(function Sheet({ open, onClose, title, hideTitle, side = 'right', children, footer, returnFocusTo, className }, forwardedRef) {
  const labels = useLabels();
  const ref = useRef<HTMLDialogElement>(null);
  const dialogRef = useMergedRefs(ref, forwardedRef);
  const id = useId();
  useModalDialog(ref, open, onClose, { returnFocusTo });
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
