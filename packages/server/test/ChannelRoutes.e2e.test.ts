import { NodeHttpServer } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { TurnStreamEvent } from "@template/domain/events"
import type { ChannelId, CheckpointId, ConversationId, SessionId } from "@template/domain/ids"
import type { AgentStatePort, ChannelPort, CheckpointPort, CheckpointRecord, SessionTurnPort } from "@template/domain/ports"
import { DateTime, Effect, Layer, Schema, Stream } from "effect"
import { SingleRunner } from "effect/unstable/cluster"
import * as Sse from "effect/unstable/encoding/Sse"
import { HttpRouter } from "effect/unstable/http"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { ChannelCore } from "../src/ChannelCore.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import { layer as CLIAdapterEntityLayer } from "../src/entities/CLIAdapterEntity.js"
import { layer as SessionEntityLayer } from "../src/entities/SessionEntity.js"
import { healthLayer as HealthRoutesLayer, layer as ChannelRoutesLayer } from "../src/gateway/ChannelRoutes.js"
import { layer as CheckpointRoutesLayer } from "../src/gateway/CheckpointRoutes.js"
import { makeCheckpointPayloadHash } from "../src/checkpoints/ReplayHash.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { AgentStatePortTag, ChannelPortTag, CheckpointPortTag, SessionTurnPortTag } from "../src/PortTags.js"
import { RuntimeKernelReadiness } from "../src/runtime/RuntimeKernelReadiness.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import { TurnModelFailure, type ProcessTurnPayload } from "../src/turn/TurnProcessingWorkflow.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

// ---------------------------------------------------------------------------
// Mock TurnProcessingRuntime — same as CLIAdapterEntity.test.ts
// ---------------------------------------------------------------------------

const makeMockTurnProcessingRuntime = () =>
  Layer.succeed(TurnProcessingRuntime, {
    processTurn: (_input: ProcessTurnPayload) =>
      Effect.succeed({
        turnId: _input.turnId,
        accepted: true,
        auditReasonCode: "turn_processing_accepted" as const,
        assistantContent: "mock response",
        assistantContentBlocks: [{ contentBlockType: "TextBlock" as const, text: "mock response" }],
        iterationsUsed: 1,
        toolCallsTotal: 0,
        iterationStats: [],
        modelFinishReason: "stop",
        modelUsageJson: "{}"
      }),
    processTurnStream: (input: ProcessTurnPayload): Stream.Stream<TurnStreamEvent> => {
      if (input.content.includes("credit fail")) {
        return Stream.fail(new TurnModelFailure({
          turnId: input.turnId,
          reason: "provider_credit_exhausted: Your credit balance is too low to access the Anthropic API."
        })) as any
      }

      if (input.content.includes("checkpoint please")) {
        return Stream.make(
          {
            type: "turn.started" as const,
            sequence: 1,
            turnId: input.turnId,
            sessionId: input.sessionId,
            createdAt: input.createdAt
          },
          {
            type: "turn.checkpoint_required" as const,
            sequence: 2,
            turnId: input.turnId,
            sessionId: input.sessionId,
            checkpointId: "checkpoint:mock",
            action: "InvokeTool",
            reason: "requires approval"
          },
          {
            type: "turn.completed" as const,
            sequence: 3,
            turnId: input.turnId,
            sessionId: input.sessionId,
            accepted: false,
            auditReasonCode: "turn_processing_checkpoint_required",
            iterationsUsed: 1,
            toolCallsTotal: 1,
            modelFinishReason: "tool-calls",
            modelUsageJson: "{}"
          }
        )
      }

      return Stream.make(
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
          delta: "mock response"
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
    }
  } as any)

const encodeJson = Schema.encodeSync(Schema.UnknownFromJsonString)

// ---------------------------------------------------------------------------
// App layer (everything except HTTP server) — used with Layer.build pattern
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
    makeToolkit: () => Effect.die("ToolRegistry.makeToolkit not used in ChannelRoutes tests"),
    executeApprovedCheckpointTool: () =>
      Effect.die("ToolRegistry.executeApprovedCheckpointTool not used in ChannelRoutes tests")
  } as any)
  const sessionEntityLayer = SessionEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(mockTurnProcessingRuntimeLayer)
  )

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

  const cliAdapterEntityLayer = CLIAdapterEntityLayer.pipe(
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
    channelCoreLayer,
    sessionEntityLayer,
    cliAdapterEntityLayer
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

const AllRoutesLayer = Layer.mergeAll(ChannelRoutesLayer, CheckpointRoutesLayer, HealthRoutesLayer)

const makeDegradedReadinessLayer = () =>
  Layer.succeed(RuntimeKernelReadiness, {
    snapshot: () =>
      Effect.succeed({
        readinessState: "degraded" as const,
        payload: {
          status: "degraded" as const,
          service: "personal-agent" as const,
          readiness: {
            state: "degraded" as const,
            degradedReasons: ["required_workers_missing"] as const
          },
          runtime: {
            supervisor: {
              activeWorkerCount: 0,
              supervisedFiberCount: 0,
              requiredKeys: ["runtime.scheduler.tick"] as const,
              missingRequiredKeys: ["runtime.scheduler.tick"] as const,
              workers: [] as const
            },
            loops: [] as const,
            scheduler: { lastTick: null },
            subroutines: {
              queueDepth: 0,
              inFlightCount: 0,
              dedupeEntries: 0,
              lastWorkerError: null
            }
          },
          integrations: {
            summary: {
              total: 0,
              connected: 0,
              initializing: 0,
              error: 0,
              disconnected: 0,
              degraded: 0
            },
            integrations: [] as const
          }
        }
      } as const)
  })

const makeCheckpointSeedLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  return CheckpointPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
}

