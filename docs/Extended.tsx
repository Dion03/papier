import { useState } from 'react';
import {
  Calendar, DatePicker, DateRangePicker, MultiCombobox, RangeCalendar, RangeSlider, type ComboboxOption, type DateRange,
  Accordion, Button, Checkbox, CheckboxGroup, Disclosure, EmptyState, FileField, Kbd, Menu, NumberField, PasswordField, Popover,
  Separator, SortHeader, Tab, TabList, TabPanel, Table, Tabs, Tag, Text, TextArea, TextField, ToggleGroup, icons, useTableSort, useToast,
} from '@dionbm/papier';
import { Example } from './Example';

type Genre = 'jazz' | 'pop' | 'soul' | 'classical';
const genres: Array<{ value: Genre; label: string }> = [
  { value: 'jazz', label: 'Jazz' }, { value: 'pop', label: 'Pop' }, { value: 'soul', label: 'Soul' }, { value: 'classical', label: 'Classical' },
];

function PopoverDemo() {
  const [applied, setApplied] = useState<{ genres: Genre[]; from: number | null }>({ genres: ['jazz'], from: 1960 });
  const [draft, setDraft] = useState(applied);
  return (
    <div className="doc-stack">
      <div className="doc-row">
        <Popover title="Filter the crate" onOpenChange={(open) => { if (open) setDraft(applied); }}
          trigger={<Button variant="secondary" iconStart={<icons.Search />}>Filters{applied.genres.length > 0 && ` (${applied.genres.length})`}</Button>}>
          {({ close }) => (
            <div className="doc-stack">
              <CheckboxGroup legend="Genre" options={genres} value={draft.genres} onValueChange={(g) => setDraft({ ...draft, genres: g })} orientation="horizontal" />
              <NumberField label="Released from" min={1900} max={2026} step={10} value={draft.from}
                onValueChange={(from) => setDraft({ ...draft, from })} formatOptions={{ useGrouping: false }} />
              <div className="doc-row">
                <Button size="sm" onClick={() => { setApplied(draft); close(); }}>Apply</Button>
                <Button size="sm" variant="ghost" onClick={() => setDraft({ genres: [], from: null })}>Clear</Button>
              </div>
            </div>
          )}
        </Popover>
        <Popover label="About the crate" side="right" trigger={<Button variant="ghost" iconStart={<icons.Info />}>What is this?</Button>}>
          <Text variant="small" as="p">The crate only shows records you own. Records on loan are greyed out.</Text>
        </Popover>
      </div>
      <Text variant="small" tone="muted" role="status">
        {applied.genres.length ? `Showing ${applied.genres.join(', ')}` : 'Showing all genres'}{applied.from ? `, from ${applied.from}.` : '.'}
      </Text>
    </div>
  );
}

function MenuChoicesDemo() {
  const [sort, setSort] = useState<'artiest' | 'jaar' | 'recent'>('artiest');
  const [covers, setCovers] = useState(true);
  const [lent, setLent] = useState(false);
  const label = { artiest: 'Artist', jaar: 'Year', recent: 'Last played' };
  return (
    <div className="doc-stack">
      <div className="doc-row">
        <Menu trigger={<>View <icons.ChevronDown /></>} items={[
          { type: 'label', label: 'Sort by' },
          ...(['artiest', 'jaar', 'recent'] as const).map((k) => ({ type: 'radio' as const, label: label[k], checked: sort === k, onSelect: () => setSort(k) })),
          { type: 'separator' },
          { type: 'label', label: 'Show' },
          { type: 'checkbox', label: 'Sleeves', checked: covers, keepOpen: true, onSelect: () => setCovers((c) => !c) },
          { type: 'checkbox', label: 'Records on loan', checked: lent, keepOpen: true, onSelect: () => setLent((c) => !c) },
          { type: 'separator' },
          { label: 'View on Discogs', icon: <icons.External />, href: 'https://www.discogs.com', target: '_blank' },
          { label: 'Copy list', icon: <icons.Copy />, shortcut: 'Ctrl C', onSelect: () => {} },
        ]} />
      </div>
      <Text variant="small" tone="muted" role="status">Sorted by {label[sort].toLowerCase()}, sleeves {covers ? 'on' : 'off'}, records on loan {lent ? 'shown' : 'hidden'}.</Text>
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
      <NumberField label="Number of copies" min={1} max={10} value={count} onValueChange={setCount} hint="At most ten per order." />
      <NumberField label="Price per record" min={0} step={0.5} value={price} onValueChange={setPrice} formatOptions={{ style: 'currency', currency: 'EUR' }} />
      <NumberField label="Discount" min={0} max={0.5} step={0.05} value={discount} onValueChange={setDiscount} formatOptions={{ style: 'percent' }} hideStepper
        hint="Type a percentage, for example 15." />
      <Text variant="small" tone="muted" role="status">Total: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(total)}</Text>
    </div>
  );
}

