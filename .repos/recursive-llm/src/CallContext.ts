import { Deferred, Effect, Option, Ref, Scope } from "effect"
import type { SandboxInstance, VariableMetadata } from "./Sandbox"
import type { SubmitPayload } from "./SubmitTool"
import type { BridgeRequestId, CallId, MediaAttachment } from "./RlmTypes"
import { TranscriptEntry } from "./RlmTypes"
import type { RlmToolAny } from "./RlmTool"
import type { ContextMetadata } from "./ContextMetadata"
import type { ReplSystemPromptOptions } from "./SystemPrompt"
import type { RlmError } from "./RlmError"

export interface VariableSnapshot {
  readonly variables: ReadonlyArray<VariableMetadata>
  readonly snapshotIteration: number
  readonly syncedAtMs: number
}

export interface CallContext {
  readonly callId: CallId
  readonly depth: number
  readonly query: string
  readonly context: string
  readonly contextMetadata?: ContextMetadata
  readonly mediaAttachments?: ReadonlyArray<MediaAttachment>
  readonly callScope: Scope.CloseableScope
  readonly sandbox: SandboxInstance
  readonly parentBridgeRequestId?: BridgeRequestId
  readonly tools?: ReadonlyArray<RlmToolAny>
  readonly outputJsonSchema?: object
  readonly staticSystemPromptArgs: Omit<ReplSystemPromptOptions, "iteration" | "budget">
  readonly staticSystemPromptPrefix: string
  readonly cacheBinding?: {
    readonly key: string
    readonly deferred: Deferred.Deferred<unknown, RlmError>
  }

  readonly iteration: Ref.Ref<number>
  readonly transcript: Ref.Ref<ReadonlyArray<TranscriptEntry>>
  readonly variableSnapshot: Ref.Ref<VariableSnapshot>
  readonly consecutiveStalls: Ref.Ref<number>
  readonly codeExecuted: Ref.Ref<boolean>
  readonly pendingSubmit: Ref.Ref<Option.Option<{ payload: SubmitPayload; rawResponse: string }>>
}

export interface MakeCallContextOptions {
  readonly callId: CallId
  readonly depth: number
  readonly query: string
  readonly context: string
  readonly contextMetadata?: ContextMetadata
  readonly mediaAttachments?: ReadonlyArray<MediaAttachment>
  readonly callScope: Scope.CloseableScope
  readonly sandbox: SandboxInstance
  readonly parentBridgeRequestId?: BridgeRequestId
  readonly tools?: ReadonlyArray<RlmToolAny>
  readonly outputJsonSchema?: object
  readonly staticSystemPromptArgs: Omit<ReplSystemPromptOptions, "iteration" | "budget">
  readonly staticSystemPromptPrefix: string
  readonly cacheBinding?: {
    readonly key: string
    readonly deferred: Deferred.Deferred<unknown, RlmError>
  }
}

export const makeCallContext = (options: MakeCallContextOptions): Effect.Effect<CallContext> =>
  Effect.gen(function*() {
    const iteration = yield* Ref.make(0)
    const transcript = yield* Ref.make<ReadonlyArray<TranscriptEntry>>([])
    const variableSnapshot = yield* Ref.make<VariableSnapshot>({
      variables: [],
      snapshotIteration: 0,
      syncedAtMs: Date.now()
    })
    const consecutiveStalls = yield* Ref.make(0)
    const codeExecuted = yield* Ref.make(false)
    const pendingSubmit = yield* Ref.make<Option.Option<{ payload: SubmitPayload; rawResponse: string }>>(Option.none())

    return {
      ...options,
      iteration,
      transcript,
      variableSnapshot,
      consecutiveStalls,
      codeExecuted,
      pendingSubmit
    }
  })

export const readIteration = (ctx: CallContext): Effect.Effect<number> =>
  Ref.get(ctx.iteration)

export const incrementIteration = (ctx: CallContext): Effect.Effect<number> =>
  Ref.updateAndGet(ctx.iteration, (n) => n + 1)

export const readTranscript = (ctx: CallContext): Effect.Effect<ReadonlyArray<TranscriptEntry>> =>
  Ref.get(ctx.transcript)

export const readConsecutiveStalls = (ctx: CallContext): Effect.Effect<number> =>
  Ref.get(ctx.consecutiveStalls)

export const resetConsecutiveStalls = (ctx: CallContext): Effect.Effect<void> =>
  Ref.set(ctx.consecutiveStalls, 0)

export const incrementConsecutiveStalls = (ctx: CallContext): Effect.Effect<number> =>
  Ref.updateAndGet(ctx.consecutiveStalls, (n) => n + 1)

export const markCodeExecuted = (ctx: CallContext): Effect.Effect<void> =>
  Ref.set(ctx.codeExecuted, true)

export const hasCodeExecuted = (ctx: CallContext): Effect.Effect<boolean> =>
  Ref.get(ctx.codeExecuted)

export const appendTranscript = (
  ctx: CallContext,
  assistantResponse: string
): Effect.Effect<void> => {
  const trimmed = assistantResponse.trim()
  if (trimmed === "") return Effect.void
  return Ref.update(ctx.transcript, (entries) => [
    ...entries,
    new TranscriptEntry({ assistantResponse: trimmed })
  ])
}

export const attachExecutionOutput = (
  ctx: CallContext,
  output: string
): Effect.Effect<void> =>
  Ref.update(ctx.transcript, (entries) => {
    if (entries.length === 0) return entries
    const next = [...entries]
    const last = next[next.length - 1]!
    next[next.length - 1] = new TranscriptEntry({
      ...last,
      executionOutput: output
    })
    return next
  })

export const setPendingSubmit = (
  ctx: CallContext,
  payload: SubmitPayload,
  rawResponse: string
): Effect.Effect<void> =>
  Ref.set(ctx.pendingSubmit, Option.some({ payload, rawResponse }))

export const takePendingSubmit = (
  ctx: CallContext
): Effect.Effect<Option.Option<{ payload: SubmitPayload; rawResponse: string }>> =>
  Ref.getAndSet(ctx.pendingSubmit, Option.none())
