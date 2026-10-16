import {
  forwardRef, useEffect, useId, useRef, useState,
  type InputHTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useMergedRefs } from '../lib/slot';
import { useControllable } from '../lib/useControllable';
import { supportsPopover, useAnchoredPopover } from '../lib/position';
import { dateOrder, formatDate, formatNumericDate, parseISO, parseTypedDate, todayISO, type ISODate } from '../lib/date';
import { Calendar, RangeCalendar, type DateRange } from './Calendar';
import { Field } from './Field';
import { Calendar as CalendarIcon } from './icons';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max'> {
  label: ReactNode;
  hint?: ReactNode;
  /** Error text from your own validation. A typed date that does not exist gets its own message. */
  error?: ReactNode;
  hideLabel?: boolean;
  /** The date as "YYYY-MM-DD", like <input type="date">, or null when empty. */
  value?: ISODate | null;
  defaultValue?: ISODate | null;
  onValueChange?: (value: ISODate | null) => void;
  min?: ISODate;
  max?: ISODate;
  isDateUnavailable?: (date: ISODate) => boolean;
  /** Locale for typing, formatting and the calendar. Defaults to the `locale` of the Papier labels. */
  locale?: string;
}

/**
 * A date field you can type in ("15-3-2024" in Dutch, any separator, two-digit years) with a
 * button that opens a Calendar in a popover. The calendar takes focus, Escape closes it and
 * returns focus, and choosing a day fills the field. Typed dates that do not exist or cannot
 * be chosen get a message. With `name`, the form receives "YYYY-MM-DD". The ref points at the input.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    label, hint, error, hideLabel, required, disabled, readOnly, id, name, className, value: valueProp, defaultValue = null, onValueChange,
    min, max, isDateUnavailable, locale: localeProp, onBlur, onKeyDown, 'aria-describedby': describedBy, ...rest
  }, ref,
) {
  const labels = useLabels();
  const locale = localeProp ?? labels.locale;
  const uid = useId();
  const [value, setValue] = useControllable<ISODate | null>(valueProp, defaultValue, onValueChange);
  const [text, setText] = useState(() => (value ? formatNumericDate(value, locale) : ''));
  const [problem, setProblem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useMergedRefs(input, ref);
  const group = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const typing = useRef(false);

  useEffect(() => { if (!typing.current) setText(value ? formatNumericDate(value, locale) : ''); }, [value, locale]);
  useAnchoredPopover(open, group, panel, 'bottom', 'start', 6);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!panel.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const { order, separator } = dateOrder(locale);
  const pattern = order.map((k) => labels.datePattern[k]).join(separator);
  const unavailable = (d: ISODate) => (min !== undefined && d < min) || (max !== undefined && d > max) || !!isDateUnavailable?.(d);

  const commit = () => {
    typing.current = false;
    if (!text.trim()) { setProblem(null); if (value !== null) setValue(null); return; }
    const parsed = parseTypedDate(text, locale);
    if (!parsed) { setProblem(labels.invalidDate(formatNumericDate(todayISO(), locale))); return; }
    if (unavailable(parsed)) { setProblem(labels.dateUnavailable); setText(formatNumericDate(parsed, locale)); return; }
    setProblem(null);
    setText(formatNumericDate(parsed, locale));
    if (parsed !== value) setValue(parsed);
  };

  const choose = (d: ISODate) => {
    typing.current = false;
    setProblem(null);
    setValue(d);
    setText(formatNumericDate(d, locale));
    setOpen(false);
    input.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Enter') commit();
    // Alt + ArrowDown opens the calendar, as for a native date or select control.
    if (e.key === 'ArrowDown' && e.altKey && !disabled && !readOnly) { e.preventDefault(); commit(); setOpen(true); }
  };

  const chosen = parseISO(value) ? formatDate(value!, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <Field {...{ label, hint, error: error ?? problem ?? undefined, hideLabel, required, id, describedBy: cx(`${uid}-pattern`, describedBy) }} className={cx('pp-date', className)}>
      {(control) => (
        <>
          <span ref={group} className="pp-field__group">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="pp-field__control pp-date__input"
              placeholder={pattern}
              value={text}
              required={required}
              disabled={disabled}
              readOnly={readOnly}
              onChange={(e) => { typing.current = true; setText(e.target.value); }}
              onKeyDown={onKey}
              onBlur={(e) => { if (typing.current) commit(); onBlur?.(e); }}
              {...control}
              {...rest}
            />
            <button
              ref={button}
              type="button"
              className="pp-date__toggle"
              aria-label={chosen ? `${labels.chooseDate}, ${chosen}` : labels.chooseDate}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={open ? `${uid}-dialog` : undefined}
              disabled={disabled || readOnly}
              onClick={() => { if (!open && typing.current) commit(); setOpen(!open); }}
            >
              <CalendarIcon />
            </button>
          </span>
          <span id={`${uid}-pattern`} className="pp-visually-hidden">{pattern}</span>
          {name && <input type="hidden" name={name} value={value ?? ''} disabled={disabled} />}
          {open && (
            <div
              ref={panel}
              id={`${uid}-dialog`}
              role="dialog"
              aria-label={labels.chooseDate}
              className="pp-date__panel"
              popover={supportsPopover() ? 'manual' : undefined}
              onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); button.current?.focus(); } }}
              onBlur={(e) => { if (e.relatedTarget && !panel.current?.contains(e.relatedTarget as Node) && e.relatedTarget !== button.current) setOpen(false); }}
            >
              <Calendar value={value} onValueChange={choose} min={min} max={max} isDateUnavailable={isDateUnavailable} locale={locale}
                defaultMonth={parseTypedDate(text, locale) ?? undefined} autoFocus />
            </div>
          )}
        </>
      )}
    </Field>
  );
});


export interface DateRangePickerProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Error text from your own validation. Typed dates that do not exist get their own message. */
  error?: ReactNode;
  hideLabel?: boolean;
  /** The span as "YYYY-MM-DD" dates; `end` is null while only the start is known. */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
  min?: ISODate;
  max?: ISODate;
  isDateUnavailable?: (date: ISODate) => boolean;
  /** Locale for typing, formatting and the calendar. Defaults to the `locale` of the Papier labels. */
  locale?: string;
  /** Form names for the start and end date. */
  startName?: string;
  endName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Two date inputs, "van" and "tot", with one calendar button that opens a RangeCalendar.
 * Each input reads typed dates like DatePicker; an end before the start is swapped. In the
 * calendar the first day picked is the start and the second the end, after which it closes
 * and focus returns to the field.
 */
