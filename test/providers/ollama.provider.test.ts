import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import {
  LanguageModel,
  makePrimedCacheLayer,
  OllamaConfig,
  OllamaLanguageModelLive,
  PrimedCachePolicy,
  RuntimeControl} from "../../src/index.js"

const liveEnabled =
  (process.env.LANGEXTRACT_LIVE_PROVIDER_SMOKE ?? "").toLowerCase() === "true" &&
  (process.env.LANGEXTRACT_OLLAMA_SMOKE ?? "").toLowerCase() === "true"

const ollamaRuntimeLayer = Layer.provide(
  OllamaLanguageModelLive,
  [
    OllamaConfig.testLayer({
      modelId: process.env.OLLAMA_MODEL_ID ?? "llama3.2:latest",
      baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
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

describe("Ollama provider layer", () => {
  it.effect("runs live smoke only when explicitly enabled", () =>
    liveEnabled
      ? Effect.gen(function* () {
          const languageModel = yield* LanguageModel
          const policy = new PrimedCachePolicy({
            namespace: "ollama-live-smoke",
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
        }).pipe(Effect.provide(ollamaRuntimeLayer))
      : Effect.sync(() => {
          expect(true).toBe(true)
        })
  )
})
