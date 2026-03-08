import * as Anthropic from "@effect/ai-anthropic"
import * as OpenAi from "@effect/ai-openai"
import { Config, Effect, Layer, type Redacted, ServiceMap } from "effect"
import type * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient"
import { AgentConfig } from "./AgentConfig.js"
import * as DeterministicTestLanguageModel from "./DeterministicTestLanguageModel.js"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1"
const GOOGLE_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai"

export interface ModelRegistryService {
  readonly get: (
    provider: string,
    modelId: string
  ) => Effect.Effect<Layer.Layer<LanguageModel.LanguageModel>>
}

export class ModelRegistry extends ServiceMap.Service<ModelRegistry>()(
  "server/ai/ModelRegistry",
  {
    make: Effect.gen(function*() {
      const agentConfig = yield* AgentConfig
      const cache = new Map<string, Layer.Layer<LanguageModel.LanguageModel>>()
      const useDeterministicStubModel = process.env.PA_TEST_MODEL_STUB === "1"

      const resolveApiKey = (provider: string): Effect.Effect<Redacted.Redacted<string>> => {
        const providerConfig = agentConfig.providers.get(provider)
        if (!providerConfig) {
          return Effect.die(new Error(`No provider config for: ${provider}`))
        }
        return Config.redacted(providerConfig.apiKeyEnv).asEffect().pipe(Effect.orDie)
      }

      const buildLayer = (
        provider: string,
        modelId: string
      ): Effect.Effect<Layer.Layer<LanguageModel.LanguageModel>> =>
        Effect.gen(function*() {
          const apiKey = yield* resolveApiKey(provider)

          switch (provider) {
            case "anthropic":
              return Anthropic.AnthropicLanguageModel.layer({ model: modelId }).pipe(
                Layer.provide(Anthropic.AnthropicClient.layer({ apiKey })),
                Layer.provide(FetchHttpClient.layer)
              )

            case "openai":
            case "openrouter":
            case "google": {
              const apiUrl = provider === "openrouter"
                ? OPENROUTER_API_URL
                : provider === "google"
                ? GOOGLE_GEMINI_API_URL
                : undefined
              return OpenAi.OpenAiLanguageModel.layer({ model: modelId }).pipe(
                Layer.provide(OpenAi.OpenAiClient.layer({ apiKey, apiUrl })),
                Layer.provide(FetchHttpClient.layer)
              )
            }

            default:
              return yield* Effect.die(new Error(`Unsupported provider: ${provider}`))
          }
        })

      const get: ModelRegistryService["get"] = (provider, modelId) => {
        if (useDeterministicStubModel) {
          const stubKey = "stub:test-model"
          const cachedStub = cache.get(stubKey)
          if (cachedStub) {
            return Effect.succeed(cachedStub)
          }

          const stubLayer = DeterministicTestLanguageModel.layer
          cache.set(stubKey, stubLayer)
          return Effect.succeed(stubLayer)
        }

        const key = `${provider}:${modelId}`
        const cached = cache.get(key)
        if (cached) return Effect.succeed(cached)

        return buildLayer(provider, modelId).pipe(
          Effect.tap((layer) => Effect.sync(() => cache.set(key, layer)))
        )
      }

      return { get } satisfies ModelRegistryService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