const artists: ComboboxOption[] = [
  { value: 'froukje', label: 'Froukje', description: 'Dutch pop' },
  { value: 'coltrane', label: 'John Coltrane', description: 'Jazz' },
  { value: 'bjork', label: 'Björk', description: 'Electronic' },
  { value: 'davis', label: 'Miles Davis', description: 'Jazz' },
  { value: 'fleetwood', label: 'Fleetwood Mac', description: 'Rock' },
  { value: 'radiohead', label: 'Radiohead', description: 'Rock' },
  { value: 'simone', label: 'Nina Simone', description: 'Soul and jazz' },
  { value: 'franklin', label: 'Aretha Franklin', description: 'Soul' },
];

function MultiDemo() {
  const [chosen, setChosen] = useState<string[]>(['coltrane', 'simone']);
  return (
    <div className="doc-stack doc-narrow">
      <MultiCombobox label="Artists in your mix" options={artists} value={chosen} onValueChange={setChosen} max={5}
        placeholder="Search for an artist" hint="At most five. Backspace removes the last one." />
      <Text variant="small" tone="muted" role="status">{chosen.length} of 5 selected.</Text>
    </div>
  );
}

function RangeDemo() {
  const [years, setYears] = useState<[number, number]>([1957, 1977]);
  const [price, setPrice] = useState<[number, number]>([15, 40]);
  const euro = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  return (
    <div className="doc-stack doc-narrow">
      <RangeSlider label="Released" min={1950} max={2025} value={years} onValueChange={setYears} minDistance={1}
        marks={[{ value: 1950, label: '1950' }, 1960, 1970, 1980, 1990, 2000, 2010, { value: 2025, label: '2025' }]} />
      <RangeSlider label="Price" min={0} max={100} step={5} value={price} onValueChange={setPrice} formatValue={euro} minDistance={5} />
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
        <DatePicker label="Release date" value={release} onValueChange={setRelease} hint="Type for example 15/9/1957 or pick a date in the calendar." />
        <DatePicker label="Delivery date" value={delivery} onValueChange={setDelivery} min={iso(today)} max={iso(max)} isDateUnavailable={weekend}
          hint="On weekdays, within two months." />
        <Text variant="small" tone="muted" role="status">{release ? `Release: ${release}` : 'No release date.'}</Text>
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
        <DateRangePicker label="Record fair, stay" value={stay} onValueChange={setStay} hint="Arrival and departure." startName="aankomst" endName="vertrek" />
        <Text variant="small" tone="muted" role="status">{stay?.end ? `${nights} ${nights === 1 ? 'night' : 'nights'}.` : 'Also pick a departure date.'}</Text>
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
      <PasswordField label="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
        hint="At least 12 characters. A sentence works well." error={short ? `${12 - password.length} more characters needed.` : undefined} />
      <TextArea label="About your collection" autoResize rows={2} maxRows={8} placeholder="The field grows as you type." />
    </div>
  );
}

function FileDemo() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="doc-stack doc-narrow">
      <FileField label="Photos of the sleeve" hint="JPG or PNG, up to 5 MB per photo and four photos." accept="image/jpeg,image/png" multiple maxFiles={4}
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
      <Checkbox label="All formats" checked={formats.length === all.length} indeterminate={formats.length > 0 && formats.length < all.length}
        onChange={(e) => setFormats(e.target.checked ? all : [])} />
      <CheckboxGroup legend="Formats" appearance="card" value={formats} onValueChange={setFormats} options={[
        { value: 'lp', label: 'LP', description: 'Long player, 33 rpm' },
        { value: 'ep', label: 'EP', description: 'Four to six tracks' },
        { value: 'single', label: 'Single', description: '7 inch, 45 rpm' },
      ]} error={formats.length === 0 ? 'Pick at least one format.' : undefined} />
      <ToggleGroup label="Genres" options={genres} value={filters} onValueChange={setFilters} />
      <Text variant="small" tone="muted" role="status">{filters.length ? `Genres: ${filters.join(', ')}.` : 'No genre selected.'}</Text>
    </div>
  );
}

