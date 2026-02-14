import { expect, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import { AgentSdkError } from "../src/Errors.js"
import type { QueryHandle } from "../src/Query.js"
import { QuerySupervisor } from "../src/QuerySupervisor.js"
import { layerLocal } from "../src/Sandbox/SandboxLocal.js"
import { SandboxError } from "../src/Sandbox/SandboxError.js"
import { SandboxService } from "../src/Sandbox/SandboxService.js"
import { runEffect } from "./effect-test.js"

const makeHandle = (): QueryHandle => {
  const stream = Stream.empty
  return {
    stream,
    send: () => Effect.void,
    sendAll: () => Effect.void,
    sendForked: () => Effect.void,
    closeInput: Effect.void,
    share: (config) => Stream.share(stream, config ?? { capacity: 16, strategy: "suspend" }),
    broadcast: (n, maximumLag) => Stream.broadcast(stream, n, maximumLag ?? 16),
    interrupt: Effect.void,
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

test("SandboxError is part of AgentSdkError union", () => {
  const error = SandboxError.make({
    message: "sandbox failure",
    operation: "exec",
    provider: "local"
  })

  const isAgentError = Schema.is(AgentSdkError)
  expect(isAgentError(error)).toBe(true)
  expect(error._tag).toBe("SandboxError")
})

test("SandboxLocal.exec uses non-shell arg handling", async () => {
  const supervisor = QuerySupervisor.make({
    submit: () => Effect.succeed(makeHandle()),
    submitStream: () => Stream.empty,
    stats: Effect.succeed({
      active: 0,
      pending: 0,
      concurrencyLimit: 1,
      pendingQueueCapacity: 0,
      pendingQueueStrategy: "disabled"
    }),
    interruptAll: Effect.void,
    events: Stream.empty
  })

  const layer = layerLocal.pipe(
    Layer.provide(Layer.succeed(QuerySupervisor, supervisor))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const result = yield* sandbox.exec("echo", ["$(uname)"])
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain("$(uname)")
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("SandboxLocal.writeFile/readFile roundtrip", async () => {
  const supervisor = QuerySupervisor.make({
    submit: () => Effect.succeed(makeHandle()),
    submitStream: () => Stream.empty,
    stats: Effect.succeed({
      active: 0,
      pending: 0,
      concurrencyLimit: 1,
      pendingQueueCapacity: 0,
      pendingQueueStrategy: "disabled"
    }),
    interruptAll: Effect.void,
    events: Stream.empty
  })

  const layer = layerLocal.pipe(
    Layer.provide(Layer.succeed(QuerySupervisor, supervisor))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const path = `/tmp/sandbox-local-${crypto.randomUUID()}.txt`
      yield* sandbox.writeFile(path, "hello from sandbox local")
      const read = yield* sandbox.readFile(path)
      expect(read).toBe("hello from sandbox local")
      yield* Effect.promise(() => Bun.file(path).delete()).pipe(Effect.ignore)
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})

test("SandboxLocal.runAgent delegates to QuerySupervisor.submit", async () => {
  let capturedPrompt: string | undefined
  let capturedOptions: unknown

  const handle = makeHandle()
  const supervisor = QuerySupervisor.make({
    submit: (prompt, options) =>
      Effect.sync(() => {
        capturedPrompt = prompt as string
        capturedOptions = options
        return handle
      }),
    submitStream: () => Stream.empty,
    stats: Effect.succeed({
      active: 0,
      pending: 0,
      concurrencyLimit: 1,
      pendingQueueCapacity: 0,
      pendingQueueStrategy: "disabled"
    }),
    interruptAll: Effect.void,
    events: Stream.empty
  })

  const layer = layerLocal.pipe(
    Layer.provide(Layer.succeed(QuerySupervisor, supervisor))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const returned = yield* sandbox.runAgent("hello", { model: "sonnet", maxTurns: 2 })
      expect(returned).toBe(handle)
      expect(capturedPrompt).toBe("hello")
      expect(capturedOptions).toEqual({ model: "sonnet", maxTurns: 2 })
    }).pipe(Effect.provide(layer))
  )

  await runEffect(program)
})
