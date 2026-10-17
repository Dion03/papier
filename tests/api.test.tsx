import { createRef, forwardRef, type AnchorHTMLAttributes } from 'react';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Avatar, Button, Dialog, Field, FieldError, FieldHint, FieldLabel, IconButton, Link, Menu, RadioGroup, SegmentedControl,
  Select, Sheet, Skeleton, Tab, TabList, TabPanel, Tabs, TextArea, TextField, Tooltip, icons, useField, useFieldControl,
} from '../src';
import { computePosition } from '../src/lib/position';

/** Stands in for Next.js or React Router `Link`: a component that forwards props and ref to an <a>. */
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(function RouterLink({ to, onClick, ...rest }, ref) {
  return <a ref={ref} href={to} data-router="" onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) e.preventDefault(); }} {...rest} />;
});

describe('asChild', () => {
  it('Button rendert als routerlink met knopstijl, label en ref', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const onChildClick = vi.fn();
    render(<Button asChild ref={ref} variant="ink" iconEnd={<icons.ArrowRight />} onClick={onClick}><RouterLink to="/werk" className="eigen" onClick={onChildClick}>Bekijk het werk</RouterLink></Button>);
    const a = screen.getByRole('link', { name: 'Bekijk het werk' });
    expect(a).toHaveAttribute('href', '/werk');
    expect(a).toHaveAttribute('data-router');
    expect(a).toHaveClass('pp-button', 'eigen');
    expect(a).toHaveAttribute('data-variant', 'ink');
    expect(a).not.toHaveAttribute('type');
    expect(a.querySelector('.pp-button__label')).toHaveTextContent('Bekijk het werk');
    expect(a.querySelector('.pp-button__end')).toBeInTheDocument();
    expect(ref.current).toBe(a);
    await userEvent.click(a);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onChildClick).toHaveBeenCalledOnce();
  });

  it('Button asChild blokkeert tijdens laden ook de link zelf', async () => {
    const onChildClick = vi.fn();
    render(<Button asChild loading><a href="#verder" onClick={onChildClick}>Verder</a></Button>);
    const a = screen.getByRole('link', { name: 'Verder' });
    expect(a).toHaveAttribute('aria-disabled', 'true');
    expect(a).toHaveAttribute('aria-busy', 'true');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    a.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onChildClick).not.toHaveBeenCalled();
  });

  it('Link en IconButton accepteren asChild', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<>
      <Link asChild ref={ref} variant="arrow" external><RouterLink to="https://discogs.com">Discogs</RouterLink></Link>
      <IconButton asChild label="Terug naar home" icon={<icons.ArrowLeft />}><RouterLink to="/" /></IconButton>
    </>);
    const link = screen.getByRole('link', { name: /Discogs \(opent in een nieuw tabblad\)/ });
    expect(link).toBe(ref.current);
    expect(link).toHaveClass('pp-link');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('.pp-link__arrow')).toBeInTheDocument();
    const home = screen.getByRole('link', { name: 'Terug naar home' });
    expect(home).toHaveClass('pp-icon-button');
    expect(home.querySelector('svg')).toBeInTheDocument();
  });

  it('Button asChild werkt met het toetsenbord zoals een link', async () => {
    const onClick = vi.fn();
    render(<Button asChild onClick={onClick}><RouterLink to="/x">Ga</RouterLink></Button>);
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Ga' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('veldbouwstenen', () => {
  it('Field koppelt een eigen control via de renderfunctie', () => {
    render(<Field label="Kleur" hint="Kies een hoes" error="Verplicht" required>{(control) => <input {...control} data-eigen="" />}</Field>);
    const input = screen.getByRole('textbox', { name: /Kleur/ });
    expect(input).toHaveAttribute('data-eigen');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Verplicht.*Kies een hoes/);
  });

  it('useFieldControl werkt voor componenten binnen Field', () => {
    function Eigen() { return <input {...useFieldControl()} type="number" />; }
    render(<Field label="Aantal" hint="Hele platen"><Eigen /></Field>);
    expect(screen.getByRole('spinbutton', { name: 'Aantal' })).toHaveAccessibleDescription('Hele platen');
    expect(() => render(<Eigen />)).toThrow(/inside <Field>/);
  });

  it('useField met losse bouwstenen geeft dezelfde koppelingen', () => {
    function Custom() {
      const f = useField({ hint: 'Zoek op artiest', error: 'Geen resultaat' });
      return (
        <div className="pp-field">
          <FieldLabel {...f.labelProps}>Artiest</FieldLabel>
          <div role="combobox" aria-expanded={false} tabIndex={0} aria-labelledby={f.ids.label} {...f.controlProps} />
          <FieldError {...f.errorProps}>Geen resultaat</FieldError>
          <FieldHint {...f.hintProps}>Zoek op artiest</FieldHint>
        </div>
      );
    }
    render(<Custom />);
    const box = screen.getByRole('combobox', { name: 'Artiest' });
    expect(box).toHaveAccessibleDescription(/Geen resultaat.*Zoek op artiest/);
    expect(box).toHaveAttribute('aria-invalid', 'true');
  });

  it('TextField toont prefix en suffix decoratief en focust het veld bij een klik erop', () => {
    render(<TextField label="Prijs in euro" prefix="€" suffix={<icons.Search />} hint="Inclusief btw" aria-describedby="extra" />);
    const input = screen.getByRole('textbox', { name: 'Prijs in euro' });
    const prefix = screen.getByText('€');
    expect(prefix).toHaveAttribute('aria-hidden', 'true');
    expect(prefix).toHaveAttribute('data-slot', 'prefix');
    expect(input.closest('.pp-field__group')?.querySelector('[data-slot="suffix"]')).toBeInTheDocument();
    expect(input.getAttribute('aria-describedby')).toMatch(/-hint extra$/);
    fireEvent.pointerDown(prefix);
    expect(input).toHaveFocus();
  });
});

