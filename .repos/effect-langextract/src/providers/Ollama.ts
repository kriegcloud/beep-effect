import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import * as HttpClient from "@effect/platform/HttpClient"
import { Config, Effect, Layer, Option } from "effect"

import { FormatType } from "../FormatType.js"
import { LanguageModel } from "../LanguageModel.js"
import { PrimedCache, PrimedCachePolicy } from "../PrimedCache.js"
import { FormatModeSchema } from "../ProviderSchema.js"
import { RuntimeControl } from "../RuntimeControl.js"
import { makeProviderLanguageModelService } from "./AiAdapters.js"
import {
  makeOllamaNativeLanguageModel,
  type OllamaNativeConfig
} from "./OllamaNative.js"

export interface OllamaConfigService {
  readonly modelId: string
  readonly baseUrl: string
  readonly formatType: FormatType
  readonly temperature?: number | undefined
  readonly timeout: number
  readonly providerConcurrency: number
  readonly primedCacheScope: "request" | "session"
  readonly primedCachePolicy: PrimedCachePolicy
}

const defaultOllamaConfig: OllamaConfigService = {
  modelId: "llama3.2:latest",
  baseUrl: "http://localhost:11434",
  formatType: "json",
  temperature: undefined,
  timeout: 120,
  providerConcurrency: 8,
  primedCacheScope: "session",
  primedCachePolicy: new PrimedCachePolicy({
    namespace: "ollama"
  })
}

const OllamaConfigEnv = Config.all({
  modelId: Config.string("OLLAMA_MODEL_ID").pipe(
    Config.withDefault(defaultOllamaConfig.modelId)
  ),
  baseUrl: Config.string("OLLAMA_BASE_URL").pipe(
    Config.withDefault(defaultOllamaConfig.baseUrl)
  ),
  formatType: Config.literal("json", "yaml")("OLLAMA_FORMAT_TYPE").pipe(
    Config.withDefault(defaultOllamaConfig.formatType)
  ),
  temperature: Config.number("OLLAMA_TEMPERATURE").pipe(Config.option),
  timeout: Config.integer("OLLAMA_TIMEOUT").pipe(
    Config.withDefault(defaultOllamaConfig.timeout)
  ),
  providerConcurrency: Config.integer("OLLAMA_PROVIDER_CONCURRENCY").pipe(
    Config.withDefault(defaultOllamaConfig.providerConcurrency)
  ),
  primedCacheScope: Config.literal("request", "session")(
    "OLLAMA_PRIMED_CACHE_SCOPE"
  ).pipe(Config.withDefault(defaultOllamaConfig.primedCacheScope)),
  primedCacheNamespace: Config.string("OLLAMA_PRIMED_CACHE_NAMESPACE").pipe(
    Config.withDefault("ollama")
  )
})

const toNativeConfig = (
  config: OllamaConfigService
): OllamaNativeConfig => ({
  modelId: config.modelId,
  baseUrl: config.baseUrl,
  ...(config.temperature !== undefined
    ? { temperature: config.temperature }
    : {})
})

export class OllamaConfig extends Effect.Service<OllamaConfig>()(
  "@effect-langextract/providers/OllamaConfig",
  {
    sync: () => ({ ...defaultOllamaConfig } satisfies OllamaConfigService)
  }
) {
  static readonly Test: Layer.Layer<OllamaConfig> = OllamaConfig.Default

  static testLayer = (
    overrides?: Partial<OllamaConfigService>
  ): Layer.Layer<OllamaConfig> =>
    Layer.succeed(
      OllamaConfig,
      OllamaConfig.make({
        ...defaultOllamaConfig,
        ...overrides,
        primedCachePolicy:
          overrides?.primedCachePolicy ?? defaultOllamaConfig.primedCachePolicy
      })
    )
}

export const OllamaConfigFromEnv: Layer.Layer<OllamaConfig> = Layer.effect(
  OllamaConfig,
  OllamaConfigEnv.pipe(
    Effect.map((loaded) =>
      OllamaConfig.make({
        ...defaultOllamaConfig,
        modelId: loaded.modelId,
        baseUrl: loaded.baseUrl,
        formatType: loaded.formatType,
        temperature: Option.getOrUndefined(loaded.temperature),
        timeout: loaded.timeout,
        providerConcurrency: loaded.providerConcurrency,
        primedCacheScope: loaded.primedCacheScope,
        primedCachePolicy: new PrimedCachePolicy({
          namespace: loaded.primedCacheNamespace
        })
      })
    )
  )
).pipe(Layer.orDie)

export const OllamaConfigLive: Layer.Layer<OllamaConfig> = OllamaConfigFromEnv

export const OllamaNativeLanguageModelLive: Layer.Layer<
  NativeLanguageModel.LanguageModel,
  never,
  OllamaConfig | HttpClient.HttpClient
> = Layer.effect(
  NativeLanguageModel.LanguageModel,
  Effect.gen(function* () {
    const config = yield* OllamaConfig
    const client = yield* HttpClient.HttpClient
    return yield* makeOllamaNativeLanguageModel(toNativeConfig(config), client)
  })
)

export const OllamaLanguageModelLive: Layer.Layer<
  LanguageModel,
  never,
  OllamaConfig | PrimedCache | RuntimeControl | HttpClient.HttpClient
> = Layer.provide(
  Layer.effect(
    LanguageModel,
    Effect.gen(function* () {
      const config = yield* OllamaConfig
      const cache = yield* PrimedCache
      const runtimeControl = yield* RuntimeControl
      const nativeModel = yield* NativeLanguageModel.LanguageModel

      return LanguageModel.make(
        makeProviderLanguageModelService({
          provider: "ollama",
          modelId: config.modelId,
          requiresFenceOutput: config.formatType !== "json",
          schema: new FormatModeSchema({
            formatType: config.formatType,
            useFences: config.formatType !== "json"
          }),
          defaultProviderMetadata: {
            ...(config.temperature !== undefined
              ? { temperature: config.temperature }
              : {}),
            formatType: config.formatType
          },
          cache,
          runtimeControl,
          nativeModel,
          defaultProviderConcurrency: config.providerConcurrency
        })
      )
    })
  ),
  OllamaNativeLanguageModelLive
)