function StructureDemo() {
  return (
    <div className="doc-stack">
      <Accordion type="single">
        <Disclosure summary="How long does shipping take?" defaultOpen><p>Within two working days, in a sturdy record mailer.</p></Disclosure>
        <Disclosure summary="Can I return a record?"><p>Within thirty days, as long as the record has not been played.</p></Disclosure>
        <Disclosure summary="How do you grade condition?"><p>On the Goldmine scale, from Mint to Poor.</p></Disclosure>
      </Accordion>
      <Tabs defaultValue="profiel" orientation="vertical">
        <TabList label="Settings">
          <Tab value="profiel">Profile</Tab>
          <Tab value="meldingen">Notifications</Tab>
          <Tab value="privacy">Privacy</Tab>
        </TabList>
        <TabPanel value="profiel"><Text tone="muted">Your name and how others see your collection.</Text></TabPanel>
        <TabPanel value="meldingen"><Text tone="muted">Emails about new pressings and price drops.</Text></TabPanel>
        <TabPanel value="privacy"><Text tone="muted">Who can see your listening history.</Text></TabPanel>
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
      <div className="doc-narrow"><TextField label="Search the collection" hideLabel type="search" placeholder="Search by title or artist" prefix={<icons.Search />}
        value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {rows.length === 0
        ? <EmptyState title="No records found" description={`Nothing in your collection matches "${query}". Check the spelling or search by artist.`}
            icon={<icons.Search />} action={<Button variant="secondary" size="sm" onClick={() => setQuery('')}>Clear search</Button>} />
        : (
          <Table caption="Your collection, sortable (sample data)" showCaption>
            <thead><tr>
              <th scope="col" className="doc-select-cell"><Checkbox label={<span className="pp-visually-hidden">Select all visible records</span>} checked={allChecked}
                indeterminate={someChecked && !allChecked} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.titel) : [])} /></th>
              <SortHeader {...sort.headerProps('titel')}>Title</SortHeader>
              <SortHeader {...sort.headerProps('artiest')}>Artist</SortHeader>
              <SortHeader {...sort.headerProps('jaar')} align="end">Year</SortHeader>
              <SortHeader {...sort.headerProps('keer')} align="end">Plays</SortHeader>
            </tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.titel}>
                <td className="doc-select-cell"><Checkbox label={<span className="pp-visually-hidden">Select {r.titel}</span>} checked={selected.includes(r.titel)}
                  onChange={(e) => setSelected((s) => (e.target.checked ? [...s, r.titel] : s.filter((t) => t !== r.titel)))} /></td>
                <th scope="row">{r.titel}</th><td>{r.artiest}</td><td className="pp-num">{r.jaar}</td><td className="pp-num">{r.keer}</td>
              </tr>
            ))}</tbody>
          </Table>
        )}
      <Text variant="small" tone="muted" role="status">{selected.length ? `${selected.length} selected.` : 'Nothing selected.'}</Text>
    </div>
  );
}

function ToastPromiseDemo() {
  const { promise, toast, update } = useToast();
  const sync = (fail: boolean) => promise(
    new Promise<number>((done, reject) => window.setTimeout(() => (fail ? reject(new Error('offline')) : done(3)), 1400)),
    {
      loading: { title: 'Syncing with Discogs…' },
      success: (n) => ({ title: 'Collection updated', description: `${n} new records added.` }),
      error: { title: 'Sync failed', description: 'Could not connect to Discogs.' },
    },
  ).catch(() => {});
  return (
    <div className="doc-row">
      <Button onClick={() => sync(false)}>Sync</Button>
      <Button variant="secondary" onClick={() => sync(true)}>Make it fail</Button>
      <Button variant="ghost" onClick={() => {
        const id = toast({ tone: 'info', title: 'Side A is playing', duration: Infinity });
        window.setTimeout(() => update(id, { tone: 'success', title: 'Side A has finished', description: 'Flip the record for side B.', duration: 5000 }), 1800);
      }}>Show and update</Button>
    </div>
  );
}

