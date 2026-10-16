// Reads every exported *Props type from src/index.ts with the TypeScript compiler and
// writes docs/props.json: own props only (not the inherited HTML attributes), with
// type, default value from the component's destructuring and the JSDoc comment.
// `--check` exits 1 when docs/props.json is out of date, so `npm run check` catches it.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = `${root}docs/props.json`;
const program = ts.createProgram([`${root}src/index.ts`], {
  jsx: ts.JsxEmit.ReactJSX, strict: true, allowJs: true, target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true,
});
const checker = program.getTypeChecker();
const index = program.getSourceFile(`${root}src/index.ts`);
const own = (decl) => decl.getSourceFile().fileName.replace(/\\/g, '/').includes('/src/');

/** Default values from `function Name({ a = 1, b = 'x' })`, wherever the component is defined. */
function defaultsOf(component) {
  const found = {};
  for (const sf of program.getSourceFiles()) {
    if (!own(sf)) continue;
    const visit = (node) => {
      const named = (ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) && node.name?.text === component;
      const param = named ? node.parameters[0] : undefined;
      if (param && ts.isObjectBindingPattern(param.name)) {
        for (const el of param.name.elements) {
          if (el.initializer && ts.isIdentifier(el.propertyName ?? el.name)) found[(el.propertyName ?? el.name).text] = el.initializer.getText();
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return found;
}

const result = {};
for (const exp of checker.getExportsOfModule(checker.getSymbolAtLocation(index))) {
  if (!/Props$/.test(exp.name)) continue;
  const sym = exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
  const type = checker.getDeclaredTypeOfSymbol(sym);
  const component = exp.name.replace(/Props$/, '');
  const defaults = defaultsOf(component);
  const props = [];
  for (const p of checker.getPropertiesOfType(type)) {
    const decl = p.declarations?.find(own);
    if (!decl) continue;
    const resolved = checker.getTypeOfSymbolAtLocation(p, decl);
    let typeText = decl.type ? decl.type.getText().replace(/\s+/g, ' ') : checker.typeToString(resolved);
    // A named union of literals (ButtonVariant) reads better spelled out.
    const plain = checker.getNonNullableType(resolved);
    if (/^[A-Z]\w*$/.test(typeText) && plain.isUnion() && plain.types.every((t) => t.isStringLiteral())) typeText = plain.types.map((t) => `'${t.value}'`).join(' | ');
    props.push({
      name: p.name,
      type: typeText,
      required: !(p.flags & ts.SymbolFlags.Optional),
      default: defaults[p.name] ?? null,
      doc: ts.displayPartsToString(p.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim(),
    });
  }
  props.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
  if (props.length) result[component] = props;
}

const json = `${JSON.stringify(result, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (!existsSync(out) || readFileSync(out, 'utf8').replace(/\r\n/g, '\n') !== json) {
    console.error('docs/props.json is out of date: run node scripts/build-props.mjs');
    process.exit(1);
  }
  console.log(`props ok: ${Object.keys(result).length} components`);
} else {
  writeFileSync(out, json);
  console.log(`props written: ${Object.keys(result).length} components`);
}
