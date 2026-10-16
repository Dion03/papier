import { useState, type ReactNode } from 'react';
import { Button, Disclosure, Tag, Text } from '@dionbm/papier';

export interface PropRow { name: string; type: string; note: string }

interface ExampleProps {
  id: string;
  name: string;
  intro: ReactNode;
  children: ReactNode;
  code: string;
  a11y: string[];
  props?: PropRow[];
}

/** One component on the docs page: live demo, code, accessibility promises and props. */
export function Example({ id, name, intro, children, code, a11y, props }: ExampleProps) {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied('ok'); }
    catch { setCopied('fail'); }
    window.setTimeout(() => setCopied('idle'), 2200);
  };
  return (
    <article className="doc-example" id={id} aria-labelledby={`${id}-title`}>
      <header className="doc-example__head">
        <Text variant="title" as="h3" id={`${id}-title`}>{name}</Text>
        <Text tone="muted" className="doc-example__intro">{intro}</Text>
      </header>
      <div className="doc-example__stage">{children}</div>
      <div className="doc-example__code">
        <pre tabIndex={0} aria-label={`Codevoorbeeld ${name}`}><code>{code}</code></pre>
        <Button size="sm" variant="secondary" onClick={copy} className="doc-example__copy">
          {copied === 'ok' ? 'Gekopieerd' : copied === 'fail' ? 'Kopiëren mislukt' : 'Kopieer code'}
        </Button>
        <span className="pp-visually-hidden" role="status">{copied === 'ok' ? 'Code gekopieerd' : copied === 'fail' ? 'Kopiëren mislukt, selecteer de code handmatig' : ''}</span>
      </div>
      <div className="doc-example__notes">
        <div>
          <Text variant="label" as="h4" className="doc-example__notes-title">Toegankelijkheid</Text>
          <ul className="doc-list">{a11y.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
        {props && (
          <Disclosure summary={<>Props <Tag tone="outline">{props.length}</Tag></>}>
            <table className="doc-props">
              <thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Toelichting</th></tr></thead>
              <tbody>{props.map((p) => <tr key={p.name}><th scope="row"><code>{p.name}</code></th><td><code>{p.type}</code></td><td>{p.note}</td></tr>)}</tbody>
            </table>
          </Disclosure>
        )}
      </div>
    </article>
  );
}