describe('overlays: plaatsing', () => {
  const vp = { width: 1000, height: 800 };
  const size = { width: 200, height: 120 };
  it('kiest de voorkeurskant als er ruimte is', () => {
    expect(computePosition({ top: 300, left: 400, width: 100, height: 40 }, size, vp, 'bottom', 'start', 6)).toEqual({ top: 346, left: 400, side: 'bottom' });
  });
  it('klapt om aan elke rand', () => {
    expect(computePosition({ top: 740, left: 400, width: 100, height: 40 }, size, vp, 'bottom').side).toBe('top');
    expect(computePosition({ top: 20, left: 400, width: 100, height: 40 }, size, vp, 'top').side).toBe('bottom');
    expect(computePosition({ top: 300, left: 40, width: 40, height: 40 }, size, vp, 'left').side).toBe('right');
    expect(computePosition({ top: 300, left: 900, width: 40, height: 40 }, size, vp, 'right').side).toBe('left');
  });
  it('houdt het paneel binnen het scherm', () => {
    const p = computePosition({ top: 300, left: 960, width: 30, height: 40 }, size, vp, 'bottom', 'start');
    expect(p.left).toBe(vp.width - size.width - 8);
    const q = computePosition({ top: 300, left: 2, width: 30, height: 40 }, size, vp, 'bottom', 'end');
    expect(q.left).toBe(8);
  });
});

