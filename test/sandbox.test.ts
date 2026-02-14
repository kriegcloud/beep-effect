import { expect, test } from "bun:test"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Fiber from "effect/Fiber"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import type { AgentSdk } from "../src/AgentSdk.js"
import { QuerySupervisor } from "../src/QuerySupervisor.js"
import { QuerySupervisorConfig, type QuerySupervisorSettings } from "../src/QuerySupervisorConfig.js"
import type { QueryHandle } from "../src/Query.js"
import type { SDKMessage, SDKUserMessage } from "../src/Schema/Message.js"
import type { Options } from "../src/Schema/Options.js"
import { SandboxService } from "../src/Sandbox/SandboxService.js"
import { runEffect } from "./effect-test.js"

const baseSettings: QuerySupervisorSettings = {
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

const makeHandle = (options?: {
  readonly interrupt?: Effect.Effect<void>
}): QueryHandle => {
  const stream = Stream.empty as Stream.Stream<SDKMessage>
  return {
    stream,
    send: () => Effect.void,
    sendAll: () => Effect.void,
    sendForked: () => Effect.void,
    closeInput: Effect.void,
    share: (config) => Stream.share(stream, config ?? { capacity: 16, strategy: "suspend" }),
    broadcast: (n, maximumLag) => Stream.broadcast(stream, n, maximumLag ?? 16),
    interrupt: options?.interrupt ?? Effect.void,
    setPermissionMode: () => Effect.void,
    setModel: () => Effect.void,
    setMaxThinkingTokens: () => Effect.void,
    rewindFiles: () => Effect.succeed({ canRewind: false }),
    supportedCommands: Effect.succeed([]),
    supportedModels: Effect.succeed([]),
    mcpServerStatus: Effect.succeed([]),
    setMcpServers: () => Effect.succeed({ added: [], removed: [], errors: {} }),
    accountInfo: Effect.succeed({} as never)
  }
}

test("QuerySupervisor routes isolated queries through SandboxService and strips non-serializable options", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  let sdkQueryCalled = false
  let capturedPrompt: string | undefined
  let capturedOptions: Options | undefined

  const sdk = AgentSdk.make({
    query: () => {
      sdkQueryCalled = true
      return Effect.succeed(makeHandle())
    },
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: (prompt, options) =>
      Effect.sync(() => {
        capturedPrompt = prompt
        capturedOptions = options
        return makeHandle()
      }),
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const options = {
        model: "sonnet",
        maxTurns: 3,
        hooks: { PreToolUse: [] } as never,
        canUseTool: (() => true) as never,
        stderr: (() => undefined) as never,
        spawnClaudeCodeProcess: (() => Promise.resolve({} as never)) as never,
        abortController: new AbortController()
      } as Options

      yield* supervisor.submit("sandbox prompt", options)

      expect(sdkQueryCalled).toBe(false)
      expect(capturedPrompt).toBe("sandbox prompt")
      expect(capturedOptions?.model).toBe("sonnet")
      expect(capturedOptions?.maxTurns).toBe(3)
      expect(capturedOptions?.hooks).toBeUndefined()
      expect(capturedOptions?.canUseTool).toBeUndefined()
      expect(capturedOptions?.stderr).toBeUndefined()
      expect(capturedOptions?.spawnClaudeCodeProcess).toBeUndefined()
      expect(capturedOptions?.abortController).toBeUndefined()
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor applies stripped SessionEnd hooks to sandbox streams", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  let capturedOptions: Options | undefined
  let hookCallCount = 0
  let hookSessionId: string | undefined

  const sdk = AgentSdk.make({
    query: () => Effect.succeed(makeHandle()),
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: (_prompt, options) =>
      Effect.sync(() => {
        capturedOptions = options
        return {
          ...makeHandle(),
          stream: Stream.make({
            type: "result",
            subtype: "success",
            duration_ms: 1,
            duration_api_ms: 1,
            is_error: false,
            num_turns: 1,
            result: "ok",
            total_cost_usd: 0,
            usage: {},
            modelUsage: {},
            permission_denials: [],
            uuid: "result-uuid",
            session_id: "session-hooks"
          } as SDKMessage)
        } satisfies QueryHandle
      }),
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const options = {
        hooks: {
          SessionEnd: [
            {
              hooks: [
                async (input) => {
                  hookCallCount += 1
                  hookSessionId = input.session_id
                  return {}
                }
              ]
            }
          ]
        }
      } as Options

      const handle = yield* supervisor.submit("hooked", options)
      yield* Stream.runDrain(handle.stream)

      expect(capturedOptions?.hooks).toBeUndefined()
      expect(hookCallCount).toBe(1)
      expect(hookSessionId).toBe("session-hooks")
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor replays PostToolUse hooks from sandbox tool messages", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  const sdk = AgentSdk.make({
    query: () => Effect.succeed(makeHandle()),
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  let calls = 0
  let toolName: string | undefined
  let toolUseId: string | undefined
  let responseValue: unknown

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: () =>
      Effect.succeed({
        ...makeHandle(),
        stream: Stream.make(
          {
            type: "tool_progress",
            tool_use_id: "tool-1",
            tool_name: "bash",
            parent_tool_use_id: null,
            elapsed_time_seconds: 0.1,
            uuid: "tool-progress-uuid",
            session_id: "session-tool-hooks"
          } as SDKMessage,
          {
            type: "user",
            message: { role: "user", content: "tool output" } as never,
            parent_tool_use_id: "tool-1",
            tool_use_result: { ok: true, value: 42 },
            session_id: "session-tool-hooks"
          } as SDKMessage,
          {
            type: "result",
            subtype: "success",
            duration_ms: 1,
            duration_api_ms: 1,
            is_error: false,
            num_turns: 1,
            result: "done",
            total_cost_usd: 0,
            usage: {},
            modelUsage: {},
            permission_denials: [],
            uuid: "result-uuid",
            session_id: "session-tool-hooks"
          } as SDKMessage
        )
      } satisfies QueryHandle),
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const options = {
        hooks: {
          PostToolUse: [
            {
              matcher: "bash",
              hooks: [
                async (input) => {
                  calls += 1
                  toolName = "tool_name" in input ? input.tool_name : undefined
                  toolUseId = "tool_use_id" in input ? input.tool_use_id : undefined
                  responseValue = "tool_response" in input ? input.tool_response : undefined
                  return {}
                }
              ]
            }
          ]
        }
      } as Options

      const handle = yield* supervisor.submit("hooked-tool", options)
      yield* Stream.runDrain(handle.stream)

      expect(calls).toBe(1)
      expect(toolName).toBe("bash")
      expect(toolUseId).toBe("tool-1")
      expect(responseValue).toEqual({ ok: true, value: 42 })
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor replays PostToolUseFailure and Stop hooks on sandbox query errors", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  const sdk = AgentSdk.make({
    query: () => Effect.succeed(makeHandle()),
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  let failureCalls = 0
  let failureToolName: string | undefined
  let failureToolUseId: string | undefined
  let failureError: string | undefined
  let stopCalls = 0
  let stopSessionId: string | undefined

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: () =>
      Effect.succeed({
        ...makeHandle(),
        stream: Stream.make(
          {
            type: "tool_progress",
            tool_use_id: "tool-failure-1",
            tool_name: "bash",
            parent_tool_use_id: null,
            elapsed_time_seconds: 0.1,
            uuid: "tool-progress-failure-uuid",
            session_id: "session-failure-hooks"
          } as SDKMessage,
          {
            type: "result",
            subtype: "error_during_execution",
            duration_ms: 1,
            duration_api_ms: 1,
            is_error: true,
            num_turns: 1,
            total_cost_usd: 0,
            usage: {},
            modelUsage: {},
            permission_denials: [],
            errors: ["tool crashed"],
            uuid: "result-failure-uuid",
            session_id: "session-failure-hooks"
          } as SDKMessage
        )
      } satisfies QueryHandle),
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const options = {
        hooks: {
          PostToolUseFailure: [
            {
              matcher: "bash*",
              hooks: [
                async (input) => {
                  failureCalls += 1
                  failureToolName = "tool_name" in input ? input.tool_name : undefined
                  failureToolUseId = "tool_use_id" in input ? input.tool_use_id : undefined
                  failureError = "error" in input ? input.error : undefined
                  return {}
                }
              ]
            }
          ],
          Stop: [
            {
              hooks: [
                async (input) => {
                  stopCalls += 1
                  stopSessionId = input.session_id
                  return {}
                }
              ]
            }
          ]
        }
      } as Options

      const handle = yield* supervisor.submit("hooked-failure", options)
      yield* Stream.runDrain(handle.stream)

      expect(failureCalls).toBe(1)
      expect(failureToolName).toBe("bash")
      expect(failureToolUseId).toBe("tool-failure-1")
      expect(failureError).toBe("tool crashed")
      expect(stopCalls).toBe(1)
      expect(stopSessionId).toBe("session-failure-hooks")
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor sandbox hook matcher supports wildcards and blocks non-matches", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  const sdk = AgentSdk.make({
    query: () => Effect.succeed(makeHandle()),
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  let wildcardMatches = 0
  let blockedMatches = 0

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: () =>
      Effect.succeed({
        ...makeHandle(),
        stream: Stream.make(
          {
            type: "tool_progress",
            tool_use_id: "tool-match-1",
            tool_name: "bash.exec",
            parent_tool_use_id: null,
            elapsed_time_seconds: 0.1,
            uuid: "tool-progress-match-uuid",
            session_id: "session-matchers"
          } as SDKMessage,
          {
            type: "user",
            message: { role: "user", content: "tool output" } as never,
            parent_tool_use_id: "tool-match-1",
            tool_use_result: { success: true },
            session_id: "session-matchers"
          } as SDKMessage,
          {
            type: "result",
            subtype: "success",
            duration_ms: 1,
            duration_api_ms: 1,
            is_error: false,
            num_turns: 1,
            result: "done",
            total_cost_usd: 0,
            usage: {},
            modelUsage: {},
            permission_denials: [],
            uuid: "result-match-uuid",
            session_id: "session-matchers"
          } as SDKMessage
        )
      } satisfies QueryHandle),
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const options = {
        hooks: {
          PostToolUse: [
            {
              matcher: "git*",
              hooks: [
                async () => {
                  blockedMatches += 1
                  return {}
                }
              ]
            },
            {
              matcher: "bash*",
              hooks: [
                async () => {
                  wildcardMatches += 1
                  return {}
                }
              ]
            }
          ]
        }
      } as Options

      const handle = yield* supervisor.submit("hooked-matchers", options)
      yield* Stream.runDrain(handle.stream)

      expect(wildcardMatches).toBe(1)
      expect(blockedMatches).toBe(0)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor rejects non-string prompts when sandbox is isolated", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  let sdkQueryCalled = false
  let sandboxRunAgentCalled = false

  const sdk = AgentSdk.make({
    query: () => {
      sdkQueryCalled = true
      return Effect.succeed(makeHandle())
    },
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: () => {
      sandboxRunAgentCalled = true
      return Effect.succeed(makeHandle())
    },
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const streamingPrompt = (async function*(): AsyncIterable<SDKUserMessage> {
        yield { type: "user", message: { role: "user", content: "hello" } } as never
      })()
      const result = yield* Effect.either(supervisor.submit(streamingPrompt))

      expect(Either.isLeft(result)).toBe(true)
      if (Either.isLeft(result) && result.left._tag === "SandboxError") {
        expect(result.left._tag).toBe("SandboxError")
        expect(result.left.operation).toBe("dispatchQuery")
      }

      expect(sandboxRunAgentCalled).toBe(false)
      expect(sdkQueryCalled).toBe(false)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor applies concurrency and active stats to sandbox queries", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  const sdk = AgentSdk.make({
    query: () => Effect.succeed(makeHandle()),
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  const startedPrompts: Array<string> = []

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: (prompt) =>
      Effect.sync(() => {
        startedPrompts.push(prompt)
        return makeHandle()
      }),
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
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
      const startedTooEarly = yield* Deferred.isDone(secondStarted)
      expect(startedTooEarly).toBe(false)

      yield* Deferred.succeed(firstRelease, undefined)
      yield* Deferred.await(secondStarted)

      yield* Fiber.join(firstFiber)
      yield* Fiber.join(secondFiber)

      expect(startedPrompts).toEqual(["first", "second"])
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("QuerySupervisor.interruptAll interrupts active sandbox handles", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")

  const sdk = AgentSdk.make({
    query: () => Effect.succeed(makeHandle()),
    createSdkMcpServer: () => Effect.succeed({} as never),
    createSdkMcpServerScoped: () => Effect.succeed({} as never)
  }) satisfies AgentSdk

  const interrupted = { value: false }

  const sandbox = SandboxService.of({
    provider: "cloudflare",
    isolated: true,
    exec: () => Effect.succeed({ stdout: "", stderr: "", exitCode: 0 }),
    writeFile: () => Effect.void,
    readFile: () => Effect.succeed(""),
    runAgent: () =>
      Effect.succeed(
        makeHandle({
          interrupt: Effect.sync(() => {
            interrupted.value = true
          })
        })
      ),
    destroy: Effect.void
  })

  const layer = QuerySupervisor.layer.pipe(
    Layer.provide(
      Layer.succeed(
        QuerySupervisorConfig,
        QuerySupervisorConfig.make({ settings: baseSettings })
      )
    ),
    Layer.provide(Layer.succeed(AgentSdk, sdk)),
    Layer.provide(Layer.succeed(SandboxService, sandbox))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const supervisor = yield* QuerySupervisor
      const release = yield* Deferred.make<void>()
      const started = yield* Deferred.make<void>()

      const queryFiber = yield* Effect.fork(
        Effect.scoped(
          Effect.gen(function*() {
            yield* supervisor.submit("interruptible")
            yield* Deferred.succeed(started, undefined)
            yield* Deferred.await(release)
          })
        )
      )

      yield* Deferred.await(started)
      yield* supervisor.interruptAll
      expect(interrupted.value).toBe(true)

      yield* Deferred.succeed(release, undefined)
      yield* Fiber.join(queryFiber)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})
