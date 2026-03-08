import { Context, Effect, Fiber, Layer, PubSub, Schema, Stream } from "effect"
import { BridgeHandlerLive } from "./BridgeHandler"
import { LlmCallLive } from "./LlmCall"
import { RlmConfig } from "./RlmConfig"
import { RlmModel } from "./RlmModel"
import type { RlmError } from "./RlmError"
import { BudgetExhaustedError, NoFinalAnswerError, OutputValidationError } from "./RlmError"
import { RlmRuntime, RlmRuntimeLive } from "./Runtime"
import { CallId, type CompletionOutcome, type InputFile, RlmEvent } from "./RlmTypes"
import type { RunSchedulerOptions } from "./Scheduler"
import { runScheduler, runSchedulerWithOutcome } from "./Scheduler"
import { SandboxConfig, SandboxFactory } from "./Sandbox"
import { SandboxBunLive } from "./SandboxBun"
import { renderSubmitAnswer } from "./SubmitTool"
import type { RlmToolAny } from "./RlmTool"
import { BridgeStoreLive } from "./scheduler/BridgeStore"
import { JSONSchema } from "effect"
import type { ContextMetadata } from "./ContextMetadata"
import { RunTraceConfig, RunTraceWriterBun, RunTraceWriterNoopLayer } from "./RunTraceWriter"

export interface CompleteOptionsBase {
  readonly query: string
  readonly context?: string
  readonly contextMetadata?: ContextMetadata
  readonly contextTextField?: string
  readonly mediaAttachments?: RunSchedulerOptions["mediaAttachments"]
  readonly inputs?: ReadonlyArray<InputFile>
  readonly depth?: number
  readonly tools?: ReadonlyArray<RlmToolAny>
}

export interface CompleteOptionsTyped<A> extends CompleteOptionsBase {
  readonly outputSchema: Schema.Schema<A, any, never>
}

export type CompleteOptions<A = string> = A extends string
  ? CompleteOptionsBase & { readonly outputSchema?: undefined }
  : CompleteOptionsTyped<A>

export interface RlmService {
  readonly stream: (options: CompleteOptionsBase) => Stream.Stream<RlmEvent, never>
  readonly completeWithOutcome: {
    (options: CompleteOptionsBase): Effect.Effect<CompletionOutcome, RlmError>
    <A>(options: CompleteOptionsTyped<A>): Effect.Effect<CompletionOutcome, RlmError>
  }
  readonly complete: {
    (options: CompleteOptionsBase): Effect.Effect<string, RlmError>
    <A>(options: CompleteOptionsTyped<A>): Effect.Effect<A, RlmError>
  }
}

const toSchedulerOptions = (options: CompleteOptionsBase & { readonly outputSchema?: Schema.Schema<any, any, never> }): RunSchedulerOptions => ({
  query: options.query,
  context: options.context ?? "",
  ...(options.contextMetadata !== undefined
    ? { contextMetadata: options.contextMetadata }
    : {}),
  ...(options.contextTextField !== undefined
    ? { contextTextField: options.contextTextField }
    : {}),
  ...(options.mediaAttachments !== undefined && options.mediaAttachments.length > 0
    ? { mediaAttachments: options.mediaAttachments }
    : {}),
  ...(options.inputs !== undefined && options.inputs.length > 0
    ? { inputs: options.inputs }
    : {}),
  ...(options.depth !== undefined ? { depth: options.depth } : {}),
  ...(options.tools !== undefined && options.tools.length > 0 ? { tools: options.tools } : {}),
  ...(options.outputSchema !== undefined
    ? { outputJsonSchema: JSONSchema.make(options.outputSchema) }
    : {})
})

