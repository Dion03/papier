import { useState } from 'react';
import {
  Calendar, DatePicker, DateRangePicker, MultiCombobox, RangeCalendar, RangeSlider, type ComboboxOption, type DateRange,
  Accordion, Button, Checkbox, CheckboxGroup, Disclosure, EmptyState, FileField, Kbd, Menu, NumberField, PasswordField, Popover,
  Separator, SortHeader, Tab, TabList, TabPanel, Table, Tabs, Tag, Text, TextArea, TextField, ToggleGroup, icons, useTableSort, useToast,
} from '@dionbm/papier';
import { Example } from './Example';

type Genre = 'jazz' | 'pop' | 'soul' | 'klassiek';
const genres: Array<{ value: Genre; label: string }> = [
  { value: 'jazz', label: 'Jazz' }, { value: 'pop', label: 'Pop' }, { value: 'soul', label: 'Soul' }, { value: 'klassiek', label: 'Klassiek' },
];

function PopoverDemo() {
  const [applied, setApplied] = useState<{ genres: Genre[]; from: number | null }>({ genres: ['jazz'], from: 1960 });
  const [draft, setDraft] = useState(applied);
  return (
    <div className="doc-stack">
      <div className="doc-row">
        <Popover title="Filter de bak" onOpenChange={(open) => { if (open) setDraft(applied); }}
          trigger={<Button variant="secondary" iconStart={<icons.Search />}>Filters{applied.genres.length > 0 && ` (${applied.genres.length})`}</Button>}>
          {({ close }) => (
            <div className="doc-stack">
              <CheckboxGroup legend="Genre" options={genres} value={draft.genres} onValueChange={(g) => setDraft({ ...draft, genres: g })} orientation="horizontal" />
              <NumberField label="Uitgebracht vanaf" min={1900} max={2026} step={10} value={draft.from}
                onValueChange={(from) => setDraft({ ...draft, from })} formatOptions={{ useGrouping: false }} />
              <div className="doc-row">
                <Button size="sm" onClick={() => { setApplied(draft); close(); }}>Toepassen</Button>
                <Button size="sm" variant="ghost" onClick={() => setDraft({ genres: [], from: null })}>Wissen</Button>
              </div>
            </div>
          )}
        </Popover>
        <Popover label="Over de bak" side="right" trigger={<Button variant="ghost" iconStart={<icons.Info />}>Wat is dit?</Button>}>
          <Text variant="small" as="p">De bak toont alleen platen die je zelf hebt. Uitgeleende platen staan grijs.</Text>
        </Popover>
      </div>
      <Text variant="small" tone="muted" role="status">
        {applied.genres.length ? `Je ziet ${applied.genres.join(', ')}` : 'Je ziet alle genres'}{applied.from ? `, vanaf ${applied.from}.` : '.'}
      </Text>
    </div>
  );
}

function MenuChoicesDemo() {
  const [sort, setSort] = useState<'artiest' | 'jaar' | 'recent'>('artiest');
  const [covers, setCovers] = useState(true);
  const [lent, setLent] = useState(false);
  const label = { artiest: 'Artiest', jaar: 'Jaar', recent: 'Laatst gedraaid' };
  return (
    <div className="doc-stack">
      <div className="doc-row">
        <Menu trigger={<>Weergave <icons.ChevronDown /></>} items={[
          { type: 'label', label: 'Sorteren op' },
          ...(['artiest', 'jaar', 'recent'] as const).map((k) => ({ type: 'radio' as const, label: label[k], checked: sort === k, onSelect: () => setSort(k) })),
          { type: 'separator' },
          { type: 'label', label: 'Tonen' },
          { type: 'checkbox', label: 'Hoezen', checked: covers, keepOpen: true, onSelect: () => setCovers((c) => !c) },
          { type: 'checkbox', label: 'Uitgeleende platen', checked: lent, keepOpen: true, onSelect: () => setLent((c) => !c) },
          { type: 'separator' },
          { label: 'Bekijk op Discogs', icon: <icons.External />, href: 'https://www.discogs.com', target: '_blank' },
          { label: 'Kopieer lijst', icon: <icons.Copy />, shortcut: 'Ctrl C', onSelect: () => {} },
        ]} />
      </div>
      <Text variant="small" tone="muted" role="status">Gesorteerd op {label[sort].toLowerCase()}, hoezen {covers ? 'aan' : 'uit'}, uitgeleende platen {lent ? 'zichtbaar' : 'verborgen'}.</Text>
    </div>
  );
}

