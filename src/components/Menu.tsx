import { Fragment, forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { useMergedRefs } from '../lib/slot';
import { supportsPopover, useAnchoredPopover, type Align, type Side } from '../lib/position';
import { Check } from './icons';

export interface MenuItem {
  /** `checkbox` and `radio` show `checked` and announce it (menuitemcheckbox, menuitemradio). */
  type?: 'item' | 'checkbox' | 'radio';
  label: ReactNode;
  onSelect?: () => void;
  /** Makes the item a real link. */
  href?: string;
  target?: string;
  icon?: ReactNode;
  /** A shortcut hint shown at the end, e.g. "Ctrl D". Implement the shortcut itself in your app. */
  shortcut?: string;
  /** For `checkbox` and `radio` items. */
  checked?: boolean;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  /** Keeps the menu open after choosing, e.g. for several checkbox items in a row. */
  keepOpen?: boolean;
  /** Text for typeahead when the label is not plain text. */
  textValue?: string;
}
/** A line between groups of items. */
export interface MenuSeparator { type: 'separator' }
/** A heading for the items after it, up to the next separator. It names their group. */
export interface MenuLabel { type: 'label'; label: ReactNode }
export type MenuEntry = MenuItem | MenuSeparator | MenuLabel;

export interface MenuProps {
  /** Content of the trigger button. */
  trigger: ReactNode;
  /** Accessible name when the trigger is only an icon. */
  triggerLabel?: string;
  /** Items, with `{ type: 'separator' }` and `{ type: 'label', label }` to group them. */
  items: MenuEntry[];
  /** Preferred side of the trigger; flips when there is no room. */
  side?: Side;
  align?: Align;
  triggerVariant?: 'secondary' | 'ghost' | 'icon';
  className?: string;
}

const ITEM = '[role^="menuitem"]:not(:disabled):not([aria-disabled="true"])';

type Section = { label?: ReactNode; items: Array<{ item: MenuItem; index: number }> };
function sectionsOf(entries: MenuEntry[]): Section[] {
  const out: Section[] = [{ items: [] }];
  entries.forEach((e, index) => {
    const last = out[out.length - 1];
    if (e.type === 'separator') out.push({ items: [] });
    else if (e.type === 'label') {
      if (last.items.length || last.label) out.push({ label: e.label, items: [] });
      else last.label = e.label;
    } else last.items.push({ item: e, index });
  });
  return out.filter((s) => s.items.length);
}

/**
 * An action menu (WAI-ARIA menu button): Enter, Space or ArrowDown opens and focuses
 * the first item; arrows, Home and End move; typing a letter jumps to the next item that
 * starts with it; Escape and Tab close and return focus. Items can be actions, links,
 * checkbox or radio choices, grouped under labels and separators.
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
  const typed = useRef({ text: '', at: 0 });
  const enabled = () => Array.from(list.current?.querySelectorAll<HTMLElement>(ITEM) ?? []);

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
    const i = els.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => { e.preventDefault(); els[(n + els.length) % els.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(els.length - 1);
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close(false);
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== ' ') {
      // Typeahead: letters typed within half a second form one search.
      const now = Date.now();
      const text = (now - typed.current.at < 500 ? typed.current.text : '') + e.key.toLowerCase();
      typed.current = { text, at: now };
      const name = (el: HTMLElement) => (el.dataset.text ?? el.textContent ?? '').trim().toLowerCase();
      const order = [...els.slice(i + (text.length === 1 ? 1 : 0)), ...els.slice(0, i + (text.length === 1 ? 1 : 0))];
      const hit = order.find((el) => name(el).startsWith(text));
      if (hit) { e.preventDefault(); hit.focus(); }
    }
  };

  const choose = (item: MenuItem) => {
    if (item.disabled) return;
    if (!item.keepOpen) close();
    item.onSelect?.();
  };

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => {
    const kind = item.type ?? 'item';
    const role = kind === 'checkbox' ? 'menuitemcheckbox' : kind === 'radio' ? 'menuitemradio' : 'menuitem';
    const checkable = kind !== 'item';
    const inner = (
      <>
        {checkable && <span className="pp-menu__check" aria-hidden="true">{item.checked && <Check width={16} height={16} />}</span>}
        {item.icon && <span className="pp-menu__icon" aria-hidden="true">{item.icon}</span>}
        <span className="pp-menu__text">{item.label}</span>
        {item.shortcut && <kbd className="pp-menu__shortcut">{item.shortcut}</kbd>}
      </>
    );
    const common = {
      role, tabIndex: -1, className: 'pp-menu__item', 'data-tone': item.tone, 'data-text': item.textValue,
      'aria-checked': checkable ? !!item.checked : undefined,
    };
    return (
      <li key={index} role="none">
        {item.href !== undefined
          ? <a {...common} href={item.disabled ? undefined : item.href} target={item.target} aria-disabled={item.disabled || undefined}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              onClick={(e) => { if (item.disabled) { e.preventDefault(); return; } choose(item); }}>{inner}</a>
          : <button {...common} type="button" disabled={item.disabled} onClick={() => choose(item)}>{inner}</button>}
      </li>
    );
  };

  const sections = sectionsOf(items);
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
          {sections.map((s, n) => (
            <Fragment key={n}>
              {n > 0 && <li role="separator" className="pp-menu__separator" />}
              {s.label
                ? (
                  <li role="none">
                    <span id={`${id}-group-${n}`} className="pp-menu__label">{s.label}</span>
                    <ul role="group" aria-labelledby={`${id}-group-${n}`} className="pp-menu__group">{s.items.map(renderItem)}</ul>
                  </li>
                )
                : s.items.map(renderItem)}
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
});
