import type { RefObject } from 'react';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';

interface Box { top: number; left: number; width: number; height: number }
const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, Math.max(min, max)));

/**
 * Where a floating panel goes next to its anchor, in viewport coordinates.
 * Flips to the opposite side when the preferred side is too small and the other
 * has more room, then keeps the panel `padding` px inside the viewport.
 */
export function computePosition(
  anchor: Box, size: { width: number; height: number }, viewport: { width: number; height: number },
  side: Side, align: Align = 'center', offset = 8, padding = 8,
): { top: number; left: number; side: Side } {
  const room: Record<Side, number> = {
    top: anchor.top - padding,
    bottom: viewport.height - (anchor.top + anchor.height) - padding,
    left: anchor.left - padding,
    right: viewport.width - (anchor.left + anchor.width) - padding,
  };
  const vertical = side === 'top' || side === 'bottom';
  const need = (vertical ? size.height : size.width) + offset;
  const final = need > room[side] && room[opposite[side]] > room[side] ? opposite[side] : side;

  const cross = (start: number, length: number, own: number) =>
    align === 'start' ? start : align === 'end' ? start + length - own : start + (length - own) / 2;
  let top: number;
  let left: number;
  if (vertical) {
    top = final === 'top' ? anchor.top - offset - size.height : anchor.top + anchor.height + offset;
    left = cross(anchor.left, anchor.width, size.width);
  } else {
    left = final === 'left' ? anchor.left - offset - size.width : anchor.left + anchor.width + offset;
    top = cross(anchor.top, anchor.height, size.height);
  }
  return {
    top: clamp(top, padding, viewport.height - size.height - padding),
    left: clamp(left, padding, viewport.width - size.width - padding),
    side: final,
  };
}

/** Popover API (top layer) where the browser has it; otherwise a fixed panel with a z-index. */
export const supportsPopover = () => typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/**
 * While `open`, lifts `floating` into the top layer and keeps it next to `anchor`,
 * so it escapes overflow:hidden containers and flips at the edge of the screen.
 * The resolved side is written to `data-side` on the floating element.
 */
export function useAnchoredPopover(
  open: boolean, anchor: RefObject<HTMLElement | null>, floating: RefObject<HTMLElement | null>,
  side: Side, align: Align, offset = 8,
) {
  useIsoLayoutEffect(() => {
    const a = anchor.current;
    const f = floating.current;
    if (!open || !a || !f) return;
    if (supportsPopover() && f.hasAttribute('popover')) {
      try { f.showPopover(); } catch { /* already open or detached */ }
    }
    const update = () => {
      const r = a.getBoundingClientRect();
      const p = computePosition(r, { width: f.offsetWidth, height: f.offsetHeight },
        { width: document.documentElement.clientWidth || window.innerWidth, height: window.innerHeight }, side, align, offset);
      f.style.top = `${p.top}px`;
      f.style.left = `${p.left}px`;
      f.dataset.side = p.side;
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(f);
    ro?.observe(a);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      ro?.disconnect();
      if (supportsPopover() && f.isConnected) {
        try { if (f.matches(':popover-open')) f.hidePopover(); } catch { /* gone, or no :popover-open */ }
      }
    };
  }, [open, side, align, offset]);
}
