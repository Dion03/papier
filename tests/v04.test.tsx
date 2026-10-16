import { createRef, forwardRef, useRef, useState, type AnchorHTMLAttributes } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertDialog, Breadcrumb, BreadcrumbItem, Button, Combobox, Dialog, Pagination, Papier, Sheet, englishLabels, paginationRange } from '../src';

const platen = [
  { value: 'uitzinnig', label: 'Uitzinnig', description: 'Froukje' },
  { value: 'cafe', label: 'Café Brazil' },
  { value: 'kind', label: 'Kind of Blue', disabled: true },
  { value: 'blue', label: 'Blue Train' },
];

describe('Combobox', () => {
  it('filtert op typen, zonder accenten, en Enter kiest de eerste treffer', async () => {
    const onChange = vi.fn();
    render(<Combobox label="Plaat" options={platen} onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'Plaat' });
    await userEvent.type(input, 'cafe');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['Café Brazil']);
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    expect(screen.getByRole('status')).toHaveTextContent('1 resultaat');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('cafe', platen[1]);
    expect(input).toHaveValue('Café Brazil');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('pijltjes slaan uitgeschakelde opties over en lopen rond', async () => {
    render(<Combobox label="Plaat" options={platen} />);
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    const active = () => document.getElementById(input.getAttribute('aria-activedescendant')!)?.textContent;
    expect(active()).toMatch(/^Uitzinnig/);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toBe('Blue Train');
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toMatch(/^Uitzinnig/);
    await userEvent.keyboard('{ArrowUp}');
    expect(active()).toBe('Blue Train');
    expect(screen.getByRole('option', { name: 'Kind of Blue' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('Escape sluit en zet de tekst terug, een tweede Escape wist de keuze', async () => {
    const onChange = vi.fn();
    render(<Combobox label="Plaat" options={platen} defaultValue="blue" onChange={onChange} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Blue Train');
    await userEvent.clear(input);
    await userEvent.type(input, 'uit');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('Blue Train');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith(null, null);
  });

  it('bij verlaten telt een exacte naam als keuze, anders keert de vorige terug', async () => {
    const onChange = vi.fn();
    render(<><Combobox label="Plaat" options={platen} onChange={onChange} /><button>Verder</button></>);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'blue train');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith('blue', platen[3]);
    expect(input).toHaveValue('Blue Train');
    await userEvent.clear(input);
    await userEvent.type(input, 'blu');
    await userEvent.tab();
    expect(input).toHaveValue('Blue Train');
  });

  it('klik op een optie kiest hem en de focus blijft in het veld', async () => {
    render(<Combobox label="Plaat" options={platen} name="plaat" />);
    const input = screen.getByRole('combobox');
    await userEvent.click(screen.getByRole('button', { name: 'Toon opties' }));
    expect(input).toHaveFocus();
    await userEvent.click(screen.getByRole('option', { name: /Uitzinnig/ }));
    expect(input).toHaveValue('Uitzinnig');
    expect(input).toHaveFocus();
    expect(document.querySelector('input[type="hidden"][name="plaat"]')).toHaveValue('uitzinnig');
  });

  it('meldt geen resultaten, en filter={false} laat zoeken op de server toe', async () => {
    function Remote() {
      const [q, setQ] = useState('');
      const found = platen.filter((p) => p.value.startsWith(q.toLowerCase()));
      return <Combobox label="Zoek" options={found} filter={false} inputValue={q} onInputChange={setQ} />;
    }
    render(<><Combobox label="Plaat" options={platen} /><Remote /></>);
    await userEvent.type(screen.getByRole('combobox', { name: 'Plaat' }), 'xyz');
    expect(screen.getByText('Geen resultaten', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Plaat' })).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(screen.getByRole('combobox', { name: 'Zoek' }), 'b');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Blue Train']);
  });

  it('hangt fout en hint aan het veld en geeft de ref van het input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Combobox ref={ref} label="Plaat" options={platen} error="Kies een plaat" hint="Uit je collectie" />);
    const input = screen.getByRole('combobox', { name: 'Plaat' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Kies een plaat Uit je collectie');
  });
});

describe('AlertDialog', () => {
  it('is een alertdialog, focust Annuleren en sluit niet bij een klik ernaast', async () => {
    const onClose = vi.fn();
    render(<AlertDialog open onClose={onClose} onConfirm={() => {}} title="Plaat verwijderen?" description="Dit kun je niet ongedaan maken." confirmLabel="Verwijderen" tone="danger" />);
    const dialog = screen.getByRole('alertdialog', { name: 'Plaat verwijderen?' });
    expect(dialog).toHaveAccessibleDescription('Dit kun je niet ongedaan maken.');
    expect(screen.getByRole('button', { name: 'Annuleren' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Verwijderen' })).toHaveAttribute('data-variant', 'danger');
    await userEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Annuleren' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('wacht op een promise: laadt, sluit bij succes en blijft open bij een fout', async () => {
    let finish!: (ok: boolean) => void;
    const onConfirm = vi.fn(() => new Promise<void>((res, rej) => { finish = (ok) => (ok ? res() : rej(new Error('mislukt'))); }));
    const onClose = vi.fn();
    render(<AlertDialog open onClose={onClose} onConfirm={onConfirm} title="Weg?" confirmLabel="Verwijderen" />);
    const confirm = screen.getByRole('button', { name: 'Verwijderen' });
    await userEvent.click(confirm);
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    await act(async () => { finish(false); });
    expect(onClose).not.toHaveBeenCalled();
    expect(confirm).not.toHaveAttribute('aria-busy');
    await userEvent.click(confirm);
    await act(async () => { finish(true); });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('een synchrone bevestiging sluit meteen, en labels volgen <Papier labels>', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<Papier labels={englishLabels}><AlertDialog open onClose={onClose} onConfirm={onConfirm} title="Remove?" confirmLabel="Remove" /></Papier>);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Cancel', hidden: true })).toBeInTheDocument();
  });
});

const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(function RouterLink({ to, ...rest }, ref) {
  return <a ref={ref} href={to} data-router="" {...rest} />;
});

describe('Breadcrumb', () => {
  it('is een benoemde nav met een lijst; het laatste item is de huidige pagina', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem asChild><RouterLink to="/werk">Werk</RouterLink></BreadcrumbItem>
        <BreadcrumbItem>Papier</BreadcrumbItem>
      </Breadcrumb>,
    );
    const nav = screen.getByRole('navigation', { name: 'Kruimelpad' });
    expect(nav.querySelectorAll('ol > li')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Werk' })).toHaveAttribute('data-router');
    expect(screen.getByRole('link', { name: 'Werk' })).toHaveAttribute('href', '/werk');
    expect(screen.getByText('Papier')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });
});

describe('Pagination', () => {
  it('berekent het bereik met gaten', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(1, 12)).toEqual([1, 2, 3, 4, 5, 'gap-end', 12]);
    expect(paginationRange(6, 12)).toEqual([1, 'gap-start', 5, 6, 7, 'gap-end', 12]);
    expect(paginationRange(12, 12)).toEqual([1, 'gap-start', 8, 9, 10, 11, 12]);
  });

  it('knoppen: huidige pagina met aria-current, vorige en volgende roepen onPageChange aan', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={12} onPageChange={onPageChange} />);
    screen.getByRole('navigation', { name: 'Paginering' });
    expect(screen.getByRole('button', { name: 'Pagina 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('button', { name: /Vorige/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Volgende/ }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: 'Pagina 12' }));
    expect(onPageChange).toHaveBeenLastCalledWith(12);
    await userEvent.click(screen.getByRole('button', { name: 'Pagina 1' }));
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  it('links via getHref en een eigen linkcomponent', () => {
    const Next = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function Next(p, ref) { return <a ref={ref} data-next="" {...p} />; });
    render(<Pagination page={3} pageCount={5} getHref={(p) => `/werk?p=${p}`} linkAs={Next} />);
    const prev = screen.getByRole('link', { name: /Vorige/ });
    expect(prev).toHaveAttribute('href', '/werk?p=2');
    expect(prev).toHaveAttribute('rel', 'prev');
    expect(prev).toHaveAttribute('data-next');
    expect(screen.getByRole('link', { name: 'Pagina 3' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('Button blijft werken naast AlertDialog', () => {
  it('opent en sluit vanuit een knop', async () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return <><Button onClick={() => setOpen(true)}>Verwijder</Button><AlertDialog open={open} onClose={() => setOpen(false)} onConfirm={() => {}} title="Zeker?" confirmLabel="Verwijderen" /></>;
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Verwijder' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Annuleren' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

describe('focus terug na sluiten (Dialog, AlertDialog, Sheet)', () => {
  function Demo({ kind, withTarget = false }: { kind: 'dialog' | 'alert' | 'sheet'; withTarget?: boolean }) {
    const [open, setOpen] = useState(false);
    const target = useRef<HTMLInputElement>(null);
    const close = () => setOpen(false);
    const back = withTarget ? target : undefined;
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        <input ref={target} aria-label="Doel" />
        {kind === 'dialog' && <Dialog open={open} onClose={close} title="D" returnFocusTo={back} footer={<button onClick={close}>Klaar</button>} />}
        {kind === 'alert' && <AlertDialog open={open} onClose={close} onConfirm={() => {}} title="A" confirmLabel="Klaar" returnFocusTo={back} />}
        {kind === 'sheet' && <Sheet open={open} onClose={close} title="S" returnFocusTo={back} footer={<button onClick={close}>Klaar</button>} />}
      </>
    );
  }

  for (const kind of ['dialog', 'alert', 'sheet'] as const) {
    it(`${kind}: terug naar de opener, ook als een klik hem niet focuste (Safari)`, async () => {
      render(<Demo kind={kind} />);
      const opener = screen.getByRole('button', { name: 'Open' });
      // Safari: a click does not focus the button, so activeElement stays <body>.
      fireEvent.pointerDown(opener);
      opener.click();
      expect(document.activeElement).not.toBe(opener);
      await userEvent.click(screen.getByRole('button', { name: 'Klaar', hidden: true }));
      expect(opener).toHaveFocus();
    });

    it(`${kind}: terug naar de opener als de klik een container focuste (WebKit)`, async () => {
      render(<main tabIndex={-1}><Demo kind={kind} /></main>);
      const opener = screen.getByRole('button', { name: 'Open' });
      fireEvent.pointerDown(opener);
      screen.getByRole('main').focus();
      opener.click();
      await userEvent.click(screen.getByRole('button', { name: 'Klaar', hidden: true }));
      expect(opener).toHaveFocus();
    });

    it(`${kind}: returnFocusTo wint`, async () => {
      render(<Demo kind={kind} withTarget />);
      await userEvent.click(screen.getByRole('button', { name: 'Open' }));
      await userEvent.click(screen.getByRole('button', { name: 'Klaar', hidden: true }));
      expect(screen.getByRole('textbox', { name: 'Doel' })).toHaveFocus();
    });
  }
});