export const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(function DateRangePicker(
  {
    label, hint, error, hideLabel, required, disabled, id, className, value: valueProp, defaultValue = null, onValueChange,
    min, max, isDateUnavailable, locale: localeProp, startName, endName,
  }, ref,
) {
  const labels = useLabels();
  const locale = localeProp ?? labels.locale;
  const uid = useId();
  const [range, setRange] = useControllable<DateRange | null>(valueProp, defaultValue, onValueChange);
  const fmt = (d: ISODate | null | undefined) => (d ? formatNumericDate(d, locale) : '');
  const [texts, setTexts] = useState<[string, string]>(() => [fmt(range?.start), fmt(range?.end)]);
  const [problem, setProblem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const startInput = useRef<HTMLInputElement>(null);
  const startRef = useMergedRefs(startInput, ref);
  const group = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const typing = useRef(false);

  useEffect(() => { if (!typing.current) setTexts([fmt(range?.start), fmt(range?.end)]); }, [range?.start, range?.end, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  useAnchoredPopover(open, group, panel, 'bottom', 'start', 6);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!panel.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const { order, separator } = dateOrder(locale);
  const pattern = order.map((k) => labels.datePattern[k]).join(separator);
  const unavailable = (d: ISODate) => (min !== undefined && d < min) || (max !== undefined && d > max) || !!isDateUnavailable?.(d);

  const commit = () => {
    typing.current = false;
    const read = (t: string): ISODate | null | 'invalid' | 'unavailable' => {
      if (!t.trim()) return null;
      const d = parseTypedDate(t, locale);
      return !d ? 'invalid' : unavailable(d) ? 'unavailable' : d;
    };
    const [a, b] = [read(texts[0]), read(texts[1])];
    if (a === 'invalid' || b === 'invalid') { setProblem(labels.invalidDate(formatNumericDate(todayISO(), locale))); return; }
    if (a === 'unavailable' || b === 'unavailable') { setProblem(labels.dateUnavailable); return; }
    setProblem(null);
    let next: DateRange | null = a ? { start: a, end: b } : b ? { start: b, end: null } : null;
    if (next?.end && next.end < next.start) next = { start: next.end, end: next.start };
    setTexts([fmt(next?.start), fmt(next?.end)]);
    if (next?.start !== range?.start || next?.end !== range?.end) setRange(next);
  };

  const pick = (r: DateRange) => {
    typing.current = false;
    setProblem(null);
    setRange(r);
    setTexts([fmt(r.start), fmt(r.end)]);
    if (r.end) { setOpen(false); startInput.current?.focus(); }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'ArrowDown' && e.altKey && !disabled) { e.preventDefault(); commit(); setOpen(true); }
  };
  const input = (which: 0 | 1, control: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => (
    <input
      ref={which === 0 ? startRef : undefined}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className="pp-field__control pp-date__input"
      placeholder={pattern}
      value={texts[which]}
      disabled={disabled}
      required={required}
      onChange={(e) => { typing.current = true; const t: [string, string] = [...texts]; t[which] = e.target.value; setTexts(t); }}
      onKeyDown={onKey}
      onBlur={() => { if (typing.current) commit(); }}
      {...control}
      id={which === 0 ? control.id : `${control.id}-end`}
      aria-labelledby={`${control.id}-label ${uid}-${which === 0 ? 'from' : 'to'}`}
    />
  );
  const shown = range?.start && range.end
    ? `${formatDate(range.start, locale, { day: 'numeric', month: 'long', year: 'numeric' })} – ${formatDate(range.end, locale, { day: 'numeric', month: 'long', year: 'numeric' })}`
    : null;

  return (
    <Field {...{ label, hint, error: error ?? problem ?? undefined, hideLabel, required, id, describedBy: `${uid}-pattern` }} className={cx('pp-date', 'pp-date-range', className)}>
      {(control) => (
        <>
          <span ref={group} className="pp-field__group">
            {input(0, control)}
            <span className="pp-date-range__dash" aria-hidden="true">–</span>
            {input(1, control)}
            <button ref={button} type="button" className="pp-date__toggle" aria-label={shown ? `${labels.chooseDate}, ${shown}` : labels.chooseDate}
              aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? `${uid}-dialog` : undefined} disabled={disabled}
              onClick={() => { if (!open && typing.current) commit(); setOpen(!open); }}>
              <CalendarIcon />
            </button>
          </span>
          <span id={`${uid}-from`} hidden>{labels.rangeStart}</span>
          <span id={`${uid}-to`} hidden>{labels.rangeEnd}</span>
          <span id={`${uid}-pattern`} className="pp-visually-hidden">{pattern}</span>
          {startName && <input type="hidden" name={startName} value={range?.start ?? ''} disabled={disabled} />}
          {endName && <input type="hidden" name={endName} value={range?.end ?? ''} disabled={disabled} />}
          {open && (
            <div ref={panel} id={`${uid}-dialog`} role="dialog" aria-label={labels.chooseDate} className="pp-date__panel"
              popover={supportsPopover() ? 'manual' : undefined}
              onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); button.current?.focus(); } }}
              onBlur={(e) => { if (e.relatedTarget && !panel.current?.contains(e.relatedTarget as Node) && e.relatedTarget !== button.current) setOpen(false); }}>
              <RangeCalendar value={range} onValueChange={pick} min={min} max={max} isDateUnavailable={isDateUnavailable} locale={locale} autoFocus />
            </div>
          )}
        </>
      )}
    </Field>
  );
});
