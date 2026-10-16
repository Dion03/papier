import { useCallback, useRef, useState } from 'react';

/** Supports both controlled (value + onChange) and uncontrolled (defaultValue) use. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const latest = useRef(onChange);
  latest.current = onChange;
  const set = useCallback((next: T) => {
    if (!controlled) setInner(next);
    latest.current?.(next);
  }, [controlled]);
  return [current, set] as const;
}
