import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLabels } from '../lib/labels';
import { Notice, type NoticeTone } from './Notice';
import { Spinner } from './icons';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: NoticeTone;
  action?: ReactNode;
  /** Milliseconds before it goes; `Infinity` keeps it until dismissed. Errors stay by default. */
  duration?: number;
  /** Replaces the tone's mark. Decorative. */
  icon?: ReactNode;
}
interface ToastItem extends ToastOptions { id: number; version: number }

/** A message for each state of `toast.promise`: options, or a function of the result. */
export interface ToastPromiseMessages<T> {
  loading: ToastOptions;
  success: ToastOptions | ((value: T) => ToastOptions);
  error: ToastOptions | ((error: unknown) => ToastOptions);
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (t: ToastOptions) => number;
  dismiss: (id: number) => void;
  /** Changes a toast in place; its timer starts again. */
  update: (id: number, t: Partial<ToastOptions>) => void;
  /**
   * Shows `loading` with a spinner while the promise runs, then turns into `success` or
   * `error` in the same place. Returns the same promise.
   */
  promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>) => Promise<T>;
}

const Ctx = createContext<ToastApi | null>(null);

/** Returns `toast()`, `update()`, `promise()` and `dismiss()`. Must be used inside <ToastProvider>. */
export function useToast(): ToastApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside <ToastProvider>');
  return c;
}

/**
 * Short-lived confirmations in a fixed, always-present live region (so screen readers
 * reliably announce new ones, and updates to them). Toasts pause while hovered or
 * focused, at most `max` show at once, and errors stay until dismissed.
 */
export function ToastProvider({ children, max = 3 }: { children: ReactNode; max?: number }) {
  const labels = useLabels();
  const [items, setItems] = useState<ToastItem[]>([]);
  const [paused, setPaused] = useState(false);
  const next = useRef(1);
  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);
  const toast = useCallback((t: ToastOptions) => {
    const id = next.current++;
    setItems((all) => [...all, { ...t, id, version: 0 }].slice(-max));
    return id;
  }, [max]);
  const update = useCallback((id: number, t: Partial<ToastOptions>) => {
    setItems((all) => all.map((item) => (item.id === id ? { ...item, ...t, version: item.version + 1 } : item)));
  }, []);
  const promise = useCallback(<T,>(p: Promise<T>, m: ToastPromiseMessages<T>) => {
    const id = toast({ tone: 'info', icon: <Spinner width={15} height={15} />, duration: Infinity, ...m.loading });
    // Clear the loading-only fields, so the result gets its tone's own mark and timer.
    const settle = (o: ToastOptions, tone: NoticeTone) => update(id, { icon: undefined, duration: undefined, tone, ...o });
    p.then(
      (v) => settle(typeof m.success === 'function' ? m.success(v) : m.success, 'success'),
      (e) => settle(typeof m.error === 'function' ? m.error(e) : m.error, 'danger'),
    );
    return p;
  }, [toast, update]);
  const api = useMemo(() => ({ toast, dismiss, update, promise }), [toast, dismiss, update, promise]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <section className="pp-toasts" aria-label={labels.notifications}
        onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <ol className="pp-toasts__list" aria-live="polite" aria-relevant="additions text">
          {items.map((t) => <ToastRow key={t.id} item={t} paused={paused} onDismiss={() => dismiss(t.id)} />)}
        </ol>
      </section>
    </Ctx.Provider>
  );
}

function ToastRow({ item, paused, onDismiss }: { item: ToastItem; paused: boolean; onDismiss: () => void }) {
  const duration = item.duration ?? (item.tone === 'danger' ? Infinity : 5000);
  const left = useRef(duration);
  const started = useRef(0);
  const version = useRef(item.version);
  if (version.current !== item.version) { version.current = item.version; left.current = duration; }
  useEffect(() => {
    if (paused || !Number.isFinite(left.current)) return;
    started.current = Date.now();
    const v = item.version;
    const t = window.setTimeout(onDismiss, left.current);
    // After an update the timer starts again, so time spent on the old version does not count.
    return () => { window.clearTimeout(t); if (version.current === v) left.current -= Date.now() - started.current; };
  }, [paused, onDismiss, item.version]);
  return (
    <li className="pp-toasts__item">
      <Notice live="off" tone={item.tone ?? 'success'} title={item.title} action={item.action} icon={item.icon} onDismiss={onDismiss}>{item.description}</Notice>
    </li>
  );
}
