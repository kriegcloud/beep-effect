import { Context, Effect, Layer, type Scope } from "effect";
import {
  type BrowserType,
  type ConnectOverCDPOptions,
  chromium,
} from "playwright-core";

import { type LaunchOptions, PlaywrightBrowser } from "./browser";
import { PlaywrightError } from "./errors";

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
    options?: LaunchOptions,
  ) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError.Type>;
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
    options?: LaunchOptions,
  ) => Effect.Effect<
    typeof PlaywrightBrowser.Service,
    PlaywrightError.Type,
    Scope.Scope
  >;
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
    options?: ConnectOverCDPOptions,
  ) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError.Type>;
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
    options?: ConnectOverCDPOptions,
  ) => Effect.Effect<
    typeof PlaywrightBrowser.Service,
    PlaywrightError.Type,
    Scope.Scope
  >;
}
// : (
//   browserType: BrowserType,
//   options?: LaunchOptions,
// ) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError.Type>
const launch: (
  browserType: BrowserType,
  options?: LaunchOptions,
) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError.Type> =
  Effect.fn(function* (browserType: BrowserType, options?: undefined | LaunchOptions) {
    const rawBrowser = yield* Effect.tryPromise({
      try: () => browserType.launch(options),
      catch: PlaywrightError.wrap,
    });

    return PlaywrightBrowser.make(rawBrowser);
  });

const connectCDP: (
  cdpUrl: string,
  options?: ConnectOverCDPOptions,
) => Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError.Type> =
  Effect.fn(function* (cdpUrl: string, options?: ConnectOverCDPOptions) {
    const browser = yield* Effect.tryPromise({
      try: () => chromium.connectOverCDP(cdpUrl, options),
      catch: PlaywrightError.wrap,
    });

    return PlaywrightBrowser.make(browser);
  });

export class Playwright extends Context.Tag(
  "effect-playwright/index/Playwright",
)<Playwright, PlaywrightService>() {
  /**
   * @category layer
   */
  static readonly layer = Layer.succeed(Playwright, {
    launch,
    launchScoped: (browserType, options) =>
      Effect.acquireRelease(launch(browserType, options), (browser) =>
        browser.close.pipe(Effect.ignore),
      ),
    connectCDP,
    connectCDPScoped: (cdpUrl, options) =>
      Effect.acquireRelease(connectCDP(cdpUrl, options), (browser) =>
        browser.close.pipe(Effect.ignore),
      ),
  });
}
