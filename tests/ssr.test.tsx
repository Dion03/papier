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
          </P.Stack></P.Container>
        </P.ToastProvider>
      </P.Papier>,
    );
    expect(html).toContain('pp-button');
    expect(html).toContain('data-papier-theme="system"');
  });
});
