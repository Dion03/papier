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
  { id: 'actions', title: 'Actions', blurb: 'Buttons and what they start.', icon: <icons.ArrowRight /> },
  { id: 'inputs', title: 'Inputs', blurb: 'Text, numbers, codes and files.', icon: <icons.Plus /> },
  { id: 'choices', title: 'Choices', blurb: 'On, off, one, several, a range.', icon: <icons.Check /> },
  { id: 'search', title: 'Search and pick', blurb: 'Long lists that filter as you type.', icon: <icons.Search /> },
  { id: 'dates', title: 'Dates', blurb: 'A day or a period.', icon: <icons.Calendar /> },
  { id: 'overlays', title: 'Overlays', blurb: 'Dialogs, panels, menus and hints.', icon: <icons.Copy /> },
  { id: 'feedback', title: 'Feedback', blurb: 'Status, progress and notifications.', icon: <icons.Info /> },
  { id: 'navigation', title: 'Navigation and structure', blurb: 'Where you are and what belongs together.', icon: <icons.Menu /> },
  { id: 'data', title: 'Data', blurb: 'Tables, people and empty states.', icon: <icons.Sort /> },
  { id: 'basics', title: 'Basics and layout', blurb: 'Material, space and small parts.', icon: <icons.File /> },
];

export interface DocPage {
  /** Route: #/components/<slug>. */
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
  // Actions
  { slug: 'button', example: 'knoppen', category: 'actions', title: 'Button', summary: 'The action: sage, ink, secondary, ghost and danger, with loading and asChild.', exports: ['Button', 'IconButton'], keywords: ['iconbutton', 'aschild', 'link'], popular: true, related: ['copy-button', 'menu', 'checkbox-group'],
    preview: () => <P><Stack direction="row" gap={2} align="center" wrap><Button size="sm">Save</Button><Button size="sm" variant="secondary">Cancel</Button><IconButton label="Next" variant="disc" icon={<icons.ArrowRight />} /></Stack></P> },
  { slug: 'copy-button', example: 'kopieren', category: 'actions', title: 'CopyButton', summary: 'Copies text and confirms it with a tick and an announcement.', exports: ['CopyButton'], keywords: ['clipboard', 'copy'], added: '0.5', related: ['button', 'toast'],
    preview: () => <P><Stack direction="row" gap={2} align="center"><code className="doc-mini__code">npm i @dionbm/papier</code><CopyButton value="" /></Stack></P> },
  // Inputs
  { slug: 'text-field', example: 'formulieren', category: 'inputs', title: 'TextField and TextArea', summary: 'The underlined field with label, hint and error.', exports: ['TextField', 'TextArea'], keywords: ['input', 'textarea', 'form'], popular: true, related: ['field', 'password-field', 'number-field'],
    preview: () => <P><TextField label="Email address" defaultValue="dion@" hint="Only to reply to you." /></P> },
  { slug: 'field', example: 'velden', category: 'inputs', title: 'Field, prefix and suffix', summary: 'Building blocks for your own or third-party inputs, and icons or units in the field.', exports: ['Field', 'FieldLabel', 'FieldHint', 'FieldError', 'useField', 'useFieldControl'], keywords: ['prefix', 'suffix', 'label', 'form'], related: ['text-field'],
    preview: () => <P><TextField label="Price in euros" prefix="â‚¬" defaultValue="24.95" /></P> },
  { slug: 'number-field', example: 'getallen', category: 'inputs', title: 'NumberField', summary: 'A number with âˆ’ and +, formatted in the appâ€™s language.', exports: ['NumberField', 'parseNumber'], keywords: ['number', 'quantity', 'amount', 'currency', 'spinbutton'], added: '0.5', related: ['text-field', 'slider'],
    preview: () => <P><NumberField label="Quantity" defaultValue={2} min={1} /></P> },
  { slug: 'password-field', example: 'account', category: 'inputs', title: 'PasswordField', summary: 'A password you can reveal, and a TextArea that grows as you type.', exports: ['PasswordField'], keywords: ['password', 'autoresize'], added: '0.5', related: ['text-field', 'pin-input'],
    preview: () => <P><TextField label="Password" type="password" defaultValue="secretly" suffix={<icons.Eye />} /></P> },
  { slug: 'pin-input', example: 'pincode', category: 'inputs', title: 'PinInput', summary: 'A code split over a few boxes, with paste and SMS autofill.', exports: ['PinInput'], keywords: ['otp', 'code', 'pin', 'verification', 'one-time code'], added: '0.5', related: ['password-field', 'number-field'],
    preview: () => <P><PinInput label="Sign-in code" length={4} defaultValue="27" /></P> },
  { slug: 'file-field', example: 'bestanden', category: 'inputs', title: 'FileField', summary: 'Drop or choose files, with limits, previews and messages.', exports: ['FileField', 'acceptsFile', 'formatFileSize'], keywords: ['upload', 'file', 'dropzone', 'drag and drop'], added: '0.5',
    preview: () => <P><div className="doc-mini__drop"><icons.Upload /> Drop a file here</div></P> },
  // Choices
  { slug: 'checkbox-switch', example: 'keuzes', category: 'choices', title: 'Checkbox, Switch and SegmentedControl', summary: 'On or off, and a choice between a few views.', exports: ['Checkbox', 'Switch', 'SegmentedControl'], keywords: ['toggle', 'segment', 'checkbox'], popular: true, related: ['checkbox-group', 'select-radio'],
    preview: () => <P><Stack gap={3}><SegmentedControl label="Period" size="sm" defaultValue="m" options={[{ value: 'w', label: 'Week' }, { value: 'm', label: 'Month' }]} /><Switch label="Sound" defaultChecked /></Stack></P> },
  { slug: 'checkbox-group', example: 'meerkeuze', category: 'choices', title: 'CheckboxGroup and ToggleGroup', summary: 'Several choices, select all, and filters you switch on and off.', exports: ['CheckboxGroup', 'Toggle', 'ToggleGroup'], keywords: ['indeterminate', 'filters', 'chips', 'select all'], added: '0.5', related: ['checkbox-switch', 'multi-combobox'],
    preview: () => <P><Stack gap={3}><Checkbox label="All formats" indeterminate /><Stack direction="row" gap={2}><Toggle size="sm" defaultPressed>Jazz</Toggle><Toggle size="sm">Soul</Toggle></Stack></Stack></P> },
  { slug: 'select-radio', example: 'select', category: 'choices', title: 'Select and RadioGroup', summary: 'A native select and radio buttons, as a list or as tiles.', exports: ['Select', 'RadioGroup'], keywords: ['dropdown', 'radio'], related: ['combobox', 'checkbox-switch'],
    preview: () => <P><Select label="Sort by" defaultValue="a" options={[{ value: 'a', label: 'Artist' }, { value: 'j', label: 'Year' }]} /></P> },
  { slug: 'slider', example: 'slider', category: 'choices', title: 'Slider', summary: 'A native range with a filled track and a readable value.', exports: ['Slider'], keywords: ['range', 'volume'], related: ['range-slider', 'number-field'],
    preview: () => <P><Slider label="Volume" defaultValue={64} formatValue={(v) => `${v}%`} /></P> },
  { slug: 'range-slider', example: 'bereik', category: 'choices', title: 'RangeSlider', summary: 'A range with two thumbs and marks below it.', exports: ['RangeSlider'], keywords: ['range', 'from to', 'price', 'two thumbs'], added: '0.5', related: ['slider'],
    preview: () => <P><RangeSlider label="Year" min={1950} max={2025} defaultValue={[1960, 1990]} /></P> },
  // Search and pick
  { slug: 'combobox', example: 'zoeken', category: 'search', title: 'Combobox', summary: 'A field with a list that filters as you type, also on a server.', exports: ['Combobox', 'defaultComboboxFilter'], keywords: ['autocomplete', 'search', 'typeahead', 'select'], popular: true, related: ['multi-combobox', 'command', 'select-radio'],
    preview: () => <P><div className="doc-mini__list"><span className="doc-mini__input">bjo<i /></span><span data-active>Vespertine <small>BjÃ¶rk</small></span><span>Homogenic <small>BjÃ¶rk</small></span></div></P> },
  { slug: 'multi-combobox', example: 'meerdere', category: 'search', title: 'MultiCombobox', summary: 'Several choices as tags in the field, with filtering.', exports: ['MultiCombobox'], keywords: ['multiselect', 'tags input', 'multiple'], added: '0.5', related: ['combobox', 'checkbox-group'],
    preview: () => <P><div className="doc-mini__tags"><Tag tone="sage">John Coltrane</Tag><Tag tone="sage">Nina Simone</Tag><span className="doc-mini__caret" /></div></P> },
  { slug: 'command', example: 'command', category: 'search', title: 'Command', summary: 'A command list that filters as you type, as a âŒ˜K dialog or in the page.', exports: ['Command', 'CommandDialog', 'scoreCommandItem'], keywords: ['command palette', 'cmdk', 'spotlight', 'shortcut'], added: '0.5', popular: true, related: ['combobox', 'dialog'],
    preview: () => <P><div className="doc-mini__list"><span className="doc-mini__input"><icons.Search width={14} height={14} /> date</span><span data-active>DatePicker <Kbd>â†µ</Kbd></span><span>DateRangePicker</span></div></P> },
  // Dates
  { slug: 'date-picker', example: 'datum', category: 'dates', title: 'DatePicker and Calendar', summary: 'Type a date the way you say it, or pick it in a calendar.', exports: ['DatePicker', 'Calendar', 'parseTypedDate', 'formatNumericDate'], keywords: ['date', 'calendar', 'datepicker'], added: '0.5', popular: true, related: ['date-range-picker'],
    preview: () => <P><div className="doc-mini__calendar"><Calendar defaultValue="2024-03-15" /></div></P> },
  { slug: 'date-range-picker', example: 'periode', category: 'dates', title: 'DateRangePicker', summary: 'A period: two fields and one calendar for the start and the end.', exports: ['DateRangePicker', 'RangeCalendar'], keywords: ['period', 'stay', 'range', 'booking'], added: '0.5', related: ['date-picker'],
    preview: () => <P><TextField label="Stay" defaultValue="12/07/2024  â€“  16/07/2024" suffix={<icons.Calendar />} /></P> },
  // Overlays
  { slug: 'dialog', example: 'dialoog', category: 'overlays', title: 'Dialog', summary: 'A modal on the native dialog element.', exports: ['Dialog'], keywords: ['modal', 'window'], popular: true, related: ['alert-dialog', 'tooltip-sheet', 'popover'],
    preview: () => <P><Surface elevation="object" padding="sm" radius="lg" className="doc-mini__window"><Text variant="label" as="p">Put the record back?</Text><Stack direction="row" gap={2} justify="flex-end"><Button size="sm" variant="ghost">No</Button><Button size="sm" variant="ink">Put away</Button></Stack></Surface></P> },
  { slug: 'alert-dialog', example: 'bevestigen', category: 'overlays', title: 'AlertDialog', summary: 'A confirmation that interrupts, for actions with consequences.', exports: ['AlertDialog'], keywords: ['confirm', 'delete', 'destructive'], related: ['dialog'],
    preview: () => <P><Surface elevation="object" padding="sm" radius="lg" className="doc-mini__window"><Text variant="label" as="p">Remove Blue Train?</Text><Stack direction="row" gap={2} justify="flex-end"><Button size="sm" variant="secondary">Cancel</Button><Button size="sm" variant="danger">Remove</Button></Stack></Surface></P> },
  { slug: 'popover', example: 'popover', category: 'overlays', title: 'Popover', summary: 'A non-modal panel next to a button, for filters and short forms.', exports: ['Popover'], keywords: ['panel', 'filter', 'flyout'], added: '0.5', related: ['menu', 'tooltip-sheet', 'dialog'],
    preview: () => <P><Stack gap={2}><Button size="sm" variant="secondary" iconStart={<icons.Search />}>Filters</Button><Surface elevation="object" padding="sm" radius="md" className="doc-mini__window"><Checkbox label="Jazz" defaultChecked /></Surface></Stack></P> },
  { slug: 'menu', example: 'menu-keuzes', category: 'overlays', title: 'Menu', summary: 'An action menu with headings, choices, links and shortcuts.', exports: ['Menu'], keywords: ['dropdown', 'action menu', 'context menu'], related: ['popover', 'tooltip-sheet'],
    preview: () => <P><div className="doc-mini__list doc-mini__list--menu"><small>Sort by</small><span data-active><icons.Check width={14} height={14} /> Artist</span><span>Year <Kbd>Y</Kbd></span></div></P> },
  { slug: 'tooltip-sheet', example: 'overlays', category: 'overlays', title: 'Tooltip, Menu and Sheet', summary: 'A hint on hover or focus, and a panel that slides in from an edge.', exports: ['Tooltip', 'Sheet'], keywords: ['hint', 'drawer', 'side panel'], related: ['menu', 'popover'],
    preview: () => <P><Stack gap={2} align="center"><span className="doc-mini__tip">Put the record back</span><IconButton label="Put away" icon={<icons.Close />} /></Stack></P> },
  // Feedback
  { slug: 'notice-progress', example: 'feedback', category: 'feedback', title: 'Notice and Progress', summary: 'Status messages with their own icon, and progress with a value text.', exports: ['Notice', 'Progress', 'Spinner'], keywords: ['alert', 'banner', 'progress', 'loading'], related: ['toast'],
    preview: () => <P><Stack gap={3}><Notice tone="success" title="Saved" /><Progress label="Uploading" value={60} /></Stack></P> },
  { slug: 'toast', example: 'toast', category: 'feedback', title: 'Toast', summary: 'Short confirmations that pause while you point at them.', exports: ['ToastProvider', 'useToast'], keywords: ['snackbar', 'notification'], popular: true, related: ['toast-promise', 'notice-progress'],
    preview: () => <P><Surface elevation="object" padding="none" radius="md"><Notice tone="success" title="Record added" onDismiss={() => {}} /></Surface></P> },
  { slug: 'toast-promise', example: 'toast-voortgang', category: 'feedback', title: 'Toast with progress', summary: 'A notification that shows something is running, then shows the result.', exports: ['useToast'], keywords: ['promise', 'update', 'loading'], added: '0.5', related: ['toast'],
    preview: () => <P><Surface elevation="object" padding="none" radius="md"><Notice tone="info" title="Syncingâ€¦" icon={<icons.Spinner width={15} height={15} />} /></Surface></P> },
  // Navigation and structure
  { slug: 'breadcrumb-pagination', example: 'navigatie', category: 'navigation', title: 'Breadcrumb and Pagination', summary: 'A breadcrumb trail, and pagination with links or buttons.', exports: ['Breadcrumb', 'BreadcrumbItem', 'Pagination', 'paginationRange'], keywords: ['breadcrumbs', 'pages', 'paging'], related: ['steps', 'tabs'],
    preview: () => <P><Breadcrumb><BreadcrumbItem href="#">Collection</BreadcrumbItem><BreadcrumbItem>Jazz</BreadcrumbItem></Breadcrumb></P> },
  { slug: 'tabs', example: 'structuur', category: 'navigation', title: 'Tabs and Disclosure', summary: 'Views of the same content, and a native expander.', exports: ['Tabs', 'TabList', 'Tab', 'TabPanel', 'Disclosure'], keywords: ['tabs', 'expander', 'details', 'collapsible'], popular: true, related: ['accordion', 'steps'],
    preview: () => <P><Tabs defaultValue="a"><TabList label="View"><Tab value="a">Now</Tab><Tab value="b">Week</Tab><Tab value="c">Year</Tab></TabList></Tabs></P> },
  { slug: 'accordion', example: 'structuur-plus', category: 'navigation', title: 'Accordion and vertical Tabs', summary: 'Questions that fold each other away, and tabs in a column.', exports: ['Accordion', 'Tabs'], keywords: ['faq', 'collapsible', 'settings'], added: '0.5', related: ['tabs'],
    preview: () => <P><Disclosure summary="How long does shipping take?" /></P> },
  { slug: 'steps', example: 'stappen', category: 'navigation', title: 'Steps', summary: 'Progress through a few steps, such as checkout.', exports: ['Steps'], keywords: ['stepper', 'wizard', 'checkout'], added: '0.5', related: ['tabs', 'breadcrumb-pagination'],
    preview: () => <P><Steps items={[{ title: 'Basket' }, { title: 'Delivery' }, { title: 'Payment' }]} current={1} /></P> },
  // Data
  { slug: 'table', example: 'data', category: 'data', title: 'Table, Avatar and Skeleton', summary: 'A native table, avatars, and placeholders while content loads.', exports: ['Table', 'Avatar', 'Skeleton', 'Spinner'], keywords: ['table', 'loading', 'placeholder'], popular: true, related: ['sortable-table'], server: true,
    preview: () => <P><Stack gap={3}><Stack direction="row" gap={3} align="center"><Avatar name="Froukje Veenstra" size="sm" /><Text variant="small" as="span">Uitzinnig Â· 42Ã—</Text></Stack><Stack direction="row" gap={3} align="center"><Skeleton shape="circle" width={32} height={32} /><div style={{ flex: 1 }}><Skeleton /></div></Stack></Stack></P> },
  { slug: 'sortable-table', example: 'sorteren', category: 'data', title: 'Sortable table and EmptyState', summary: 'Columns that sort, row selection and an empty state with a way out.', exports: ['SortHeader', 'useTableSort', 'EmptyState'], keywords: ['sort', 'aria-sort', 'empty', 'selection'], added: '0.5', related: ['table'],
    preview: () => <P><div className="doc-mini__table"><span>Title <icons.ArrowUp width={12} height={12} /></span><span>Year</span><span>Blue Train</span><span>1957</span><span>Rumours</span><span>1977</span></div></P> },
  // Basics and layout
  { slug: 'surface-tag-link', example: 'materiaal', category: 'basics', title: 'Surface, Tag and Link', summary: 'Modules with a material, small labels and links.', exports: ['Surface', 'Tag', 'Link', 'Text', 'VisuallyHidden'], keywords: ['card', 'badge', 'label', 'typography'], server: true, related: ['stack-container', 'separator-kbd'],
    preview: () => <P><Stack direction="row" gap={2} wrap align="center"><Tag tone="sage">Kotlin</Tag><Tag tone="coral">Compose</Tag><Tag tone="outline">2024</Tag><Link href="#" variant="arrow">Work</Link></Stack></P> },
  { slug: 'stack-container', example: 'layout', category: 'basics', title: 'Stack and Container', summary: 'A flex stack on the spacing scale, and a container with a gutter.', exports: ['Stack', 'Container'], keywords: ['layout', 'flex', 'grid', 'spacing'], server: true, related: ['surface-tag-link'],
    preview: () => <P><div className="doc-mini__stack"><span /><span /><span /></div></P> },
  { slug: 'separator-kbd', example: 'details', category: 'basics', title: 'Kbd, Separator and EmptyState', summary: 'Keys, lines between groups, and an empty state.', exports: ['Kbd', 'Separator', 'EmptyState'], keywords: ['divider', 'key', 'keyboard', 'empty state'], added: '0.5', server: true, related: ['sortable-table'],
    preview: () => <P><Stack gap={3}><Text variant="small" as="p">Search with <Kbd>Ctrl</Kbd> <Kbd>K</Kbd></Text><Separator label="or" /></Stack></P> },
];

