import { createContext, useContext } from 'react';

/** Every built-in string Papier shows or announces. Override per app via <Papier labels>. */
export interface PapierLabels {
  close: string;
  dismiss: string;
  externalLink: string;
  loading: string;
  menu: string;
  notifications: string;
}

export const dutchLabels: PapierLabels = {
  close: 'Sluiten',
  dismiss: 'Melding sluiten',
  externalLink: '(opent in een nieuw tabblad)',
  loading: 'Bezig met laden',
  menu: 'Menu',
  notifications: 'Meldingen',
};

export const englishLabels: PapierLabels = {
  close: 'Close',
  dismiss: 'Dismiss notification',
  externalLink: '(opens in a new tab)',
  loading: 'Loading',
  menu: 'Menu',
  notifications: 'Notifications',
};

export const LabelsContext = createContext<PapierLabels>(dutchLabels);
export const useLabels = () => useContext(LabelsContext);
