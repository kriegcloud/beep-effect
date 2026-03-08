/**
 * WebSocket e2e tests for WebChatRoutes.
 *
 * These tests require Bun's native WebSocket support via `Bun.serve`.
 * They CANNOT run under vitest (which uses worker threads where Bun.serve
 * WebSocket upgrades don't work). Run with:
 *
 *   bun test packages/server/test/WebChatRoutes.ws.bun-test.ts
 */
import { BunHttpServer } from "@effect/platform-bun"
import type { TurnStreamEvent } from "@template/domain/events"
import type { AgentStatePort, ChannelPort, CheckpointPort, SessionTurnPort } from "@template/domain/ports"
import { afterEach, describe, expect, test } from "bun:test"
import { Effect, Layer, Schema, Stream } from "effect"
import { SingleRunner } from "effect/unstable/cluster"
import { HttpRouter } from "effect/unstable/http"
import * as HttpServer from "effect/unstable/http/HttpServer"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { ChannelCore } from "../src/ChannelCore.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { layer as SessionEntityLayer } from "../src/entities/SessionEntity.js"
import { layer as WebChatAdapterEntityLayer } from "../src/entities/WebChatAdapterEntity.js"
import { layer as WebChatRoutesLayer } from "../src/gateway/WebChatRoutes.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { AgentStatePortTag, ChannelPortTag, CheckpointPortTag, SessionTurnPortTag } from "../src/PortTags.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import type { ProcessTurnPayload } from "../src/turn/TurnProcessingWorkflow.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

// ---------------------------------------------------------------------------
// Mock TurnProcessingRuntime
// ---------------------------------------------------------------------------

const makeMockTurnProcessingRuntime = () =>
  Layer.succeed(TurnProcessingRuntime, {
    processTurn: (_input: ProcessTurnPayload) =>
      Effect.succeed({
        turnId: _input.turnId,
        accepted: true,
        auditReasonCode: "turn_processing_accepted" as const,
        assistantContent: "mock ws response",
        assistantContentBlocks: [{ contentBlockType: "TextBlock" as const, text: "mock ws response" }],
        iterationsUsed: 1,
        toolCallsTotal: 0,
        iterationStats: [],
        modelFinishReason: "stop",
        modelUsageJson: "{}"
      }),
    processTurnStream: (input: ProcessTurnPayload): Stream.Stream<TurnStreamEvent> =>
      Stream.make(
        {
          type: "turn.started" as const,
          sequence: 1,
          turnId: input.turnId,
          sessionId: input.sessionId,
          createdAt: input.createdAt
        },
        {
          type: "assistant.delta" as const,
          sequence: 2,
          turnId: input.turnId,
          sessionId: input.sessionId,
          delta: "mock ws response"
        },
        {
          type: "turn.completed" as const,
          sequence: 3,
          turnId: input.turnId,
          sessionId: input.sessionId,
          accepted: true,
          auditReasonCode: "turn_processing_accepted",
          iterationsUsed: 1,
          toolCallsTotal: 0,
          modelFinishReason: "stop",
          modelUsageJson: "{}"
        }
      )
  } as any)

// ---------------------------------------------------------------------------
// WebSocket helpers
// ---------------------------------------------------------------------------

const waitForOpen = (ws: WebSocket, timeoutMs = 5000): Promise<void> =>
  new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) return resolve()
    const timer = setTimeout(() => reject(new Error("WS open timeout")), timeoutMs)
    ws.addEventListener("open", () => {
      clearTimeout(timer)
      resolve()
    }, { once: true })
    ws.addEventListener("error", (e) => {
      clearTimeout(timer)
      reject(e)
    }, { once: true })
  })

const readMessage = (ws: WebSocket, timeoutMs = 5000): Promise<string> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("WS read timeout")), timeoutMs)
    ws.addEventListener("message", (event) => {
      clearTimeout(timer)
      resolve(typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data))
    }, { once: true })
  })

const decodeJsonUnknown = Schema.decodeUnknownSync(Schema.UnknownFromJsonString)
const encodeJsonUnknown = Schema.encodeSync(Schema.UnknownFromJsonString)

const parseJson = (input: string): unknown => decodeJsonUnknown(input)

const stringifyJson = (input: unknown): string => encodeJsonUnknown(input)

