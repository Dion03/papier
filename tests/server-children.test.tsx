// A server component's child reaches a client component as a lazy node, not an element.
// These build the same node React's Flight client does, already loaded, as in a real app.
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, IconButton, Link, Popover, Tooltip, icons } from '../src';

function fromServer(el: ReactElement): ReactElement {
  const payload = Object.assign(Promise.resolve(el), { status: 'fulfilled', value: el });
  return { $$typeof: Symbol.for('react.lazy'), _payload: payload, _init: (p: typeof payload) => p.value } as unknown as ReactElement;
}

describe('children from a server component', () => {
  it('Button asChild renders the link with the button look', () => {
    render(<Button asChild variant="ink">{fromServer(<a href="/teams">Teams</a>)}</Button>);
    const link = screen.getByRole('link', { name: 'Teams' });
    expect(link).toHaveAttribute('href', '/teams');
    expect(link).toHaveClass('pp-button');
    expect(link).toHaveAttribute('data-variant', 'ink');
  });

  it('IconButton and Link asChild do the same', () => {
    render(<>
      <IconButton asChild label="Home" icon={<icons.ArrowRight />}>{fromServer(<a href="/" />)}</IconButton>
      <Link asChild>{fromServer(<a href="/about">About</a>)}</Link>
    </>);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('pp-icon-button');
    expect(screen.getByRole('link', { name: 'About' })).toHaveClass('pp-link');
  });

  it('Tooltip describes its child', async () => {
    render(<Tooltip content="Opens the squad" delay={0}>{fromServer(<button type="button">Squad</button>) as ReactElement<Record<string, unknown>>}</Tooltip>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Squad' })).toHaveAccessibleDescription('Opens the squad');
  });

  it('Popover opens from its trigger', async () => {
    render(<Popover title="Filters" trigger={fromServer(<button type="button">Filters</button>) as ReactElement<Record<string, unknown>>}>
      <p>Panel</p>
    </Popover>);
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
  });
});
