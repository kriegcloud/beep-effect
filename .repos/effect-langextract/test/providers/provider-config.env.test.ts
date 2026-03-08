import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Redacted } from "effect"

import {
  OllamaConfig,
  OllamaConfigFromEnv,
  OpenAIConfig,
  OpenAIConfigFromEnv
} from "../../src/index.js"

const configProviderLayer = (
  entries: ReadonlyArray<readonly [string, string]>
): Layer.Layer<never> =>
  Layer.setConfigProvider(ConfigProvider.fromMap(new Map(entries)))

describe("Provider config from Effect Config", () => {
  it.effect("loads OpenAIConfig from map-backed config provider", () =>
    Effect.gen(function* () {
      const config = yield* OpenAIConfig

      expect(config.modelId).toBe("gpt-4.1-mini")
      expect(Redacted.value(config.apiKey)).toBe("sk-provider-key")
      expect(config.baseUrl).toBe("https://api.openai.example")
      expect(config.providerConcurrency).toBe(5)
      expect(config.formatType).toBe("yaml")
      expect(config.primedCachePolicy.namespace).toBe("openai-ns")
    }).pipe(
      Effect.provide(
        Layer.provide(
          OpenAIConfigFromEnv,
          configProviderLayer([
            ["OPENAI_MODEL_ID", "gpt-4.1-mini"],
            ["OPENAI_API_KEY", "sk-provider-key"],
            ["OPENAI_BASE_URL", "https://api.openai.example"],
            ["OPENAI_PROVIDER_CONCURRENCY", "5"],
            ["OPENAI_FORMAT_TYPE", "yaml"],
            ["OPENAI_PRIMED_CACHE_NAMESPACE", "openai-ns"]
          ])
        )
      )
    )
  )

  it.effect("falls back to Ollama defaults when env keys are absent", () =>
    Effect.gen(function* () {
      const config = yield* OllamaConfig

      expect(config.modelId).toBe("llama3.2:latest")
      expect(config.baseUrl).toBe("http://localhost:11434")
      expect(config.providerConcurrency).toBe(8)
      expect(config.formatType).toBe("json")
      expect(config.primedCachePolicy.namespace).toBe("ollama")
    }).pipe(
      Effect.provide(
        Layer.provide(
          OllamaConfigFromEnv,
          configProviderLayer([])
        )
      )
    )
  )
})
