import { createContext, useContext } from 'react';

/** Every built-in string Papier shows or announces. Override per app via <Papier labels>. */
export interface PapierLabels {
  /** BCP 47 locale for numbers and file sizes, e.g. "nl-NL". */
  locale: string;
  close: string;
  dismiss: string;
  externalLink: string;
  loading: string;
  menu: string;
  notifications: string;
  cancel: string;
  breadcrumb: string;
  pagination: string;
  previous: string;
  next: string;
  /** Name of a page link, e.g. "Pagina 3". */
  page: (page: number) => string;
  /** Position in a short pagination, e.g. "Pagina 3 van 12". */
  pageOf: (page: number, count: number) => string;
  showOptions: string;
  noResults: string;
  /** Announced while a combobox list is open, e.g. "4 resultaten". */
  results: (count: number) => string;
  increment: string;
  decrement: string;
  showPassword: string;
  /** Text on a file drop zone. */
  chooseFiles: (multiple: boolean) => string;
  /** Name of the button that removes a chosen file, e.g. "hoes.jpg verwijderen". */
  removeFile: (name: string) => string;
  /** A file over the size limit; `max` is already formatted, e.g. "5 MB". */
  fileTooLarge: (name: string, max: string) => string;
  fileTypeNotAllowed: (name: string) => string;
  tooManyFiles: (max: number) => string;
  /** Name of a button that removes a chosen item, e.g. "Jazz verwijderen". */
  remove: (name: string) => string;
  /** Announced after an item was removed. */
  removed: (name: string) => string;
  /** Describes the chosen items of a multi-select, e.g. "Gekozen: Jazz, Soul". */
  selectedItems: (names: string[]) => string;
  /** Names of the two thumbs of a range slider. */
  rangeStart: string;
  rangeEnd: string;
  chooseDate: string;
  previousMonth: string;
  nextMonth: string;
  /** Letters for a date pattern hint such as "dd-mm-jjjj". */
  datePattern: { day: string; month: string; year: string };
  /** Shown when typed text is not a date; `example` is a formatted date. */
  invalidDate: (example: string) => string;
  /** Shown when a typed date is before min, after max or unavailable. */
  dateUnavailable: string;
}

export const dutchLabels: PapierLabels = {
  locale: 'nl-NL',
  close: 'Sluiten',
  dismiss: 'Melding sluiten',
  externalLink: '(opent in een nieuw tabblad)',
  loading: 'Bezig met laden',
  menu: 'Menu',
  notifications: 'Meldingen',
  cancel: 'Annuleren',
  breadcrumb: 'Kruimelpad',
  pagination: 'Paginering',
  previous: 'Vorige',
  next: 'Volgende',
  page: (p) => `Pagina ${p}`,
  pageOf: (p, n) => `Pagina ${p} van ${n}`,
  showOptions: 'Toon opties',
  noResults: 'Geen resultaten',
  results: (n) => (n === 1 ? '1 resultaat' : `${n} resultaten`),
  increment: 'Verhogen',
  decrement: 'Verlagen',
  showPassword: 'Wachtwoord tonen',
  chooseFiles: (m) => (m ? 'Sleep bestanden hierheen of kies ze' : 'Sleep een bestand hierheen of kies er een'),
  removeFile: (name) => `${name} verwijderen`,
  fileTooLarge: (name, max) => `${name} is groter dan ${max}.`,
  fileTypeNotAllowed: (name) => `${name} heeft een bestandstype dat hier niet kan.`,
  tooManyFiles: (max) => (max === 1 ? 'Kies één bestand.' : `Kies hoogstens ${max} bestanden.`),
  remove: (name) => `${name} verwijderen`,
  removed: (name) => `${name} verwijderd`,
  selectedItems: (names) => (names.length ? `Gekozen: ${names.join(', ')}` : 'Niets gekozen'),
  rangeStart: 'Van',
  rangeEnd: 'Tot',
  chooseDate: 'Kies een datum',
  previousMonth: 'Vorige maand',
  nextMonth: 'Volgende maand',
  datePattern: { day: 'dd', month: 'mm', year: 'jjjj' },
  invalidDate: (example) => `Vul een bestaande datum in, zoals ${example}.`,
  dateUnavailable: 'Deze datum kun je niet kiezen.',
};

export const englishLabels: PapierLabels = {
  locale: 'en-US',
  close: 'Close',
  dismiss: 'Dismiss notification',
  externalLink: '(opens in a new tab)',
  loading: 'Loading',
  menu: 'Menu',
  notifications: 'Notifications',
  cancel: 'Cancel',
  breadcrumb: 'Breadcrumb',
  pagination: 'Pagination',
  previous: 'Previous',
  next: 'Next',
  page: (p) => `Page ${p}`,
  pageOf: (p, n) => `Page ${p} of ${n}`,
  showOptions: 'Show options',
  noResults: 'No results',
  results: (n) => (n === 1 ? '1 result' : `${n} results`),
  increment: 'Increase',
  decrement: 'Decrease',
  showPassword: 'Show password',
  chooseFiles: (m) => (m ? 'Drop files here or choose them' : 'Drop a file here or choose one'),
  removeFile: (name) => `Remove ${name}`,
  fileTooLarge: (name, max) => `${name} is larger than ${max}.`,
  fileTypeNotAllowed: (name) => `${name} is a file type that is not allowed here.`,
  tooManyFiles: (max) => (max === 1 ? 'Choose one file.' : `Choose at most ${max} files.`),
  remove: (name) => `Remove ${name}`,
  removed: (name) => `${name} removed`,
  selectedItems: (names) => (names.length ? `Selected: ${names.join(', ')}` : 'Nothing selected'),
  rangeStart: 'From',
  rangeEnd: 'To',
  chooseDate: 'Choose a date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  datePattern: { day: 'dd', month: 'mm', year: 'yyyy' },
  invalidDate: (example) => `Enter a real date, such as ${example}.`,
  dateUnavailable: 'This date cannot be chosen.',
};

export const LabelsContext = createContext<PapierLabels>(dutchLabels);
export const useLabels = () => useContext(LabelsContext);
