import {
  forwardRef, useRef, useState, type ButtonHTMLAttributes, type ForwardedRef, type KeyboardEvent, type ReactElement, type ReactNode, type Ref,
} from 'react';
import { cx } from '../lib/cx';
import { useMergedRefs } from '../lib/slot';
import { useControllable } from '../lib/useControllable';
import { Check } from './icons';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Shown before the label; when pressed without one, a tick appears so state is never colour alone. */
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

/**
 * A button that stays pressed (aria-pressed), e.g. "Alleen vinyl" or a bold toggle. For an
 * icon-only toggle, give it an aria-label. For on/off settings, use Switch.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed: pressedProp, defaultPressed = false, onPressedChange, icon, size = 'md', className, children, onClick, type = 'button', ...rest }, ref,
) {
  const [pressed, setPressed] = useControllable(pressedProp, defaultPressed, onPressedChange);
  return (
    <button ref={ref} type={type} aria-pressed={pressed} className={cx('pp-toggle', className)} data-size={size}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) setPressed(!pressed); }} {...rest}>
      {icon
        ? <span className="pp-toggle__icon" aria-hidden="true">{icon}</span>
        : <Check className="pp-toggle__tick" width={14} height={14} strokeWidth={2.2} />}
      {children != null && <span className="pp-toggle__label">{children}</span>}
    </button>
  );
});

export interface ToggleOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Accessible name when the label is only an icon. */
  'aria-label'?: string;
}

export interface ToggleGroupProps<T extends string> {
  /** Accessible name for the group. */
  label: string;
  options: Array<ToggleOption<T>>;
  /** The pressed values, in the order of `options`. */
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (value: T[]) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

/**
 * Several toggles that can be pressed together, e.g. filters or text formatting. One Tab
 * stop: arrows, Home and End move between them, Space or Enter presses. For a single
 * choice between views, use SegmentedControl.
 */
export const ToggleGroup = forwardRef(function ToggleGroup<T extends string>(
  { label, options, value, defaultValue = [], onValueChange, size = 'md', disabled, className }: ToggleGroupProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [current, setCurrent] = useControllable<T[]>(value, defaultValue, onValueChange);
  const group = useRef<HTMLDivElement>(null);
  const groupRef = useMergedRefs(group, ref);
  const enabled = options.map((o, i) => (!o.disabled && !disabled ? i : -1)).filter((i) => i >= 0);
  const [focus, setFocus] = useState<number>(-1);
  const tabStop = enabled.includes(focus) ? focus : enabled[0] ?? -1;

  const toggle = (v: T) => {
    const set = new Set(current);
    if (set.has(v)) set.delete(v); else set.add(v);
    setCurrent(options.map((o) => o.value).filter((o) => set.has(o)));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = enabled.indexOf(tabStop);
    const rtl = group.current ? getComputedStyle(group.current).direction === 'rtl' : false;
    let n: number | null = null;
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') || e.key === 'ArrowDown') n = enabled[(at + 1) % enabled.length];
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') || e.key === 'ArrowUp') n = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') n = enabled[0];
    else if (e.key === 'End') n = enabled[enabled.length - 1];
    if (n === null || n === undefined) return;
    e.preventDefault();
    setFocus(n);
    group.current?.querySelectorAll<HTMLButtonElement>('.pp-toggle')[n]?.focus();
  };

  return (
    <div ref={groupRef} role="group" aria-label={label} className={cx('pp-toggle-group', className)} onKeyDown={onKeyDown}>
      {options.map((o, i) => (
        <Toggle key={o.value} size={size} icon={o.icon} pressed={current.includes(o.value)} disabled={disabled || o.disabled}
          aria-label={o['aria-label']} tabIndex={i === tabStop ? 0 : -1} onFocus={() => setFocus(i)} onPressedChange={() => toggle(o.value)}>
          {o.label}
        </Toggle>
      ))}
    </div>
  );
}) as <T extends string>(props: ToggleGroupProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement | null;
