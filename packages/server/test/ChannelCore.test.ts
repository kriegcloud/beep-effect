import { describe, expect, it } from "@effect/vitest"
import type { TurnStreamEvent } from "@template/domain/events"
import type { AgentId, ChannelId, CheckpointId, ConversationId, MessageId, SessionId, TurnId } from "@template/domain/ids"
import type { AgentStatePort, ChannelPort, CheckpointPort, CheckpointRecord, SessionTurnPort, TurnRecord } from "@template/domain/ports"
import { DateTime, Effect, Layer, Schema, ServiceMap, Stream } from "effect"
import { Sharding } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { ChannelCore } from "../src/ChannelCore.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { makeCheckpointPayloadHash } from "../src/checkpoints/ReplayHash.js"
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

const encodeJson = Schema.encodeSync(Schema.UnknownFromJsonString)

// ---------------------------------------------------------------------------
// Test layer — SQLite-backed ports + mock runtime + ChannelCore
// ---------------------------------------------------------------------------

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

const makeTestLayer = (
  dbPath: string,
  options?: {
    readonly toolRegistryOverride?: ServiceMap.Service.Shape<typeof ToolRegistry>
  }
) => {
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

  const mockRuntimeLayer = makeMockTurnProcessingRuntime().pipe(
    Layer.provide(sessionTurnTagLayer)
  )
  const toolRegistryStubLayer = Layer.succeed(
    ToolRegistry,
    options?.toolRegistryOverride ?? ({
      makeToolkit: () => Effect.die("ToolRegistry.makeToolkit not used in ChannelCore tests"),
      executeApprovedCheckpointTool: () =>
        Effect.die("ToolRegistry.executeApprovedCheckpointTool not used in ChannelCore tests")
    } as any)
  )

  // Provide a mock Sharding that does NOT have makeClient,
  // so ChannelCore falls back to the direct TurnProcessingRuntime.
  const mockShardingLayer = Layer.succeed(Sharding.Sharding, {} as any)

  const channelCoreLayer = ChannelCore.layer.pipe(
    Layer.provide(agentStateTagLayer),
    Layer.provide(channelPortTagLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(checkpointPortTagLayer),
    Layer.provide(mockRuntimeLayer),
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
    mockRuntimeLayer,
    channelCoreLayer
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
// Tests
// ---------------------------------------------------------------------------

describe("ChannelCore", () => {
  it.effect("initializeChannel creates channel + session + agent state", () => {
    const dbPath = testDatabasePath("core-init")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-init" as ChannelId

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:core-test" as AgentId,
        capabilities: ["SendText"]
      })

      // Verify channel was created
      const channelPort = yield* ChannelPortSqlite
      const channel = yield* channelPort.get(channelId)
      expect(channel).not.toBeNull()
      expect(channel!.channelType).toBe("CLI")
      expect(channel!.agentId).toBe("agent:core-test")
      expect(channel!.capabilities).toEqual(["SendText"])

      // Verify agent state was created
      const agentStatePort = yield* AgentStatePortSqlite
      const agentState = yield* agentStatePort.get("agent:core-test" as AgentId)
      expect(agentState).not.toBeNull()
      expect(agentState!.permissionMode).toBe("Standard")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initializeChannel is idempotent", () => {
    const dbPath = testDatabasePath("core-idempotent")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-idempotent" as ChannelId

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:core-idempotent" as AgentId,
        capabilities: ["SendText"]
      })

      const channelPort = yield* ChannelPortSqlite
      const first = yield* channelPort.get(channelId)
      expect(first).not.toBeNull()
      const firstSessionId = first!.activeSessionId

      // Call initializeChannel again — should be no-op
      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:core-idempotent" as AgentId,
        capabilities: ["SendText"]
      })

      const second = yield* channelPort.get(channelId)
      expect(second).not.toBeNull()
      expect(second!.activeSessionId).toBe(firstSessionId)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initializeChannel with different capabilities", () => {
    const dbPath = testDatabasePath("core-caps")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-caps" as ChannelId

      yield* core.initializeChannel({
        channelId,
        channelType: "WebChat",
        agentId: "agent:core-caps" as AgentId,
        capabilities: ["SendText", "Typing", "StreamingDelivery"]
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

  it.effect("buildTurnPayload returns valid payload for existing channel", () => {
    const dbPath = testDatabasePath("core-payload")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-payload" as ChannelId

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:core-payload" as AgentId,
        capabilities: ["SendText"]
      })

      const payload = yield* core.buildTurnPayload({
        channelId,
        content: "hello world",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "hello world" }],
        userId: "user:test"
      })

      expect(payload.turnId).toMatch(/^turn:/)
      expect(payload.sessionId).toBe(`session:${channelId}`)
      expect(payload.conversationId).toBe(`conv:${channelId}`)
      expect(payload.agentId).toBe("agent:core-payload")
      expect(payload.content).toBe("hello world")
      expect(payload.contentBlocks).toEqual([{ contentBlockType: "TextBlock", text: "hello world" }])
      expect(payload.inputTokens).toBe(6)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("buildTurnPayload fails with ChannelNotFound for missing channel", () => {
    const dbPath = testDatabasePath("core-payload-notfound")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:nonexistent" as ChannelId

      const error = yield* core.buildTurnPayload({
        channelId,
        content: "this should fail",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "this should fail" }],
        userId: "user:test"
      }).pipe(Effect.flip)

      expect(error._tag).toBe("ChannelNotFound")
      expect(error.channelId).toBe(channelId)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("getHistory returns empty for new channel", () => {
    const dbPath = testDatabasePath("core-history-empty")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-history" as ChannelId

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:core-history" as AgentId,
        capabilities: ["SendText"]
      })

      const history = yield* core.getHistory(channelId)
      expect(history).toEqual([])
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("getHistory fails with ChannelNotFound for missing channel", () => {
    const dbPath = testDatabasePath("core-history-notfound")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:nonexistent" as ChannelId

      const error = yield* core.getHistory(channelId).pipe(Effect.flip)

      expect(error._tag).toBe("ChannelNotFound")
      expect(error.channelId).toBe(channelId)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("re-init with different channelType fails with ChannelTypeMismatch", () => {
    const dbPath = testDatabasePath("core-type-mismatch")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-type-mismatch" as ChannelId

      // First init as CLI
      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:type-mismatch" as AgentId,
        capabilities: ["SendText"]
      })

      // Re-init as WebChat — should fail
      const error = yield* core.initializeChannel({
        channelId,
        channelType: "WebChat",
        agentId: "agent:type-mismatch" as AgentId,
        capabilities: ["SendText", "Typing", "StreamingDelivery"]
      }).pipe(Effect.flip)

      expect(error._tag).toBe("ChannelTypeMismatch")
      if (error._tag !== "ChannelTypeMismatch") {
        throw new Error(`unexpected error tag: ${error._tag}`)
      }
      expect(error.channelId).toBe(channelId)
      expect(error.existingType).toBe("CLI")
      expect(error.requestedType).toBe("WebChat")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("re-init with different agentId fails with ChannelTypeMismatch", () => {
    const dbPath = testDatabasePath("core-agent-mismatch")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-agent-mismatch" as ChannelId

      // First init with agent:a
      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:a" as AgentId,
        capabilities: ["SendText"]
      })

      // Re-init with agent:b — should fail
      const error = yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:b" as AgentId,
        capabilities: ["SendText"]
      }).pipe(Effect.flip)

      expect(error._tag).toBe("ChannelTypeMismatch")
      if (error._tag !== "ChannelTypeMismatch") {
        throw new Error(`unexpected error tag: ${error._tag}`)
      }
      expect(error.channelId).toBe(channelId)
      expect(error.existingType).toBe("agent:a")
      expect(error.requestedType).toBe("agent:b")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("cross-channel isolation: same agent, different channels have independent sessions", () => {
    const dbPath = testDatabasePath("cross-channel")
    return Effect.gen(function*() {
      const core = yield* ChannelCore

      // Initialize two channels with the same agentId
      yield* core.initializeChannel({
        channelId: "channel:a" as ChannelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })
      yield* core.initializeChannel({
        channelId: "channel:b" as ChannelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      // Send message on channel A
      const payloadA = yield* core.buildTurnPayload({
        channelId: "channel:a" as ChannelId,
        content: "hello A",
        contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "hello A" }],
        userId: "user:cli:local"
      })
      yield* core.processTurn(payloadA).pipe(Stream.runCollect)

      // Check histories are independent
      const historyA = yield* core.getHistory("channel:a" as ChannelId)
      const historyB = yield* core.getHistory("channel:b" as ChannelId)

      expect(historyA.length).toBeGreaterThan(0)
      expect(historyB.length).toBe(0) // No messages on channel B
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initializeChannel can attach a second channel to an existing session", () => {
    const dbPath = testDatabasePath("core-attach-session")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelPort = yield* ChannelPortSqlite
      const channelA = "channel:attach:a" as ChannelId
      const channelB = "channel:attach:b" as ChannelId

      yield* core.initializeChannel({
        channelId: channelA,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      const first = yield* channelPort.get(channelA)
      expect(first).not.toBeNull()

      yield* core.initializeChannel({
        channelId: channelB,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"],
        attachTo: { sessionId: first!.activeSessionId }
      })

      const second = yield* channelPort.get(channelB)
      expect(second).not.toBeNull()
      expect(second!.activeSessionId).toBe(first!.activeSessionId)
      expect(second!.activeConversationId).toBe(first!.activeConversationId)

      const payloadA = yield* core.buildTurnPayload({
        channelId: channelA,
        content: "shared history",
        contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "shared history" }],
        userId: "user:cli:local"
      })
      yield* core.processTurn(payloadA).pipe(Stream.runCollect)

      const historyA = yield* core.getHistory(channelA)
      const historyB = yield* core.getHistory(channelB)

      expect(historyA.length).toBeGreaterThan(0)
      expect(historyB).toEqual(historyA)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("initializeChannel attachTo fails when session does not exist", () => {
    const dbPath = testDatabasePath("core-attach-missing-session")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const missingSessionId = "session:missing-attach-target" as SessionId

      const error = yield* core.initializeChannel({
        channelId: "channel:attach:missing" as ChannelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"],
        attachTo: { sessionId: missingSessionId }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("SessionNotFound")
      if (error._tag !== "SessionNotFound") {
        throw new Error(`unexpected error tag: ${error._tag}`)
      }
      expect(error.sessionId).toBe(missingSessionId)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("history after processed turn contains user and assistant turns", () => {
    const dbPath = testDatabasePath("history-after-turn")
    return Effect.gen(function*() {
      const core = yield* ChannelCore

      yield* core.initializeChannel({
        channelId: "channel:hist" as ChannelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      const payload = yield* core.buildTurnPayload({
        channelId: "channel:hist" as ChannelId,
        content: "test message",
        contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "test message" }],
        userId: "user:cli:local"
      })
      yield* core.processTurn(payload).pipe(Stream.runCollect)

      const history = yield* core.getHistory("channel:hist" as ChannelId)

      // Should have at least user turn + assistant turn
      expect(history.length).toBeGreaterThanOrEqual(2)
      const roles = history.map((t) => t.participantRole)
      expect(roles).toContain("UserRole")
      expect(roles).toContain("AssistantRole")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("deleteChannel clears channel, active session turns, and checkpoints", () => {
    const dbPath = testDatabasePath("core-delete-channel")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelPort = yield* ChannelPortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const checkpointPort = yield* CheckpointPortSqlite
      const channelId = "channel:core-delete" as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      const payload = yield* core.buildTurnPayload({
        channelId,
        content: "message before delete",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "message before delete" }],
        userId: "user:cli:local"
      })
      yield* core.processTurn(payload).pipe(Stream.runCollect)

      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const now = DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z"))

      yield* checkpointPort.create({
        checkpointId,
        agentId: "agent:bootstrap" as AgentId,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "requires approval",
        payloadJson: encodeJson({
          replayPayloadVersion: 1,
          kind: "ReadMemory",
          content: "ls -la",
          contentBlocks: [{ contentBlockType: "TextBlock", text: "ls -la" }],
          turnContext: {
            agentId: "agent:bootstrap",
            sessionId,
            conversationId,
            channelId,
            turnId: "turn:blocked",
            createdAt: "2026-03-02T00:00:00.000Z"
          }
        }),
        payloadHash: "checkpoint-delete-hash",
        status: "Pending",
        requestedAt: now,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      yield* core.deleteChannel(channelId)

      const deletedChannel = yield* channelPort.get(channelId)
      const deletedSession = yield* sessionPort.getSession(sessionId)
      const deletedTurns = yield* sessionPort.listTurns(sessionId)
      const deletedCheckpoint = yield* checkpointPort.get(checkpointId)

      expect(deletedChannel).toBeNull()
      expect(deletedSession).toBeNull()
      expect(deletedTurns).toEqual([])
      expect(deletedCheckpoint).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("deleteChannel fails with ChannelNotFound when channel does not exist", () => {
    const dbPath = testDatabasePath("core-delete-notfound")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const error = yield* core.deleteChannel("channel:missing" as ChannelId).pipe(Effect.flip)
      expect(error._tag).toBe("ChannelNotFound")
      expect(error.channelId).toBe("channel:missing")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("processTurn streams events using direct runtime fallback in test", () => {
    const dbPath = testDatabasePath("core-process")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const channelId = "channel:core-process" as ChannelId

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:core-process" as AgentId,
        capabilities: ["SendText"]
      })

      const payload = yield* core.buildTurnPayload({
        channelId,
        content: "hello from core",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "hello from core" }],
        userId: "user:test"
      })

      const events = yield* core.processTurn(payload).pipe(Stream.runCollect)

      expect(events.length).toBeGreaterThan(0)
      expect(events[0]?.type).toBe("turn.started")
      expect(events.some((e) => e.type === "assistant.delta")).toBe(true)
      expect(events.some((e) => e.type === "turn.completed")).toBe(true)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("approved checkpoint replay transitions to Consumed after successful stream", () => {
    const dbPath = testDatabasePath("core-checkpoint-consumed")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const checkpointPort = yield* CheckpointPortSqlite
      const channelId = "channel:core-checkpoint" as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const now = DateTime.fromDateUnsafe(new Date("2026-02-28T00:00:00.000Z"))

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const replayPayload = {
        replayPayloadVersion: 1,
        kind: "ReadMemory",
        content: "run ls -la",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "run ls -la" }],
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
        agentId: "agent:bootstrap" as AgentId,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "requires approval",
        payloadJson,
        payloadHash,
        status: "Pending",
        requestedAt: now,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      }
      yield* checkpointPort.create(checkpointRecord)

      const decision = yield* core.decideCheckpoint({
        checkpointId,
        decision: "Approved",
        decidedBy: "user:cli:local"
      })

      expect(decision.kind).toBe("stream")
      if (decision.kind !== "stream") {
        return
      }

      const events = yield* decision.stream.pipe(Stream.runCollect)
      expect(events.some((event) => event.type === "turn.completed")).toBe(true)

      const persisted = yield* checkpointPort.get(checkpointId)
      expect(persisted).not.toBeNull()
      expect(persisted!.status).toBe("Consumed")
      expect(persisted!.decidedBy).toBe("user:cli:local")
      expect(persisted!.consumedBy).toBe("user:cli:local")
      expect(persisted!.consumedAt).not.toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("approved checkpoint replay is retryable while checkpoint is still Approved and unconsumed", () => {
    const dbPath = testDatabasePath("core-checkpoint-retry-approved")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const checkpointPort = yield* CheckpointPortSqlite
      const channelId = "channel:core-checkpoint-retry" as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const now = DateTime.fromDateUnsafe(new Date("2026-02-28T00:00:00.000Z"))

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      const sessionId = `session:${channelId}` as SessionId
      const checkpointRecord: CheckpointRecord = {
        checkpointId,
        agentId: "agent:bootstrap" as AgentId,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "requires approval",
        payloadJson: "{not-valid-json",
        payloadHash: "read-memory-hash",
        status: "Pending",
        requestedAt: now,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      }
      yield* checkpointPort.create(checkpointRecord)

      const firstDecision = yield* core.decideCheckpoint({
        checkpointId,
        decision: "Approved",
        decidedBy: "user:cli:local"
      })

      expect(firstDecision.kind).toBe("stream")
      if (firstDecision.kind !== "stream") {
        return
      }

      const firstFailure = yield* firstDecision.stream.pipe(Stream.runCollect, Effect.flip)
      expect(firstFailure._tag).toBe("TurnModelFailure")
      if (firstFailure._tag === "TurnModelFailure") {
        expect(firstFailure.reason).toBe("checkpoint_payload_invalid")
      }

      const persistedAfterFirstReplay = yield* checkpointPort.get(checkpointId)
      expect(persistedAfterFirstReplay).not.toBeNull()
      expect(persistedAfterFirstReplay!.status).toBe("Approved")
      expect(persistedAfterFirstReplay!.consumedAt).toBeNull()

      const secondDecision = yield* core.decideCheckpoint({
        checkpointId,
        decision: "Approved",
        decidedBy: "user:cli:local"
      })

      expect(secondDecision.kind).toBe("stream")
      if (secondDecision.kind !== "stream") {
        return
      }

      const secondFailure = yield* secondDecision.stream.pipe(Stream.runCollect, Effect.flip)
      expect(secondFailure._tag).toBe("TurnModelFailure")
      if (secondFailure._tag === "TurnModelFailure") {
        expect(secondFailure.reason).toBe("checkpoint_payload_invalid")
      }

      const persistedAfterSecondReplay = yield* checkpointPort.get(checkpointId)
      expect(persistedAfterSecondReplay).not.toBeNull()
      expect(persistedAfterSecondReplay!.status).toBe("Approved")
      expect(persistedAfterSecondReplay!.consumedAt).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("InvokeTool replay payload must include supported replayPayloadVersion", () => {
    const dbPath = testDatabasePath("core-checkpoint-invoke-version")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const checkpointPort = yield* CheckpointPortSqlite
      const channelId = "channel:core-checkpoint-invoke-version" as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const now = DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z"))

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const payloadJson = encodeJson({
        // Intentionally missing replayPayloadVersion
        kind: "InvokeTool",
        toolName: "shell_execute",
        inputJson: encodeJson({ command: "pwd" }),
        turnContext: {
          agentId: "agent:bootstrap",
          sessionId,
          conversationId,
          channelId,
          turnId: "turn:blocked",
          createdAt: "2026-03-02T00:00:00.000Z"
        }
      })

      yield* checkpointPort.create({
        checkpointId,
        agentId: "agent:bootstrap" as AgentId,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "InvokeTool",
        policyId: null,
        reason: "requires approval",
        payloadJson,
        payloadHash: "invoke-tool-hash",
        status: "Pending",
        requestedAt: now,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      const decision = yield* core.decideCheckpoint({
        checkpointId,
        decision: "Approved",
        decidedBy: "user:cli:local"
      })

      expect(decision.kind).toBe("stream")
      if (decision.kind !== "stream") {
        return
      }

      const failure = yield* decision.stream.pipe(Stream.runCollect, Effect.flip)
      expect(failure._tag).toBe("TurnModelFailure")
      if (failure._tag === "TurnModelFailure") {
        expect(failure.reason).toBe("checkpoint_payload_invalid")
      }

      const persisted = yield* checkpointPort.get(checkpointId)
      expect(persisted).not.toBeNull()
      expect(persisted!.status).toBe("Approved")
      expect(persisted!.consumedAt).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("InvokeTool replay tool-execution failure keeps checkpoint Approved for retry", () => {
    const dbPath = testDatabasePath("core-checkpoint-invoke-tool-failure")
    return Effect.gen(function*() {
      const core = yield* ChannelCore
      const checkpointPort = yield* CheckpointPortSqlite
      const channelId = "channel:core-checkpoint-invoke-fail" as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      const now = DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z"))

      yield* core.initializeChannel({
        channelId,
        channelType: "CLI",
        agentId: "agent:bootstrap" as AgentId,
        capabilities: ["SendText"]
      })

      const sessionId = `session:${channelId}` as SessionId
      const conversationId = `conv:${channelId}` as ConversationId
      const replayPayload = {
        replayPayloadVersion: 1,
        kind: "InvokeTool",
        toolName: "shell_execute",
        inputJson: encodeJson({ command: "pwd" }),
        turnContext: {
          agentId: "agent:bootstrap",
          sessionId,
          conversationId,
          channelId,
          turnId: "turn:blocked",
          createdAt: "2026-03-02T00:00:00.000Z"
        }
      } as const
      const payloadJson = encodeJson(replayPayload)
      const payloadHash = yield* makeCheckpointPayloadHash("InvokeTool", replayPayload)

      yield* checkpointPort.create({
        checkpointId,
        agentId: "agent:bootstrap" as AgentId,
        sessionId,
        channelId,
        turnId: "turn:blocked",
        action: "InvokeTool",
        policyId: null,
        reason: "requires approval",
        payloadJson,
        payloadHash,
        status: "Pending",
        requestedAt: now,
        decidedAt: null,
        decidedBy: null,
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      })

      const decision = yield* core.decideCheckpoint({
        checkpointId,
        decision: "Approved",
        decidedBy: "user:cli:local"
      })

      expect(decision.kind).toBe("stream")
      if (decision.kind !== "stream") {
        return
      }

      const failure = yield* decision.stream.pipe(Stream.runCollect, Effect.flip)
      expect(failure._tag).toBe("TurnModelFailure")
      if (failure._tag === "TurnModelFailure") {
        expect(failure.reason).toBe("checkpoint_tool_replay_failed:shell_execute")
      }

      const persisted = yield* checkpointPort.get(checkpointId)
      expect(persisted).not.toBeNull()
      expect(persisted!.status).toBe("Approved")
      expect(persisted!.consumedAt).toBeNull()
      expect(persisted!.consumedBy).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath, {
        toolRegistryOverride: {
          makeToolkit: () => Effect.die("ToolRegistry.makeToolkit not used in this test"),
          executeApprovedCheckpointTool: () =>
            Effect.succeed({
              turnId: "turn:replay:tool-failure" as TurnId,
              sessionId: "session:unused" as SessionId,
              createdAt: DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z")),
              replayPayloadVersion: 1,
              toolName: "shell_execute",
              inputJson: encodeJson({ command: "pwd" }),
              outputJson: encodeJson({
                errorCode: "ToolInvocationError",
                message: "shell execution failed"
              }),
              isError: true
            })
        } as any
      })),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})
