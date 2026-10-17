import { render } from '@testing-library/react';
import { configureAxe } from 'vitest-axe';

// jsdom cannot compute colours; contrast is checked by scripts/contrast.mjs and in the browser run.
const axe = configureAxe({ rules: { 'color-contrast': { enabled: false } } });
import type { ReactElement } from 'react';
import {
  Papier, Text, Button, IconButton, Link, Surface, Tag, Notice, Progress, TextField, TextArea,
  Checkbox, Switch, Slider, SegmentedControl, Tabs, TabList, Tab, TabPanel, Disclosure, Dialog, icons,
  Select, RadioGroup, Tooltip, Menu, ToastProvider, Table, Skeleton, Sheet, Stack, Container, Avatar, Spinner, Field,
  AlertDialog, Combobox, Breadcrumb, BreadcrumbItem, Pagination,
  Command, CopyButton, Steps, PinInput,
  MultiCombobox, RangeSlider, Calendar, DatePicker, RangeCalendar, DateRangePicker,
  Popover, NumberField, PasswordField, FileField, CheckboxGroup, Accordion, ToggleGroup, Toggle, SortHeader, Separator, Kbd, EmptyState,
} from '../src';
import userEvent from '@testing-library/user-event';

const cases: Array<[string, ReactElement]> = [
  ['Text', <><Text variant="display">Kop</Text><Text tone="muted">Uitleg</Text></>],
  ['Button', <><Button>Opslaan</Button><Button variant="ink" loading>Bezig</Button><Button variant="secondary" disabled>Uit</Button></>],
  ['IconButton', <IconButton label="Volgende" icon={<icons.ArrowRight />} variant="disc" />],
  ['Link', <><Link href="#a">Projecten</Link><Link href="https://x.nl" external variant="arrow">Bron</Link></>],
  ['Surface', <Surface material="sage" elevation="object"><p>Module</p></Surface>],
  ['Tag', <Tag tone="coral">Kotlin</Tag>],
  ['Notice', <><Notice tone="success" title="Opgeslagen">Klaar.</Notice><Notice tone="danger" title="Mislukt" onDismiss={() => {}} /></>],
  ['Progress', <><Progress label="Uploaden" value={40} /><Progress label="Laden" /></>],
  ['TextField', <><TextField label="Naam" hint="Zoals op je cv" required /><TextField label="E-mail" error="Vul een geldig adres in" /><TextArea label="Bericht" /></>],
  ['Checkbox', <Checkbox label="Nieuwsbrief" description="Eens per maand" />],
  ['Switch', <Switch label="Donkere modus" description="Volgt je systeem" />],
  ['Slider', <Slider label="Volume" defaultValue={30} formatValue={(v) => `${v}%`} />],
  ['SegmentedControl', <SegmentedControl label="Periode" options={[{ value: 'w', label: 'Week' }, { value: 'm', label: 'Maand' }]} />],
  ['Tabs', <Tabs defaultValue="a"><TabList label="Weergave"><Tab value="a">Een</Tab><Tab value="b">Twee</Tab></TabList><TabPanel value="a">A</TabPanel><TabPanel value="b">B</TabPanel></Tabs>],
  ['Disclosure', <Disclosure summary="Technische verdieping"><p>Details</p></Disclosure>],
  ['Select', <Select label="Sorteren" options={[{ value: 'a', label: 'Artiest' }, { value: 'j', label: 'Jaar' }]} hint="Geldt voor de bak" />],
  ['RadioGroup', <RadioGroup legend="Snelheid" defaultValue="33" options={[{ value: '33', label: '33 toeren' }, { value: '45', label: '45 toeren', description: 'Voor singles' }]} />],
  ['RadioGroup card', <RadioGroup legend="Weergave" appearance="card" error="Kies een weergave" options={[{ value: 'bak', label: 'Platenbak' }, { value: 'lijst', label: 'Lijst' }]} />],
  ['Tooltip', <Tooltip content="Zet de plaat terug"><IconButton label="Opbergen" icon={<icons.Close />} /></Tooltip>],
  ['Menu', <Menu trigger={<icons.More />} triggerLabel="Acties" triggerVariant="icon" items={[{ label: 'Delen', onSelect: () => {} }]} />],
  ['ToastProvider', <ToastProvider><p>App</p></ToastProvider>],
  ['Table', <Table caption="Meest gedraaid"><thead><tr><th scope="col">Plaat</th><th scope="col" className="pp-num">Keer</th></tr></thead><tbody><tr><td>Uitzinnig</td><td className="pp-num">42</td></tr></tbody></Table>],
  ['Skeleton', <div aria-busy="true"><Skeleton lines={3} /><Skeleton shape="circle" /></div>],
  ['Stack/Container', <Container><Stack gap={3} direction="row"><p>Een</p><p>Twee</p></Stack></Container>],
  ['Avatar', <><Avatar name="Froukje Veenstra" /><Avatar name="Dion" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" /></>],
  ['Spinner', <Spinner />],
  ['Combobox', <><Combobox label="Plaat" options={[{ value: 'a', label: 'Uitzinnig', description: 'Froukje' }, { value: 'b', label: 'Blue Train', disabled: true }]} hint="Uit je collectie" /><Combobox label="Artiest" options={[]} error="Kies een artiest" required /></>],
  ['AlertDialog', <AlertDialog open onClose={() => {}} onConfirm={() => {}} title="Plaat verwijderen?" description="Dit kun je niet ongedaan maken." confirmLabel="Verwijderen" tone="danger" />],
  ['Breadcrumb', <Breadcrumb><BreadcrumbItem href="/">Home</BreadcrumbItem><BreadcrumbItem href="/werk">Werk</BreadcrumbItem><BreadcrumbItem>Papier</BreadcrumbItem></Breadcrumb>],
  ['Pagination', <><Pagination page={6} pageCount={12} onPageChange={() => {}} /><Pagination page={1} pageCount={3} getHref={(p) => `?p=${p}`} label="Pagina's met platen" /></>],
  ['Button asChild', <><Button asChild variant="ink"><a href="/werk">Bekijk het werk</a></Button><Button asChild loading><a href="/x">Bezig</a></Button></>],
  ['Link asChild', <Link asChild external variant="arrow"><a href="https://x.nl">Bron</a></Link>],
  ['IconButton asChild', <IconButton asChild label="Home" icon={<icons.ArrowLeft />}><a href="/" /></IconButton>],
  ['Field', <Field label="Artiest" hint="Zoek in je bak" error="Niets gevonden" required>{(c) => <input type="search" {...c} />}</Field>],
  ['TextField prefix/suffix', <><TextField label="Prijs in euro" prefix="€" /><TextField label="Gewicht in kg" suffix="kg" error="Te zwaar" /><TextField label="Zoeken" hideLabel prefix={<icons.Search />} /></>],
  ['Popover', <Popover trigger={<Button>Filters</Button>} title="Filters"><p>Inhoud</p></Popover>],
  ['NumberField', <><NumberField label="Aantal" defaultValue={2} min={1} max={9} hint="Per bestelling" /><NumberField label="Prijs" formatOptions={{ style: 'currency', currency: 'EUR' }} hideStepper error="Te hoog" /></>],
  ['PasswordField', <PasswordField label="Wachtwoord" autoComplete="new-password" hint="Minstens 12 tekens" required />],
  ['FileField', <><FileField label="Hoes" accept="image/*" hint="JPG of PNG" /><FileField label="Bijlagen" multiple defaultValue={[new File(['x'], 'scan.pdf', { type: 'application/pdf' })]} error="Te groot" /></>],
  ['Checkbox indeterminate', <Checkbox label="Alles selecteren" indeterminate error="Kies minstens een plaat" />],
  ['CheckboxGroup', <><CheckboxGroup legend="Formaten" hint="Een of meer" defaultValue={['lp']} options={[{ value: 'lp', label: 'LP' }, { value: 'ep', label: 'EP', description: 'Vier nummers' }]} /><CheckboxGroup legend="Staat" appearance="card" error="Kies een staat" options={[{ value: 'nieuw', label: 'Nieuw' }, { value: 'goed', label: 'Goed' }]} /></>],
  ['Accordion', <Accordion type="single"><Disclosure summary="Verzending" defaultOpen><p>Twee dagen</p></Disclosure><Disclosure summary="Retour"><p>Dertig dagen</p></Disclosure></Accordion>],
  ['Tabs vertical', <Tabs defaultValue="a" orientation="vertical" activation="manual"><TabList label="Instellingen"><Tab value="a">Profiel</Tab><Tab value="b">Meldingen</Tab></TabList><TabPanel value="a">A</TabPanel><TabPanel value="b">B</TabPanel></Tabs>],
  ['ToggleGroup', <><ToggleGroup label="Genres" defaultValue={['jazz']} options={[{ value: 'jazz', label: 'Jazz' }, { value: 'soul', label: 'Soul' }]} /><Toggle aria-label="Vet" icon={<icons.Plus />} /></>],
  ['SortHeader', <Table caption="Platen"><thead><tr><SortHeader sort="ascending" onSort={() => {}}>Titel</SortHeader><SortHeader onSort={() => {}} align="end">Jaar</SortHeader></tr></thead><tbody><tr><td>Uitzinnig</td><td className="pp-num">2022</td></tr></tbody></Table>],
  ['Separator, Kbd, EmptyState', <><Separator /><Separator label="of" /><Separator decorative={false} orientation="vertical" /><p>Zoek met <Kbd>Ctrl</Kbd> <Kbd>K</Kbd></p><EmptyState title="Nog geen platen" description="Voeg je eerste plaat toe." icon={<icons.Plus />} action={<Button>Toevoegen</Button>} /></>],
  ['MultiCombobox', <><MultiCombobox label="Genres" defaultValue={['jazz']} options={[{ value: 'jazz', label: 'Jazz' }, { value: 'soul', label: 'Soul' }]} hint="Een of meer" name="g" /><MultiCombobox label="Artiesten" options={[]} error="Kies een artiest" required /></>],
  ['RangeSlider', <RangeSlider label="Jaar" min={1950} max={2020} defaultValue={[1960, 1990]} marks={[{ value: 1950, label: '1950' }, 1985, { value: 2020, label: '2020' }]} />],
  ['Calendar', <Calendar defaultValue="2024-03-15" min="2024-03-05" isDateUnavailable={(d) => d === '2024-03-20'} />],
  ['Command', <Command label="Zoek in de docs" items={[{ id: 'a', label: 'Button', group: 'Acties', description: 'Knoppen', onSelect: () => {} }, { id: 'b', label: 'Installatie', shortcut: 'G I', onSelect: () => {} }]} />],
  ['CopyButton', <><CopyButton value="x" /><CopyButton value="y">Kopieer code</CopyButton></>],
  ['Steps', <><Steps items={[{ title: 'Mand' }, { title: 'Bezorging', description: 'Adres' }, { title: 'Betalen', error: true }]} current={1} onStepClick={() => {}} /><Steps orientation="vertical" items={[{ title: 'Een' }, { title: 'Twee' }]} current={0} label="Aanmelden" /></>],
  ['PinInput', <><PinInput label="Inlogcode" hint="Uit de sms" defaultValue="12" /><PinInput label="Pincode" length={4} mask error="Onjuiste pincode" /></>],
  ['RangeCalendar', <RangeCalendar defaultValue={{ start: '2024-03-11', end: '2024-03-20' }} />],
  ['DateRangePicker', <DateRangePicker label="Verblijf" defaultValue={{ start: '2024-03-11', end: '2024-03-20' }} hint="Aankomst en vertrek" />],
  ['DatePicker', <><DatePicker label="Releasedatum" defaultValue="2024-03-15" hint="Op de hoes" /><DatePicker label="Leverdatum" error="Kies een werkdag" required /></>],
];

describe('axe: geen toegankelijkheidsfouten', () => {
  for (const theme of ['light', 'dark'] as const) {
    it.each(cases)(`%s (${theme})`, async (_name, ui) => {
      const { container } = render(<Papier theme={theme}><main>{ui}</main></Papier>);
      expect(await axe(container)).toHaveNoViolations();
    });
  }

  it('Sheet (open)', async () => {
    render(<Papier><Sheet open onClose={() => {}} title="Navigatie" hideTitle><nav aria-label="Hoofd"><a href="#a">Werk</a></nav></Sheet></Papier>);
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('Menu (open, top layer)', async () => {
    const { container } = render(<Papier><main><Menu trigger="Acties" side="right" items={[{ label: 'Delen', onSelect: () => {} }, { label: 'Wissen', tone: 'danger', onSelect: () => {} }]} /></main></Papier>);
    await userEvent.click(container.querySelector('button')!);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Combobox (open, met actieve optie en zonder resultaten)', async () => {
    const { container } = render(<Papier><main><Combobox label="Plaat" options={[{ value: 'a', label: 'Uitzinnig' }, { value: 'b', label: 'Blue Train' }]} defaultValue="b" /></main></Papier>);
    const input = container.querySelector('input')!;
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.clear(input);
    await userEvent.type(input, 'xyz');
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Tooltip (open)', async () => {
    const { container } = render(<Papier><main><Tooltip content="Volgende plaat" placement="left"><IconButton label="Volgende" icon={<icons.ArrowRight />} /></Tooltip></main></Papier>);
    await userEvent.tab();
    expect(container.querySelector('[role="tooltip"]')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Popover (open)', async () => {
    const { container } = render(<Papier><main><Popover trigger={<Button>Filters</Button>} title="Filter de bak"><TextField label="Jaar" /></Popover></main></Papier>);
    await userEvent.click(container.querySelector('button')!);
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Menu met groepen en keuzes (open)', async () => {
    const { container } = render(<Papier><main><Menu trigger="Weergave" items={[
      { type: 'label', label: 'Sorteren' }, { type: 'radio', label: 'Artiest', checked: true }, { type: 'radio', label: 'Jaar' },
      { type: 'separator' }, { type: 'checkbox', label: 'Toon hoezen', checked: true }, { label: 'Discogs', href: 'https://discogs.com' },
      { label: 'Wissen', shortcut: 'Del', tone: 'danger', onSelect: () => {} },
    ]} /></main></Papier>);
    await userEvent.click(container.querySelector('button')!);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('MultiCombobox en DatePicker (open)', async () => {
    const { container } = render(<Papier><main>
      <MultiCombobox label="Genres" defaultValue={['jazz']} options={[{ value: 'jazz', label: 'Jazz' }, { value: 'soul', label: 'Soul', description: 'Motown' }]} />
      <DatePicker label="Datum" defaultValue="2024-03-15" />
    </main></Papier>);
    container.querySelector<HTMLInputElement>('[role="combobox"]')!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(container.querySelector<HTMLButtonElement>('.pp-date__toggle')!);
    expect(container.querySelector('[role="grid"]')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Dialog (open)', async () => {
    render(<Papier><Dialog open onClose={() => {}} title="Plaat verwijderen?" description="Dit kan niet ongedaan worden." footer={<Button>Verwijderen</Button>} /></Papier>);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
