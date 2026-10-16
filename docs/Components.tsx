import { useState } from 'react';
import {
  Avatar, Container, Menu, RadioGroup, Select, Sheet, Skeleton, Spinner, Stack, Table, Tooltip, useToast,
  Button, Checkbox, Dialog, Disclosure, IconButton, Link, Notice, Progress, SegmentedControl, Slider, Surface,
  Switch, Tab, TabList, TabPanel, Tabs, Tag, Text, TextArea, TextField, icons,
} from '@dionbm/papier';
import { Example } from './Example';

const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function ButtonDemo() {
  const [saving, setSaving] = useState(false);
  const save = () => { setSaving(true); window.setTimeout(() => setSaving(false), 1600); };
  return (
    <div className="doc-row">
      <Button onClick={save} loading={saving} iconEnd={<icons.ArrowRight />}>{saving ? 'Opslaan…' : 'Opslaan'}</Button>
      <Button variant="ink">Bekijk de case</Button>
      <Button variant="secondary">Annuleren</Button>
      <Button variant="ghost">Later</Button>
      <IconButton label="Volgende plaat" variant="disc" size="lg" icon={<icons.ArrowRight />} />
      <IconButton label="Sluiten" icon={<icons.Close />} />
    </div>
  );
}

function FormDemo() {
  const [mail, setMail] = useState('dion@');
  const invalid = mail.length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail);
  return (
    <div className="doc-stack doc-narrow">
      <TextField label="Naam" placeholder="Hoe heet je?" autoComplete="name" required />
      <TextField label="E-mailadres" type="email" value={mail} onChange={(e) => setMail(e.target.value)} hint="Alleen voor een antwoord, nooit voor een nieuwsbrief."
        error={invalid ? 'Vul een volledig e-mailadres in, zoals naam@voorbeeld.nl.' : undefined} autoComplete="email" />
      <TextArea label="Bericht" placeholder="Waar wil je het over hebben?" />
    </div>
  );
}

function ChoicesDemo() {
  const [period, setPeriod] = useState('maand');
  return (
    <div className="doc-stack doc-narrow">
      <SegmentedControl label="Periode" value={period} onValueChange={setPeriod}
        options={[{ value: 'week', label: 'Week' }, { value: 'maand', label: 'Maand' }, { value: 'jaar', label: 'Jaar' }, { value: 'alles', label: 'Alles' }]} />
      <Text tone="muted" variant="small" aria-live="polite">Je bekijkt: {period}.</Text>
      <Checkbox label="Toon ook geskipte nummers" description="Nummers die je binnen 30 seconden oversloeg." />
      <Switch label="Geluidseffecten" description="Alleen korte effecten, geen achtergrondmuziek." defaultChecked />
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
          <Text variant="small" as="p" className="doc-player__artist">Froukje · kant A</Text>
        </div>
      </div>
      <Slider label="Positie" min={0} max={213} value={pos} onValueChange={setPos} formatValue={time} />
      <Slider label="Volume" value={vol} onValueChange={setVol} formatValue={(v) => `${v}%`} />
    </Surface>
  );
}

