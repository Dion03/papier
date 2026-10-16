// @vitest-environment node
import { renderToString } from 'react-dom/server';
import * as P from '../src';

describe('server rendering (Next.js)', () => {
  it('rendert alle componenten zonder window', () => {
    expect(typeof window).toBe('undefined');
    const html = renderToString(
      <P.Papier theme="system">
        <P.ToastProvider>
          <P.Container><P.Stack>
            <P.Text variant="display">Kop</P.Text>
            <P.Button>Knop</P.Button><P.IconButton label="x" icon={<P.icons.Plus />} />
            <P.Link href="#">Link</P.Link><P.Surface>s</P.Surface><P.Tag>t</P.Tag><P.Notice title="n" />
            <P.Progress label="p" value={1} /><P.TextField label="t" /><P.TextArea label="a" /><P.Select label="s" options={[{ value: 'a', label: 'A' }]} />
            <P.Checkbox label="c" /><P.Switch label="s" /><P.Slider label="v" /><P.RadioGroup legend="r" options={[{ value: 'a', label: 'A' }]} />
            <P.SegmentedControl label="g" options={[{ value: 'a', label: 'A' }]} />
            <P.Tabs defaultValue="a"><P.TabList label="t"><P.Tab value="a">A</P.Tab></P.TabList><P.TabPanel value="a">A</P.TabPanel></P.Tabs>
            <P.Disclosure summary="d">x</P.Disclosure><P.Tooltip content="t"><button>b</button></P.Tooltip>
            <P.Menu trigger="m" items={[{ label: 'i', onSelect: () => {} }]} /><P.Table caption="c"><tbody><tr><td>1</td></tr></tbody></P.Table>
            <P.Skeleton /><P.Avatar name="D M" /><P.Spinner />
            <P.Dialog open={false} onClose={() => {}} title="d" /><P.Sheet open={false} onClose={() => {}} title="s" />
            <P.Button asChild><a href="/werk">Werk</a></P.Button><P.Link asChild><a href="/over">Over</a></P.Link>
            <P.IconButton asChild label="Home" icon={<P.icons.ArrowLeft />}><a href="/" /></P.IconButton>
            <P.Field label="f" hint="h">{(c) => <input {...c} />}</P.Field><P.TextField label="prijs" prefix="€" suffix="incl. btw" />
            <P.Combobox label="c" options={[{ value: 'a', label: 'A' }]} defaultValue="a" name="c" />
            <P.AlertDialog open={false} onClose={() => {}} onConfirm={() => {}} title="a" confirmLabel="Ja, weg" />
            <P.Breadcrumb><P.BreadcrumbItem href="/">Home</P.BreadcrumbItem><P.BreadcrumbItem>Hier</P.BreadcrumbItem></P.Breadcrumb>
            <P.Pagination page={2} pageCount={9} getHref={(p) => `?p=${p}`} />
            <P.Popover trigger={<button>p</button>} title="t">x</P.Popover>
            <P.NumberField label="n" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'EUR' }} name="n" />
            <P.PasswordField label="w" /><P.FileField label="f" multiple /><P.TextArea label="a" autoResize />
            <P.Checkbox label="c" indeterminate /><P.CheckboxGroup legend="g" options={[{ value: 'a', label: 'A' }]} />
            <P.Accordion type="single"><P.Disclosure summary="d">x</P.Disclosure></P.Accordion>
            <P.Tabs defaultValue="a" orientation="vertical"><P.TabList label="t"><P.Tab value="a">A</P.Tab></P.TabList><P.TabPanel value="a">A</P.TabPanel></P.Tabs>
            <P.ToggleGroup label="t" options={[{ value: 'a', label: 'A' }]} /><P.Toggle>t</P.Toggle>
            <P.Table caption="s"><thead><tr><P.SortHeader onSort={() => {}} sort="ascending">T</P.SortHeader></tr></thead></P.Table>
            <P.Separator label="of" /><P.Kbd>K</P.Kbd><P.EmptyState title="Leeg" />
            <P.Menu trigger="m" items={[{ type: 'label', label: 'g' }, { type: 'checkbox', label: 'c', checked: true }, { type: 'separator' }]} />
            <P.MultiCombobox label="m" options={[{ value: 'a', label: 'A' }]} defaultValue={['a']} name="m" />
            <P.RangeSlider label="r" defaultValue={[10, 40]} marks={[0, 50]} />
            <P.Calendar defaultValue="2024-03-15" /><P.RangeCalendar defaultValue={{ start: '2024-03-11', end: '2024-03-20' }} />
            <P.DateRangePicker label="v" defaultValue={{ start: '2024-03-11', end: null }} startName="a" endName="b" /><P.DatePicker label="d" defaultValue="2024-03-15" name="d" />
            <P.Menu trigger="m" side="left" items={[]} /><P.Tooltip content="t" placement="right"><button>b</button></P.Tooltip>
          </P.Stack></P.Container>
        </P.ToastProvider>
      </P.Papier>,
    );
    expect(html).toContain('pp-button');
    expect(html).toContain('data-papier-theme="system"');
    expect(html).toMatch(/<a(?=[^>]*class="pp-button")(?=[^>]*href="\/werk")/);
    expect(html).toContain('pp-field__group');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toMatch(/ popover=/);
    expect(html).toContain('role="spinbutton"');
    expect(html).toMatch(/1\.234,5/);
    expect(html).toContain('aria-sort="ascending"');
    expect(html).toContain('pp-multi__tag');
    expect(html).toContain('15-03-2024');
    expect(html).toContain('role="grid"');
  });
});
