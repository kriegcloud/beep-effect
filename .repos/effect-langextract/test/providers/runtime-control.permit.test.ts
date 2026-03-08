import * as NativeLanguageModel from "@effect/ai/LanguageModel"
import { describe, expect, it } from "@effect/vitest"
import { Chunk, Effect, Fiber, Ref, Stream } from "effect"

import {
  makePrimedCacheLayer,
  makeRuntimeControlPermitLayer,
  PrimedCache,
  RuntimeControl} from "../../src/index.js"
import { makeProviderLanguageModelService } from "../../src/providers/AiAdapters.js"

const makeConcurrencyTrackedNativeModel = (
  current: Ref.Ref<number>,
  max: Ref.Ref<number>,
  options?: {
    readonly failGenerateObject?: boolean
  }
): NativeLanguageModel.Service =>
  ({
    generateText: ({ prompt }) =>
      Effect.acquireUseRelease(
        Ref.updateAndGet(current, (value) => value + 1),
        () =>
          Effect.gen(function* () {
            const active = yield* Ref.get(current)
            yield* Ref.update(max, (value) => Math.max(value, active))
            yield* Effect.sleep("5 millis")
            return {
              text:
                prompt === "json-object"
                  ? JSON.stringify({ ok: true })
                  : String(prompt ?? "")
            } as any
          }),
        () => Ref.update(current, (value) => value - 1)
      ),
    generateObject: ({ prompt }) =>
      options?.failGenerateObject === true
        ? Effect.fail(new Error("generateObject failed"))
        : Effect.acquireUseRelease(
            Ref.updateAndGet(current, (value) => value + 1),
            () =>
              Effect.gen(function* () {
                const active = yield* Ref.get(current)
                yield* Ref.update(max, (value) => Math.max(value, active))
                yield* Effect.sleep("5 millis")
                return {
                  value: { prompt: String(prompt ?? "") }
                } as any
              }),
            () => Ref.update(current, (value) => value - 1)
          ),
    streamText: ({ prompt }) =>
      Stream.fromIterable([
        {
          type: "text-delta",
          id: "stream-1",
          delta: String(prompt ?? ""),
          metadata: {}
        } as any
      ])
  }) as NativeLanguageModel.Service

const makeInterruptibleNativeModel = (
  current: Ref.Ref<number>,
  max: Ref.Ref<number>
): NativeLanguageModel.Service =>
  ({
    generateText: ({ prompt }) =>
      Effect.acquireUseRelease(
        Ref.updateAndGet(current, (value) => value + 1),
        () =>
          Effect.gen(function* () {
            const active = yield* Ref.get(current)
            yield* Ref.update(max, (value) => Math.max(value, active))
            if (prompt === "slow") {
              yield* Effect.sleep("100 millis")
            }
            return { text: String(prompt ?? "") } as any
          }),
        () => Ref.update(current, (value) => value - 1)
      ),
    generateObject: ({ prompt }) =>
      Effect.succeed({
        value: { prompt: String(prompt ?? "") }
      } as any),
    streamText: ({ prompt }) =>
      Stream.fromIterable([
        {
          type: "text-delta",
          id: "stream-1",
          delta: String(prompt ?? ""),
          metadata: {}
        } as any
      ])
  }) as NativeLanguageModel.Service

const makeRuntimeControl = (maxConcurrency: number): Effect.Effect<RuntimeControl> =>
  Effect.gen(function* () {
    const semaphore = yield* Effect.makeSemaphore(maxConcurrency)
    return RuntimeControl.make({
      withProviderPermit: (_provider, effect) => semaphore.withPermits(1)(effect)
    })
  })

const makeCacheWithCounters = (): Effect.Effect<{
  readonly cache: PrimedCache
  readonly getCalls: Ref.Ref<number>
  readonly putCalls: Ref.Ref<number>
}> =>
  Effect.gen(function* () {
    const getCalls = yield* Ref.make(0)
    const putCalls = yield* Ref.make(0)
    return {
      cache: PrimedCache.make({
        get: () =>
          Ref.update(getCalls, (value) => value + 1).pipe(Effect.as(undefined)),
        put: () => Ref.update(putCalls, (value) => value + 1).pipe(Effect.asVoid),
        invalidate: () => Effect.void,
        clearNamespace: () => Effect.void
      }),
      getCalls,
      putCalls
    } as const
  })

