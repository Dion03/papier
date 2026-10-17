import { createContext, useContext, type ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem, CopyButton, Tab, TabList, TabPanel, Tabs, Tag, Text, icons } from '@dionbm/papier';
import api from './props.json';
import { categoryById, orderedPages, pageByExample, relatedPages, type DocPage } from './registry';
import { href } from './router';
import { variantsFor } from './variants';

export interface PropRow { name: string; type: string; note: string }
interface ApiRow { name: string; type: string; required: boolean; default: string | null; doc: string }
const reference = api as Record<string, ApiRow[]>;

/** Which Example is on screen. Every Example is declared in one place and renders only on its own page. */
export const ActiveExample = createContext<string | null>(null);

interface ExampleProps {
  id: string;
  name: string;
  intro: ReactNode;
  children: ReactNode;
  code: string;
  a11y: string[];
  props?: PropRow[];
  /** Components whose full API reference, generated from the types, is shown. */
  api?: string[];
}

/** A live demo with its code in tabs; the stage is the real component, never a picture. */
export function Demo({ id, label, code, children, stageClass }: { id: string; label: string; code: string; children: ReactNode; stageClass?: string }) {
  return (
    <div className="doc-demo">
      <Tabs defaultValue="preview">
        <div className="doc-demo__bar">
          <TabList label={`${label}: example or code`}>
            <Tab value="preview">Example</Tab>
            <Tab value="code">Code</Tab>
          </TabList>
          <CopyButton value={code} aria-describedby={`${id}-copy-what`} />
          <span id={`${id}-copy-what`} hidden>Code of {label}</span>
        </div>
        <TabPanel value="preview" className="doc-demo__panel" tabIndex={-1}>
          <div className={stageClass ?? 'doc-example__stage'}>{children}</div>
        </TabPanel>
        <TabPanel value="code" className="doc-demo__panel">
          <pre className="doc-code" tabIndex={0} aria-label={`Code of ${label}`}><code>{code}</code></pre>
        </TabPanel>
      </Tabs>
    </div>
  );
}

function ImportLine({ names }: { names: string[] }) {
  const line = `import { ${names.join(', ')} } from '@dionbm/papier';`;
  return (
    <div className="doc-import">
      <code><span className="doc-import__kw">import</span> {'{ '}{names.join(', ')}{' }'} <span className="doc-import__kw">from</span> <span className="doc-import__str">'@dionbm/papier'</span>;</code>
      <CopyButton value={line} />
    </div>
  );
}

function PageHead({ page, name, intro }: { page: DocPage; name: string; intro: ReactNode }) {
  const category = categoryById.get(page.category)!;
  const props = page.exports.filter((e) => reference[e]).reduce((n, e) => n + reference[e].length, 0);
  return (
    <header className="doc-page__head">
      <Breadcrumb label="You are here">
        <BreadcrumbItem href={href('components')}>Components</BreadcrumbItem>
        <BreadcrumbItem href={href('category', category.id)}>{category.title}</BreadcrumbItem>
        <BreadcrumbItem>{page.title}</BreadcrumbItem>
      </Breadcrumb>
      <Text variant="headline" as="h1" id="page-title" tabIndex={-1} className="doc-page__title">{name}</Text>
      <Text variant="body-lg" tone="muted" className="doc-page__lead">{intro}</Text>
      <div className="doc-page__meta">
        {page.server ? <Tag tone="sage">Server component</Tag> : <Tag tone="outline">Client component</Tag>}
        {page.added && <Tag tone="accent">New in {page.added}</Tag>}
        {props > 0 && <Tag tone="outline">{props} props from the types</Tag>}
      </div>
      <ImportLine names={page.exports} />
    </header>
  );
}

function Section({ id, title, children, intro, base }: { id: string; title: string; children: ReactNode; intro?: ReactNode; base: string }) {
  return (
    <section id={id} className="doc-page__section" aria-labelledby={`${id}-title`}>
      <Text variant="title" as="h2" id={`${id}-title`} className="doc-page__h2">
        <a href={href('components', base, id)} className="doc-anchor" aria-hidden="true" tabIndex={-1}>#</a>
        {title}
      </Text>
      {intro && <Text tone="muted" className="doc-page__intro">{intro}</Text>}
      {children}
    </section>
  );
}

