import { forwardRef, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useMergedRefs } from '../lib/slot';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { Button } from './Button';

export interface AlertDialogProps {
  open: boolean;
  /** Called for Escape, Cancel and after a successful confirm. */
  onClose: () => void;
  /**
   * The action. Return a promise to keep the dialog open with a loading button until it
   * settles: it closes when the promise resolves and stays open when it rejects.
   */
  onConfirm: () => void | Promise<unknown>;
  /** A question that names the consequence, e.g. "Plaat uit je collectie halen?". */
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** A verb for the action, e.g. "Verwijderen". Never "OK" or "Ja". */
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` for actions that delete or cannot be undone. */
  tone?: 'default' | 'danger';
  className?: string;
}

/**
 * A confirmation that interrupts (role="alertdialog") on the native <dialog>. It only
 * closes through its buttons or Escape, never by a click beside it, and focus starts
 * on Cancel so Enter never triggers a destructive action by accident.
 */
export const AlertDialog = forwardRef<HTMLDialogElement, AlertDialogProps>(function AlertDialog(
  { open, onClose, onConfirm, title, description, children, confirmLabel, cancelLabel, tone = 'default', className }, forwardedRef,
) {
  const labels = useLabels();
  const ref = useRef<HTMLDialogElement>(null);
  const dialogRef = useMergedRefs(ref, forwardedRef);
  const cancel = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      cancel.current?.focus();
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

  useEffect(() => { if (!open) setBusy(false); }, [open]);

  const confirm = async () => {
    const result = onConfirm();
    if (!result || typeof (result as Promise<unknown>).then !== 'function') { onClose(); return; }
    setBusy(true);
    try {
      await result;
      onClose();
    } catch {
      // The caller reports the failure (e.g. with a toast); the dialog stays so they can retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      className={cx('pp-dialog', 'pp-alert-dialog', className)}
      data-size="sm"
      data-tone={tone === 'danger' ? 'danger' : undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      aria-busy={busy || undefined}
      onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }}
    >
      <div className="pp-dialog__panel">
        <h2 id={`${id}-title`} className="pp-dialog__title">{title}</h2>
        {description && <p id={`${id}-desc`} className="pp-dialog__desc">{description}</p>}
        {children && <div className="pp-dialog__body">{children}</div>}
        <footer className="pp-dialog__footer">
          <Button ref={cancel} variant="secondary" onClick={onClose} disabled={busy}>{cancelLabel ?? labels.cancel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={busy} onClick={confirm}>{confirmLabel}</Button>
        </footer>
      </div>
    </dialog>
  );
});
