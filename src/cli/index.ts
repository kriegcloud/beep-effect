import * as KeyValueStore from "@effect/platform/KeyValueStore"
import { Layer, Redacted, Schema } from "effect"

import { AlignmentExecutor } from "../AlignmentExecutor.js"
import { LanguageModel } from "../LanguageModel.js"

export const ProviderName = Schema.Literal(
  "gemini",
  "openai",
  "anthropic",
  "ollama"
)
export type ProviderName = typeof ProviderName.Type

export const OutputFormat = Schema.Literal("json", "jsonl", "html")
export type OutputFormat = typeof OutputFormat.Type

export const InputFormat = Schema.Literal(
  "auto",
  "text",
  "json",
  "jsonl",
  "csv",
  "url",
  "stdin"
)
export type InputFormat = typeof InputFormat.Type

export const RowErrorMode = Schema.Literal("fail-fast", "skip-row")
export type RowErrorMode = typeof RowErrorMode.Type

export interface CliRuntimeOptions {
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly primedCacheStoreLayer?:
    | Layer.Layer<KeyValueStore.KeyValueStore>
    | undefined
  readonly languageModelLayer?: Layer.Layer<LanguageModel> | undefined
  readonly alignmentExecutorLayer?: Layer.Layer<AlignmentExecutor> | undefined
  readonly emitResultToStdout?: boolean | undefined
}

export interface ResolvedExtractCommandConfig {
  readonly input?: string | undefined
  readonly inputFormat: InputFormat
  readonly textField?: string | undefined
  readonly idField?: string | undefined
  readonly contextField: ReadonlyArray<string>
  readonly csvDelimiter?: string | undefined
  readonly csvHeader?: boolean | undefined
  readonly rowErrorMode: RowErrorMode
  readonly documentBatchSize: number
  readonly prompt: string
  readonly examplesFile: string
  readonly provider: ProviderName
  readonly modelId: string
  readonly temperature?: number | undefined
  readonly output: OutputFormat
  readonly outputPath?: string | undefined
  readonly maxCharBuffer: number
  readonly batchLength: number
  readonly batchConcurrency: number
  readonly providerConcurrency: number
  readonly extractionPasses: number
  readonly contextWindowChars?: number | undefined
  readonly maxBatchInputTokens?: number | undefined
  readonly primedCacheEnabled: boolean
  readonly primedCacheDir: string
  readonly primedCacheNamespace: string
  readonly primedCacheTtlSeconds: number
  readonly primedCacheDeterministicOnly: boolean
  readonly clearPrimedCacheOnStart: boolean
  readonly openAiApiKey: Redacted.Redacted
  readonly openAiBaseUrl?: string | undefined
  readonly openAiOrganization?: string | undefined
  readonly geminiApiKey: Redacted.Redacted
  readonly geminiBaseUrl?: string | undefined
  readonly anthropicApiKey: Redacted.Redacted
  readonly anthropicBaseUrl?: string | undefined
  readonly ollamaBaseUrl: string
}

export interface ExecuteExtractCommandOptions {
  readonly input?: string | undefined
  readonly inputFormat?: InputFormat | undefined
  readonly textField?: string | undefined
  readonly idField?: string | undefined
  readonly contextField?: ReadonlyArray<string> | undefined
  readonly csvDelimiter?: string | undefined
  readonly csvHeader?: boolean | undefined
  readonly rowErrorMode?: RowErrorMode | undefined
  readonly documentBatchSize?: number | undefined
  readonly prompt?: string | undefined
  readonly examplesFile?: string | undefined
  readonly provider?: ProviderName | undefined
  readonly modelId?: string | undefined
  readonly temperature?: number | undefined
  readonly output?: OutputFormat | undefined
  readonly outputPath?: string | undefined
  readonly maxCharBuffer?: number | undefined
  readonly batchLength?: number | undefined
  readonly batchConcurrency?: number | undefined
  readonly providerConcurrency?: number | undefined
  readonly extractionPasses?: number | undefined
  readonly contextWindowChars?: number | undefined
  readonly maxBatchInputTokens?: number | undefined
  readonly primedCacheEnabled?: boolean | undefined
  readonly primedCacheDir?: string | undefined
  readonly primedCacheNamespace?: string | undefined
  readonly primedCacheTtlSeconds?: number | undefined
  readonly primedCacheDeterministicOnly?: boolean | undefined
  readonly clearPrimedCacheOnStart?: boolean | undefined
  readonly openAiApiKey?: Redacted.Redacted | undefined
  readonly openAiBaseUrl?: string | undefined
  readonly openAiOrganization?: string | undefined
  readonly geminiApiKey?: Redacted.Redacted | undefined
  readonly geminiBaseUrl?: string | undefined
  readonly anthropicApiKey?: Redacted.Redacted | undefined
  readonly anthropicBaseUrl?: string | undefined
  readonly ollamaBaseUrl?: string | undefined
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly primedCacheStoreLayer?:
    | Layer.Layer<KeyValueStore.KeyValueStore>
    | undefined
  readonly languageModelLayer?: Layer.Layer<LanguageModel> | undefined
  readonly alignmentExecutorLayer?: Layer.Layer<AlignmentExecutor> | undefined
}
