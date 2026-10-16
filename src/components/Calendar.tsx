import { forwardRef, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useControllable } from '../lib/useControllable';
import {
  addDays, addMonths, clampDate, daysInMonth, firstDayOfWeek, formatDate, parseISO, toISO, todayISO, weekday, type ISODate,
} from '../lib/date';
import { ArrowLeft, ArrowRight } from './icons';

interface CalendarBase {
  /** Earliest date that can be chosen, "YYYY-MM-DD". */
  min?: ISODate;
  /** Latest date that can be chosen, "YYYY-MM-DD". */
  max?: ISODate;
  /** Dates that cannot be chosen, e.g. days a shop is closed. */
  isDateUnavailable?: (date: ISODate) => boolean;
  /** A date in the month shown first; defaults to the value or today. */
  defaultMonth?: ISODate;
  /** Locale for names and the first day of the week. Defaults to the `locale` of the Papier labels. */
  locale?: string;
  /** Moves focus to the active day when the calendar appears, e.g. inside a popover. */
  autoFocus?: boolean;
  className?: string;
}

export interface CalendarProps extends CalendarBase {
  /** The chosen date as "YYYY-MM-DD", or null. */
  value?: ISODate | null;
  defaultValue?: ISODate | null;
  onValueChange?: (value: ISODate) => void;
}

/** A span of dates; `end` is null while the second day is still to be picked. */
export interface DateRange { start: ISODate; end: ISODate | null }

export interface RangeCalendarProps extends CalendarBase {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  /** Called after the first day (with `end: null`) and again after the second. */
  onValueChange?: (value: DateRange) => void;
}

type Part = 'single' | 'start' | 'end' | 'middle' | null;

interface GridProps extends CalendarBase {
  /** The date the grid starts on and follows when it changes from outside. */
  anchor: ISODate | null;
  part: (d: ISODate) => Part;
  onPick: (d: ISODate) => void;
  onHover?: (d: ISODate | null) => void;
}