describe("RuntimeControl permit integration", () => {
  it.live("applies provider permits around concurrent infer calls", () =>
    Effect.gen(function* () {
      const cache = yield* PrimedCache
      const current = yield* Ref.make(0)
      const max = yield* Ref.make(0)
      const runtimeControl = yield* makeRuntimeControl(1)

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl,
        nativeModel: makeConcurrencyTrackedNativeModel(current, max),
        defaultProviderConcurrency: 4
      })

      const result = yield* service.infer(["a", "b", "c", "d"], {
        providerConcurrency: 4
      })

      const observedMax = yield* Ref.get(max)
      expect(result.length).toBe(4)
      expect(observedMax).toBe(1)
    }).pipe(
      Effect.provide(
        makePrimedCacheLayer({
          enableRequestStore: true,
          enableSessionStore: false
        })
      )
    )
  )

  it.live("applies permits on native generateObject path", () =>
    Effect.gen(function* () {
      const cache = yield* PrimedCache
      const current = yield* Ref.make(0)
      const max = yield* Ref.make(0)
      const runtimeControl = yield* makeRuntimeControl(1)

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl,
        nativeModel: makeConcurrencyTrackedNativeModel(current, max),
        defaultProviderConcurrency: 4
      })

      const objects = yield* Effect.forEach(
        ["a", "b", "c", "d"],
        (prompt) => service.generateObject(prompt),
        { concurrency: 4 }
      )

      const observedMax = yield* Ref.get(max)
      expect(objects.length).toBe(4)
      expect(observedMax).toBe(1)
    }).pipe(
      Effect.provide(
        makePrimedCacheLayer({
          enableRequestStore: true,
          enableSessionStore: false
        })
      )
    )
  )

  it.live("releases permit when generateObject falls back to cached text path", () =>
    Effect.gen(function* () {
      const cache = yield* PrimedCache
      const current = yield* Ref.make(0)
      const max = yield* Ref.make(0)
      const runtimeControl = yield* makeRuntimeControl(1)

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl,
        nativeModel: makeConcurrencyTrackedNativeModel(current, max, {
          failGenerateObject: true
        }),
        defaultProviderConcurrency: 2
      })

      const value = yield* service.generateObject("json-object")

      expect(value).toEqual({ ok: true })
      expect(yield* Ref.get(max)).toBe(1)
    }).pipe(
      Effect.provide(
        makePrimedCacheLayer({
          enableRequestStore: true,
          enableSessionStore: false
        })
      )
    )
  )

  it.live("releases permit callback when an in-flight infer is interrupted", () =>
    Effect.gen(function* () {
      const cache = yield* PrimedCache
      const current = yield* Ref.make(0)
      const max = yield* Ref.make(0)
      const acquired = yield* Ref.make(0)
      const released = yield* Ref.make(0)
      const runtimeControl = RuntimeControl.make({
        withProviderPermit: (_provider, effect) =>
          Effect.acquireUseRelease(
            Ref.update(acquired, (value) => value + 1),
            () => effect,
            () => Ref.update(released, (value) => value + 1)
          )
      })

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl,
        nativeModel: makeInterruptibleNativeModel(current, max),
        defaultProviderConcurrency: 1
      })

      const slowFiber = yield* service
        .infer(["slow"], { providerConcurrency: 1 })
        .pipe(Effect.fork)
      yield* Effect.sleep("5 millis")
      yield* Fiber.interrupt(slowFiber)

      expect(yield* Ref.get(acquired)).toBe(1)
      expect(yield* Ref.get(released)).toBe(1)
      expect(yield* Ref.get(max)).toBeGreaterThan(0)
    }).pipe(
      Effect.provide(
        makePrimedCacheLayer({
          enableRequestStore: true,
          enableSessionStore: false
        })
      )
    )
  )

  it.live("streamText emits native text-delta chunks without cache lookups", () =>
    Effect.gen(function* () {
      const { cache, getCalls, putCalls } = yield* makeCacheWithCounters()
      const generateTextCalls = yield* Ref.make(0)
      const runtimeControl = RuntimeControl.make({
        withProviderPermit: (_provider, effect) => effect
      })

      const nativeModel = {
        generateText: ({ prompt }: { readonly prompt?: string }) =>
          Ref.update(generateTextCalls, (value) => value + 1).pipe(
            Effect.as({ text: String(prompt ?? "") })
          ),
        generateObject: ({ prompt }: { readonly prompt?: string }) =>
          Effect.succeed({
            value: { prompt: String(prompt ?? "") }
          }),
        streamText: () =>
          Stream.fromIterable([
            {
              type: "text-start",
              id: "stream-1",
              metadata: {}
            },
            {
              type: "text-delta",
              id: "stream-1",
              delta: "hello ",
              metadata: {}
            },
            {
              type: "text-delta",
              id: "stream-1",
              delta: "world",
              metadata: {}
            },
            {
              type: "text-end",
              id: "stream-1",
              metadata: {}
            }
          ] as ReadonlyArray<unknown>)
      } as NativeLanguageModel.Service

      const service = makeProviderLanguageModelService({
        provider: "test-provider",
        modelId: "test-model",
        cache,
        runtimeControl,
        nativeModel,
        defaultProviderConcurrency: 1
      })

      const chunk = yield* service.streamText("ignored").pipe(Stream.runCollect)
      const values = Chunk.toReadonlyArray(chunk)

      expect(values).toEqual(["hello ", "world"])
      expect(yield* Ref.get(generateTextCalls)).toBe(0)
      expect(yield* Ref.get(getCalls)).toBe(0)
      expect(yield* Ref.get(putCalls)).toBe(0)
    })
  )

  it.live("permit layer enforces shared provider cap under contention", () =>
    Effect.gen(function* () {
      const runtimeControl = yield* RuntimeControl
      const current = yield* Ref.make(0)
      const max = yield* Ref.make(0)

      const run = (provider: string, duration: "5 millis" | "20 millis") =>
        runtimeControl.withProviderPermit(
          provider,
          Effect.acquireUseRelease(
            Ref.updateAndGet(current, (value) => value + 1),
            () =>
              Effect.gen(function* () {
                const active = yield* Ref.get(current)
                yield* Ref.update(max, (value) => Math.max(value, active))
                yield* Effect.sleep(duration)
              }),
            () => Ref.update(current, (value) => value - 1)
          )
        )

      yield* Effect.forEach(
        [
          ["alpha", "20 millis"],
          ["alpha", "5 millis"],
          ["beta", "5 millis"],
          ["beta", "5 millis"]
        ] as const,
        ([provider, duration]) => run(provider, duration),
        { concurrency: 4, discard: true }
      )

      expect(yield* Ref.get(max)).toBeLessThanOrEqual(2)
    }).pipe(Effect.provide(makeRuntimeControlPermitLayer(2)))
  )
})