const toLegacyPartialError = Effect.fn("Rlm.toLegacyPartialError")(function*(
  outcome: Extract<CompletionOutcome, { readonly _tag: "Partial" }>
) {
  const config = yield* RlmConfig
  if (outcome.payload.reason === "iterations") {
    return yield* new NoFinalAnswerError({
      callId: CallId("root"),
      maxIterations: config.maxIterations
    })
  }

  return yield* new BudgetExhaustedError({
    resource: outcome.payload.reason,
    callId: CallId("root"),
    remaining: 0
  })
})

const streamInternal = (options: CompleteOptionsBase) =>
  Stream.unwrapScoped(
    Effect.gen(function*() {
      const runtime = yield* RlmRuntime
      const events = yield* Stream.fromPubSub(runtime.events, { scoped: true })

      const schedulerFiber = yield* Effect.forkScoped(
        runScheduler(toSchedulerOptions(options)).pipe(
          Effect.catchAll((error) =>
            PubSub.publish(runtime.events, RlmEvent.CallFailed({
              completionId: runtime.completionId,
              callId: CallId("root"),
              depth: 0,
              error
            }))
          ),
          Effect.ensuring(PubSub.shutdown(runtime.events))
        )
      )

      return events.pipe(
        Stream.ensuring(
          Fiber.interrupt(schedulerFiber).pipe(Effect.ignore)
        )
      )
    })
  )

const completeWithOutcomeInternal = Effect.fn("Rlm.completeWithOutcome")(function*(
  options: CompleteOptionsBase & { readonly outputSchema?: Schema.Schema<any, any, never> }
) {
  const outcome = yield* runSchedulerWithOutcome(toSchedulerOptions(options))

  if (outcome._tag === "Partial") {
    return outcome
  }

  if (!options.outputSchema) {
    if (outcome.payload.source === "answer") {
      return outcome
    }
    return yield* new OutputValidationError({
      message: "Plain-text completion requires `SUBMIT({ answer: \"...\" })`.",
      raw: renderSubmitAnswer(outcome.payload)
    })
  }

  if (outcome.payload.source !== "value") {
    return yield* new OutputValidationError({
      message: "Structured completion requires `SUBMIT({ value: ... })`.",
      raw: renderSubmitAnswer(outcome.payload)
    })
  }

  const decoded = yield* Schema.decodeUnknown(options.outputSchema)(outcome.payload.value).pipe(
    Effect.mapError((e) => new OutputValidationError({
      message: `Submitted final content does not match output schema: ${String(e)}`,
      raw: renderSubmitAnswer(outcome.payload)
    }))
  )

  return {
    _tag: "Final" as const,
    payload: {
      source: "value" as const,
      value: decoded
    }
  } satisfies CompletionOutcome
})

const completeInternal = Effect.fn("Rlm.complete")(function*(
  options: CompleteOptionsBase & { readonly outputSchema?: Schema.Schema<any, any, never> }
) {
  const outcome = yield* completeWithOutcomeInternal(options)
  if (outcome._tag === "Partial") {
    return yield* toLegacyPartialError(outcome)
  }
  const submitted = outcome.payload

  if (!options.outputSchema) {
    if (submitted.source === "answer") {
      return submitted.answer
    }
    return yield* new OutputValidationError({
      message: "Plain-text completion requires `SUBMIT({ answer: \"...\" })`.",
      raw: renderSubmitAnswer(submitted)
    })
  }

  if (submitted.source !== "value") {
    return yield* new OutputValidationError({
      message: "Structured completion requires `SUBMIT({ value: ... })`.",
      raw: renderSubmitAnswer(submitted)
    })
  }

  return yield* Schema.decodeUnknown(options.outputSchema)(submitted.value).pipe(
    Effect.mapError((e) => new OutputValidationError({
      message: `Submitted final content does not match output schema: ${String(e)}`,
      raw: renderSubmitAnswer(submitted)
    }))
  )
})

export class Rlm extends Context.Tag("@recursive-llm/Rlm")<
  Rlm,
  RlmService
>() {}

const makeRuntimeStoreLayer = () =>
  Layer.suspend(() => {
    const runtimeLayer = RlmRuntimeLive
    return Layer.merge(
      runtimeLayer,
      Layer.provide(BridgeStoreLive, runtimeLayer)
    )
  })