function DetailsDemo() {
  return (
    <div className="doc-stack doc-narrow">
      <Text>Search everywhere with <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>, and jump to the next record with <Kbd>J</Kbd>.</Text>
      <Separator />
      <div className="doc-row"><Tag tone="sage">Jazz</Tag><Separator orientation="vertical" /><Tag tone="outline">1957</Tag><Separator orientation="vertical" /><Tag tone="outline">Blue Note</Tag></div>
      <Button fullWidth variant="ink">Sign in with your email address</Button>
      <Separator label="or" />
      <Button fullWidth variant="secondary">Sign in with Discogs</Button>
      <EmptyState size="sm" headingLevel={3} title="No listening list yet" description="Save records you still want to hear."
        icon={<icons.Play />} action={<Button size="sm">Save a record</Button>} />
    </div>
  );
}

/** Components added in 0.5: overlays, form inputs, structure and data helpers. */
export function ExtendedExamples() {
  return (
    <>
      <Example id="popover" api={['Popover']} name="Popover" intro="A panel next to the button for something to work in: filters, a short form, an explanation. Not modal: the rest of the page stays usable."
        code={`<Popover title="Filter the crate" trigger={<Button variant="secondary">Filters</Button>}>
  {({ close }) => (
    <>
      <CheckboxGroup legend="Genre" options={genres} value={g} onValueChange={setG} />
      <Button onClick={() => { apply(); close(); }}>Apply</Button>
    </>
  )}
</Popover>`}
        a11y={['The button gets aria-haspopup="dialog", aria-expanded and aria-controls; the panel is a named dialog.', 'On opening, focus moves to the first field; Escape closes the panel and returns focus to the button.', 'A click or focus outside the panel closes it. The panel sits directly after the button in the DOM, so Tab moves into it naturally.', 'It opens in the top layer and flips at the edge of the screen, just like Menu.']}>
        <PopoverDemo />
      </Example>

      <Example id="menu-keuzes" api={['Menu']} name="Menu with groups and choices" intro="The same action menu, now with headings, separators, checkable choices, links and shortcuts. Existing menus work unchanged."
        code={`<Menu trigger="View" items={[
  { type: 'label', label: 'Sort by' },
  { type: 'radio', label: 'Artist', checked: sort === 'artiest', onSelect: () => setSort('artiest') },
  { type: 'separator' },
  { type: 'checkbox', label: 'Sleeves', checked: covers, keepOpen: true, onSelect: toggle },
  { label: 'View on Discogs', href: 'https://discogs.com', target: '_blank' },
  { label: 'Copy list', shortcut: 'Ctrl C', onSelect: copy },
]} />`}
        a11y={['Choices are menuitemradio and menuitemcheckbox with aria-checked; the check mark is decorative.', 'A heading names its group (role="group" with aria-labelledby).', 'Typing a letter jumps to the next item that starts with it.', 'Links are real <a> elements: middle-click and "open in new tab" work.']}>
        <MenuChoicesDemo />
      </Example>

      <Example id="getallen" api={['NumberField']} name="NumberField" intro="A number with − and + beside it. Reads what you type in the app's locale (24.95) and formats it as an amount or percentage as soon as you leave the field."
        code={`<NumberField label="Number of copies" min={1} max={10} value={n} onValueChange={setN} />
<NumberField label="Price per record" step={0.5}
  formatOptions={{ style: 'currency', currency: 'EUR' }} />
<NumberField label="Discount" max={0.5} formatOptions={{ style: 'percent' }} hideStepper />`}
        a11y={['The field is a spinbutton with aria-valuenow, -min, -max and a readable aria-valuetext ("€24.95").', 'Arrow up and down step, PageUp and PageDown take ten steps, Home and End go to min and max.', 'The buttons are not in the tab order (the keyboard has the arrows) but are named for screen readers. Holding a button down keeps stepping.', 'With name, the raw value is submitted with a form.']}>
        <NumberDemo />
      </Example>

      <Example id="meerdere" api={['MultiCombobox']} name="MultiCombobox" intro="Multiple choices from a long list, filtered as you type. Selected items appear as tags in the field; the list stays open while you choose."
        code={`<MultiCombobox
  label="Artists in your mix"
  options={artists}
  value={chosen}
  onValueChange={setChosen}
  max={5}
/>`}
        a11y={['A combobox with a listbox that is aria-multiselectable; each option reports aria-selected.', 'Enter toggles the active option, Backspace in an empty field removes the last tag, Escape closes the list and then clears the search text.', 'The selected items are announced with the field ("Selected: John Coltrane, Nina Simone") and removals are announced.', 'With name, each value is submitted with a form.']}>
        <MultiDemo />
      </Example>

      <Example id="bereik" api={['RangeSlider']} name="RangeSlider" intro="A range with two thumbs, such as years or a price. Marks underneath show where you are."
        code={`<RangeSlider
  label="Released"
  min={1950}
  max={2025}
  value={years}
  onValueChange={setYears}
  onValueCommit={search}   // only search on release
  marks={[{ value: 1950, label: '1950' }, 1960, 1970]}
/>`}
        a11y={['Two native range inputs: arrows, Home, End and PageUp work the way the browser handles them.', 'Each thumb is named after the label: "Released, from" and "Released, to", with a readable aria-valuetext.', 'The thumbs cannot pass each other; minDistance keeps space between them.']}>
        <RangeDemo />
      </Example>

      <Example id="datum" api={['DatePicker', 'Calendar']} name="DatePicker and Calendar" intro="Type a date the way you say it, or pick one in a calendar. Limit it to weekdays, or to a first and last day, with min, max and isDateUnavailable."
        code={`<DatePicker
  label="Delivery date"
  value={date}              // "2024-03-15", like <input type="date">
  onValueChange={setDate}
  min={today}
  isDateUnavailable={isWeekend}
/>
<Calendar value={date} onValueChange={setDate} />`}
        a11y={['Typing follows the order of the locale, with any separator: 15/9/1957, 15-09-57.', 'The calendar button opens a dialog; focus moves to the selected or first day, Escape returns it to the button, and Alt + arrow down opens it from the field.', 'The calendar is a grid: arrows move by day and week, PageUp and PageDown by month, and with Shift by year. Each day has its full name ("Friday 15 March 2024").', 'Today has aria-current="date"; unavailable days have aria-disabled and a strikethrough, so they do not rely on colour alone.']}>
        <DateDemo />
      </Example>

      <Example id="periode" api={['DateRangePicker', 'RangeCalendar']} name="DateRangePicker and RangeCalendar" intro="A period, such as a stay or a reporting month: two fields you can type in and one calendar where you point out the start and the end."
        code={`<DateRangePicker
  label="Stay"
  value={stay}              // { start: '2024-07-12', end: '2024-07-16' }
  onValueChange={setStay}
  startName="aankomst"
  endName="vertrek"
/>
<RangeCalendar value={period} onValueChange={setPeriod} />`}
        a11y={['The two fields are named after the label: "Stay, from" and "Stay, to".', 'In the calendar the first day picked is the start and the second the end, in either order; while choosing, hover and arrows already show the period.', 'Each day in the period is aria-selected; start and end can also be recognised by their shape, without colour.', 'A typed end before the start is swapped instead of rejected.']}>
        <PeriodDemo />
      </Example>

      <Example id="account" api={['PasswordField', 'TextArea']} name="PasswordField and an auto-growing TextArea" intro="A password you can reveal instead of typing it twice, and a text field that grows with what you write."
        code={`<PasswordField label="New password" autoComplete="new-password" hint="At least 12 characters." />
<TextArea label="About your collection" autoResize rows={2} maxRows={8} />`}
        a11y={['The eye button is a toggle with aria-pressed and stays in the tab order.', 'Password managers keep working: the field is a regular input with autocomplete.', 'TextArea grows up to maxRows and scrolls after that; without JavaScript it is a regular textarea.']}>
        <AccountDemo />
      </Example>

      <Example id="bestanden" api={['FileField']} name="FileField" intro="Drag photos onto the area or choose them. Wrong types, files that are too large and too many at once are rejected with a reason; photos get a preview."
        code={`<FileField
  label="Photos of the sleeve"
  accept="image/jpeg,image/png"
  multiple
  maxFiles={4}
  maxSize={5_000_000}
  value={files}
  onFilesChange={setFiles}
/>`}
        a11y={['A real <input type="file"> sits under the area: clicking, the keyboard, screen readers and forms work as always.', 'Dropped and removed files are written back to the input, so a plain form submits exactly what you see.', 'Rejected files are announced with their reason.', 'After a removal, focus moves to the next file, or back to the field.']}>
        <FileDemo />
      </Example>

      <Example id="meerkeuze" api={['CheckboxGroup', 'Checkbox', 'ToggleGroup', 'Toggle']} name="CheckboxGroup, ToggleGroup and Select all" intro="Multiple choices with a shared hint and error, a box that can be partly checked, and filters you switch on and off."
        code={`<Checkbox label="All formats" checked={all} indeterminate={some && !all} />
<CheckboxGroup legend="Formats" appearance="card" value={v} onValueChange={setV} options={…} />
<ToggleGroup label="Genres" options={genres} value={g} onValueChange={setG} />`}
        a11y={['indeterminate is the native property: screen readers announce it as "mixed" or "partially checked".', 'CheckboxGroup is a fieldset with a legend; the error and hint are attached to the group.', 'ToggleGroup is a single tab stop: arrows move, Space or Enter presses (aria-pressed).', 'A pressed toggle gets a check mark, so its state does not rely on colour alone.']}>
        <ChoicesDemo />
      </Example>

      <Example id="structuur-plus" api={['Accordion', 'Tabs']} name="Accordion and vertical Tabs" intro="Questions and answers that close each other, and tabs in a column for settings. On narrow screens the tabs sit above the panel."
        code={`<Accordion type="single">
  <Disclosure summary="How long does shipping take?" defaultOpen>…</Disclosure>
  <Disclosure summary="Can I return a record?">…</Disclosure>
</Accordion>

<Tabs defaultValue="profiel" orientation="vertical" activation="manual">…</Tabs>`}
        a11y={['Each section stays a native <details>: find in page simply opens it.', 'In type="single" the open section closes with the same animation as a click.', 'Vertical tabs have aria-orientation="vertical" and use arrow up and down.', 'activation="manual": arrows only move focus and Enter opens, useful when a panel loads slowly.']}>
        <StructureDemo />
      </Example>

      <Example id="sorteren" api={['SortHeader', 'EmptyState']} name="Sortable table and EmptyState" intro="Columns that sort with a click, a selection with Select all, and an empty state with a way out when your search finds nothing."
        code={`const sort = useTableSort<'titel' | 'jaar'>();

<thead><tr>
  <SortHeader {...sort.headerProps('titel')}>Title</SortHeader>
  <SortHeader {...sort.headerProps('jaar')} align="end">Year</SortHeader>
</tr></thead>
<tbody>{sort.sortRows(rows, (row, key) => row[key]).map(…)}</tbody>

<EmptyState title="No records found" action={<Button>Clear</Button>} />`}
        a11y={['The column header holds aria-sort; the button inside carries only the name, so the sort state is announced with the column.', 'Text sorts in the language of the app, with numbers in order (Album 2 before Album 10).', 'EmptyState has a real heading at the level you choose (headingLevel).']}>
        <SortDemo />
      </Example>

      <Example id="toast-voortgang" name="Toast with progress" intro="A notification that shows something is in progress and turns into the result in the same place. With update you can also change a notification yourself."
        code={`const { promise, update } = useToast();

promise(syncDiscogs(), {
  loading: { title: 'Syncing with Discogs…' },
  success: (n) => ({ title: 'Collection updated', description: \`\${n} new records.\` }),
  error: { title: 'Sync failed' },
});`}
        a11y={['The live region also announces changed text, so the result is read out without a second notification.', 'Loading stays until the promise settles; an error stays until you close it.', 'After update the timer restarts, so a new result does not disappear straight away.']}>
        <ToastPromiseDemo />
      </Example>

      <Example id="details" api={['Separator']} name="Kbd, Separator and EmptyState" intro="Small parts that stay on the server: keys, lines between groups and an empty state. They add no JavaScript."
        code={`<Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
<Separator />
<Separator orientation="vertical" />
<Separator label="or" />
<EmptyState title="No listening list yet" action={<Button>Save a record</Button>} />`}
        a11y={['Kbd is a native <kbd>.', 'Separator is decorative by default; with decorative={false} it becomes a real separator with aria-orientation.', 'The word in a Separator with a label is read out.']}>
        <DetailsDemo />
      </Example>
    </>
  );
}
