import '@testing-library/jest-dom/vitest';
import { afterEach, expect, vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
expect.extend(matchers);
// jsdom has no <dialog> methods or Web Animations.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
}
// A test that fails while using fake timers must not leave them on for the next one.
afterEach(() => { vi.useRealTimers(); });
// axe probes a canvas for icon ligatures; jsdom has none and logs a stack trace per call.
if (typeof HTMLCanvasElement !== 'undefined') HTMLCanvasElement.prototype.getContext = (() => null) as never;
