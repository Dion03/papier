// Controlled use: the value prop wins over what the user did, and a value the app sets from
// outside (a reset button, data that loads) shows up in components that keep their own text.
import { useState, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Calendar, Combobox, DatePicker, DateRangePicker, MultiCombobox, NumberField, PinInput, SegmentedControl, Switch, Tab, TabList, TabPanel, Tabs,
} from '../src';

const options = [{ value: 'blue', label: 'Blue Train' }, { value: 'cafe', label: 'Café Brazil' }];
const text = (role: string) => screen.getAllByRole(role).map((el) => (el as HTMLInputElement).value).join('|');

/** Renders `ui(value)` with a button that sets the value from outside. */
function External<T>({ initial, next, ui }: { initial: T; next: T; ui: (value: T) => ReactNode }) {
  const [value, setValue] = useState(initial);
  return <>{ui(value)}<button onClick={() => setValue(next)}>Van buiten</button></>;
}

describe('een waarde van buiten verschijnt in het veld', () => {
  const cases: Array<[string, () => ReactNode, () => string, string, string]> = [
    ['Combobox', () => <External initial="blue" next="cafe" ui={(v) => <Combobox label="Plaat" options={options} value={v} />} />, () => text('combobox'), 'Blue Train', 'Café Brazil'],
    ['Combobox gewist', () => <External<string | null> initial="blue" next={null} ui={(v) => <Combobox label="Plaat" options={options} value={v} />} />, () => text('combobox'), 'Blue Train', ''],
    ['MultiCombobox', () => <External initial={['blue']} next={['cafe']} ui={(v) => <MultiCombobox label="Platen" options={options} value={v} name="plaat" />} />,
      () => Array.from(document.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="plaat"]')).map((i) => i.value).join('|'), 'blue', 'cafe'],
    ['NumberField', () => <External<number | null> initial={5} next={1234.5} ui={(v) => <NumberField label="Aantal" value={v} />} />, () => text('spinbutton'), '5', '1.234,5'],
    ['NumberField gewist', () => <External<number | null> initial={5} next={null} ui={(v) => <NumberField label="Aantal" value={v} />} />, () => text('spinbutton'), '5', ''],
    ['DatePicker', () => <External<string | null> initial="2024-03-15" next="2024-04-01" ui={(v) => <DatePicker label="Datum" value={v} />} />, () => text('textbox'), '15-03-2024', '01-04-2024'],
    ['DatePicker gewist', () => <External<string | null> initial="2024-03-15" next={null} ui={(v) => <DatePicker label="Datum" value={v} />} />, () => text('textbox'), '15-03-2024', ''],
    ['DateRangePicker', () => <External initial={{ start: '2024-03-11', end: '2024-03-20' }} next={{ start: '2024-04-01', end: '2024-04-02' }} ui={(v) => <DateRangePicker label="Verblijf" value={v} />} />,
      () => text('textbox'), '11-03-2024|20-03-2024', '01-04-2024|02-04-2024'],
    ['PinInput', () => <External initial="1234" next="" ui={(v) => <PinInput label="Code" length={4} value={v} />} />, () => text('textbox'), '1|2|3|4', '|||'],
    ['Calendar', () => <External initial="2024-03-15" next="2024-07-01" ui={(v) => <Calendar value={v} />} />,
      () => document.getElementById(screen.getByRole('grid').getAttribute('aria-labelledby')!)!.textContent!, 'maart 2024', 'juli 2024'],
  ];

  it.each(cases)('%s', async (_name, ui, read, before, after) => {
    render(<>{ui()}</>);
    expect(read()).toBe(before);
    await userEvent.click(screen.getByRole('button', { name: 'Van buiten' }));
    expect(read()).toBe(after);
  });
});

describe('de value-prop wint van de gebruiker', () => {
  it('Switch, Tabs en SegmentedControl melden de wens maar veranderen niet zelf', async () => {
    const onChange = vi.fn();
    render(<>
      <Switch label="Geluid" checked={false} onCheckedChange={onChange} />
      <Tabs value="a" onValueChange={onChange}><TabList label="Weergave"><Tab value="a">Bak</Tab><Tab value="b">Lijst</Tab></TabList><TabPanel value="a">A</TabPanel><TabPanel value="b">B</TabPanel></Tabs>
      <SegmentedControl label="Periode" value="w" onValueChange={onChange} options={[{ value: 'w', label: 'Week' }, { value: 'm', label: 'Maand' }]} />
    </>);
    await userEvent.click(screen.getByRole('switch', { name: 'Geluid' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Lijst' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Maand' }));
    expect(onChange.mock.calls).toEqual([[true], ['b'], ['m']]);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('tab', { name: 'Bak' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('A');
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true');
  });

  it('NumberField met een vaste waarde zet de tekst bij verlaten terug', async () => {
    const onValueChange = vi.fn();
    render(<><NumberField label="Aantal" value={5} onValueChange={onValueChange} /><button>Verder</button></>);
    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, '8');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(8);
    expect(input).toHaveValue('5');
  });
});
