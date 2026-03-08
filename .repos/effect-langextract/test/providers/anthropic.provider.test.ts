import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Redacted } from "effect"

import {
  AnthropicConfig,
  AnthropicLanguageModelLive,
  LanguageModel,
  makePrimedCacheLayer,
  PrimedCachePolicy,
  RuntimeControl} from "../../src/index.js"

const liveEnabled =
  (process.env.LANGEXTRACT_LIVE_PROVIDER_SMOKE ?? "").toLowerCase() === "true" &&
  (process.env.ANTHROPIC_API_KEY ?? "").length > 0

const anthropicRuntimeLayer = Layer.provide(
  AnthropicLanguageModelLive,
  [
    AnthropicConfig.testLayer({
      modelId: process.env.ANTHROPIC_MODEL_ID ?? "claude-3-5-sonnet-latest",
      apiKey: Redacted.make(process.env.ANTHROPIC_API_KEY ?? ""),
      baseUrl: process.env.ANTHROPIC_BASE_URL,
      temperature: 0,
      providerConcurrency: 2
    }),
    makePrimedCacheLayer({
      enableRequestStore: true,
      enableSessionStore: false
    }),
    RuntimeControl.Test,
    FetchHttpClient.layer
  ]
)

describe("Anthropic provider layer", () => {
  it.effect("runs live smoke only when explicitly enabled", () =>
    liveEnabled
      ? Effect.gen(function* () {
          const languageModel = yield* LanguageModel
          const policy = new PrimedCachePolicy({
            namespace: "anthropic-live-smoke",
            enabled: true,
            ttlSeconds: 30,
            deterministicOnly: true
          })

          const result = yield* languageModel.infer(
            ["Return a one-sentence extraction summary as plain text."],
            {
              cachePolicy: policy,
              providerConcurrency: 1
            }
          )

          expect((result[0]?.[0]?.output ?? "").length).toBeGreaterThan(0)
        }).pipe(Effect.provide(anthropicRuntimeLayer))
      : Effect.sync(() => {
          expect(true).toBe(true)
        })
  )
})
