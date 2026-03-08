import { NodeHttpServer } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { TurnStreamEvent } from "@template/domain/events"
import type { AgentStatePort, ChannelPort, CheckpointPort, SessionTurnPort } from "@template/domain/ports"
import { Effect, Layer, Stream } from "effect"
import { SingleRunner } from "effect/unstable/cluster"
import { HttpRouter } from "effect/unstable/http"
import * as HttpClient from "effect/unstable/http/HttpClient"
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
import { errorFrame, extractChannelId, layer as WebChatRoutesLayer, parseFrame } from "../src/gateway/WebChatRoutes.js"
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
// App layer for HTTP route tests
// ---------------------------------------------------------------------------

const makeAppLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const agentStateSqliteLayer = AgentStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const agentStateTagLayer = Layer.effect(
    AgentStatePortTag,
    Effect.gen(function*() {
      return (yield* AgentStatePortSqlite) as AgentStatePort
    })
  ).pipe(Layer.provide(agentStateSqliteLayer))

  const sessionTurnSqliteLayer = SessionTurnPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const sessionTurnTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() {
      return (yield* SessionTurnPortSqlite) as SessionTurnPort
    })
  ).pipe(Layer.provide(sessionTurnSqliteLayer))

  const channelPortSqliteLayer = ChannelPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const channelPortTagLayer = Layer.effect(
    ChannelPortTag,
    Effect.gen(function*() {
      return (yield* ChannelPortSqlite) as ChannelPort
    })
  ).pipe(Layer.provide(channelPortSqliteLayer))

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

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
    makeToolkit: () => Effect.die("ToolRegistry.makeToolkit not used in WebChatRoutes tests"),
    executeApprovedCheckpointTool: () =>
      Effect.die("ToolRegistry.executeApprovedCheckpointTool not used in WebChatRoutes tests")
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

  return Layer.mergeAll(
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
  ).pipe(
    Layer.provideMerge(clusterLayer)
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

// ---------------------------------------------------------------------------
// Unit tests — parseFrame, extractChannelId, errorFrame
// ---------------------------------------------------------------------------

describe("WebChatRoutes helpers", () => {
  describe("extractChannelId", () => {
    it("extracts channel ID from /ws/chat/:channelId", () => {
      expect(extractChannelId("/ws/chat/channel:abc")).toBe("channel:abc")
    })

    it("extracts channel ID from full URL", () => {
      expect(extractChannelId("http://localhost:3000/ws/chat/channel:xyz")).toBe("channel:xyz")
    })

    it("returns empty string for missing channelId", () => {
      expect(extractChannelId("/ws/chat/")).toBe("")
    })

    it("returns empty string for unrelated path", () => {
      expect(extractChannelId("/health")).toBe("")
    })
  })

  describe("parseFrame", () => {
    it("parses init frame with all fields", () => {
      const result = parseFrame(JSON.stringify({
        type: "init",
        agentId: "agent:test",
        userId: "user:test"
      }))
      expect(result).toEqual({
        type: "init",
        agentId: "agent:test",
        userId: "user:test"
      })
    })

    it("parses init frame with attachTo session", () => {
      const result = parseFrame(JSON.stringify({
        type: "init",
        agentId: "agent:test",
        userId: "user:test",
        attachTo: { sessionId: "session:shared" }
      }))
      expect(result).toEqual({
        type: "init",
        agentId: "agent:test",
        userId: "user:test",
        attachTo: { sessionId: "session:shared" }
      })
    })

    it("parses init frame with defaults", () => {
      const result = parseFrame(JSON.stringify({ type: "init" }))
      expect(result).toEqual({
        type: "init",
        agentId: "agent:bootstrap",
        userId: "user:web:anon"
      })
    })

    it("parses message frame", () => {
      const result = parseFrame(JSON.stringify({
        type: "message",
        content: "hello world"
      }))
      expect(result).toEqual({
        type: "message",
        content: "hello world",
        threadId: undefined
      })
    })

    it("parses message frame with threadId", () => {
      const result = parseFrame(JSON.stringify({
        type: "message",
        content: "hello",
        threadId: "thread:123"
      }))
      expect(result).toEqual({
        type: "message",
        content: "hello",
        threadId: "thread:123"
      })
    })

    it("returns null for invalid JSON", () => {
      expect(parseFrame("not json")).toBeNull()
    })

    it("returns null for non-object", () => {
      expect(parseFrame(JSON.stringify("string"))).toBeNull()
    })

    it("returns null for array", () => {
      expect(parseFrame(JSON.stringify([1, 2, 3]))).toBeNull()
    })

    it("returns null for unknown type", () => {
      expect(parseFrame(JSON.stringify({ type: "unknown" }))).toBeNull()
    })

    it("returns null for message without content", () => {
      expect(parseFrame(JSON.stringify({ type: "message" }))).toBeNull()
    })

    it("handles Uint8Array input", () => {
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify({ type: "init" }))
      const result = parseFrame(data)
      expect(result).toEqual({
        type: "init",
        agentId: "agent:bootstrap",
        userId: "user:web:anon"
      })
    })
  })

  describe("errorFrame", () => {
    it("produces valid error JSON", () => {
      const frame = errorFrame("TEST_CODE", "test message")
      const parsed = JSON.parse(frame)
      expect(parsed).toEqual({
        type: "error",
        code: "TEST_CODE",
        message: "test message"
      })
    })
  })
})

// ---------------------------------------------------------------------------
// HTTP-level route tests (non-WS requests to the WS endpoint)
// ---------------------------------------------------------------------------

describe("WebChatRoutes HTTP fallback", () => {
  it.effect("GET /ws/chat/:channelId without upgrade returns 500 (not upgradeable)", () => {
    const dbPath = testDatabasePath("ws-no-upgrade")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(WebChatRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient

      // A regular HTTP GET (not a WebSocket upgrade) should fail
      // because NodeHttpServer cannot do WS upgrades
      const response = yield* client.get("/ws/chat/channel:test").pipe(
        Effect.scoped
      )

      // The server should return 500 because upgrade fails on Node
      expect(response.status).toBe(500)
      const body = yield* response.json
      expect(body).toEqual({ error: "InternalServerError" })
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

// ---------------------------------------------------------------------------
// NOTE: Full WebSocket e2e tests require the Bun runtime for WS upgrade.
// These will be verified in Task 11 (end-to-end verification) using either
// `bun test` or a manual integration test with the live Bun server.
// ---------------------------------------------------------------------------
