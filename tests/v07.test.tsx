import { useState } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Command, CommandDialog, CopyButton, PinInput, Steps, scoreCommandItem, type CommandItem } from '../src';

const pages = (onSelect = vi.fn()): CommandItem[] => [
  { id: 'start', label: 'Installatie', group: 'Aan de slag', keywords: ['npm', 'install'], onSelect },
  { id: 'date', label: 'DatePicker', group: 'Formulieren', keywords: ['DateRangePicker', 'Calendar', 'datum'], description: 'Een datum typen of kiezen', onSelect },
  { id: 'button', label: 'Button', group: 'Acties', keywords: ['IconButton'], onSelect },
  { id: 'off', label: 'Binnenkort', group: 'Acties', disabled: true, onSelect },
];

describe('Command', () => {
  it('rangschikt: begin van het label, dan een woord, dan een trefwoord, dan de beschrijving', () => {
    const [start, date, button] = pages();
    expect(scoreCommandItem(button, 'but')).toBeGreaterThan(scoreCommandItem(button, 'icon'));
    expect(scoreCommandItem(date, 'datum')).toBeGreaterThan(0);
    expect(scoreCommandItem(date, 'kiezen')).toBe(1);
    expect(scoreCommandItem(start, 'npm instal')).toBeGreaterThan(0);
    expect(scoreCommandItem(start, 'npm xyz')).toBe(0);
  });

  it('typen filtert, pijlen bewegen en Enter voert het item uit', async () => {
    const onSelect = vi.fn();
    const onDone = vi.fn();
    render(<Command label="Zoek in de docs" items={pages(onSelect)} onDone={onDone} />);
    const input = screen.getByRole('combobox', { name: 'Zoek in de docs' });
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByRole('group', { name: 'Formulieren' })).toBeInTheDocument();
    await userEvent.type(input, 'calendar');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['DatePickerEen datum typen of kiezen']);
    expect(screen.getByRole('status')).toHaveTextContent('1 resultaat');
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalled();
    await userEvent.clear(input);
    await userEvent.type(input, 'zzz');
    expect(screen.getByText('Geen resultaten', { selector: 'p' })).toBeInTheDocument();
  });

  it('pijlen slaan uitgeschakelde items over en lopen rond', async () => {
    render(<Command label="Zoek" items={pages()} />);
    const input = screen.getByRole('combobox');
    const active = () => document.getElementById(input.getAttribute('aria-activedescendant')!)?.textContent;
    expect(active()).toBe('Installatie');
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(active()).toBe('Button');
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe('Installatie');
  });

  it('een render van de ouder met dezelfde items houdt de gekozen regel vast', async () => {
    const onSelect = vi.fn();
    // A parent that re-renders (theme switch, clock) passes a fresh but identical items array.
    function Parent({ tick }: { tick: number }) { return <><Command label="Zoek" items={pages(onSelect)} /><span>{tick}</span></>; }
    const { rerender } = render(<Parent tick={0} />);
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    rerender(<Parent tick={1} />);
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(document.getElementById(input.getAttribute('aria-activedescendant')!)).toHaveTextContent('Button');
  });

  it('CommandDialog sluit na een keuze en zet de focus terug', async () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return <><Button onClick={() => setOpen(true)}>Zoeken</Button><CommandDialog open={open} onClose={() => setOpen(false)} label="Zoek" items={pages()} /></>;
    }
    render(<Demo />);
    const opener = screen.getByRole('button', { name: 'Zoeken' });
    await userEvent.click(opener);
    const input = screen.getByRole('combobox', { name: 'Zoek' });
    expect(input).toHaveFocus();
    await userEvent.type(input, 'button{Enter}');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});

