/**
 * NLP tool adapter — bridges effect-nlp's ExportedTool to RlmToolAny.
 *
 * effect-nlp is an optional dependency (git submodule). If not installed,
 * nlpTools returns an empty array instead of failing.
 */

import { Effect, Schema } from "effect"
import type { RlmToolAny } from "./RlmTool"
import { RlmToolError } from "./RlmTool"

class NlpToolsImportError extends Schema.TaggedError<NlpToolsImportError>()(
  "NlpToolsImportError",
  { message: Schema.String }
) {}

const loadEffectNlp = Effect.tryPromise({
  try: () => import("effect-nlp") as Promise<typeof import("effect-nlp")>,
  catch: (error) =>
    new NlpToolsImportError({
      message: error instanceof Error ? error.message : String(error)
    })
})

export const nlpTools: Effect.Effect<ReadonlyArray<RlmToolAny>, RlmToolError, never> =
  Effect.gen(function*() {
    const mod = yield* loadEffectNlp.pipe(
      Effect.catchAll((error) =>
        Effect.gen(function*() {
          const message = error instanceof Error ? error.message : String(error)
          yield* Effect.logWarning(`NLP tools unavailable: failed to import effect-nlp (${message})`)
          return null
        })
      )
    )
    if (mod === null) return []

    const exported = yield* mod.Tools.exportTools.pipe(
      Effect.mapError(
        (e) => new RlmToolError({ message: e.message, toolName: e.toolName })
      )
    )

    return exported.map((tool): RlmToolAny => ({
      ...tool,
      handle: (args) =>
        tool.handle(args).pipe(
          Effect.mapError(
            (e) => new RlmToolError({ message: e.message, toolName: e.toolName })
          )
        )
    }))
  })
