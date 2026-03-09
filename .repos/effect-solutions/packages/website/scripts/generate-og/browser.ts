import { Console, Context, Effect, Layer } from "effect"
import type { Browser as PlaywrightBrowser } from "playwright"
import { chromium } from "playwright"

// =============================================================================
// Browser Service
// =============================================================================

export class Browser extends Context.Tag("Browser")<Browser, PlaywrightBrowser>() {
  static layer = Layer.scoped(
    Browser,
    Effect.acquireRelease(
      Effect.tryPromise({
        try: () => chromium.launch(),
        catch: (error) => new Error(`Failed to launch browser: ${error}`),
      }).pipe(Effect.tap(() => Console.log("Browser launched"))),
      (browser) => Effect.promise(() => browser.close()).pipe(Effect.tap(() => Console.log("Browser closed"))),
    ),
  )

  static test = Layer.succeed(Browser, null as unknown as PlaywrightBrowser)
}
