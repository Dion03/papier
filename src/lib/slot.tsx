import {
  Children, cloneElement, forwardRef, isValidElement, useMemo, version,
  type MutableRefObject, type ReactElement, type ReactNode, type Ref,
} from 'react';
import { cx } from './cx';

type AnyProps = Record<string, unknown>;

/** Calls every ref with the same node. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const r of refs) {
      if (typeof r === 'function') r(node);
      else if (r) (r as MutableRefObject<T | null>).current = node;
    }
  };
}

export function useMergedRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return useMemo(() => mergeRefs(...refs), refs);
}

const major = Number(version.split('.')[0]);
/** React 19 keeps ref in props; React 18 on the element. */
function elementRef(el: ReactElement): Ref<unknown> | undefined {
  return major >= 19 ? (el.props as { ref?: Ref<unknown> }).ref : (el as unknown as { ref?: Ref<unknown> }).ref;
}

/**
 * Papier's props win for data attributes; the child's own className, style and
 * handlers are kept. Papier's handler runs first, and a preventDefault there
 * (a blocked Button) skips the child's handler, as router links already do.
 */
function mergeProps(slot: AnyProps, child: AnyProps): AnyProps {
  const out: AnyProps = { ...child, ...slot };
  for (const key of Object.keys(child)) {
    const s = slot[key];
    const c = child[key];
    if (/^on[A-Z]/.test(key) && typeof s === 'function' && typeof c === 'function') {
      out[key] = (e: { defaultPrevented?: boolean }, ...args: unknown[]) => {
        s(e, ...args);
        if (!e?.defaultPrevented) c(e, ...args);
      };
    } else if (key === 'className') out[key] = cx(slot[key] as string, c as string);
    else if (key === 'style') out[key] = { ...(c as object), ...(s as object) };
    else if (s === undefined) out[key] = c;
  }
  return out;
}

/**
 * Renders its only child with Papier's props merged in. This is what `asChild`
 * uses, so a Button or Link can be a Next.js or React Router link.
 */
export const Slot = forwardRef<HTMLElement, AnyProps & { children?: ReactNode }>(function Slot({ children, ...props }, ref) {
  const child = Children.only(children);
  if (!isValidElement(child)) return null;
  return cloneElement(child, { ...mergeProps(props, child.props as AnyProps), ref: mergeRefs(ref, elementRef(child)) } as AnyProps);
});

/** The single child of an `asChild` component, with its children replaced by `render(children)`. */
export function slotChild(children: ReactNode, render: (inner: ReactNode) => ReactNode): ReactElement {
  const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
  return cloneElement(child, undefined, render(child.props.children));
}
