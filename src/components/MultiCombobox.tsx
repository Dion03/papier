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
import { defaultComboboxFilter, type ComboboxOption } from './Combobox';
import { Check, ChevronDown, Close } from './icons';

export interface MultiComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'role'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  hideLabel?: boolean;
  options: ComboboxOption[];
  /** The chosen values, in the order they were chosen. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], options: ComboboxOption[]) => void;
  /** The typed search text, for searching on a server. Use with `filter={false}`. */
  inputValue?: string;
  onInputChange?: (text: string) => void;
  /** How typed text matches an option. `false` shows `options` as given (already filtered). */
  filter?: ((option: ComboboxOption, query: string) => boolean) | false;
  /** Most items that can be chosen; further options are disabled until one is removed. */
  max?: number;
  loading?: boolean;
  /** Shown when nothing matches; defaults to the "no results" label. */
  emptyText?: ReactNode;
}

/**
 * A combobox for choosing several options: chosen items show as tags in the field, the
 * list stays open while you pick, and typing narrows it (WAI-ARIA combobox with a
 * multi-selectable listbox). Enter toggles the active option, Backspace in an empty field
 * removes the last tag, Escape closes and then clears the search. With `name`, every
 * value is submitted. The ref points at the input.
 */
export const MultiCombobox = forwardRef<HTMLInputElement, MultiComboboxProps>(function MultiCombobox(
  {
    label, hint, error, hideLabel, required, disabled, id, name, placeholder, className, options,
    value: valueProp, defaultValue = [], onChange, inputValue, onInputChange, filter, max, loading, emptyText,
    onKeyDown, onBlur, 'aria-describedby': describedBy, ...rest
  }, ref,
) {
  const labels = useLabels();
  const base = useId();
  const listId = `${base}-list`;
  const summaryId = `${base}-chosen`;
  const optionId = (i: number) => `${listId}-${i}`;

  const find = (v: string) => options.find((o) => o.value === v);
  const [value, setValue] = useControllable<string[]>(valueProp, defaultValue, (v) => onChange?.(v, v.map(find).filter((o): o is ComboboxOption => !!o)));
  const [text, setText] = useControllable(inputValue, '', onInputChange);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [announce, setAnnounce] = useState('');

  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  const group = useRef<HTMLSpanElement>(null);
  const values = useRef<HTMLSpanElement>(null);
  const popup = useRef<HTMLDivElement>(null);

  const full = max !== undefined && value.length >= max;
  const visible = useMemo(() => {
    if (filter === false || !text) return options;
    const match = filter ?? defaultComboboxFilter;
    return options.filter((o) => match(o, text));
  }, [options, filter, text]);
  const blocked = (o: ComboboxOption) => !!o.disabled || (full && !value.includes(o.value));
  const enabled = (i: number) => i >= 0 && i < visible.length && !blocked(visible[i]);
  const expanded = open && visible.length > 0;
  const showPopup = open && (visible.length > 0 || loading || !!text);

  useAnchoredPopover(!!showPopup, group, popup, 'bottom', 'start', 4);
  useIsoLayoutEffect(() => {
    if (showPopup && popup.current && group.current) popup.current.style.minWidth = `${group.current.offsetWidth}px`;
  }, [showPopup, value.length]);

  // While typing, the first match becomes the active option, so Enter takes it.
  useEffect(() => {
    if (!open) return;
    if (text) setActive(visible.findIndex((o) => !blocked(o)));
    else if (active >= visible.length) setActive(-1);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on a pointer outside the field and list, also when the field never held focus.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!group.current?.contains(t) && !popup.current?.contains(t)) { setOpen(false); setActive(-1); }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => {
    if (!expanded || active < 0) return;
    document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
  }, [active, expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const openList = (at: 'first' | 'last') => {
    setOpen(true);
    const order = visible.map((_, i) => i).filter((i) => enabled(i));
    setActive(order.length ? (at === 'last' ? order[order.length - 1] : order[0]) : -1);
  };
  const close = () => { setOpen(false); setActive(-1); };
  const toggle = (o: ComboboxOption) => {
    if (o.disabled) return;
    if (value.includes(o.value)) {
      setValue(value.filter((v) => v !== o.value));
      setAnnounce(labels.removed(o.label));
    } else if (!full) {
      setValue([...value, o.value]);
      setAnnounce('');
    }
    // A new search after each choice, as people pick several in a row.
    if (text) setText('');
  };
  const removeAt = (v: string) => {
    const o = find(v);
    setValue(value.filter((x) => x !== v));
    setAnnounce(labels.removed(o?.label ?? v));
    input.current?.focus();
  };
  const move = (step: 1 | -1) => {
    if (!visible.length) return;
    let i = active;
    for (let n = 0; n < visible.length; n++) {
      i = (i + step + visible.length) % visible.length;
      if (enabled(i)) { setActive(i); return; }
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) openList('first'); else move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!open) openList('last'); else move(-1); }
    else if (e.key === 'Enter') { if (open && enabled(active)) { e.preventDefault(); toggle(visible[active]); } }
    else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); close(); } else if (text) { e.preventDefault(); setText(''); }
    } else if (e.key === 'Backspace' && !text && value.length) removeAt(value[value.length - 1]);
  };

  const chosen = value.map((v) => find(v)?.label ?? v);
  const live = announce || (!open ? '' : loading ? labels.loading : visible.length ? labels.results(visible.length) : (text ? labels.noResults : ''));

  return (
    <Field {...{ label, hint, error, hideLabel, required, id, describedBy: cx(summaryId, describedBy) }} className={cx('pp-combobox', 'pp-multi', className)}>
      {(control) => (
        <>
          <span ref={group} className="pp-field__group pp-multi__group" data-disabled={disabled || undefined}
            onPointerDown={(e) => { if (e.target === e.currentTarget || e.target === values.current) { e.preventDefault(); input.current?.focus(); } }}>
            {/* Tags and input wrap together; the toggle stays at the end of the first line. */}
            <span ref={values} className="pp-multi__values">
            {value.map((v) => {
              const name = find(v)?.label ?? v;
              return (
                <span key={v} className="pp-multi__tag">
                  <span>{name}</span>
                  <button type="button" tabIndex={-1} className="pp-multi__remove" aria-label={labels.remove(name)} disabled={disabled}
                    onMouseDown={(e) => e.preventDefault()} onClick={() => removeAt(v)}>
                    <Close width={12} height={12} strokeWidth={2.2} />
                  </button>
                </span>
              );
            })}
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              className="pp-field__control pp-multi__input"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={expanded}
              aria-controls={expanded ? listId : undefined}
              aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
              value={text}
              placeholder={value.length ? undefined : placeholder}
              required={required && value.length === 0}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setText(e.target.value); setOpen(true); setAnnounce(''); }}
              onKeyDown={onKey}
              onClick={() => { if (!open) openList('first'); }}
              onBlur={(e) => { close(); onBlur?.(e); }}
              {...control}
              {...rest}
            />
            </span>
            <button type="button" tabIndex={-1} className="pp-combobox__toggle" aria-label={labels.showOptions} aria-expanded={expanded}
              aria-controls={expanded ? listId : undefined} disabled={disabled} onMouseDown={(e) => e.preventDefault()}
              onClick={() => { input.current?.focus(); if (open) close(); else openList('first'); }}>
              <ChevronDown />
            </button>
          </span>
          <span id={summaryId} className="pp-visually-hidden">{labels.selectedItems(chosen)}</span>
          {name && value.map((v) => <input key={v} type="hidden" name={name} value={v} disabled={disabled} />)}
          <span className="pp-visually-hidden" role="status">{live}</span>
          {showPopup && (
            <div ref={popup} className="pp-combobox__popup" popover={supportsPopover() ? 'manual' : undefined} onMouseDown={(e) => e.preventDefault()}>
              {visible.length > 0 && (
                <ul id={listId} role="listbox" aria-multiselectable="true" aria-labelledby={`${control.id}-label`} className="pp-combobox__list">
                  {visible.map((o, i) => {
                    const selected = value.includes(o.value);
                    return (
                      <li
                        key={o.value}
                        id={optionId(i)}
                        role="option"
                        aria-selected={selected}
                        aria-disabled={blocked(o) || undefined}
                        data-active={i === active || undefined}
                        className="pp-combobox__option pp-multi__option"
                        onPointerMove={() => { if (!blocked(o) && i !== active) setActive(i); }}
                        onClick={() => { if (!blocked(o)) { setActive(i); toggle(o); } }}
                      >
                        <span className="pp-multi__box" aria-hidden="true">{selected && <Check width={12} height={12} strokeWidth={2.6} />}</span>
                        <span className="pp-combobox__text">
                          <span className="pp-combobox__label">{o.label}</span>
                          {o.description && <span className="pp-combobox__desc">{o.description}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {loading && <p className="pp-combobox__note">{labels.loading}</p>}
              {!loading && visible.length === 0 && !!text && <p className="pp-combobox__note">{emptyText ?? labels.noResults}</p>}
            </div>
          )}
        </>
      )}
    </Field>
  );
});
