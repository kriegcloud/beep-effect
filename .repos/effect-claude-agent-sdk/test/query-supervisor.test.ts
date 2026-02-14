import { expect, mock, test } from "bun:test"
import * as Deferred from "effect/Deferred"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Exit from "effect/Exit"
import * as Fiber from "effect/Fiber"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Scope from "effect/Scope"
import * as TestClock from "effect/TestClock"
import * as Stream from "effect/Stream"
import { runEffect } from "./effect-test.js"
import type { QuerySupervisorSettings } from "../src/QuerySupervisorConfig.js"

let sdkQueryHandler: ((prompt: unknown) => unknown) | undefined

const makeSdkQuery = (options?: { readonly interrupt?: () => Promise<void> }) => {
  async function* generator() {
    return
  }

  const iterator = generator()
  return Object.assign(iterator, {
    interrupt: options?.interrupt ?? (async () => {}),
    setPermissionMode: async () => {},
    setModel: async () => {},
    setMaxThinkingTokens: async () => {},
    rewindFiles: async () => ({ canRewind: false }),
    supportedCommands: async () => [],
    supportedModels: async () => [],
    mcpServerStatus: async () => [],
    setMcpServers: async () => ({ added: [], removed: [], errors: {} }),
    accountInfo: async () => ({})
  })
}

mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  query: ({ prompt }: { prompt: unknown }) =>
    sdkQueryHandler ? sdkQueryHandler(prompt) : makeSdkQuery(),
  createSdkMcpServer: (_options: unknown) => ({})
}))

const baseSettings: QuerySupervisorSettings = {
  concurrencyLimit: 1,
  pendingQueueCapacity: 8,
  pendingQueueStrategy: "suspend",
  maxPendingTime: undefined,
  emitEvents: false,
  eventBufferCapacity: 16,
  eventBufferStrategy: "sliding",
  metricsEnabled: false,
  tracingEnabled: false
}

