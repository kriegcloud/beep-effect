import { Context, Deferred, Effect, Layer, Ref } from "effect"
import { SandboxError } from "../RlmError"
import { RlmRuntime } from "../Runtime"
import type { BridgeRequestId } from "../RlmTypes"

const toSandboxError = (error: unknown): SandboxError =>
  error instanceof SandboxError
    ? error
    : new SandboxError({ message: String(error) })

const takeBridgeDeferred = (
  bridgePending: Ref.Ref<Map<BridgeRequestId, Deferred.Deferred<unknown, SandboxError>>>,
  bridgeRequestId: BridgeRequestId
) =>
  Ref.modify(bridgePending, (current) => {
    const deferred = current.get(bridgeRequestId)
    if (!deferred) {
      return [undefined, current] as const
    }

    const next = new Map(current)
    next.delete(bridgeRequestId)
    return [deferred, next] as const
  })

export class BridgeStore extends Context.Tag("@recursive-llm/scheduler/BridgeStore")<
  BridgeStore,
  {
    readonly register: (
      bridgeRequestId: BridgeRequestId,
      deferred: Deferred.Deferred<unknown, SandboxError>
    ) => Effect.Effect<void>
    readonly resolve: (bridgeRequestId: BridgeRequestId, value: unknown) => Effect.Effect<boolean>
    readonly fail: (bridgeRequestId: BridgeRequestId, error: unknown) => Effect.Effect<boolean>
    readonly remove: (bridgeRequestId: BridgeRequestId) => Effect.Effect<boolean>
    readonly failAll: (reason: string) => Effect.Effect<void>
  }
>() {}

export const BridgeStoreLive: Layer.Layer<BridgeStore, never, RlmRuntime> = Layer.effect(
  BridgeStore,
  Effect.gen(function*() {
    const runtime = yield* RlmRuntime

    return BridgeStore.of({
      register: (bridgeRequestId, deferred) =>
        Ref.update(runtime.bridgePending, (current) => new Map([...current, [bridgeRequestId, deferred]])),
      resolve: (bridgeRequestId, value) =>
        Effect.gen(function*() {
          const deferred = yield* takeBridgeDeferred(runtime.bridgePending, bridgeRequestId)
          if (!deferred) {
            return false
          }
          yield* Deferred.succeed(deferred, value)
          return true
        }),
      fail: (bridgeRequestId, error) =>
        Effect.gen(function*() {
          const deferred = yield* takeBridgeDeferred(runtime.bridgePending, bridgeRequestId)
          if (!deferred) {
            return false
          }
          yield* Deferred.fail(deferred, toSandboxError(error))
          return true
        }),
      remove: (bridgeRequestId) =>
        Ref.modify(runtime.bridgePending, (current) => {
          if (!current.has(bridgeRequestId)) {
            return [false, current] as const
          }
          const next = new Map(current)
          next.delete(bridgeRequestId)
          return [true, next] as const
        }),
      failAll: (reason) =>
        Effect.gen(function*() {
          const pending = yield* Ref.getAndSet(runtime.bridgePending, new Map())
          if (pending.size === 0) return

          const error = new SandboxError({ message: reason })
          yield* Effect.forEach([...pending.values()], (deferred) => Deferred.fail(deferred, error), {
            discard: true
          })
        })
    })
  })
)