describe('CopyButton', () => {
  it('kopieert, bevestigt en meldt het', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const onCopy = vi.fn();
    render(<><CopyButton value="npm install @dionbm/papier" onCopy={onCopy} /><CopyButton value={() => 'code'}>Kopieer code</CopyButton></>);
    const icon = screen.getByRole('button', { name: 'Kopiëren' });
    await userEvent.click(icon);
    expect(writeText).toHaveBeenCalledWith('npm install @dionbm/papier');
    expect(onCopy).toHaveBeenCalled();
    expect(icon).toHaveAttribute('data-state', 'copied');
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Gekopieerd');
    await userEvent.click(screen.getByRole('button', { name: 'Kopieer code' }));
    expect(writeText).toHaveBeenLastCalledWith('code');
    expect(screen.getByRole('button', { name: 'Gekopieerd' })).toBeInTheDocument();
  });

  it('meldt een mislukte kopie en keert na de timeout terug naar de rusttoestand', async () => {
    const onCopyError = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('nee')) }, configurable: true });
    render(<CopyButton value="x" timeout={20} onCopyError={onCopyError}>Kopieer</CopyButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Kopieer' }));
    expect(screen.getByRole('status')).toHaveTextContent('Kopiëren mislukt');
    expect(onCopyError).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kopieer' })).toHaveAttribute('data-state', 'idle'));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('Steps', () => {
  const items = [{ title: 'Winkelmand' }, { title: 'Bezorging', description: 'Adres en moment' }, { title: 'Betalen' }, { title: 'Klaar' }];
  it('markeert de huidige stap en meldt voltooide stappen', () => {
    render(<Steps items={items} current={2} />);
    expect(screen.getByRole('navigation', { name: 'Stappen' })).toBeInTheDocument();
    const steps = screen.getAllByRole('listitem');
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    expect(steps[0]).toHaveTextContent('Winkelmand (voltooid)');
    expect(steps[3]).toHaveAttribute('data-state', 'upcoming');
  });

  it('een stap met een fout meldt dat ook aan schermlezers, niet alleen met een teken', () => {
    render(<Steps items={[{ title: 'Adres', error: true }, { title: 'Betalen' }]} current={1} />);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(/Adres.*controleer/);
  });

  it('met onStepClick zijn alleen voltooide en de huidige stap knoppen', async () => {
    const onStepClick = vi.fn();
    render(<Steps items={items} current={1} onStepClick={onStepClick} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: /Winkelmand/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});

describe('PinInput', () => {
  it('typen schuift door, Backspace gaat terug, en onComplete volgt bij het laatste teken', async () => {
    const onComplete = vi.fn();
    const onChange = vi.fn();
    render(<PinInput label="Inlogcode" length={4} onValueChange={onChange} onComplete={onComplete} name="code" />);
    const boxes = screen.getAllByRole('textbox');
    expect(screen.getByRole('group', { name: 'Inlogcode' })).toBeInTheDocument();
    expect(boxes[1]).toHaveAccessibleName('Teken 2 van 4');
    expect(boxes[0]).toHaveAttribute('autocomplete', 'one-time-code');
    await userEvent.click(boxes[0]);
    await userEvent.keyboard('1a2');
    expect(boxes[2]).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('12');
    await userEvent.keyboard('{Backspace}');
    expect(boxes[1]).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('1');
    await userEvent.keyboard('234');
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(document.querySelector('input[name="code"]')).toHaveValue('1234');
  });

  it('plakken en autofill vullen alle vakjes', () => {
    const onComplete = vi.fn();
    render(<PinInput label="Code" length={6} onComplete={onComplete} />);
    const boxes = screen.getAllByRole('textbox');
    fireEvent.paste(boxes[0], { clipboardData: { getData: () => '123 456' } });
    expect(onComplete).toHaveBeenCalledWith('123456');
    expect(boxes.map((b) => (b as HTMLInputElement).value).join('')).toBe('123456');
    act(() => { fireEvent.change(boxes[0], { target: { value: '654321' } }); });
    expect(onComplete).toHaveBeenLastCalledWith('654321');
  });

  it('autofill in een gevuld eerste vakje vervangt de hele code, ook als hij met hetzelfde teken begint', () => {
    const onComplete = vi.fn();
    render(<PinInput label="Code" length={4} defaultValue="1999" onComplete={onComplete} />);
    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    act(() => { fireEvent.change(boxes[0], { target: { value: '1234' } }); });
    expect(boxes.map((b) => b.value).join('')).toBe('1234');
    expect(onComplete).toHaveBeenLastCalledWith('1234');
  });

  it('een teken typen vóór het bestaande teken vervangt alleen dat vakje', () => {
    render(<PinInput label="Code" length={4} defaultValue="1234" />);
    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    // The caret sat before the "2" (a click after focus drops the selection), so the value becomes "72".
    act(() => { fireEvent.change(boxes[1], { target: { value: '72' } }); });
    expect(boxes.map((b) => b.value).join('')).toBe('1734');
  });

  it('alfanumeriek maakt hoofdletters; een fout staat op elk vakje', async () => {
    const onChange = vi.fn();
    render(<PinInput label="Kortingscode" type="alphanumeric" length={3} error="Deze code bestaat niet" onValueChange={onChange} />);
    await userEvent.type(screen.getAllByRole('textbox')[0], 'ab');
    expect(onChange).toHaveBeenLastCalledWith('AB');
    expect(screen.getAllByRole('textbox')[2]).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('group')).toHaveAccessibleDescription(/Deze code bestaat niet/);
  });
});
