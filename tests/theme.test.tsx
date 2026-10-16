import { render, screen } from '@testing-library/react';
import { Button, Papier, checkTheme, colorRoles, themeColors, themeStyle } from '../src';
import { themes } from '../src/tokens/tokens.mjs';

describe('eigen thema', () => {
  it('colorRoles zijn precies de kleurrollen uit tokens.mjs', () => {
    expect([...colorRoles].sort()).toEqual(Object.keys(themes.light).filter((k) => k !== 'shadow').sort());
    expect(themeColors('dark').bg).toBe(themes.dark.bg);
  });

  it('themeStyle zet alleen de gegeven rollen als CSS-variabelen', () => {
    expect(themeStyle({ action: '#1d4ed8', 'on-action': '#ffffff', danger: undefined })).toEqual({
      '--papier-color-action': '#1d4ed8', '--papier-color-on-action': '#ffffff',
    });
    render(<Papier style={themeStyle({ action: '#1d4ed8' })}><Button>Opslaan</Button></Papier>);
    expect(screen.getByRole('button').closest('.papier')).toHaveStyle({ '--papier-color-action': '#1d4ed8' });
  });

  it('checkTheme: de ingebouwde thema’s slagen, een te lichte merkkleur valt op', () => {
    expect(checkTheme({}).every((r) => r.ok)).toBe(true);
    expect(checkTheme({}, 'dark').every((r) => r.ok)).toBe(true);
    const failing = checkTheme({ action: '#93c5fd', 'on-action': '#ffffff' }).filter((r) => !r.ok);
    expect(failing.map((r) => `${r.foreground} op ${r.background}`)).toContain('on-action op action');
    expect(failing[0].ratio).toBeLessThan(4.5);
  });

  it('checkTheme meet alleen #rrggbb en meldt andere notaties als fout', () => {
    const r = checkTheme({ text: 'rebeccapurple' }).find((x) => x.foreground === 'text' && x.background === 'bg')!;
    expect(r.ok).toBe(false);
    expect(r.ratio).toBe(0);
  });
});
