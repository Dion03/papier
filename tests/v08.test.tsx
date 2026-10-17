// 0.6: one callback name for every input, and a small IconButton.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox, IconButton, MultiCombobox, icons } from '../src';

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

describe('IconButton', () => {
  it('has a small size', () => {
    render(<IconButton label="More" size="sm" icon={<icons.Plus />} />);
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('data-size', 'sm');
  });
});
