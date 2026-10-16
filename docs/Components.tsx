import { useState } from 'react';
import {
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

export function Components() {
  return (
    <section id="componenten" className="doc-section" aria-labelledby="componenten-title">
      <div className="doc-section__head">
        <Text variant="label" as="p" tone="accent">03 · Componenten</Text>
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
    </section>
  );
}
