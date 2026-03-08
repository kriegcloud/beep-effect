import { describe, expect, it } from "@effect/vitest"
import type { TurnStreamEvent } from "@template/domain/events"
import type { AgentId, ChannelId, ConversationId, MessageId, SessionId, TurnId } from "@template/domain/ids"
import type { AgentStatePort, ChannelPort, CheckpointPort, SessionTurnPort, TurnRecord } from "@template/domain/ports"
import { Effect, Layer, Stream } from "effect"
import { Entity, Sharding, ShardingConfig } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { ChannelCore } from "../src/ChannelCore.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { layer as WebChatAdapterEntityLayer, WebChatAdapterEntity } from "../src/entities/WebChatAdapterEntity.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { AgentStatePortTag, ChannelPortTag, CheckpointPortTag, SessionTurnPortTag } from "../src/PortTags.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import type { ProcessTurnPayload } from "../src/turn/TurnProcessingWorkflow.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

// ---------------------------------------------------------------------------
// Mock TurnProcessingRuntime — also persists user + assistant turns to
// simulate what the real TurnProcessingWorkflow does.
// ---------------------------------------------------------------------------

const makeMockTurnProcessingRuntime = () =>
  Layer.effect(
    TurnProcessingRuntime,
    Effect.gen(function*() {
      const sessionTurnPort = yield* SessionTurnPortTag

      const persistTurns = (input: ProcessTurnPayload) =>
        Effect.gen(function*() {
          const userTurn: TurnRecord = {
            turnId: input.turnId as TurnId,
            sessionId: input.sessionId as SessionId,
            conversationId: input.conversationId as ConversationId,
            turnIndex: 0,
            participantRole: "UserRole",
            participantAgentId: input.agentId as AgentId,
            message: {
              messageId: (`message:${input.turnId}:user`) as MessageId,
              role: "UserRole",
              content: input.content,
              contentBlocks: input.contentBlocks.length > 0
                ? input.contentBlocks
                : [{ contentBlockType: "TextBlock" as const, text: input.content }]
            },
            modelFinishReason: null,
            modelUsageJson: null,
            createdAt: input.createdAt
          }
          yield* sessionTurnPort.appendTurn(userTurn)

          const assistantTurn: TurnRecord = {
            turnId: (`${input.turnId}:assistant`) as TurnId,
            sessionId: input.sessionId as SessionId,
            conversationId: input.conversationId as ConversationId,
            turnIndex: 0,
            participantRole: "AssistantRole",
            participantAgentId: input.agentId as AgentId,
            message: {
              messageId: (`message:${input.turnId}:assistant`) as MessageId,
              role: "AssistantRole",
              content: "mock response",
              contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "mock response" }]
            },
            modelFinishReason: "stop",
            modelUsageJson: "{}",
            createdAt: input.createdAt
          }
          yield* sessionTurnPort.appendTurn(assistantTurn)
        })

      return {
        processTurn: (input: ProcessTurnPayload) =>
          persistTurns(input).pipe(
            Effect.map(() => ({
              turnId: input.turnId,
              accepted: true,
              auditReasonCode: "turn_processing_accepted" as const,
              assistantContent: "mock response",
              assistantContentBlocks: [{ contentBlockType: "TextBlock" as const, text: "mock response" }],
              iterationsUsed: 1,
              toolCallsTotal: 0,
              iterationStats: [],
              modelFinishReason: "stop",
              modelUsageJson: "{}"
            }))
          ),
        processTurnStream: (input: ProcessTurnPayload): Stream.Stream<TurnStreamEvent> =>
          Stream.concat(
            Stream.fromEffect(persistTurns(input)).pipe(Stream.drain),
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
          )
      } as any
    })
  )

