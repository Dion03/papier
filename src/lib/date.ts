// Calendar dates as ISO strings ("2024-03-15"), like <input type="date">. Arithmetic runs on
// UTC dates, so a time zone or daylight saving change can never move a day.

export type ISODate = string;

const pad = (n: number, len = 2) => String(n).padStart(len, '0');
export const toISO = (y: number, m: number, d: number): ISODate => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

export function parseISO(iso: string | null | undefined): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return isValidDate(y, m, d) ? { y, m, d } : null;
}

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const isValidDate = (y: number, m: number, d: number) => m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);

const utc = (iso: ISODate) => { const p = parseISO(iso)!; return new Date(Date.UTC(p.y, p.m - 1, p.d)); };
const fromUTC = (date: Date) => toISO(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

export const addDays = (iso: ISODate, n: number) => { const t = utc(iso); t.setUTCDate(t.getUTCDate() + n); return fromUTC(t); };

/** Same day in another month, or its last day when that month is shorter (31 jan + 1 = 29 feb). */
export function addMonths(iso: ISODate, n: number): ISODate {
  const p = parseISO(iso)!;
  const index = p.y * 12 + (p.m - 1) + n;
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return toISO(y, m, Math.min(p.d, daysInMonth(y, m)));
}

/** 0 = Sunday … 6 = Saturday. */
export const weekday = (iso: ISODate) => utc(iso).getUTCDay();

export function todayISO(): ISODate {
  const now = new Date();
  return toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Clamps a date between optional bounds; ISO strings compare correctly as text. */
export const clampDate = (iso: ISODate, min?: ISODate, max?: ISODate) => (min && iso < min ? min : max && iso > max ? max : iso);

/** First day of the week in a locale: 0 = Sunday, 1 = Monday. */
export function firstDayOfWeek(locale: string): number {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const day = l.getWeekInfo?.().firstDay ?? l.weekInfo?.firstDay;
    if (day) return day % 7;
  } catch { /* older engines */ }
  return /-(US|CA|JP|IL|BR|MX|PH|KR|TW|IN|ZA)$/i.test(locale) || locale === 'en' ? 0 : 1;
}

export const formatDate = (iso: ISODate, locale: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(utc(iso));

type Part = 'day' | 'month' | 'year';

/** The order of day, month and year in a locale and the character between them, e.g. ["day","month","year"] and "-". */
export function dateOrder(locale: string): { order: Part[]; separator: string } {
  const parts = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date(Date.UTC(2024, 2, 15)));
  const order = parts.filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year').map((p) => p.type as Part);
  const separator = parts.find((p) => p.type === 'literal')?.value.trim() || '-';
  return { order: order.length === 3 ? order : ['day', 'month', 'year'], separator };
}

/** A date as digits in the locale's order, e.g. "15-03-2024" in Dutch, "03/15/2024" in American English. */
export function formatNumericDate(iso: ISODate, locale: string): string {
  const p = parseISO(iso);
  if (!p) return '';
  const { order, separator } = dateOrder(locale);
  const value = { day: pad(p.d), month: pad(p.m), year: pad(p.y, 4) };
  return order.map((k) => value[k]).join(separator);
}

/**
 * Reads a typed date in the locale's order with any separator: "15-3-2024", "15/03/24" and
 * "15 3 2024" all work in Dutch. Two-digit years count from 2000 up to ten years ahead,
 * otherwise from 1900. Returns null for text that is not a real date.
 */
export function parseTypedDate(text: string, locale: string): ISODate | null {
  const iso = parseISO(text.trim());
  if (iso) return toISO(iso.y, iso.m, iso.d);
  const nums = text.trim().split(/[^\d]+/).filter(Boolean);
  if (nums.length !== 3) return null;
  const { order } = dateOrder(locale);
  const got = { day: 0, month: 0, year: 0 };
  order.forEach((k, i) => { got[k] = Number(nums[i]); });
  if (nums[order.indexOf('year')].length <= 2) {
    const pivot = (new Date().getFullYear() % 100) + 10;
    got.year += got.year <= pivot ? 2000 : 1900;
  }
  return isValidDate(got.year, got.month, got.day) ? toISO(got.year, got.month, got.day) : null;
}