function FeedbackDemo() {
  const [shown, setShown] = useState(true);
  const [step, setStep] = useState(2);
  return (
    <div className="doc-stack doc-narrow">
      {shown && <Notice tone="success" title="Collectie bijgewerkt" onDismiss={() => setShown(false)}>Drie nieuwe platen uit Discogs toegevoegd.</Notice>}
      {!shown && <Button size="sm" variant="secondary" onClick={() => setShown(true)}>Melding terugzetten</Button>}
      <Notice tone="warning" title="Discogs reageert traag">De catalogus laat de laatst opgeslagen versie zien.</Notice>
      <Notice tone="danger" title="Synchronisatie mislukt" action={<Button size="sm" variant="secondary">Opnieuw proberen</Button>}>Er is geen verbinding met de server.</Notice>
      <Progress label="Hoezen ophalen" value={step} max={5} valueText={`${step} van 5`} />
      <div className="doc-row"><Button size="sm" variant="secondary" onClick={() => setStep((s) => (s % 5) + 1)}>Volgende stap</Button></div>
      <Progress label="Verbinden met Discogs" tone="accent" />
    </div>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  return (
    <div className="doc-stack">
      <div className="doc-row"><Button variant="ink" onClick={() => setOpen(true)}>Plaat opbergen</Button></div>
      <Text variant="small" tone="muted" role="status">{result}</Text>
      <Dialog open={open} onClose={() => { setOpen(false); setResult('Geannuleerd: de plaat ligt nog op de draaitafel.'); }}
        title="Plaat terug in de hoes?" description="De muziek stopt en de plaat gaat terug in de bak."
        footer={<>
          <Button variant="secondary" onClick={() => { setOpen(false); setResult('Geannuleerd: de plaat ligt nog op de draaitafel.'); }}>Laten liggen</Button>
          <Button onClick={() => { setOpen(false); setResult('De plaat zit weer in de hoes.'); }}>Opbergen</Button>
        </>}
      />
    </div>
  );
}

function StructureDemo() {
  return (
    <div className="doc-stack">
      <Tabs defaultValue="nu">
        <TabList label="Luisterweergave">
          <Tab value="nu">Nu</Tab><Tab value="vandaag">Vandaag</Tab><Tab value="week">Week</Tab><Tab value="top">Top</Tab>
        </TabList>
        <TabPanel value="nu"><Text>Op de draaitafel: <strong>Uitzinnig</strong> van Froukje.</Text></TabPanel>
        <TabPanel value="vandaag"><Text>Vandaag 2 uur en 14 minuten geluisterd.</Text></TabPanel>
        <TabPanel value="week"><Text>Je drukste dag deze week was donderdag.</Text></TabPanel>
        <TabPanel value="top"><Text>Je meest gedraaide plaat van de maand staat bovenaan.</Text></TabPanel>
      </Tabs>
      <div>
        <Disclosure summary="Waarom geen eigen dropdowns?"><p>Native elementen geven gratis toetsenbordbediening, zoeken in de pagina en ondersteuning voor hulpmiddelen. Papier stijlt ze en voegt alleen beweging toe.</p></Disclosure>
        <Disclosure summary="Hoe werkt de vouwbeweging?"><p>De open-status wisselt meteen, zodat hulpmiddelen niet hoeven te wachten. Alleen de hoogte beweegt: 420 ms open, 290 ms dicht.</p></Disclosure>
      </div>
    </div>
  );
}

function SurfaceDemo() {
  return (
    <div className="doc-surfaces">
      <Surface material="paper" elevation="object"><Text variant="label" as="p">paper</Text><Text variant="subtitle" as="p">Module</Text></Surface>
      <Surface material="sage" elevation="object"><Text variant="label" as="p">sage</Text><Text variant="subtitle" as="p">Werk</Text></Surface>
      <Surface material="coral" elevation="object"><Text variant="label" as="p">coral</Text><Text variant="subtitle" as="p">Bediening</Text></Surface>
      <Surface material="ink" elevation="object"><Text variant="label" as="p">ink</Text><Text variant="subtitle" as="p">Nadruk</Text></Surface>
      <div className="doc-row doc-tags">
        <Tag>Neutraal</Tag><Tag tone="sage">Kotlin</Tag><Tag tone="coral">Live</Tag><Tag tone="accent">Nieuw</Tag><Tag tone="outline">Prototype</Tag>
      </div>
      <div className="doc-row">
        <Link href="#componenten">Interne link</Link>
        <Link href="#componenten" variant="arrow">Verken het werk</Link>
        <Link href="https://www.discogs.com" external variant="arrow">Discogs</Link>
      </div>
    </div>
  );
}


function SelectRadioDemo() {
  return (
    <div className="doc-stack doc-narrow">
      <Select label="Sorteer de bak op" defaultValue="artist" options={[{ value: 'artist', label: 'Artiest' }, { value: 'year', label: 'Jaar' }, { value: 'plays', label: 'Meest gedraaid' }]} hint="Native: op je telefoon opent de eigen kiezer." />
      <RadioGroup legend="Snelheid" orientation="horizontal" defaultValue="33" options={[{ value: '33', label: '33⅓' }, { value: '45', label: '45' }, { value: '78', label: '78' }]} />
      <RadioGroup legend="Weergave" appearance="card" defaultValue="bak" options={[
        { value: 'bak', label: 'Platenbak', description: 'Blader door hoezen zoals in een winkel.' },
        { value: 'lijst', label: 'Lijst', description: 'Sneller zoeken op titel en jaar.' },
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
        <Tooltip content="Zet de plaat terug in de hoes"><IconButton label="Opbergen" icon={<icons.Close />} /></Tooltip>
        <Tooltip content="Kopieer de link naar deze plaat"><IconButton label="Delen" icon={<icons.Copy />} /></Tooltip>
        <Menu trigger={<>Acties <icons.ChevronDown /></>} items={[
          { label: 'Afspelen', icon: <icons.Play />, onSelect: () => setLast('Afspelen gekozen.') },
          { label: 'Naar Discogs', icon: <icons.External />, onSelect: () => setLast('Discogs gekozen.') },
          { label: 'Kopiëren', icon: <icons.Copy />, onSelect: () => {}, disabled: true },
          { label: 'Uit collectie halen', tone: 'danger', onSelect: () => setLast('Verwijderen gekozen.') },
        ]} />
        <Button variant="secondary" iconStart={<icons.Menu />} onClick={() => setSheet(true)}>Navigatie</Button>
      </div>
      <Text variant="small" tone="muted" role="status">{last}</Text>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Navigatie" hideTitle>
        <nav aria-label="Voorbeeldnavigatie" className="doc-sheet-nav">
          {['Werk', 'Over mij', 'Luisterkamer', 'Contact'].map((l) => <a key={l} href="#overlays" onClick={() => setSheet(false)}>{l}</a>)}
        </nav>
      </Sheet>
    </div>
  );
}

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="doc-row">
      <Button onClick={() => toast({ title: 'Plaat toegevoegd', description: 'Uitzinnig staat nu in je collectie.' })}>Toevoegen</Button>
      <Button variant="secondary" onClick={() => toast({ tone: 'danger', title: 'Discogs niet bereikbaar', description: 'Blijft staan tot je hem sluit.' })}>Fout tonen</Button>
    </div>
  );
}

function DataDemo() {
  const [loading, setLoading] = useState(true);
  const rows: Array<[string, string, number]> = [['Uitzinnig', 'Froukje', 42], ['Zachte Landing', 'Lieve Kamer', 17], ['Kleine Uren', 'Het Noordlicht', 9]];
  return (
    <div className="doc-stack">
      <Table caption="Meest gedraaid deze maand (voorbeelddata)" showCaption>
        <thead><tr><th scope="col">Plaat</th><th scope="col">Artiest</th><th scope="col" className="pp-num">Keer</th></tr></thead>
        <tbody>{rows.map(([t, a, n]) => <tr key={t}><th scope="row"><Stack direction="row" gap={3} align="center"><Avatar name={a} size="sm" shape="square" decorative />{t}</Stack></th><td>{a}</td><td className="pp-num">{n}</td></tr>)}</tbody>
      </Table>
      <div className="doc-row"><Button size="sm" variant="secondary" onClick={() => setLoading((l) => !l)}>{loading ? 'Laad inhoud' : 'Toon skelet'}</Button>{loading && <Spinner label="Hoezen laden" />}</div>
      <div aria-busy={loading} aria-live="polite" className="doc-skeleton-card">
        {loading
          ? <Stack direction="row" gap={4} align="center"><Skeleton shape="circle" /><div style={{ flex: 1 }}><Skeleton lines={2} /></div></Stack>
          : <Stack direction="row" gap={4} align="center"><Avatar name="Froukje Veenstra" /><div><Text as="p">Froukje</Text><Text variant="small" tone="muted" as="p">42 keer gedraaid</Text></div></Stack>}
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

export function Components() {
  return (
    <section id="componenten" className="doc-section" aria-labelledby="componenten-title">
      <div className="doc-section__head">
        <Text variant="headline" as="h2" id="componenten-title">Onderdelen die je kunt aanraken.</Text>
        <Text variant="body-lg" tone="muted">Elk onderdeel is gebouwd op een native element waar dat kan. Papier voegt materiaal en beweging toe, nooit een eigen versie van wat de browser al goed doet.</Text>
      </div>

      <Example id="knoppen" name="Button en IconButton" intro="De salie-groene actie uit de cases, de inktknop en rustige secundaire varianten. Tijdens laden blijft de knop focusbaar."
        code={`<Button loading={saving} iconEnd={<icons.ArrowRight />}>Opslaan</Button>
<Button variant="ink">Bekijk de case</Button>
<IconButton label="Volgende plaat" variant="disc" icon={<icons.ArrowRight />} />`}
        a11y={['Laden gebruikt aria-busy en aria-disabled, dus de focus springt nooit weg.', 'IconButton vereist een label; dat wordt de toegankelijke naam en de tooltip.', 'Elk raakvlak is minimaal 44 × 44 px.']}
        props={[
          { name: 'variant', type: "'primary' | 'ink' | 'secondary' | 'ghost' | 'danger'", note: 'Visuele rol. Standaard primary.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", note: 'Hoogte 36, 44 of 55 px.' },
          { name: 'loading', type: 'boolean', note: 'Toont een spinner en blokkeert activeren.' },
          { name: 'iconStart / iconEnd', type: 'ReactNode', note: 'Het eindicoon schuift 3 px bij hover.' },
        ]}>
        <ButtonDemo />
      </Example>

      <Example id="formulieren" name="TextField en TextArea" intro="Het onderstreepte invoerveld uit de portfoliowidget. Label, hint en fout horen bij het veld en worden samen voorgelezen."
        code={`<TextField
  label="E-mailadres"
  hint="Alleen voor een antwoord."
  error={invalid ? 'Vul een volledig e-mailadres in.' : undefined}
/>`}
        a11y={['Het label is een echt <label> en blijft zichtbaar; hideLabel verbergt het alleen visueel.', 'Fout en hint staan in aria-describedby, de fout eerst.', 'aria-invalid wordt alleen gezet als er een fout is; kleur is nooit het enige signaal.']}
        props={[
          { name: 'label', type: 'ReactNode', note: 'Verplicht.' },
          { name: 'hint', type: 'ReactNode', note: 'Uitleg onder het veld.' },
          { name: 'error', type: 'ReactNode', note: 'Foutmelding; zet aria-invalid.' },
          { name: 'hideLabel', type: 'boolean', note: 'Alleen voor velden met een duidelijke context.' },
        ]}>
        <FormDemo />
      </Example>

      <Example id="keuzes" name="SegmentedControl, Checkbox en Switch" intro="Een keuze tussen een paar periodes, met de schuivende markering uit de Auralis-films. Switch voor instellingen die meteen gelden."
        code={`<SegmentedControl
  label="Periode"
  value={period}
  onValueChange={setPeriod}
  options={[{ value: 'week', label: 'Week' }, { value: 'maand', label: 'Maand' }]}
/>
<Switch label="Geluidseffecten" defaultChecked />`}
        a11y={['SegmentedControl is een radiogroup met roving tabindex: Tab gaat erin, pijltjes kiezen, Home en End springen.', 'Uitgeschakelde opties worden overgeslagen.', 'Switch gebruikt role="switch" met aria-checked; Checkbox is een echte native checkbox.']}>
        <ChoicesDemo />
      </Example>

      <Example id="slider" name="Slider" intro="Een native range met gevuld spoor en leesbare waarde. Gebouwd voor de luisterkamer: positie in minuten, volume in procenten."
        code={`<Slider
  label="Positie"
  max={213}
  value={pos}
  onValueChange={setPos}
  formatValue={(s) => \`\${Math.floor(s / 60)}:\${String(s % 60).padStart(2, '0')}\`}
/>`}
        a11y={['aria-valuetext gebruikt dezelfde opmaak als de zichtbare waarde, dus "1:24" in plaats van "84".', 'De duim krijgt de focusring; het raakvlak is 44 px hoog.']}>
        <PlayerDemo />
      </Example>

      <Example id="feedback" name="Notice en Progress" intro="Statusmeldingen met eigen icoon en woorden, en voortgang met een echte waardetekst."
        code={`<Notice tone="danger" title="Synchronisatie mislukt"
  action={<Button size="sm" variant="secondary">Opnieuw proberen</Button>}>
  Er is geen verbinding met de server.
</Notice>
<Progress label="Hoezen ophalen" value={2} max={5} valueText="2 van 5" />`}
        a11y={['Info, succes en waarschuwing gebruiken role="status"; alleen blokkerende fouten zijn role="alert".', 'Elke toon heeft een eigen icoon en titel, zodat kleur niet het enige signaal is.', 'Progress zonder waarde is indeterminate en laat aria-valuenow weg.']}>
        <FeedbackDemo />
      </Example>

      <Example id="dialoog" name="Dialog" intro="Een modaal venster op het native dialog-element. Escape, de sluitknop en een klik naast het venster sluiten het."
        code={`<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Plaat terug in de hoes?"
  footer={<Button onClick={store}>Opbergen</Button>}
/>`}
        a11y={['showModal() geeft een echte focusval en maakt de achtergrond inert.', 'De titel is de toegankelijke naam, de beschrijving staat in aria-describedby.', 'Na sluiten keert de focus terug naar de knop die het venster opende.']}>
        <DialogDemo />
      </Example>

      <Example id="structuur" name="Tabs en Disclosure" intro="Tabs voor weergaven van dezelfde inhoud. Disclosure is een native uitklapper die in 420 ms ontvouwt en in 290 ms dichtvouwt."
        code={`<Tabs defaultValue="nu">
  <TabList label="Luisterweergave">
    <Tab value="nu">Nu</Tab>
    <Tab value="week">Week</Tab>
  </TabList>
  <TabPanel value="nu">…</TabPanel>
  <TabPanel value="week">…</TabPanel>
</Tabs>
<Disclosure summary="Technische verdieping">…</Disclosure>`}
        a11y={['Tabs volgen het WAI-ARIA-patroon: pijltjes wisselen, Tab gaat naar het panel.', 'Disclosure blijft een <details>: zoeken in de pagina opent hem gewoon.', 'Bij reduced motion wisselen beide direct.']}>
        <StructureDemo />
      </Example>

      <Example id="materiaal" name="Surface, Tag en Link" intro="Modules met een eigen materiaal en objectschaduw, kleine labels en links met een opkomende onderstreping."
        code={`<Surface material="sage" elevation="object">…</Surface>
<Tag tone="sage">Kotlin</Tag>
<Link href="/werk" variant="arrow">Verken het werk</Link>
<Link href="https://discogs.com" external>Discogs</Link>`}
        a11y={['De tekstkleur volgt het materiaal en haalt op elk materiaal minimaal 4,5:1.', 'Externe links krijgen rel="noopener noreferrer" en een voorgelezen hint "opent in een nieuw tabblad".', 'Prose blijft vlak: de objectschaduw is alleen voor bedienbare objecten.']}>
        <SurfaceDemo />
      </Example>

      <Example id="select" name="Select en RadioGroup" intro="Een gestijlde native select en een fieldset met keuzerondjes, als lijst of als tegels."
        code={`<Select label="Sorteer de bak op" options={[{ value: 'artist', label: 'Artiest' }]} />
<RadioGroup legend="Weergave" appearance="card" options={[
  { value: 'bak', label: 'Platenbak', description: 'Blader door hoezen.' },
]} />`}
        a11y={['Select blijft een native element: telefoons tonen hun eigen kiezer, typen springt naar een optie.', 'RadioGroup is een fieldset met legend; pijltjes en formulieren werken native.', 'Fout en hint hangen aan de groep via aria-describedby.']}>
        <SelectRadioDemo />
      </Example>

      <Example id="overlays" name="Tooltip, Menu en Sheet" intro="Een hint op hover of focus, een actiemenu en een paneel vanaf de rand, zoals het mobiele navigatieblad van het portfolio."
        code={`<Tooltip content="Zet de plaat terug">
  <IconButton label="Opbergen" icon={<icons.Close />} />
</Tooltip>
<Menu trigger="Acties" items={[{ label: 'Afspelen', onSelect: play }]} />
<Sheet open={open} onClose={close} title="Navigatie" hideTitle>…</Sheet>`}
        a11y={['Tooltip voegt een beschrijving toe, nooit de naam; hij blijft staan als je erop beweegt en Escape sluit hem (WCAG 1.4.13).', 'Menu volgt het menu-button-patroon: pijl omlaag opent, Escape en Tab sluiten, focus keert terug.', 'Sheet is een native modale dialog met een verborgen maar voorgelezen titel.']}>
        <OverlayDemo />
      </Example>

      <Example id="toast" name="Toast" intro="Korte bevestigingen rechtsonder. Ze pauzeren als je erop wijst of focust; fouten blijven staan tot je ze sluit."
        code={`<ToastProvider>
  <App />
</ToastProvider>

const { toast } = useToast();
toast({ title: 'Plaat toegevoegd', description: 'Staat nu in je collectie.' });`}
        a11y={['De live region bestaat altijd, dus schermlezers missen geen nieuwe melding.', 'Tijd pauzeert bij hover en focus (WCAG 2.2.1); foutmeldingen verdwijnen niet vanzelf.', 'Maximaal drie tegelijk, de oudste gaat eerst.']}>
        <ToastDemo />
      </Example>

      <Example id="data" name="Table, Avatar, Skeleton en Spinner" intro="Gegevens in een native tabel, hoezen of personen als avatar, en plaatshouders terwijl iets laadt."
        code={`<Table caption="Meest gedraaid" showCaption>
  <thead>…</thead>
  <tbody><tr><th scope="row">Uitzinnig</th><td className="pp-num">42</td></tr></tbody>
</Table>
<div aria-busy={loading}>{loading ? <Skeleton lines={2} /> : content}</div>`}
        a11y={['Table vraagt een caption; die benoemt ook het scrollbare, focusbare gebied.', 'Skeleton is decoratief; het gebied zelf krijgt aria-busy en kondigt het resultaat aan.', 'Avatar valt terug op initialen met de naam als toegankelijke naam, of is decoratief als de naam ernaast staat.']}>
        <DataDemo />
      </Example>

      <Example id="layout" name="Stack en Container" intro="Twee kleine layoutbouwstenen: een flexstapel op de ruimteschaal en een container met de goot van het portfolio."
        code={`<Container size="md">
  <Stack gap={5}>
    <Text variant="title">Kop</Text>
    <Stack direction="row" gap={2} wrap>…</Stack>
  </Stack>
</Container>`}
        a11y={['Alleen visuele volgorde via flex, nooit een andere leesvolgorde dan de DOM.', 'Container houdt minimaal 18 px goot op de smalste schermen.']}>
        <LayoutDemo />
      </Example>
    </section>
  );
}