const makeTestLayer = (dbPath: string) => {
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

  const checkpointPortSqliteLayer = CheckpointPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const checkpointPortTagLayer = Layer.effect(
    CheckpointPortTag,
    Effect.gen(function*() {
      return (yield* CheckpointPortSqlite) as CheckpointPort
    })
  ).pipe(Layer.provide(checkpointPortSqliteLayer))

  const mockTurnProcessingRuntimeLayer = makeMockTurnProcessingRuntime().pipe(
    Layer.provide(sessionTurnTagLayer)
  )
  const mockShardingLayer = Layer.succeed(Sharding.Sharding, {} as any)
  const toolRegistryStubLayer = Layer.succeed(ToolRegistry, {
    makeToolkit: () => Effect.die("ToolRegistry.makeToolkit not used in WebChatAdapterEntity tests"),
    executeApprovedCheckpointTool: () =>
      Effect.die("ToolRegistry.executeApprovedCheckpointTool not used in WebChatAdapterEntity tests")
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

  const channelCoreLayer = ChannelCore.layer.pipe(
    Layer.provide(agentStateTagLayer),
    Layer.provide(channelPortTagLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(checkpointPortTagLayer),
    Layer.provide(mockTurnProcessingRuntimeLayer),
    Layer.provide(mockShardingLayer),
    Layer.provide(mockAgentConfigLayer),
    Layer.provide(toolRegistryStubLayer)
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
    ShardingConfig.layer()
  )
}

describe("WebChatAdapterEntity", () => {
  it.effect("initialize creates a WebChat channel with correct capabilities", () => {
    const dbPath = testDatabasePath("webchat-initialize")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-init" as ChannelId
      const client = yield* makeClient(channelId)

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:webchat-1",
        userId: "user:web:test"
      })

      const channelPort = yield* ChannelPortSqlite
      const channel = yield* channelPort.get(channelId)
      expect(channel).not.toBeNull()
      expect(channel!.channelType).toBe("WebChat")
      expect(channel!.capabilities).toEqual(["SendText", "Typing", "StreamingDelivery"])
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initialize is idempotent", () => {
    const dbPath = testDatabasePath("webchat-idempotent")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-idempotent" as ChannelId
      const client = yield* makeClient(channelId)

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:webchat-idempotent",
        userId: "user:web:test"
      })

      const channelPort = yield* ChannelPortSqlite
      const first = yield* channelPort.get(channelId)
      expect(first).not.toBeNull()
      const firstSessionId = first!.activeSessionId

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:webchat-idempotent",
        userId: "user:web:test"
      })

      const second = yield* channelPort.get(channelId)
      expect(second).not.toBeNull()
      expect(second!.activeSessionId).toBe(firstSessionId)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initialize always uses WebChat regardless of payload channelType", () => {
    const dbPath = testDatabasePath("webchat-always-webchat")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-forced" as ChannelId
      const client = yield* makeClient(channelId)

      // Even if we send channelType: "CLI", the adapter should use "WebChat"
      yield* client.initialize({
        channelType: "CLI",
        agentId: "agent:webchat-forced",
        userId: "user:web:test"
      })

      const channelPort = yield* ChannelPortSqlite
      const channel = yield* channelPort.get(channelId)
      expect(channel).not.toBeNull()
      expect(channel!.channelType).toBe("WebChat")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("receiveMessage returns stream of TurnStreamEvents", () => {
    const dbPath = testDatabasePath("webchat-receive")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-receive" as ChannelId
      const client = yield* makeClient(channelId)

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:webchat-receive",
        userId: "user:web:test"
      })

      const events = yield* client.receiveMessage({
        content: "hello from webchat",
        userId: "user:web:test"
      }).pipe(Stream.runCollect)

      expect(events.length).toBeGreaterThan(0)
      expect(events[0]?.type).toBe("turn.started")
      expect(events.some((e) => e.type === "assistant.delta")).toBe(true)
      expect(events.some((e) => e.type === "turn.completed")).toBe(true)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("receiveMessage to non-existent channel fails with ChannelNotFound", () => {
    const dbPath = testDatabasePath("webchat-notfound")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-nonexistent" as ChannelId
      const client = yield* makeClient(channelId)

      const error = yield* client.receiveMessage({
        content: "this should fail",
        userId: "user:web:test"
      }).pipe(Stream.runCollect, Effect.flip)

      expect(error._tag).toBe("ChannelNotFound")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("getHistory returns empty for new channel", () => {
    const dbPath = testDatabasePath("webchat-history-empty")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-history" as ChannelId
      const client = yield* makeClient(channelId)

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:webchat-history",
        userId: "user:web:test"
      })

      const history = yield* client.getHistory({})
      expect(history).toEqual([])
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("getStatus returns correct channel info", () => {
    const dbPath = testDatabasePath("webchat-status")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-status" as ChannelId
      const client = yield* makeClient(channelId)

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:webchat-status",
        userId: "user:web:test"
      })

      const status = yield* client.getStatus({})
      expect(status.channelId).toBe(channelId)
      expect(status.channelType).toBe("WebChat")
      expect(status.capabilities).toEqual(["SendText", "Typing", "StreamingDelivery"])
      expect(status.activeSessionId).toBeTruthy()
      expect(status.activeConversationId).toBeTruthy()
      expect(status.createdAt).toBeDefined()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("getStatus for non-existent channel fails with ChannelNotFound", () => {
    const dbPath = testDatabasePath("webchat-status-notfound")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:webchat-no-status" as ChannelId
      const client = yield* makeClient(channelId)

      const error = yield* client.getStatus({}).pipe(Effect.flip)
      expect(error._tag).toBe("ChannelNotFound")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("streamed events are ordered: turn.started first, turn.completed last", () => {
    const dbPath = testDatabasePath("webchat-event-order")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:event-order" as ChannelId
      const client = yield* makeClient(channelId)

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:event-order",
        userId: "user:web:test"
      })

      const events = yield* client.receiveMessage({
        content: "hello",
        userId: "user:web:test"
      }).pipe(Stream.runCollect)

      expect(events.length).toBeGreaterThanOrEqual(3)
      expect(events[0]?.type).toBe("turn.started")
      expect(events[events.length - 1]?.type).toBe("turn.completed")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("concurrent messages complete without turn index collision", () => {
    const dbPath = testDatabasePath("webchat-concurrent")
    return Effect.gen(function*() {
      // Note: This test uses Entity.makeTestClient which bypasses real sharded
      // session routing. It validates ChannelCore's serialization logic at the
      // core level, not the full sharding path.
      const makeClient = yield* Entity.makeTestClient(WebChatAdapterEntity, WebChatAdapterEntityLayer)
      const channelId = "channel:concurrent" as ChannelId
      const client = yield* makeClient(channelId)

      yield* client.initialize({
        channelType: "WebChat",
        agentId: "agent:concurrent",
        userId: "user:web:test"
      })

      // Send two messages concurrently
      const [events1, events2] = yield* Effect.all([
        client.receiveMessage({ content: "msg1", userId: "user:web:test" }).pipe(Stream.runCollect),
        client.receiveMessage({ content: "msg2", userId: "user:web:test" }).pipe(Stream.runCollect)
      ], { concurrency: 2 })

      // Both should complete with turn events
      expect(events1.length).toBeGreaterThan(0)
      expect(events2.length).toBeGreaterThan(0)

      // Verify no turn index collisions in history
      const history = yield* client.getHistory({})
      const turnIndices = history.map((t) => t.turnIndex)
      const uniqueIndices = new Set(turnIndices)
      expect(uniqueIndices.size).toBe(turnIndices.length)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