test("QuerySupervisor enforces concurrency limits", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")
  const { QuerySupervisor } = await import("../src/QuerySupervisor.js")
  const { QuerySupervisorConfig } = await import("../src/QuerySupervisorConfig.js")

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(
      AgentSdk.layer.pipe(
        Layer.provide(
          Layer.succeed(
            AgentSdkConfig,
            AgentSdkConfig.make({
              options: {},
              sandboxProvider: Option.some("local"),
              sandboxId: Option.none(),
              sandboxSleepAfter: Option.none(),
              storageBackend: Option.some("bun"),
              storageMode: Option.some("standard"),
              r2BucketBinding: Option.some("BUCKET"),
              kvNamespaceBinding: Option.some("KV")
            })
          )
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const firstRelease = yield* Deferred.make<void>()
      const firstStarted = yield* Deferred.make<void>()
      const secondStarted = yield* Deferred.make<void>()

      const firstFiber = yield* Effect.fork(
        Effect.scoped(
          Effect.gen(function*() {
            yield* supervisor.submit("first")
            yield* Deferred.succeed(firstStarted, undefined)
            yield* Deferred.await(firstRelease)
          })
        )
      )

      yield* Deferred.await(firstStarted)

      const stats = yield* supervisor.stats
      expect(stats.active).toBe(1)

      const secondFiber = yield* Effect.fork(
        Effect.scoped(
          Effect.gen(function*() {
            yield* supervisor.submit("second")
            yield* Deferred.succeed(secondStarted, undefined)
          })
        )
      )

      yield* Effect.yieldNow()
      const startedEarly = yield* Deferred.isDone(secondStarted)
      expect(startedEarly).toBe(false)

      yield* Deferred.succeed(firstRelease, undefined)
      yield* Deferred.await(secondStarted)

      yield* Fiber.join(firstFiber)
      yield* Fiber.join(secondFiber)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor times out pending submissions", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")
  const { QuerySupervisor } = await import("../src/QuerySupervisor.js")
  const { QuerySupervisorConfig } = await import("../src/QuerySupervisorConfig.js")

  const settings: QuerySupervisorSettings = {
    ...baseSettings,
    maxPendingTime: Duration.seconds(1)
  }

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(QuerySupervisorConfig, QuerySupervisorConfig.make({ settings }))
    ),
    Layer.provide(
      AgentSdk.layer.pipe(
        Layer.provide(
          Layer.succeed(
            AgentSdkConfig,
            AgentSdkConfig.make({
              options: {},
              sandboxProvider: Option.some("local"),
              sandboxId: Option.none(),
              sandboxSleepAfter: Option.none(),
              storageBackend: Option.some("bun"),
              storageMode: Option.some("standard"),
              r2BucketBinding: Option.some("BUCKET"),
              kvNamespaceBinding: Option.some("KV")
            })
          )
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const block = yield* Deferred.make<void>()
      const started = yield* Deferred.make<void>()

      const firstFiber = yield* Effect.fork(
        Effect.scoped(
          Effect.gen(function*() {
            yield* supervisor.submit("first")
            yield* Deferred.succeed(started, undefined)
            yield* Deferred.await(block)
          })
        )
      )

      yield* Deferred.await(started)

      const secondFiber = yield* Effect.fork(
        Effect.either(supervisor.submit("second"))
      )

      yield* TestClock.adjust("2 seconds")

      const result = yield* Fiber.join(secondFiber)
      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("QueryPendingTimeoutError")
      }

      yield* Deferred.succeed(block, undefined)
      yield* Fiber.join(firstFiber)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor fails pending work when scope closes", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")
  const { QuerySupervisor } = await import("../src/QuerySupervisor.js")
  const { QuerySupervisorConfig } = await import("../src/QuerySupervisorConfig.js")

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(
      AgentSdk.layer.pipe(
        Layer.provide(
          Layer.succeed(
            AgentSdkConfig,
            AgentSdkConfig.make({
              options: {},
              sandboxProvider: Option.some("local"),
              sandboxId: Option.none(),
              sandboxSleepAfter: Option.none(),
              storageBackend: Option.some("bun"),
              storageMode: Option.some("standard"),
              r2BucketBinding: Option.some("BUCKET"),
              kvNamespaceBinding: Option.some("KV")
            })
          )
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const block = yield* Deferred.make<void>()
      const started = yield* Deferred.make<void>()

      const firstFiber = yield* Effect.fork(
        Effect.scoped(
          Effect.gen(function*() {
            yield* supervisor.submit("first")
            yield* Deferred.succeed(started, undefined)
            yield* Deferred.await(block)
          })
        )
      )

      yield* Deferred.await(started)

      const pendingScope = yield* Scope.make()
      const submitFiber = yield* Effect.fork(
        Effect.either(
          supervisor.submit("second").pipe(Scope.extend(pendingScope))
        )
      )

      yield* Effect.yieldNow()
      yield* Scope.close(pendingScope, Exit.void)

      const result = yield* Fiber.join(submitFiber)
      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("QueryPendingCanceledError")
      }

      yield* Deferred.succeed(block, undefined)
      yield* Fiber.join(firstFiber)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor drops when queue is full", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")
  const { QuerySupervisor } = await import("../src/QuerySupervisor.js")
  const { QuerySupervisorConfig } = await import("../src/QuerySupervisorConfig.js")

  const settings: QuerySupervisorSettings = {
    ...baseSettings,
    pendingQueueCapacity: 1,
    pendingQueueStrategy: "dropping"
  }

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(QuerySupervisorConfig, QuerySupervisorConfig.make({ settings }))
    ),
    Layer.provide(
      AgentSdk.layer.pipe(
        Layer.provide(
          Layer.succeed(
            AgentSdkConfig,
            AgentSdkConfig.make({
              options: {},
              sandboxProvider: Option.some("local"),
              sandboxId: Option.none(),
              sandboxSleepAfter: Option.none(),
              storageBackend: Option.some("bun"),
              storageMode: Option.some("standard"),
              r2BucketBinding: Option.some("BUCKET"),
              kvNamespaceBinding: Option.some("KV")
            })
          )
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const block = yield* Deferred.make<void>()
      const started = yield* Deferred.make<void>()

      const firstFiber = yield* Effect.fork(
        Effect.scoped(
          Effect.gen(function*() {
            yield* supervisor.submit("first")
            yield* Deferred.succeed(started, undefined)
            yield* Deferred.await(block)
          })
        )
      )

      yield* Deferred.await(started)

      const secondFiber = yield* Effect.fork(
        Effect.scoped(supervisor.submit("second").pipe(Effect.asVoid))
      )

      yield* Effect.yieldNow()

      const thirdFiber = yield* Effect.fork(
        supervisor.submit("third").pipe(
          Effect.either,
          Effect.timeoutOption("50 millis")
        )
      )
      const fourthFiber = yield* Effect.fork(
        supervisor.submit("fourth").pipe(
          Effect.either,
          Effect.timeoutOption("50 millis")
        )
      )

      yield* TestClock.adjust("50 millis")

      const thirdResult = yield* Fiber.join(thirdFiber)
      const fourthResult = yield* Fiber.join(fourthFiber)
      const dropped = [thirdResult, fourthResult].filter((result) =>
        Option.isSome(result) &&
          Either.isLeft(result.value) &&
          result.value.left._tag === "QueryQueueFullError"
      )
      expect(dropped.length).toBeGreaterThanOrEqual(1)

      yield* Deferred.succeed(block, undefined)
      yield* Fiber.join(firstFiber)
      yield* Fiber.join(secondFiber)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor publishes lifecycle events", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")
  const { QuerySupervisor } = await import("../src/QuerySupervisor.js")
  const { QuerySupervisorConfig } = await import("../src/QuerySupervisorConfig.js")

  const settings: QuerySupervisorSettings = {
    ...baseSettings,
    emitEvents: true,
    pendingQueueCapacity: 4,
    eventBufferCapacity: 16
  }

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(QuerySupervisorConfig, QuerySupervisorConfig.make({ settings }))
    ),
    Layer.provide(
      AgentSdk.layer.pipe(
        Layer.provide(
          Layer.succeed(
            AgentSdkConfig,
            AgentSdkConfig.make({
              options: {},
              sandboxProvider: Option.some("local"),
              sandboxId: Option.none(),
              sandboxSleepAfter: Option.none(),
              storageBackend: Option.some("bun"),
              storageMode: Option.some("standard"),
              r2BucketBinding: Option.some("BUCKET"),
              kvNamespaceBinding: Option.some("KV")
            })
          )
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor

      const eventsFiber = yield* Effect.fork(
        Stream.runCollect(
          supervisor.events.pipe(
            Stream.filter((event) =>
              event._tag === "QueryStarted" || event._tag === "QueryCompleted"
            ),
            Stream.take(2)
          )
        )
      )
      yield* Effect.yieldNow()

      yield* Effect.scoped(
        supervisor.submit("event-test").pipe(Effect.asVoid)
      )

      const events = yield* Fiber.join(eventsFiber)
      const tags = Array.from(events).map((event) => event._tag)
      expect(tags).toContain("QueryStarted")
      expect(tags).toContain("QueryCompleted")
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})