const makeRlmService = (makePerCallDeps: () => Layer.Layer<any, never, never>) =>
  Rlm.of({
    completeWithOutcome: ((options: CompleteOptionsBase & { readonly outputSchema?: Schema.Schema<any, any, never> }) =>
      completeWithOutcomeInternal(options).pipe(Effect.provide(makePerCallDeps()))) as RlmService["completeWithOutcome"],
    complete: ((options: CompleteOptionsBase & { readonly outputSchema?: Schema.Schema<any, any, never> }) =>
      completeInternal(options).pipe(Effect.provide(makePerCallDeps()))) as RlmService["complete"],
    stream: (options) =>
      streamInternal(options).pipe(Stream.provideLayer(makePerCallDeps()))
  })

export const rlmLayer: Layer.Layer<Rlm, never, RlmModel | SandboxFactory> = Layer.effect(
  Rlm,
  Effect.gen(function*() {
    const rlmModel = yield* RlmModel
    const sandboxFactory = yield* SandboxFactory
    const config = yield* RlmConfig
    const sandboxConfig = yield* SandboxConfig

    const dependencies = Layer.mergeAll(
      Layer.succeed(RlmModel, rlmModel),
      Layer.succeed(SandboxFactory, sandboxFactory),
      Layer.succeed(RlmConfig, config),
      Layer.succeed(SandboxConfig, sandboxConfig)
    )

    return makeRlmService(() => {
      const runtimeStoreLayer = makeRuntimeStoreLayer()
      const llmCallLayer = Layer.provide(
        LlmCallLive,
        runtimeStoreLayer
      )

      return Layer.fresh(
        Layer.provideMerge(
          Layer.mergeAll(runtimeStoreLayer, llmCallLayer),
          dependencies
        )
      )
    })
  })
)

export const rlmBunLayer: Layer.Layer<Rlm, never, RlmModel> = Layer.effect(
  Rlm,
  Effect.gen(function*() {
    const rlmModel = yield* RlmModel
    const config = yield* RlmConfig
    const sandboxConfig = yield* SandboxConfig
    const traceConfig = yield* RunTraceConfig

    // Shared dependencies (captured at layer-build time, not per-call)
    const sharedLayers = Layer.mergeAll(
      Layer.succeed(RlmModel, rlmModel),
      Layer.succeed(RlmConfig, config),
      Layer.succeed(SandboxConfig, sandboxConfig)
    )

    // Per-call layer constructor: fresh RlmRuntime + BridgeStore → BridgeHandler → SandboxFactory
    const makePerCallDeps = () => {
      const runtimeStoreLayer = makeRuntimeStoreLayer()
      const bridgeHandlerLayer = Layer.provide(
        BridgeHandlerLive,
        runtimeStoreLayer
      )
      const sandboxLayer = Layer.provide(
        SandboxBunLive,
        bridgeHandlerLayer
      )
      const tracingLayer = traceConfig.enabled
        ? Layer.provide(
            RunTraceWriterBun({
              baseDir: traceConfig.baseDir,
              maxSnapshotBytes: traceConfig.maxSnapshotBytes
            }),
            runtimeStoreLayer
          )
        : RunTraceWriterNoopLayer
      const llmCallLayer = Layer.provide(
        LlmCallLive,
        runtimeStoreLayer
      )

      const perCallLayer = Layer.fresh(
        Layer.provideMerge(
          Layer.mergeAll(
            runtimeStoreLayer,
            bridgeHandlerLayer,
            sandboxLayer,
            tracingLayer,
            llmCallLayer
          ),
          sharedLayers
        )
      )

      return perCallLayer
    }

    return makeRlmService(makePerCallDeps)
  })
)

export const stream = streamInternal
export const complete = completeInternal
export const completeWithOutcome = completeWithOutcomeInternal
