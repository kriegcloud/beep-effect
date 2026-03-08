import * as LanguageModel from "@effect/ai/LanguageModel"
import type * as Prompt from "@effect/ai/Prompt"
import * as AnthropicLanguageModel from "@effect/ai-anthropic/AnthropicLanguageModel"
import type { AnthropicClient } from "@effect/ai-anthropic/AnthropicClient"
import * as GoogleLanguageModel from "@effect/ai-google/GoogleLanguageModel"
import type { GoogleClient } from "@effect/ai-google/GoogleClient"
import * as OpenAiLanguageModel from "@effect/ai-openai/OpenAiLanguageModel"
import type { OpenAiClient } from "@effect/ai-openai/OpenAiClient"
import { Context, Effect, Layer } from "effect"
import type { RlmModelTarget } from "./RlmConfig"
import type { RlmError } from "./RlmError"
import { ModelCallError } from "./RlmError"

// --- Service interface ---

export interface RlmModelService {
  readonly generateText: (options: {
    readonly prompt: Prompt.Prompt
    readonly depth: number
    readonly isSubCall?: boolean
    readonly namedModel?: string
    readonly routeSource?: "named" | "sub" | "primary"
    readonly toolkit?: LanguageModel.GenerateTextOptions<any>["toolkit"]
    readonly toolChoice?: LanguageModel.GenerateTextOptions<any>["toolChoice"]
    readonly disableToolCallResolution?: boolean
    readonly concurrency?: LanguageModel.GenerateTextOptions<any>["concurrency"]
  }) => Effect.Effect<LanguageModel.GenerateTextResponse<any>, RlmError>
}

export class RlmModel extends Context.Tag("@recursive-llm/RlmModel")<
  RlmModel,
  RlmModelService
>() {}

export interface SubLlmDelegationOptions {
  readonly enabled: boolean
  readonly depthThreshold: number
}

const toModelErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { readonly message?: unknown }).message
    return typeof message === "string" ? message : String(message)
  }
  return String(error)
}

const isRetryableModelError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    const text = String(error).toLowerCase()
    return text.includes("timeout")
      || text.includes("rate limit")
      || text.includes("overload")
      || text.includes("transient")
      || text.includes("temporar")
  }

  if ("retryable" in error && typeof (error as { readonly retryable?: unknown }).retryable === "boolean") {
    return (error as { readonly retryable: boolean }).retryable
  }

  const statusCandidate =
    "status" in error
      ? (error as { readonly status?: unknown }).status
      : "statusCode" in error
      ? (error as { readonly statusCode?: unknown }).statusCode
      : undefined

  if (typeof statusCandidate === "number") {
    if (statusCandidate === 408 || statusCandidate === 409 || statusCandidate === 425 || statusCandidate === 429) {
      return true
    }
    if (statusCandidate >= 500 && statusCandidate <= 504) {
      return true
    }
  }

  const codeCandidate = "code" in error
    ? (error as { readonly code?: unknown }).code
    : undefined
  if (typeof codeCandidate === "string") {
    const normalized = codeCandidate.toLowerCase()
    if (
      normalized.includes("timeout")
      || normalized.includes("rate")
      || normalized.includes("overload")
      || normalized.includes("temporar")
      || normalized === "econnreset"
      || normalized === "etimedout"
      || normalized === "eai_again"
    ) {
      return true
    }
  }

  const message = toModelErrorMessage(error).toLowerCase()
  return message.includes("timeout")
    || message.includes("rate limit")
    || message.includes("overload")
    || message.includes("transient")
    || message.includes("temporar")
}

const UNKNOWN_TARGET: {
  readonly provider: "unknown"
  readonly model: string
} = {
  provider: "unknown",
  model: "unknown"
}

// --- Layer constructor ---

