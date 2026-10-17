import type { ReactNode } from 'react';
import {
  Avatar, Button, Checkbox, CopyButton, IconButton, Notice, PinInput, Progress, RadioGroup, Select, Skeleton, Stack, Steps,
  Surface, Switch, Tag, Text, TextField, Toggle, ToggleGroup, icons,
} from '@dionbm/papier';

export interface Variant { title: string; description?: ReactNode; code: string; demo: ReactNode }

// Variants, sizes and states per page, keyed by the Example id. Every demo is the real
// component; the code is what you would write to get it.

const variants: Record<string, Variant[]> = {
  knoppen: [
    {
      title: 'Varianten',
      description: 'Primary is de salie-actie, ink de donkere bediening voor de belangrijkste stap. Secondary en ghost voor alles daarnaast, danger voor wat niet terug kan.',
      code: `<Button>Opslaan</Button>
<Button variant="ink">Bekijk de case</Button>
<Button variant="secondary">Annuleren</Button>
<Button variant="ghost">Later</Button>
<Button variant="danger">Verwijderen</Button>`,
      demo: <Stack direction="row" gap={2} wrap align="center"><Button>Opslaan</Button><Button variant="ink">Bekijk de case</Button><Button variant="secondary">Annuleren</Button><Button variant="ghost">Later</Button><Button variant="danger">Verwijderen</Button></Stack>,
    },
    {
      title: 'Maten',
      description: '36, 44 en 55 px hoog. md is de standaard en haalt het raakvlak van 44 px; gebruik sm alleen naast andere bediening.',
      code: `<Button size="sm">Klein</Button>
<Button size="md">Middel</Button>
<Button size="lg">Groot</Button>`,
      demo: <Stack direction="row" gap={2} wrap align="center"><Button size="sm" variant="secondary">Klein</Button><Button size="md" variant="secondary">Middel</Button><Button size="lg" variant="secondary">Groot</Button></Stack>,
    },
    {
      title: 'Iconen, laden en uitgeschakeld',
      description: 'Een eindicoon schuift bij hover. Laden houdt de knop focusbaar en blokkeert de klik.',
      code: `<Button iconStart={<icons.Play />}>Afspelen</Button>
<Button variant="ink" iconEnd={<icons.ArrowRight />}>Verder</Button>
<Button loading>Opslaan…</Button>
<Button variant="secondary" disabled>Niet beschikbaar</Button>
<IconButton label="Volgende" variant="disc" icon={<icons.ArrowRight />} />
<IconButton label="Meer" variant="ghost" icon={<icons.More />} />`,
      demo: <Stack direction="row" gap={2} wrap align="center"><Button iconStart={<icons.Play />}>Afspelen</Button><Button variant="ink" iconEnd={<icons.ArrowRight />}>Verder</Button><Button loading>Opslaan…</Button><Button variant="secondary" disabled>Niet beschikbaar</Button><IconButton label="Volgende" variant="disc" icon={<icons.ArrowRight />} /><IconButton label="Meer" variant="ghost" icon={<icons.More />} /></Stack>,
    },
  ],
  formulieren: [
    {
      title: 'Toestanden',
      description: 'Hint, verplicht, fout en uitgeschakeld. De fout staat boven de hint en heeft een eigen teken, zodat kleur niet het enige signaal is.',
      code: `<TextField label="Naam" required hint="Zoals op je cv" />
<TextField label="E-mail" defaultValue="dion@" error="Vul een volledig e-mailadres in." />
<TextField label="Lidnummer" defaultValue="PP-2041" disabled />`,
      demo: <Stack gap={5} className="doc-narrow"><TextField label="Naam" required hint="Zoals op je cv" /><TextField label="E-mail" defaultValue="dion@" error="Vul een volledig e-mailadres in." /><TextField label="Lidnummer" defaultValue="PP-2041" disabled /></Stack>,
    },
  ],
  keuzes: [
    {
      title: 'Toestanden',
      description: 'Aangevinkt, half aangevinkt, met fout en uitgeschakeld. Switch voor instellingen die meteen gelden; Checkbox voor keuzes die je later bevestigt.',
      code: `<Checkbox label="Nieuwsbrief" defaultChecked />
<Checkbox label="Alle formaten" indeterminate />
<Checkbox label="Ik ga akkoord" error="Vink dit aan om door te gaan." />
<Checkbox label="Niet beschikbaar" disabled />
<Switch label="Geluid" defaultChecked />
<Switch label="Offline luisteren" disabled />`,
      demo: <Stack gap={4} className="doc-narrow"><Checkbox label="Nieuwsbrief" defaultChecked /><Checkbox label="Alle formaten" indeterminate /><Checkbox label="Ik ga akkoord" error="Vink dit aan om door te gaan." /><Checkbox label="Niet beschikbaar" disabled /><Switch label="Geluid" defaultChecked /><Switch label="Offline luisteren" disabled /></Stack>,
    },
  ],
  select: [
    {
      title: 'Horizontaal, met fout en uitgeschakeld',
      code: `<RadioGroup legend="Snelheid" orientation="horizontal" defaultValue="33" options={…} />
<Select label="Land" error="Kies een land" placeholder="Kies…" options={…} />
<Select label="Valuta" disabled options={[{ value: 'eur', label: 'Euro' }]} />`,
      demo: <Stack gap={5} className="doc-narrow"><RadioGroup legend="Snelheid" orientation="horizontal" defaultValue="33" options={[{ value: '33', label: '33 toeren' }, { value: '45', label: '45 toeren' }, { value: '78', label: '78 toeren' }]} /><Select label="Land" error="Kies een land" placeholder="Kies…" defaultValue="" options={[{ value: 'nl', label: 'Nederland' }, { value: 'be', label: 'België' }]} /><Select label="Valuta" disabled options={[{ value: 'eur', label: 'Euro' }]} /></Stack>,
    },
  ],
  feedback: [
    {
      title: 'Tonen',
      description: 'Elke toon heeft een eigen teken en een titel. Danger is role="alert", de rest role="status".',
      code: `<Notice tone="info" title="Nieuwe persing">Verwacht in maart.</Notice>
<Notice tone="success" title="Opgeslagen" />
<Notice tone="warning" title="Discogs reageert traag" />
<Notice tone="danger" title="Synchronisatie mislukt" onDismiss={close} />`,
      demo: <Stack gap={3}><Notice tone="info" title="Nieuwe persing">Verwacht in maart.</Notice><Notice tone="success" title="Opgeslagen" /><Notice tone="warning" title="Discogs reageert traag" /><Notice tone="danger" title="Synchronisatie mislukt" onDismiss={() => {}} /></Stack>,
    },
    {
      title: 'Voortgang',
      code: `<Progress label="Hoezen ophalen" value={3} max={5} valueText="3 van 5" />
<Progress label="Verbinden" tone="accent" />`,
      demo: <Stack gap={4} className="doc-narrow"><Progress label="Hoezen ophalen" value={3} max={5} valueText="3 van 5" /><Progress label="Verbinden" tone="accent" /></Stack>,
    },
  ],
  materiaal: [
    {
      title: 'Materialen en hoogte',
      description: 'Tekstkleur volgt het materiaal. Object is de tastbare schaduw voor dingen die je bedient; prose blijft flat.',
      code: `<Surface material="paper" elevation="raised">…</Surface>
<Surface material="sage" elevation="object">…</Surface>
<Surface material="coral">…</Surface>
<Surface material="ink" elevation="object">…</Surface>`,
      demo: <div className="doc-variant-grid">{(['paper', 'sunken', 'sage', 'sage-soft', 'coral', 'ink'] as const).map((m) => <Surface key={m} material={m} elevation={m === 'paper' ? 'raised' : m === 'ink' || m === 'sage' ? 'object' : 'flat'} padding="sm"><Text variant="label" as="p">{m}</Text></Surface>)}</div>,
    },
    {
      title: 'Tag-tonen',
      code: `<Tag>Neutraal</Tag> <Tag tone="sage">Kotlin</Tag> <Tag tone="coral">Compose</Tag>
<Tag tone="accent">Nieuw</Tag> <Tag tone="outline">2024</Tag>`,
      demo: <Stack direction="row" gap={2} wrap><Tag>Neutraal</Tag><Tag tone="sage">Kotlin</Tag><Tag tone="coral">Compose</Tag><Tag tone="accent">Nieuw</Tag><Tag tone="outline">2024</Tag></Stack>,
    },
  ],
  data: [
    {
      title: 'Avatar: maten, vormen en terugval',
      description: 'Zonder of met een kapotte afbeelding verschijnen de initialen, met de naam als toegankelijke naam.',
      code: `<Avatar name="Froukje Veenstra" size="sm" />
<Avatar name="Froukje Veenstra" />
<Avatar name="Blue Train" size="lg" shape="square" />`,
      demo: <Stack direction="row" gap={3} align="center"><Avatar name="Froukje Veenstra" size="sm" /><Avatar name="Froukje Veenstra" /><Avatar name="Blue Train" size="lg" shape="square" /></Stack>,
    },
    {
      title: 'Skeleton-vormen',
      code: `<Skeleton lines={3} />
<Skeleton shape="circle" width={48} height={48} />
<Skeleton shape="block" height={96} />`,
      demo: <Stack direction="row" gap={4} align="flex-start"><Skeleton shape="circle" width={48} height={48} /><div style={{ flex: 1, display: 'grid', gap: 12 }}><Skeleton lines={3} /><Skeleton shape="block" height={64} /></div></Stack>,
    },
  ],
  meerkeuze: [
    {
      title: 'Toggles: maten en iconen',
      code: `<Toggle size="sm" defaultPressed>Alleen vinyl</Toggle>
<Toggle>Uitgeleend</Toggle>
<Toggle aria-label="Favoriet" icon={<icons.Plus />} />
<ToggleGroup label="Snelheid" size="sm" options={…} />`,
      demo: <Stack gap={4}><Stack direction="row" gap={2} wrap align="center"><Toggle size="sm" defaultPressed>Alleen vinyl</Toggle><Toggle>Uitgeleend</Toggle><Toggle aria-label="Favoriet" icon={<icons.Plus />} /></Stack><ToggleGroup label="Snelheid" size="sm" defaultValue={['33']} options={[{ value: '33', label: '33' }, { value: '45', label: '45' }, { value: '78', label: '78', disabled: true }]} /></Stack>,
    },
  ],
  kopieren: [
    {
      title: 'Met label en als icoon',
      code: `<CopyButton value={code} />
<CopyButton value={code}>Kopieer code</CopyButton>
<CopyButton value={link} variant="ink" size="md">Kopieer link</CopyButton>`,
      demo: <Stack direction="row" gap={3} align="center" wrap><CopyButton value="npm install @dionbm/papier" /><CopyButton value="npm install @dionbm/papier">Kopieer code</CopyButton><CopyButton value="https://papier.dionbm.nl" variant="ink" size="md">Kopieer link</CopyButton></Stack>,
    },
  ],
  stappen: [
    {
      title: 'Verticaal en met een fout',
      description: 'Verticaal is er ruimte voor beschrijvingen, bijvoorbeeld in een zijkolom. Een stap met error krijgt een uitroepteken.',
      code: `<Steps orientation="vertical" current={2} items={[
  { title: 'Account', description: 'E-mail en wachtwoord' },
  { title: 'Profiel', description: 'Naam en avatar', error: true },
  { title: 'Collectie', description: 'Koppel Discogs' },
]} />`,
      demo: <Steps orientation="vertical" current={2} label="Aanmelden" items={[{ title: 'Account', description: 'E-mail en wachtwoord' }, { title: 'Profiel', description: 'Naam en avatar', error: true }, { title: 'Collectie', description: 'Koppel Discogs' }]} />,
    },
  ],
  pincode: [
    {
      title: 'Afgeschermd, letters en een fout',
      code: `<PinInput label="Pincode" length={4} mask />
<PinInput label="Kortingscode" type="alphanumeric" length={5} />
<PinInput label="Inlogcode" defaultValue="123456" error="Deze code is verlopen." />`,
      demo: <Stack gap={5}><PinInput label="Pincode" length={4} mask /><PinInput label="Kortingscode" type="alphanumeric" length={5} /><PinInput label="Inlogcode" defaultValue="123456" error="Deze code is verlopen." /></Stack>,
    },
  ],
};

export const variantsFor = (example: string): Variant[] => variants[example] ?? [];