/** The release being documented: pages added in it get a "new" badge. */
export const currentRelease = '0.6';

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
  { slug: 'getting-started', title: 'Getting started', summary: 'Install, import and use Papier in your own app.', sections: [
    { id: 'installation', title: 'Installation', keywords: ['npm', 'install', 'css'] },
    { id: 'first-screen', title: 'Your first screen', keywords: ['papier', 'toastprovider'] },
    { id: 'nextjs', title: 'Next.js and server components', keywords: ['use client', 'rsc', 'app router'] },
    { id: 'router-links', title: 'Router links with asChild', keywords: ['react router', 'next link'] },
    { id: 'css', title: 'CSS, @layer and Tailwind', keywords: ['layer', 'tailwind', 'reset'] },
    { id: 'languages', title: 'Text and languages', keywords: ['labels', 'dutch', 'english', 'locale', 'i18n'] },
    { id: 'rtl', title: 'Right to left', keywords: ['rtl', 'arabic', 'hebrew'] },
    { id: 'quality', title: 'How it is tested', keywords: ['axe', 'tests', 'playwright'] },
  ] },
  { slug: 'theming', title: 'Theming', summary: 'Light, dark and your own brand colours, with a contrast check.', sections: [
    { id: 'light-dark', title: 'Light, dark and system', keywords: ['dark mode', 'theme'] },
    { id: 'custom-theme', title: 'A custom theme', keywords: ['themestyle', 'brand'] },
    { id: 'playground', title: 'Try a brand colour', keywords: ['checktheme', 'contrast'] },
    { id: 'motion', title: 'Reduced motion', keywords: ['reduced motion', 'animation'] },
  ] },
  { slug: 'foundations', title: 'Foundations', summary: 'Colour, type, space, shape and motion as tokens.', sections: [
    { id: 'color', title: 'Colour and contrast', keywords: ['tokens', 'palette', 'wcag', 'color'] },
    { id: 'typography', title: 'Typography', keywords: ['manrope', 'dm sans', 'font'] },
    { id: 'space', title: 'Space and shape', keywords: ['spacing', 'radius'] },
    { id: 'motion', title: 'Motion', keywords: ['motion', 'easing', 'duration'] },
  ] },
  { slug: 'stability', title: 'Stability and versions', summary: 'What a version number promises, which browsers are supported and how deprecations work.', sections: [
    { id: 'public-api', title: 'What the public API is', keywords: ['semver', 'breaking change', 'api'] },
    { id: 'versions', title: 'Versions and releases', keywords: ['semver', 'patch', 'minor', 'major', 'changelog'] },
    { id: 'deprecations', title: 'Deprecations', keywords: ['deprecated', 'migration'] },
    { id: 'browsers', title: 'Supported browsers', keywords: ['browser support', 'safari', 'firefox', 'chrome'] },
    { id: 'road-to-1', title: 'On the way to 1.0', keywords: ['1.0', 'roadmap'] },
  ] },
];
