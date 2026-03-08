import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import { Clock, Effect, Schema, Stream } from "effect"
import * as JSONSchema from "effect/JSONSchema"

import { InferenceRuntimeError } from "../Errors.js"
import { type FormatType, ScoredOutput } from "../FormatType.js"
import { errorMessage } from "../internal/errorMessage.js"
import { fnv1aHash } from "../internal/hash.js"
import type { InferOptions, LanguageModelService } from "../LanguageModel.js"
import { PrimedCache, PrimedCacheKey } from "../PrimedCache.js"
import { FormatModeSchema, type ProviderSchema } from "../ProviderSchema.js"
import { RuntimeControl, withProviderPermitStream } from "../RuntimeControl.js"

const JsonString = Schema.parseJson()
const JsonRecord = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown
})

const TextDeltaPart = Schema.Struct({
  type: Schema.Literal("text-delta"),
  delta: Schema.String
})

const isTextDeltaPart = Schema.is(TextDeltaPart)

const makeCacheFingerprint = (prompt: string): string => fnv1aHash(prompt)

const normalizeNamespace = (options?: InferOptions): string =>
  options?.cachePolicy?.namespace ?? "langextract"

interface ProviderRequestMetadata {
  readonly temperature?: number | undefined
  readonly formatType?: FormatType | undefined
}

const isFormatType = (value: unknown): value is FormatType =>
  value === "json" || value === "yaml"

const normalizeProviderMetadata = (
  value: unknown
): ProviderRequestMetadata => {
  if (typeof value !== "object" || value === null) {
    return {}
  }
  const record = value as Record<string, unknown>
  return {
    ...(typeof record.temperature === "number"
      ? { temperature: record.temperature }
      : {}),
    ...(isFormatType(record.formatType)
      ? { formatType: record.formatType }
      : {})
  }
}

const applyProviderMetadataDefaults = (
  inferOptions: InferOptions | undefined,
  defaults: ProviderRequestMetadata | undefined
): InferOptions | undefined => {
  if (defaults === undefined) {
    return inferOptions
  }
  const mergedProviderOptions = {
    ...defaults,
    ...normalizeProviderMetadata(inferOptions?.providerOptions)
  }
  return {
    ...(inferOptions ?? {}),
    providerOptions: mergedProviderOptions
  }
}

const extractProviderMetadata = (
  options?: InferOptions
): ProviderRequestMetadata =>
  normalizeProviderMetadata(options?.providerOptions)

const isDeterministicRequest = (options?: InferOptions): boolean => {
  const { temperature } = extractProviderMetadata(options)
  if (temperature !== undefined) {
    return temperature <= 0
  }
  return true
}

const cacheKeyForPrompt = (
  provider: string,
  modelId: string,
  prompt: string,
  options?: InferOptions
): PrimedCacheKey => {
  const providerMetadata = extractProviderMetadata(options)
  return new PrimedCacheKey({
    provider,
    modelId,
    promptFingerprint: makeCacheFingerprint(prompt),
    ...(options?.structuredOutput !== undefined
      ? {
          schemaFingerprint: fnv1aHash(
            JSON.stringify(JSONSchema.make(options.structuredOutput.schema))
          )
        }
      : {}),
    ...(providerMetadata.temperature !== undefined
      ? { temperature: providerMetadata.temperature }
      : {}),
    ...(providerMetadata.formatType !== undefined
      ? { formatType: providerMetadata.formatType }
      : {}),
    promptVersion: `pass-${options?.passNumber ?? 1}`,
    namespace: normalizeNamespace(options)
  })
}

const withCacheMetadata = (
  value: ReadonlyArray<ScoredOutput>,
  cacheKey: string,
  status: "hit" | "miss"
): ReadonlyArray<ScoredOutput> =>
  value.map(
    (item) =>
      new ScoredOutput({
        ...(item.provider !== undefined ? { provider: item.provider } : {}),
        ...(item.output !== undefined ? { output: item.output } : {}),
        ...(item.score !== undefined ? { score: item.score } : {}),
        cacheStatus: status,
        cacheKey
      })
  )

const toInferenceRuntimeError = (
  provider: string,
  message: string,
  error?: unknown
): InferenceRuntimeError =>
  new InferenceRuntimeError({
    provider,
    message:
      error === undefined
        ? message
        : `${message}: ${errorMessage(error)}`
  })

