import { createContext, useContext } from 'react';

/** Every built-in string Papier shows or announces. Override per app via <Papier labels>. */
export interface PapierLabels {
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
}

export const dutchLabels: PapierLabels = {
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
};

export const englishLabels: PapierLabels = {
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
};

export const LabelsContext = createContext<PapierLabels>(dutchLabels);
export const useLabels = () => useContext(LabelsContext);
