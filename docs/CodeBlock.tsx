import { CopyButton } from '@dionbm/papier';

/** A code sample with a copy button, for guides. */
export function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="doc-codeblock">
      <pre className="doc-code" tabIndex={0} aria-label={label}><code>{code}</code></pre>
      <CopyButton value={code} className="doc-codeblock__copy" />
    </div>
  );
}
