import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface MenuItem { label: ReactNode; onSelect: () => void; icon?: ReactNode; disabled?: boolean; tone?: 'default' | 'danger' }

export interface MenuProps {
  /** Content of the trigger button. */
  trigger: ReactNode;
  /** Accessible name when the trigger is only an icon. */
  triggerLabel?: string;
  items: MenuItem[];
  align?: 'start' | 'end';
  triggerVariant?: 'secondary' | 'ghost' | 'icon';
  className?: string;
}

/**
 * An action menu (WAI-ARIA menu button): Enter, Space or ArrowDown opens and focuses
 * the first item; arrows, Home and End move; Escape and Tab close and return focus.
 */
export function Menu({ trigger, triggerLabel, items, align = 'start', triggerVariant = 'secondary', className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const focusAt = useRef<number | 'last'>(0);
  const enabled = () => Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);

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
    <div className={cx('pp-menu', className)} data-align={align}>
      <button
        ref={btn}
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
        <ul ref={list} id={`${id}-menu`} role="menu" aria-label={triggerLabel} className="pp-menu__list" onKeyDown={onListKey}>
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
}
