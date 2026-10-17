import { useState } from 'react';
import { Button, Command, CommandDialog, CopyButton, Kbd, Notice, PinInput, Stack, Steps, Surface, Text, TextField, icons, useToast, type CommandItem } from '@dionbm/papier';
import { Example } from './Example';

function CommandDemo() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const run = (what: string) => () => toast({ title: what, description: 'Chosen in the command palette.' });
  const items: CommandItem[] = [
    { id: 'play', group: 'Playback', label: 'Play side A', icon: <icons.Play />, shortcut: 'Space', onSelect: run('Side A is playing') },
    { id: 'pause', group: 'Playback', label: 'Pause', icon: <icons.Pause />, onSelect: run('Paused') },
    { id: 'add', group: 'Collection', label: 'Add record', description: 'Search Discogs or scan a barcode', icon: <icons.Plus />, keywords: ['new', 'scan'], onSelect: run('Add record') },
    { id: 'export', group: 'Collection', label: 'Export as CSV', icon: <icons.External />, keywords: ['download', 'spreadsheet'], onSelect: run('Export started') },
    { id: 'sync', group: 'Collection', label: 'Sync with Discogs', icon: <icons.Copy />, disabled: true, description: 'Sign in first', onSelect: run('Sync') },
    { id: 'theme', group: 'Settings', label: 'Dark theme', icon: <icons.Moon />, keywords: ['dark', 'night'], onSelect: run('Dark theme') },
  ];
  return (
    <Stack gap={5}>
      <div className="doc-row">
        <Button variant="secondary" iconStart={<icons.Search />} onClick={() => setOpen(true)}>Commands <Kbd>Ctrl</Kbd><Kbd>J</Kbd></Button>
        <Text variant="small" tone="muted">Or type below: it works inline in the page too.</Text>
      </div>
      <Surface material="paper" elevation="raised" padding="none" radius="lg" className="doc-command-inline">
        <Command label="Commands" placeholder="Type a command or search…" items={items} hideHints />
      </Surface>
      <CommandDialog open={open} onClose={() => setOpen(false)} label="Commands" placeholder="Type a command or search…" items={items} />
    </Stack>
  );
}

function CopyDemo() {
  const install = 'npm install @dionbm/papier';
  return (
    <Stack gap={4} className="doc-narrow">
      <div className="doc-import doc-import--block"><code>{install}</code><CopyButton value={install} /></div>
      <TextField label="Share link for your collection" readOnly defaultValue="https://papier.dionbm.nl/c/dion" suffix={<icons.External />} />
      <div className="doc-row"><CopyButton value="https://papier.dionbm.nl/c/dion" variant="ink" size="md">Copy share link</CopyButton></div>
    </Stack>
  );
}

function StepsDemo() {
  const [step, setStep] = useState(1);
  const items = [
    { title: 'Basket', description: '3 records' },
    { title: 'Delivery', description: 'Address and time slot' },
    { title: 'Payment', description: 'iDEAL or card' },
    { title: 'Done' },
  ];
  return (
    <Stack gap={5}>
      <Steps items={items} current={step} onStepClick={setStep} label="Checkout" />
      <Surface material="sunken" padding="md" radius="lg">
        <Text variant="subtitle" as="p">{items[step].title}</Text>
        <Text tone="muted" variant="small" as="p">{step < items.length - 1 ? 'Continue, or click an earlier step to go back.' : 'Your order has been placed.'}</Text>
      </Surface>
      <div className="doc-row">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)} iconStart={<icons.ArrowLeft className="pp-flip-rtl" />}>Back</Button>
        <Button variant="ink" disabled={step === items.length - 1} onClick={() => setStep((s) => s + 1)} iconEnd={<icons.ArrowRight className="pp-flip-rtl" />}>Continue</Button>
      </div>
    </Stack>
  );
}

