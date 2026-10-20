import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Avatar, Button, IconButton, Menu, Papier, RadioGroup, Select, Sheet, ToastProvider, Tooltip, englishLabels, icons, useToast, Notice, Link } from '../src';

describe('Menu', () => {
  it('opent met pijl omlaag, navigeert en sluit met Escape terug naar de knop', async () => {
    const onShare = vi.fn();
    render(<Menu trigger="Acties" items={[{ label: 'Delen', onSelect: onShare }, { label: 'Kopiëren', onSelect: () => {}, disabled: true }, { label: 'Verwijderen', onSelect: () => {}, tone: 'danger' }]} />);
    const trigger = screen.getByRole('button', { name: 'Acties' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Delen' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Verwijderen' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delen' }));
    expect(onShare).toHaveBeenCalledOnce();
  });
});

describe('Tooltip', () => {
  it('beschrijft het element bij focus en verdwijnt met Escape', async () => {
    render(<Tooltip content="Zet de plaat terug in de hoes"><IconButton label="Opbergen" icon={<icons.Close />} /></Tooltip>);
    const btn = screen.getByRole('button', { name: 'Opbergen' });
    await userEvent.tab();
    expect(btn).toHaveFocus();
    expect(btn).toHaveAccessibleDescription('Zet de plaat terug in de hoes');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('RadioGroup en Select', () => {
  it('RadioGroup is een benoemde groep met native radios', async () => {
    const onChange = vi.fn();
    render(<RadioGroup legend="Snelheid" onValueChange={onChange} options={[{ value: '33', label: '33 toeren' }, { value: '45', label: '45 toeren' }]} />);
    expect(screen.getByRole('group', { name: 'Snelheid' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('45 toeren'));
    expect(screen.getByRole('radio', { name: '45 toeren' })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('45');
  });
  it('Select koppelt label en fout', () => {
    render(<Select label="Sorteren" error="Kies iets" options={[{ value: 'a', label: 'Artiest' }]} />);
    const s = screen.getByRole('combobox', { name: 'Sorteren' });
    expect(s).toHaveAttribute('aria-invalid', 'true');
    expect(s).toHaveAccessibleDescription(/Kies iets/);
  });
});

describe('Toast', () => {
  function Demo() {
    const { toast } = useToast();
    return <Button onClick={() => toast({ title: 'Opgeslagen', description: 'In je collectie' })}>Bewaar</Button>;
  }
  it('toont in een vaste live region en verdwijnt na de duur', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ToastProvider><Demo /></ToastProvider>);
    const region = screen.getByRole('region', { name: 'Meldingen' });
    expect(region.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Bewaar' }));
    expect(screen.getByText('Opgeslagen')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(5200); });
    expect(screen.queryByText('Opgeslagen')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('Sheet', () => {
  function Demo() {
    const [open, setOpen] = useState(false);
    return (<><Button onClick={() => setOpen(true)}>Menu</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Navigatie" hideTitle><a href="#w">Werk</a></Sheet></>);
  }
  it('opent als benoemd dialoogvenster en sluit', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const sheet = screen.getByRole('dialog', { name: 'Navigatie' });
    expect(sheet).toHaveAttribute('open');
    await userEvent.click(screen.getByRole('button', { name: 'Sluiten' }));
    expect(sheet).not.toHaveAttribute('open');
  });
  it('blijft open tot de sluitanimatie klaar is, en gaat dan met focus terug naar de knop', async () => {
    // jsdom runs no animations; stand in for the slide-out that data-closing starts.
    let done!: () => void;
    const exit = { effect: { target: null as Element | null, getComputedTiming: () => ({ endTime: 290 }) }, finished: new Promise<void>((r) => { done = r; }) };
    const proto = HTMLElement.prototype as unknown as { getAnimations?: unknown };
    proto.getAnimations = function (this: HTMLElement) {
      if (!this.dataset.closing) return [];
      exit.effect.target = this;
      return [exit];
    };
    try {
      render(<Demo />);
      const trigger = screen.getByRole('button', { name: 'Menu' });
      await userEvent.click(trigger);
      const sheet = screen.getByRole('dialog', { name: 'Navigatie' });
      await userEvent.click(screen.getByRole('button', { name: 'Sluiten' }));
      expect(sheet).toHaveAttribute('open');
      expect(sheet).toHaveAttribute('data-closing');
      await act(async () => { done(); await exit.finished; });
      expect(sheet).not.toHaveAttribute('open');
      expect(sheet).not.toHaveAttribute('data-closing');
      expect(trigger).toHaveFocus();
    } finally {
      delete proto.getAnimations;
    }
  });
});

describe('Avatar', () => {
  it('valt terug op initialen met de naam als toegankelijke naam', () => {
    render(<Avatar name="Froukje Veenstra" />);
    expect(screen.getByRole('img', { name: 'Froukje Veenstra' })).toHaveTextContent('FV');
  });
});

describe('Labels', () => {
  it('Papier labels vervangen de ingebouwde teksten', () => {
    render(<Papier labels={englishLabels}><Notice title="Saved" onDismiss={() => {}} /><Link href="https://x.nl" external>Source</Link></Papier>);
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /opens in a new tab/ })).toBeInTheDocument();
  });
});