export const makeRlmModelLayer = <RPrimary, RSub = never, RNamed = never>(options: {
  readonly primary: Effect.Effect<LanguageModel.Service, never, RPrimary>
  readonly sub?: Effect.Effect<LanguageModel.Service, never, RSub>
  readonly named?: Record<string, Effect.Effect<LanguageModel.Service, never, RNamed>>
  readonly primaryTarget?: RlmModelTarget
  readonly subTarget?: RlmModelTarget
  readonly namedTargets?: Record<string, RlmModelTarget>
  readonly subLlmDelegation?: SubLlmDelegationOptions
}): Layer.Layer<RlmModel, never, RPrimary | RSub | RNamed> =>
  Layer.effect(RlmModel, Effect.gen(function*() {
    const primaryLm = yield* options.primary
    const primaryTarget = options.primaryTarget ?? UNKNOWN_TARGET
    const hasSubModel = options.sub !== undefined
    const subLm = hasSubModel ? yield* options.sub! : primaryLm
    const subTarget = hasSubModel
      ? options.subTarget ?? options.primaryTarget ?? UNKNOWN_TARGET
      : primaryTarget
    const namedEntries = options.named !== undefined
      ? Object.entries(options.named)
      : []
    const namedModels = new Map<string, {
      readonly service: LanguageModel.Service
      readonly target: RlmModelTarget | typeof UNKNOWN_TARGET
    }>()

    for (const [name, modelEffect] of namedEntries) {
      namedModels.set(name, {
        service: yield* modelEffect,
        target: options.namedTargets?.[name] ?? { provider: "unknown", model: name }
      })
    }

    const subLlmDelegation: SubLlmDelegationOptions = options.subLlmDelegation ?? {
      enabled: hasSubModel,
      depthThreshold: 1
    }

    return RlmModel.of({
      generateText: ({ prompt, depth, isSubCall, namedModel, toolkit, toolChoice, disableToolCallResolution, concurrency }) => {
        let selectedModel: {
          readonly service: LanguageModel.Service
          readonly target: RlmModelTarget | typeof UNKNOWN_TARGET
        }
        if (namedModel !== undefined) {
          const named = namedModels.get(namedModel)
          if (named === undefined) {
            return Effect.fail(new ModelCallError({
              provider: "unknown",
              model: namedModel,
              operation: "generateText",
              retryable: false,
              message: `Unknown named model "${namedModel}". Available: ${[...namedModels.keys()].join(", ") || "(none)"}`
            }))
          }
          selectedModel = named
        } else {
          const useSubModel =
            hasSubModel &&
            subLlmDelegation.enabled &&
            isSubCall === true &&
            depth >= subLlmDelegation.depthThreshold

          selectedModel = useSubModel
            ? { service: subLm, target: subTarget }
            : { service: primaryLm, target: primaryTarget }
        }

        return selectedModel.service.generateText({
          prompt,
          ...(toolkit !== undefined ? { toolkit } : {}),
          ...(toolChoice !== undefined ? { toolChoice } : {}),
          ...(disableToolCallResolution !== undefined
            ? { disableToolCallResolution }
            : {}),
          ...(concurrency !== undefined ? { concurrency } : {})
        }).pipe(
          Effect.mapError((error) =>
            error instanceof ModelCallError
              ? error
              : new ModelCallError({
                  provider: selectedModel.target.provider,
                  model: selectedModel.target.model,
                  operation: "generateText",
                  retryable: isRetryableModelError(error),
                  message: toModelErrorMessage(error),
                  cause: error
                })
          )
        )
      }
    })
  }))

// --- Provider convenience constructors ---

export const makeAnthropicRlmModel = (options: {
  readonly primaryModel: string
  readonly primaryConfig?: Omit<AnthropicLanguageModel.Config.Service, "model">
  readonly subModel?: string
  readonly subConfig?: Omit<AnthropicLanguageModel.Config.Service, "model">
  readonly namedModels?: Record<string, RlmModelTarget>
  readonly subLlmDelegation?: SubLlmDelegationOptions
}): Layer.Layer<RlmModel, never, AnthropicClient> =>
  makeRlmModelLayer({
    primaryTarget: {
      provider: "anthropic",
      model: options.primaryModel
    },
    primary: AnthropicLanguageModel.make({
      model: options.primaryModel,
      ...(options.primaryConfig !== undefined
        ? { config: options.primaryConfig }
        : {})
    }),
    ...(options.subModel !== undefined
      ? {
          subTarget: {
            provider: "anthropic",
            model: options.subModel
          },
          sub: AnthropicLanguageModel.make({
            model: options.subModel,
            ...((options.subConfig ?? options.primaryConfig) !== undefined
              ? { config: (options.subConfig ?? options.primaryConfig)! }
              : {})
          })
        }
      : {}),
    ...(options.namedModels !== undefined
      ? {
          namedTargets: Object.fromEntries(
            Object.entries(options.namedModels)
              .filter(([, target]) => target.provider === "anthropic")
              .map(([name, target]) => [name, target])
          ),
          named: Object.fromEntries(
            Object.entries(options.namedModels)
              .filter(([, target]) => target.provider === "anthropic")
              .map(([name, target]) => [
                name,
                AnthropicLanguageModel.make({
                  model: target.model
                })
              ])
          )
        }
      : {}),
    ...(options.subLlmDelegation !== undefined
      ? { subLlmDelegation: options.subLlmDelegation }
      : {})
  })

