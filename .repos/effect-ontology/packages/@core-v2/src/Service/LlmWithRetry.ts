/**
 * Service: LLM with Retry
 *
 * Provides a standardized wrapper for LLM calls with:
 * - Configurable retry policy (exponential backoff, jitter)
 * - Timeout management
 * - Telemetry (spans, logging, error annotation)
 * - Consistent error handling
 *
 * Reduces code duplication across extractors and grounders.
 *
 * @since 2.0.0
 * @module Service/LlmWithRetry
 */

import type { LanguageModel } from "@effect/ai"
import { Prompt } from "@effect/ai"
import type { Schema } from "effect"
import { Cause, Duration, Effect, JSONSchema, Ref, Schedule } from "effect"
import type { StructuredPrompt } from "../Prompt/PromptGenerator.js"
import { annotateError, annotateLlmCall, annotateRetry, LlmAttributes } from "../Telemetry/LlmAttributes.js"
import { sha256Sync } from "../Utils/Hash.js"
import { makeCachedPromptFromStructured } from "./PromptCache.js"
import { makeRetryPolicy } from "./Retry.js"

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  readonly initialDelayMs: number
  readonly maxDelayMs: number
  readonly maxAttempts: number
  readonly timeoutMs: number
}

/**
 * Options for generateObjectWithRetry
 */
export interface GenerateObjectWithRetryOptions<A, I extends Record<string, unknown>, R> {
  readonly llm: LanguageModel.Service
  readonly prompt: string | StructuredPrompt
  readonly schema: Schema.Schema<A, I, R>
  readonly objectName: string
  readonly serviceName: string
  readonly model: string
  readonly provider: string
  readonly retryConfig: RetryConfig
  /**
   * Optional telemetry attributes to add to the span
   */
  readonly spanAttributes?: Record<string, unknown>
  /**
   * Optional callback to annotate success logs with domain-specific info
   */
  readonly annotateSuccess?: (response: LanguageModel.GenerateObjectResponse<any, A>) => Record<string, unknown>
  /**
   * Whether to enable prompt caching (only applies when prompt is StructuredPrompt)
   */
  readonly enablePromptCaching?: boolean
}

/**
 * Generate structured object with standardized retry, timeout, and telemetry.
 *
 * @since 2.0.0
 */
export const generateObjectWithRetry = <A, I extends Record<string, unknown>, R>(
  options: GenerateObjectWithRetryOptions<A, I, R>
) =>
  Effect.gen(function*() {
    const {
      annotateSuccess,
      enablePromptCaching = false,
      llm,
      model,
      objectName,
      prompt,
      provider,
      retryConfig,
      schema,
      serviceName,
      spanAttributes
    } = options

    // Convert prompt to Prompt.Prompt if needed
    const promptObj: Prompt.Prompt = typeof prompt === "string"
      ? Prompt.make(prompt)
      : makeCachedPromptFromStructured(prompt, enablePromptCaching)

    // Calculate prompt length for telemetry
    const promptLength = typeof prompt === "string"
      ? prompt.length
      : prompt.systemMessage.length + prompt.userMessage.length

    const retryPolicy = makeRetryPolicy({
      initialDelayMs: retryConfig.initialDelayMs,
      maxDelayMs: retryConfig.maxDelayMs,
      maxAttempts: retryConfig.maxAttempts,
      serviceName
    })

    const retryCount = yield* Ref.make(0)
    const schemaHash = sha256Sync(JSON.stringify(JSONSchema.make(schema)))

    return yield* llm.generateObject({
      prompt: promptObj,
      schema,
      objectName
    }).pipe(
      Effect.timeout(Duration.millis(retryConfig.timeoutMs)),
      Effect.retry({
        schedule: retryPolicy.pipe(
          Schedule.tapInput(() => Ref.update(retryCount, (n) => n + 1))
        )
      }),
      Effect.tapErrorCause((cause) =>
        Effect.all([
          Effect.logError(`${serviceName} LLM call failed, will retry`, {
            stage: serviceName.toLowerCase(),
            promptLength,
            cause: Cause.pretty(cause)
          }),
          annotateError({
            errorType: Cause.isFailType(cause)
              ? (cause.error as Error).constructor?.name ?? "UnknownError"
              : "UnknownCause",
            errorMessage: Cause.pretty(cause).slice(0, 500)
          })
        ])
      ),
      Effect.tap((response: LanguageModel.GenerateObjectResponse<any, A>) =>
        Effect.gen(function*() {
          const retries = yield* Ref.get(retryCount)
          const successAnnotations = annotateSuccess ? annotateSuccess(response) : {}

          yield* Effect.all([
            Effect.logInfo(`${serviceName} LLM response`, {
              stage: serviceName.toLowerCase(),
              inputTokens: response.usage.inputTokens,
              outputTokens: response.usage.outputTokens,
              retryCount: retries,
              ...successAnnotations
            }),
            annotateLlmCall({
              model,
              provider,
              promptLength,
              inputTokens: response.usage.inputTokens,
              outputTokens: response.usage.outputTokens,
              schemaHash
            }),
            annotateRetry({
              retryCount: retries,
              maxAttempts: retryConfig.maxAttempts
            })
          ])
        })
      ),
      Effect.withSpan(`${serviceName.toLowerCase()}-llm`, {
        attributes: {
          [LlmAttributes.PROMPT_LENGTH]: promptLength,
          [LlmAttributes.SCHEMA_HASH]: schemaHash,
          ...spanAttributes
        }
      })
    )
  })
