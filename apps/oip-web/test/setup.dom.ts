/**
 * jsdom polyfills for browser APIs the test environment omits but client
 * components rely on: `matchMedia` (used by embla-carousel and the hero video's
 * reduced-motion guard) and the `requestIdleCallback` pair (hero video defers
 * its fetch to idle). Each is installed only when missing.
 */

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): ReadonlyArray<IntersectionObserverEntry> {
      return [];
    }
  }
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof window !== "undefined" && typeof window.requestIdleCallback !== "function") {
  window.requestIdleCallback = ((callback: IdleRequestCallback): number =>
    window.setTimeout(
      () => callback({ didTimeout: false, timeRemaining: () => 50 }),
      1
    ) as unknown as number) as typeof window.requestIdleCallback;
  window.cancelIdleCallback = ((handle: number): void => {
    window.clearTimeout(handle);
  }) as typeof window.cancelIdleCallback;
}
