// 0.6: one callback name for every input; the old onChange keeps working until it is removed.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox, MultiCombobox } from '../src';

const records = [
  { value: 'blue', label: 'Blue Train' },
  { value: 'cafe', label: 'Café Brazil' },
];

describe('onValueChange', () => {
  it('Combobox calls onValueChange, and the deprecated onChange still works', async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<Combobox label="Record" options={records} onValueChange={onValueChange} onChange={onChange} />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Record' }), 'cafe');
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('cafe', records[1]);
    expect(onChange).toHaveBeenCalledWith('cafe', records[1]);
  });

  it('MultiCombobox calls onValueChange, and the deprecated onChange still works', async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<MultiCombobox label="Records" options={records} onValueChange={onValueChange} onChange={onChange} />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Records' }), 'blue');
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['blue'], [records[0]]);
    expect(onChange).toHaveBeenLastCalledWith(['blue'], [records[0]]);
  });
});
