import { Context, Effect, Stream } from "effect";
import type { Scope } from "effect/Scope";
import type { Browser, BrowserType, chromium } from "playwright-core";
import { PlaywrightBrowserContext } from "./browser-context";
import type { PlaywrightError } from "./errors";
import { PlaywrightPage } from "./page";
import type { PatchedEvents } from "./playwright-types";
import { useHelper } from "./utils";

export type LaunchOptions = Parameters<typeof chromium.launch>[0];
export type NewPageOptions = Parameters<Browser["newPage"]>[0];
export type NewContextOptions = Parameters<Browser["newContext"]>[0];

interface BrowserEvents {
  disconnected: Browser;
}

const eventMappings = {
  disconnected: (browser: Browser) => PlaywrightBrowser.make(browser),
} as const;

type BrowserWithPatchedEvents = PatchedEvents<Browser, BrowserEvents>;

/**
 * @category model
 * @since 0.1.0
 */
export interface PlaywrightBrowserService {
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
  readonly newPage: (options?: NewPageOptions) => Effect.Effect<typeof PlaywrightPage.Service, PlaywrightError>;
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
  readonly use: <T>(f: (browser: Browser) => Promise<T>) => Effect.Effect<T, PlaywrightError>;
  /**
   * An Effect that closes the browser and all of its pages.
   * @see {@link Browser.close}
   */
  readonly close: Effect.Effect<void, PlaywrightError>;

  /**
   * An Effect that returns the list of all open browser contexts.
   * @see {@link Browser.contexts}
   */
  readonly contexts: Effect.Effect<Array<typeof PlaywrightBrowserContext.Service>>;

  readonly newContext: (
    options?: NewContextOptions
  ) => Effect.Effect<typeof PlaywrightBrowserContext.Service, PlaywrightError, Scope>;

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

  /**
   * Creates a stream of the given event from the browser.
   *
   * @example
   * ```ts
   * const disconnectedStream = browser.eventStream("disconnected");
   * ```
   *
   * @category custom
   * @see {@link Browser.on}
   * @since 0.1.2
   */
  readonly eventStream: <K extends keyof typeof eventMappings>(
    event: K
  ) => Stream.Stream<ReturnType<(typeof eventMappings)[K]>>;
}

/**
 * @category tag
 */
export class PlaywrightBrowser extends Context.Tag("effect-playwright/PlaywrightBrowser")<
  PlaywrightBrowser,
  PlaywrightBrowserService
>() {
  /**
   * @category constructor
   */
  static make(browser: BrowserWithPatchedEvents): PlaywrightBrowserService {
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
      eventStream: <K extends keyof BrowserEvents>(event: K) =>
        Stream.asyncPush<BrowserEvents[K]>((emit) =>
          Effect.acquireRelease(
            Effect.sync(() => {
              browser.on(event, emit.single);
              browser.once("disconnected", emit.end);
            }),
            () =>
              Effect.sync(() => {
                browser.off(event, emit.single);
                browser.off("disconnected", emit.end);
              })
          )
        ).pipe(
          Stream.map((e) => {
            const mapping = eventMappings[event];
            // biome-ignore lint/suspicious/noExplicitAny: Don't know how to fix this …
            return mapping(e as any) as ReturnType<(typeof eventMappings)[K]>;
          })
        ),
      use,
    });
  }
}