const logProviderEvent = (
  message: string,
  fields: Readonly<Record<string, unknown>>
): Effect.Effect<void> =>
  Effect.logDebug(message).pipe(Effect.annotateLogs(fields))

const toTextDelta = (part: unknown): string | undefined =>
  isTextDeltaPart(part) ? part.delta : undefined

const invokeNativeText = (
  nativeModel: NativeLanguageModel.Service,
  provider: string,
  prompt: string,
  runtimeControl: RuntimeControl
): Effect.Effect<string, InferenceRuntimeError> =>
  runtimeControl.withProviderPermit(provider, nativeModel.generateText({ prompt })).pipe(
    Effect.map((response) => response.text),
    Effect.mapError((error) =>
      toInferenceRuntimeError(provider, "Provider text generation failed", error)
    )
  )

const invokeNativeStreamText = (
  nativeModel: NativeLanguageModel.Service,
  provider: string,
  prompt: string,
  runtimeControl: RuntimeControl,
  modelId: string
): Stream.Stream<string, InferenceRuntimeError> =>
  withProviderPermitStream(
    runtimeControl,
    provider,
    nativeModel.streamText({ prompt }).pipe(
      Stream.mapError((error) =>
        toInferenceRuntimeError(provider, "Provider text stream failed", error)
      ),
      Stream.tap(() =>
        logProviderEvent("langextract.provider.stream_chunk", {
          provider,
          modelId
        })
      ),
      Stream.map(toTextDelta),
      Stream.filter((delta) => delta !== undefined),
      Stream.map((delta) => delta as string)
    )
  )

const runPromptInference = (
  nativeModel: NativeLanguageModel.Service,
  provider: string,
  modelId: string,
  cache: PrimedCache,
  runtimeControl: RuntimeControl,
  prompt: string,
  options?: InferOptions
): Effect.Effect<ReadonlyArray<ScoredOutput>, InferenceRuntimeError> =>
  Effect.gen(function* () {
    const startedAtMs = yield* Clock.currentTimeMillis
    const key = cacheKeyForPrompt(provider, modelId, prompt, options)
    const keyString = `${key.namespace}:${key.provider}:${key.modelId}:${key.promptFingerprint}`
    const deterministic = isDeterministicRequest(options)
    const cacheOptions = {
      policy: options?.cachePolicy,
      isDeterministic: deterministic
    } as const

    yield* logProviderEvent("langextract.provider.request_start", {
      provider,
      modelId,
      key: keyString,
      promptVersion: key.promptVersion
    })

    const cached = yield* cache.get(key, cacheOptions).pipe(
      Effect.mapError((error) =>
        toInferenceRuntimeError(provider, "Failed to read primed cache", error)
      )
    )

    if (cached !== undefined) {
      yield* logProviderEvent("langextract.provider.cache_hit", {
        provider,
        modelId,
        key: keyString,
        promptVersion: key.promptVersion
      })
      return withCacheMetadata(cached, keyString, "hit")
    }

    const output = yield* invokeNativeText(
      nativeModel,
      provider,
      prompt,
      runtimeControl
    ).pipe(
      Effect.tapError(() =>
        logProviderEvent("langextract.provider.request_failed", {
          provider,
          modelId,
          key: keyString,
          promptVersion: key.promptVersion,
          reason: "native_text_generation_failed"
        })
      )
    )
    const scored = [
      new ScoredOutput({
        provider,
        output,
        score: 1
      })
    ] as const

    yield* cache.put(key, scored, cacheOptions).pipe(
      Effect.mapError((error) =>
        toInferenceRuntimeError(provider, "Failed to write primed cache", error)
      )
    )

    const finishedAtMs = yield* Clock.currentTimeMillis
    yield* logProviderEvent("langextract.provider.cache_miss", {
      provider,
      modelId,
      key: keyString,
      promptVersion: key.promptVersion,
      latencyMs: Math.max(0, finishedAtMs - startedAtMs)
    })

    return withCacheMetadata(scored, keyString, "miss")
  })

