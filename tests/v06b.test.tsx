import { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar, DatePicker, DateRangePicker, MultiCombobox, Papier, RangeCalendar, RangeSlider, englishLabels, formatNumericDate, parseTypedDate } from '../src';
import { addMonths, firstDayOfWeek } from '../src/lib/date';

const genres = [
  { value: 'jazz', label: 'Jazz' },
  { value: 'soul', label: 'Soul' },
  { value: 'pop', label: 'Pop', disabled: true },
  { value: 'klassiek', label: 'Klassiek', description: 'Ook opera' },
];

describe('MultiCombobox', () => {
  it('kiest meerdere opties, de lijst blijft open en de keuzes staan als tags', async () => {
    const onChange = vi.fn();
    render(<MultiCombobox label="Genres" options={genres} onValueChange={onChange} name="genre" />);
    const input = screen.getByRole('combobox', { name: 'Genres' });
    await userEvent.type(input, 'ja');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['jazz'], [genres[0]]);
    expect(input).toHaveValue('');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Jazz' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('option', { name: 'Soul' }));
    expect(onChange).toHaveBeenLastCalledWith(['jazz', 'soul'], [genres[0], genres[1]]);
    expect(input).toHaveAccessibleDescription(/Gekozen: Jazz, Soul/);
    expect(Array.from(document.querySelectorAll('input[type="hidden"][name="genre"]')).map((i) => (i as HTMLInputElement).value)).toEqual(['jazz', 'soul']);
    expect(input).toHaveFocus();
  });

  it('Enter op een gekozen optie haalt hem weg; Backspace in een leeg veld ook', async () => {
    const onChange = vi.fn();
    render(<MultiCombobox label="Genres" options={genres} defaultValue={['jazz', 'soul']} onValueChange={onChange} />);
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['soul'], [genres[1]]);
    expect(screen.getByRole('status')).toHaveTextContent('Jazz verwijderd');
    await userEvent.keyboard('{Escape}{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith([], []);
  });

  it('pijltjes slaan uitgeschakelde opties over; max blokkeert verdere keuzes', async () => {
    render(<MultiCombobox label="Genres" options={genres} defaultValue={['jazz']} max={2} />);
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    const active = () => document.getElementById(input.getAttribute('aria-activedescendant')!)?.textContent;
    expect(active()).toMatch(/^Klassiek/);
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('option', { name: 'Soul' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option', { name: 'Jazz' })).not.toHaveAttribute('aria-disabled');
  });

  it('de verwijderknop van een tag haalt de keuze weg en houdt de focus in het veld', async () => {
    render(<MultiCombobox label="Genres" options={genres} defaultValue={['jazz', 'soul']} />);
    await userEvent.click(screen.getByRole('button', { name: 'Soul verwijderen' }));
    expect(screen.queryByRole('button', { name: 'Soul verwijderen' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });
});

describe('RangeSlider', () => {
  it('twee duimen met een naam, die elkaar niet passeren', () => {
    const onChange = vi.fn();
    render(<RangeSlider label="Jaar" min={1950} max={2020} defaultValue={[1960, 1990]} minDistance={5} onValueChange={onChange} formatValue={String} />);
    const [from, to] = screen.getAllByRole('slider');
    expect(from).toHaveAccessibleName('Jaar Van');
    expect(to).toHaveAccessibleName('Jaar Tot');
    expect(screen.getByRole('group', { name: 'Jaar' })).toBeInTheDocument();
    fireEvent.change(from, { target: { value: '2000' } });
    expect(onChange).toHaveBeenLastCalledWith([1985, 1990]);
    fireEvent.change(to, { target: { value: '1970' } });
    expect(onChange).toHaveBeenLastCalledWith([1985, 1990]);
  });

  it('onValueCommit volgt pas bij loslaten', () => {
    const onCommit = vi.fn();
    function Demo() { const [v, setV] = useState<[number, number]>([10, 90]); return <RangeSlider label="Prijs" value={v} onValueChange={setV} onValueCommit={onCommit} />; }
    render(<Demo />);
    const [from] = screen.getAllByRole('slider');
    fireEvent.change(from, { target: { value: '30' } });
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.keyUp(from, { key: 'ArrowRight' });
    expect(onCommit).toHaveBeenCalledWith([30, 90]);
  });
});

describe('datums', () => {
  it('leest getypte datums in de volgorde van de taal', () => {
    expect(parseTypedDate('15-3-2024', 'nl-NL')).toBe('2024-03-15');
    expect(parseTypedDate('15/03/24', 'nl-NL')).toBe('2024-03-15');
    expect(parseTypedDate('3/15/2024', 'en-US')).toBe('2024-03-15');
    expect(parseTypedDate('2024-03-15', 'en-US')).toBe('2024-03-15');
    expect(parseTypedDate('31-02-2024', 'nl-NL')).toBeNull();
    expect(parseTypedDate('morgen', 'nl-NL')).toBeNull();
    expect(formatNumericDate('2024-03-05', 'nl-NL')).toBe('05-03-2024');
    expect(formatNumericDate('2024-03-05', 'en-US')).toBe('03/05/2024');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(firstDayOfWeek('nl-NL')).toBe(1);
    expect(firstDayOfWeek('en-US')).toBe(0);
  });
});

describe('Calendar', () => {
  it('toetsenbord: pijlen, PageDown en Enter kiezen een datum; dagen zijn voluit benoemd', async () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue="2024-03-15" onValueChange={onChange} />);
    const grid = screen.getByRole('grid', { name: 'maart 2024' });
    const day = within(grid).getByRole('gridcell', { name: 'vrijdag 15 maart 2024' });
    expect(day).toHaveAttribute('aria-selected', 'true');
    expect(day).toHaveAttribute('tabindex', '0');
    expect(within(grid).getAllByRole('columnheader')[0]).toHaveTextContent('maandag');
    day.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    expect(screen.getByRole('gridcell', { name: 'zaterdag 23 maart 2024' })).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'april 2024' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: 'dinsdag 23 april 2024' })).toHaveFocus();
    await userEvent.keyboard('{Home}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2024-04-22');
  });

  it('min, max en onbeschikbare dagen kun je niet kiezen', async () => {
    const onChange = vi.fn();
    render(<Calendar defaultMonth="2024-03-10" min="2024-03-05" max="2024-03-28" isDateUnavailable={(d) => d === '2024-03-12'} onValueChange={onChange} />);
    const early = screen.getByRole('gridcell', { name: 'maandag 4 maart 2024' });
    expect(early).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(early);
    await userEvent.click(screen.getByRole('gridcell', { name: 'dinsdag 12 maart 2024' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Vorige maand' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Volgende maand' })).toBeDisabled();
    await userEvent.click(screen.getByRole('gridcell', { name: 'woensdag 13 maart 2024' }));
    expect(onChange).toHaveBeenCalledWith('2024-03-13');
  });

  it('volgt de eerste weekdag van de taal', () => {
    render(<Papier labels={englishLabels}><Calendar defaultValue="2024-03-15" /></Papier>);
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sunday');
    expect(screen.getByRole('gridcell', { name: 'Friday, March 15, 2024' })).toBeInTheDocument();
  });
});

