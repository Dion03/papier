import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
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
}

/**
 * Button. `primary` is the moss action from the portfolio cases, `ink` the dark
 * control. Loading uses aria-disabled instead of disabled so focus is never lost.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, iconStart, iconEnd, fullWidth, className, children, onClick, type = 'button', disabled, ...rest }, ref,
) {
  const blocked = loading || disabled;
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (blocked) { e.preventDefault(); return; }
    onClick?.(e);
  };
  return (
    <button
      ref={ref}
      type={type}
      className={cx('pp-button', className)}
      data-variant={variant}
      data-size={size}
      data-full={fullWidth || undefined}
      data-loading={loading || undefined}
      aria-disabled={blocked || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {loading ? <Spinner /> : iconStart}
      <span className="pp-button__label">{children}</span>
      {!loading && iconEnd && <span className="pp-button__end">{iconEnd}</span>}
    </button>
  );
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name; required because the button only shows an icon. */
  label: string;
  icon: ReactNode;
  /** `disc` is the portfolio's ink circle that turns vermilion on hover. */
  variant?: 'disc' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'outline', size = 'md', className, type = 'button', ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cx('pp-icon-button', className)} data-variant={variant} data-size={size} {...rest}>
      {icon}
    </button>
  );
});