function ApiTable({ name }: { name: string }) {
  const rows = reference[name];
  return (
    <div className="doc-api">
      <Text variant="subtitle" as="h3" className="doc-api__name"><code>{name}</code> <Tag tone="outline">{rows.length}</Tag></Text>
      <div className="doc-props-wrap" role="region" aria-label={`Props of ${name}`} tabIndex={0}>
        <table className="doc-props">
          <caption className="pp-visually-hidden">All props of {name}, from the TypeScript types</caption>
          <thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.name}>
              <th scope="row"><code>{p.name}</code>{p.required && <span className="doc-required"> required</span>}</th>
              <td><code className="doc-type-code">{p.type}</code></td>
              <td>{p.default ? <code>{p.default}</code> : <span aria-label="none">–</span>}</td>
              <td>{p.doc}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/** Sections of a page, for the "On this page" list. */
export function sectionsOf(page: DocPage, hasApi: boolean): Array<{ id: string; title: string }> {
  return [
    { id: 'example', title: 'Example' },
    ...(variantsFor(page.example).length ? [{ id: 'variants', title: 'Variants and states' }] : []),
    { id: 'accessibility', title: 'Accessibility' },
    ...(hasApi ? [{ id: 'api', title: 'API' }] : []),
    { id: 'related', title: 'Related' },
  ];
}

/** One component page: header, live demo, variants, accessibility promises, API and related pages. */
export function Example({ id, name, intro, children, code, a11y, props, api: components = [] }: ExampleProps) {
  const active = useContext(ActiveExample);
  if (active !== id) return null;
  const page = pageByExample.get(id)!;
  const variants = variantsFor(id);
  const apiNames = components.filter((c) => reference[c]);
  const at = orderedPages.indexOf(page);
  const prev = orderedPages[at - 1];
  const next = orderedPages[at + 1];

  return (
    <article className="doc-page doc-example" id={id} aria-labelledby="page-title">
      <PageHead page={page} name={name} intro={intro} />

      <Section base={page.slug} id="example" title="Example">
        <Demo id={id} label={name} code={code}>{children}</Demo>
      </Section>

      {variants.length > 0 && (
        <Section base={page.slug} id="variants" title="Variants and states">
          <div className="doc-variants">
            {variants.map((v) => (
              <div key={v.title} className="doc-variant">
                <Text variant="subtitle" as="h3">{v.title}</Text>
                {v.description && <Text tone="muted" className="doc-page__intro">{v.description}</Text>}
                <Demo id={`${id}-${v.title}`} label={`${name}, ${v.title.toLowerCase()}`} code={v.code} stageClass="doc-variant__stage">{v.demo}</Demo>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section base={page.slug} id="accessibility" title="Accessibility">
        <ul className="doc-a11y">{a11y.map((line) => <li key={line}><icons.Check width={16} height={16} />{line}</li>)}</ul>
      </Section>

      {(apiNames.length > 0 || props) && (
        <Section base={page.slug} id="api" title="API" intro="From the TypeScript types, so never out of date. Inherited HTML attributes (such as className and aria-*) are not listed and work as usual.">
          {props && (
            <div className="doc-props-wrap" role="region" aria-label="Main props" tabIndex={0}>
              <table className="doc-props">
                <caption className="pp-visually-hidden">Main props</caption>
                <thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Description</th></tr></thead>
                <tbody>{props.map((p) => <tr key={p.name}><th scope="row"><code>{p.name}</code></th><td><code className="doc-type-code">{p.type}</code></td><td>{p.note}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {apiNames.map((c) => <ApiTable key={c} name={c} />)}
        </Section>
      )}

      <Section base={page.slug} id="related" title="Related">
        <ul className="doc-related">
          {relatedPages(page).map((p) => (
            <li key={p.slug}>
              <a href={href('components', p.slug)} className="doc-related__link">
                <span className="doc-related__cat">{categoryById.get(p.category)!.title}</span>
                <span className="doc-related__title">{p.title}</span>
                <span className="doc-related__summary">{p.summary}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <nav className="doc-pager" aria-label="Previous and next component">
        {prev ? <a href={href('components', prev.slug)} className="doc-pager__link" rel="prev"><span>Previous</span><strong><icons.ArrowLeft className="pp-flip-rtl" width={16} height={16} /> {prev.title}</strong></a> : <span />}
        {next && <a href={href('components', next.slug)} className="doc-pager__link doc-pager__link--next" rel="next"><span>Next</span><strong>{next.title} <icons.ArrowRight className="pp-flip-rtl" width={16} height={16} /></strong></a>}
      </nav>
    </article>
  );
}
