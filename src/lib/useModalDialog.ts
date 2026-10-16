import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'button, a[href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
let lastUsed: HTMLElement | null = null;
let tracking = false;

const remember = (e: Event) => {
  const el = e.target instanceof Element ? e.target.closest<HTMLElement>(FOCUSABLE) : null;
  if (el) lastUsed = el;
};

/**
 * Remembers the last control a pointer or key was used on. Safari does not focus a
 * button when it is clicked, so document.activeElement alone cannot tell which
 * button opened a dialog.
 */
export function trackOpeners() {
  if (tracking || typeof document === 'undefined') return;
  tracking = true;
  document.addEventListener('pointerdown', remember, true);
  document.addEventListener('keydown', remember, true);
}
trackOpeners();

/**
 * The element that opened a dialog. Usually the focused one; but when focus sits on
 * an ancestor of the control that was just used (Safari focuses <body> or the nearest
 * focusable container, such as <main tabindex="-1">), the control itself.
 */
export function currentOpener(): HTMLElement | null {
  const active = document.activeElement as HTMLElement | null;
  const used = lastUsed?.isConnected ? lastUsed : null;
  if (used && (!active || (active !== used && active.contains(used)))) return used;
  return active;
}

/**
 * Opens and closes a native modal <dialog> with `open`, and returns focus to
 * `returnFocusTo` or else to whatever opened it. The close listener is registered
 * once, so focus also returns when the dialog closes synchronously.
 */
export function useModalDialog(
  ref: RefObject<HTMLDialogElement | null>, open: boolean, onClose: () => void,
  { returnFocusTo, onOpen }: { returnFocusTo?: RefObject<HTMLElement | null>; onOpen?: () => void } = {},
) {
  const opener = useRef<HTMLElement | null>(null);
  const latest = useRef({ open, onClose, returnFocusTo });
  latest.current = { open, onClose, returnFocusTo };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = currentOpener();
      d.showModal();
      onOpen?.();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onNativeClose = () => {
      const { open: stillOpen, onClose: close, returnFocusTo: target } = latest.current;
      (target?.current ?? opener.current)?.focus?.();
      opener.current = null;
      // Closed by the browser (e.g. a form with method="dialog") while the app thinks it is open.
      if (stillOpen) close();
    };
    d.addEventListener('close', onNativeClose);
    return () => d.removeEventListener('close', onNativeClose);
  }, [ref]);
}
