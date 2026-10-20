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
 * Closes a dialog after its exit animation. `data-closing` lets the component's CSS run
 * one (Sheet slides out); the dialog stays modal meanwhile, so focus and inertness do
 * not change mid-animation. Without a running, finite animation it closes at once.
 * Returns a function that cancels a pending close.
 */
function closeAfterExit(d: HTMLDialogElement): () => void {
  d.dataset.closing = 'true';
  const exits = typeof d.getAnimations === 'function'
    ? d.getAnimations({ subtree: true }).filter((a) => {
        const effect = a.effect as KeyframeEffect | null;
        return effect?.target === d && Number.isFinite(effect.getComputedTiming().endTime);
      })
    : [];
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    clearTimeout(timer);
    delete d.dataset.closing;
    if (d.open) d.close();
  };
  if (exits.length === 0) { finish(); return () => {}; }
  Promise.all(exits.map((a) => a.finished)).then(finish, finish);
  // A hidden tab may not advance animations; never leave the page modal because of that.
  const longest = Math.max(...exits.map((a) => Number((a.effect as KeyframeEffect).getComputedTiming().endTime)));
  timer = setTimeout(finish, longest + 100);
  return () => { cancelled = true; clearTimeout(timer); delete d.dataset.closing; };
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
  const cancelExit = useRef<(() => void) | null>(null);
  const latest = useRef({ open, onClose, returnFocusTo });
  latest.current = { open, onClose, returnFocusTo };

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    // Reopened during the exit animation: stay open and let it slide back in.
    cancelExit.current?.();
    cancelExit.current = null;
    if (open && !d.open) {
      opener.current = currentOpener();
      d.showModal();
      onOpen?.();
    } else if (!open && d.open) {
      cancelExit.current = closeAfterExit(d);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => cancelExit.current?.(), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onNativeClose = () => {
      // Closed directly (dialog.close(), a second Escape) while the exit animation ran.
      cancelExit.current?.();
      cancelExit.current = null;
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
