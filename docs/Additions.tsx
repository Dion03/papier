import { useState } from 'react';
import { Button, Command, CommandDialog, CopyButton, Kbd, Notice, PinInput, Stack, Steps, Surface, Text, TextField, icons, useToast, type CommandItem } from '@dionbm/papier';
import { Example } from './Example';

function CommandDemo() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const run = (what: string) => () => toast({ title: what, description: 'Gekozen in het opdrachtenvenster.' });
  const items: CommandItem[] = [
    { id: 'play', group: 'Afspelen', label: 'Speel kant A', icon: <icons.Play />, shortcut: 'Spatie', onSelect: run('Kant A speelt') },
    { id: 'pause', group: 'Afspelen', label: 'Pauzeer', icon: <icons.Pause />, onSelect: run('Gepauzeerd') },
    { id: 'add', group: 'Collectie', label: 'Plaat toevoegen', description: 'Zoek in Discogs of scan een barcode', icon: <icons.Plus />, keywords: ['nieuw', 'scan'], onSelect: run('Plaat toevoegen') },
    { id: 'export', group: 'Collectie', label: 'Exporteer als CSV', icon: <icons.External />, keywords: ['download', 'spreadsheet'], onSelect: run('Export gestart') },
    { id: 'sync', group: 'Collectie', label: 'Synchroniseer met Discogs', icon: <icons.Copy />, disabled: true, description: 'Eerst inloggen', onSelect: run('Sync') },
    { id: 'theme', group: 'Instellingen', label: 'Donker thema', icon: <icons.Moon />, keywords: ['dark', 'nacht'], onSelect: run('Donker thema') },
  ];
  return (
    <Stack gap={5}>
      <div className="doc-row">
        <Button variant="secondary" iconStart={<icons.Search />} onClick={() => setOpen(true)}>Opdrachten <Kbd>Ctrl</Kbd><Kbd>J</Kbd></Button>
        <Text variant="small" tone="muted">Of typ hieronder: het werkt ook in de pagina.</Text>
      </div>
      <Surface material="paper" elevation="raised" padding="none" radius="lg" className="doc-command-inline">
        <Command label="Opdrachten" placeholder="Typ een opdracht of zoek…" items={items} hideHints />
      </Surface>
      <CommandDialog open={open} onClose={() => setOpen(false)} label="Opdrachten" placeholder="Typ een opdracht of zoek…" items={items} />
    </Stack>
  );
}

function CopyDemo() {
  const install = 'npm install @dionbm/papier';
  return (
    <Stack gap={4} className="doc-narrow">
      <div className="doc-import doc-import--block"><code>{install}</code><CopyButton value={install} /></div>
      <TextField label="Deellink voor je collectie" readOnly defaultValue="https://papier.dionbm.nl/c/dion" suffix={<icons.External />} />
      <div className="doc-row"><CopyButton value="https://papier.dionbm.nl/c/dion" variant="ink" size="md">Kopieer deellink</CopyButton></div>
    </Stack>
  );
}

function StepsDemo() {
  const [step, setStep] = useState(1);
  const items = [
    { title: 'Winkelmand', description: '3 platen' },
    { title: 'Bezorging', description: 'Adres en moment' },
    { title: 'Betalen', description: 'iDEAL of kaart' },
    { title: 'Klaar' },
  ];
  return (
    <Stack gap={5}>
      <Steps items={items} current={step} onStepClick={setStep} label="Afrekenen" />
      <Surface material="sunken" padding="md" radius="lg">
        <Text variant="subtitle" as="p">{items[step].title}</Text>
        <Text tone="muted" variant="small" as="p">{step < items.length - 1 ? 'Ga verder, of klik op een eerdere stap om terug te gaan.' : 'Je bestelling is geplaatst.'}</Text>
      </Surface>
      <div className="doc-row">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)} iconStart={<icons.ArrowLeft className="pp-flip-rtl" />}>Terug</Button>
        <Button variant="ink" disabled={step === items.length - 1} onClick={() => setStep((s) => s + 1)} iconEnd={<icons.ArrowRight className="pp-flip-rtl" />}>Verder</Button>
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
      <PinInput label="Inlogcode" hint="We stuurden een code van zes cijfers naar je telefoon. Probeer 424242." value={code}
        onValueChange={(v) => { setCode(v); if (state !== 'checking') setState('idle'); }} onComplete={check}
        error={state === 'wrong' ? 'Deze code klopt niet. Controleer de sms en probeer het opnieuw.' : undefined} disabled={state === 'checking'} />
      <div aria-live="polite">
        {state === 'checking' && <Text variant="small" tone="muted">Code controleren…</Text>}
        {state === 'ok' && <Notice tone="success" title="Ingelogd">Welkom terug.</Notice>}
      </div>
    </Stack>
  );
}