export const makeProviderLanguageModelService = (options: {
  readonly provider: string
  readonly modelId: string
  readonly requiresFenceOutput?: boolean
  readonly schema?: ProviderSchema | undefined
  readonly defaultProviderMetadata?: ProviderRequestMetadata | undefined
  readonly cache: PrimedCache
  readonly runtimeControl: RuntimeControl
  readonly nativeModel: NativeLanguageModel.Service
  readonly defaultProviderConcurrency?: number | undefined
}): LanguageModelService => ({
  modelId: options.modelId,
  requiresFenceOutput: options.requiresFenceOutput ?? false,
  schema:
    options.schema ??
    new FormatModeSchema({
      formatType: options.requiresFenceOutput ? "yaml" : "json",
      useFences: options.requiresFenceOutput ?? false
    }),
  infer: (batchPrompts, inferOptions) =>
    Effect.forEach(
      batchPrompts,
      (prompt) => {
        const effectiveInferOptions = applyProviderMetadataDefaults(
          inferOptions,
          options.defaultProviderMetadata
        )
        return runPromptInference(
          options.nativeModel,
          options.provider,
          options.modelId,
          options.cache,
          options.runtimeControl,
          prompt,
          effectiveInferOptions
        )
      },
      {
        concurrency:
          inferOptions?.providerConcurrency ??
          options.defaultProviderConcurrency ??
          8
      }
    ),
  generateText: (prompt, inferOptions) => {
    const effectiveInferOptions = applyProviderMetadataDefaults(
      inferOptions,
      options.defaultProviderMetadata
    )
    return runPromptInference(
      options.nativeModel,
      options.provider,
      options.modelId,
      options.cache,
      options.runtimeControl,
      prompt,
      effectiveInferOptions
    ).pipe(Effect.map((values) => values[0] ?? new ScoredOutput({})))
  },
  generateObject: (prompt, inferOptions) => {
    const effectiveInferOptions = applyProviderMetadataDefaults(
      inferOptions,
      options.defaultProviderMetadata
    )
    return options.runtimeControl.withProviderPermit(
      options.provider,
      options.nativeModel.generateObject({
        prompt,
        schema: effectiveInferOptions?.structuredOutput?.schema ?? JsonRecord,
        ...(effectiveInferOptions?.structuredOutput?.objectName !== undefined
          ? { objectName: effectiveInferOptions.structuredOutput.objectName }
          : {})
      })
    ).pipe(
      Effect.map((response) => response.value),
      Effect.catchAll(() =>
        logProviderEvent("langextract.provider.object_fallback", {
          provider: options.provider,
          modelId: options.modelId,
          reason: "native_object_generation_failed"
        }).pipe(
          Effect.zipRight(
        runPromptInference(
          options.nativeModel,
          options.provider,
          options.modelId,
          options.cache,
          options.runtimeControl,
          prompt,
          effectiveInferOptions
        ).pipe(
          Effect.flatMap((values) =>
            Schema.decodeUnknown(JsonString)(values[0]?.output ?? "{}").pipe(
              Effect.flatMap((decoded) =>
                Schema.decodeUnknown(JsonRecord)(decoded)
              ),
              Effect.mapError((error) =>
                toInferenceRuntimeError(
                  options.provider,
                  "Failed to parse provider JSON output",
                  error
                )
              )
            )
          )
        ))
        )
      ),
      Effect.mapError((error) =>
        toInferenceRuntimeError(options.provider, "Provider object generation failed", error)
      )
    )
  },
  streamText: (prompt, inferOptions) =>
    Stream.unwrap(
      logProviderEvent("langextract.provider.stream_start", {
        provider: options.provider,
        modelId: options.modelId,
        stream: true,
        hasInferOptions: inferOptions !== undefined
      }).pipe(
        Effect.as(
          invokeNativeStreamText(
            options.nativeModel,
            options.provider,
            prompt,
            options.runtimeControl,
            options.modelId
          ).pipe(
            Stream.ensuring(
              logProviderEvent("langextract.provider.stream_complete", {
                provider: options.provider,
                modelId: options.modelId,
                stream: true
              })
            ),
            Stream.tapError(() =>
              logProviderEvent("langextract.provider.stream_failed", {
                provider: options.provider,
                modelId: options.modelId,
                stream: true
              })
            )
          )
        )
      )
    )
})
