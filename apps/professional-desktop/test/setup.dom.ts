/**
 * jsdom polyfills for browser APIs the desktop shell mounts in tests.
 */

import { ControllableResizeObserver } from "@beep/dock-react/internal/ResizeObserverHarness";

// jsdom has no layout, so it ships no ResizeObserver. The dock shell and the
// resizable chat panes measure themselves with one, and without it the whole
// shell fails to mount. The dock adapter's controllable harness is the honest
// stand-in: it observes silently by default, and a test that needs real
// geometry drives it explicitly with `resize()`.
globalThis.ResizeObserver = ControllableResizeObserver;

// fallow-ignore-next-line code-duplication -- jsdom matchMedia shim repeats the browser setup that sibling UI test setups need. Owner: @beep/professional-desktop. Exit: import a shared DOM test setup from @beep/test-utils once it provides one.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      // oxlint-disable-next-line typescript/no-deprecated -- MediaQueryList compatibility mock must implement its legacy DOM members. Owner: @beep/professional-desktop. Exit: lib.dom drops the deprecated MediaQueryList listener members.
      addListener: () => {},
      // oxlint-disable-next-line typescript/no-deprecated -- MediaQueryList compatibility mock must implement its legacy DOM members. Owner: @beep/professional-desktop. Exit: lib.dom drops the deprecated MediaQueryList listener members.
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