describe('DatePicker', () => {
  it('getypte datum wordt gelezen en opgemaakt; een niet-bestaande krijgt een melding', async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="Releasedatum" onValueChange={onChange} name="release" /><button>Verder</button></>);
    const input = screen.getByRole('textbox', { name: 'Releasedatum' });
    expect(input).toHaveAttribute('placeholder', 'dd-mm-jjjj');
    await userEvent.type(input, '7/4/1972');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith('1972-04-07');
    expect(input).toHaveValue('07-04-1972');
    expect(document.querySelector('input[name="release"]')).toHaveValue('1972-04-07');
    await userEvent.clear(input);
    await userEvent.type(input, '31-02-2024');
    await userEvent.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Vul een bestaande datum in/);
  });

  it('de kalenderknop opent een dialog, kiezen vult het veld en zet de focus terug', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Datum" defaultValue="2024-03-15" onValueChange={onChange} />);
    const toggle = screen.getByRole('button', { name: /Kies een datum, vrijdag 15 maart 2024/ });
    await userEvent.click(toggle);
    const dialog = screen.getByRole('dialog', { name: 'Kies een datum' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('gridcell', { name: 'vrijdag 15 maart 2024' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2024-03-16');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Datum' })).toHaveValue('16-03-2024');
    expect(screen.getByRole('textbox', { name: 'Datum' })).toHaveFocus();
  });

  it('Escape sluit de kalender en zet de focus op de knop; Alt+pijl omlaag opent hem', async () => {
    render(<DatePicker label="Datum" />);
    const input = screen.getByRole('textbox', { name: 'Datum' });
    input.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kies een datum' })).toHaveFocus();
  });

  it('een datum buiten min en max wordt geweigerd', async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="Datum" min="2024-01-01" onValueChange={onChange} /><button>Verder</button></>);
    await userEvent.type(screen.getByRole('textbox'), '12-12-2023');
    await userEvent.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(/Deze datum kun je niet kiezen/);
  });
});

