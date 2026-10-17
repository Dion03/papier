import { useState } from 'react';
import {
  Avatar, Container, Menu, RadioGroup, Select, Sheet, Skeleton, Spinner, Stack, Table, Tooltip, useToast,
  Button, Checkbox, Dialog, Disclosure, IconButton, Link, Notice, Progress, SegmentedControl, Slider, Surface,
  Switch, Tab, TabList, TabPanel, Tabs, Tag, Text, TextArea, TextField, icons, Field,
  AlertDialog, Breadcrumb, BreadcrumbItem, Combobox, Pagination, type ComboboxOption,
} from '@dionbm/papier';
import { Example } from './Example';
import { ExtendedExamples } from './Extended';
import { AdditionExamples } from './Additions';

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function ButtonDemo() {
  const [saving, setSaving] = useState(false);
  const save = () => { setSaving(true); window.setTimeout(() => setSaving(false), 1600); };
  return (
    <div className="doc-row">
      <Button onClick={save} loading={saving} iconEnd={<icons.ArrowRight />}>{saving ? 'Saving…' : 'Save'}</Button>
      <Button variant="ink">View the case</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Later</Button>
      <IconButton label="Next record" variant="disc" size="lg" icon={<icons.ArrowRight />} />
      <IconButton label="Close" icon={<icons.Close />} />
    </div>
  );
}

function FormDemo() {
  const [mail, setMail] = useState('dion@');
  const invalid = mail.length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail);
  return (
    <div className="doc-stack doc-narrow">
      <TextField label="Name" placeholder="What's your name?" autoComplete="name" required />
      <TextField label="Email address" type="email" value={mail} onChange={(e) => setMail(e.target.value)} hint="Only for a reply, never for a newsletter."
        error={invalid ? 'Enter a full email address, such as name@example.com.' : undefined} autoComplete="email" />
      <TextArea label="Message" placeholder="What would you like to talk about?" />
    </div>
  );
}

function FieldsDemo() {
  const [weight, setWeight] = useState('180');
  const heavy = Number(weight) > 220;
  return (
    <div className="doc-stack doc-narrow">
      <TextField label="Search your crate" hideLabel type="search" placeholder="Search by artist or title" prefix={<icons.Search />} />
      <TextField label="Price in euros" inputMode="decimal" prefix="€" defaultValue="24.95" />
      <TextField label="Weight in grams" inputMode="numeric" suffix="g" value={weight} onChange={(e) => setWeight(e.target.value)}
        hint="A standard record weighs 140 to 180 grams." error={heavy ? 'Over 220 grams won’t fit in the sleeve.' : undefined} />
      <Field label="Speed in rpm" hint="Your own input, with the same styling and wiring.">
        {(control) => <input {...control} className="pp-field__control" type="number" min={33} max={78} defaultValue={33} />}
      </Field>
    </div>
  );
}

function ChoicesDemo() {
  const [period, setPeriod] = useState('month');
  return (
    <div className="doc-stack doc-narrow">
      <SegmentedControl label="Period" value={period} onValueChange={setPeriod}
        options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }, { value: 'all', label: 'All' }]} />
      <Text tone="muted" variant="small" aria-live="polite">Showing: {period}.</Text>
      <Checkbox label="Also show skipped tracks" description="Tracks you skipped within 30 seconds." />
      <Switch label="Sound effects" description="Short effects only, no background music." defaultChecked />
    </div>
  );
}

function PlayerDemo() {
  const [pos, setPos] = useState(84);
  const [vol, setVol] = useState(60);
  return (
    <Surface material="ink" elevation="object" padding="lg" className="doc-player">
      <div className="doc-player__meta">
        <span className="doc-player__disc" aria-hidden="true" />
        <div>
          <Text variant="subtitle" as="p">Uitzinnig</Text>
          <Text variant="small" as="p" className="doc-player__artist">Froukje · side A</Text>
        </div>
      </div>
      <Slider label="Position" min={0} max={213} value={pos} onValueChange={setPos} formatValue={time} />
      <Slider label="Volume" value={vol} onValueChange={setVol} formatValue={(v) => `${v}%`} />
    </Surface>
  );
}