function NumberDemo() {
  const [count, setCount] = useState<number | null>(2);
  const [price, setPrice] = useState<number | null>(24.95);
  const [discount, setDiscount] = useState<number | null>(0.1);
  const total = (count ?? 0) * (price ?? 0) * (1 - (discount ?? 0));
  return (
    <div className="doc-stack doc-narrow">
      <NumberField label="Aantal exemplaren" min={1} max={10} value={count} onValueChange={setCount} hint="Hoogstens tien per bestelling." />
      <NumberField label="Prijs per plaat" min={0} step={0.5} value={price} onValueChange={setPrice} formatOptions={{ style: 'currency', currency: 'EUR' }} />
      <NumberField label="Korting" min={0} max={0.5} step={0.05} value={discount} onValueChange={setDiscount} formatOptions={{ style: 'percent' }} hideStepper
        hint="Typ een percentage, bijvoorbeeld 15." />
      <Text variant="small" tone="muted" role="status">Totaal: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(total)}</Text>
    </div>
  );
}

const artists: ComboboxOption[] = [
  { value: 'froukje', label: 'Froukje', description: 'Nederpop' },
  { value: 'coltrane', label: 'John Coltrane', description: 'Jazz' },
  { value: 'bjork', label: 'Björk', description: 'Elektronisch' },
  { value: 'davis', label: 'Miles Davis', description: 'Jazz' },
  { value: 'fleetwood', label: 'Fleetwood Mac', description: 'Rock' },
  { value: 'radiohead', label: 'Radiohead', description: 'Rock' },
  { value: 'simone', label: 'Nina Simone', description: 'Soul en jazz' },
  { value: 'franklin', label: 'Aretha Franklin', description: 'Soul' },
];

function MultiDemo() {
  const [chosen, setChosen] = useState<string[]>(['coltrane', 'simone']);
  return (
    <div className="doc-stack doc-narrow">
      <MultiCombobox label="Artiesten in je mix" options={artists} value={chosen} onChange={setChosen} max={5}
        placeholder="Zoek een artiest" hint="Hoogstens vijf. Backspace haalt de laatste weg." />
      <Text variant="small" tone="muted" role="status">{chosen.length} van 5 gekozen.</Text>
    </div>
  );
}

function RangeDemo() {
  const [years, setYears] = useState<[number, number]>([1957, 1977]);
  const [price, setPrice] = useState<[number, number]>([15, 40]);
  const euro = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  return (
    <div className="doc-stack doc-narrow">
      <RangeSlider label="Uitgebracht" min={1950} max={2025} value={years} onValueChange={setYears} minDistance={1}
        marks={[{ value: 1950, label: '1950' }, 1960, 1970, 1980, 1990, 2000, 2010, { value: 2025, label: '2025' }]} />
      <RangeSlider label="Prijs" min={0} max={100} step={5} value={price} onValueChange={setPrice} formatValue={euro} minDistance={5} />
    </div>
  );
}

function DateDemo() {
  const [release, setRelease] = useState<string | null>('1957-09-15');
  const [delivery, setDelivery] = useState<string | null>(null);
  const today = new Date();
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const max = new Date(today); max.setDate(max.getDate() + 60);
  const weekend = (d: string) => { const day = new Date(`${d}T12:00:00Z`).getUTCDay(); return day === 0 || day === 6; };
  return (
    <div className="doc-split">
      <div className="doc-stack">
        <DatePicker label="Releasedatum" value={release} onValueChange={setRelease} hint="Typ bijvoorbeeld 15-9-1957 of kies in de kalender." />
        <DatePicker label="Bezorgdatum" value={delivery} onValueChange={setDelivery} min={iso(today)} max={iso(max)} isDateUnavailable={weekend}
          hint="Op werkdagen, binnen twee maanden." />
        <Text variant="small" tone="muted" role="status">{release ? `Release: ${release}` : 'Geen releasedatum.'}</Text>
      </div>
      <Calendar value={delivery} onValueChange={setDelivery} min={iso(today)} max={iso(max)} isDateUnavailable={weekend} />
    </div>
  );
}

