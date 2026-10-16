import {
  cloneElement, forwardRef, isValidElement, useEffect, useId, useRef,
  type MouseEvent, type ReactElement, type ReactNode, type RefObject,
} from 'react';
import { cx } from '../lib/cx';
import { useLabels } from '../lib/labels';
import { useControllable } from '../lib/useControllable';
import { supportsPopover, useAnchoredPopover, type Align, type Side } from '../lib/position';
import { Close } from './icons';

const FOCUSABLE = 'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex="-1"])';

export interface PopoverProps {
  /** One element that opens the popover, e.g. a Button. Its own onClick keeps working. */
  trigger: ReactElement<Record<string, unknown>>;
  /** Visible heading; also the accessible name of the panel. */
  title?: ReactNode;
  /** Accessible name when there is no visible title. */
  label?: string;
  /** Content, or a function that gets `close` for a button that applies and closes. */
  children: ReactNode | ((api: { close: () => void }) => ReactNode);
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side of the trigger; flips when there is no room. */
  side?: Side;
  align?: Align;
  /** Shows a close button in the corner. Escape and a click outside always close. */
  closeButton?: boolean;
  /** Element that gets focus on open. Defaults to the first control in the panel. */
  initialFocus?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * A non-modal panel next to its trigger for interactive content: filters, a quick form,
 * details. Focus moves in on open and back to the trigger on Escape; a click or focus
 * outside closes it. The panel opens in the top layer, right after the trigger in the
 * DOM, so Tab order stays natural. For content that must be answered, use Dialog.
 * The ref points at the panel.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, title, label, children, open: openProp, defaultOpen = false, onOpenChange, side = 'bottom', align = 'start', closeButton = true, initialFocus, className }, ref,
) {
  const labels = useLabels();
  const id = useId();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const wrap = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const setPanel = (node: HTMLDivElement | null) => {
    panel.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useAnchoredPopover(open, wrap, panel, side, align, 8);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) (wrap.current?.firstElementChild as HTMLElement | null)?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const p = panel.current;
    const target = initialFocus?.current ?? p?.querySelector<HTMLElement>(`.pp-popover__body :is(${FOCUSABLE})`) ?? p;
    target?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isValidElement(trigger)) return null;
  const own = trigger.props.onClick as ((e: MouseEvent) => void) | undefined;
  const titleId = `${id}-title`;
  const content = typeof children === 'function' ? children({ close: () => close() }) : children;

  return (
    <span
      ref={wrap}
      className="pp-popover"
      onBlur={(e) => { if (open && e.relatedTarget && !wrap.current?.contains(e.relatedTarget as Node)) close(false); }}
    >
      {cloneElement(trigger, {
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? `${id}-panel` : undefined,
        onClick: (e: MouseEvent) => { own?.(e); if (!e.defaultPrevented) setOpen(!open); },
      })}
      {open && (
        <div
          ref={setPanel}
          id={`${id}-panel`}
          role="dialog"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : label}
          tabIndex={-1}
          className={cx('pp-popover__panel', className)}
          popover={supportsPopover() ? 'manual' : undefined}
          onKeyDown={(e) => { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); close(); } }}
        >
          {(title || closeButton) && (
            <div className="pp-popover__header">
              {title && <h2 id={titleId} className="pp-popover__title">{title}</h2>}
              {closeButton && (
                <button type="button" className="pp-popover__close" aria-label={labels.close} onClick={() => close()}>
                  <Close width={16} height={16} />
                </button>
              )}
            </div>
          )}
          <div className="pp-popover__body">{content}</div>
        </div>
      )}
    </span>
  );
});