function FeedbackDemo() {
  const [shown, setShown] = useState(true);
  const [step, setStep] = useState(2);
  return (
    <div className="doc-stack doc-narrow">
      {shown && <Notice tone="success" title="Collection updated" onDismiss={() => setShown(false)}>Three new records added from Discogs.</Notice>}
      {!shown && <Button size="sm" variant="secondary" onClick={() => setShown(true)}>Restore notice</Button>}
      <Notice tone="warning" title="Discogs is responding slowly">The catalogue shows the last saved version.</Notice>
      <Notice tone="danger" title="Sync failed" action={<Button size="sm" variant="secondary">Try again</Button>}>There is no connection to the server.</Notice>
      <Progress label="Fetching sleeves" value={step} max={5} valueText={`${step} of 5`} />
      <div className="doc-row"><Button size="sm" variant="secondary" onClick={() => setStep((s) => (s % 5) + 1)}>Next step</Button></div>
      <Progress label="Connecting to Discogs" tone="accent" />
    </div>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  return (
    <div className="doc-stack">
      <div className="doc-row"><Button variant="ink" onClick={() => setOpen(true)}>Put record away</Button></div>
      <Text variant="small" tone="muted" role="status">{result}</Text>
      <Dialog open={open} onClose={() => { setOpen(false); setResult('Cancelled: the record is still on the turntable.'); }}
        title="Put the record back in its sleeve?" description="The music stops and the record goes back in the crate."
        footer={<>
          <Button variant="secondary" onClick={() => { setOpen(false); setResult('Cancelled: the record is still on the turntable.'); }}>Leave it out</Button>
          <Button onClick={() => { setOpen(false); setResult('The record is back in its sleeve.'); }}>Put away</Button>
        </>}
      />
    </div>
  );
}

function StructureDemo() {
  return (
    <div className="doc-stack">
      <Tabs defaultValue="nu">
        <TabList label="Listening view">
          <Tab value="nu">Now</Tab><Tab value="vandaag">Today</Tab><Tab value="week">Week</Tab><Tab value="top">Top</Tab>
        </TabList>
        <TabPanel value="nu"><Text>On the turntable: <strong>Uitzinnig</strong> by Froukje.</Text></TabPanel>
        <TabPanel value="vandaag"><Text>2 hours and 14 minutes of listening today.</Text></TabPanel>
        <TabPanel value="week"><Text>Your busiest day this week was Thursday.</Text></TabPanel>
        <TabPanel value="top"><Text>Your most played record of the month is at the top.</Text></TabPanel>
      </Tabs>
      <div>
        <Disclosure summary="Why no custom dropdowns?"><p>Native elements give you keyboard support, find-in-page and assistive technology support for free. Papier styles them and only adds motion.</p></Disclosure>
        <Disclosure summary="How does the fold animation work?"><p>The open state changes immediately, so assistive technology never has to wait. Only the height animates: 420 ms to open, 290 ms to close.</p></Disclosure>
      </div>
    </div>
  );
}

function SurfaceDemo() {
  return (
    <div className="doc-surfaces">
      <Surface material="paper" elevation="object"><Text variant="label" as="p">paper</Text><Text variant="subtitle" as="p">Module</Text></Surface>
      <Surface material="sage" elevation="object"><Text variant="label" as="p">sage</Text><Text variant="subtitle" as="p">Work</Text></Surface>
      <Surface material="coral" elevation="object"><Text variant="label" as="p">coral</Text><Text variant="subtitle" as="p">Controls</Text></Surface>
      <Surface material="ink" elevation="object"><Text variant="label" as="p">ink</Text><Text variant="subtitle" as="p">Emphasis</Text></Surface>
      <div className="doc-row doc-tags">
        <Tag>Neutral</Tag><Tag tone="sage">Kotlin</Tag><Tag tone="coral">Live</Tag><Tag tone="accent">New</Tag><Tag tone="outline">Prototype</Tag>
      </div>
      <div className="doc-row">
        <Link href="#componenten">Internal link</Link>
        <Link href="#componenten" variant="arrow">Explore the work</Link>
        <Link href="https://www.discogs.com" external variant="arrow">Discogs</Link>
      </div>
    </div>
  );
}


function SelectRadioDemo() {
  return (
    <div className="doc-stack doc-narrow">
      <Select label="Sort the crate by" defaultValue="artist" options={[{ value: 'artist', label: 'Artist' }, { value: 'year', label: 'Year' }, { value: 'plays', label: 'Most played' }]} hint="Native: your phone opens its own picker." />
      <RadioGroup legend="Speed" orientation="horizontal" defaultValue="33" options={[{ value: '33', label: '33⅓' }, { value: '45', label: '45' }, { value: '78', label: '78' }]} />
      <RadioGroup legend="View" appearance="card" defaultValue="bak" options={[
        { value: 'bak', label: 'Record crate', description: 'Flip through sleeves like in a shop.' },
        { value: 'lijst', label: 'List', description: 'Faster searching by title and year.' },
      ]} />
    </div>
  );
}

function OverlayDemo() {
  const [sheet, setSheet] = useState(false);
  const [last, setLast] = useState('');
  return (
    <div className="doc-stack">
      <div className="doc-row">
        <Tooltip content="Put the record back in its sleeve"><IconButton label="Put away" icon={<icons.Close />} /></Tooltip>
        <Tooltip content="Copy the link to this record"><IconButton label="Share" icon={<icons.Copy />} /></Tooltip>
        <Menu trigger={<>Actions <icons.ChevronDown /></>} items={[
          { label: 'Play', icon: <icons.Play />, onSelect: () => setLast('Play selected.') },
          { label: 'Open in Discogs', icon: <icons.External />, onSelect: () => setLast('Discogs selected.') },
          { label: 'Copy', icon: <icons.Copy />, onSelect: () => {}, disabled: true },
          { label: 'Remove from collection', tone: 'danger', onSelect: () => setLast('Remove selected.') },
        ]} />
        <Button variant="secondary" iconStart={<icons.Menu />} onClick={() => setSheet(true)}>Navigation</Button>
      </div>
      <Text variant="small" tone="muted" role="status">{last}</Text>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Navigation" hideTitle>
        <nav aria-label="Example navigation" className="doc-sheet-nav">
          {['Work', 'About me', 'Listening room', 'Contact'].map((l) => <a key={l} href="#overlays" onClick={() => setSheet(false)}>{l}</a>)}
        </nav>
      </Sheet>
    </div>
  );
}

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="doc-row">
      <Button onClick={() => toast({ title: 'Record added', description: 'Uitzinnig is now in your collection.' })}>Add</Button>
      <Button variant="secondary" onClick={() => toast({ tone: 'danger', title: 'Discogs unreachable', description: 'Stays until you close it.' })}>Show error</Button>
    </div>
  );
}

