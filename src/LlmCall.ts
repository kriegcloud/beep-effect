import * as LanguageModel from "@effect/ai/LanguageModel"
import type * as Prompt from "@effect/ai/Prompt"
import { Context, Duration, Effect, Layer } from "effect"
import { recordTokens, reserveLlmCall, withLlmPermit } from "./Budget"
import { RlmConfig } from "./RlmConfig"
import { BudgetExhaustedError, ModelCallError } from "./RlmError"
import { RlmModel } from "./RlmModel"
import { RlmRuntime } from "./Runtime"
import type { CallId } from "./RlmTypes"

export interface LlmGenerateTextOptions {
  readonly callId: CallId
  readonly prompt: Prompt.Prompt
  readonly depth: number
  readonly isSubCall?: boolean
  readonly namedModel?: string
  readonly routeSource?: "named" | "sub" | "primary"
  readonly toolkit?: LanguageModel.GenerateTextOptions<any>["toolkit"]
  readonly toolChoice?: LanguageModel.GenerateTextOptions<any>["toolChoice"]
  readonly disableToolCallResolution?: boolean
  readonly concurrency?: LanguageModel.GenerateTextOptions<any>["concurrency"]
}

export interface LlmCallService {
  readonly generateText: (
    options: LlmGenerateTextOptions
  ) => Effect.Effect<LanguageModel.GenerateTextResponse<any>, BudgetExhaustedError | ModelCallError>
}

export class LlmCall extends Context.Tag("@recursive-llm/LlmCall")<
  LlmCall,
  LlmCallService
>() {}

const toModelErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { readonly message?: unknown }).message
    return typeof message === "string" ? message : String(message)
  }
  return String(error)
}

const computeRetryDelayMs = (
  attempt: number,
  baseDelayMs: number,
  jitter: boolean
): number => {
  const exponentialDelay = Math.max(0, Math.trunc(baseDelayMs)) * (2 ** Math.max(0, attempt - 1))
  if (!jitter || exponentialDelay <= 0) return exponentialDelay
  return Math.floor(Math.random() * (exponentialDelay + 1))
}

export const resolveUsageTokens = (
  usage: Readonly<{
    readonly inputTokens: number | undefined
    readonly outputTokens: number | undefined
    readonly totalTokens: number | undefined
  }>
): number | undefined => {
  if (usage.totalTokens !== undefined) {
    return usage.totalTokens
  }

  const input = usage.inputTokens ?? 0
  const output = usage.outputTokens ?? 0
  const fallbackTotal = input + output
  return fallbackTotal > 0 ? fallbackTotal : undefined
}

export const LlmCallLive: Layer.Layer<LlmCall, never, RlmRuntime | RlmModel | RlmConfig> = Layer.effect(
  LlmCall,
  Effect.gen(function*() {
    const runtime = yield* RlmRuntime
    const rlmModel = yield* RlmModel
    const config = yield* RlmConfig

    const maxRetries = Math.max(0, config.llmRetryCount ?? 1)
    const maxAttempts = maxRetries + 1
    const retryBaseDelayMs = Math.max(0, config.llmRetryBaseDelayMs ?? 100)
    const retryJitter = config.llmRetryJitter ?? true

    const generateText = Effect.fn("LlmCall.generateText")(function*(options: LlmGenerateTextOptions) {
      const runAttempt = (attempt: number): Effect.Effect<
        LanguageModel.GenerateTextResponse<any>,
        BudgetExhaustedError | ModelCallError
      > =>
        Effect.gen(function*() {
          yield* reserveLlmCall(options.callId).pipe(
            Effect.provideService(RlmRuntime, runtime)
          )

          const response = yield* withLlmPermit(
            rlmModel.generateText({
              prompt: options.prompt,
              depth: options.depth,
              ...(options.isSubCall !== undefined ? { isSubCall: options.isSubCall } : {}),
              ...(options.namedModel !== undefined ? { namedModel: options.namedModel } : {}),
              ...(options.routeSource !== undefined ? { routeSource: options.routeSource } : {}),
              ...(options.toolkit !== undefined ? { toolkit: options.toolkit } : {}),
              ...(options.toolChoice !== undefined ? { toolChoice: options.toolChoice } : {}),
              ...(options.disableToolCallResolution !== undefined
                ? { disableToolCallResolution: options.disableToolCallResolution }
                : {}),
              ...(options.concurrency !== undefined ? { concurrency: options.concurrency } : {})
            })
          ).pipe(
            Effect.provideService(RlmRuntime, runtime),
            Effect.mapError((error) =>
              error instanceof BudgetExhaustedError || error instanceof ModelCallError
                ? error
                : new ModelCallError({
                    provider: "unknown",
                    model: options.namedModel ?? config.primaryTarget.model,
                    operation: "generateText",
                    retryable: false,
                    message: toModelErrorMessage(error),
                    cause: error
                  })
            )
          )

          yield* recordTokens(options.callId, resolveUsageTokens(response.usage)).pipe(
            Effect.provideService(RlmRuntime, runtime)
          )

          return response
        }).pipe(
          Effect.catchTag("ModelCallError", (error) =>
            Effect.gen(function*() {
              yield* Effect.logWarning(
                `LLM generateText attempt ${attempt}/${maxAttempts} failed for ${error.provider}/${error.model}: ${error.message}`
              )

              const shouldRetry = error.retryable && attempt <= maxRetries
              if (!shouldRetry) {
                return yield* error
              }

              const delayMs = computeRetryDelayMs(attempt, retryBaseDelayMs, retryJitter)
              if (delayMs > 0) {
                yield* Effect.sleep(Duration.millis(delayMs))
              }
              return yield* runAttempt(attempt + 1)
            })
          )
        )

      return yield* runAttempt(1)
    })

    return LlmCall.of({ generateText })
  })
)
