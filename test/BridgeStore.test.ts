import { describe, expect, test } from "bun:test"
import { Deferred, Effect, Layer, Ref } from "effect"
import { SandboxError } from "../src/RlmError"
import { RlmRuntime, RlmRuntimeLive } from "../src/Runtime"
import { BridgeRequestId } from "../src/RlmTypes"
import { BridgeStore, BridgeStoreLive } from "../src/scheduler/BridgeStore"

const makeLayer = () =>
  (() => {
    const runtimeLayer = RlmRuntimeLive
    return Layer.fresh(
      Layer.merge(
        runtimeLayer,
        Layer.provide(BridgeStoreLive, runtimeLayer)
      )
    )
  })()

describe("BridgeStore", () => {
  test("register + resolve returns awaited value and clears pending map", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const bridgeStore = yield* BridgeStore
        const runtime = yield* RlmRuntime
        const bridgeRequestId = BridgeRequestId("bridge-resolve")
        const deferred = yield* Deferred.make<unknown, SandboxError>()

        yield* bridgeStore.register(bridgeRequestId, deferred)
        const awaitFiber = yield* Effect.fork(Deferred.await(deferred))
        yield* bridgeStore.resolve(bridgeRequestId, { ok: true })
        const awaited = yield* awaitFiber.await
        const pendingAfter = yield* Ref.get(runtime.bridgePending)

        return { awaited, pendingAfterSize: pendingAfter.size }
      }).pipe(Effect.provide(makeLayer()))
    )

    expect(result.awaited._tag).toBe("Success")
    if (result.awaited._tag === "Success") {
      expect(result.awaited.value).toEqual({ ok: true })
    }
    expect(result.pendingAfterSize).toBe(0)
  })

  test("register + fail propagates SandboxError and clears pending map", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const bridgeStore = yield* BridgeStore
        const runtime = yield* RlmRuntime
        const bridgeRequestId = BridgeRequestId("bridge-fail")
        const deferred = yield* Deferred.make<unknown, SandboxError>()

        yield* bridgeStore.register(bridgeRequestId, deferred)
        const awaited = yield* Deferred.await(deferred).pipe(Effect.either, Effect.fork)
        yield* bridgeStore.fail(bridgeRequestId, "failure")
        const resolved = yield* awaited.await
        const pendingAfter = yield* Ref.get(runtime.bridgePending)

        return { resolved, pendingAfterSize: pendingAfter.size }
      }).pipe(Effect.provide(makeLayer()))
    )

    expect(result.resolved._tag).toBe("Success")
    if (result.resolved._tag === "Success") {
      expect(result.resolved.value._tag).toBe("Left")
      if (result.resolved.value._tag === "Left") {
        expect(result.resolved.value.left).toBeInstanceOf(SandboxError)
      }
    }
    expect(result.pendingAfterSize).toBe(0)
  })

  test("failAll fails all pending bridge deferreds", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const bridgeStore = yield* BridgeStore
        const runtime = yield* RlmRuntime
        const firstId = BridgeRequestId("bridge-failall-1")
        const secondId = BridgeRequestId("bridge-failall-2")
        const first = yield* Deferred.make<unknown, SandboxError>()
        const second = yield* Deferred.make<unknown, SandboxError>()

        yield* bridgeStore.register(firstId, first)
        yield* bridgeStore.register(secondId, second)

        const firstAwait = yield* Deferred.await(first).pipe(Effect.either, Effect.fork)
        const secondAwait = yield* Deferred.await(second).pipe(Effect.either, Effect.fork)
        yield* bridgeStore.failAll("shutdown")

        const firstResult = yield* firstAwait.await
        const secondResult = yield* secondAwait.await
        const pendingAfter = yield* Ref.get(runtime.bridgePending)
        return { firstResult, secondResult, pendingAfterSize: pendingAfter.size }
      }).pipe(Effect.provide(makeLayer()))
    )

    expect(result.firstResult._tag).toBe("Success")
    if (result.firstResult._tag === "Success") {
      expect(result.firstResult.value._tag).toBe("Left")
    }
    expect(result.secondResult._tag).toBe("Success")
    if (result.secondResult._tag === "Success") {
      expect(result.secondResult.value._tag).toBe("Left")
    }
    expect(result.pendingAfterSize).toBe(0)
  })
})