const seedCheckpoint = (dbPath: string, record: CheckpointRecord) =>
  Effect.gen(function*() {
    const checkpointPort = yield* CheckpointPortSqlite
    yield* checkpointPort.create(record)
  }).pipe(Effect.provide(makeCheckpointSeedLayer(dbPath)))

// ---------------------------------------------------------------------------
// Tests — using Layer.build pattern for streaming support
// ---------------------------------------------------------------------------

describe("ChannelRoutes e2e", () => {
  it.effect("GET /health returns ok", () => {
    const dbPath = testDatabasePath("e2e-health")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const response = yield* client.get("/health")
      const body = (yield* response.json) as any
      expect(body.status).toBe("ok")
      expect(body.service).toBe("personal-agent")
      expect(body.runtime).toBeDefined()
      expect(body.integrations).toBeDefined()
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("GET /ready returns readiness payload", () => {
    const dbPath = testDatabasePath("e2e-ready")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const response = yield* client.get("/ready")
      const body = (yield* response.json) as any
      expect(response.status).toBe(200)
      expect(body.service).toBe("personal-agent")
      expect(body.readiness).toBeDefined()
      expect(body.readiness.state).toBe("ready")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("GET /ready returns 503 when runtime readiness is degraded", () => {
    const dbPath = testDatabasePath("e2e-ready-degraded")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.provide(makeDegradedReadinessLayer()),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const response = yield* client.get("/ready")
      const body = (yield* response.json) as any
      expect(response.status).toBe(503)
      expect(body.readiness.state).toBe("degraded")
      expect(body.readiness.degradedReasons).toContain("required_workers_missing")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("SSE pipeline streams correctly over HTTP", () =>
    Effect.gen(function*() {
      // Tests the full SSE encoding pipeline: events → Sse.encode → encodeText → HTTP stream
      // Uses HttpRouter.route (not add) for proper streaming scope transfer
      const mockEvents: Array<TurnStreamEvent> = [
        {
          type: "turn.started",
          sequence: 1,
          turnId: "turn:test",
          sessionId: "session:test",
          createdAt: new Date().toISOString() as any
        },
        { type: "assistant.delta", sequence: 2, turnId: "turn:test", sessionId: "session:test", delta: "hello" },
        {
          type: "turn.completed",
          sequence: 3,
          turnId: "turn:test",
          sessionId: "session:test",
          accepted: true,
          auditReasonCode: "turn_processing_accepted",
          iterationsUsed: 1,
          toolCallsTotal: 0,
          modelFinishReason: "stop",
          modelUsageJson: "{}"
        }
      ]

      const toSseEvent = (event: TurnStreamEvent): Sse.Event => ({
        _tag: "Event",
        event: event.type,
        id: String(event.sequence),
        data: encodeJson(event)
      })

      yield* HttpRouter.addAll([
        HttpRouter.route(
          "POST",
          "/test-sse",
          (_request) => {
            const stream = Stream.fromIterable(mockEvents).pipe(
              Stream.map(toSseEvent),
              Stream.pipeThroughChannel(Sse.encode()),
              Stream.encodeText
            )
            return Effect.succeed(
              HttpServerResponse.stream(stream, {
                contentType: "text/event-stream",
                headers: { "cache-control": "no-cache", connection: "keep-alive" }
              })
            )
          }
        )
      ]).pipe(
        HttpRouter.serve,
        Layer.build
      )

      const client = yield* HttpClient.HttpClient
      const body = yield* HttpClientRequest.post("/test-sse").pipe(
        (req) => client.execute(req),
        Effect.flatMap((r) => r.text)
      )

      expect(body.length).toBeGreaterThan(0)
      expect(body).toContain("turn.started")
      expect(body).toContain("assistant.delta")
      expect(body).toContain("turn.completed")
      expect(body).toContain("hello")
    }).pipe(Effect.provide(NodeHttpServer.layerTest)))

  it.live("initialize channel + send message returns SSE stream", () => {
    const dbPath = testDatabasePath("e2e-send")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      const createStatus = yield* client.execute(createReq).pipe(
        Effect.map((r) => r.status),
        Effect.scoped
      )
      expect(createStatus).toBe(200)

      const sendReq = yield* HttpClientRequest.post(`/channels/${channelId}/messages`).pipe(
        HttpClientRequest.bodyJson({ content: "hello" })
      )
      const body = yield* client.execute(sendReq).pipe(
        Effect.flatMap((r) => r.text)
      )

      expect(body.length).toBeGreaterThan(0)
      expect(body).toContain("turn.started")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("send message e2e emits checkpoint_required and terminal completed(false)", () => {
    const dbPath = testDatabasePath("e2e-checkpoint-stream")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      const sendReq = yield* HttpClientRequest.post(`/channels/${channelId}/messages`).pipe(
        HttpClientRequest.bodyJson({ content: "checkpoint please" })
      )
      const body = yield* client.execute(sendReq).pipe(
        Effect.flatMap((r) => r.text)
      )

      expect(body).toContain("turn.checkpoint_required")
      expect(body).toContain("turn.completed")
      expect(body).toContain("\"accepted\":false")
      expect(body).toContain("turn_processing_checkpoint_required")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("send message e2e surfaces provider credit exhaustion as a specific failure", () => {
    const dbPath = testDatabasePath("e2e-credit-failure")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      const sendReq = yield* HttpClientRequest.post(`/channels/${channelId}/messages`).pipe(
        HttpClientRequest.bodyJson({ content: "credit fail please" })
      )
      const body = yield* client.execute(sendReq).pipe(
        Effect.flatMap((r) => r.text)
      )

      expect(body).toContain("turn.failed")
      expect(body).toContain("provider_credit_exhausted")
      expect(body).not.toContain("session_entity_stream_error")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("checkpoint decide e2e approved replay transitions checkpoint to Consumed", () => {
    const dbPath = testDatabasePath("e2e-checkpoint-decide")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const requestedAt = DateTime.fromDateUnsafe(new Date("2026-02-28T00:00:00.000Z"))
      const replayPayload = {
        replayPayloadVersion: 1,
        kind: "ReadMemory",
        content: "replay approved request",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "replay approved request" }],
        turnContext: {
          agentId: "agent:bootstrap",
          sessionId,
          conversationId,
          channelId,
          turnId: "turn:blocked",
          createdAt: "2026-02-28T00:00:00.000Z"
        }
      } as const
      const payloadJson = encodeJson(replayPayload)
      const payloadHash = yield* makeCheckpointPayloadHash("ReadMemory", replayPayload)

      const checkpointRecord: CheckpointRecord = {
        checkpointId,
        agentId: "agent:bootstrap" as any,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "approval required",
        payloadJson,
        payloadHash,
        status: "Pending",
        requestedAt,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      }
      yield* seedCheckpoint(dbPath, checkpointRecord)

      const decideReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Approved", decidedBy: "user:cli:local" })
      )
      const decideResponse = yield* client.execute(decideReq)
      const decideBody = yield* decideResponse.text
      expect(decideResponse.status).toBe(200)

      expect(decideBody).toContain("turn.completed")
      const getCheckpointResponse = yield* client.get(`/checkpoints/${checkpointId}`)
      expect(getCheckpointResponse.status).toBe(200)
      const persisted = (yield* getCheckpointResponse.json) as Record<string, unknown>
      expect(persisted.status).toBe("Consumed")
      expect(persisted.decidedBy).toBe("user:cli:local")
      expect(persisted.consumedBy).toBe("user:cli:local")
      expect(typeof persisted.consumedAt === "string" && persisted.consumedAt.length > 0).toBe(true)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("checkpoint decide returns 400 for malformed JSON payload", () => {
    const dbPath = testDatabasePath("e2e-checkpoint-decide-invalid-json")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const requestedAt = DateTime.fromDateUnsafe(new Date("2026-02-28T00:00:00.000Z"))

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      const payloadJson = encodeJson({
        replayPayloadVersion: 1,
        kind: "ReadMemory",
        content: "replay approved request",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "replay approved request" }],
        turnContext: {
          agentId: "agent:bootstrap",
          sessionId,
          conversationId,
          channelId,
          turnId: "turn:blocked",
          createdAt: "2026-02-28T00:00:00.000Z"
        }
      })

      yield* seedCheckpoint(dbPath, {
        checkpointId,
        agentId: "agent:bootstrap" as any,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "approval required",
        payloadJson,
        payloadHash: "irrelevant-for-mock-runtime",
        status: "Pending",
        requestedAt,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      const decideReq = HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyText("{\"decision\":\"Approved\",", "application/json")
      )
      const decideResponse = yield* client.execute(decideReq)
      expect(decideResponse.status).toBe(400)
      const body = (yield* decideResponse.json) as Record<string, unknown>
      expect(body.error).toBe("BadRequest")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("checkpoint decide returns 400 when decidedBy is blank after trim", () => {
    const dbPath = testDatabasePath("e2e-checkpoint-decide-blank-decider")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const requestedAt = DateTime.fromDateUnsafe(new Date("2026-02-28T00:00:00.000Z"))

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      const payloadJson = encodeJson({
        replayPayloadVersion: 1,
        kind: "ReadMemory",
        content: "replay approved request",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "replay approved request" }],
        turnContext: {
          agentId: "agent:bootstrap",
          sessionId,
          conversationId,
          channelId,
          turnId: "turn:blocked",
          createdAt: "2026-02-28T00:00:00.000Z"
        }
      })

      yield* seedCheckpoint(dbPath, {
        checkpointId,
        agentId: "agent:bootstrap" as any,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "approval required",
        payloadJson,
        payloadHash: "irrelevant-for-mock-runtime",
        status: "Pending",
        requestedAt,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      const decideReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Approved", decidedBy: "   " })
      )
      const decideResponse = yield* client.execute(decideReq)
      expect(decideResponse.status).toBe(400)
      const body = (yield* decideResponse.json) as Record<string, unknown>
      expect(body.error).toBe("BadRequest")
      expect(String(body.message)).toContain("decidedBy must be a non-empty string")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("checkpoint decide Rejected returns ack and persists Rejected status", () => {
    const dbPath = testDatabasePath("e2e-checkpoint-decide-rejected")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const requestedAt = DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z"))

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      yield* seedCheckpoint(dbPath, {
        checkpointId,
        agentId: "agent:bootstrap" as any,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "approval required",
        payloadJson: encodeJson({
          replayPayloadVersion: 1,
          kind: "ReadMemory",
          content: "x",
          contentBlocks: [{ contentBlockType: "TextBlock", text: "x" }],
          turnContext: {
            agentId: "agent:bootstrap",
            sessionId,
            conversationId,
            channelId,
            turnId: "turn:blocked",
            createdAt: "2026-03-02T00:00:00.000Z"
          }
        }),
        payloadHash: "irrelevant-for-mock-runtime",
        status: "Pending",
        requestedAt,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      const decideReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Rejected", decidedBy: "user:cli:local" })
      )
      const decideResponse = yield* client.execute(decideReq)
      expect(decideResponse.status).toBe(200)
      const body = (yield* decideResponse.json) as Record<string, unknown>
      expect(body.ok).toBe(true)

      const persistedResponse = yield* client.get(`/checkpoints/${checkpointId}`)
      expect(persistedResponse.status).toBe(200)
      const persisted = (yield* persistedResponse.json) as Record<string, unknown>
      expect(persisted.status).toBe("Rejected")
      expect(persisted.decidedBy).toBe("user:cli:local")
      expect(persisted.consumedAt).toBeNull()
      expect(persisted.consumedBy).toBeNull()
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("checkpoint decide Deferred returns ack and persists Deferred status", () => {
    const dbPath = testDatabasePath("e2e-checkpoint-decide-deferred")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const requestedAt = DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z"))

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      yield* seedCheckpoint(dbPath, {
        checkpointId,
        agentId: "agent:bootstrap" as any,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "approval required",
        payloadJson: encodeJson({
          replayPayloadVersion: 1,
          kind: "ReadMemory",
          content: "x",
          contentBlocks: [{ contentBlockType: "TextBlock", text: "x" }],
          turnContext: {
            agentId: "agent:bootstrap",
            sessionId,
            conversationId,
            channelId,
            turnId: "turn:blocked",
            createdAt: "2026-03-02T00:00:00.000Z"
          }
        }),
        payloadHash: "irrelevant-for-mock-runtime",
        status: "Pending",
        requestedAt,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      const decideReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Deferred", decidedBy: "user:cli:local" })
      )
      const decideResponse = yield* client.execute(decideReq)
      expect(decideResponse.status).toBe(200)
      const body = (yield* decideResponse.json) as Record<string, unknown>
      expect(body.ok).toBe(true)

      const persistedResponse = yield* client.get(`/checkpoints/${checkpointId}`)
      expect(persistedResponse.status).toBe(200)
      const persisted = (yield* persistedResponse.json) as Record<string, unknown>
      expect(persisted.status).toBe("Deferred")
      expect(persisted.decidedBy).toBe("user:cli:local")
      expect(persisted.consumedAt).toBeNull()
      expect(persisted.consumedBy).toBeNull()
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("DELETE /channels/:channelId clears session history and pending checkpoints", () => {
    const dbPath = testDatabasePath("e2e-delete-channel")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const requestedAt = DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z"))

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      const sendReq = yield* HttpClientRequest.post(`/channels/${channelId}/messages`).pipe(
        HttpClientRequest.bodyJson({ content: "persist this turn" })
      )
      yield* client.execute(sendReq).pipe(
        Effect.flatMap((response) => response.text)
      )

      yield* seedCheckpoint(dbPath, {
        checkpointId,
        agentId: "agent:bootstrap" as any,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "approval required",
        payloadJson: encodeJson({
          replayPayloadVersion: 1,
          kind: "ReadMemory",
          content: "pwd",
          contentBlocks: [{ contentBlockType: "TextBlock", text: "pwd" }],
          turnContext: {
            agentId: "agent:bootstrap",
            sessionId,
            conversationId,
            channelId,
            turnId: "turn:blocked",
            createdAt: "2026-03-02T00:00:00.000Z"
          }
        }),
        payloadHash: "delete-route-checkpoint-hash",
        status: "Pending",
        requestedAt,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      const deleteResponse = yield* client.execute(
        HttpClientRequest.delete(`/channels/${channelId}`)
      )
      expect(deleteResponse.status).toBe(200)
      const deleteBody = (yield* deleteResponse.json) as Record<string, unknown>
      expect(deleteBody.ok).toBe(true)

      const deletedHistoryResponse = yield* client.get(`/channels/${channelId}/history`)
      expect(deletedHistoryResponse.status).toBe(404)

      const pendingResponse = yield* client.get("/checkpoints/pending?agentId=agent:bootstrap")
      expect(pendingResponse.status).toBe(200)
      const pendingBody = (yield* pendingResponse.json) as {
        readonly items: ReadonlyArray<{ readonly checkpointId: string }>
      }
      expect(pendingBody.items.some((item) => item.checkpointId === checkpointId)).toBe(false)

      const channelsResponse = yield* client.get("/channels?agentId=agent:bootstrap")
      expect(channelsResponse.status).toBe(200)
      const channelsBody = (yield* channelsResponse.json) as {
        readonly items: ReadonlyArray<{ readonly channelId: string }>
      }
      expect(channelsBody.items.some((item) => item.channelId === channelId)).toBe(false)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("DELETE /channels/:channelId returns 404 for unknown channel", () => {
    const dbPath = testDatabasePath("e2e-delete-channel-notfound")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const response = yield* client.execute(
        HttpClientRequest.delete(`/channels/${channelId}`)
      )
      expect(response.status).toBe(404)
      const body = (yield* response.json) as Record<string, unknown>
      expect(body.error).toBe("ChannelNotFound")
      expect(body.channelId).toBe(channelId)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initialize channel via entity route returns 200", () => {
    const dbPath = testDatabasePath("e2e-create")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      const response = yield* client.execute(createReq)
      expect(response.status).toBe(200)
      const body = yield* response.json
      expect(body).toEqual({ ok: true })
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initialize supports WebChat channel type and WebChat capabilities", () => {
    const dbPath = testDatabasePath("e2e-create-webchat")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "WebChat", agentId: "agent:bootstrap" })
      )
      const createResponse = yield* client.execute(createReq)
      expect(createResponse.status).toBe(200)

      const statusResponse = yield* client.get(`/channels/${channelId}/status`)
      expect(statusResponse.status).toBe(200)
      const status = (yield* statusResponse.json) as {
        readonly channelType: string
        readonly capabilities: ReadonlyArray<string>
      }
      expect(status.channelType).toBe("WebChat")
      expect(status.capabilities).toEqual(["SendText", "Typing", "StreamingDelivery"])
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("get history endpoint returns array for created channel", () => {
    const dbPath = testDatabasePath("e2e-history")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId

      const createReq = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      yield* client.execute(createReq).pipe(Effect.scoped)

      const historyResponse = yield* client.get(`/channels/${channelId}/history`)
      expect(historyResponse.status).toBe(200)
      const turns = (yield* historyResponse.json) as Array<unknown>

      expect(Array.isArray(turns)).toBe(true)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initialize supports attachTo so channels can share session history", () => {
    const dbPath = testDatabasePath("e2e-init-attach-to-session")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelA = `channel:${crypto.randomUUID()}` as ChannelId
      const channelB = `channel:${crypto.randomUUID()}` as ChannelId

      const initAReq = yield* HttpClientRequest.post(`/channels/${channelA}/initialize`).pipe(
        HttpClientRequest.bodyJson({ channelType: "CLI", agentId: "agent:bootstrap" })
      )
      const initAResp = yield* client.execute(initAReq)
      expect(initAResp.status).toBe(200)

      const statusAResp = yield* client.get(`/channels/${channelA}/status`)
      expect(statusAResp.status).toBe(200)
      const statusA = (yield* statusAResp.json) as {
        readonly activeSessionId: SessionId
      }

      const initBReq = yield* HttpClientRequest.post(`/channels/${channelB}/initialize`).pipe(
        HttpClientRequest.bodyJson({
          channelType: "CLI",
          agentId: "agent:bootstrap",
          attachTo: { sessionId: statusA.activeSessionId }
        })
      )
      const initBResp = yield* client.execute(initBReq)
      expect(initBResp.status).toBe(200)

      const statusBResp = yield* client.get(`/channels/${channelB}/status`)
      expect(statusBResp.status).toBe(200)
      const statusB = (yield* statusBResp.json) as {
        readonly activeSessionId: SessionId
      }
      expect(statusB.activeSessionId).toBe(statusA.activeSessionId)

      const sendAReq = yield* HttpClientRequest.post(`/channels/${channelA}/messages`).pipe(
        HttpClientRequest.bodyJson({ content: "shared history message a" })
      )
      const sendABody = yield* client.execute(sendAReq).pipe(
        Effect.flatMap((response) => response.text)
      )

      const sendBReq = yield* HttpClientRequest.post(`/channels/${channelB}/messages`).pipe(
        HttpClientRequest.bodyJson({ content: "shared history message b" })
      )
      const sendBBody = yield* client.execute(sendBReq).pipe(
        Effect.flatMap((response) => response.text)
      )

      expect(sendABody).toContain(`"sessionId":"${statusA.activeSessionId}"`)
      expect(sendBBody).toContain(`"sessionId":"${statusA.activeSessionId}"`)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initialize returns 404 when attachTo session does not exist", () => {
    const dbPath = testDatabasePath("e2e-init-attach-missing-session")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(AllRoutesLayer, { disableLogger: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const missingSessionId = "session:missing-route-attach" as SessionId

      const request = yield* HttpClientRequest.post(`/channels/${channelId}/initialize`).pipe(
        HttpClientRequest.bodyJson({
          channelType: "CLI",
          agentId: "agent:bootstrap",
          attachTo: { sessionId: missingSessionId }
        })
      )
      const response = yield* client.execute(request)
      expect(response.status).toBe(404)
      const body = (yield* response.json) as Record<string, unknown>
      expect(body.error).toBe("SessionNotFound")
      expect(body.sessionId).toBe(missingSessionId)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})
