import type { ReactNode } from 'react';
import {
  Avatar, Breadcrumb, BreadcrumbItem, Button, Calendar, Checkbox, CopyButton, Disclosure, IconButton, Kbd, Link,
  Notice, NumberField, PinInput, Select, Progress, RangeSlider, SegmentedControl, Separator, Skeleton, Slider, Stack, Steps, Surface, Switch, Tab,
  TabList, Tabs, Tag, Text, TextField, Toggle, icons,
} from '@dionbm/papier';

// The map of the docs site: every component page, its category and its card on the
// explorer. A page shows the Example with the same `example` id from Components.tsx,
// Extended.tsx or Additions.tsx; tests/docs.test.ts checks that both sides match.

export interface Category { id: string; title: string; blurb: string; icon: ReactNode }

export const categories: Category[] = [
  { id: 'acties', title: 'Acties', blurb: 'Knoppen en wat je ermee start.', icon: <icons.ArrowRight /> },
  { id: 'invoer', title: 'Invoer', blurb: 'Tekst, getallen, codes en bestanden.', icon: <icons.Plus /> },
  { id: 'keuzes', title: 'Keuzes', blurb: 'Aan, uit, een of meer, een bereik.', icon: <icons.Check /> },
  { id: 'zoeken', title: 'Zoeken en kiezen', blurb: 'Lange lijsten die meezoeken.', icon: <icons.Search /> },
  { id: 'datums', title: 'Datums', blurb: 'Een dag of een periode.', icon: <icons.Calendar /> },
  { id: 'overlays', title: 'Overlays', blurb: 'Vensters, panelen, menu’s en hints.', icon: <icons.Copy /> },
  { id: 'feedback', title: 'Feedback', blurb: 'Status, voortgang en meldingen.', icon: <icons.Info /> },
  { id: 'navigatie', title: 'Navigatie en structuur', blurb: 'Waar je bent en wat erbij hoort.', icon: <icons.Menu /> },
  { id: 'gegevens', title: 'Gegevens', blurb: 'Tabellen, personen en lege toestanden.', icon: <icons.Sort /> },
  { id: 'basis', title: 'Basis en layout', blurb: 'Materiaal, ruimte en kleine onderdelen.', icon: <icons.File /> },
];

export interface DocPage {
  /** Route: #/componenten/<slug>. */
  slug: string;
  /** Id of the Example that holds the demo, code and API. Also the old one-page anchor. */
  example: string;
  category: string;
  /** Sidebar and card title. */
  title: string;
  summary: string;
  /** Exported names documented here; they are searchable and make the import line. */
  exports: string[];
  keywords?: string[];
  related?: string[];
  popular?: boolean;
  /** Version that added the page's components; the current release shows as new. */
  added?: string;
  /** Renders without client JavaScript in Next.js. */
  server?: boolean;
  /** A small, non-interactive picture of the component for its card. */
  preview: () => ReactNode;
}

const P = ({ children }: { children: ReactNode }) => <div className="doc-mini">{children}</div>;

