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
      title: 'Variants',
      description: 'Primary is the sage action, ink the dark control for the most important step. Secondary and ghost for everything alongside it, danger for what cannot be undone.',
      code: `<Button>Save</Button>
<Button variant="ink">View the case</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Later</Button>
<Button variant="danger">Delete</Button>`,
      demo: <Stack direction="row" gap={2} wrap align="center"><Button>Save</Button><Button variant="ink">View the case</Button><Button variant="secondary">Cancel</Button><Button variant="ghost">Later</Button><Button variant="danger">Delete</Button></Stack>,
    },
    {
      title: 'Sizes',
      description: '36, 44 and 55 px tall. md is the default and meets the 44 px target size; use sm only next to other controls.',
      code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
      demo: <Stack direction="row" gap={2} wrap align="center"><Button size="sm" variant="secondary">Small</Button><Button size="md" variant="secondary">Medium</Button><Button size="lg" variant="secondary">Large</Button></Stack>,
    },
    {
      title: 'Icons, loading and disabled',
      description: 'An end icon slides on hover. Loading keeps the button focusable and blocks the click.',
      code: `<Button iconStart={<icons.Play />}>Play</Button>
<Button variant="ink" iconEnd={<icons.ArrowRight />}>Continue</Button>
<Button loading>Saving…</Button>
<Button variant="secondary" disabled>Unavailable</Button>
<IconButton label="Next" variant="disc" icon={<icons.ArrowRight />} />
<IconButton label="More" variant="ghost" icon={<icons.More />} />`,
      demo: <Stack direction="row" gap={2} wrap align="center"><Button iconStart={<icons.Play />}>Play</Button><Button variant="ink" iconEnd={<icons.ArrowRight />}>Continue</Button><Button loading>Saving…</Button><Button variant="secondary" disabled>Unavailable</Button><IconButton label="Next" variant="disc" icon={<icons.ArrowRight />} /><IconButton label="More" variant="ghost" icon={<icons.More />} /></Stack>,
    },
  ],
  formulieren: [
    {
      title: 'States',
      description: 'Hint, required, error and disabled. The error sits above the hint and has its own icon, so colour is not the only signal.',
      code: `<TextField label="Name" required hint="As on your CV" />
<TextField label="Email" defaultValue="dion@" error="Enter a complete email address." />
<TextField label="Member number" defaultValue="PP-2041" disabled />`,
      demo: <Stack gap={5} className="doc-narrow"><TextField label="Name" required hint="As on your CV" /><TextField label="Email" defaultValue="dion@" error="Enter a complete email address." /><TextField label="Member number" defaultValue="PP-2041" disabled /></Stack>,
    },
  ],
  keuzes: [
    {
      title: 'States',
      description: 'Checked, indeterminate, with an error and disabled. Switch for settings that apply immediately; Checkbox for choices you confirm later.',
      code: `<Checkbox label="Newsletter" defaultChecked />
<Checkbox label="All formats" indeterminate />
<Checkbox label="I agree" error="Tick this to continue." />
<Checkbox label="Unavailable" disabled />
<Switch label="Sound" defaultChecked />
<Switch label="Offline listening" disabled />`,
      demo: <Stack gap={4} className="doc-narrow"><Checkbox label="Newsletter" defaultChecked /><Checkbox label="All formats" indeterminate /><Checkbox label="I agree" error="Tick this to continue." /><Checkbox label="Unavailable" disabled /><Switch label="Sound" defaultChecked /><Switch label="Offline listening" disabled /></Stack>,
    },
  ],
  select: [
    {
      title: 'Horizontal, with an error and disabled',
      code: `<RadioGroup legend="Speed" orientation="horizontal" defaultValue="33" options={…} />
<Select label="Country" error="Choose a country" placeholder="Choose…" options={…} />
<Select label="Currency" disabled options={[{ value: 'eur', label: 'Euro' }]} />`,
      demo: <Stack gap={5} className="doc-narrow"><RadioGroup legend="Speed" orientation="horizontal" defaultValue="33" options={[{ value: '33', label: '33 rpm' }, { value: '45', label: '45 rpm' }, { value: '78', label: '78 rpm' }]} /><Select label="Country" error="Choose a country" placeholder="Choose…" defaultValue="" options={[{ value: 'nl', label: 'Netherlands' }, { value: 'be', label: 'Belgium' }]} /><Select label="Currency" disabled options={[{ value: 'eur', label: 'Euro' }]} /></Stack>,
    },
  ],
  feedback: [
    {
      title: 'Tones',
      description: 'Each tone has its own icon and a title. Danger is role="alert", the rest role="status".',
      code: `<Notice tone="info" title="New pressing">Expected in March.</Notice>
<Notice tone="success" title="Saved" />
<Notice tone="warning" title="Discogs is responding slowly" />
<Notice tone="danger" title="Sync failed" onDismiss={close} />`,
      demo: <Stack gap={3}><Notice tone="info" title="New pressing">Expected in March.</Notice><Notice tone="success" title="Saved" /><Notice tone="warning" title="Discogs is responding slowly" /><Notice tone="danger" title="Sync failed" onDismiss={() => {}} /></Stack>,
    },
    {
      title: 'Progress',
      code: `<Progress label="Fetching sleeves" value={3} max={5} valueText="3 of 5" />
<Progress label="Connecting" tone="accent" />`,
      demo: <Stack gap={4} className="doc-narrow"><Progress label="Fetching sleeves" value={3} max={5} valueText="3 of 5" /><Progress label="Connecting" tone="accent" /></Stack>,
    },
  ],
  materiaal: [
    {
      title: 'Materials and elevation',
      description: 'Text colour follows the material. Object is the tactile shadow for things you operate; prose stays flat.',
      code: `<Surface material="paper" elevation="raised">…</Surface>
<Surface material="sage" elevation="object">…</Surface>
<Surface material="coral">…</Surface>
<Surface material="ink" elevation="object">…</Surface>`,
      demo: <div className="doc-variant-grid">{(['paper', 'sunken', 'sage', 'sage-soft', 'coral', 'ink'] as const).map((m) => <Surface key={m} material={m} elevation={m === 'paper' ? 'raised' : m === 'ink' || m === 'sage' ? 'object' : 'flat'} padding="sm"><Text variant="label" as="p">{m}</Text></Surface>)}</div>,
    },
    {
      title: 'Tag tones',
      code: `<Tag>Neutral</Tag> <Tag tone="sage">Kotlin</Tag> <Tag tone="coral">Compose</Tag>
<Tag tone="accent">New</Tag> <Tag tone="outline">2024</Tag>`,
      demo: <Stack direction="row" gap={2} wrap><Tag>Neutral</Tag><Tag tone="sage">Kotlin</Tag><Tag tone="coral">Compose</Tag><Tag tone="accent">New</Tag><Tag tone="outline">2024</Tag></Stack>,
    },
  ],
  data: [
    {
      title: 'Avatar: sizes, shapes and fallback',
      description: 'Without an image, or with a broken one, the initials appear, with the name as the accessible name.',
      code: `<Avatar name="Froukje Veenstra" size="sm" />
<Avatar name="Froukje Veenstra" />
<Avatar name="Blue Train" size="lg" shape="square" />`,
      demo: <Stack direction="row" gap={3} align="center"><Avatar name="Froukje Veenstra" size="sm" /><Avatar name="Froukje Veenstra" /><Avatar name="Blue Train" size="lg" shape="square" /></Stack>,
    },
    {
      title: 'Skeleton shapes',
      code: `<Skeleton lines={3} />
<Skeleton shape="circle" width={48} height={48} />
<Skeleton shape="block" height={96} />`,
      demo: <Stack direction="row" gap={4} align="flex-start"><Skeleton shape="circle" width={48} height={48} /><div style={{ flex: 1, display: 'grid', gap: 12 }}><Skeleton lines={3} /><Skeleton shape="block" height={64} /></div></Stack>,
    },
  ],
  meerkeuze: [
    {
      title: 'Toggles: sizes and icons',
      code: `<Toggle size="sm" defaultPressed>Vinyl only</Toggle>
<Toggle>On loan</Toggle>
<Toggle aria-label="Favourite" icon={<icons.Plus />} />
<ToggleGroup label="Speed" size="sm" options={…} />`,
      demo: <Stack gap={4}><Stack direction="row" gap={2} wrap align="center"><Toggle size="sm" defaultPressed>Vinyl only</Toggle><Toggle>On loan</Toggle><Toggle aria-label="Favourite" icon={<icons.Plus />} /></Stack><ToggleGroup label="Speed" size="sm" defaultValue={['33']} options={[{ value: '33', label: '33' }, { value: '45', label: '45' }, { value: '78', label: '78', disabled: true }]} /></Stack>,
    },
  ],
  kopieren: [
    {
      title: 'With a label and as an icon',
      code: `<CopyButton value={code} />
<CopyButton value={code}>Copy code</CopyButton>
<CopyButton value={link} variant="ink" size="md">Copy link</CopyButton>`,
      demo: <Stack direction="row" gap={3} align="center" wrap><CopyButton value="npm install @dionbm/papier" /><CopyButton value="npm install @dionbm/papier">Copy code</CopyButton><CopyButton value="https://papier.dionbm.nl" variant="ink" size="md">Copy link</CopyButton></Stack>,
    },
  ],
  stappen: [
    {
      title: 'Vertical and with an error',
      description: 'Vertical leaves room for descriptions, for example in a side column. A step with error gets an exclamation mark.',
      code: `<Steps orientation="vertical" current={2} items={[
  { title: 'Account', description: 'Email and password' },
  { title: 'Profile', description: 'Name and avatar', error: true },
  { title: 'Collection', description: 'Connect Discogs' },
]} />`,
      demo: <Steps orientation="vertical" current={2} label="Sign up" items={[{ title: 'Account', description: 'Email and password' }, { title: 'Profile', description: 'Name and avatar', error: true }, { title: 'Collection', description: 'Connect Discogs' }]} />,
    },
  ],
  pincode: [
    {
      title: 'Masked, letters and an error',
      code: `<PinInput label="PIN" length={4} mask />
<PinInput label="Discount code" type="alphanumeric" length={5} />
<PinInput label="Sign-in code" defaultValue="123456" error="This code has expired." />`,
      demo: <Stack gap={5}><PinInput label="PIN" length={4} mask /><PinInput label="Discount code" type="alphanumeric" length={5} /><PinInput label="Sign-in code" defaultValue="123456" error="This code has expired." /></Stack>,
    },
  ],
};

export const variantsFor = (example: string): Variant[] => variants[example] ?? [];