/** The month grid shared by Calendar and RangeCalendar: navigation, keyboard and naming. */
const MonthGrid = forwardRef<HTMLDivElement, GridProps>(function MonthGrid(
  { anchor, part, onPick, onHover, min, max, isDateUnavailable, defaultMonth, locale: localeProp, autoFocus, className }, ref,
) {
  const labels = useLabels();
  const locale = localeProp ?? labels.locale;
  const id = useId();
  const today = useMemo(todayISO, []);
  const [focused, setFocused] = useState<ISODate>(() => clampDate(parseISO(anchor) ? anchor! : parseISO(defaultMonth) ? defaultMonth! : today, min, max));
  const grid = useRef<HTMLTableElement>(null);
  const wantFocus = useRef(!!autoFocus);

  const { y, m } = parseISO(focused)!;
  const first = firstDayOfWeek(locale);
  const unavailable = (d: ISODate) => (min !== undefined && d < min) || (max !== undefined && d > max) || !!isDateUnavailable?.(d);

  // A value chosen from outside brings its month into view.
  useEffect(() => { if (parseISO(anchor)) setFocused(anchor!); }, [anchor]);

  useEffect(() => {
    if (!wantFocus.current) return;
    wantFocus.current = false;
    grid.current?.querySelector<HTMLElement>('td[tabindex="0"]')?.focus();
  }, [focused]);

  const weeks = useMemo(() => {
    const lead = (weekday(toISO(y, m, 1)) - first + 7) % 7;
    const cells: Array<ISODate | null> = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth(y, m) }, (_, i) => toISO(y, m, i + 1))];
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [y, m, first]);

  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    // 2024-01-07 is a Sunday.
    const d = toISO(2024, 1, 7 + ((first + i) % 7));
    return { short: formatDate(d, locale, { weekday: 'short' }), long: formatDate(d, locale, { weekday: 'long' }) };
  }), [first, locale]);

  const go = (next: ISODate, focus = true) => {
    wantFocus.current = focus;
    const d = clampDate(next, min, max);
    setFocused(d);
    if (focus) onHover?.(d);
  };
  const choose = (d: ISODate) => { if (!unavailable(d)) onPick(d); };

  const onKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const start = addDays(focused, -((weekday(focused) - first + 7) % 7));
    const moves: Record<string, () => ISODate> = {
      ArrowLeft: () => addDays(focused, rtl ? 1 : -1),
      ArrowRight: () => addDays(focused, rtl ? -1 : 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => start,
      End: () => addDays(start, 6),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    if (moves[e.key]) { e.preventDefault(); go(moves[e.key]()); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(focused); }
  };

  const monthTitle = formatDate(toISO(y, m, 1), locale, { month: 'long', year: 'numeric' });
  const prevDisabled = min !== undefined && toISO(y, m, 1) <= min;
  const nextDisabled = max !== undefined && toISO(y, m, daysInMonth(y, m)) >= max;

  return (
    <div ref={ref} className={cx('pp-calendar', className)}>
      <div className="pp-calendar__header">
        <button type="button" className="pp-calendar__nav" aria-label={labels.previousMonth} disabled={prevDisabled}
          onClick={() => go(addMonths(focused, -1), false)}><ArrowLeft className="pp-flip-rtl" width={16} height={16} /></button>
        <p id={`${id}-title`} className="pp-calendar__title" aria-live="polite">{monthTitle}</p>
        <button type="button" className="pp-calendar__nav" aria-label={labels.nextMonth} disabled={nextDisabled}
          onClick={() => go(addMonths(focused, 1), false)}><ArrowRight className="pp-flip-rtl" width={16} height={16} /></button>
      </div>
      <table ref={grid} role="grid" aria-labelledby={`${id}-title`} className="pp-calendar__grid" onKeyDown={onKeyDown}
        onPointerLeave={() => onHover?.(null)}>
        <thead>
          <tr>{weekdays.map((w) => <th key={w.long} scope="col" abbr={w.long}><span aria-hidden="true">{w.short.replace('.', '')}</span><span className="pp-visually-hidden">{w.long}</span></th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((d, i) => {
                if (!d) return <td key={i} role="gridcell" className="pp-calendar__empty" />;
                const off = unavailable(d);
                const p = part(d);
                return (
                  <td
                    key={d}
                    role="gridcell"
                    tabIndex={d === focused ? 0 : -1}
                    aria-selected={p !== null}
                    aria-disabled={off || undefined}
                    aria-current={d === today ? 'date' : undefined}
                    aria-label={formatDate(d, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    className="pp-calendar__day"
                    data-range={p === 'single' || p === null ? undefined : p}
                    onClick={() => { go(d); choose(d); }}
                    onFocus={() => { if (d !== focused) setFocused(d); }}
                    onPointerEnter={() => onHover?.(d)}
                  >
                    <span aria-hidden="true">{parseISO(d)!.d}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/**
 * A month grid to pick a date (WAI-ARIA date grid). Arrows move by day and week, Home and
 * End to the start and end of the week, PageUp and PageDown by month (with Shift by year),
 * Enter or Space chooses. Each day is named in full ("vrijdag 15 maart 2024"), today is
 * marked with aria-current and unavailable days with aria-disabled. The ref points at the root.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value: valueProp, defaultValue = null, onValueChange, ...rest }, ref,
) {
  const [value, setValue] = useControllable<ISODate | null>(valueProp, defaultValue, (v) => { if (v) onValueChange?.(v); });
  return <MonthGrid ref={ref} {...rest} anchor={value} part={(d) => (d === value ? 'single' : null)} onPick={setValue} />;
});

/**
 * A Calendar for a span of dates, e.g. a stay or a report period. The first day picked is
 * the start, the second the end (in either order); while picking, hovering or moving with
 * the keyboard previews the span. Every day in the span is aria-selected.
 */
export const RangeCalendar = forwardRef<HTMLDivElement, RangeCalendarProps>(function RangeCalendar(
  { value: valueProp, defaultValue = null, onValueChange, ...rest }, ref,
) {
  const [range, setRange] = useControllable<DateRange | null>(valueProp, defaultValue, (v) => { if (v) onValueChange?.(v); });
  const [hover, setHover] = useState<ISODate | null>(null);
  const picking = !!range && range.end === null;
  const [lo, hi] = !range ? [null, null] : range.end ? [range.start, range.end]
    : hover ? (hover < range.start ? [hover, range.start] : [range.start, hover]) : [range.start, range.start];

  const part = (d: ISODate): Part => {
    if (!lo || !hi) return null;
    if (lo === hi) return d === lo ? 'single' : null;
    return d === lo ? 'start' : d === hi ? 'end' : d > lo && d < hi ? 'middle' : null;
  };
  const pick = (d: ISODate) => {
    if (!picking) setRange({ start: d, end: null });
    else setRange(d < range!.start ? { start: d, end: range!.start } : { start: range!.start, end: d });
  };
  return <MonthGrid ref={ref} {...rest} anchor={range?.start ?? null} part={part} onPick={pick} onHover={picking ? setHover : undefined}
    className={cx('pp-calendar--range', rest.className)} />;
});
