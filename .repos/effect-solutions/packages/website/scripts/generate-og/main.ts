import fs from "node:fs"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect, Layer } from "effect"
import { Browser } from "./browser.js"
import { captureSpec } from "./capture.js"
import { OUTPUT_DIR, TEMPLATE_ROUTE } from "./config.js"
import { pickSpecs } from "./spec.js"
import { TemplateServer } from "./template-server.js"

// =============================================================================
// Main Program
// =============================================================================

const program = Effect.gen(function* () {
  yield* Effect.sync(() => fs.mkdirSync(OUTPUT_DIR, { recursive: true }))

  const specs = yield* pickSpecs
  if (specs.length === 0) {
    yield* Console.warn("No OG specs detected. Nothing to do.")
    return
  }

  const server = yield* TemplateServer
  yield* Console.log(`Using OG template at ${new URL(TEMPLATE_ROUTE, server.baseUrl).toString()}`)

  yield* Console.log(`Generating ${specs.length} OG image(s)...`)

  yield* Effect.forEach(specs, captureSpec, { concurrency: "unbounded" })

  yield* Console.log("OG generation complete.")
})

// =============================================================================
// Layer Composition
// =============================================================================

const MainLayer = Layer.mergeAll(Browser.layer, TemplateServer.layer).pipe(Layer.provideMerge(BunContext.layer))

// =============================================================================
// Run
// =============================================================================

program.pipe(Effect.provide(MainLayer), BunRuntime.runMain)
