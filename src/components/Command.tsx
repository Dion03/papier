import {
  forwardRef, useEffect, useId, useMemo, useRef, useState,
  type KeyboardEvent, type ReactNode, type RefObject,
} from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useMergedRefs } from '../lib/slot';
import { useModalDialog } from '../lib/useModalDialog';
import { Search } from './icons';

export interface CommandItem {
  /** Unique within the list. */
  id: string;
  label: ReactNode;
  /** Text to search and announce when `label` is not plain text. */
  textValue?: string;
  description?: ReactNode;
  /** Items with the same group are listed together under that heading, in order of appearance. */
  group?: string;
  /** Extra words that find this item, e.g. the exports on a docs page. */
  keywords?: string[];
  icon?: ReactNode;
  /** A shortcut hint shown at the end, e.g. "Ctrl B". */
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
const plain = (item: CommandItem) => item.textValue ?? (typeof item.label === 'string' ? item.label : '');

/**
 * How well an item matches a query: 0 is no match. A label that starts with the query
 * beats a word in the label, which beats a keyword, which beats the description. Every
 * word of the query has to match somewhere, so "date range" finds "DateRangePicker".
 */
export function scoreCommandItem(item: CommandItem, query: string): number {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  const label = normalize(plain(item));
  const keys = (item.keywords ?? []).map(normalize);
  const desc = typeof item.description === 'string' ? normalize(item.description) : '';
  let total = 0;
  for (const w of words) {
    const score = label.startsWith(w) ? 8
      : label.split(/[\s\-/.]+/).some((part) => part.startsWith(w)) ? 6
      : keys.some((k) => k.startsWith(w)) ? 5
      : label.includes(w) ? 4
      : keys.some((k) => k.includes(w)) ? 3
      : desc.includes(w) ? 1 : 0;
    if (!score) return 0;
    total += score;
  }
  return total;
}

export interface CommandProps {
  items: CommandItem[];
  /** Accessible name of the search field and list, e.g. "Zoek in de documentatie". */
  label: string;
  placeholder?: string;
  /** Shown when nothing matches; defaults to the "no results" label. */
  emptyText?: ReactNode;
  /** Replaces the built-in ranking; return 0 to hide an item. */
  filter?: (item: CommandItem, query: string) => number;
  /** The search text, to control it from outside. */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Called after an item's own onSelect, e.g. to close a dialog. */
  onDone?: () => void;
  /** Hides the hint line with the keys. */
  hideHints?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * A search field with a list of actions or pages that narrows as you type, as in a
 * command palette (WAI-ARIA combobox with a grouped listbox). Arrows move, Enter runs the
 * item, matches are ranked. Use CommandDialog for the familiar ⌘K overlay.
 * The ref points at the search input.
 */
export const Command = forwardRef<HTMLInputElement, CommandProps>(function Command(
  { items, label, placeholder, emptyText, filter, query: queryProp, onQueryChange, onDone, hideHints, autoFocus, className }, ref,
) {
  const labels = useLabels();
  const id = useId();
  const [inner, setInner] = useState('');
  const query = queryProp ?? inner;
  const setQuery = (q: string) => { if (queryProp === undefined) setInner(q); onQueryChange?.(q); };
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  const list = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    const rank = filter ?? scoreCommandItem;
    const scored = items.map((item, order) => ({ item, order, score: rank(item, query) })).filter((s) => s.score > 0);
    if (query.trim()) scored.sort((a, b) => b.score - a.score || a.order - b.order);
    // Groups follow their best match; items keep their ranking inside a group.
    const out: Array<{ name: string | undefined; items: CommandItem[] }> = [];
    for (const { item } of scored) {
      const g = out.find((x) => x.name === item.group);
      if (g) g.items.push(item); else out.push({ name: item.group, items: [item] });
    }
    return out;
  }, [items, query, filter]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const optionId = (i: number) => `${id}-option-${i}`;
  const enabled = (i: number) => !!flat[i] && !flat[i].disabled;

  // Back to the first match when the query or the matches change, not on every new items
  // array: a parent that re-renders would otherwise drop the row someone arrowed to.
  const matches = flat.map((i) => `${i.id}${i.disabled ? '!' : ''}`).join('\n');
  useEffect(() => { setActive(flat.findIndex((i) => !i.disabled)); }, [query, matches]); // eslint-disable-line react-hooks/exhaustive-deps
  // Scroll only the list, never the page: an inline Command must not move the page on load.
  useEffect(() => {
    const el = active >= 0 ? document.getElementById(optionId(active)) : null;
    const box = list.current;
    if (!el || !box) return;
    const label = 34;
    if (el.offsetTop - label < box.scrollTop) box.scrollTop = Math.max(0, el.offsetTop - label);
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight + 8;
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (autoFocus) input.current?.focus(); }, [autoFocus]);

  const move = (step: number) => {
    if (!flat.length) return;
    let i = active;
    for (let n = 0; n < flat.length; n++) {
      i = (i + step + flat.length) % flat.length;
      if (enabled(i)) { setActive(i); return; }
    }
  };
  const run = (item: CommandItem) => {
    if (item.disabled) return;
    item.onSelect();
    onDone?.();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'PageDown') { e.preventDefault(); move(Math.min(8, flat.length - 1) || 1); }
    else if (e.key === 'PageUp') { e.preventDefault(); move(-(Math.min(8, flat.length - 1) || 1)); }
    else if (e.key === 'Enter' && enabled(active)) { e.preventDefault(); run(flat[active]); }
  };

