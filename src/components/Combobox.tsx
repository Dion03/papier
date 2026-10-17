import {
  forwardRef, useEffect, useId, useMemo, useRef, useState,
  type ChangeEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useControllable } from '../lib/useControllable';
import { useIsoLayoutEffect } from '../lib/useIsoLayoutEffect';
import { supportsPopover, useAnchoredPopover } from '../lib/position';
import { useMergedRefs } from '../lib/slot';
import { Field } from './Field';
import { Check, ChevronDown } from './icons';

export interface ComboboxOption { value: string; label: string; description?: string; disabled?: boolean }

export interface ComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'role'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  options: ComboboxOption[];
  /** The chosen option's value, or null for none. */
  value?: string | null;
  defaultValue?: string | null;
  /** Called with the chosen value and its option, or null and null when cleared. */
  onValueChange?: (value: string | null, option: ComboboxOption | null) => void;
  /** @deprecated Use `onValueChange`, the name every other Papier input uses. Removed in 1.0. */
  onChange?: (value: string | null, option: ComboboxOption | null) => void;
  /** The typed text, for searching on a server. Use with `filter={false}`. */
  inputValue?: string;
  onInputChange?: (text: string) => void;
  /** How typed text matches an option. `false` shows `options` as given (already filtered). */
  filter?: ((option: ComboboxOption, query: string) => boolean) | false;
  /** Shows a loading line in the list, e.g. while a server search runs. */
  loading?: boolean;
  /** Shown when nothing matches; defaults to the "no results" label. */
  emptyText?: ReactNode;
}

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
/** Case- and accent-insensitive "contains" on label and description: "cafe" finds "Café", "bjork" the record by Björk. */
export const defaultComboboxFilter = (option: ComboboxOption, query: string) => {
  const q = normalize(query);
  return normalize(option.label).includes(q) || (!!option.description && normalize(option.description).includes(q));
};

