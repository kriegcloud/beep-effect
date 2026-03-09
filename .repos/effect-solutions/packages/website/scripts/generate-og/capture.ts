import path from "node:path"
import { Console, Effect } from "effect"
import { Browser } from "./browser.js"
import { DEVICE_SCALE, OUTPUT_DIR, TEMPLATE_ROUTE, VIEWPORT } from "./config.js"
import type { TemplateFields } from "./spec.js"
import { TemplateServer } from "./template-server.js"

// =============================================================================
// Screenshot Capture
// =============================================================================

export const captureSpec = (spec: TemplateFields) =>
  Effect.gen(function* () {
    const browser = yield* Browser
    const server = yield* TemplateServer

    yield* Effect.acquireRelease(
      Effect.tryPromise(() =>
        browser.newPage({
          viewport: VIEWPORT,
          deviceScaleFactor: DEVICE_SCALE,
        }),
      ),
      (page) => Effect.promise(() => page.close()),
    ).pipe(
      Effect.flatMap((page) =>
        Effect.gen(function* () {
          const templateURL = new URL(TEMPLATE_ROUTE, server.baseUrl)
          const params = templateURL.searchParams

          for (const [key, value] of Object.entries(spec)) {
            if (key !== "slug" && value) {
              params.set(key, value)
            }
          }

          yield* Effect.tryPromise(() => page.goto(templateURL.toString(), { waitUntil: "load" }))

          const filePath = path.join(OUTPUT_DIR, `${spec.slug}.png`)
          yield* Effect.tryPromise(() => page.screenshot({ path: filePath, type: "png" }))

          yield* Console.log(`OG image generated: ${path.relative(process.cwd(), filePath)}`)
        }),
      ),
      Effect.scoped,
    )
  })