function DataDemo() {
  const [loading, setLoading] = useState(true);
  const rows: Array<[string, string, number]> = [['Uitzinnig', 'Froukje', 42], ['Zachte Landing', 'Lieve Kamer', 17], ['Kleine Uren', 'Het Noordlicht', 9]];
  return (
    <div className="doc-stack">
      <Table caption="Most played this month (sample data)" showCaption>
        <thead><tr><th scope="col">Record</th><th scope="col">Artist</th><th scope="col" className="pp-num">Plays</th><th scope="col"><span className="pp-visually-hidden">Actions</span></th></tr></thead>
        <tbody>{rows.map(([t, a, n]) => <tr key={t}><th scope="row"><Stack direction="row" gap={3} align="center"><Avatar name={a} size="sm" shape="square" decorative />{t}</Stack></th><td>{a}</td><td className="pp-num">{n}</td>
          <td className="doc-row-actions"><Menu trigger={<icons.More />} triggerLabel={`Actions for ${t}`} triggerVariant="icon" align="end" items={[
            { label: 'Play', icon: <icons.Play />, onSelect: () => {} },
            { label: 'Open in Discogs', icon: <icons.External />, onSelect: () => {} },
          ]} /></td></tr>)}</tbody>
      </Table>
      <div className="doc-row"><Button size="sm" variant="secondary" onClick={() => setLoading((l) => !l)}>{loading ? 'Load content' : 'Show skeleton'}</Button>{loading && <Spinner label="Loading sleeves" />}</div>
      <div aria-busy={loading} aria-live="polite" className="doc-skeleton-card">
        {loading
          ? <Stack direction="row" gap={4} align="center"><Skeleton shape="circle" /><div style={{ flex: 1 }}><Skeleton lines={2} /></div></Stack>
          : <Stack direction="row" gap={4} align="center"><Avatar name="Froukje Veenstra" /><div><Text as="p">Froukje</Text><Text variant="small" tone="muted" as="p">Played 42 times</Text></div></Stack>}
      </div>
    </div>
  );
}

