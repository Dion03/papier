import type { SVGProps } from 'react';

const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const;

/** Thin inline arrows and marks, matching the portfolio's line icons. */
export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>;
export const ArrowRight = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>;
export const Check = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const Close = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>;
export const Spinner = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} className="pp-spinner"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
);