function PinDemo() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'wrong'>('idle');
  const check = (value: string) => {
    setState('checking');
    window.setTimeout(() => setState(value === '424242' ? 'ok' : 'wrong'), 700);
  };
  return (
    <Stack gap={4} className="doc-narrow">
      <PinInput label="Sign-in code" hint="We sent a six-digit code to your phone. Try 424242." value={code}
        onValueChange={(v) => { setCode(v); if (state !== 'checking') setState('idle'); }} onComplete={check}
        error={state === 'wrong' ? 'This code is incorrect. Check the text message and try again.' : undefined} disabled={state === 'checking'} />
      <div aria-live="polite">
        {state === 'checking' && <Text variant="small" tone="muted">Checking code…</Text>}
        {state === 'ok' && <Notice tone="success" title="Signed in">Welcome back.</Notice>}
      </div>
    </Stack>
  );
}

/** Components added in 0.5: Command, CopyButton, Steps and PinInput. */
export function AdditionExamples() {
  return (
    <>
      <Example id="command" api={['Command', 'CommandDialog']} name="Command" intro="A command list that filters as you type, like ⌘K in an editor. As a dialog above everything or inline in the page; this site's search is one."
        code={`const items: CommandItem[] = [
  { id: 'play', group: 'Playback', label: 'Play side A', icon: <icons.Play />, shortcut: 'Space', onSelect: play },
  { id: 'add', group: 'Collection', label: 'Add record', keywords: ['new', 'scan'], onSelect: add },
];

<CommandDialog open={open} onClose={() => setOpen(false)} label="Commands" items={items} />
<Command label="Commands" items={items} />   // inline in the page`}
        a11y={['The search field is a combobox with a grouped listbox; aria-activedescendant points to the active item while focus stays in the field.', 'Arrow up and down move and wrap around, PageUp and PageDown jump, Enter runs the command. Disabled items are skipped.', 'The number of results is announced politely. Every word of the query has to match somewhere: label, keyword or description.', 'CommandDialog is a native modal dialog: Escape or a click outside closes it, and focus returns to whatever opened it.']}>
        <CommandDemo />
      </Example>

      <Example id="kopieren" api={['CopyButton']} name="CopyButton" intro="Copies text to the clipboard and confirms it in place: the icon turns into a check mark and the result is announced. The code examples on this site use it."
        code={`<CopyButton value="npm install @dionbm/papier" />
<CopyButton value={() => editor.getValue()}>Copy code</CopyButton>`}
        a11y={['Without text the button is named "Copy"; with text the label changes to "Copied".', 'The result, including a failed copy, is placed in a live region next to the button, so it does not become part of its name.', 'Without the Clipboard API (http, old browsers) it falls back to a hidden text area.']}>
        <CopyDemo />
      </Example>

      <Example id="stappen" api={['Steps']} name="Steps" intro="Progress through a flow of a few steps, such as checkout or sign-up. Completed steps can be buttons to go back; later steps are only reached by continuing."
        code={`<Steps
  label="Checkout"
  current={step}
  onStepClick={setStep}
  items={[{ title: 'Basket' }, { title: 'Delivery' }, { title: 'Payment' }, { title: 'Done' }]}
/>`}
        a11y={['A labelled nav with an ordered list; the current step has aria-current="step".', 'Completed steps say "completed"; the state is also shown as a number, check mark or exclamation mark, never by colour alone.', 'On narrow screens the row keeps only the title of the current step and "Step 2 of 4".']}>
        <StepsDemo />
      </Example>

      <Example id="pincode" api={['PinInput']} name="PinInput" intro="A code split across a few boxes, like a sign-in code from a text message. Pasting and your phone's text message suggestion fill all boxes at once."
        code={`<PinInput
  label="Sign-in code"
  hint="We sent a code to your phone."
  value={code}
  onValueChange={setCode}
  onComplete={verify}
  error={wrong ? 'This code is incorrect.' : undefined}
/>`}
        a11y={['The boxes form a group with the label, hint and error; each box is named "Character 2 of 6".', 'The first box has autocomplete="one-time-code", so iOS and Android offer the code from the text message.', 'Typing moves to the next box, Backspace moves back; arrow keys, Home and End move between boxes. Pasting fills from the box you are in.']}>
        <PinDemo />
      </Example>
    </>
  );
}
