import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useIsoLayoutEffect } from '../lib/useIsoLayoutEffect';

export interface TooltipProps {
  /** Extra description. Never the only name: an icon button still needs its own label. */
  content: ReactNode;
  /** One focusable element, e.g. an IconButton. */
  children: ReactElement<Record<string, unknown>>;
  placement?: 'top' | 'bottom';
  /** Hover delay in ms; keyboard focus shows it immediately. */
  delay?: number;
}

/**
 * A hint on hover or focus (WCAG 1.4.13): it can be hovered itself, dismissed with
 * Escape, and stays until the pointer or focus leaves.
 */
export function Tooltip({ content, children, placement = 'top', delay = 400 }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState(placement);
  const timer = useRef<number | undefined>(undefined);
  const wrap = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);

  const show = (wait: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(true), wait); };
  const hide = () => { window.clearTimeout(timer.current); setOpen(false); };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  useIsoLayoutEffect(() => {
    if (!open || !wrap.current || !tip.current) return;
    const r = wrap.current.getBoundingClientRect();
    const h = tip.current.offsetHeight + 10;
    if (placement === 'top' && r.top < h) setSide('bottom');
    else if (placement === 'bottom' && window.innerHeight - r.bottom < h) setSide('top');
    else setSide(placement);
  }, [open, placement]);

  if (!isValidElement(children)) return children;
  const described = cx(children.props['aria-describedby'] as string | undefined, open && `${id}-tip`) || undefined;
  return (
    <span ref={wrap} className="pp-tooltip" onPointerEnter={() => show(delay)} onPointerLeave={hide} onFocus={() => show(0)} onBlur={hide}>
      {cloneElement(children, { 'aria-describedby': described })}
      {open && <span ref={tip} id={`${id}-tip`} role="tooltip" className="pp-tooltip__bubble" data-side={side}>{content}</span>}
    </span>
  );
}