function PeriodDemo() {
  const [stay, setStay] = useState<DateRange | null>({ start: '2024-07-12', end: '2024-07-16' });
  const [report, setReport] = useState<DateRange | null>({ start: '2024-07-01', end: '2024-07-31' });
  const nights = stay?.end ? Math.round((Date.parse(stay.end) - Date.parse(stay.start)) / 86_400_000) : 0;
  return (
    <div className="doc-split">
      <div className="doc-stack">
        <DateRangePicker label="Platenbeurs, verblijf" value={stay} onValueChange={setStay} hint="Aankomst en vertrek." startName="aankomst" endName="vertrek" />
        <Text variant="small" tone="muted" role="status">{stay?.end ? `${nights} ${nights === 1 ? 'nacht' : 'nachten'}.` : 'Kies ook een vertrekdatum.'}</Text>
      </div>
      <RangeCalendar value={report} onValueChange={setReport} defaultMonth="2024-07-01" />
    </div>
  );
}

function AccountDemo() {
  const [password, setPassword] = useState('');
  const short = password.length > 0 && password.length < 12;
  return (
    <div className="doc-stack doc-narrow">
      <PasswordField label="Nieuw wachtwoord" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
        hint="Minstens 12 tekens. Een zin werkt goed." error={short ? `Nog ${12 - password.length} tekens.` : undefined} />
      <TextArea label="Over jouw collectie" autoResize rows={2} maxRows={8} placeholder="Het veld groeit mee terwijl je typt." />
    </div>
  );
}

function FileDemo() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="doc-stack doc-narrow">
      <FileField label="Foto's van de hoes" hint="JPG of PNG, hoogstens 5 MB per foto en vier foto's." accept="image/jpeg,image/png" multiple maxFiles={4}
        maxSize={5_000_000} value={files} onFilesChange={setFiles} />
    </div>
  );
}

function ChoicesDemo() {
  const [formats, setFormats] = useState<string[]>(['lp']);
  const [filters, setFilters] = useState<Genre[]>(['jazz', 'soul']);
  const all = ['lp', 'ep', 'single'];
  return (
    <div className="doc-stack doc-narrow">
      <Checkbox label="Alle formaten" checked={formats.length === all.length} indeterminate={formats.length > 0 && formats.length < all.length}
        onChange={(e) => setFormats(e.target.checked ? all : [])} />
      <CheckboxGroup legend="Formaten" appearance="card" value={formats} onValueChange={setFormats} options={[
        { value: 'lp', label: 'LP', description: 'Langspeler, 33 toeren' },
        { value: 'ep', label: 'EP', description: 'Vier tot zes nummers' },
        { value: 'single', label: 'Single', description: '7 inch, 45 toeren' },
      ]} error={formats.length === 0 ? 'Kies minstens één formaat.' : undefined} />
      <ToggleGroup label="Genres" options={genres} value={filters} onValueChange={setFilters} />
      <Text variant="small" tone="muted" role="status">{filters.length ? `Genres: ${filters.join(', ')}.` : 'Geen genre gekozen.'}</Text>
    </div>
  );
}