describe('RangeCalendar en DateRangePicker', () => {
  it('eerste klik is het begin, tweede het eind, in elke volgorde; de hele periode is aria-selected', async () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth="2024-03-01" onValueChange={onChange} />);
    await userEvent.click(screen.getByRole('gridcell', { name: 'woensdag 20 maart 2024' }));
    expect(onChange).toHaveBeenLastCalledWith({ start: '2024-03-20', end: null });
    await userEvent.click(screen.getByRole('gridcell', { name: 'maandag 11 maart 2024' }));
    expect(onChange).toHaveBeenLastCalledWith({ start: '2024-03-11', end: '2024-03-20' });
    expect(screen.getByRole('gridcell', { name: 'vrijdag 15 maart 2024' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('gridcell', { name: 'vrijdag 15 maart 2024' })).toHaveAttribute('data-range', 'middle');
    expect(screen.getByRole('gridcell', { name: 'maandag 11 maart 2024' })).toHaveAttribute('data-range', 'start');
    expect(screen.getByRole('gridcell', { name: 'donderdag 21 maart 2024' })).toHaveAttribute('aria-selected', 'false');
  });

  it('met het toetsenbord: Enter, pijlen als voorbeeld, Enter', async () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth="2024-03-10" onValueChange={onChange} />);
    screen.getByRole('gridcell', { name: 'zondag 10 maart 2024' }).focus();
    await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('gridcell', { name: 'maandag 11 maart 2024' })).toHaveAttribute('data-range', 'middle');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith({ start: '2024-03-10', end: '2024-03-12' });
  });

  it('DateRangePicker: twee benoemde velden, typen draait een omgekeerde periode om', async () => {
    const onChange = vi.fn();
    render(<><DateRangePicker label="Verblijf" onValueChange={onChange} startName="van" endName="tot" /><button>Verder</button></>);
    const from = screen.getByRole('textbox', { name: 'Verblijf Van' });
    const to = screen.getByRole('textbox', { name: 'Verblijf Tot' });
    await userEvent.type(from, '20-3-2024');
    await userEvent.type(to, '11-3-2024');
    await userEvent.tab();
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith({ start: '2024-03-11', end: '2024-03-20' });
    expect(from).toHaveValue('11-03-2024');
    expect(to).toHaveValue('20-03-2024');
    expect(document.querySelector('input[name="tot"]')).toHaveValue('2024-03-20');
  });

  it('DateRangePicker: de kalender kiest begin en eind en sluit dan', async () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="Periode" defaultValue={{ start: '2024-03-04', end: '2024-03-08' }} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Kies een datum, 4 maart 2024 – 8 maart 2024/ }));
    const dialog = screen.getByRole('dialog', { name: 'Kies een datum' });
    await userEvent.click(within(dialog).getByRole('gridcell', { name: 'dinsdag 12 maart 2024' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('gridcell', { name: 'zaterdag 16 maart 2024' }));
    expect(onChange).toHaveBeenLastCalledWith({ start: '2024-03-12', end: '2024-03-16' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Periode Van' })).toHaveFocus();
  });
});
