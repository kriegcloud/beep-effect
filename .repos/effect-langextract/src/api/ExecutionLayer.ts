import * as HttpClient from "@effect/platform/HttpClient"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import { ConfigProvider, Layer, Redacted } from "effect"

import { AlignmentExecutor } from "../AlignmentExecutor.js"
import { Annotator } from "../Annotator.js"
import { DocumentIdGenerator } from "../Data.js"
import { FormatHandler } from "../FormatHandler.js"
import { LanguageModel } from "../LanguageModel.js"
import {
  makePrimedCacheLayer,
  PrimedCache} from "../PrimedCache.js"
import { PromptBuilder } from "../Prompting.js"
import { PromptValidator } from "../PromptValidation.js"
import {
  AnthropicConfigLive,
  AnthropicLanguageModelLive
} from "../providers/Anthropic.js"
import { GeminiConfigLive, GeminiLanguageModelLive } from "../providers/Gemini.js"
import { OllamaConfigLive, OllamaLanguageModelLive } from "../providers/Ollama.js"
import { OpenAIConfigLive, OpenAILanguageModelLive } from "../providers/OpenAI.js"
import { Resolver } from "../Resolver.js"
import {
  makeRuntimeControlPermitLayer,
  RuntimeControl} from "../RuntimeControl.js"
import { Tokenizer } from "../Tokenizer.js"
import { Visualizer } from "../Visualization.js"

export type ProviderRuntimeConfig =
  | {
      readonly provider: "gemini"
      readonly modelId: string
      readonly temperature?: number | undefined
      readonly apiKey: Redacted.Redacted
      readonly baseUrl?: string | undefined
      readonly providerConcurrency: number
      readonly primedCacheNamespace: string
    }
  | {
      readonly provider: "openai"
      readonly modelId: string
      readonly temperature?: number | undefined
      readonly apiKey: Redacted.Redacted
      readonly baseUrl?: string | undefined
      readonly organization?: string | undefined
      readonly providerConcurrency: number
      readonly primedCacheNamespace: string
    }
  | {
      readonly provider: "anthropic"
      readonly modelId: string
      readonly temperature?: number | undefined
      readonly apiKey: Redacted.Redacted
      readonly baseUrl?: string | undefined
      readonly providerConcurrency: number
      readonly primedCacheNamespace: string
    }
  | {
      readonly provider: "ollama"
      readonly modelId: string
      readonly temperature?: number | undefined
      readonly baseUrl: string
      readonly providerConcurrency: number
      readonly primedCacheNamespace: string
    }

export interface ExecutionLayerOverrides {
  readonly primedCacheStoreLayer?:
    | Layer.Layer<KeyValueStore.KeyValueStore>
    | undefined
  readonly languageModelLayer?: Layer.Layer<LanguageModel> | undefined
  readonly alignmentExecutorLayer?: Layer.Layer<AlignmentExecutor> | undefined
}

const makeProviderConfigLayer = (
  entries: ReadonlyArray<readonly [string, string | number | boolean | Redacted.Redacted | undefined]>
): Layer.Layer<never> => {
  const map = new Map<string, string>()
  for (const [key, value] of entries) {
    if (value !== undefined) {
      map.set(key, Redacted.isRedacted(value) ? Redacted.value(value) : String(value))
    }
  }
  return Layer.setConfigProvider(ConfigProvider.fromMap(map))
}