function StructureDemo() {
  return (
    <div className="doc-stack">
      <Accordion type="single">
        <Disclosure summary="Hoe lang duurt verzending?" defaultOpen><p>Binnen twee werkdagen, in een stevige platendoos.</p></Disclosure>
        <Disclosure summary="Kan ik een plaat terugsturen?"><p>Binnen dertig dagen, zolang de plaat niet is gedraaid.</p></Disclosure>
        <Disclosure summary="Hoe beoordelen jullie de staat?"><p>Volgens de Goldmine-schaal, van Mint tot Poor.</p></Disclosure>
      </Accordion>
      <Tabs defaultValue="profiel" orientation="vertical">
        <TabList label="Instellingen">
          <Tab value="profiel">Profiel</Tab>
          <Tab value="meldingen">Meldingen</Tab>
          <Tab value="privacy">Privacy</Tab>
        </TabList>
        <TabPanel value="profiel"><Text tone="muted">Je naam en hoe anderen je collectie zien.</Text></TabPanel>
        <TabPanel value="meldingen"><Text tone="muted">Mails over nieuwe persingen en prijsdalingen.</Text></TabPanel>
        <TabPanel value="privacy"><Text tone="muted">Wie je luistergeschiedenis mag zien.</Text></TabPanel>
      </Tabs>
    </div>
  );
}

const collection = [
  { titel: 'Uitzinnig', artiest: 'Froukje', jaar: 2023, keer: 42 },
  { titel: 'Blue Train', artiest: 'John Coltrane', jaar: 1957, keer: 17 },
  { titel: 'Vespertine', artiest: 'Björk', jaar: 2001, keer: 9 },
  { titel: 'Rumours', artiest: 'Fleetwood Mac', jaar: 1977, keer: 23 },
  { titel: 'OK Computer', artiest: 'Radiohead', jaar: 1997, keer: 31 },
];
type Column = 'titel' | 'artiest' | 'jaar' | 'keer';

function SortDemo() {
  const sort = useTableSort<Column>({ key: 'keer', direction: 'descending' });
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const rows = sort.sortRows(collection.filter((r) => `${r.titel} ${r.artiest}`.toLowerCase().includes(query.toLowerCase())), (r, k) => r[k]);
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.titel));
  const someChecked = rows.some((r) => selected.includes(r.titel));
  return (
    <div className="doc-stack">
      <div className="doc-narrow"><TextField label="Zoek in de collectie" hideLabel type="search" placeholder="Zoek op titel of artiest" prefix={<icons.Search />}
        value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {rows.length === 0
        ? <EmptyState title="Geen platen gevonden" description={`Niets in je collectie past bij "${query}". Controleer de spelling of zoek op de artiest.`}
            icon={<icons.Search />} action={<Button variant="secondary" size="sm" onClick={() => setQuery('')}>Zoekopdracht wissen</Button>} />
        : (
          <Table caption="Je collectie, sorteerbaar (voorbeelddata)" showCaption>
            <thead><tr>
              <th scope="col" className="doc-select-cell"><Checkbox label={<span className="pp-visually-hidden">Selecteer alle zichtbare platen</span>} checked={allChecked}
                indeterminate={someChecked && !allChecked} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.titel) : [])} /></th>
              <SortHeader {...sort.headerProps('titel')}>Titel</SortHeader>
              <SortHeader {...sort.headerProps('artiest')}>Artiest</SortHeader>
              <SortHeader {...sort.headerProps('jaar')} align="end">Jaar</SortHeader>
              <SortHeader {...sort.headerProps('keer')} align="end">Gedraaid</SortHeader>
            </tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.titel}>
                <td className="doc-select-cell"><Checkbox label={<span className="pp-visually-hidden">Selecteer {r.titel}</span>} checked={selected.includes(r.titel)}
                  onChange={(e) => setSelected((s) => (e.target.checked ? [...s, r.titel] : s.filter((t) => t !== r.titel)))} /></td>
                <th scope="row">{r.titel}</th><td>{r.artiest}</td><td className="pp-num">{r.jaar}</td><td className="pp-num">{r.keer}</td>
              </tr>
            ))}</tbody>
          </Table>
        )}
      <Text variant="small" tone="muted" role="status">{selected.length ? `${selected.length} geselecteerd.` : 'Niets geselecteerd.'}</Text>
    </div>
  );
}