function LayoutDemo() {
  return (
    <Container size="sm" className="doc-layout-demo">
      <Stack gap={3}>
        {['Stack gap 3', 'Container sm', 'Native flow'].map((l) => <div key={l} className="doc-layout-box">{l}</div>)}
        <Stack direction="row" gap={2} wrap>{['row', 'gap 2', 'wrap'].map((l) => <div key={l} className="doc-layout-box doc-layout-box--sage">{l}</div>)}</Stack>
      </Stack>
    </Container>
  );
}

const records: ComboboxOption[] = [
  { value: 'uitzinnig', label: 'Uitzinnig', description: 'Froukje · 2023' },
  { value: 'cafe', label: 'Café Brazil', description: 'Various artists · 1998' },
  { value: 'kind', label: 'Kind of Blue', description: 'Miles Davis · on loan', disabled: true },
  { value: 'blue', label: 'Blue Train', description: 'John Coltrane · 1957' },
  { value: 'rumours', label: 'Rumours', description: 'Fleetwood Mac · 1977' },
  { value: 'ok', label: 'OK Computer', description: 'Radiohead · 1997' },
  { value: 'vespertine', label: 'Vespertine', description: 'Björk · 2001' },
];

function ComboboxDemo() {
  const [record, setRecord] = useState<string | null>('blue');
  return (
    <div className="doc-stack doc-narrow">
      <Combobox label="Record on the turntable" options={records} value={record} onValueChange={setRecord} placeholder="Search by title or artist"
        hint="Try typing bjork or cafe: accents and capitals are ignored." />
      <Text variant="small" tone="muted" role="status">{record ? `Selected: ${records.find((r) => r.value === record)?.label}.` : 'Nothing selected yet.'}</Text>
    </div>
  );
}

function AlertDialogDemo() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  return (
    <div className="doc-stack">
      <div className="doc-row"><Button variant="danger" iconStart={<icons.Close />} onClick={() => setOpen(true)}>Remove from collection</Button></div>
      <Text variant="small" tone="muted" role="status">{result}</Text>
      <AlertDialog open={open} onClose={() => setOpen(false)} tone="danger"
        title="Remove Blue Train from your collection?" description="The record and your listening history will be deleted. This cannot be undone."
        confirmLabel="Remove from collection"
        onConfirm={() => new Promise<void>((done) => window.setTimeout(() => { setResult('Blue Train has been removed from your collection.'); done(); }, 900))} />
    </div>
  );
}

function NavigationDemo() {
  const [page, setPage] = useState(4);
  return (
    <div className="doc-stack">
      <Breadcrumb>
        <BreadcrumbItem href="#navigatie">Home</BreadcrumbItem>
        <BreadcrumbItem href="#navigatie">Collection</BreadcrumbItem>
        <BreadcrumbItem href="#navigatie">Jazz</BreadcrumbItem>
        <BreadcrumbItem>Blue Train</BreadcrumbItem>
      </Breadcrumb>
      <Pagination page={page} pageCount={12} onPageChange={setPage} label="Collection pages" />
    </div>
  );
}

