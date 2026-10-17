import { useState } from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion, Button, Checkbox, CheckboxGroup, Disclosure, EmptyState, FileField, Kbd, Menu, NumberField, Papier, PasswordField,
  Popover, Separator, SortHeader, Tab, TabList, TabPanel, Table, Tabs, TextArea, ToastProvider, Toggle, ToggleGroup,
  acceptsFile, englishLabels, formatFileSize, parseNumber, useTableSort, useToast,
} from '../src';

describe('Popover', () => {
  it('opent met de knop, zet de focus in het paneel en Escape geeft hem terug', async () => {
    render(<Popover trigger={<Button>Filters</Button>} title="Filter de bak"><label>Jaar <input /></label></Popover>);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    const panel = screen.getByRole('dialog', { name: 'Filter de bak' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(screen.getByRole('textbox', { name: 'Jaar' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('een klik ernaast sluit, en de functie-children krijgen close', async () => {
    const onOpenChange = vi.fn();
    render(<><Popover trigger={<Button>Delen</Button>} label="Delen" onOpenChange={onOpenChange}>
      {({ close }) => <Button onClick={close}>Kopieer link</Button>}
    </Popover><p>Buiten</p></>);
    await userEvent.click(screen.getByRole('button', { name: 'Delen' }));
    expect(screen.getByRole('dialog', { name: 'Delen' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Buiten'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delen' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kopieer link' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false, true, false]);
  });

  it('behoudt de eigen onClick van de trigger', async () => {
    const own = vi.fn();
    render(<Popover trigger={<Button onClick={own}>Info</Button>} label="Info">Tekst</Popover>);
    await userEvent.click(screen.getByRole('button', { name: 'Info' }));
    expect(own).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('Menu (groepen, keuzes, links, typeahead)', () => {
  const setup = (onSort = vi.fn(), onToggle = vi.fn()) => render(
    <Menu trigger="Weergave" items={[
      { type: 'label', label: 'Sorteren' },
      { type: 'radio', label: 'Artiest', checked: true, onSelect: () => onSort('artiest') },
      { type: 'radio', label: 'Jaar', checked: false, onSelect: () => onSort('jaar') },
      { type: 'separator' },
      { type: 'checkbox', label: 'Toon hoezen', checked: true, keepOpen: true, onSelect: onToggle },
      { label: 'Bekijk op Discogs', href: 'https://discogs.com', target: '_blank' },
      { label: 'Wissen', tone: 'danger', shortcut: 'Del', onSelect: () => {} },
    ]} />,
  );

  it('heeft groepen met naam, een scheidingslijn en aangevinkte keuzes', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Weergave' }));
    expect(screen.getByRole('group', { name: 'Sorteren' })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Artiest' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Jaar' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Toon hoezen' })).toHaveAttribute('aria-checked', 'true');
    const link = screen.getByRole('menuitem', { name: 'Bekijk op Discogs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('menuitem', { name: /Wissen/ })).toHaveTextContent('Del');
  });

  it('keepOpen houdt het menu open; een gewone keuze sluit het', async () => {
    const onSort = vi.fn();
    const onToggle = vi.fn();
    setup(onSort, onToggle);
    await userEvent.click(screen.getByRole('button', { name: 'Weergave' }));
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Toon hoezen' }));
    expect(onToggle).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Jaar' }));
    expect(onSort).toHaveBeenCalledWith('jaar');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('een letter springt naar het volgende item dat ermee begint', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    setup();
    const trigger = screen.getByRole('button', { name: 'Weergave' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemradio', { name: 'Artiest' })).toHaveFocus();
    await userEvent.keyboard('w');
    expect(screen.getByRole('menuitem', { name: /Wissen/ })).toHaveFocus();
    // Letters within half a second form one search ("wj"); move the clock so "j" starts a new one.
    vi.setSystemTime(Date.now() + 600);
    await userEvent.keyboard('j');
    expect(screen.getByRole('menuitemradio', { name: 'Jaar' })).toHaveFocus();
  });
});

describe('Checkbox en CheckboxGroup', () => {
  it('indeterminate zet de DOM-eigenschap en error zet aria-invalid', () => {
    const { rerender } = render(<Checkbox label="Alles" indeterminate error="Kies iets" />);
    const box = screen.getByRole('checkbox', { name: 'Alles' }) as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(/Kies iets/);
    rerender(<Checkbox label="Alles" />);
    expect(box.indeterminate).toBe(false);
  });

  it('geeft de gekozen waarden terug in de volgorde van de opties', async () => {
    const onChange = vi.fn();
    render(<CheckboxGroup legend="Formaten" name="formaat" onValueChange={onChange} hint="Kies er een of meer"
      options={[{ value: 'lp', label: 'LP' }, { value: 'ep', label: 'EP' }, { value: 'single', label: 'Single', disabled: true }]} />);
    expect(screen.getByRole('group', { name: 'Formaten' })).toHaveAccessibleDescription('Kies er een of meer');
    await userEvent.click(screen.getByRole('checkbox', { name: 'EP' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'LP' }));
    expect(onChange).toHaveBeenLastCalledWith(['lp', 'ep']);
    expect(screen.getByRole('checkbox', { name: 'Single' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'LP' })).toHaveAttribute('name', 'formaat');
  });
});

describe('NumberField', () => {
  it('leest getallen in de taal van de app', () => {
    expect(parseNumber('24,95', 'nl-NL')).toBe(24.95);
    expect(parseNumber('1.234,5', 'nl-NL')).toBe(1234.5);
    expect(parseNumber('24.95', 'nl-NL')).toBe(24.95);
    expect(parseNumber('1.234', 'nl-NL')).toBe(1234);
    expect(parseNumber('€ 1.250,00', 'nl-NL')).toBe(1250);
    expect(parseNumber('1,234.5', 'en-US')).toBe(1234.5);
    expect(parseNumber('-3', 'en-US')).toBe(-3);
    expect(parseNumber('25%', 'nl-NL', { style: 'percent' })).toBe(0.25);
    expect(parseNumber('', 'nl-NL')).toBeNull();
    expect(parseNumber('abc', 'nl-NL')).toBeNull();
  });

  it('pijltjes, PageUp, Home en End stappen binnen min en max', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Aantal" defaultValue={2} min={1} max={30} onValueChange={onChange} name="aantal" />);
    const input = screen.getByRole('spinbutton', { name: 'Aantal' });
    expect(input).toHaveValue('2');
    expect(input).toHaveAttribute('aria-valuenow', '2');
    expect(input).toHaveAttribute('aria-valuemin', '1');
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('3');
    await userEvent.keyboard('{PageUp}{PageUp}{PageUp}');
    expect(input).toHaveValue('30');
    await userEvent.keyboard('{Home}');
    expect(input).toHaveValue('1');
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(30);
    expect(screen.getByRole('button', { name: 'Verhogen' })).toBeDisabled();
    expect(document.querySelector('input[type="hidden"][name="aantal"]')).toHaveValue('30');
  });

  it('getypte tekst wordt bij verlaten gelezen, begrensd en opgemaakt', async () => {
    const onChange = vi.fn();
    render(<><NumberField label="Prijs" formatOptions={{ style: 'currency', currency: 'EUR' }} max={100} onValueChange={onChange} /><button>Verder</button></>);
    const input = screen.getByRole('spinbutton', { name: 'Prijs' });
    await userEvent.type(input, '24,95');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(24.95);
    expect((input as HTMLInputElement).value).toMatch(/24,95/);
    expect((input as HTMLInputElement).value).toMatch(/€/);
    await userEvent.clear(input);
    await userEvent.type(input, '250');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(100);
    await userEvent.clear(input);
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('de knoppen stappen op het raster van step', async () => {
    render(<NumberField label="Toeren" defaultValue={7} step={5} />);
    await userEvent.click(screen.getByRole('button', { name: 'Verhogen' }));
    expect(screen.getByRole('spinbutton')).toHaveValue('10');
    await userEvent.click(screen.getByRole('button', { name: 'Verlagen' }));
    expect(screen.getByRole('spinbutton')).toHaveValue('5');
  });

  it('gebruikt de locale van de labels', () => {
    render(<Papier labels={englishLabels}><NumberField label="Price" defaultValue={1234.5} /></Papier>);
    expect(screen.getByRole('spinbutton')).toHaveValue('1,234.5');
    expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
  });
});

describe('PasswordField en TextArea', () => {
  it('de knop toont het wachtwoord en meldt zijn stand', async () => {
    render(<PasswordField label="Wachtwoord" autoComplete="current-password" />);
    const input = screen.getByLabelText('Wachtwoord', { selector: 'input' });
    const toggle = screen.getByRole('button', { name: 'Wachtwoord tonen' });
    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('autoResize zet een hoogte bij typen', async () => {
    render(<TextArea label="Notities" autoResize maxRows={6} />);
    const area = screen.getByRole('textbox', { name: 'Notities' });
    await userEvent.type(area, 'Kant A{Enter}Kant B');
    expect(area).toHaveAttribute('data-autoresize');
    expect(area.style.height).toMatch(/px$/);
  });
});

describe('FileField', () => {
  const hoes = new File(['x'.repeat(2000)], 'hoes.jpg', { type: 'image/jpeg' });
  const scan = new File(['x'], 'scan.pdf', { type: 'application/pdf' });
  const groot = new File(['x'.repeat(5000)], 'groot.png', { type: 'image/png' });

  it('helpers: accept en bestandsgrootte', () => {
    expect(acceptsFile(hoes, 'image/*')).toBe(true);
    expect(acceptsFile(scan, 'image/*,.jpg')).toBe(false);
    expect(acceptsFile(scan, '.PDF')).toBe(true);
    expect(formatFileSize(2_400_000, 'nl-NL')).toMatch(/2,4\sMB/);
    expect(formatFileSize(840, 'en-US')).toMatch(/840\s?byte/);
  });

  it('weigert verkeerde typen en te grote bestanden met een melding', async () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();
    const user = userEvent.setup({ applyAccept: false });
    render(<FileField label="Hoezen" multiple accept="image/*" maxSize={3000} onFilesChange={onFiles} onReject={onReject} />);
    const input = screen.getByLabelText('Hoezen') as HTMLInputElement;
    await user.upload(input, [hoes, scan, groot]);
    expect(onFiles).toHaveBeenLastCalledWith([hoes]);
    expect(onReject.mock.calls[0][0].map((r: { reason: string }) => r.reason)).toEqual(['type', 'size']);
    expect(screen.getByRole('status')).toHaveTextContent('scan.pdf heeft een bestandstype dat hier niet kan.');
    expect(screen.getByRole('status')).toHaveTextContent(/groot\.png is groter dan 3\skB/);
    expect(screen.getByText('hoes.jpg')).toBeInTheDocument();
  });

  it('verwijderen zet de focus op het volgende bestand of het veld', async () => {
    render(<FileField label="Bijlagen" multiple defaultValue={[hoes, scan]} />);
    await userEvent.click(screen.getByRole('button', { name: 'hoes.jpg verwijderen' }));
    expect(screen.queryByText('hoes.jpg')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'scan.pdf verwijderen' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'scan.pdf verwijderen' }));
    expect(screen.getByLabelText('Bijlagen')).toHaveFocus();
  });

  it('zonder multiple vervangt een nieuw bestand het oude', async () => {
    const onFiles = vi.fn();
    render(<FileField label="Hoes" defaultValue={[hoes]} onFilesChange={onFiles} />);
    await userEvent.upload(screen.getByLabelText('Hoes'), scan);
    expect(onFiles).toHaveBeenLastCalledWith([scan]);
  });

  it('neemt een gesleept bestand aan', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileField label="Hoes" onFilesChange={onFiles} />);
    const zone = container.querySelector('.pp-file__zone')!;
    const dataTransfer = { files: [hoes], types: ['Files'], dropEffect: 'none' };
    fireEvent.dragEnter(zone, { dataTransfer });
    expect(zone).toHaveAttribute('data-dragging');
    fireEvent.drop(zone, { dataTransfer });
    expect(zone).not.toHaveAttribute('data-dragging');
    expect(onFiles).toHaveBeenLastCalledWith([hoes]);
  });
});

describe('Accordion', () => {
  it('single: een sectie openen vouwt de open sectie dicht', async () => {
    render(<Accordion type="single">
      <Disclosure summary="Verzending" defaultOpen>Binnen twee dagen.</Disclosure>
      <Disclosure summary="Retour">Dertig dagen.</Disclosure>
    </Accordion>);
    const [a, b] = Array.from(document.querySelectorAll('details'));
    expect(a.open).toBe(true);
    await userEvent.click(screen.getByText('Retour'));
    await waitFor(() => expect(b.open).toBe(true));
    await waitFor(() => expect(a.open).toBe(false));
  });

  it('multiple: secties openen los van elkaar', async () => {
    render(<Accordion>
      <Disclosure summary="Een" defaultOpen>1</Disclosure>
      <Disclosure summary="Twee">2</Disclosure>
    </Accordion>);
    const [a, b] = Array.from(document.querySelectorAll('details'));
    await userEvent.click(screen.getByText('Twee'));
    await waitFor(() => expect(b.open).toBe(true));
    expect(a.open).toBe(true);
  });
});

describe('Tabs (verticaal en handmatig)', () => {
  it('verticaal gebruikt pijl omlaag en zet aria-orientation', async () => {
    render(<Tabs defaultValue="a" orientation="vertical"><TabList label="Instellingen"><Tab value="a">Profiel</Tab><Tab value="b">Meldingen</Tab></TabList>
      <TabPanel value="a">A</TabPanel><TabPanel value="b">B</TabPanel></Tabs>);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    screen.getByRole('tab', { name: 'Profiel' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Meldingen' })).toHaveAttribute('aria-selected', 'true');
  });

  it('handmatig: pijlen verplaatsen alleen de focus, Enter kiest', async () => {
    render(<Tabs defaultValue="a" activation="manual"><TabList label="Weergave"><Tab value="a">Bak</Tab><Tab value="b">Lijst</Tab></TabList>
      <TabPanel value="a">A</TabPanel><TabPanel value="b">B</TabPanel></Tabs>);
    screen.getByRole('tab', { name: 'Bak' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    const lijst = screen.getByRole('tab', { name: 'Lijst' });
    expect(lijst).toHaveFocus();
    expect(lijst).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    expect(lijst).toHaveAttribute('aria-selected', 'true');
  });
});

describe('SortHeader en useTableSort', () => {
  const rows = [{ titel: 'Uitzinnig', jaar: 2022 }, { titel: 'blue train', jaar: 1957 }, { titel: 'Kind of Blue', jaar: 1959 }, { titel: 'Album 10', jaar: 2010 }, { titel: 'Album 2', jaar: 2002 }];
  function Platen() {
    const sort = useTableSort<'titel' | 'jaar'>();
    return (
      <Table caption="Platen">
        <thead><tr><SortHeader {...sort.headerProps('titel')}>Titel</SortHeader><SortHeader {...sort.headerProps('jaar')} align="end">Jaar</SortHeader></tr></thead>
        <tbody>{sort.sortRows(rows, (r, k) => r[k]).map((r) => <tr key={r.titel}><td>{r.titel}</td><td className="pp-num">{r.jaar}</td></tr>)}</tbody>
      </Table>
    );
  }
  const titles = () => Array.from(document.querySelectorAll('tbody tr td:first-child')).map((td) => td.textContent);

  it('klikken loopt van oplopend naar aflopend naar ongesorteerd, met aria-sort', async () => {
    render(<Platen />);
    const header = screen.getByRole('columnheader', { name: /Titel/ });
    expect(header).not.toHaveAttribute('aria-sort');
    await userEvent.click(screen.getByRole('button', { name: 'Titel' }));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(titles()).toEqual(['Album 2', 'Album 10', 'blue train', 'Kind of Blue', 'Uitzinnig']);
    await userEvent.click(screen.getByRole('button', { name: 'Titel' }));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(titles()[0]).toBe('Uitzinnig');
    await userEvent.click(screen.getByRole('button', { name: 'Titel' }));
    expect(header).not.toHaveAttribute('aria-sort');
    expect(titles()[0]).toBe('Uitzinnig');
    await userEvent.click(screen.getByRole('button', { name: 'Jaar' }));
    expect(titles()[0]).toBe('blue train');
  });
});

describe('Toast update en promise', () => {
  function Opslaan({ work }: { work: () => Promise<string> }) {
    const { promise } = useToast();
    return <Button onClick={() => { promise(work(), { loading: { title: 'Bezig met opslaan' }, success: (v) => ({ title: `Opgeslagen: ${v}` }), error: { title: 'Mislukt' } }).catch(() => {}); }}>Opslaan</Button>;
  }

  it('toont laden en daarna het resultaat op dezelfde plek', async () => {
    let resolve!: (v: string) => void;
    render(<ToastProvider><Opslaan work={() => new Promise((r) => { resolve = r; })} /></ToastProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'Opslaan' }));
    expect(screen.getByText('Bezig met opslaan')).toBeInTheDocument();
    expect(document.querySelectorAll('.pp-toasts__item')).toHaveLength(1);
    await act(async () => { resolve('Uitzinnig'); });
    expect(screen.getByText('Opgeslagen: Uitzinnig')).toBeInTheDocument();
    expect(document.querySelectorAll('.pp-toasts__item')).toHaveLength(1);
    expect(document.querySelector('.pp-notice')).toHaveAttribute('data-tone', 'success');
  });

  it('een fout blijft staan met de gevarentoon', async () => {
    render(<ToastProvider><Opslaan work={() => Promise.reject(new Error('x'))} /></ToastProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'Opslaan' }));
    await screen.findByText('Mislukt');
    expect(document.querySelector('.pp-notice')).toHaveAttribute('data-tone', 'danger');
  });

  it('update verandert een toast en start zijn timer opnieuw', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    function Demo() {
      const { toast, update } = useToast();
      const [id, setId] = useState(0);
      return <><Button onClick={() => setId(toast({ title: 'Een' }))}>Toon</Button><Button onClick={() => update(id, { title: 'Twee' })}>Wijzig</Button></>;
    }
    render(<ToastProvider><Demo /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Toon' }));
    act(() => { vi.advanceTimersByTime(4000); });
    fireEvent.click(screen.getByRole('button', { name: 'Wijzig' }));
    expect(screen.getByText('Twee')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByText('Twee')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.queryByText('Twee')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('Toggle en ToggleGroup', () => {
  it('Toggle meldt aria-pressed', async () => {
    const onChange = vi.fn();
    render(<Toggle onPressedChange={onChange}>Alleen vinyl</Toggle>);
    const t = screen.getByRole('button', { name: 'Alleen vinyl' });
    expect(t).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(t);
    expect(t).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('ToggleGroup: één tabstop, pijlen bewegen, Spatie drukt in', async () => {
    const onChange = vi.fn();
    render(<ToggleGroup label="Genres" onValueChange={onChange} options={[{ value: 'jazz', label: 'Jazz' }, { value: 'pop', label: 'Pop', disabled: true }, { value: 'soul', label: 'Soul' }]} />);
    expect(screen.getByRole('group', { name: 'Genres' })).toBeInTheDocument();
    const jazz = screen.getByRole('button', { name: 'Jazz' });
    const soul = screen.getByRole('button', { name: 'Soul' });
    expect(jazz).toHaveAttribute('tabindex', '0');
    expect(soul).toHaveAttribute('tabindex', '-1');
    act(() => jazz.focus());
    await userEvent.keyboard('{ArrowRight}');
    expect(soul).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Home}');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['jazz', 'soul']);
    expect(soul).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Separator, Kbd en EmptyState', () => {
  it('renderen met de juiste semantiek', () => {
    render(<>
      <Separator />
      <Separator decorative={false} orientation="vertical" />
      <Separator label="of" />
      <p>Zoek met <Kbd>Ctrl</Kbd> <Kbd>K</Kbd></p>
      <EmptyState title="Nog geen platen" description="Voeg je eerste plaat toe." headingLevel={2} action={<Button>Plaat toevoegen</Button>} />
    </>);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByText('of')).toBeInTheDocument();
    expect(screen.getByText('Ctrl').tagName).toBe('KBD');
    expect(screen.getByRole('heading', { level: 2, name: 'Nog geen platen' })).toBeInTheDocument();
  });
});