function ToastPromiseDemo() {
  const { promise, toast, update } = useToast();
  const sync = (fail: boolean) => promise(
    new Promise<number>((done, reject) => window.setTimeout(() => (fail ? reject(new Error('offline')) : done(3)), 1400)),
    {
      loading: { title: 'Discogs synchroniseren…' },
      success: (n) => ({ title: 'Collectie bijgewerkt', description: `${n} nieuwe platen toegevoegd.` }),
      error: { title: 'Synchronisatie mislukt', description: 'Er is geen verbinding met Discogs.' },
    },
  ).catch(() => {});
  return (
    <div className="doc-row">
      <Button onClick={() => sync(false)}>Synchroniseren</Button>
      <Button variant="secondary" onClick={() => sync(true)}>Laat mislukken</Button>
      <Button variant="ghost" onClick={() => {
        const id = toast({ tone: 'info', title: 'Kant A speelt', duration: Infinity });
        window.setTimeout(() => update(id, { tone: 'success', title: 'Kant A is klaar', description: 'Draai de plaat om voor kant B.', duration: 5000 }), 1800);
      }}>Toon en wijzig</Button>
    </div>
  );
}

function DetailsDemo() {
  return (
    <div className="doc-stack doc-narrow">
      <Text>Zoek overal met <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>, en spring naar de volgende plaat met <Kbd>J</Kbd>.</Text>
      <Separator />
      <div className="doc-row"><Tag tone="sage">Jazz</Tag><Separator orientation="vertical" /><Tag tone="outline">1957</Tag><Separator orientation="vertical" /><Tag tone="outline">Blue Note</Tag></div>
      <Button fullWidth variant="ink">Inloggen met je e-mailadres</Button>
      <Separator label="of" />
      <Button fullWidth variant="secondary">Inloggen met Discogs</Button>
      <EmptyState size="sm" headingLevel={3} title="Nog geen luisterlijst" description="Bewaar platen die je nog wilt horen."
        icon={<icons.Play />} action={<Button size="sm">Plaat bewaren</Button>} />
    </div>
  );
}