  let index = -1;
  return (
    <div className={cx('pp-command', className)}>
      <div className="pp-command__search">
        <Search className="pp-command__search-icon" width={18} height={18} />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={label}
          aria-expanded={flat.length > 0}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 && flat[active] ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          className="pp-command__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div ref={list} id={`${id}-list`} role="listbox" aria-label={label} className="pp-command__list">
        {groups.map((g, gi) => (
          <div key={g.name ?? `_${gi}`} role={g.name ? 'group' : 'presentation'} aria-labelledby={g.name ? `${id}-group-${gi}` : undefined} className="pp-command__group">
            {g.name && <div id={`${id}-group-${gi}`} className="pp-command__group-label" role="presentation">{g.name}</div>}
            {g.items.map((item) => {
              index += 1;
              const i = index;
              return (
                <div
                  key={item.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={item.disabled || undefined}
                  className="pp-command__item"
                  onPointerMove={() => { if (!item.disabled && i !== active) setActive(i); }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => run(item)}
                >
                  {item.icon && <span className="pp-command__icon" aria-hidden="true">{item.icon}</span>}
                  <span className="pp-command__text">
                    <span className="pp-command__label">{item.label}</span>
                    {item.description && <span className="pp-command__desc">{item.description}</span>}
                  </span>
                  {item.shortcut && <kbd className="pp-command__shortcut">{item.shortcut}</kbd>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {flat.length === 0 && <p className="pp-command__empty">{emptyText ?? labels.noResults}</p>}
      <span className="pp-visually-hidden" role="status">{query ? (flat.length ? labels.results(flat.length) : labels.noResults) : ''}</span>
      {!hideHints && (
        <div className="pp-command__hints" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> {labels.commandHints.move}</span>
          <span><kbd>↵</kbd> {labels.commandHints.choose}</span>
          <span><kbd>Esc</kbd> {labels.commandHints.close}</span>
        </div>
      )}
    </div>
  );
});

export interface CommandDialogProps extends Omit<CommandProps, 'autoFocus' | 'onDone'> {
  open: boolean;
  onClose: () => void;
  /** Where focus goes after closing. Defaults to the element that opened it. */
  returnFocusTo?: RefObject<HTMLElement | null>;
}

/**
 * Command in a modal dialog near the top of the screen: the ⌘K search of a docs site or
 * app. Escape or a click beside it closes, choosing an item closes too, and focus returns
 * to whatever opened it. The search text starts empty on every open.
 */
export const CommandDialog = forwardRef<HTMLDialogElement, CommandDialogProps>(function CommandDialog(
  { open, onClose, returnFocusTo, className, ...rest }, forwardedRef,
) {
  const ref = useRef<HTMLDialogElement>(null);
  const dialogRef = useMergedRefs(ref, forwardedRef);
  // Focus the field once the dialog is shown; focusing it earlier would land outside the top layer.
  useModalDialog(ref, open, onClose, { returnFocusTo, onOpen: () => ref.current?.querySelector<HTMLInputElement>('.pp-command__input')?.focus() });
  return (
    <dialog
      ref={dialogRef}
      className={cx('pp-dialog', 'pp-command-dialog', className)}
      aria-label={rest.label}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {open && <Command {...rest} onDone={onClose} />}
    </dialog>
  );
});