describe('overlays: top layer', () => {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  let shown: HTMLElement[] = [];
  beforeEach(() => {
    shown = [];
    proto.showPopover = function (this: HTMLElement) { shown.push(this); };
    proto.hidePopover = function () {};
  });
  afterEach(() => { delete proto.showPopover; delete proto.hidePopover; });

  it('Menu opent als popover, blijft in de tabvolgorde en houdt het toetsenbordgedrag', async () => {
    render(<div style={{ overflow: 'hidden' }}><Menu trigger="Acties" items={[{ label: 'Delen', onSelect: () => {} }, { label: 'Wissen', onSelect: () => {} }]} /></div>);
    const trigger = screen.getByRole('button', { name: 'Acties' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('popover', 'manual');
    expect(shown).toContain(menu);
    expect(menu).toHaveAttribute('data-side', 'bottom');
    expect(screen.getByRole('menuitem', { name: 'Delen' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Wissen' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('Menu klapt naar links als rechts geen ruimte is', async () => {
    render(<Menu side="right" trigger="Meer" items={[{ label: 'Delen', onSelect: () => {} }]} />);
    const trigger = screen.getByRole('button', { name: 'Meer' });
    trigger.getBoundingClientRect = () => ({ top: 100, left: window.innerWidth - 30, width: 24, height: 24, right: window.innerWidth - 6, bottom: 124, x: 0, y: 0, toJSON() {} });
    await userEvent.click(trigger);
    expect(screen.getByRole('menu')).toHaveAttribute('data-side', 'left');
  });

  it('Tooltip opent als popover aan de gekozen kant', async () => {
    render(<Tooltip content="Volgende plaat" placement="right"><IconButton label="Volgende" icon={<icons.ArrowRight />} /></Tooltip>);
    await userEvent.tab();
    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveAttribute('popover', 'manual');
    expect(tip).toHaveAttribute('data-side', 'right');
    expect(shown).toContain(tip);
  });

  it('zonder Popover API valt het terug op een vast paneel zonder popover-attribuut', async () => {
    delete proto.showPopover;
    render(<Menu trigger="Acties" items={[{ label: 'Delen', onSelect: () => {} }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Acties' }));
    expect(screen.getByRole('menu')).not.toHaveAttribute('popover');
    expect(screen.getByRole('menuitem', { name: 'Delen' })).toHaveFocus();
  });
});

describe('refs', () => {
  it('elk component geeft zijn ref door', () => {
    const r = {
      dialog: createRef<HTMLDialogElement>(), sheet: createRef<HTMLDialogElement>(), menu: createRef<HTMLButtonElement>(),
      tabs: createRef<HTMLDivElement>(), list: createRef<HTMLDivElement>(), tab: createRef<HTMLButtonElement>(), panel: createRef<HTMLDivElement>(),
      radio: createRef<HTMLFieldSetElement>(), seg: createRef<HTMLDivElement>(), avatar: createRef<HTMLSpanElement>(), skeleton: createRef<HTMLSpanElement>(),
      field: createRef<HTMLDivElement>(), select: createRef<HTMLSelectElement>(), area: createRef<HTMLTextAreaElement>(), input: createRef<HTMLInputElement>(),
    };
    render(<>
      <Dialog ref={r.dialog} open={false} onClose={() => {}} title="D" />
      <Sheet ref={r.sheet} open={false} onClose={() => {}} title="S" />
      <Menu ref={r.menu} trigger="M" items={[]} />
      <Tabs ref={r.tabs} defaultValue="a"><TabList ref={r.list} label="T"><Tab ref={r.tab} value="a">A</Tab></TabList><TabPanel ref={r.panel} value="a">A</TabPanel></Tabs>
      <RadioGroup ref={r.radio} legend="R" options={[{ value: 'a', label: 'A' }]} />
      <SegmentedControl ref={r.seg} label="G" options={[{ value: 'a', label: 'A' }]} />
      <Avatar ref={r.avatar} name="D M" /><Skeleton ref={r.skeleton} />
      <Field ref={r.field} label="F">{(c) => <input {...c} />}</Field>
      <Select ref={r.select} label="S" options={[]} /><TextArea ref={r.area} label="A" /><TextField ref={r.input} label="I" prefix="€" />
    </>);
    expect(r.dialog.current).toBeInstanceOf(HTMLDialogElement);
    expect(r.sheet.current).toBeInstanceOf(HTMLDialogElement);
    expect(r.menu.current).toHaveAttribute('aria-haspopup', 'menu');
    expect(r.tabs.current).toHaveClass('pp-tabs');
    expect(r.list.current).toHaveAttribute('role', 'tablist');
    expect(r.tab.current).toHaveAttribute('role', 'tab');
    expect(r.panel.current).toHaveAttribute('role', 'tabpanel');
    expect(r.radio.current).toBeInstanceOf(HTMLFieldSetElement);
    expect(r.seg.current).toHaveAttribute('role', 'radiogroup');
    expect(r.avatar.current).toHaveClass('pp-avatar');
    expect(r.skeleton.current).toHaveClass('pp-skeleton');
    expect(r.field.current).toHaveClass('pp-field');
    expect(r.select.current).toBeInstanceOf(HTMLSelectElement);
    expect(r.area.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(r.input.current).toBeInstanceOf(HTMLInputElement);
  });

  it('Dialog werkt nog met een eigen ref', async () => {
    const ref = createRef<HTMLDialogElement>();
    const { rerender } = render(<Dialog ref={ref} open={false} onClose={() => {}} title="D" />);
    rerender(<Dialog ref={ref} open onClose={() => {}} title="D" />);
    expect(ref.current).toHaveAttribute('open');
  });
});

describe('cascade', () => {
  it('alle Papier-CSS staat in @layer papier', () => {
    const root = join(process.cwd(), 'src/');
    const files = [
      ...readdirSync(`${root}components`).filter((f) => f.endsWith('.css')).map((f) => `${root}components/${f}`),
      `${root}styles/base.css`, `${root}styles/forced-colors.css`, `${root}styles/tokens.css`,
    ];
    expect(files.length).toBeGreaterThan(20);
    for (const f of files) {
      const css = readFileSync(f, 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '');
      expect(css.startsWith('@layer papier {'), f).toBe(true);
      expect(css.trimEnd().endsWith('}'), f).toBe(true);
    }
  });
});
