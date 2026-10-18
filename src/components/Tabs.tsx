import { createContext, forwardRef, useContext, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { useMergedRefs } from '../lib/slot';
import { cx } from '../lib/cx';
import { useIsoLayoutEffect } from '../lib/useIsoLayoutEffect';
import { useControllable } from '../lib/useControllable';

interface TabsCtx { value: string; select: (v: string) => void; base: string; orientation: 'horizontal' | 'vertical'; activation: 'automatic' | 'manual' }
const Ctx = createContext<TabsCtx | null>(null);
const useTabs = () => { const c = useContext(Ctx); if (!c) throw new Error('Tab must be used inside <Tabs>'); return c; };
const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, '_');

export interface TabsProps {
  value?: string;
  /** The tab that starts open when `value` is not set. */
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
  /** `vertical` puts the tabs in a column beside the panel (above it on small screens) and uses the up and down arrows. */
  orientation?: 'horizontal' | 'vertical';
  /** `manual`: arrows only move focus and Enter or Space opens the tab. Use it when a panel is slow to load. */
  activation?: 'automatic' | 'manual';
}

/** Tabs following the WAI-ARIA pattern: arrow keys move and activate, Tab moves into the panel. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue, onValueChange, children, className, orientation = 'horizontal', activation = 'automatic' }, ref,
) {
  const [current, select] = useControllable(value, defaultValue ?? '', onValueChange);
  const base = useId();
  return (
    <Ctx.Provider value={{ value: current, select, base, orientation, activation }}>
      <div ref={ref} className={cx('pp-tabs', className)} data-orientation={orientation}>{children}</div>
    </Ctx.Provider>
  );
});

export interface TabListProps { label: string; children: ReactNode; className?: string }

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList({ label, children, className }, forwardedRef) {
  const { value, orientation, activation } = useTabs();
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useMergedRefs(ref, forwardedRef);
  const [bar, setBar] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useIsoLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (el) setBar({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    // Tabs too: their width changes when a web font arrives, the list's may not.
    if (ref.current) ro?.observe(ref.current);
    ref.current?.querySelectorAll('[role="tab"]').forEach((el) => ro?.observe(el));
    return () => ro?.disconnect();
  }, [value, orientation]);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []);
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    // Vertical lists also accept left and right, as many people try those first.
    const [prev, next] = orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    const rtl = orientation === 'horizontal' && getComputedStyle(ref.current!).direction === 'rtl';
    let n: number | null = null;
    if (e.key === (rtl ? prev : next) || (orientation === 'vertical' && e.key === 'ArrowRight')) n = (i + 1) % tabs.length;
    else if (e.key === (rtl ? next : prev) || (orientation === 'vertical' && e.key === 'ArrowLeft')) n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault();
    tabs[n].focus();
    if (activation === 'automatic') tabs[n].click();
  };
  const barStyle = !bar ? undefined : orientation === 'vertical'
    ? { transform: `translateY(${bar.y}px)`, height: bar.h }
    : { transform: `translateX(${bar.x}px)`, width: bar.w };
  return (
    <div ref={listRef} role="tablist" aria-label={label} aria-orientation={orientation} className={cx('pp-tablist', className)} onKeyDown={onKeyDown}>
      {children}
      {bar && <span className="pp-tablist__bar" aria-hidden="true" style={barStyle} />}
    </div>
  );
});

export interface TabProps { value: string; children: ReactNode; disabled?: boolean }

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab({ value, children, disabled }, ref) {
  const t = useTabs();
  const selected = t.value === value;
  return (
    <button ref={ref} type="button" role="tab" id={`${t.base}-tab-${safe(value)}`} aria-selected={selected} aria-controls={`${t.base}-panel-${safe(value)}`}
      tabIndex={selected ? 0 : -1} disabled={disabled} className="pp-tab" onClick={() => t.select(value)}>
      {children}
    </button>
  );
});

export type TabPanelProps = { value: string } & HTMLAttributes<HTMLDivElement>;

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel({ value, children, className, ...rest }, ref) {
  const t = useTabs();
  const selected = t.value === value;
  return (
    <div ref={ref} role="tabpanel" id={`${t.base}-panel-${safe(value)}`} aria-labelledby={`${t.base}-tab-${safe(value)}`} hidden={!selected} tabIndex={0} className={cx('pp-tabpanel', className)} {...rest}>
      {selected && children}
    </div>
  );
});