export const makeGoogleRlmModel = (options: {
  readonly primaryModel: string
  readonly primaryConfig?: Omit<GoogleLanguageModel.Config.Service, "model">
  readonly subModel?: string
  readonly subConfig?: Omit<GoogleLanguageModel.Config.Service, "model">
  readonly namedModels?: Record<string, RlmModelTarget>
  readonly subLlmDelegation?: SubLlmDelegationOptions
}): Layer.Layer<RlmModel, never, GoogleClient> =>
  makeRlmModelLayer({
    primaryTarget: {
      provider: "google",
      model: options.primaryModel
    },
    primary: GoogleLanguageModel.make({
      model: options.primaryModel,
      ...(options.primaryConfig !== undefined
        ? { config: options.primaryConfig }
        : {})
    }),
    ...(options.subModel !== undefined
      ? {
          subTarget: {
            provider: "google",
            model: options.subModel
          },
          sub: GoogleLanguageModel.make({
            model: options.subModel,
            ...((options.subConfig ?? options.primaryConfig) !== undefined
              ? { config: (options.subConfig ?? options.primaryConfig)! }
              : {})
          })
        }
      : {}),
    ...(options.namedModels !== undefined
      ? {
          namedTargets: Object.fromEntries(
            Object.entries(options.namedModels)
              .filter(([, target]) => target.provider === "google")
              .map(([name, target]) => [name, target])
          ),
          named: Object.fromEntries(
            Object.entries(options.namedModels)
              .filter(([, target]) => target.provider === "google")
              .map(([name, target]) => [
                name,
                GoogleLanguageModel.make({
                  model: target.model
                })
              ])
          )
        }
      : {}),
    ...(options.subLlmDelegation !== undefined
      ? { subLlmDelegation: options.subLlmDelegation }
      : {})
  })

export const makeOpenAiRlmModel = (options: {
  readonly primaryModel: string
  readonly primaryConfig?: Omit<OpenAiLanguageModel.Config.Service, "model">
  readonly subModel?: string
  readonly subConfig?: Omit<OpenAiLanguageModel.Config.Service, "model">
  readonly namedModels?: Record<string, RlmModelTarget>
  readonly subLlmDelegation?: SubLlmDelegationOptions
}): Layer.Layer<RlmModel, never, OpenAiClient> =>
  makeRlmModelLayer({
    primaryTarget: {
      provider: "openai",
      model: options.primaryModel
    },
    primary: OpenAiLanguageModel.make({
      model: options.primaryModel,
      ...(options.primaryConfig !== undefined
        ? { config: options.primaryConfig }
        : {})
    }),
    ...(options.subModel !== undefined
      ? {
          subTarget: {
            provider: "openai",
            model: options.subModel
          },
          sub: OpenAiLanguageModel.make({
            model: options.subModel,
            ...((options.subConfig ?? options.primaryConfig) !== undefined
              ? { config: (options.subConfig ?? options.primaryConfig)! }
              : {})
          })
        }
      : {}),
    ...(options.namedModels !== undefined
      ? {
          namedTargets: Object.fromEntries(
            Object.entries(options.namedModels)
              .filter(([, target]) => target.provider === "openai")
              .map(([name, target]) => [name, target])
          ),
          named: Object.fromEntries(
            Object.entries(options.namedModels)
              .filter(([, target]) => target.provider === "openai")
              .map(([name, target]) => [
                name,
                OpenAiLanguageModel.make({
                  model: target.model
                })
              ])
          )
        }
      : {}),
    ...(options.subLlmDelegation !== undefined
      ? { subLlmDelegation: options.subLlmDelegation }
      : {})
  })