// ---------------------------------------------------------------------------
// Test database helpers
// ---------------------------------------------------------------------------

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-ws-${name}-${crypto.randomUUID()}.sqlite`)

const dbPaths: Array<string> = []
afterEach(() => {
  for (const p of dbPaths) rmSync(p, { force: true })
  dbPaths.length = 0
})

// ---------------------------------------------------------------------------
// Test layer — real HTTP server with BunHttpServer
// ---------------------------------------------------------------------------

const makeWsTestLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const agentStateSqliteLayer = AgentStatePortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  const agentStateTagLayer = Layer.effect(
    AgentStatePortTag,
    Effect.gen(function*() {
      return (yield* AgentStatePortSqlite) as AgentStatePort
    })
  ).pipe(Layer.provide(agentStateSqliteLayer))

  const sessionTurnSqliteLayer = SessionTurnPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  const sessionTurnTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() {
      return (yield* SessionTurnPortSqlite) as SessionTurnPort
    })
  ).pipe(Layer.provide(sessionTurnSqliteLayer))

  const channelPortSqliteLayer = ChannelPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  const channelPortTagLayer = Layer.effect(
    ChannelPortTag,
    Effect.gen(function*() {
      return (yield* ChannelPortSqlite) as ChannelPort
    })
  ).pipe(Layer.provide(channelPortSqliteLayer))

  const clusterLayer = SingleRunner.layer().pipe(Layer.provide(sqlInfrastructureLayer), Layer.orDie)

  const checkpointPortSqliteLayer = CheckpointPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const checkpointPortTagLayer = Layer.effect(
    CheckpointPortTag,
    Effect.gen(function*() {
      return (yield* CheckpointPortSqlite) as CheckpointPort
    })
  ).pipe(Layer.provide(checkpointPortSqliteLayer))

  const mockTurnProcessingRuntimeLayer = makeMockTurnProcessingRuntime()
  const toolRegistryStubLayer = Layer.succeed(ToolRegistry, {
    makeToolkit: () => Effect.die("ToolRegistry.makeToolkit not used in WebChatRoutes ws tests"),
    executeApprovedCheckpointTool: () =>
      Effect.die("ToolRegistry.executeApprovedCheckpointTool not used in WebChatRoutes ws tests")
  } as any)
  const mockAgentConfigLayer = AgentConfig.layerFromParsed(withTestPromptsConfig({
    providers: { anthropic: { apiKeyEnv: "TEST_KEY" } },
    agents: {
      default: {
        persona: { name: "Test"  },
        promptBindings: {
          turn: {
            systemPromptRef: "core.turn.system.default",
            replayContinuationRef: "core.turn.replay.continuation"
          },
          memory: {
            triggerEnvelopeRef: "memory.trigger.envelope",
            tierInstructionRefs: {
              WorkingMemory: "memory.tier.working",
              EpisodicMemory: "memory.tier.episodic",
              SemanticMemory: "memory.tier.semantic",
              ProceduralMemory: "memory.tier.procedural"
            }
          },
          compaction: {
            summaryBlockRef: "compaction.block.summary",
            artifactRefsBlockRef: "compaction.block.artifacts",
            toolRefsBlockRef: "compaction.block.tools",
            keptContextBlockRef: "compaction.block.kept"
          }
        },
        model: { provider: "anthropic", modelId: "test-model" },
        generation: { temperature: 0.7, maxOutputTokens: 1024 }
      }
    },
    server: { port: 3000 }
  }))

  const sessionEntityLayer = SessionEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(mockTurnProcessingRuntimeLayer)
  )

  const channelCoreLayer = ChannelCore.layer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(agentStateTagLayer),
    Layer.provide(channelPortTagLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(checkpointPortTagLayer),
    Layer.provide(mockTurnProcessingRuntimeLayer),
    Layer.provide(sessionEntityLayer),
    Layer.provide(mockAgentConfigLayer),
    Layer.provide(toolRegistryStubLayer)
  )

  const webChatAdapterEntityLayer = WebChatAdapterEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(channelCoreLayer),
    Layer.provide(channelPortTagLayer)
  )

  const appDepsLayer = Layer.mergeAll(
    sqlInfrastructureLayer,
    agentStateSqliteLayer,
    agentStateTagLayer,
    sessionTurnSqliteLayer,
    sessionTurnTagLayer,
    channelPortSqliteLayer,
    channelPortTagLayer,
    checkpointPortSqliteLayer,
    checkpointPortTagLayer,
    mockTurnProcessingRuntimeLayer,
    sessionEntityLayer,
    webChatAdapterEntityLayer
  ).pipe(Layer.provideMerge(clusterLayer))

  return HttpRouter.serve(
    WebChatRoutesLayer.pipe(Layer.provide(appDepsLayer)),
    { disableLogger: true, disableListenLog: true }
  ).pipe(
    Layer.provide(clusterLayer),
    Layer.provideMerge(BunHttpServer.layer({ port: 0 }))
  )
}

// ---------------------------------------------------------------------------
// Helper: run an Effect test with scoped layer
// ---------------------------------------------------------------------------

const runWsTest = (
  name: string,
  testFn: (port: number) => Effect.Effect<void, never, HttpServer.HttpServer>
) => {
  const dbPath = testDatabasePath(name)
  dbPaths.push(dbPath)
  return Effect.runPromise(
    Effect.gen(function*() {
      const server = yield* HttpServer.HttpServer
      const address = server.address
      if (address._tag !== "TcpAddress") throw new Error("Expected TcpAddress")
      yield* testFn(address.port)
    }).pipe(
      Effect.scoped,
      Effect.provide(makeWsTestLayer(dbPath))
    )
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WebChatRoutes WebSocket", () => {
  test(
    "happy path: connect -> init -> message -> streamed events",
    () =>
      runWsTest("ws-happy", (port) =>
        Effect.gen(function*() {
          const channelId = `channel:${crypto.randomUUID()}`
          const ws = new WebSocket(`ws://localhost:${port}/ws/chat/${channelId}`)
          yield* Effect.promise(() => waitForOpen(ws))

          try {
            const connected = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(connected) as { readonly type: string }).type).toBe("connected")

            ws.send(stringifyJson({ type: "init", agentId: "agent:bootstrap", userId: "user:web:test" }))
            const initialized = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(initialized) as { readonly type: string }).type).toBe("initialized")

            ws.send(stringifyJson({ type: "message", content: "hello" }))

            const events: Array<any> = []
            let done = false
            while (!done) {
              const msg = yield* Effect.promise(() => readMessage(ws))
              const event = parseJson(msg) as { readonly type: string }
              events.push(event)
              if (event.type === "turn.completed" || event.type === "turn.failed") done = true
            }

            expect(events.some((e: any) => e.type === "turn.started")).toBe(true)
            expect(events.some((e: any) => e.type === "assistant.delta")).toBe(true)
            expect(events.some((e: any) => e.type === "turn.completed")).toBe(true)
          } finally {
            ws.close()
            // Allow close event to propagate to server before scope teardown
            yield* Effect.sleep("200 millis")
          }
        })),
    15000
  )

  test(
    "malformed frame: receives INVALID_FRAME error",
    () =>
      runWsTest("ws-malformed", (port) =>
        Effect.gen(function*() {
          const ws = new WebSocket(`ws://localhost:${port}/ws/chat/channel:${crypto.randomUUID()}`)
          yield* Effect.promise(() => waitForOpen(ws))

          try {
            const connected = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(connected) as { readonly type: string }).type).toBe("connected")

            ws.send("this is not valid json {{{")
            const errorMsg = yield* Effect.promise(() => readMessage(ws))
            const errorData = parseJson(errorMsg) as { readonly type: string; readonly code: string }
            expect(errorData.type).toBe("error")
            expect(errorData.code).toBe("INVALID_FRAME")
          } finally {
            ws.close()
            yield* Effect.sleep("200 millis")
          }
        })),
    15000
  )

  test(
    "message before init: receives NOT_INITIALIZED error",
    () =>
      runWsTest("ws-no-init", (port) =>
        Effect.gen(function*() {
          const ws = new WebSocket(`ws://localhost:${port}/ws/chat/channel:${crypto.randomUUID()}`)
          yield* Effect.promise(() => waitForOpen(ws))

          try {
            const connected = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(connected) as { readonly type: string }).type).toBe("connected")

            ws.send(stringifyJson({ type: "message", content: "premature" }))
            const errorMsg = yield* Effect.promise(() => readMessage(ws))
            const errorData = parseJson(errorMsg) as { readonly type: string; readonly code: string }
            expect(errorData.type).toBe("error")
            expect(errorData.code).toBe("NOT_INITIALIZED")
          } finally {
            ws.close()
            yield* Effect.sleep("200 millis")
          }
        })),
    15000
  )

  test(
    "double init: receives ALREADY_INITIALIZED error",
    () =>
      runWsTest("ws-double-init", (port) =>
        Effect.gen(function*() {
          const ws = new WebSocket(`ws://localhost:${port}/ws/chat/channel:${crypto.randomUUID()}`)
          yield* Effect.promise(() => waitForOpen(ws))

          try {
            const connected = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(connected) as { readonly type: string }).type).toBe("connected")

            ws.send(stringifyJson({ type: "init", agentId: "agent:bootstrap", userId: "user:web:test" }))
            const initialized = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(initialized) as { readonly type: string }).type).toBe("initialized")

            ws.send(stringifyJson({ type: "init", agentId: "agent:bootstrap", userId: "user:web:test" }))
            const errorMsg = yield* Effect.promise(() => readMessage(ws))
            const errorData = parseJson(errorMsg) as { readonly type: string; readonly code: string }
            expect(errorData.type).toBe("error")
            expect(errorData.code).toBe("ALREADY_INITIALIZED")
          } finally {
            ws.close()
            yield* Effect.sleep("200 millis")
          }
        })),
    15000
  )

  test(
    "disconnect cleanup: no unhandled promise rejections",
    () =>
      runWsTest("ws-disconnect", (port) =>
        Effect.gen(function*() {
          const rejections: Array<unknown> = []
          const handler = (event: PromiseRejectionEvent) => {
            rejections.push(event.reason)
          }
          globalThis.addEventListener("unhandledrejection", handler)

          try {
            const ws = new WebSocket(`ws://localhost:${port}/ws/chat/channel:${crypto.randomUUID()}`)
            yield* Effect.promise(() => waitForOpen(ws))

            const connected = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(connected) as { readonly type: string }).type).toBe("connected")

            ws.send(stringifyJson({ type: "init", agentId: "agent:bootstrap", userId: "user:web:test" }))
            const initialized = yield* Effect.promise(() => readMessage(ws))
            expect((parseJson(initialized) as { readonly type: string }).type).toBe("initialized")

            ws.close()
            yield* Effect.sleep("200 millis")
            expect(rejections).toEqual([])
          } finally {
            globalThis.removeEventListener("unhandledrejection", handler)
          }
        })),
    15000
  )
})
