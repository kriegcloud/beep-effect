import { Context, Deferred, Effect, Layer, Option, PubSub, Queue, Ref } from "effect"
import type { CallContext } from "./CallContext"
import { RlmConfig } from "./RlmConfig"
import type { RlmError, SandboxError } from "./RlmError"
import {
  BudgetState,
  type BridgeRequestId,
  type CallId,
  type PartialResult,
  type RlmCommand,
  type RlmEvent
} from "./RlmTypes"

export interface SubcallCache {
  readonly inflight: Ref.Ref<Map<string, Deferred.Deferred<unknown, RlmError>>>
  readonly capacity: number
  readonly timeoutMs: number
}

export interface RlmRuntimeShape {
  readonly completionId: string
  readonly completionStartedAtMs: number
  readonly commandQueueCapacity: number
  readonly commands: Queue.Queue<RlmCommand>
  readonly events: PubSub.PubSub<RlmEvent>
  readonly budgetRef: Ref.Ref<BudgetState>
  readonly llmSemaphore: Effect.Semaphore
  readonly callStates: Ref.Ref<Map<CallId, CallContext>>
  readonly bridgePending: Ref.Ref<Map<BridgeRequestId, Deferred.Deferred<unknown, SandboxError>>>
  readonly partialOutcomesRef: Ref.Ref<Map<CallId, PartialResult>>
  readonly subcallCache: SubcallCache | null
}

export class RlmRuntime extends Context.Tag("@recursive-llm/RlmRuntime")<
  RlmRuntime,
  RlmRuntimeShape
>() {}

export const RlmRuntimeLive = Layer.scoped(
  RlmRuntime,
  Effect.gen(function*() {
    const config = yield* RlmConfig
    const commandQueueCapacity = Math.max(1, config.commandQueueCapacity ?? 8_192)

    const commands = yield* Effect.acquireRelease(
      Queue.bounded<RlmCommand>(commandQueueCapacity),
      (q) => Queue.shutdown(q)
    )
    const events = yield* Effect.acquireRelease(
      PubSub.bounded<RlmEvent>({ capacity: config.eventBufferCapacity, replay: 0 }),
      (ps) => PubSub.shutdown(ps)
    )

    const budgetRef = yield* Ref.make(new BudgetState({
      iterationsRemaining: config.maxIterations,
      llmCallsRemaining: config.maxLlmCalls,
      tokenBudgetRemaining: Option.fromNullable(config.maxTotalTokens),
      totalTokensUsed: 0
    }))

    const llmSemaphore = yield* Effect.makeSemaphore(config.concurrency)
    const callStates = yield* Ref.make(new Map<CallId, CallContext>())
    const bridgePending = yield* Ref.make(new Map<BridgeRequestId, Deferred.Deferred<unknown, SandboxError>>())
    const partialOutcomesRef = yield* Ref.make(new Map<CallId, PartialResult>())
    const cacheEnabled = config.cache?.enabled !== false
    const subcallCache: SubcallCache | null = cacheEnabled
      ? {
          inflight: yield* Ref.make(new Map<string, Deferred.Deferred<unknown, RlmError>>()),
          capacity: config.cache?.subcallCacheCapacity ?? 256,
          timeoutMs: config.bridgeTimeoutMs ?? 300_000
        }
      : null

    const completionId = `completion-${crypto.randomUUID()}`

    return {
      completionId,
      completionStartedAtMs: Date.now(),
      commandQueueCapacity,
      commands,
      events,
      budgetRef,
      llmSemaphore,
      callStates,
      bridgePending,
      partialOutcomesRef,
      subcallCache
    } satisfies RlmRuntimeShape
  })
)