/** Components added in 0.5: Command, CopyButton, Steps and PinInput. */
export function AdditionExamples() {
  return (
    <>
      <Example id="command" api={['Command', 'CommandDialog']} name="Command" intro="Een opdrachtenlijst die meezoekt, zoals ⌘K in een editor. Als venster boven alles of rechtstreeks in de pagina; de zoekfunctie van deze site is er een."
        code={`const items: CommandItem[] = [
  { id: 'play', group: 'Afspelen', label: 'Speel kant A', icon: <icons.Play />, shortcut: 'Spatie', onSelect: play },
  { id: 'add', group: 'Collectie', label: 'Plaat toevoegen', keywords: ['nieuw', 'scan'], onSelect: add },
];

<CommandDialog open={open} onClose={() => setOpen(false)} label="Opdrachten" items={items} />
<Command label="Opdrachten" items={items} />   // in de pagina`}
        a11y={['Het zoekveld is een combobox met een gegroepeerde listbox; aria-activedescendant wijst het actieve item aan, de focus blijft in het veld.', 'Pijl omhoog en omlaag bewegen en lopen rond, PageUp en PageDown springen, Enter voert uit. Uitgeschakelde items worden overgeslagen.', 'Het aantal resultaten wordt beleefd voorgelezen. Elk woord van de zoekopdracht moet ergens passen: label, trefwoord of beschrijving.', 'CommandDialog is een native modale dialog: Escape of een klik ernaast sluit, en de focus keert terug naar wat hem opende.']}>
        <CommandDemo />
      </Example>

      <Example id="kopieren" api={['CopyButton']} name="CopyButton" intro="Kopieert tekst naar het klembord en bevestigt het op dezelfde plek: het icoon wordt een vinkje en het resultaat wordt voorgelezen. De codevoorbeelden op deze site gebruiken hem."
        code={`<CopyButton value="npm install @dionbm/papier" />
<CopyButton value={() => editor.getValue()}>Kopieer code</CopyButton>`}
        a11y={['Zonder tekst heet de knop "Kopiëren"; met tekst verandert het label in "Gekopieerd".', 'Het resultaat, ook een mislukte kopie, staat in een live region naast de knop, zodat het geen deel wordt van de naam.', 'Zonder Clipboard API (http, oude browsers) valt hij terug op een verborgen tekstvak.']}>
        <CopyDemo />
      </Example>

      <Example id="stappen" api={['Steps']} name="Steps" intro="Voortgang door een flow van een paar stappen, zoals afrekenen of aanmelden. Voltooide stappen kunnen knoppen zijn om terug te gaan; latere stappen bereik je alleen door verder te gaan."
        code={`<Steps
  label="Afrekenen"
  current={step}
  onStepClick={setStep}
  items={[{ title: 'Winkelmand' }, { title: 'Bezorging' }, { title: 'Betalen' }, { title: 'Klaar' }]}
/>`}
        a11y={['Een benoemde nav met een geordende lijst; de huidige stap heeft aria-current="step".', 'Voltooide stappen zeggen "voltooid"; de stand staat ook in een nummer, vinkje of uitroepteken, nooit alleen in kleur.', 'Op smalle schermen houdt de rij alleen de titel van de huidige stap en "Stap 2 van 4".']}>
        <StepsDemo />
      </Example>

      <Example id="pincode" api={['PinInput']} name="PinInput" intro="Een code verdeeld over een paar vakjes, zoals een inlogcode uit een sms. Plakken en de sms-suggestie van je telefoon vullen alle vakjes in één keer."
        code={`<PinInput
  label="Inlogcode"
  hint="We stuurden een code naar je telefoon."
  value={code}
  onValueChange={setCode}
  onComplete={verify}
  error={wrong ? 'Deze code klopt niet.' : undefined}
/>`}
        a11y={['De vakjes vormen een groep met het label, de hint en de fout; elk vakje heet "Teken 2 van 6".', 'Het eerste vakje heeft autocomplete="one-time-code", zodat iOS en Android de code uit de sms aanbieden.', 'Typen gaat door naar het volgende vakje, Backspace terug; pijltjes, Home en End bewegen. Plakken vult vanaf het vakje waar je staat.']}>
        <PinDemo />
      </Example>
    </>
  );
}
