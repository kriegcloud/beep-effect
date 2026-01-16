import { Playwright, PlaywrightBrowser } from "@beep/testkit/playwright";
import { Context, Effect, Layer } from "effect";
import type { Scope } from "effect/Scope";
import type { BrowserType, LaunchOptions } from "playwright-core";
import type { PlaywrightError } from "../errors";

/**
 * Most of the time you want to use the same kind of browser and configuration every time you use Playwright.
 * `PlaywrightEnvironment` is a service that allows you to configure how browsers are launched once. You can then
 * use {@link PlaywrightEnvironment.browser} to start browsers scoped to the current lifetime. They will be closed when the scope is closed.
 *
 * You can use {@link PlaywrightEnvironment.withBrowser} to provide the `PlaywrightBrowser` service to the wrapped effect. This
 * also allows you to re-use the same browser as many times as you want.
 *
 * @since 0.1.0
 * @category tag
 */
export class PlaywrightEnvironment extends Context.Tag("effect-playwright/experimental/PlaywrightEnvironment")<
  PlaywrightEnvironment,
  {
    browser: Effect.Effect<typeof PlaywrightBrowser.Service, PlaywrightError.Type, Scope>;
  }
>() {}

/**
 * Creates a Layer that initializes the `PlaywrightEnvironment`.
 *
 * @example
 *
 * ```ts
 * import { PlaywrightEnvironment } from "effect-playwright/experimental";
 * import { chromium } from "playwright-core";
 *
 * const playwrightEnv = PlaywrightEnvironment.layer(chromium);
 *
 * // use the layer
 * const program = Effect.gen(function* () {
 *   const playwright = yield* PlaywrightEnvironment;
 *   const browser = yield* playwright.browser;
 *   const page = yield* browser.newPage();
 *   yield* page.goto("https://example.com");
 * }).pipe(Effect.scoped, Effect.provide(playwrightEnv));
 * ```
 *
 * @param browser - The Playwright BrowserType implementation (e.g. `chromium`, `firefox`, `webkit`).
 * @param launchOptions - Optional configuration for launching the browser (e.g. headless, args).
 *
 * @since 0.1.0
 * @category layer
 */
export const layer = (browser: BrowserType, launchOptions?: LaunchOptions) => {
  return Layer.effect(
    PlaywrightEnvironment,
    Playwright.pipe(
      Effect.map((playwright) => {
        return PlaywrightEnvironment.of({
          browser: playwright.launchScoped(browser, launchOptions),
        });
      }),
      Effect.provide(Playwright.layer)
    )
  );
};

/**
 * Provides a scoped `PlaywrightBrowser` service, allowing you to access the browser from the context (e.g. by yielding `PlaywrightBrowser`).
 *
 * You will need to provide the `PlaywrightEnvironment` layer first.
 *
 * @example
 *
 * ```ts
 * import { PlaywrightEnvironment } from "effect-playwright/experimental";
 * import { chromium } from "playwright-core";
 *
 * const env = PlaywrightEnvironment.layer(chromium);
 *
 * const program = Effect.gen(function* () {
 *     const browser = yield* PlaywrightBrowser;
 *     const page = yield* browser.newPage();
 *     yield* page.goto("https://example.com");
 * }).pipe(PlaywrightEnvironment.withBrowser, Effect.provide(env));
 * ```
 *
 * @since 0.1.0
 */
export const withBrowser = Effect.provide(
  PlaywrightEnvironment.pipe(
    Effect.map((e) => e.browser),
    Effect.flatten,
    Layer.scoped(PlaywrightBrowser)
  )
);