export const pages: DocPage[] = [
  // Acties
  { slug: 'button', example: 'knoppen', category: 'acties', title: 'Button', summary: 'De actie: salie, inkt, secundair, ghost en gevaar, met laden en asChild.', exports: ['Button', 'IconButton'], keywords: ['knop', 'iconbutton', 'aschild'], popular: true, related: ['copy-button', 'menu', 'checkbox-group'],
    preview: () => <P><Stack direction="row" gap={2} align="center" wrap><Button size="sm">Opslaan</Button><Button size="sm" variant="secondary">Annuleren</Button><IconButton label="Volgende" variant="disc" icon={<icons.ArrowRight />} /></Stack></P> },
  { slug: 'copy-button', example: 'kopieren', category: 'acties', title: 'CopyButton', summary: 'Kopieert tekst en bevestigt het met een vinkje en een melding.', exports: ['CopyButton'], keywords: ['klembord', 'clipboard', 'kopiëren'], added: '0.5', related: ['button', 'toast'],
    preview: () => <P><Stack direction="row" gap={2} align="center"><code className="doc-mini__code">npm i @dionbm/papier</code><CopyButton value="" /></Stack></P> },
  // Invoer
  { slug: 'text-field', example: 'formulieren', category: 'invoer', title: 'TextField en TextArea', summary: 'Het onderstreepte veld met label, hint en fout.', exports: ['TextField', 'TextArea'], keywords: ['input', 'tekstveld', 'textarea'], popular: true, related: ['field', 'password-field', 'number-field'],
    preview: () => <P><TextField label="E-mailadres" defaultValue="dion@" hint="Alleen voor een antwoord." /></P> },
  { slug: 'field', example: 'velden', category: 'invoer', title: 'Field, prefix en suffix', summary: 'Bouwstenen voor eigen of externe inputs, en iconen of eenheden in het veld.', exports: ['Field', 'FieldLabel', 'FieldHint', 'FieldError', 'useField', 'useFieldControl'], keywords: ['prefix', 'suffix', 'label'], related: ['text-field'],
    preview: () => <P><TextField label="Prijs in euro" prefix="€" defaultValue="24,95" /></P> },
  { slug: 'number-field', example: 'getallen', category: 'invoer', title: 'NumberField', summary: 'Een getal met − en +, in de taal van de app opgemaakt.', exports: ['NumberField', 'parseNumber'], keywords: ['getal', 'aantal', 'bedrag', 'spinbutton'], added: '0.5', related: ['text-field', 'slider'],
    preview: () => <P><NumberField label="Aantal" defaultValue={2} min={1} /></P> },
  { slug: 'password-field', example: 'account', category: 'invoer', title: 'PasswordField', summary: 'Een wachtwoord dat je kunt tonen, en een TextArea die meegroeit.', exports: ['PasswordField'], keywords: ['wachtwoord', 'autoresize'], added: '0.5', related: ['text-field', 'pin-input'],
    preview: () => <P><TextField label="Wachtwoord" type="password" defaultValue="geheimpje" suffix={<icons.Eye />} /></P> },
  { slug: 'pin-input', example: 'pincode', category: 'invoer', title: 'PinInput', summary: 'Een code over een paar vakjes, met plakken en sms-autofill.', exports: ['PinInput'], keywords: ['otp', 'code', 'pincode', 'verificatie'], added: '0.5', related: ['password-field', 'number-field'],
    preview: () => <P><PinInput label="Inlogcode" length={4} defaultValue="27" /></P> },
  { slug: 'file-field', example: 'bestanden', category: 'invoer', title: 'FileField', summary: 'Sleep of kies bestanden, met grenzen, voorbeelden en meldingen.', exports: ['FileField', 'acceptsFile', 'formatFileSize'], keywords: ['upload', 'bestand', 'dropzone'], added: '0.5',
    preview: () => <P><div className="doc-mini__drop"><icons.Upload /> Sleep een bestand hierheen</div></P> },
  // Keuzes
  { slug: 'checkbox-switch', example: 'keuzes', category: 'keuzes', title: 'Checkbox, Switch en SegmentedControl', summary: 'Aan of uit, en een keuze tussen een paar weergaven.', exports: ['Checkbox', 'Switch', 'SegmentedControl'], keywords: ['vinkje', 'toggle', 'segment'], popular: true, related: ['checkbox-group', 'select-radio'],
    preview: () => <P><Stack gap={3}><SegmentedControl label="Periode" size="sm" defaultValue="m" options={[{ value: 'w', label: 'Week' }, { value: 'm', label: 'Maand' }]} /><Switch label="Geluid" defaultChecked /></Stack></P> },
  { slug: 'checkbox-group', example: 'meerkeuze', category: 'keuzes', title: 'CheckboxGroup en ToggleGroup', summary: 'Meerdere keuzes, Alles selecteren en filters die je aan en uit zet.', exports: ['CheckboxGroup', 'Toggle', 'ToggleGroup'], keywords: ['indeterminate', 'filters', 'chips'], added: '0.5', related: ['checkbox-switch', 'multi-combobox'],
    preview: () => <P><Stack gap={3}><Checkbox label="Alle formaten" indeterminate /><Stack direction="row" gap={2}><Toggle size="sm" defaultPressed>Jazz</Toggle><Toggle size="sm">Soul</Toggle></Stack></Stack></P> },
  { slug: 'select-radio', example: 'select', category: 'keuzes', title: 'Select en RadioGroup', summary: 'Een native select en keuzerondjes, als lijst of tegels.', exports: ['Select', 'RadioGroup'], keywords: ['dropdown', 'radio'], related: ['combobox', 'checkbox-switch'],
    preview: () => <P><Select label="Sorteer op" defaultValue="a" options={[{ value: 'a', label: 'Artiest' }, { value: 'j', label: 'Jaar' }]} /></P> },
  { slug: 'slider', example: 'slider', category: 'keuzes', title: 'Slider', summary: 'Een native range met gevuld spoor en leesbare waarde.', exports: ['Slider'], keywords: ['range', 'volume'], related: ['range-slider', 'number-field'],
    preview: () => <P><Slider label="Volume" defaultValue={64} formatValue={(v) => `${v}%`} /></P> },
  { slug: 'range-slider', example: 'bereik', category: 'keuzes', title: 'RangeSlider', summary: 'Een bereik met twee duimen en streepjes eronder.', exports: ['RangeSlider'], keywords: ['bereik', 'van tot', 'prijs'], added: '0.5', related: ['slider'],
    preview: () => <P><RangeSlider label="Jaar" min={1950} max={2025} defaultValue={[1960, 1990]} /></P> },
  // Zoeken en kiezen
  { slug: 'combobox', example: 'zoeken', category: 'zoeken', title: 'Combobox', summary: 'Een veld met een lijst die meezoekt, ook op een server.', exports: ['Combobox', 'defaultComboboxFilter'], keywords: ['autocomplete', 'zoeken', 'typeahead'], popular: true, related: ['multi-combobox', 'command', 'select-radio'],
    preview: () => <P><div className="doc-mini__list"><span className="doc-mini__input">bjo<i /></span><span data-active>Vespertine <small>Björk</small></span><span>Homogenic <small>Björk</small></span></div></P> },
  { slug: 'multi-combobox', example: 'meerdere', category: 'zoeken', title: 'MultiCombobox', summary: 'Meerdere keuzes als labels in het veld, met meezoeken.', exports: ['MultiCombobox'], keywords: ['multiselect', 'tags input'], added: '0.5', related: ['combobox', 'checkbox-group'],
    preview: () => <P><div className="doc-mini__tags"><Tag tone="sage">John Coltrane</Tag><Tag tone="sage">Nina Simone</Tag><span className="doc-mini__caret" /></div></P> },
  { slug: 'command', example: 'command', category: 'zoeken', title: 'Command', summary: 'Een opdrachtenlijst die meezoekt, als ⌘K-venster of in de pagina.', exports: ['Command', 'CommandDialog', 'scoreCommandItem'], keywords: ['command palette', 'cmdk', 'spotlight', 'sneltoets'], added: '0.5', popular: true, related: ['combobox', 'dialog'],
    preview: () => <P><div className="doc-mini__list"><span className="doc-mini__input"><icons.Search width={14} height={14} /> date</span><span data-active>DatePicker <Kbd>↵</Kbd></span><span>DateRangePicker</span></div></P> },
  // Datums
  { slug: 'date-picker', example: 'datum', category: 'datums', title: 'DatePicker en Calendar', summary: 'Een datum typen zoals je hem zegt, of kiezen in een kalender.', exports: ['DatePicker', 'Calendar', 'parseTypedDate', 'formatNumericDate'], keywords: ['datum', 'kalender', 'date'], added: '0.5', popular: true, related: ['date-range-picker'],
    preview: () => <P><div className="doc-mini__calendar"><Calendar defaultValue="2024-03-15" /></div></P> },
  { slug: 'date-range-picker', example: 'periode', category: 'datums', title: 'DateRangePicker', summary: 'Een periode: twee velden en één kalender voor begin en eind.', exports: ['DateRangePicker', 'RangeCalendar'], keywords: ['periode', 'verblijf', 'range'], added: '0.5', related: ['date-picker'],
    preview: () => <P><TextField label="Verblijf" defaultValue="12-07-2024  –  16-07-2024" suffix={<icons.Calendar />} /></P> },
  // Overlays
  { slug: 'dialog', example: 'dialoog', category: 'overlays', title: 'Dialog', summary: 'Een modaal venster op het native dialog-element.', exports: ['Dialog'], keywords: ['modal', 'venster'], popular: true, related: ['alert-dialog', 'tooltip-sheet', 'popover'],
    preview: () => <P><Surface elevation="object" padding="sm" radius="lg" className="doc-mini__window"><Text variant="label" as="p">Plaat terug in de hoes?</Text><Stack direction="row" gap={2} justify="flex-end"><Button size="sm" variant="ghost">Nee</Button><Button size="sm" variant="ink">Opbergen</Button></Stack></Surface></P> },
  { slug: 'alert-dialog', example: 'bevestigen', category: 'overlays', title: 'AlertDialog', summary: 'Een bevestiging die onderbreekt, voor acties met gevolgen.', exports: ['AlertDialog'], keywords: ['bevestigen', 'confirm', 'verwijderen'], related: ['dialog'],
    preview: () => <P><Surface elevation="object" padding="sm" radius="lg" className="doc-mini__window"><Text variant="label" as="p">Blue Train verwijderen?</Text><Stack direction="row" gap={2} justify="flex-end"><Button size="sm" variant="secondary">Annuleren</Button><Button size="sm" variant="danger">Verwijderen</Button></Stack></Surface></P> },
  { slug: 'popover', example: 'popover', category: 'overlays', title: 'Popover', summary: 'Een niet-modaal paneel naast een knop, voor filters en korte formulieren.', exports: ['Popover'], keywords: ['paneel', 'filter'], added: '0.5', related: ['menu', 'tooltip-sheet', 'dialog'],
    preview: () => <P><Stack gap={2}><Button size="sm" variant="secondary" iconStart={<icons.Search />}>Filters</Button><Surface elevation="object" padding="sm" radius="md" className="doc-mini__window"><Checkbox label="Jazz" defaultChecked /></Surface></Stack></P> },
  { slug: 'menu', example: 'menu-keuzes', category: 'overlays', title: 'Menu', summary: 'Een actiemenu met kopjes, keuzes, links en sneltoetsen.', exports: ['Menu'], keywords: ['dropdown', 'actiemenu', 'contextmenu'], related: ['popover', 'tooltip-sheet'],
    preview: () => <P><div className="doc-mini__list doc-mini__list--menu"><small>Sorteren op</small><span data-active><icons.Check width={14} height={14} /> Artiest</span><span>Jaar <Kbd>J</Kbd></span></div></P> },
  { slug: 'tooltip-sheet', example: 'overlays', category: 'overlays', title: 'Tooltip, Menu en Sheet', summary: 'Een hint op hover of focus, en een paneel vanaf de rand.', exports: ['Tooltip', 'Sheet'], keywords: ['hint', 'drawer', 'zijpaneel'], related: ['menu', 'popover'],
    preview: () => <P><Stack gap={2} align="center"><span className="doc-mini__tip">Zet de plaat terug</span><IconButton label="Opbergen" icon={<icons.Close />} /></Stack></P> },
  // Feedback
  { slug: 'notice-progress', example: 'feedback', category: 'feedback', title: 'Notice en Progress', summary: 'Statusmeldingen met eigen icoon en voortgang met waardetekst.', exports: ['Notice', 'Progress', 'Spinner'], keywords: ['alert', 'melding', 'voortgang'], related: ['toast'],
    preview: () => <P><Stack gap={3}><Notice tone="success" title="Opgeslagen" /><Progress label="Uploaden" value={60} /></Stack></P> },
  { slug: 'toast', example: 'toast', category: 'feedback', title: 'Toast', summary: 'Korte bevestigingen die pauzeren als je erop wijst.', exports: ['ToastProvider', 'useToast'], keywords: ['snackbar', 'notification'], popular: true, related: ['toast-promise', 'notice-progress'],
    preview: () => <P><Surface elevation="object" padding="none" radius="md"><Notice tone="success" title="Plaat toegevoegd" onDismiss={() => {}} /></Surface></P> },
  { slug: 'toast-promise', example: 'toast-voortgang', category: 'feedback', title: 'Toast met voortgang', summary: 'Een melding die laat zien dat iets loopt en dan het resultaat toont.', exports: ['useToast'], keywords: ['promise', 'update', 'laden'], added: '0.5', related: ['toast'],
    preview: () => <P><Surface elevation="object" padding="none" radius="md"><Notice tone="info" title="Synchroniseren…" icon={<icons.Spinner width={15} height={15} />} /></Surface></P> },
  // Navigatie en structuur
  { slug: 'breadcrumb-pagination', example: 'navigatie', category: 'navigatie', title: 'Breadcrumb en Pagination', summary: 'Een kruimelpad en paginering met links of knoppen.', exports: ['Breadcrumb', 'BreadcrumbItem', 'Pagination', 'paginationRange'], keywords: ['kruimelpad', 'paginering'], related: ['steps', 'tabs'],
    preview: () => <P><Breadcrumb><BreadcrumbItem href="#">Collectie</BreadcrumbItem><BreadcrumbItem>Jazz</BreadcrumbItem></Breadcrumb></P> },
  { slug: 'tabs', example: 'structuur', category: 'navigatie', title: 'Tabs en Disclosure', summary: 'Weergaven van dezelfde inhoud en een native uitklapper.', exports: ['Tabs', 'TabList', 'Tab', 'TabPanel', 'Disclosure'], keywords: ['tabbladen', 'uitklapper', 'details'], popular: true, related: ['accordion', 'steps'],
    preview: () => <P><Tabs defaultValue="a"><TabList label="Weergave"><Tab value="a">Nu</Tab><Tab value="b">Week</Tab><Tab value="c">Jaar</Tab></TabList></Tabs></P> },
  { slug: 'accordion', example: 'structuur-plus', category: 'navigatie', title: 'Accordion en verticale Tabs', summary: 'Vragen die elkaar dichtvouwen, en tabs in een kolom.', exports: ['Accordion', 'Tabs'], keywords: ['faq', 'veelgestelde vragen'], added: '0.5', related: ['tabs'],
    preview: () => <P><Disclosure summary="Hoe lang duurt verzending?" /></P> },
  { slug: 'steps', example: 'stappen', category: 'navigatie', title: 'Steps', summary: 'Voortgang door een paar stappen, zoals afrekenen.', exports: ['Steps'], keywords: ['stepper', 'wizard', 'stappen'], added: '0.5', related: ['tabs', 'breadcrumb-pagination'],
    preview: () => <P><Steps items={[{ title: 'Mand' }, { title: 'Bezorging' }, { title: 'Betalen' }]} current={1} /></P> },
  // Gegevens
  { slug: 'table', example: 'data', category: 'gegevens', title: 'Table, Avatar en Skeleton', summary: 'Een native tabel, avatars en plaatshouders tijdens laden.', exports: ['Table', 'Avatar', 'Skeleton', 'Spinner'], keywords: ['tabel', 'loading', 'placeholder'], popular: true, related: ['sortable-table'], server: true,
    preview: () => <P><Stack gap={3}><Stack direction="row" gap={3} align="center"><Avatar name="Froukje Veenstra" size="sm" /><Text variant="small" as="span">Uitzinnig · 42×</Text></Stack><Stack direction="row" gap={3} align="center"><Skeleton shape="circle" width={32} height={32} /><div style={{ flex: 1 }}><Skeleton /></div></Stack></Stack></P> },
  { slug: 'sortable-table', example: 'sorteren', category: 'gegevens', title: 'Sorteerbare tabel en EmptyState', summary: 'Kolommen die sorteren, selectie en een lege toestand met uitweg.', exports: ['SortHeader', 'useTableSort', 'EmptyState'], keywords: ['sorteren', 'aria-sort', 'leeg'], added: '0.5', related: ['table'],
    preview: () => <P><div className="doc-mini__table"><span>Titel <icons.ArrowUp width={12} height={12} /></span><span>Jaar</span><span>Blue Train</span><span>1957</span><span>Rumours</span><span>1977</span></div></P> },
  // Basis en layout
  { slug: 'surface-tag-link', example: 'materiaal', category: 'basis', title: 'Surface, Tag en Link', summary: 'Modules met een materiaal, kleine labels en links.', exports: ['Surface', 'Tag', 'Link', 'Text', 'VisuallyHidden'], keywords: ['card', 'kaart', 'badge', 'label'], server: true, related: ['stack-container', 'separator-kbd'],
    preview: () => <P><Stack direction="row" gap={2} wrap align="center"><Tag tone="sage">Kotlin</Tag><Tag tone="coral">Compose</Tag><Tag tone="outline">2024</Tag><Link href="#" variant="arrow">Werk</Link></Stack></P> },
  { slug: 'stack-container', example: 'layout', category: 'basis', title: 'Stack en Container', summary: 'Een flexstapel op de ruimteschaal en een container met goot.', exports: ['Stack', 'Container'], keywords: ['layout', 'flex', 'grid'], server: true, related: ['surface-tag-link'],
    preview: () => <P><div className="doc-mini__stack"><span /><span /><span /></div></P> },
  { slug: 'separator-kbd', example: 'details', category: 'basis', title: 'Kbd, Separator en EmptyState', summary: 'Toetsen, lijnen tussen groepen en een lege toestand.', exports: ['Kbd', 'Separator', 'EmptyState'], keywords: ['divider', 'toets', 'empty state'], added: '0.5', server: true, related: ['sortable-table'],
    preview: () => <P><Stack gap={3}><Text variant="small" as="p">Zoek met <Kbd>Ctrl</Kbd> <Kbd>K</Kbd></Text><Separator label="of" /></Stack></P> },
];

