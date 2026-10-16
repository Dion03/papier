import type { SVGProps } from 'react';

const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const;

/** Thin inline arrows and marks, matching the portfolio's line icons. */
export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>;
export const ArrowRight = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>;
export const Check = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const Close = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>;
export const ArrowLeft = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M20 12H5M11 6l-6 6 6 6" /></svg>;
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>;
export const Plus = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>;
export const Minus = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M5 12h14" /></svg>;
export const Search = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
export const Menu = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const More = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="5.5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="18.5" cy="12" r="1.2" fill="currentColor" /></svg>;
export const Play = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" /></svg>;
export const Pause = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M8 5v14M16 5v14" strokeWidth={3} /></svg>;
export const External = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5" /></svg>;
export const Copy = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><rect x="8" y="8" width="11" height="11" rx="2.5" /><path d="M16 8V6.5A1.5 1.5 0 0 0 14.5 5h-8A1.5 1.5 0 0 0 5 6.5v8A1.5 1.5 0 0 0 6.5 16H8" /></svg>;
export const Info = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></svg>;
export const Alert = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M12 4 21 19H3z" /><path d="M12 10v4M12 16.5h.01" /></svg>;
export const Sun = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1 1M17.4 17.4l1 1M5.6 18.4l1-1M17.4 6.6l1-1" /></svg>;
export const Moon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" /></svg>;
export const Spinner = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} className="pp-spinner"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
);
export const ChevronUp = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m6 15 6-6 6 6" /></svg>;
export const ArrowUp = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M12 20V5M6 11l6-6 6 6" /></svg>;
export const ArrowDown = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M12 4v15M6 13l6 6 6-6" /></svg>;
/** Up and down chevrons: a column that can be sorted but is not yet. */
export const Sort = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m8 9 4-4 4 4M8 15l4 4 4-4" /></svg>;
export const Eye = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg>;
export const EyeOff = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.9 0 3.5-.6 4.9-1.5M9.9 9.9a3 3 0 0 0 4.2 4.2M4 4l16 16" /></svg>;
export const Upload = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M12 15V4M7 9l5-5 5 5M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>;
export const File = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M13.5 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5z" /><path d="M13.5 3.5v5h5" /></svg>;
export const Calendar = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>;
