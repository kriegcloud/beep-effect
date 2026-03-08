import { Clock, Context, Deferred, Duration, Effect, Layer, Option, Ref } from "effect"
import { SandboxError } from "./RlmError"
import { RlmConfig } from "./RlmConfig"
import { RlmRuntime } from "./Runtime"
import { BridgeRequestId, RlmCommand, type CallId } from "./RlmTypes"
import { BridgeStore } from "./scheduler/BridgeStore"
import { enqueue } from "./scheduler/Queue"

export class BridgeHandler extends Context.Tag("@recursive-llm/BridgeHandler")<
  BridgeHandler,
  {
    readonly handle: (options: {
      readonly method: string
      readonly args: ReadonlyArray<unknown>
      readonly callerCallId: CallId
    }) => Effect.Effect<unknown, SandboxError>
  }
>() {}

export const BridgeHandlerLive: Layer.Layer<BridgeHandler, never, RlmRuntime | BridgeStore | RlmConfig> = Layer.effect(
  BridgeHandler,
  Effect.gen(function*() {
    const runtime = yield* RlmRuntime
    const bridgeStore = yield* BridgeStore
    const config = yield* RlmConfig

    return BridgeHandler.of({
      handle: ({ method, args, callerCallId }) => {
        if (method === "budget") {
          return Effect.gen(function*() {
            const budget = yield* Ref.get(runtime.budgetRef)
            const now = yield* Clock.currentTimeMillis
            return {
              iterationsRemaining: budget.iterationsRemaining,
              llmCallsRemaining: budget.llmCallsRemaining,
              tokenBudgetRemaining: Option.isSome(budget.tokenBudgetRemaining)
                ? budget.tokenBudgetRemaining.value
                : null,
              totalTokensUsed: budget.totalTokensUsed,
              elapsedMs: now - runtime.completionStartedAtMs,
              maxTimeMs: config.maxTimeMs ?? null
            }
          })
        }

        const bridgeRequestId = BridgeRequestId(crypto.randomUUID())

        return Effect.gen(function*() {
          const deferred = yield* Deferred.make<unknown, SandboxError>()
          yield* bridgeStore.register(bridgeRequestId, deferred)

          // Route through scheduler for budget enforcement.
          yield* enqueue(RlmCommand.HandleBridgeCall({
            callId: callerCallId,
            bridgeRequestId,
            method,
            args
          })).pipe(
            Effect.provideService(RlmRuntime, runtime),
            Effect.catchTag("SchedulerQueueError", (schedulerError) => {
              const message = schedulerError.reason === "overloaded"
                ? "Scheduler queue overloaded"
                : "Scheduler queue closed"
              return bridgeStore.fail(bridgeRequestId, new SandboxError({ message })).pipe(
                Effect.zipRight(Effect.fail(new SandboxError({ message })))
              )
            })
          )

          return yield* Deferred.await(deferred).pipe(
            Effect.timeoutFail({
              duration: Duration.millis(config.bridgeTimeoutMs ?? 300_000),
              onTimeout: () => new SandboxError({
                message: `Bridge call ${method}(${bridgeRequestId}) timed out after ${config.bridgeTimeoutMs ?? 300_000}ms`
              })
            })
          )
        }).pipe(
          Effect.ensuring(bridgeStore.remove(bridgeRequestId).pipe(Effect.ignore))
        )
      }
    })
  })
)