/** The release being documented: pages added in it get a "nieuw" badge. */
export const currentRelease = '0.5';

export const pageBySlug = new Map(pages.map((p) => [p.slug, p]));
export const pageByExample = new Map(pages.map((p) => [p.example, p]));
export const categoryById = new Map(categories.map((c) => [c.id, c]));

/** Pages in sidebar order, for previous and next links. */
export const orderedPages = categories.flatMap((c) => pages.filter((p) => p.category === c.id));

export function relatedPages(page: DocPage): DocPage[] {
  const named = (page.related ?? []).map((s) => pageBySlug.get(s)).filter((p): p is DocPage => !!p);
  const sameCategory = pages.filter((p) => p.category === page.category && p.slug !== page.slug && !named.includes(p));
  return [...named, ...sameCategory].slice(0, 4);
}

/** Guides outside the component pages, also in search. */
export interface Guide { slug: string; title: string; summary: string; sections: Array<{ id: string; title: string; keywords?: string[] }> }

export const guides: Guide[] = [
  { slug: 'start', title: 'Aan de slag', summary: 'Installeren, importeren en Papier in je eigen app gebruiken.', sections: [
    { id: 'installatie', title: 'Installatie', keywords: ['npm', 'install', 'css'] },
    { id: 'eerste-scherm', title: 'Je eerste scherm', keywords: ['papier', 'toastprovider'] },
    { id: 'nextjs', title: 'Next.js en server components', keywords: ['use client', 'rsc', 'app router'] },
    { id: 'router-links', title: 'Router-links met asChild', keywords: ['react router', 'next link'] },
    { id: 'css', title: 'CSS, @layer en Tailwind', keywords: ['layer', 'tailwind', 'reset'] },
    { id: 'talen', title: 'Teksten en talen', keywords: ['labels', 'engels', 'locale', 'i18n'] },
    { id: 'rtl', title: 'Van rechts naar links', keywords: ['rtl', 'arabisch', 'hebreeuws'] },
    { id: 'kwaliteit', title: 'Hoe het getest is', keywords: ['axe', 'tests', 'playwright'] },
  ] },
  { slug: 'thema', title: 'Thema’s', summary: 'Licht, donker en je eigen merkkleuren, met een contrastcheck.', sections: [
    { id: 'licht-donker', title: 'Licht, donker en systeem', keywords: ['dark mode', 'donker'] },
    { id: 'eigen-thema', title: 'Een eigen thema', keywords: ['themestyle', 'merk', 'brand'] },
    { id: 'speeltuin', title: 'Probeer een merkkleur', keywords: ['checktheme', 'contrast'] },
    { id: 'beweging', title: 'Minder beweging', keywords: ['reduced motion', 'animatie'] },
  ] },
  { slug: 'fundament', title: 'Fundament', summary: 'Kleur, type, ruimte, vorm en beweging als tokens.', sections: [
    { id: 'kleur', title: 'Kleur en contrast', keywords: ['tokens', 'palet', 'wcag'] },
    { id: 'typografie', title: 'Typografie', keywords: ['manrope', 'dm sans', 'font'] },
    { id: 'ruimte', title: 'Ruimte en vorm', keywords: ['spacing', 'radius'] },
    { id: 'beweging', title: 'Beweging', keywords: ['motion', 'easing', 'duur'] },
  ] },
];
