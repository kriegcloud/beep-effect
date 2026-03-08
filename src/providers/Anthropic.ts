import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import * as AnthropicClient from "@effect/ai-anthropic/AnthropicClient"
import * as AnthropicLanguageModel from "@effect/ai-anthropic/AnthropicLanguageModel"
import * as HttpClient from "@effect/platform/HttpClient"
import { Config, Effect, Layer, Option, Redacted } from "effect"

import { FormatType } from "../FormatType.js"
import { LanguageModel } from "../LanguageModel.js"
import { PrimedCache, PrimedCachePolicy } from "../PrimedCache.js"
import { FormatModeSchema } from "../ProviderSchema.js"
import { RuntimeControl } from "../RuntimeControl.js"
import { makeProviderLanguageModelService } from "./AiAdapters.js"

export interface AnthropicConfigService {
  readonly modelId: string
  readonly apiKey: Redacted.Redacted
  readonly baseUrl?: string | undefined
  readonly temperature?: number | undefined
  readonly providerConcurrency: number
  readonly formatType: FormatType
  readonly primedCacheScope: "request" | "session"
  readonly primedCachePolicy: PrimedCachePolicy
}

const defaultAnthropicConfig: AnthropicConfigService = {
  modelId: "claude-3-5-sonnet-latest",
  apiKey: Redacted.make(""),
  baseUrl: undefined,
  temperature: undefined,
  providerConcurrency: 8,
  formatType: "json",
  primedCacheScope: "session",
  primedCachePolicy: new PrimedCachePolicy({
    namespace: "anthropic"
  })
}

const AnthropicConfigEnv = Config.all({
  modelId: Config.string("ANTHROPIC_MODEL_ID").pipe(
    Config.withDefault(defaultAnthropicConfig.modelId)
  ),
  apiKey: Config.redacted("ANTHROPIC_API_KEY").pipe(
    Config.withDefault(defaultAnthropicConfig.apiKey)
  ),
  baseUrl: Config.string("ANTHROPIC_BASE_URL").pipe(Config.option),
  temperature: Config.number("ANTHROPIC_TEMPERATURE").pipe(Config.option),
  providerConcurrency: Config.integer("ANTHROPIC_PROVIDER_CONCURRENCY").pipe(
    Config.withDefault(defaultAnthropicConfig.providerConcurrency)
  ),
  formatType: Config.literal("json", "yaml")("ANTHROPIC_FORMAT_TYPE").pipe(
    Config.withDefault(defaultAnthropicConfig.formatType)
  ),
  primedCacheScope: Config.literal("request", "session")(
    "ANTHROPIC_PRIMED_CACHE_SCOPE"
  ).pipe(Config.withDefault(defaultAnthropicConfig.primedCacheScope)),
  primedCacheNamespace: Config.string("ANTHROPIC_PRIMED_CACHE_NAMESPACE").pipe(
    Config.withDefault("anthropic")
  )
})

const nonEmptyRedacted = (value: Redacted.Redacted): Redacted.Redacted | undefined => {
  const raw = Redacted.value(value)
  return raw.trim().length > 0 ? value : undefined
}

export class AnthropicConfig extends Effect.Service<AnthropicConfig>()(
  "@effect-langextract/providers/AnthropicConfig",
  {
    sync: () => ({ ...defaultAnthropicConfig } satisfies AnthropicConfigService)
  }
) {
  static readonly Test: Layer.Layer<AnthropicConfig> = AnthropicConfig.Default

  static testLayer = (
    overrides?: Partial<AnthropicConfigService>
  ): Layer.Layer<AnthropicConfig> =>
    Layer.succeed(
      AnthropicConfig,
      AnthropicConfig.make({
        ...defaultAnthropicConfig,
        ...overrides,
        primedCachePolicy:
          overrides?.primedCachePolicy ?? defaultAnthropicConfig.primedCachePolicy
      })
    )
}

export const AnthropicConfigFromEnv: Layer.Layer<AnthropicConfig> = Layer.effect(
  AnthropicConfig,
  AnthropicConfigEnv.pipe(
    Effect.map((loaded) =>
      AnthropicConfig.make({
        ...defaultAnthropicConfig,
        modelId: loaded.modelId,
        apiKey: loaded.apiKey,
        baseUrl: Option.getOrUndefined(loaded.baseUrl),
        temperature: Option.getOrUndefined(loaded.temperature),
        providerConcurrency: loaded.providerConcurrency,
        formatType: loaded.formatType,
        primedCacheScope: loaded.primedCacheScope,
        primedCachePolicy: new PrimedCachePolicy({
          namespace: loaded.primedCacheNamespace
        })
      })
    )
  )
).pipe(Layer.orDie)

export const AnthropicConfigLive: Layer.Layer<AnthropicConfig> =
  AnthropicConfigFromEnv

export const AnthropicNativeLanguageModelLive: Layer.Layer<
  NativeLanguageModel.LanguageModel,
  never,
  AnthropicConfig | HttpClient.HttpClient
> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* AnthropicConfig

    const apiKey = nonEmptyRedacted(config.apiKey)

    const clientLayer = AnthropicClient.layer({
      ...(apiKey !== undefined ? { apiKey } : {}),
      ...(config.baseUrl !== undefined ? { apiUrl: config.baseUrl } : {})
    })

    const modelLayer = AnthropicLanguageModel.layer({
      model: config.modelId,
      config: {
        ...(config.temperature !== undefined
          ? { temperature: config.temperature }
          : {})
      }
    })

    return Layer.provide(modelLayer, clientLayer)
  })
)

export const AnthropicLanguageModelLive: Layer.Layer<
  LanguageModel,
  never,
  AnthropicConfig | PrimedCache | RuntimeControl | HttpClient.HttpClient
> = Layer.provide(
  Layer.effect(
    LanguageModel,
    Effect.gen(function* () {
      const config = yield* AnthropicConfig
      const cache = yield* PrimedCache
      const runtimeControl = yield* RuntimeControl
      const nativeModel = yield* NativeLanguageModel.LanguageModel

      return LanguageModel.make(
        makeProviderLanguageModelService({
          provider: "anthropic",
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
  AnthropicNativeLanguageModelLive
)
