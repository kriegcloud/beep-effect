import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import type { QueryHandle } from "../src/Query.js"
import type { SDKMessage, SDKUserMessage } from "../src/Schema/Message.js"
import type { QuerySupervisorStats } from "../src/QuerySupervisor.js"
import { AgentRuntime, Storage } from "../src/index.js"

const makeHandle = (messages: ReadonlyArray<SDKMessage>): QueryHandle => {
  const stream = Stream.fromIterable(messages)
  return {
    stream,
    send: (_message: SDKUserMessage) => Effect.void,
    sendAll: (_messages: Iterable<SDKUserMessage>) => Effect.void,
    sendForked: (_message: SDKUserMessage) => Effect.void,
    closeInput: Effect.void,
    share: (config) => Stream.share(stream, config ?? { capacity: 16, strategy: "suspend" }),
    broadcast: (n, maximumLag) => Stream.broadcast(stream, n, maximumLag ?? 16),
    interrupt: Effect.void,
    setPermissionMode: (_mode) => Effect.die("not-implemented"),
    setModel: (_model) => Effect.die("not-implemented"),
    setMaxThinkingTokens: (_maxTokens) => Effect.die("not-implemented"),
    rewindFiles: (_uuid, _options) => Effect.die("not-implemented"),
    supportedCommands: Effect.die("not-implemented"),
    supportedModels: Effect.die("not-implemented"),
    mcpServerStatus: Effect.die("not-implemented"),
    setMcpServers: (_servers) => Effect.die("not-implemented"),
    accountInfo: Effect.die("not-implemented")
  }
}

const makeRuntimeLayer = (messages: ReadonlyArray<SDKMessage>) => {
  const stats: QuerySupervisorStats = {
    active: 0,
    pending: 0,
    concurrencyLimit: 1,
    pendingQueueCapacity: 0,
    pendingQueueStrategy: "disabled"
  }
  const handle = makeHandle(messages)
  return Layer.succeed(
    AgentRuntime,
    AgentRuntime.make({
      query: (_prompt, _options) => Effect.succeed(handle),
      queryRaw: (_prompt, _options) => Effect.succeed(handle),
      stream: (_prompt, _options) => handle.stream,
      stats: Effect.succeed(stats),
      interruptAll: Effect.void,
      events: Stream.empty
    })
  )
}

test("AgentRuntime.layerWithPersistence records chat history and artifacts", async () => {
  const message: SDKUserMessage = {
    type: "user",
    session_id: "session-1",
    message: {
      role: "user",
      content: [{ type: "text", text: "hello" }]
    },
    parent_tool_use_id: null,
    tool_use_result: { ok: true }
  }

  const chatHistoryLayer = Storage.ChatHistoryStore.layerMemory
  const artifactLayer = Storage.ArtifactStore.layerMemory
  const layer = Layer.mergeAll(
    AgentRuntime.layerWithPersistence({
      layers: {
        runtime: makeRuntimeLayer([message]),
        chatHistory: chatHistoryLayer,
        artifacts: artifactLayer
      }
    }),
    chatHistoryLayer,
    artifactLayer
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const runtime = yield* AgentRuntime
      const handle = yield* runtime.query("test")
      yield* handle.stream.pipe(Stream.runDrain)
      const chat = yield* Storage.ChatHistoryStore
      const artifacts = yield* Storage.ArtifactStore
      const events = yield* chat.list("session-1")
      const records = yield* artifacts.list("session-1")
      return { events, records }
    }).pipe(Effect.provide(layer))
  )

  const result = await Effect.runPromise(program)
  expect(result.events.length).toBe(1)
  expect(result.records.length).toBe(1)
})
