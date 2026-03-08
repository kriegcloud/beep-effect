import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import * as OpenAiClient from "@effect/ai-openai/OpenAiClient"
import * as OpenAiLanguageModel from "@effect/ai-openai/OpenAiLanguageModel"
import * as HttpClient from "@effect/platform/HttpClient"
import { Config, Effect, Layer, Option, Redacted } from "effect"

import { FormatType } from "../FormatType.js"
import { LanguageModel } from "../LanguageModel.js"
import { PrimedCache, PrimedCachePolicy } from "../PrimedCache.js"
import { FormatModeSchema } from "../ProviderSchema.js"
import { RuntimeControl } from "../RuntimeControl.js"
import { makeProviderLanguageModelService } from "./AiAdapters.js"

export interface OpenAIConfigService {
  readonly modelId: string
  readonly apiKey: Redacted.Redacted
  readonly baseUrl?: string | undefined
  readonly organization?: string | undefined
  readonly temperature?: number | undefined
  readonly providerConcurrency: number
  readonly formatType: FormatType
  readonly primedCacheScope: "request" | "session"
  readonly primedCachePolicy: PrimedCachePolicy
}

const defaultOpenAIConfig: OpenAIConfigService = {
  modelId: "gpt-4o-mini",
  apiKey: Redacted.make(""),
  baseUrl: undefined,
  organization: undefined,
  temperature: undefined,
  providerConcurrency: 8,
  formatType: "json",
  primedCacheScope: "session",
  primedCachePolicy: new PrimedCachePolicy({
    namespace: "openai"
  })
}

const OpenAIConfigEnv = Config.all({
  modelId: Config.string("OPENAI_MODEL_ID").pipe(
    Config.withDefault(defaultOpenAIConfig.modelId)
  ),
  apiKey: Config.redacted("OPENAI_API_KEY").pipe(
    Config.withDefault(defaultOpenAIConfig.apiKey)
  ),
  baseUrl: Config.string("OPENAI_BASE_URL").pipe(Config.option),
  organization: Config.string("OPENAI_ORGANIZATION").pipe(Config.option),
  temperature: Config.number("OPENAI_TEMPERATURE").pipe(Config.option),
  providerConcurrency: Config.integer("OPENAI_PROVIDER_CONCURRENCY").pipe(
    Config.withDefault(defaultOpenAIConfig.providerConcurrency)
  ),
  formatType: Config.literal("json", "yaml")("OPENAI_FORMAT_TYPE").pipe(
    Config.withDefault(defaultOpenAIConfig.formatType)
  ),
  primedCacheScope: Config.literal("request", "session")(
    "OPENAI_PRIMED_CACHE_SCOPE"
  ).pipe(Config.withDefault(defaultOpenAIConfig.primedCacheScope)),
  primedCacheNamespace: Config.string("OPENAI_PRIMED_CACHE_NAMESPACE").pipe(
    Config.withDefault("openai")
  )
})

const nonEmptyRedacted = (value: Redacted.Redacted): Redacted.Redacted | undefined => {
  const raw = Redacted.value(value)
  return raw.trim().length > 0 ? value : undefined
}

export class OpenAIConfig extends Effect.Service<OpenAIConfig>()(
  "@effect-langextract/providers/OpenAIConfig",
  {
    sync: () => ({ ...defaultOpenAIConfig } satisfies OpenAIConfigService)
  }
) {
  static readonly Test: Layer.Layer<OpenAIConfig> = OpenAIConfig.Default

  static testLayer = (
    overrides?: Partial<OpenAIConfigService>
  ): Layer.Layer<OpenAIConfig> =>
    Layer.succeed(
      OpenAIConfig,
      OpenAIConfig.make({
        ...defaultOpenAIConfig,
        ...overrides,
        primedCachePolicy:
          overrides?.primedCachePolicy ?? defaultOpenAIConfig.primedCachePolicy
      })
    )
}

export const OpenAIConfigFromEnv: Layer.Layer<OpenAIConfig> = Layer.effect(
  OpenAIConfig,
  OpenAIConfigEnv.pipe(
    Effect.map((loaded) =>
      OpenAIConfig.make({
        ...defaultOpenAIConfig,
        modelId: loaded.modelId,
        apiKey: loaded.apiKey,
        baseUrl: Option.getOrUndefined(loaded.baseUrl),
        organization: Option.getOrUndefined(loaded.organization),
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

export const OpenAIConfigLive: Layer.Layer<OpenAIConfig> = OpenAIConfigFromEnv

export const OpenAINativeLanguageModelLive: Layer.Layer<
  NativeLanguageModel.LanguageModel,
  never,
  OpenAIConfig | HttpClient.HttpClient
> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* OpenAIConfig

    const apiKey = nonEmptyRedacted(config.apiKey)
    const organization = config.organization !== undefined && config.organization.trim().length > 0
      ? Redacted.make(config.organization)
      : undefined

    const clientLayer = OpenAiClient.layer({
      ...(apiKey !== undefined ? { apiKey } : {}),
      ...(config.baseUrl !== undefined ? { apiUrl: config.baseUrl } : {}),
      ...(organization !== undefined ? { organizationId: organization } : {})
    })

    const modelLayer = OpenAiLanguageModel.layer({
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

export const OpenAILanguageModelLive: Layer.Layer<
  LanguageModel,
  never,
  OpenAIConfig | PrimedCache | RuntimeControl | HttpClient.HttpClient
> = Layer.provide(
  Layer.effect(
    LanguageModel,
    Effect.gen(function* () {
      const config = yield* OpenAIConfig
      const cache = yield* PrimedCache
      const runtimeControl = yield* RuntimeControl
      const nativeModel = yield* NativeLanguageModel.LanguageModel

      return LanguageModel.make(
        makeProviderLanguageModelService({
          provider: "openai",
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
  OpenAINativeLanguageModelLive
)
