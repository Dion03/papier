import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Slot, slotChild } from '../lib/slot';
import { Spinner } from './icons';

export type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  /** Shows a spinner and blocks activation while keeping the button focusable. */
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  /**
   * Render the single child element (e.g. a router link) with the button's look
   * and behaviour instead of a <button>. Its children become the label.
   */
  asChild?: boolean;
}

/**
 * Button. `primary` is the moss action from the portfolio cases, `ink` the dark
 * control. Loading uses aria-disabled instead of disabled so focus is never lost.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, iconStart, iconEnd, fullWidth, asChild, className, children, onClick, type = 'button', disabled, ...rest }, ref,
) {
  const blocked = loading || disabled;
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (blocked) { e.preventDefault(); return; }
    onClick?.(e);
  };
  const props = {
    className: cx('pp-button', className),
    'data-variant': variant,
    'data-size': size,
    'data-full': fullWidth || undefined,
    'data-loading': loading || undefined,
    'aria-disabled': blocked || undefined,
    'aria-busy': loading || undefined,
    onClick: handleClick,
    ...rest,
  };
  const inner = (label: ReactNode) => (
    <>
      {loading ? <Spinner /> : iconStart}
      <span className="pp-button__label">{label}</span>
      {!loading && iconEnd && <span className="pp-button__end">{iconEnd}</span>}
    </>
  );
  if (asChild) return <Slot ref={ref} {...props}>{slotChild(children, inner)}</Slot>;
  return <button ref={ref} type={type} {...props}>{inner(children)}</button>;
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name; required because the button only shows an icon. */
  label: string;
  icon: ReactNode;
  /** `disc` is the portfolio's ink circle that turns vermilion on hover. */
  variant?: 'disc' | 'outline' | 'ghost';
  /** 36, 44 or 48 px. Use `sm` only next to other controls; md and lg meet the 44 px target. */
  size?: 'sm' | 'md' | 'lg';
  /** Render this element (e.g. a router link) instead of a <button>; it shows the icon. */
  asChild?: boolean;
  /** Only with `asChild`: the element to render. */
  children?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'outline', size = 'md', asChild, children, className, type = 'button', ...rest }, ref,
) {
  const props = { 'aria-label': label, title: label, className: cx('pp-icon-button', className), 'data-variant': variant, 'data-size': size, ...rest };
  if (asChild) return <Slot ref={ref} {...props}>{slotChild(children, () => icon)}</Slot>;
  return <button ref={ref} type={type} {...props}>{icon}</button>;
});
