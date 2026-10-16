import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export type TextRole = 'display' | 'headline' | 'title' | 'subtitle' | 'body' | 'body-lg' | 'small' | 'label';

const defaultElement: Record<TextRole, ElementType> = {
  display: 'h1', headline: 'h2', title: 'h3', subtitle: 'p', body: 'p', 'body-lg': 'p', small: 'p', label: 'span',
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Typographic role from the Papier scale. */
  variant?: TextRole;
  /** Element to render; defaults to a sensible tag per variant. */
  as?: ElementType;
  tone?: 'default' | 'muted' | 'accent';
}

/** Text in one of Papier's type roles. Display roles use Manrope, the rest DM Sans. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { variant = 'body', as, tone = 'default', className, style, ...rest }, ref,
) {
  const Tag = as ?? defaultElement[variant];
  const roleStyle: CSSProperties = {
    fontSize: `var(--papier-type-${variant}-size)`,
    lineHeight: `var(--papier-type-${variant}-line)`,
    fontWeight: `var(--papier-type-${variant}-weight)` as CSSProperties['fontWeight'],
    letterSpacing: `var(--papier-type-${variant}-tracking)`,
  };
  return (
    <Tag
      ref={ref}
      className={cx('pp-text', className)}
      data-role={variant}
      data-tone={tone === 'default' ? undefined : tone}
      style={{ ...roleStyle, ...style }}
      {...rest}
    />
  );
});