/** Components added in 0.5: overlays, form inputs, structure and data helpers. */
export function ExtendedExamples() {
  return (
    <>
      <Example id="popover" api={['Popover']} name="Popover" intro="Een paneel naast de knop voor iets om in te werken: filters, een kort formulier, uitleg. Niet modaal: de rest van de pagina blijft bruikbaar."
        code={`<Popover title="Filter de bak" trigger={<Button variant="secondary">Filters</Button>}>
  {({ close }) => (
    <>
      <CheckboxGroup legend="Genre" options={genres} value={g} onValueChange={setG} />
      <Button onClick={() => { apply(); close(); }}>Toepassen</Button>
    </>
  )}
</Popover>`}
        a11y={['De knop krijgt aria-haspopup="dialog", aria-expanded en aria-controls; het paneel is een benoemde dialog.', 'Bij openen gaat de focus naar het eerste veld, Escape sluit en zet de focus terug op de knop.', 'Een klik of focus buiten het paneel sluit het. Het paneel staat direct na de knop in de DOM, dus Tab loopt er vanzelf in.', 'Opent in de top layer en klapt om aan de rand van het scherm, net als Menu.']}>
        <PopoverDemo />
      </Example>

      <Example id="menu-keuzes" api={['Menu']} name="Menu met groepen en keuzes" intro="Hetzelfde actiemenu, nu met kopjes, scheidingslijnen, aanvinkbare keuzes, links en sneltoetsen. Bestaande menu's werken ongewijzigd."
        code={`<Menu trigger="Weergave" items={[
  { type: 'label', label: 'Sorteren op' },
  { type: 'radio', label: 'Artiest', checked: sort === 'artiest', onSelect: () => setSort('artiest') },
  { type: 'separator' },
  { type: 'checkbox', label: 'Hoezen', checked: covers, keepOpen: true, onSelect: toggle },
  { label: 'Bekijk op Discogs', href: 'https://discogs.com', target: '_blank' },
  { label: 'Kopieer lijst', shortcut: 'Ctrl C', onSelect: copy },
]} />`}
        a11y={['Keuzes zijn menuitemradio en menuitemcheckbox met aria-checked; het vinkje is decoratief.', 'Een kopje benoemt zijn groep (role="group" met aria-labelledby).', 'Typ een letter om naar het volgende item te springen dat ermee begint.', 'Links zijn echte <a>-elementen: middelklik en "open in nieuw tabblad" werken.']}>
        <MenuChoicesDemo />
      </Example>

      <Example id="getallen" api={['NumberField']} name="NumberField" intro="Een getal met − en + ernaast. Leest wat je typt in het Nederlands (24,95) en maakt het op als bedrag of percentage zodra je het veld verlaat."
        code={`<NumberField label="Aantal exemplaren" min={1} max={10} value={n} onValueChange={setN} />
<NumberField label="Prijs per plaat" step={0.5}
  formatOptions={{ style: 'currency', currency: 'EUR' }} />
<NumberField label="Korting" max={0.5} formatOptions={{ style: 'percent' }} hideStepper />`}
        a11y={['Het veld is een spinbutton met aria-valuenow, -min, -max en een leesbare aria-valuetext ("€ 24,95").', 'Pijl omhoog en omlaag stappen, PageUp en PageDown nemen tien stappen, Home en End gaan naar min en max.', 'De knoppen zitten niet in de tabvolgorde (het toetsenbord heeft de pijlen) maar zijn wel benoemd voor schermlezers. Ingedrukt houden blijft stappen.', 'Met name gaat de ruwe waarde mee in een formulier.']}>
        <NumberDemo />
      </Example>

      <Example id="meerdere" api={['MultiCombobox']} name="MultiCombobox" intro="Meerdere keuzes uit een lange lijst, met meezoeken. Gekozen items staan als labels in het veld; de lijst blijft open terwijl je kiest."
        code={`<MultiCombobox
  label="Artiesten in je mix"
  options={artists}
  value={chosen}
  onChange={setChosen}
  max={5}
/>`}
        a11y={['Een combobox met een listbox die aria-multiselectable is; elke optie meldt aria-selected.', 'Enter zet de actieve optie aan of uit, Backspace in een leeg veld haalt het laatste label weg, Escape sluit en wist daarna de zoektekst.', 'De gekozen items worden met het veld voorgelezen ("Gekozen: John Coltrane, Nina Simone") en verwijderen wordt gemeld.', 'Met name gaat elke waarde mee in een formulier.']}>
        <MultiDemo />
      </Example>

      <Example id="bereik" api={['RangeSlider']} name="RangeSlider" intro="Een bereik met twee duimen, zoals jaren of een prijs. Streepjes eronder laten zien waar je zit."
        code={`<RangeSlider
  label="Uitgebracht"
  min={1950}
  max={2025}
  value={years}
  onValueChange={setYears}
  onValueCommit={search}   // pas zoeken bij loslaten
  marks={[{ value: 1950, label: '1950' }, 1960, 1970]}
/>`}
        a11y={['Twee native range-inputs: pijltjes, Home, End en PageUp werken zoals de browser ze kent.', 'Elke duim heet naar het label: "Uitgebracht, van" en "Uitgebracht, tot", met een leesbare aria-valuetext.', 'De duimen kunnen elkaar niet passeren; minDistance houdt ruimte tussen ze.']}>
        <RangeDemo />
      </Example>

      <Example id="datum" api={['DatePicker', 'Calendar']} name="DatePicker en Calendar" intro="Een datum typen zoals je hem zegt, of kiezen in een kalender. Werkdagen, een eerste en een laatste dag beperk je met min, max en isDateUnavailable."
        code={`<DatePicker
  label="Bezorgdatum"
  value={date}              // "2024-03-15", zoals <input type="date">
  onValueChange={setDate}
  min={today}
  isDateUnavailable={isWeekend}
/>
<Calendar value={date} onValueChange={setDate} />`}
        a11y={['Typen werkt in de volgorde van de taal, met elk scheidingsteken: 15-9-1957, 15/09/57.', 'De kalenderknop opent een dialog; de focus gaat naar de gekozen of eerste dag, Escape zet hem terug op de knop, Alt + pijl omlaag opent hem vanuit het veld.', 'De kalender is een grid: pijltjes per dag en week, PageUp en PageDown per maand, met Shift per jaar. Elke dag heet voluit ("vrijdag 15 maart 2024").', 'Vandaag heeft aria-current="date"; onbeschikbare dagen aria-disabled en een doorhaling, dus niet alleen kleur.']}>
        <DateDemo />
      </Example>

      <Example id="periode" api={['DateRangePicker', 'RangeCalendar']} name="DateRangePicker en RangeCalendar" intro="Een periode, zoals een verblijf of een rapportmaand: twee velden die je kunt typen en één kalender waarin je het begin en het eind aanwijst."
        code={`<DateRangePicker
  label="Verblijf"
  value={stay}              // { start: '2024-07-12', end: '2024-07-16' }
  onValueChange={setStay}
  startName="aankomst"
  endName="vertrek"
/>
<RangeCalendar value={period} onValueChange={setPeriod} />`}
        a11y={['De twee velden heten naar het label: "Verblijf, van" en "Verblijf, tot".', 'In de kalender is de eerste dag het begin en de tweede het eind, in welke volgorde ook; tijdens het kiezen tonen hover en pijltjes de periode al.', 'Elke dag in de periode is aria-selected; begin en eind zijn ook zonder kleur te herkennen aan hun vorm.', 'Een getypt eind voor het begin wordt omgedraaid in plaats van geweigerd.']}>
        <PeriodDemo />
      </Example>

      <Example id="account" api={['PasswordField', 'TextArea']} name="PasswordField en een meegroeiende TextArea" intro="Een wachtwoord dat je kunt laten zien in plaats van twee keer te typen, en een tekstveld dat meegroeit met wat je schrijft."
        code={`<PasswordField label="Nieuw wachtwoord" autoComplete="new-password" hint="Minstens 12 tekens." />
<TextArea label="Over jouw collectie" autoResize rows={2} maxRows={8} />`}
        a11y={['De oogknop is een toggle met aria-pressed en blijft in de tabvolgorde.', 'Wachtwoordbeheerders blijven werken: het veld is een gewone input met autocomplete.', 'TextArea groeit tot maxRows en scrolt daarna; zonder JavaScript is het een gewone textarea.']}>
        <AccountDemo />
      </Example>

      <Example id="bestanden" api={['FileField']} name="FileField" intro="Sleep foto's op het vlak of kies ze. Verkeerde typen, te grote bestanden en te veel tegelijk worden met een reden geweigerd; foto's krijgen een voorbeeld."
        code={`<FileField
  label="Foto's van de hoes"
  accept="image/jpeg,image/png"
  multiple
  maxFiles={4}
  maxSize={5_000_000}
  value={files}
  onFilesChange={setFiles}
/>`}
        a11y={['Onder het vlak ligt een echte <input type="file">: klikken, het toetsenbord, schermlezers en formulieren werken zoals altijd.', 'Gesleepte en verwijderde bestanden worden teruggeschreven naar de input, dus een gewoon formulier stuurt precies wat je ziet.', 'Geweigerde bestanden worden voorgelezen met hun reden.', 'Na verwijderen gaat de focus naar het volgende bestand, of terug naar het veld.']}>
        <FileDemo />
      </Example>

      <Example id="meerkeuze" api={['CheckboxGroup', 'Checkbox', 'ToggleGroup', 'Toggle']} name="CheckboxGroup, ToggleGroup en Alles selecteren" intro="Meerdere keuzes met een gedeelde hint en fout, een vak dat half aangevinkt kan zijn, en filters die je aan en uit zet."
        code={`<Checkbox label="Alle formaten" checked={all} indeterminate={some && !all} />
<CheckboxGroup legend="Formaten" appearance="card" value={v} onValueChange={setV} options={…} />
<ToggleGroup label="Genres" options={genres} value={g} onValueChange={setG} />`}
        a11y={['indeterminate is de native eigenschap: schermlezers zeggen "half aangevinkt".', 'CheckboxGroup is een fieldset met legend; fout en hint hangen aan de groep.', 'ToggleGroup is één tabstop: pijltjes bewegen, Spatie of Enter drukt in (aria-pressed).', 'Ingedrukt krijgt een vinkje, dus de stand rust niet alleen op kleur.']}>
        <ChoicesDemo />
      </Example>

      <Example id="structuur-plus" api={['Accordion', 'Tabs']} name="Accordion en verticale Tabs" intro="Vragen en antwoorden die elkaar dichtvouwen, en tabs in een kolom voor instellingen. Op smalle schermen staan de tabs boven het paneel."
        code={`<Accordion type="single">
  <Disclosure summary="Hoe lang duurt verzending?" defaultOpen>…</Disclosure>
  <Disclosure summary="Kan ik een plaat terugsturen?">…</Disclosure>
</Accordion>

<Tabs defaultValue="profiel" orientation="vertical" activation="manual">…</Tabs>`}
        a11y={['Elke sectie blijft een native <details>: zoeken in de pagina opent hem gewoon.', 'In type="single" vouwt de open sectie dicht met dezelfde animatie als een klik.', 'Verticale tabs hebben aria-orientation="vertical" en gebruiken pijl omhoog en omlaag.', 'activation="manual": pijltjes verplaatsen alleen de focus en Enter opent, handig als een paneel traag laadt.']}>
        <StructureDemo />
      </Example>

      <Example id="sorteren" api={['SortHeader', 'EmptyState']} name="Sorteerbare tabel en EmptyState" intro="Kolommen die sorteren met een klik, een selectie met Alles selecteren, en een lege toestand met een uitweg als je zoekopdracht niets vindt."
        code={`const sort = useTableSort<'titel' | 'jaar'>();

<thead><tr>
  <SortHeader {...sort.headerProps('titel')}>Titel</SortHeader>
  <SortHeader {...sort.headerProps('jaar')} align="end">Jaar</SortHeader>
</tr></thead>
<tbody>{sort.sortRows(rows, (row, key) => row[key]).map(…)}</tbody>

<EmptyState title="Geen platen gevonden" action={<Button>Wissen</Button>} />`}
        a11y={['De kolomkop houdt aria-sort; de knop erin draagt alleen de naam, dus de stand wordt met de kolom voorgelezen.', 'Tekst sorteert in de taal van de app, met getallen op volgorde (Album 2 voor Album 10).', 'EmptyState heeft een echte kop op het niveau dat je kiest (headingLevel).']}>
        <SortDemo />
      </Example>

      <Example id="toast-voortgang" name="Toast met voortgang" intro="Een melding die laat zien dat iets loopt en op dezelfde plek verandert in het resultaat. Met update pas je een melding ook zelf aan."
        code={`const { promise, update } = useToast();

promise(syncDiscogs(), {
  loading: { title: 'Discogs synchroniseren…' },
  success: (n) => ({ title: 'Collectie bijgewerkt', description: \`\${n} nieuwe platen.\` }),
  error: { title: 'Synchronisatie mislukt' },
});`}
        a11y={['De live region meldt ook veranderde tekst, dus het resultaat wordt voorgelezen zonder een tweede melding.', 'Laden blijft staan tot de promise klaar is; een fout blijft staan tot je hem sluit.', 'Na update begint de tijd opnieuw, zodat een nieuw resultaat niet meteen verdwijnt.']}>
        <ToastPromiseDemo />
      </Example>

      <Example id="details" api={['Separator']} name="Kbd, Separator en EmptyState" intro="Kleine onderdelen die op de server blijven: toetsen, lijnen tussen groepen en een lege toestand. Ze voegen geen JavaScript toe."
        code={`<Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
<Separator />
<Separator orientation="vertical" />
<Separator label="of" />
<EmptyState title="Nog geen luisterlijst" action={<Button>Plaat bewaren</Button>} />`}
        a11y={['Kbd is een native <kbd>.', 'Separator is standaard decoratief; met decorative={false} wordt het een echte separator met aria-orientation.', 'Het woord in een Separator met label wordt voorgelezen.']}>
        <DetailsDemo />
      </Example>
    </>
  );
}
