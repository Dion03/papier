import { act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { AlertDialog, Button, Switch, SegmentedControl, Tabs, TabList, Tab, TabPanel, Slider, TextField, Dialog, Disclosure, Link, Progress, Checkbox } from '../src';

describe('Button', () => {
  it('blokkeert klikken tijdens laden maar blijft focusbaar', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Opslaan</Button>);
    const b = screen.getByRole('button', { name: 'Opslaan' });
    expect(b).toHaveAttribute('aria-busy', 'true');
    expect(b).not.toBeDisabled();
    b.focus();
    expect(b).toHaveFocus();
    await userEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Switch', () => {
  it('wisselt aria-checked met klik en spatie', async () => {
    const onChange = vi.fn();
    render(<Switch label="Geluid" onCheckedChange={onChange} />);
    const s = screen.getByRole('switch', { name: 'Geluid' });
    expect(s).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(s);
    expect(s).toHaveAttribute('aria-checked', 'true');
    s.focus();
    await userEvent.keyboard(' ');
    expect(s).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});

describe('SegmentedControl', () => {
  const options = [{ value: 'week', label: 'Week' }, { value: 'maand', label: 'Maand', disabled: true }, { value: 'jaar', label: 'Jaar' }];
  it('heeft roving tabindex en slaat uitgeschakelde opties over met pijltjes', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Periode" options={options} onValueChange={onChange} />);
    const week = screen.getByRole('radio', { name: 'Week' });
    const jaar = screen.getByRole('radio', { name: 'Jaar' });
    expect(week).toHaveAttribute('tabindex', '0');
    expect(jaar).toHaveAttribute('tabindex', '-1');
    week.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(jaar).toHaveFocus();
    expect(jaar).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledWith('jaar');
    await userEvent.keyboard('{Home}');
    expect(week).toHaveFocus();
  });
});

describe('Tabs', () => {
  it('koppelt tab en panel en activeert met pijltjes', async () => {
    render(
      <Tabs defaultValue="nu">
        <TabList label="Weergave"><Tab value="nu">Nu</Tab><Tab value="top">Top</Tab></TabList>
        <TabPanel value="nu">Nu speelt</TabPanel><TabPanel value="top">Top 5</TabPanel>
      </Tabs>,
    );
    const nu = screen.getByRole('tab', { name: 'Nu' });
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Nu');
    nu.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Top' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Top 5');
    await userEvent.keyboard('{ArrowRight}');
    expect(nu).toHaveFocus();
  });
});

describe('Slider', () => {
  it('geeft een leesbare valuetext', () => {
    render(<Slider label="Positie" max={300} defaultValue={84} formatValue={(s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`} />);
    const s = screen.getByRole('slider', { name: 'Positie' });
    expect(s).toHaveAttribute('aria-valuetext', '1:24');
    fireEvent.change(s, { target: { value: '125' } });
    expect(s).toHaveAttribute('aria-valuetext', '2:05');
  });
});

describe('TextField', () => {
  it('koppelt fout en hint aan het veld', () => {
    render(<TextField label="E-mail" hint="We delen het niet" error="Vul een geldig adres in" />);
    const input = screen.getByLabelText('E-mail');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Vul een geldig adres in.*We delen het niet/);
  });
});

describe('Checkbox', () => {
  it('is een echte checkbox met beschrijving', async () => {
    render(<Checkbox label="Openbaar" description="Iedereen kan het zien" />);
    const c = screen.getByRole('checkbox', { name: 'Openbaar' });
    expect(c).toHaveAccessibleDescription('Iedereen kan het zien');
    await userEvent.click(screen.getByText('Openbaar'));
    expect(c).toBeChecked();
  });
});

describe('Dialog', () => {
  function Demo() {
    const [open, setOpen] = useState(false);
    return (<>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Zeker weten?"><p>Inhoud</p></Dialog>
    </>);
  }
  it('opent met titel als naam en sluit met de sluitknop', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Zeker weten?' });
    expect(dialog).toHaveAttribute('open');
    await userEvent.click(screen.getByRole('button', { name: 'Sluiten' }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('een klik op de achtergrond sluit, tenzij dismissOnBackdrop uit staat; een klik in het paneel nooit', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Dialog open onClose={onClose} title="Filters"><p>Inhoud</p></Dialog>);
    await userEvent.click(screen.getByText('Inhoud'));
    expect(onClose).not.toHaveBeenCalled();
    // The <dialog> element itself is the backdrop; the panel sits inside it.
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
    rerender(<Dialog open onClose={onClose} title="Filters" dismissOnBackdrop={false}><p>Inhoud</p></Dialog>);
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('sluit de browser hem (Escape, form method="dialog"), dan volgt onClose en keert de focus terug', async () => {
    render(<Demo />);
    const opener = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(opener);
    const dialog = screen.getByRole('dialog') as HTMLDialogElement;
    act(() => dialog.close());
    expect(opener).toHaveFocus();
    // onClose set open to false, so the app state agrees and a second click opens it again.
    await userEvent.click(opener);
    expect(dialog).toHaveAttribute('open');
  });
});

describe('AlertDialog', () => {
  it('Escape sluit niet terwijl de bevestiging nog loopt', async () => {
    const onClose = vi.fn();
    let finish!: () => void;
    render(<AlertDialog open onClose={onClose} onConfirm={() => new Promise<void>((r) => { finish = r; })} title="Weg?" confirmLabel="Verwijderen" />);
    const dialog = screen.getByRole('alertdialog');
    const escape = () => { const e = new Event('cancel', { cancelable: true }); act(() => { dialog.dispatchEvent(e); }); return e; };
    await userEvent.click(screen.getByRole('button', { name: 'Verwijderen' }));
    expect(escape().defaultPrevented).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => { finish(); });
    expect(onClose).toHaveBeenCalledOnce();
    escape();
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('Disclosure', () => {
  it('opent native zonder Web Animations', async () => {
    const { container } = render(<Disclosure summary="Meer">Verborgen tekst</Disclosure>);
    const details = container.querySelector('details')!;
    expect(details.open).toBe(false);
    await userEvent.click(screen.getByText('Meer'));
    expect(details.open).toBe(true);
  });
});

describe('Link', () => {
  it('voegt veilige rel en een aangekondigde hint toe bij extern', () => {
    render(<Link href="https://discogs.com" external>Discogs</Link>);
    const a = screen.getByRole('link', { name: /Discogs \(opent in een nieuw tabblad\)/ });
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect(a).toHaveAttribute('target', '_blank');
  });
});

describe('Progress', () => {
  it('is determinate met waarde en indeterminate zonder', () => {
    render(<><Progress label="Upload" value={3} max={5} valueText="3 van 5" /><Progress label="Laden" /></>);
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute('aria-valuetext', '3 van 5');
    expect(screen.getByRole('progressbar', { name: 'Laden' })).not.toHaveAttribute('aria-valuenow');
  });
});
