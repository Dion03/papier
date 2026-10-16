import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLabels } from '../lib/labels';
import { Notice, type NoticeTone } from './Notice';

export interface ToastOptions { title: ReactNode; description?: ReactNode; tone?: NoticeTone; action?: ReactNode; duration?: number }
interface ToastItem extends ToastOptions { id: number }
interface ToastApi { toast: (t: ToastOptions) => number; dismiss: (id: number) => void }

const Ctx = createContext<ToastApi | null>(null);

/** Returns `toast()` and `dismiss()`. Must be used inside <ToastProvider>. */
export function useToast(): ToastApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside <ToastProvider>');
  return c;
}

/**
 * Short-lived confirmations in a fixed, always-present live region (so screen readers
 * reliably announce new ones). Toasts pause while hovered or
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
    setItems((all) => [...all, { ...t, id }].slice(-max));
    return id;
  }, [max]);
  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <section className="pp-toasts" aria-label={labels.notifications}
        onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <ol className="pp-toasts__list" aria-live="polite" aria-relevant="additions">
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
  useEffect(() => {
    if (paused || !Number.isFinite(left.current)) return;
    started.current = Date.now();
    const t = window.setTimeout(onDismiss, left.current);
    return () => { window.clearTimeout(t); left.current -= Date.now() - started.current; };
  }, [paused, onDismiss]);
  return (
    <li className="pp-toasts__item">
      <Notice live="off" tone={item.tone ?? 'success'} title={item.title} action={item.action} onDismiss={onDismiss}>{item.description}</Notice>
    </li>
  );
}
