/** True when the user (or the nearest Papier root) asked for reduced motion. */
export function prefersReducedMotion(el?: Element | null): boolean {
  if (el?.closest('[data-papier-motion="reduced"]')) return true;
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
