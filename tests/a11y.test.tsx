import { render } from '@testing-library/react';
import { configureAxe } from 'vitest-axe';

// jsdom cannot compute colours; contrast is checked by scripts/contrast.mjs and in the browser run.
const axe = configureAxe({ rules: { 'color-contrast': { enabled: false } } });
import type { ReactElement } from 'react';
import {
  Papier, Text, Button, IconButton, Link, Surface, Tag, Notice, Progress, TextField, TextArea,
  Checkbox, Switch, Slider, SegmentedControl, Tabs, TabList, Tab, TabPanel, Disclosure, Dialog, icons,
  Select, RadioGroup, Tooltip, Menu, ToastProvider, Table, Skeleton, Sheet, Stack, Container, Avatar, Spinner,
} from '../src';

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

  it('Dialog (open)', async () => {
    render(<Papier><Dialog open onClose={() => {}} title="Plaat verwijderen?" description="Dit kan niet ongedaan worden." footer={<Button>Verwijderen</Button>} /></Papier>);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