const makeProviderLayer = (
  config: ProviderRuntimeConfig,
  cacheLayer: Layer.Layer<PrimedCache>
): Layer.Layer<LanguageModel, never, HttpClient.HttpClient | RuntimeControl> => {
  switch (config.provider) {
    case "anthropic": {
      const anthropicConfigLayer = Layer.provide(
        AnthropicConfigLive,
        makeProviderConfigLayer([
          ["ANTHROPIC_MODEL_ID", config.modelId],
          ["ANTHROPIC_API_KEY", config.apiKey],
          ["ANTHROPIC_BASE_URL", config.baseUrl],
          ["ANTHROPIC_TEMPERATURE", config.temperature],
          ["ANTHROPIC_PROVIDER_CONCURRENCY", config.providerConcurrency],
          ["ANTHROPIC_PRIMED_CACHE_NAMESPACE", config.primedCacheNamespace]
        ])
      )

      return Layer.provide(AnthropicLanguageModelLive, [
        anthropicConfigLayer,
        cacheLayer
      ])
    }
    case "openai": {
      const openAiConfigLayer = Layer.provide(
        OpenAIConfigLive,
        makeProviderConfigLayer([
          ["OPENAI_MODEL_ID", config.modelId],
          ["OPENAI_API_KEY", config.apiKey],
          ["OPENAI_BASE_URL", config.baseUrl],
          ["OPENAI_ORGANIZATION", config.organization],
          ["OPENAI_TEMPERATURE", config.temperature],
          ["OPENAI_PROVIDER_CONCURRENCY", config.providerConcurrency],
          ["OPENAI_PRIMED_CACHE_NAMESPACE", config.primedCacheNamespace]
        ])
      )

      return Layer.provide(OpenAILanguageModelLive, [openAiConfigLayer, cacheLayer])
    }
    case "ollama": {
      const ollamaConfigLayer = Layer.provide(
        OllamaConfigLive,
        makeProviderConfigLayer([
          ["OLLAMA_MODEL_ID", config.modelId],
          ["OLLAMA_BASE_URL", config.baseUrl],
          ["OLLAMA_TEMPERATURE", config.temperature],
          ["OLLAMA_PROVIDER_CONCURRENCY", config.providerConcurrency],
          ["OLLAMA_PRIMED_CACHE_NAMESPACE", config.primedCacheNamespace]
        ])
      )

      return Layer.provide(OllamaLanguageModelLive, [ollamaConfigLayer, cacheLayer])
    }
    case "gemini": {
      const geminiConfigLayer = Layer.provide(
        GeminiConfigLive,
        makeProviderConfigLayer([
          ["GEMINI_MODEL_ID", config.modelId],
          ["GEMINI_API_KEY", config.apiKey],
          ["GEMINI_BASE_URL", config.baseUrl],
          ["GEMINI_TEMPERATURE", config.temperature ?? 0],
          ["GEMINI_PROVIDER_CONCURRENCY", config.providerConcurrency],
          ["GEMINI_PRIMED_CACHE_NAMESPACE", config.primedCacheNamespace]
        ])
      )

      return Layer.provide(GeminiLanguageModelLive, [geminiConfigLayer, cacheLayer])
    }
  }
}

const resolverBaseLayer = Layer.provide(Resolver.DefaultWithoutDependencies, [
  Tokenizer.Default,
  FormatHandler.Default
])

const promptValidatorBaseLayer = Layer.provide(
  PromptValidator.DefaultWithoutDependencies,
  [resolverBaseLayer]
)

const visualizerBaseLayer = Visualizer.Default

export const makeExtractionExecutionLayer = (
  config: ProviderRuntimeConfig,
  overrides?: ExecutionLayerOverrides
): Layer.Layer<
  Annotator | PromptValidator | PrimedCache | Visualizer,
  never,
  HttpClient.HttpClient
> => {
  const cacheLayer = makePrimedCacheLayer({
    enableRequestStore: true,
    enableSessionStore: true,
    ...(overrides?.primedCacheStoreLayer !== undefined
      ? { keyValueStoreLayer: overrides.primedCacheStoreLayer }
      : {})
  })

  const providerLayer: Layer.Layer<
    LanguageModel,
    never,
    HttpClient.HttpClient | RuntimeControl
  > =
    overrides?.languageModelLayer ?? makeProviderLayer(config, cacheLayer)

  const effectiveAlignmentExecutorLayer =
    overrides?.alignmentExecutorLayer ??
    Layer.provide(AlignmentExecutor.DefaultWithoutDependencies, [resolverBaseLayer])

  const annotatorLayer = Layer.provide(Annotator.DefaultWithoutDependencies, [
    Tokenizer.Default,
    PromptBuilder.Default,
    FormatHandler.Default,
    effectiveAlignmentExecutorLayer,
    resolverBaseLayer,
    providerLayer,
    DocumentIdGenerator.Default
  ])

  const mergedLayer = Layer.mergeAll(
    annotatorLayer,
    promptValidatorBaseLayer,
    cacheLayer,
    visualizerBaseLayer
  )

  return Layer.provideMerge(
    mergedLayer,
    makeRuntimeControlPermitLayer(config.providerConcurrency)
  )
}
