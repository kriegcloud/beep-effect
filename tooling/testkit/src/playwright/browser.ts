import { Context, Effect } from "effect";
import type { Scope } from "effect/Scope";
import type { Browser, BrowserType, chromium } from "playwright-core";
import { PlaywrightBrowserContext } from "./browser-context";
import type { PlaywrightError } from "./errors";
import { PlaywrightPage } from "./page";
import { useHelper } from "./utils";

export type LaunchOptions = Parameters<typeof chromium.launch>[0];
export type NewPageOptions = Parameters<Browser["newPage"]>[0];
export type NewContextOptions = Parameters<Browser["newContext"]>[0];

/**
 * @category tag
 */
export class PlaywrightBrowser extends Context.Tag("cehs/backend/lib/playwright/PlaywrightBrowser")<
  PlaywrightBrowser,
  {
    /**
     * Opens a new page in the browser.
     *
     * @example
     * ```typescript
     * const page = yield* browser.newPage();
     * ```
     *
     * @param options - Optional options for creating the new page.
     * @returns An effect that resolves to a `PlaywrightPage` service.
     * @see {@link Browser.newPage}
     */
    readonly newPage: (options?: NewPageOptions) => Effect.Effect<typeof PlaywrightPage.Service, PlaywrightError.Type>;
    /**
     * A generic utility to execute any promise-based method on the underlying Playwright `Browser`.
     * Can be used to access any Browser functionality not directly exposed by this service.
     *
     * @example
     * ```typescript
     * const contexts = yield* browser.use((b) => b.contexts());
     * ```
     *
     * @param f - A function that takes the Playwright `Browser` and returns a `Promise`.
     * @returns An effect that wraps the promise and returns its result.
     * @see {@link Browser}
     */
    readonly use: <T>(f: (browser: Browser) => Promise<T>) => Effect.Effect<T, PlaywrightError.Type>;
    /**
     * An Effect that closes the browser and all of its pages.
     * @see {@link Browser.close}
     */
    readonly close: Effect.Effect<void, PlaywrightError.Type>;

    /**
     * An Effect that returns the list of all open browser contexts.
     * @see {@link Browser.contexts}
     */
    readonly contexts: Effect.Effect<Array<typeof PlaywrightBrowserContext.Service>>;

    readonly newContext: (
      options?: NewContextOptions
    ) => Effect.Effect<typeof PlaywrightBrowserContext.Service, PlaywrightError.Type, Scope>;

    /**
     * An Effect that returns the browser type (chromium, firefox or webkit) that the browser belongs to.
     * @see {@link Browser.browserType}
     */
    readonly browserType: Effect.Effect<BrowserType>;

    /**
     * An Effect that returns the version of the browser.
     * @see {@link Browser.version}
     */
    readonly version: Effect.Effect<string>;
    /**
     * An Effect that returns whether the browser is connected.
     * @see {@link Browser.isConnected}
     */
    readonly isConnected: Effect.Effect<boolean>;
  }
>() {
  /**
   * @category constructor
   */
  static make(browser: Browser) {
    const use = useHelper(browser);

    return PlaywrightBrowser.of({
      newPage: (options) => use((browser) => browser.newPage(options).then(PlaywrightPage.make)),
      close: use((browser) => browser.close()),
      contexts: Effect.sync(() => browser.contexts().map(PlaywrightBrowserContext.make)),
      newContext: (options) =>
        Effect.acquireRelease(
          use((browser) => browser.newContext(options).then(PlaywrightBrowserContext.make)),
          (context) => context.close.pipe(Effect.ignoreLogged)
        ),
      browserType: Effect.sync(() => browser.browserType()),
      version: Effect.sync(() => browser.version()),
      isConnected: Effect.sync(() => browser.isConnected()),
      use,
    });
  }
}