/** Every component page, declared once; each renders only on its own route (see ActiveExample). */
export function Components() {
  return (
    <>

      <Example id="knoppen" api={['Button', 'IconButton']} name="Button and IconButton" intro="The sage-green action from the case studies, the ink button and calm secondary variants. While loading, the button stays focusable."
        code={`<Button loading={saving} iconEnd={<icons.ArrowRight />}>Save</Button>
<Button variant="ink">View the case</Button>
<IconButton label="Next record" variant="disc" icon={<icons.ArrowRight />} />

// As a link from Next.js or React Router
<Button asChild variant="ink">
  <NextLink href="/work">View the work</NextLink>
</Button>`}
        a11y={['Loading uses aria-busy and aria-disabled, so focus never jumps away.', 'With asChild a link stays a link: Enter follows it, and the button shape is purely visual.', 'IconButton requires a label; it becomes the accessible name and the tooltip.', 'Every target is at least 44 × 44 px.']}
        props={[
          { name: 'variant', type: "'primary' | 'ink' | 'secondary' | 'ghost' | 'danger'", note: 'Visual role. Defaults to primary.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", note: 'Height of 36, 44 or 55 px.' },
          { name: 'loading', type: 'boolean', note: 'Shows a spinner and blocks activation.' },
          { name: 'iconStart / iconEnd', type: 'ReactNode', note: 'The end icon shifts 3 px on hover.' },
          { name: 'asChild', type: 'boolean', note: 'Renders the only child (e.g. a router link) with the style and behaviour of the button. Also on IconButton and Link.' },
        ]}>
        <ButtonDemo />
      </Example>

      <Example id="formulieren" api={['TextField', 'TextArea']} name="TextField and TextArea" intro="The underlined input field from the portfolio widget. Label, hint and error belong to the field and are read out together."
        code={`<TextField
  label="Email address"
  hint="Only for a reply."
  error={invalid ? 'Enter a full email address.' : undefined}
/>`}
        a11y={['The label is a real <label> and stays visible; hideLabel only hides it visually.', 'The error and hint are in aria-describedby, error first.', 'aria-invalid is only set when there is an error; colour is never the only signal.']}
        props={[
          { name: 'label', type: 'ReactNode', note: 'Required.' },
          { name: 'hint', type: 'ReactNode', note: 'Explanation below the field.' },
          { name: 'error', type: 'ReactNode', note: 'Error message; sets aria-invalid.' },
          { name: 'hideLabel', type: 'boolean', note: 'Only for fields with clear context.' },
        ]}>
        <FormDemo />
      </Example>

      <Example id="velden" api={['Field', 'FieldLabel']} name="Field, prefix and suffix" intro="An icon or unit inside the field, and the building blocks behind TextField and Select for your own or a third-party input."
        code={`<TextField label="Price in euros" prefix="€" />
<TextField label="Weight in grams" suffix="g" />

<Field label="Speed in rpm" hint="Your own input">
  {(control) => <MyInput {...control} />}
</Field>

// Or fully standalone:
const f = useField({ hint, error });
<FieldLabel {...f.labelProps}>Artist</FieldLabel>
<MyCombobox {...f.controlProps} aria-labelledby={f.ids.label} />
<FieldError {...f.errorProps}>{error}</FieldError>
<FieldHint {...f.hintProps}>{hint}</FieldHint>`}
        a11y={['Prefix and suffix are decorative (aria-hidden); put the unit in the label as well, as in "Price in euros".', 'Field passes id, aria-describedby (error first) and aria-invalid to any control.', 'Clicking the icon or unit moves focus into the field.']}
        props={[
          { name: 'prefix / suffix', type: 'ReactNode', note: 'On TextField: an icon or unit before or after the value.' },
          { name: 'Field children', type: 'ReactNode | (control) => ReactNode', note: 'A render function, or children that use useFieldControl().' },
          { name: 'useField', type: '({ id, hint, error, describedBy }) => FieldState', note: 'ids, controlProps, labelProps, hintProps and errorProps.' },
          { name: 'FieldLabel / FieldHint / FieldError', type: 'component', note: 'The individual parts with Papier styling.' },
        ]}>
        <FieldsDemo />
      </Example>

      <Example id="keuzes" api={['SegmentedControl', 'Checkbox', 'Switch']} name="SegmentedControl, Checkbox and Switch" intro="A choice between a few periods, with the sliding marker from the Auralis films. Switch is for settings that apply immediately."
        code={`<SegmentedControl
  label="Period"
  value={period}
  onValueChange={setPeriod}
  options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
/>
<Switch label="Sound effects" defaultChecked />`}
        a11y={['SegmentedControl is a radiogroup with a roving tabindex: Tab moves in, arrow keys choose, Home and End jump.', 'Disabled options are skipped.', 'Switch uses role="switch" with aria-checked; Checkbox is a real native checkbox.']}>
        <ChoicesDemo />
      </Example>

      <Example id="slider" api={['Slider']} name="Slider" intro="A native range with a filled track and a readable value. Built for the listening room: position in minutes, volume as a percentage."
        code={`<Slider
  label="Position"
  max={213}
  value={pos}
  onValueChange={setPos}
  formatValue={(s) => \`\${Math.floor(s / 60)}:\${String(s % 60).padStart(2, '0')}\`}
/>`}
        a11y={['aria-valuetext uses the same format as the visible value, so "1:24" instead of "84".', 'The thumb gets the focus ring; the target is 44 px tall.']}>
        <PlayerDemo />
      </Example>

      <Example id="feedback" api={['Notice', 'Progress']} name="Notice and Progress" intro="Status messages with their own icon and wording, and progress with a real value text."
        code={`<Notice tone="danger" title="Sync failed"
  action={<Button size="sm" variant="secondary">Try again</Button>}>
  There is no connection to the server.
</Notice>
<Progress label="Fetching sleeves" value={2} max={5} valueText="2 of 5" />`}
        a11y={['Info, success and warning use role="status"; only blocking errors are role="alert".', 'Each tone has its own icon and title, so colour is not the only signal.', 'Progress without a value is indeterminate and omits aria-valuenow.']}>
        <FeedbackDemo />
      </Example>

      <Example id="dialoog" api={['Dialog']} name="Dialog" intro="A modal window on the native dialog element. Escape, the close button and a click outside the window close it."
        code={`<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Put the record back in its sleeve?"
  footer={<Button onClick={store}>Put away</Button>}
/>`}
        a11y={['showModal() provides a real focus trap and makes the background inert.', 'The title is the accessible name; the description is in aria-describedby.', 'After closing, focus returns to the button that opened the window, also in Safari, where a click does not focus a button. Use returnFocusTo to choose a different target.']}>
        <DialogDemo />
      </Example>

      <Example id="structuur" api={['Tabs', 'TabList', 'Tab', 'TabPanel', 'Disclosure']} name="Tabs and Disclosure" intro="Tabs for different views of the same content. Disclosure is a native expander that unfolds in 420 ms and folds in 290 ms."
        code={`<Tabs defaultValue="nu">
  <TabList label="Listening view">
    <Tab value="nu">Now</Tab>
    <Tab value="week">Week</Tab>
  </TabList>
  <TabPanel value="nu">…</TabPanel>
  <TabPanel value="week">…</TabPanel>
</Tabs>
<Disclosure summary="Technical deep dive">…</Disclosure>`}
        a11y={['Tabs follow the WAI-ARIA pattern: arrow keys switch, Tab moves to the panel.', 'Disclosure stays a <details>: find-in-page simply opens it.', 'With reduced motion, both switch instantly.']}>
        <StructureDemo />
      </Example>

      <Example id="materiaal" api={['Surface', 'Tag', 'Link']} name="Surface, Tag and Link" intro="Modules with their own material and object shadow, small labels, and links with a rising underline."
        code={`<Surface material="sage" elevation="object">…</Surface>
<Tag tone="sage">Kotlin</Tag>
<Link href="/work" variant="arrow">Explore the work</Link>
<Link href="https://discogs.com" external>Discogs</Link>
<Link asChild variant="arrow"><RouterLink to="/work">Work</RouterLink></Link>`}
        a11y={['The text colour follows the material and reaches at least 4.5:1 on every material.', 'External links get rel="noopener noreferrer" and a hint, read out as "opens in a new tab".', 'Prose stays flat: the object shadow is only for interactive objects.']}>
        <SurfaceDemo />
      </Example>

      <Example id="select" api={['Select', 'RadioGroup']} name="Select and RadioGroup" intro="A styled native select and a fieldset with radio buttons, as a list or as cards."
        code={`<Select label="Sort the crate by" options={[{ value: 'artist', label: 'Artist' }]} />
<RadioGroup legend="View" appearance="card" options={[
  { value: 'bak', label: 'Record crate', description: 'Flip through sleeves.' },
]} />`}
        a11y={['Select stays a native element: phones show their own picker, and typing jumps to an option.', 'RadioGroup is a fieldset with a legend; arrow keys and forms work natively.', 'The error and hint are attached to the group through aria-describedby.']}>
        <SelectRadioDemo />
      </Example>

      <Example id="overlays" api={['Tooltip', 'Menu', 'Sheet']} name="Tooltip, Menu and Sheet" intro="A hint on hover or focus, an action menu and a panel from the edge, like the portfolio's mobile navigation sheet."
        code={`<Tooltip content="Put the record back" placement="right">
  <IconButton label="Put away" icon={<icons.Close />} />
</Tooltip>
<Menu trigger="Actions" side="bottom" align="end" items={[{ label: 'Play', onSelect: play }]} />
<Sheet open={open} onClose={close} title="Navigation" hideTitle>…</Sheet>`}
        a11y={['Tooltip adds a description, never the name; it stays open while you hover over it and Escape closes it (WCAG 1.4.13).', 'Menu follows the menu button pattern: arrow down opens it, Escape and Tab close it, and focus returns.', 'Sheet is a native modal dialog with a hidden title that is still read out.', 'Menu and Tooltip open in the top layer (Popover API), so overflow:hidden does not clip them; at the edge of the screen they flip.']}
        props={[
          { name: 'Menu side', type: "'top' | 'bottom' | 'left' | 'right'", note: 'Preferred side; flips when there is no room. Defaults to bottom.' },
          { name: 'Menu align', type: "'start' | 'center' | 'end'", note: 'Alignment along the button.' },
          { name: 'Tooltip placement', type: "'top' | 'bottom' | 'left' | 'right'", note: 'Preferred side; flips at the edge. Defaults to top.' },
          { name: 'ref', type: 'Ref', note: 'Menu: the trigger button. Dialog and Sheet: the dialog element.' },
          { name: 'Sheet returnFocusTo', type: 'RefObject<HTMLElement>', note: 'Where focus goes after closing; defaults to the opener. Also on Dialog and AlertDialog.' },
        ]}>
        <OverlayDemo />
      </Example>

      <Example id="zoeken" api={['Combobox']} name="Combobox" intro="An input with a list that filters as you type. For long lists or server-side search; for a few fixed choices, Select is still the better option."
        code={`<Combobox
  label="Record"
  options={records}
  value={record}
  onValueChange={setRecord}
/>

// Searching on a server
<Combobox label="Artist" options={results} filter={false}
  inputValue={query} onInputChange={setQuery} loading={pending} />`}
        a11y={['Follows the WAI-ARIA combobox pattern: focus stays in the field and aria-activedescendant points to the active option.', 'Arrow keys move and skip disabled options, Enter selects, Escape closes and then clears.', 'The number of results, or "No results", is announced politely.', 'On leaving the field there is always a real selection: an exact name counts, otherwise the previous one returns.']}
        props={[
          { name: 'options', type: 'ComboboxOption[]', note: 'value, label and optionally description and disabled.' },
          { name: 'value / onChange', type: 'string | null', note: 'The selected value; onChange also receives the option.' },
          { name: 'filter', type: '(option, query) => boolean | false', note: 'Default: the label or description contains the text, ignoring accents and capitals. false for results from a server.' },
          { name: 'inputValue / onInputChange', type: 'string', note: 'The typed text, for searching on a server.' },
          { name: 'name', type: 'string', note: 'Submits the value with a form.' },
        ]}>
        <ComboboxDemo />
      </Example>

      <Example id="bevestigen" api={['AlertDialog']} name="AlertDialog" intro="A confirmation that interrupts your work, for actions with consequences. Closes only through the buttons or Escape, never with a click outside."
        code={`<AlertDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={() => removeRecord(id)}  // a promise makes the button load
  title="Remove Blue Train from your collection?"
  confirmLabel="Remove from collection"
  tone="danger"
/>`}
        a11y={['role="alertdialog" on the native dialog element, with the title as its name and the description in aria-describedby.', 'Focus starts on Cancel, so Enter never deletes anything by accident.', 'If onConfirm returns a promise, the button loads and the window stays open if it fails.']}>
        <AlertDialogDemo />
      </Example>

      <Example id="navigatie" api={['Breadcrumb', 'BreadcrumbItem', 'Pagination']} name="Breadcrumb and Pagination" intro="Where you are and where you can go: a breadcrumb trail to the pages above and pagination for long lists. On narrow screens, Pagination keeps only previous, next and the position."
        code={`<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem asChild><NextLink href="/collection">Collection</NextLink></BreadcrumbItem>
  <BreadcrumbItem>Blue Train</BreadcrumbItem>
</Breadcrumb>

<Pagination page={page} pageCount={12} onPageChange={setPage} />
<Pagination page={page} pageCount={12} getHref={(p) => \`?p=\${p}\`} linkAs={NextLink} />`}
        a11y={['Both are a named nav landmark with a real list.', 'The current page has aria-current="page", in the breadcrumb and in the pagination.', 'Page numbers are named in full, as "Page 3"; omitted pages are hidden from screen readers.']}
        props={[
          { name: 'BreadcrumbItem', type: 'href | asChild', note: 'Without href or asChild, the item is the current page.' },
          { name: 'Pagination getHref', type: '(page) => string', note: 'Real links that can be opened in a new tab. Without getHref they are buttons.' },
          { name: 'Pagination linkAs', type: 'ElementType', note: 'Your own link component, such as the Next.js Link.' },
          { name: 'Pagination siblings', type: 'number', note: 'Pages on each side of the current one. Defaults to 1.' },
        ]}>
        <NavigationDemo />
      </Example>

      <Example id="toast" name="Toast" intro="Short confirmations in the bottom-right corner. They pause when you point at or focus them; errors stay until you close them."
        code={`<ToastProvider>
  <App />
</ToastProvider>

const { toast } = useToast();
toast({ title: 'Record added', description: 'Now in your collection.' });`}
        a11y={['The live region always exists, so screen readers never miss a new message.', 'The timer pauses on hover and focus (WCAG 2.2.1); error messages never disappear on their own.', 'At most three at a time; the oldest goes first.']}>
        <ToastDemo />
      </Example>

      <Example id="data" api={['Table', 'Avatar', 'Skeleton']} name="Table, Avatar, Skeleton and Spinner" intro="Data in a native table with an action menu per row, sleeves or people as avatars, and placeholders while something loads."
        code={`<Table caption="Most played" showCaption>
  <thead>…</thead>
  <tbody><tr><th scope="row">Uitzinnig</th><td className="pp-num">42</td></tr></tbody>
</Table>
<div aria-busy={loading}>{loading ? <Skeleton lines={2} /> : content}</div>`}
        a11y={['Table requires a caption; it also names the scrollable, focusable region.', 'Skeleton is decorative; the region itself gets aria-busy and announces the result.', 'Avatar falls back to initials with the name as its accessible name, or is decorative when the name is shown next to it.']}>
        <DataDemo />
      </Example>

      <Example id="layout" api={['Stack', 'Container']} name="Stack and Container" intro="Two small layout building blocks: a flex stack on the spacing scale and a container with the portfolio's gutter."
        code={`<Container size="md">
  <Stack gap={5}>
    <Text variant="title">Heading</Text>
    <Stack direction="row" gap={2} wrap>…</Stack>
  </Stack>
</Container>`}
        a11y={['Flex only changes the visual order, never a reading order different from the DOM.', 'Container keeps a gutter of at least 18 px on the narrowest screens.']}>
        <LayoutDemo />
      </Example>

      <ExtendedExamples />
      <AdditionExamples />
    </>
  );
}
