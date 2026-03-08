import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Redacted } from "effect"

import {
  LanguageModel,
  makePrimedCacheLayer,
  OpenAIConfig,
  OpenAILanguageModelLive,
  PrimedCachePolicy,
  RuntimeControl} from "../../src/index.js"

const liveEnabled =
  (process.env.LANGEXTRACT_LIVE_PROVIDER_SMOKE ?? "").toLowerCase() === "true" &&
  (process.env.OPENAI_API_KEY ?? "").length > 0

const openAiRuntimeLayer = Layer.provide(
  OpenAILanguageModelLive,
  [
    OpenAIConfig.testLayer({
      modelId: process.env.OPENAI_MODEL_ID ?? "gpt-4o-mini",
      apiKey: Redacted.make(process.env.OPENAI_API_KEY ?? ""),
      baseUrl: process.env.OPENAI_BASE_URL,
      organization: process.env.OPENAI_ORGANIZATION,
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

describe("OpenAI provider layer", () => {
  it.effect("runs live smoke only when explicitly enabled", () =>
    liveEnabled
      ? Effect.gen(function* () {
          const languageModel = yield* LanguageModel
          const policy = new PrimedCachePolicy({
            namespace: "openai-live-smoke",
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
        }).pipe(Effect.provide(openAiRuntimeLayer))
      : Effect.sync(() => {
          expect(true).toBe(true)
        })
  )
})
