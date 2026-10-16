import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import { Check, Close } from './icons';
import { useLabels } from '../lib/labels';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

export interface NoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: NoticeTone;
  title?: ReactNode;
  /** Announce changes: `polite` for results, `assertive` only for errors that block. Default depends on tone. */
  live?: 'off' | 'polite' | 'assertive';
  /** A recovery or follow-up action, e.g. a Button. */
  action?: ReactNode;
  onDismiss?: () => void;
  /** Replaces the tone's mark, e.g. a Spinner while something is still running. Decorative. */
  icon?: ReactNode;
}

const glyph: Record<NoticeTone, string> = { info: 'i', success: '', warning: '!', danger: '!' };

/** An inline status message with its own icon and words, so colour is never the only signal. */
export const Notice = forwardRef<HTMLDivElement, NoticeProps>(function Notice(
  { tone = 'info', title, live, action, onDismiss, icon, className, children, ...rest }, ref,
) {
  const labels = useLabels();
  const mode = live ?? (tone === 'danger' ? 'assertive' : 'polite');
  return (
    <div
      ref={ref}
      className={cx('pp-notice', className)}
      data-tone={tone}
      role={mode === 'assertive' ? 'alert' : mode === 'polite' ? 'status' : undefined}
      {...rest}
    >
      <span className="pp-notice__icon" data-custom={icon ? true : undefined} aria-hidden="true">{icon ?? (tone === 'success' ? <Check width={15} height={15} /> : glyph[tone])}</span>
      <div className="pp-notice__body">
        {title && <p className="pp-notice__title">{title}</p>}
        {children && <div className="pp-notice__text">{children}</div>}
        {action && <div className="pp-notice__action">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="pp-notice__dismiss" onClick={onDismiss} aria-label={labels.dismiss}><Close width={16} height={16} /></button>
      )}
    </div>
  );
});
