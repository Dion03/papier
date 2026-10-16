import { forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useMergedRefs } from '../lib/slot';
import { supportsPopover, useAnchoredPopover, type Align, type Side } from '../lib/position';

export interface MenuItem { label: ReactNode; onSelect: () => void; icon?: ReactNode; disabled?: boolean; tone?: 'default' | 'danger' }

export interface MenuProps {
  /** Content of the trigger button. */
  trigger: ReactNode;
  /** Accessible name when the trigger is only an icon. */
  triggerLabel?: string;
  items: MenuItem[];
  /** Preferred side of the trigger; flips when there is no room. */
  side?: Side;
  align?: Align;
  triggerVariant?: 'secondary' | 'ghost' | 'icon';
  className?: string;
}

/**
 * An action menu (WAI-ARIA menu button): Enter, Space or ArrowDown opens and focuses
 * the first item; arrows, Home and End move; Escape and Tab close and return focus.
 * The list opens in the top layer, so overflow:hidden parents never clip it.
 * The ref points at the trigger button.
 */
export const Menu = forwardRef<HTMLButtonElement, MenuProps>(function Menu(
  { trigger, triggerLabel, items, side = 'bottom', align = 'start', triggerVariant = 'secondary', className }, ref,
) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const btnRef = useMergedRefs(btn, ref);
  const list = useRef<HTMLUListElement>(null);
  const focusAt = useRef<number | 'last'>(0);
  const enabled = () => Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);

  useAnchoredPopover(open, btn, list, side, align, 6);
  useEffect(() => {
    if (!open) return;
    const els = enabled();
    (focusAt.current === 'last' ? els[els.length - 1] : els[focusAt.current])?.focus();
    const onDown = (e: PointerEvent) => {
      if (!list.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const close = (refocus = true) => { setOpen(false); if (refocus) btn.current?.focus(); };
  const openAt = (at: number | 'last') => { focusAt.current = at; setOpen(true); };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); openAt(0); }
    if (e.key === 'ArrowUp') { e.preventDefault(); openAt('last'); }
  };
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const els = enabled();
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => { e.preventDefault(); els[(n + els.length) % els.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(els.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close(false);
  };

  return (
    <div className={cx('pp-menu', className)}>
      <button
        ref={btnRef}
        type="button"
        className={triggerVariant === 'icon' ? 'pp-icon-button' : 'pp-button'}
        data-variant={triggerVariant === 'icon' ? 'ghost' : triggerVariant}
        data-size="md"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        aria-label={triggerLabel}
        onClick={() => (open ? close() : openAt(0))}
        onKeyDown={onTriggerKey}
      >
        {trigger}
      </button>
      {open && (
        <ul ref={list} id={`${id}-menu`} role="menu" aria-label={triggerLabel} className="pp-menu__list" data-align={align}
          popover={supportsPopover() ? 'manual' : undefined} onKeyDown={onListKey}>
          {items.map((item, i) => (
            <li key={i} role="none">
              <button type="button" role="menuitem" tabIndex={-1} disabled={item.disabled} className="pp-menu__item" data-tone={item.tone}
                onClick={() => { close(); item.onSelect(); }}>
                {item.icon && <span className="pp-menu__icon" aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
