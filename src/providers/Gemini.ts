import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import * as GoogleClient from "@effect/ai-google/GoogleClient"
import * as GoogleLanguageModel from "@effect/ai-google/GoogleLanguageModel"
import * as HttpClient from "@effect/platform/HttpClient"
import { Config, Effect, Layer, Option, Redacted } from "effect"

import { FormatType } from "../FormatType.js"
import { LanguageModel } from "../LanguageModel.js"
import { PrimedCache, PrimedCachePolicy } from "../PrimedCache.js"
import { FormatModeSchema } from "../ProviderSchema.js"
import { RuntimeControl } from "../RuntimeControl.js"
import { makeProviderLanguageModelService } from "./AiAdapters.js"

export interface GeminiConfigService {
  readonly modelId: string
  readonly apiKey: Redacted.Redacted
  readonly baseUrl?: string | undefined
  readonly temperature: number
  readonly providerConcurrency: number
  readonly vertexai: boolean
  readonly project?: string | undefined
  readonly location?: string | undefined
  readonly formatType: FormatType
  readonly primedCacheScope: "request" | "session"
  readonly primedCachePolicy: PrimedCachePolicy
}

const defaultGeminiConfig: GeminiConfigService = {
  modelId: "gemini-2.5-flash",
  apiKey: Redacted.make(""),
  baseUrl: undefined,
  temperature: 0,
  providerConcurrency: 8,
  vertexai: false,
  project: undefined,
  location: undefined,
  formatType: "json",
  primedCacheScope: "session",
  primedCachePolicy: new PrimedCachePolicy({
    namespace: "gemini"
  })
}

const GeminiConfigEnv = Config.all({
  modelId: Config.string("GEMINI_MODEL_ID").pipe(
    Config.withDefault(defaultGeminiConfig.modelId)
  ),
  apiKey: Config.redacted("GEMINI_API_KEY").pipe(
    Config.withDefault(defaultGeminiConfig.apiKey)
  ),
  baseUrl: Config.string("GEMINI_BASE_URL").pipe(Config.option),
  temperature: Config.number("GEMINI_TEMPERATURE").pipe(
    Config.withDefault(defaultGeminiConfig.temperature)
  ),
  providerConcurrency: Config.integer("GEMINI_PROVIDER_CONCURRENCY").pipe(
    Config.withDefault(defaultGeminiConfig.providerConcurrency)
  ),
  vertexai: Config.boolean("GEMINI_VERTEXAI").pipe(
    Config.withDefault(defaultGeminiConfig.vertexai)
  ),
  project: Config.string("GEMINI_PROJECT").pipe(Config.option),
  location: Config.string("GEMINI_LOCATION").pipe(Config.option),
  formatType: Config.literal("json", "yaml")("GEMINI_FORMAT_TYPE").pipe(
    Config.withDefault(defaultGeminiConfig.formatType)
  ),
  primedCacheScope: Config.literal("request", "session")(
    "GEMINI_PRIMED_CACHE_SCOPE"
  ).pipe(Config.withDefault(defaultGeminiConfig.primedCacheScope)),
  primedCacheNamespace: Config.string("GEMINI_PRIMED_CACHE_NAMESPACE").pipe(
    Config.withDefault("gemini")
  )
})

const nonEmptyRedacted = (value: Redacted.Redacted): Redacted.Redacted | undefined => {
  const raw = Redacted.value(value)
  return raw.trim().length > 0 ? value : undefined
}

export class GeminiConfig extends Effect.Service<GeminiConfig>()(
  "@effect-langextract/providers/GeminiConfig",
  {
    sync: () => ({ ...defaultGeminiConfig } satisfies GeminiConfigService)
  }
) {
  static readonly Test: Layer.Layer<GeminiConfig> = GeminiConfig.Default

  static testLayer = (
    overrides?: Partial<GeminiConfigService>
  ): Layer.Layer<GeminiConfig> =>
    Layer.succeed(
      GeminiConfig,
      GeminiConfig.make({
        ...defaultGeminiConfig,
        ...overrides,
        primedCachePolicy:
          overrides?.primedCachePolicy ?? defaultGeminiConfig.primedCachePolicy
      })
    )
}

export const GeminiConfigFromEnv: Layer.Layer<GeminiConfig> = Layer.effect(
  GeminiConfig,
  GeminiConfigEnv.pipe(
    Effect.map((loaded) =>
      GeminiConfig.make({
        ...defaultGeminiConfig,
        modelId: loaded.modelId,
        apiKey: loaded.apiKey,
        baseUrl: Option.getOrUndefined(loaded.baseUrl),
        temperature: loaded.temperature,
        providerConcurrency: loaded.providerConcurrency,
        vertexai: loaded.vertexai,
        project: Option.getOrUndefined(loaded.project),
        location: Option.getOrUndefined(loaded.location),
        formatType: loaded.formatType,
        primedCacheScope: loaded.primedCacheScope,
        primedCachePolicy: new PrimedCachePolicy({
          namespace: loaded.primedCacheNamespace
        })
      })
    )
  )
).pipe(Layer.orDie)

export const GeminiConfigLive: Layer.Layer<GeminiConfig> = GeminiConfigFromEnv

export const GeminiNativeLanguageModelLive: Layer.Layer<
  NativeLanguageModel.LanguageModel,
  never,
  GeminiConfig | HttpClient.HttpClient
> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* GeminiConfig

    const apiKey = nonEmptyRedacted(config.apiKey)

    const clientLayer = GoogleClient.layer({
      ...(apiKey !== undefined ? { apiKey } : {}),
      ...(config.baseUrl !== undefined ? { apiUrl: config.baseUrl } : {})
    })

    const modelLayer = GoogleLanguageModel.layer({
      model: config.modelId,
      config: {
        toolConfig: {},
        generationConfig: {
          temperature: config.temperature
        }
      }
    })

    return Layer.provide(modelLayer, clientLayer)
  })
)

export const GeminiLanguageModelLive: Layer.Layer<
  LanguageModel,
  never,
  GeminiConfig | PrimedCache | RuntimeControl | HttpClient.HttpClient
> = Layer.provide(
  Layer.effect(
    LanguageModel,
    Effect.gen(function* () {
      const config = yield* GeminiConfig
      const cache = yield* PrimedCache
      const runtimeControl = yield* RuntimeControl
      const nativeModel = yield* NativeLanguageModel.LanguageModel

      return LanguageModel.make(
        makeProviderLanguageModelService({
          provider: "gemini",
          modelId: config.modelId,
          requiresFenceOutput: config.formatType !== "json",
          schema: new FormatModeSchema({
            formatType: config.formatType,
            useFences: config.formatType !== "json"
          }),
          defaultProviderMetadata: {
            temperature: config.temperature,
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
  GeminiNativeLanguageModelLive
)
