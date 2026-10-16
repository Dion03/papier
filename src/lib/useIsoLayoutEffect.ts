import { useEffect, useLayoutEffect } from 'react';

/** useLayoutEffect in the browser, useEffect during server rendering (Next.js). */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