/**
 * A text input with a list of options that narrows as you type (WAI-ARIA combobox).
 * Arrows move through the list, Enter chooses, Escape closes and then clears.
 * Focus stays in the input; the list opens in the top layer. For a short, fixed
 * list without searching, use Select. The ref points at the input.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label, hint, error, hideLabel, required, disabled, id, name, placeholder, className, options,
    value: valueProp, defaultValue = null, onValueChange, onChange, inputValue, onInputChange, filter, loading, emptyText,
    onBlur, onKeyDown, 'aria-describedby': describedBy, ...rest
  }, ref,
) {
  const labels = useLabels();
  const listId = `${useId()}-list`;
  const optionId = (i: number) => `${listId}-${i}`;

  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue, (v) => {
    const option = options.find((o) => o.value === v) ?? null;
    onValueChange?.(v, option);
    onChange?.(v, option);
  });
  const selected = options.find((o) => o.value === value) ?? null;
  const [text, setText] = useControllable(inputValue, selected?.label ?? '', onInputChange);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const [active, setActive] = useState(-1);

  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  const group = useRef<HTMLSpanElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const visible = useMemo(() => {
    if (filter === false || !typed || !text) return options;
    const match = filter ?? defaultComboboxFilter;
    return options.filter((o) => match(o, text));
  }, [options, filter, typed, text]);
  const enabled = (i: number) => i >= 0 && i < visible.length && !visible[i].disabled;
  const expanded = open && visible.length > 0;
  const showPopup = open && (visible.length > 0 || loading || typed);

  useAnchoredPopover(!!showPopup, group, popup, 'bottom', 'start', 4);
  useIsoLayoutEffect(() => {
    if (showPopup && popup.current && group.current) popup.current.style.minWidth = `${group.current.offsetWidth}px`;
  }, [showPopup]);

  // Keep the text in step with a value chosen from outside, unless the user is typing.
  useEffect(() => { if (!open && !typed && text !== (selected?.label ?? '')) setText(selected?.label ?? ''); }, [selected?.label]); // eslint-disable-line react-hooks/exhaustive-deps

  // While typing, the first match is the active option, so Enter takes it.
  useEffect(() => {
    if (!open) return;
    if (typed) setActive(visible.findIndex((o) => !o.disabled));
    else if (active >= visible.length) setActive(-1);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!expanded || active < 0) return;
    document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
  }, [active, expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const openList = (at: 'selected' | 'first' | 'last' | 'none') => {
    setTyped(false);
    setOpen(true);
    const all = options;
    const first = all.findIndex((o) => !o.disabled);
    const last = all.length - 1 - [...all].reverse().findIndex((o) => !o.disabled);
    const sel = all.findIndex((o) => o.value === value);
    setActive(at === 'none' ? -1 : at === 'last' ? last : at === 'selected' && sel >= 0 ? sel : first);
  };
  const close = () => { setOpen(false); setTyped(false); setActive(-1); };
  const choose = (o: ComboboxOption) => {
    if (o.disabled) return;
    setValue(o.value);
    setText(o.label);
    close();
  };
  const move = (step: 1 | -1) => {
    if (!visible.length) return;
    let i = active;
    for (let n = 0; n < visible.length; n++) {
      i = (i + step + visible.length) % visible.length;
      if (enabled(i)) { setActive(i); return; }
    }
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setTyped(true);
    setOpen(true);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openList(e.altKey ? 'none' : 'selected'); else move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) openList('last'); else move(-1);
    } else if (e.key === 'Enter') {
      if (open && enabled(active)) { e.preventDefault(); choose(visible[active]); }
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setText(selected?.label ?? ''); close(); }
      else if (text) { e.preventDefault(); setText(''); setValue(null); }
    }
  };

  /** Leaving the field keeps a real choice: an exact label match is taken, anything else falls back. */
  const commit = () => {
    if (!open && !typed) return;
    const exact = typed ? options.find((o) => !o.disabled && normalize(o.label) === normalize(text)) : undefined;
    if (exact) choose(exact);
    else {
      if (text === '' && value !== null) setValue(null);
      if (filter !== false || inputValue === undefined) setText(text === '' ? '' : selected?.label ?? '');
      close();
    }
  };

  const live = !open ? '' : loading ? labels.loading : visible.length ? labels.results(visible.length) : (typed ? labels.noResults : '');

  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy }} className={cx('pp-combobox', className)}>
      {(control) => (
        <>
          <span ref={group} className="pp-field__group">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              className="pp-field__control"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={expanded}
              aria-controls={expanded ? listId : undefined}
              aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
              value={text}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              onChange={onInput}
              onKeyDown={onKey}
              onBlur={(e) => { commit(); onBlur?.(e); }}
              onClick={() => { if (!open) openList('selected'); }}
              {...control}
              {...rest}
            />
            <button
              type="button"
              tabIndex={-1}
              className="pp-combobox__toggle"
              aria-label={labels.showOptions}
              aria-expanded={expanded}
              aria-controls={expanded ? listId : undefined}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { input.current?.focus(); if (open) close(); else openList('selected'); }}
            >
              <ChevronDown />
            </button>
          </span>
          {name && <input type="hidden" name={name} value={value ?? ''} disabled={disabled} />}
          <span className="pp-visually-hidden" role="status">{live}</span>
          {showPopup && (
            <div ref={popup} className="pp-combobox__popup" popover={supportsPopover() ? 'manual' : undefined} onMouseDown={(e) => e.preventDefault()}>
              {visible.length > 0 && (
                <ul ref={list} id={listId} role="listbox" aria-labelledby={`${control.id}-label`} className="pp-combobox__list">
                  {visible.map((o, i) => (
                    <li
                      key={o.value}
                      id={optionId(i)}
                      role="option"
                      aria-selected={o.value === value}
                      aria-disabled={o.disabled || undefined}
                      data-active={i === active || undefined}
                      className="pp-combobox__option"
                      onPointerMove={() => { if (!o.disabled && i !== active) setActive(i); }}
                      onClick={() => choose(o)}
                    >
                      <span className="pp-combobox__text">
                        <span className="pp-combobox__label">{o.label}</span>
                        {o.description && <span className="pp-combobox__desc">{o.description}</span>}
                      </span>
                      {o.value === value && <Check className="pp-combobox__check" width={16} height={16} />}
                    </li>
                  ))}
                </ul>
              )}
              {loading && <p className="pp-combobox__note">{labels.loading}</p>}
              {!loading && visible.length === 0 && typed && <p className="pp-combobox__note">{emptyText ?? labels.noResults}</p>}
            </div>
          )}
        </>
      )}
    </Field>
  );
});
