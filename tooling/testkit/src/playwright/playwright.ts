import { Context, Duration, Effect, Layer, Schedule, type Scope } from "effect";
import { type BrowserType, type ConnectOverCDPOptions, chromium } from "playwright-core";

import { type LaunchOptions, PlaywrightBrowser } from "./browser";
import { type PlaywrightError, wrapError } from "./errors";

// Check if an error is a transient error that can be retried
const isTransientError = (error: PlaywrightError): boolean => {
  if (error.reason !== "Unknown") return false;
  const cause = error.cause;
  if (!cause) return false;

  // Handle various error structures from Playwright
  const errorObj = cause instanceof Error ? cause : null;
  if (errorObj) {
    // Check for ENOENT directly on the error
    if ("code" in errorObj && (errorObj as Error & { code: string }).code === "ENOENT") {
      return true;
    }
    // Check nested cause for ENOENT
    if ("cause" in errorObj && errorObj.cause && typeof errorObj.cause === "object") {
      const nestedCause = errorObj.cause as { code?: string };
      if (nestedCause.code === "ENOENT") {
        return true;
      }
    }
    // Check message for ENOENT indication
    if (errorObj.message?.includes("ENOENT")) {
      return true;
    }
  }

  // Also retry on string errors containing ENOENT
  if (typeof cause === "string" && cause.includes("ENOENT")) {
    return true;
  }

  return false;
};

// Retry schedule for browser launch - handles transient failures during concurrent execution
// Uses exponential backoff to reduce contention
const launchRetrySchedule = Schedule.intersect(Schedule.recurs(5), Schedule.exponential(Duration.millis(50), 2));

/**
 * @category model
 * @since 0.1.0
 */
export interface PlaywrightService {
  /**
   * Launches a new browser instance.
   *
   * It is the caller's responsibility to manage the browser's lifecycle and close
   * it when no longer needed. For automatic scope-based management, use
   * {@link launchScoped} instead.
   *
   * ```ts
   * import { Effect } from "effect";
   * import { Playwright } from "effect-playwright";
   * import { chromium } from "playwright-core";
   *
   * const program = Effect.gen(function* () {
   *   const browser = yield* Playwright.launch(chromium);
   *   // ... use browser ...
   *   yield* browser.close;
   * });
   *
   * await Effect.runPromise(program);
   * ```
   *
   * @param browserType - The browser type to launch (e.g. chromium, firefox, webkit).
   * @param options - Optional launch options.
   * @since 0.1.0
   */
  launch: (
    browserType: BrowserType,
    options?: LaunchOptions
  ) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError>;
  /**
   * Launches a new browser instance managed by a Scope.
   *
   * This method automatically closes the browser when the scope is closed.
   *
   * ```ts
   * import { Effect } from "effect";
   * import { Playwright } from "effect-playwright";
   * import { chromium } from "playwright-core";
   *
   * const program = Effect.gen(function* () {
   *   const browser = yield* Playwright.launchScoped(chromium);
   *   // Browser will be closed automatically when scope closes
   * });
   *
   * await Effect.runPromise(program);
   * ```
   *
   * @param browserType - The browser type to launch (e.g. chromium, firefox, webkit).
   * @param options - Optional launch options.
   * @since 0.1.0
   */
  launchScoped: (
    browserType: BrowserType,
    options?: LaunchOptions
  ) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError, Scope.Scope>;
  /**
   * Connects to a browser instance via Chrome DevTools Protocol (CDP).
   *
   * Unlike {@link connectCDPScoped}, this method does **not** close the connection when the
   * scope is closed. It is the caller's responsibility to manage the connection's
   * lifecycle.
   *
   * If you want to close the connection using a scope simply add a finalizer:
   *
   * ```ts
   * import { Effect } from "effect";
   * import { Playwright } from "effect-playwright";
   *
   * const program = Effect.gen(function* () {
   *   const playwright = yield* Playwright;
   *   const browser = yield* playwright.connectCDP(cdpUrl);
   *   yield* Effect.addFinalizer(() => browser.close.pipe(Effect.ignore));
   * });
   *
   * await Effect.runPromise(program);
   * ```
   *
   * @param cdpUrl - The CDP URL to connect to.
   * @param options - Optional options for connecting to the CDP URL.
   * @since 0.1.0
   */
  connectCDP: (
    cdpUrl: string,
    options?: ConnectOverCDPOptions
  ) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError>;
  /**
   * Connects to a browser instance via Chrome DevTools Protocol (CDP) managed by a Scope.
   *
   * This method automatically closes the connection when the scope is closed.
   *
   * Note that closing a CDP connection does **not** close the browser instance itself,
   * only the CDP connection.
   *
   * ```ts
   * import { Effect } from "effect";
   * import { Playwright } from "effect-playwright";
   *
   * const program = Effect.gen(function* () {
   *   const playwright = yield* Playwright;
   *   const browser = yield* playwright.connectCDPScoped(cdpUrl);
   *   // Connection will be closed automatically when scope closes
   * });
   *
   * await Effect.runPromise(program);
   * ```
   *
   * @param cdpUrl - The CDP URL to connect to.
   * @param options - Optional options for connecting to the CDP URL.
   * @since 0.1.1
   */
  connectCDPScoped: (
    cdpUrl: string,
    options?: ConnectOverCDPOptions
  ) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError, Scope.Scope>;
}

const launch: (
  browserType: BrowserType,
  options?: LaunchOptions
) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError> = Effect.fn(function* (
  browserType: BrowserType,
  options?: LaunchOptions
) {
  const rawBrowser = yield* Effect.tryPromise({
    try: () => browserType.launch(options),
    catch: wrapError,
  }).pipe(
    Effect.retry({
      schedule: launchRetrySchedule,
      while: isTransientError,
    })
  );

  return PlaywrightBrowser.make(rawBrowser);
});

const connectCDP: (
  cdpUrl: string,
  options?: ConnectOverCDPOptions
) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError> = Effect.fn(function* (
  cdpUrl: string,
  options?: ConnectOverCDPOptions
) {
  const browser = yield* Effect.tryPromise({
    try: () => chromium.connectOverCDP(cdpUrl, options),
    catch: wrapError,
  });

  return PlaywrightBrowser.make(browser);
});

/**
 * @category tag
 * @since 0.1.0
 */
export class Playwright extends Context.Tag("effect-playwright/index/Playwright")<Playwright, PlaywrightService>() {
  /**
   * @category layer
   */
  static readonly layer = Layer.succeed(Playwright, {
    launch,
    launchScoped: (browserType, options) =>
      Effect.acquireRelease(launch(browserType, options), (browser) => browser.close.pipe(Effect.ignore)),
    connectCDP,
    connectCDPScoped: (cdpUrl, options) =>
      Effect.acquireRelease(connectCDP(cdpUrl, options), (browser) => browser.close.pipe(Effect.ignore)),
  });
}
