import { expect, mock, test } from "bun:test"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as TestClock from "effect/TestClock"
import { runEffect } from "./effect-test.js"
import type { AgentRuntimeSettings } from "../src/AgentRuntimeConfig.js"
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

test("AgentRuntime interrupts queries on timeout", async () => {
  let interruptCalls = 0
  sdkQueryHandler = () =>
    makeSdkQuery({
      interrupt: async () => {
        interruptCalls += 1
      }
    })

  const { AgentRuntime } = await import("../src/AgentRuntime.js")
  const { AgentRuntimeConfig } = await import("../src/AgentRuntimeConfig.js")
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")
  const { QuerySupervisor } = await import("../src/QuerySupervisor.js")
  const { QuerySupervisorConfig } = await import("../src/QuerySupervisorConfig.js")

  const supervisorSettings: QuerySupervisorSettings = {
    concurrencyLimit: 1,
    pendingQueueCapacity: 4,
    pendingQueueStrategy: "suspend",
    maxPendingTime: undefined,
    emitEvents: false,
    eventBufferCapacity: 16,
    eventBufferStrategy: "sliding",
    metricsEnabled: false,
    tracingEnabled: false
  }

  const runtimeSettings: AgentRuntimeSettings = {
    defaultOptions: {},
    queryTimeout: Duration.seconds(2),
    firstMessageTimeout: Duration.seconds(1),
    retryMaxRetries: 0,
    retryBaseDelay: Duration.seconds(1)
  }

  const supervisorLayer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: supervisorSettings })
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

  const runtimeLayer = AgentRuntime.layer.pipe(
    Layer.provide(
      Layer.succeed(AgentRuntimeConfig, AgentRuntimeConfig.make({ settings: runtimeSettings }))
    ),
    Layer.provide(supervisorLayer)
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const runtime = yield* AgentRuntime
      yield* runtime.query("timeout-test")

      yield* TestClock.adjust("3 seconds")
      yield* Effect.yieldNow()

      expect(interruptCalls).toBeGreaterThan(0)
    }).pipe(Effect.provide(runtimeLayer))
  )

  await runEffect(program)
})
