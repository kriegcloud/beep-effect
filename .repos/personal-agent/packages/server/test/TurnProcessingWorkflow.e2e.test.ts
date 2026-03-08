import { describe, expect, it } from "@effect/vitest"
import { NodeServices } from "@effect/platform-node"
import type {
  AgentId,
  ArtifactId,
  ChannelId,
  CheckpointId,
  ConversationId,
  SessionId,
  TurnId
} from "@template/domain/ids"
import type {
  AgentState,
  AgentStatePort,
  ArtifactStorePort,
  CheckpointRecord,
  CheckpointPort,
  GovernancePort,
  Instant,
  MemoryPort,
  SessionArtifactPort,
  SessionMetricsPort,
  SessionState,
  SessionTurnPort
} from "@template/domain/ports"
import type { AuthorizationDecision } from "@template/domain/status"
import { DateTime, Effect, Layer, Schema, Stream } from "effect"
import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as Response from "effect/unstable/ai/Response"
import { ClusterWorkflowEngine, SingleRunner } from "effect/unstable/cluster"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import * as ChatPersistence from "../src/ai/ChatPersistence.js"
import { ModelRegistry } from "../src/ai/ModelRegistry.js"
import { PromptCatalog } from "../src/ai/PromptCatalog.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { layer as CliRuntimeLocalLayer } from "../src/tools/cli/CliRuntimeLocal.js"
import { layer as CommandBackendLocalLayer } from "../src/tools/command/CommandBackendLocal.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import { CommandHooksDefaultLayer } from "../src/tools/command/hooks/CommandHooksDefault.js"
import { FileHooksDefaultLayer } from "../src/tools/file/hooks/FileHooksDefault.js"
import { FilePathPolicy } from "../src/tools/file/FilePathPolicy.js"
import { FileReadTracker } from "../src/tools/file/FileReadTracker.js"
import { FileRuntime } from "../src/tools/file/FileRuntime.js"
import { ToolExecution } from "../src/tools/ToolExecution.js"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import { MemoryPortSqlite } from "../src/MemoryPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import {
  AgentStatePortTag,
  ArtifactStorePortTag,
  CheckpointPortTag,
  GovernancePortTag,
  MemoryPortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag,
  SessionTurnPortTag
} from "../src/PortTags.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { PostCommitExecutor } from "../src/turn/PostCommitExecutor.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import { makeCheckpointPayloadHash } from "../src/checkpoints/ReplayHash.js"
import {
  layer as PostCommitWorkflowLayer
} from "../src/turn/PostCommitWorkflow.js"
import {
  layer as TurnProcessingWorkflowLayer,
  type ProcessTurnPayload,
  TurnModelFailure,
  TurnPolicyDenied
} from "../src/turn/TurnProcessingWorkflow.js"

describe("TurnProcessingWorkflow e2e", () => {
  it.effect("processes one turn and persists user + assistant turns", () => {
    const dbPath = testDatabasePath("turn-happy")
    const layer = makeTurnProcessingLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const governance = yield* GovernancePortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-02-24T12:00:00.000Z")
      const agent = makeAgentState({
        agentId: "agent:happy" as AgentId,
        tokenBudget: 200,
        tokensConsumed: 0,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })
      const session = makeSessionState({
        sessionId: "session:happy" as SessionId,
        conversationId: "conversation:happy" as ConversationId,
        tokenCapacity: 500,
        tokensUsed: 0
      })
      const payload = makeTurnPayload({
        turnId: "turn:happy" as TurnId,
        agentId: agent.agentId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: now,
        inputTokens: 25,
        content: "hello from happy path"
      })

      yield* agentPort.upsert(agent)
      yield* sessionPort.startSession(session)

      const result = yield* runtime.processTurn(payload)
      const persistedSession = yield* sessionPort.getSession(session.sessionId)
      const turns = yield* sessionPort.listTurns(session.sessionId)
      const persistedAgent = yield* agentPort.get(agent.agentId)
      const audits = yield* governance.listAuditEntries()

      expect(result.accepted).toBe(true)
      expect(result.turnId).toBe("turn:happy")
      expect(result.auditReasonCode).toBe("turn_processing_accepted")
      expect(result.assistantContent).toContain("assistant")
      expect(persistedSession?.tokensUsed).toBe(25)
      expect(persistedAgent?.tokensConsumed).toBe(25)
      expect(turns).toHaveLength(2)
      expect(turns[0].participantRole).toBe("UserRole")
      expect(turns[0].message.content).toBe("hello from happy path")
      expect(turns[1].participantRole).toBe("AssistantRole")
      expect(turns[1].message.content).toContain("assistant")
      expect(audits.some((entry) => entry.reason === "turn_processing_accepted")).toBe(true)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("injects durable memory into system prompt on normal turns", () => {
    const dbPath = testDatabasePath("turn-memory-injection-normal")
    const capturedPrompts: Array<string> = []
    const layer = makeTurnProcessingLayer(dbPath, "Allow", capturedPrompts)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const memoryPort = yield* MemoryPortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-03-03T16:00:00.000Z")
      const agentId = "agent:memory-injection-normal" as AgentId
      const sessionId = "session:memory-injection-normal" as SessionId
      const conversationId = "conversation:memory-injection-normal" as ConversationId

      yield* agentPort.upsert(makeAgentState({
        agentId,
        tokenBudget: 500,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId,
        conversationId,
        tokenCapacity: 500,
        tokensUsed: 0
      }))
      yield* memoryPort.encode(
        agentId,
        [{
          tier: "SemanticMemory",
          scope: "GlobalScope",
          source: "AgentSource",
          content: "user prefers espresso",
          sensitivity: "Internal"
        }],
        now
      )

      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:memory-injection-normal" as TurnId,
        agentId,
        sessionId,
        conversationId,
        createdAt: now,
        inputTokens: 20,
        content: "hello"
      }))

      expect(result.accepted).toBe(true)
      const systemPrompt = extractSystemPromptText(capturedPrompts)
      expect(systemPrompt).toContain("## Durable Memory (Reference Data)")
      expect(systemPrompt).toContain("user prefers espresso")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("falls back to base system prompt when memory injection read fails", () => {
    const dbPath = testDatabasePath("turn-memory-injection-fallback")
    const capturedPrompts: Array<string> = []
    const failingMemoryPort: MemoryPort = {
      search: () => Effect.succeed({ items: [], cursor: null, totalCount: 0 }),
      encode: () => Effect.succeed([]),
      retrieve: () => Effect.succeed([]),
      forget: () => Effect.succeed(0),
      listAll: () => Effect.die(new Error("forced memory list failure"))
    }
    const layer = makeTurnProcessingLayer(
      dbPath,
      "Allow",
      capturedPrompts,
      undefined,
      failingMemoryPort
    )

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-03-03T17:00:00.000Z")
      const agentId = "agent:memory-injection-fallback" as AgentId
      const sessionId = "session:memory-injection-fallback" as SessionId
      const conversationId = "conversation:memory-injection-fallback" as ConversationId

      yield* agentPort.upsert(makeAgentState({
        agentId,
        tokenBudget: 500,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId,
        conversationId,
        tokenCapacity: 500,
        tokensUsed: 0
      }))

      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:memory-injection-fallback" as TurnId,
        agentId,
        sessionId,
        conversationId,
        createdAt: now,
        inputTokens: 20,
        content: "hello"
      }))

      expect(result.accepted).toBe(true)
      const systemPrompt = extractSystemPromptText(capturedPrompts)
      expect(systemPrompt).toContain("prompt:core.turn.system.default")
      expect(systemPrompt).not.toContain("## Durable Memory (Reference Data)")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("runs without post-commit outbox table after migration drop", () => {
    const dbPath = testDatabasePath("turn-no-outbox-table")
    const layer = makeTurnProcessingLayer(dbPath)

    return Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient
      const runtime = yield* TurnProcessingRuntime
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const now = instant("2026-03-03T09:00:00.000Z")

      const outboxTables = yield* sql`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = 'turn_post_commit_tasks'
      `.withoutTransform
      expect(outboxTables).toHaveLength(0)

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:no-outbox" as AgentId,
        tokenBudget: 100,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:no-outbox" as SessionId,
        conversationId: "conversation:no-outbox" as ConversationId,
        tokenCapacity: 200,
        tokensUsed: 0
      }))

      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:no-outbox" as TurnId,
        agentId: "agent:no-outbox" as AgentId,
        sessionId: "session:no-outbox" as SessionId,
        conversationId: "conversation:no-outbox" as ConversationId,
        createdAt: now,
        inputTokens: 10,
        content: "hello"
      }))

      expect(result.accepted).toBe(true)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("is idempotent by turnId and does not double-consume budget", () => {
    const dbPath = testDatabasePath("turn-idempotent")
    const layer = makeTurnProcessingLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const governance = yield* GovernancePortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-02-24T12:00:00.000Z")
      const agent = makeAgentState({
        agentId: "agent:idempotent" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })
      const session = makeSessionState({
        sessionId: "session:idempotent" as SessionId,
        conversationId: "conversation:idempotent" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      })
      const payload = makeTurnPayload({
        turnId: "turn:idempotent" as TurnId,
        agentId: agent.agentId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: now,
        inputTokens: 40,
        content: "same turn twice"
      })

      yield* agentPort.upsert(agent)
      yield* sessionPort.startSession(session)

      const first = yield* runtime.processTurn(payload)
      const second = yield* runtime.processTurn(payload)

      const turns = yield* sessionPort.listTurns(session.sessionId)
      const persistedAgent = yield* agentPort.get(agent.agentId)
      const audits = yield* governance.listAuditEntries()

      expect(first.accepted).toBe(true)
      expect(second.accepted).toBe(true)
      expect(turns).toHaveLength(2)
      expect(persistedAgent?.tokensConsumed).toBe(40)
      expect(audits.filter((entry) => entry.reason === "turn_processing_accepted")).toHaveLength(1)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("retains processed turn state across cold restart", () => {
    const dbPath = testDatabasePath("turn-restart")
    const firstLayer = makeTurnProcessingLayer(dbPath)
    const secondLayer = makeTurnProcessingLayer(dbPath)

    return Effect.gen(function*() {
      const now = instant("2026-02-24T12:00:00.000Z")
      const agentId = "agent:restart" as AgentId
      const sessionId = "session:restart" as SessionId
      const conversationId = "conversation:restart" as ConversationId

      yield* Effect.gen(function*() {
        const agentPort = yield* AgentStatePortSqlite
        const sessionPort = yield* SessionTurnPortSqlite
        const runtime = yield* TurnProcessingRuntime

        yield* agentPort.upsert(makeAgentState({
          agentId,
          tokenBudget: 300,
          budgetResetAt: DateTime.add(now, { hours: 1 })
        }))
        yield* sessionPort.startSession(makeSessionState({
          sessionId,
          conversationId,
          tokenCapacity: 400,
          tokensUsed: 0
        }))

        yield* runtime.processTurn(makeTurnPayload({
          turnId: "turn:restart" as TurnId,
          agentId,
          sessionId,
          conversationId,
          createdAt: now,
          inputTokens: 30,
          content: "persist me"
        }))
      }).pipe(Effect.provide(firstLayer))

      const persisted = yield* Effect.gen(function*() {
        const agentPort = yield* AgentStatePortSqlite
        const sessionPort = yield* SessionTurnPortSqlite
        const governance = yield* GovernancePortSqlite

        const agent = yield* agentPort.get(agentId)
        const session = yield* sessionPort.getSession(sessionId)
        const turns = yield* sessionPort.listTurns(sessionId)
        const audits = yield* governance.listAuditEntries()

        return { agent, session, turns, audits } as const
      }).pipe(Effect.provide(secondLayer))

      expect(persisted.agent?.tokensConsumed).toBe(30)
      expect(persisted.session?.tokensUsed).toBe(30)
      expect(persisted.turns).toHaveLength(2)
      expect(persisted.turns[0].message.content).toBe("persist me")
      expect(persisted.turns[1].message.content).toContain("assistant")
      expect(persisted.audits.some((entry) => entry.reason === "turn_processing_accepted")).toBe(true)
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("records deny audit and does not persist turn when policy denies", () => {
    const dbPath = testDatabasePath("turn-deny")
    const layer = makeTurnProcessingLayer(dbPath, "Deny")

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const governance = yield* GovernancePortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-02-24T12:00:00.000Z")
      const agent = makeAgentState({
        agentId: "agent:deny" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })
      const session = makeSessionState({
        sessionId: "session:deny" as SessionId,
        conversationId: "conversation:deny" as ConversationId,
        tokenCapacity: 200,
        tokensUsed: 0
      })

      yield* agentPort.upsert(agent)
      yield* sessionPort.startSession(session)

      const denied = (yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:deny" as TurnId,
        agentId: agent.agentId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: now,
        inputTokens: 20,
        content: "should be denied"
      })).pipe(
        Effect.flip
      )) as TurnPolicyDenied

      const persistedSession = yield* sessionPort.getSession(session.sessionId)
      const turns = yield* sessionPort.listTurns(session.sessionId)
      const persistedAgent = yield* agentPort.get(agent.agentId)
      const audits = yield* governance.listAuditEntries()

      expect(denied).toBeInstanceOf(TurnPolicyDenied)
      expect(denied._tag).toBe("TurnPolicyDenied")
      expect(persistedSession?.tokensUsed).toBe(0)
      expect(persistedAgent?.tokensConsumed).toBe(0)
      expect(turns).toHaveLength(0)
      expect(audits.some((entry) => entry.reason === "turn_processing_policy_denied" && entry.decision === "Deny"))
        .toBe(true)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("classifies provider credit exhaustion with a specific reason and audit", () => {
    const dbPath = testDatabasePath("turn-credit-exhausted")
    const layer = makeTurnProcessingLayer(
      dbPath,
      "Allow",
      undefined,
      { failWithErrorMessage: "Your credit balance is too low to access the Anthropic API." }
    )

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const governance = yield* GovernancePortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-02-24T12:00:00.000Z")
      const agent = makeAgentState({
        agentId: "agent:credit" as AgentId,
        tokenBudget: 200,
        tokensConsumed: 0,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })
      const session = makeSessionState({
        sessionId: "session:credit" as SessionId,
        conversationId: "conversation:credit" as ConversationId,
        tokenCapacity: 200,
        tokensUsed: 0
      })

      yield* agentPort.upsert(agent)
      yield* sessionPort.startSession(session)

      const failed = (yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:credit" as TurnId,
        agentId: agent.agentId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: now,
        inputTokens: 20,
        content: "hello"
      })).pipe(
        Effect.flip
      )) as TurnModelFailure

      const audits = yield* governance.listAuditEntries()

      expect(failed).toBeInstanceOf(TurnModelFailure)
      expect(failed._tag).toBe("TurnModelFailure")
      expect(failed.reason).toContain("provider_credit_exhausted:")
      expect(failed.reason).toContain("credit balance is too low")
      expect(
        audits.some(
          (entry) =>
            entry.reason === "turn_processing_provider_credit_exhausted" && entry.decision === "Deny"
        )
      ).toBe(true)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("tool loop recurses on tool-calls finish reason", () => {
    const dbPath = testDatabasePath("turn-tool-loop")
    const layer = makeTurnProcessingLayer(dbPath, "Allow", undefined, {
      finishReasons: ["tool-calls", "stop"]
    })

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T12:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:loop" as AgentId,
        tokenBudget: 500,
        maxToolIterations: 10,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:loop" as SessionId,
        conversationId: "conversation:loop" as ConversationId,
        tokenCapacity: 1000,
        tokensUsed: 0
      }))

      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:loop" as TurnId,
        sessionId: "session:loop" as SessionId,
        conversationId: "conversation:loop" as ConversationId,
        agentId: "agent:loop" as AgentId,
        createdAt: now,
        inputTokens: 25,
        content: "use tools"
      }))

      expect(result.accepted).toBe(true)
      expect(result.iterationsUsed).toBe(2)
      expect(result.iterationStats).toHaveLength(2)
      expect(result.iterationStats[0].finishReason).toBe("tool-calls")
      expect(result.iterationStats[1].finishReason).toBe("stop")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("tool loop caps at maxToolIterations", () => {
    const dbPath = testDatabasePath("turn-loop-cap")
    const layer = makeTurnProcessingLayer(dbPath, "Allow", undefined, {
      finishReasons: ["tool-calls", "tool-calls", "tool-calls", "tool-calls", "tool-calls"]
    })

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T12:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:loop-cap" as AgentId,
        tokenBudget: 500,
        maxToolIterations: 2,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:loop-cap" as SessionId,
        conversationId: "conversation:loop-cap" as ConversationId,
        tokenCapacity: 1000,
        tokensUsed: 0
      }))

      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:loop-cap" as TurnId,
        sessionId: "session:loop-cap" as SessionId,
        conversationId: "conversation:loop-cap" as ConversationId,
        agentId: "agent:loop-cap" as AgentId,
        createdAt: now,
        inputTokens: 25,
        content: "keep calling tools"
      }))

      expect(result.accepted).toBe(true)
      expect(result.iterationsUsed).toBe(2)
      expect(result.assistantContent).toContain("Stopped after reaching max tool iterations")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("exposes canonical stream events", () => {
    const dbPath = testDatabasePath("turn-stream")
    const layer = makeTurnProcessingLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T12:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:stream" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:stream" as SessionId,
        conversationId: "conversation:stream" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      }))

      const events = yield* runtime.processTurnStream(makeTurnPayload({
        turnId: "turn:stream" as TurnId,
        sessionId: "session:stream" as SessionId,
        conversationId: "conversation:stream" as ConversationId,
        agentId: "agent:stream" as AgentId,
        createdAt: now,
        inputTokens: 10,
        content: "stream me"
      })).pipe(Stream.runCollect)

      expect(events[0]?.type).toBe("turn.started")
      const assistantDeltaIndex = events.findIndex((event) => event.type === "assistant.delta")
      const turnCompletedIndex = events.findIndex((event) => event.type === "turn.completed")
      expect(assistantDeltaIndex).toBeGreaterThan(0)
      expect(turnCompletedIndex).toBeGreaterThan(assistantDeltaIndex)
      for (let i = 1; i < events.length; i += 1) {
        expect(events[i]!.sequence).toBeGreaterThan(events[i - 1]!.sequence)
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("streams tool loop events in causal order across iterations", () => {
    const dbPath = testDatabasePath("turn-stream-tool-loop-order")
    const layer = makeTurnProcessingLayer(
      dbPath,
      "Allow",
      undefined,
      { finishReasons: ["tool-calls", "stop"] }
    )

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T12:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:stream-loop" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:stream-loop" as SessionId,
        conversationId: "conversation:stream-loop" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      }))

      const events = yield* runtime.processTurnStream(makeTurnPayload({
        turnId: "turn:stream-loop" as TurnId,
        sessionId: "session:stream-loop" as SessionId,
        conversationId: "conversation:stream-loop" as ConversationId,
        agentId: "agent:stream-loop" as AgentId,
        createdAt: now,
        inputTokens: 10,
        content: "keep calling tools"
      })).pipe(Stream.runCollect)

      const firstToolCall = events.findIndex((event) => event.type === "tool.call")
      const firstToolResult = events.findIndex((event) => event.type === "tool.result")
      const firstIterationCompleted = events.findIndex((event) => event.type === "iteration.completed")
      const turnCompletedIndex = events.findIndex((event) => event.type === "turn.completed")

      expect(firstToolCall).toBeGreaterThan(0)
      expect(firstToolResult).toBeGreaterThan(firstToolCall)
      expect(firstIterationCompleted).toBeGreaterThan(firstToolResult)
      expect(turnCompletedIndex).toBeGreaterThan(firstIterationCompleted)
      for (let i = 1; i < events.length; i += 1) {
        expect(events[i]!.sequence).toBeGreaterThan(events[i - 1]!.sequence)
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("replays completed executions through fallback transcript events", () => {
    const dbPath = testDatabasePath("turn-stream-replay-fallback")
    const layer = makeTurnProcessingLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T12:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:stream-replay" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:stream-replay" as SessionId,
        conversationId: "conversation:stream-replay" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      }))

      const payload = makeTurnPayload({
        turnId: "turn:stream-replay" as TurnId,
        sessionId: "session:stream-replay" as SessionId,
        conversationId: "conversation:stream-replay" as ConversationId,
        agentId: "agent:stream-replay" as AgentId,
        createdAt: now,
        inputTokens: 10,
        content: "replay me"
      })

      const firstResult = yield* runtime.processTurn(payload)
      expect(firstResult.accepted).toBe(true)

      const replayEvents = yield* runtime.processTurnStream(payload).pipe(Stream.runCollect)
      expect(replayEvents[0]?.type).toBe("turn.started")
      expect(replayEvents.some((event) => event.type === "assistant.delta")).toBe(true)
      expect(replayEvents.some((event) => event.type === "turn.completed")).toBe(true)
      for (let i = 1; i < replayEvents.length; i += 1) {
        expect(replayEvents[i]!.sequence).toBeGreaterThan(replayEvents[i - 1]!.sequence)
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("emits checkpoint_required and completed(false) when approval is required", () => {
    const dbPath = testDatabasePath("turn-checkpoint-required")
    const layer = makeTurnProcessingLayer(dbPath, "RequireApproval")

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T12:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:checkpoint" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:checkpoint" as SessionId,
        conversationId: "conversation:checkpoint" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      }))

      const events = yield* runtime.processTurnStream(makeTurnPayload({
        turnId: "turn:checkpoint" as TurnId,
        sessionId: "session:checkpoint" as SessionId,
        conversationId: "conversation:checkpoint" as ConversationId,
        agentId: "agent:checkpoint" as AgentId,
        createdAt: now,
        inputTokens: 10,
        content: "read memory please"
      })).pipe(Stream.runCollect)

      expect(events[0]?.type).toBe("turn.started")
      expect(events.some((event) => event.type === "turn.checkpoint_required")).toBe(true)
      const completed = events.find((event) => event.type === "turn.completed")
      expect(completed).toBeDefined()
      expect((completed as any).accepted).toBe(false)
      expect((completed as any).auditReasonCode).toBe("turn_processing_checkpoint_required")
      const checkpointIndex = events.findIndex((event) => event.type === "turn.checkpoint_required")
      const completedIndex = events.findIndex((event) => event.type === "turn.completed")
      expect(checkpointIndex).toBeGreaterThan(0)
      expect(completedIndex).toBeGreaterThan(checkpointIndex)
      for (let i = 1; i < events.length; i += 1) {
        expect(events[i]!.sequence).toBeGreaterThan(events[i - 1]!.sequence)
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("InvokeTool checkpoint emits tool.call event with blocked tool info", () => {
    const dbPath = testDatabasePath("turn-invoke-checkpoint-tool-call")

    // Allow ReadMemory so the flow reaches the model, but RequireApproval for InvokeTool.
    // Use store_memory (not in ALWAYS_ALLOWED_TOOLS) so governance is evaluated.
    // Mock model generates tool-call WITHOUT tool-result so @effect/ai invokes the
    // tool handler, which triggers governance evaluation and RequiresApproval.
    const layer = makeTurnProcessingLayer(
      dbPath,
      (action) => action === "InvokeTool" ? "RequireApproval" : "Allow",
      undefined,
      { useProviderInterface: true, toolName: "store_memory", toolParams: { content: "test memory" } }
    )

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T14:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:invoke-ckpt" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:invoke-ckpt" as SessionId,
        conversationId: "conversation:invoke-ckpt" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      }))

      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:invoke-ckpt" as TurnId,
        sessionId: "session:invoke-ckpt" as SessionId,
        conversationId: "conversation:invoke-ckpt" as ConversationId,
        agentId: "agent:invoke-ckpt" as AgentId,
        createdAt: now,
        inputTokens: 10,
        content: "store a memory"
      }))

      // Should be a checkpoint result
      expect(result.accepted).toBe(false)
      expect(result.auditReasonCode).toBe("turn_processing_checkpoint_required")
      expect(result.checkpointId).toBeDefined()
      expect(result.checkpointAction).toBe("InvokeTool")

      // assistantContentBlocks should include the blocked tool call
      const toolUseBlock = result.assistantContentBlocks.find(
        (b) => b.contentBlockType === "ToolUseBlock"
      )
      expect(toolUseBlock).toBeDefined()
      expect((toolUseBlock as any).toolName).toBe("store_memory")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("provider-interface file tool validation errors emit tool.error without failing the turn", () => {
    const dbPath = testDatabasePath("turn-tool-error-event")
    const relativePath = `tmp/turn-tool-error-${crypto.randomUUID()}.txt`
    const absolutePath = join(process.cwd(), relativePath)
    const layer = makeTurnProcessingLayer(
      dbPath,
      "Allow",
      undefined,
      { useProviderInterface: true, toolName: "file_read", toolParams: { path: relativePath, offset: 0 } }
    )

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-02-24T15:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:tool-error" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:tool-error" as SessionId,
        conversationId: "conversation:tool-error" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      }))

      writeFileSync(absolutePath, "line1\nline2\n", "utf8")

      const events = yield* runtime.processTurnStream(makeTurnPayload({
        turnId: "turn:tool-error" as TurnId,
        sessionId: "session:tool-error" as SessionId,
        conversationId: "conversation:tool-error" as ConversationId,
        agentId: "agent:tool-error" as AgentId,
        createdAt: now,
        inputTokens: 10,
        content: "read with invalid offset"
      })).pipe(Stream.runCollect)

      expect(events[0]?.type).toBe("turn.started")
      expect(events.some((event) => event.type === "tool.call")).toBe(true)
      expect(events.some((event) => event.type === "tool.error")).toBe(true)
      expect(events.some((event) => event.type === "turn.failed")).toBe(false)

      const toolErrorEvent = events.find((event) => event.type === "tool.error")
      expect(toolErrorEvent).toBeDefined()
      expect((toolErrorEvent as { readonly outputJson: string }).outputJson).toContain("InvalidReadRequest")

      const completed = events.find((event) => event.type === "turn.completed")
      expect(completed).toBeDefined()
      expect((completed as { readonly accepted: boolean }).accepted).toBe(true)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath)),
      Effect.ensuring(Effect.sync(() => rmSync(absolutePath, { force: true })))
    )
  })

  it.effect("ReadMemory checkpoints use payload-bound hashes and versioned replay payloads", () => {
    const dbPath = testDatabasePath("turn-checkpoint-hash-binding")
    const layer = makeTurnProcessingLayer(dbPath, "RequireApproval")

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const checkpointPort = yield* CheckpointPortTag
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-03-02T12:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:checkpoint-hash" as AgentId,
        tokenBudget: 200,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:checkpoint-hash" as SessionId,
        conversationId: "conversation:checkpoint-hash" as ConversationId,
        tokenCapacity: 300,
        tokensUsed: 0
      }))

      const first = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:checkpoint-hash:1" as TurnId,
        sessionId: "session:checkpoint-hash" as SessionId,
        conversationId: "conversation:checkpoint-hash" as ConversationId,
        agentId: "agent:checkpoint-hash" as AgentId,
        createdAt: now,
        inputTokens: 10,
        content: "read memory A",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "read memory A" }]
      }))

      const second = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:checkpoint-hash:2" as TurnId,
        sessionId: "session:checkpoint-hash" as SessionId,
        conversationId: "conversation:checkpoint-hash" as ConversationId,
        agentId: "agent:checkpoint-hash" as AgentId,
        createdAt: DateTime.add(now, { minutes: 1 }),
        inputTokens: 10,
        content: "read memory B",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "read memory B" }]
      }))

      expect(first.accepted).toBe(false)
      expect(second.accepted).toBe(false)
      expect(first.checkpointId).toBeDefined()
      expect(second.checkpointId).toBeDefined()

      const pending = yield* checkpointPort.listPending("agent:checkpoint-hash" as AgentId)
      expect(pending).toHaveLength(2)
      expect(new Set(pending.map((record) => record.payloadHash)).size).toBe(2)
      expect(
        pending.every((record) => record.payloadJson.includes("\"replayPayloadVersion\":1"))
      ).toBe(true)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("InvokeTool replay continuation persists replay tool turn and no synthetic user turn", () => {
    const dbPath = testDatabasePath("turn-invoke-replay-continuation")
    const capturedPrompts: Array<string> = []
    const layer = makeTurnProcessingLayer(dbPath, "Allow", capturedPrompts)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const memoryPort = yield* MemoryPortSqlite
      const checkpointPort = yield* CheckpointPortTag
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-03-02T15:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:invoke-replay" as AgentId,
        tokenBudget: 500,
        tokensConsumed: 0,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:invoke-replay" as SessionId,
        conversationId: "conversation:invoke-replay" as ConversationId,
        tokenCapacity: 500,
        tokensUsed: 0
      }))
      yield* memoryPort.encode(
        "agent:invoke-replay" as AgentId,
        [{
          tier: "SemanticMemory",
          scope: "GlobalScope",
          source: "AgentSource",
          content: "should not be injected during replay",
          sensitivity: "Internal"
        }],
        now
      )

      const inputJson = encodeJson({ command: "pwd" })
      const checkpointPayload = {
        replayPayloadVersion: 1 as const,
        kind: "InvokeTool" as const,
        toolName: "shell_execute",
        inputJson,
        turnContext: {
          agentId: "agent:invoke-replay",
          sessionId: "session:invoke-replay",
          conversationId: "conversation:invoke-replay",
          channelId: "channel:invoke-replay",
          turnId: "turn:blocked",
          createdAt: DateTime.formatIso(now)
        }
      }
      const payloadHash = yield* makeCheckpointPayloadHash("InvokeTool", checkpointPayload)
      const checkpointId = "checkpoint:invoke-replay-approved" as CheckpointId
      yield* checkpointPort.create({
        checkpointId,
        agentId: "agent:invoke-replay" as AgentId,
        sessionId: "session:invoke-replay" as SessionId,
        channelId: "channel:invoke-replay" as ChannelId,
        turnId: "turn:blocked",
        action: "InvokeTool",
        policyId: null,
        reason: "requires approval",
        payloadJson: encodeJson(checkpointPayload),
        payloadHash,
        status: "Approved",
        requestedAt: now,
        decidedAt: now,
        decidedBy: "user:cli:local",
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      } satisfies CheckpointRecord)

      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:invoke-replay" as TurnId,
        sessionId: "session:invoke-replay" as SessionId,
        conversationId: "conversation:invoke-replay" as ConversationId,
        agentId: "agent:invoke-replay" as AgentId,
        channelId: "channel:invoke-replay",
        createdAt: now,
        inputTokens: 0,
        content: "",
        contentBlocks: [],
        checkpointId,
        invokeToolReplay: {
          replayPayloadVersion: 1,
          toolName: "shell_execute",
          inputJson,
          outputJson: encodeJson({
            ok: true,
            exitCode: 0,
            stdout: "/tmp",
            stderr: ""
          }),
          isError: false
        }
      }))

      expect(result.accepted).toBe(true)
      expect(result.assistantContentBlocks.some((b) => b.contentBlockType === "ToolUseBlock")).toBe(true)
      expect(result.assistantContentBlocks.some((b) => b.contentBlockType === "ToolResultBlock")).toBe(true)

      const turns = yield* sessionPort.listTurns("session:invoke-replay" as SessionId)
      expect(turns).toHaveLength(2)
      expect(turns[0].participantRole).toBe("AssistantRole")
      expect(turns[0].message.contentBlocks.some((b) => b.contentBlockType === "ToolUseBlock")).toBe(true)
      expect(turns[0].message.contentBlocks.some((b) => b.contentBlockType === "ToolResultBlock")).toBe(true)
      expect(turns[1].participantRole).toBe("AssistantRole")
      expect(turns[1].message.content).toContain("assistant")

      const persistedSession = yield* sessionPort.getSession("session:invoke-replay" as SessionId)
      const persistedAgent = yield* agentPort.get("agent:invoke-replay" as AgentId)
      expect(persistedSession?.tokensUsed).toBe(0)
      expect(persistedAgent?.tokensConsumed).toBe(0)

      expect(capturedPrompts.length).toBeGreaterThan(0)
      const decodedCaptured = decodeJson(capturedPrompts[0] ?? "")
      expect(decodedCaptured._tag).toBe("Some")
      const captured = (decodedCaptured._tag === "Some" ? decodedCaptured.value : {}) as {
        prompt?: { content?: ReadonlyArray<{ role: string; content: unknown }> }
      }
      const promptMessages = captured.prompt?.content ?? []
      const hasNonEmptyText = promptMessages.some((message) =>
        Array.isArray(message.content)
        && message.content.some(
          (part) =>
            typeof part === "object"
            && part !== null
            && "type" in part
            && part.type === "text"
            && "text" in part
            && typeof part.text === "string"
            && part.text.trim().length > 0
        )
      )
      const hasEmptyText = promptMessages.some((message) =>
        Array.isArray(message.content)
        && message.content.some(
          (part) =>
            typeof part === "object"
            && part !== null
            && "type" in part
            && part.type === "text"
            && "text" in part
            && typeof part.text === "string"
            && part.text.trim().length === 0
        )
      )
      expect(hasNonEmptyText).toBe(true)
      expect(hasEmptyText).toBe(false)
      const systemPrompt = extractSystemPromptText(capturedPrompts)
      expect(systemPrompt).not.toContain("## Durable Memory (Reference Data)")
      expect(systemPrompt).not.toContain("should not be injected during replay")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("ReadMemory replay rejects payload-hash tampering before persistence side effects", () => {
    const dbPath = testDatabasePath("turn-readmemory-hash-tamper")
    const layer = makeTurnProcessingLayer(dbPath, "RequireApproval")

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const checkpointPort = yield* CheckpointPortTag
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-03-02T18:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:readmemory-tamper" as AgentId,
        tokenBudget: 300,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:readmemory-tamper" as SessionId,
        conversationId: "conversation:readmemory-tamper" as ConversationId,
        tokenCapacity: 400,
        tokensUsed: 0
      }))

      const checkpointId = "checkpoint:readmemory-hash-tamper" as CheckpointId
      const checkpointPayload = {
        replayPayloadVersion: 1 as const,
        kind: "ReadMemory" as const,
        content: "read secure memory",
        contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "read secure memory" }],
        turnContext: {
          agentId: "agent:readmemory-tamper",
          sessionId: "session:readmemory-tamper",
          conversationId: "conversation:readmemory-tamper",
          channelId: "channel:readmemory-tamper",
          turnId: "turn:blocked",
          createdAt: DateTime.formatIso(now)
        }
      }

      yield* checkpointPort.create({
        checkpointId,
        agentId: "agent:readmemory-tamper" as AgentId,
        sessionId: "session:readmemory-tamper" as SessionId,
        channelId: "channel:readmemory-tamper" as ChannelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "requires approval",
        payloadJson: encodeJson(checkpointPayload),
        payloadHash: "tampered-hash",
        status: "Approved",
        requestedAt: now,
        decidedAt: now,
        decidedBy: "user:cli:local",
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      } satisfies CheckpointRecord)

      const failure = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:readmemory-tamper" as TurnId,
        sessionId: "session:readmemory-tamper" as SessionId,
        conversationId: "conversation:readmemory-tamper" as ConversationId,
        agentId: "agent:readmemory-tamper" as AgentId,
        channelId: "channel:readmemory-tamper",
        createdAt: now,
        inputTokens: 12,
        content: "read secure memory",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "read secure memory" }],
        checkpointId
      })).pipe(Effect.flip)

      expect(failure._tag).toBe("TurnPolicyDenied")
      if (failure._tag === "TurnPolicyDenied") {
        expect(failure.reason).toBe("checkpoint_payload_mismatch")
      }

      const turns = yield* sessionPort.listTurns("session:readmemory-tamper" as SessionId)
      expect(turns).toHaveLength(0)
      const session = yield* sessionPort.getSession("session:readmemory-tamper" as SessionId)
      expect(session?.tokensUsed).toBe(0)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("ReadMemory replay rejects turn-context mismatches", () => {
    const dbPath = testDatabasePath("turn-readmemory-context-mismatch")
    const layer = makeTurnProcessingLayer(dbPath, "RequireApproval")

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const checkpointPort = yield* CheckpointPortTag
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-03-02T19:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:readmemory-context" as AgentId,
        tokenBudget: 300,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:readmemory-context" as SessionId,
        conversationId: "conversation:readmemory-context" as ConversationId,
        tokenCapacity: 400,
        tokensUsed: 0
      }))

      const checkpointId = "checkpoint:readmemory-context-mismatch" as CheckpointId
      const checkpointPayload = {
        replayPayloadVersion: 1 as const,
        kind: "ReadMemory" as const,
        content: "expected request",
        contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "expected request" }],
        turnContext: {
          agentId: "agent:readmemory-context",
          sessionId: "session:readmemory-context",
          conversationId: "conversation:readmemory-context",
          channelId: "channel:readmemory-context",
          turnId: "turn:blocked",
          createdAt: DateTime.formatIso(now)
        }
      }
      const payloadHash = yield* makeCheckpointPayloadHash("ReadMemory", checkpointPayload)

      yield* checkpointPort.create({
        checkpointId,
        agentId: "agent:readmemory-context" as AgentId,
        sessionId: "session:readmemory-context" as SessionId,
        channelId: "channel:readmemory-context" as ChannelId,
        turnId: "turn:blocked",
        action: "ReadMemory",
        policyId: null,
        reason: "requires approval",
        payloadJson: encodeJson(checkpointPayload),
        payloadHash,
        status: "Approved",
        requestedAt: now,
        decidedAt: now,
        decidedBy: "user:cli:local",
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      } satisfies CheckpointRecord)

      const failure = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:readmemory-context" as TurnId,
        sessionId: "session:readmemory-context" as SessionId,
        conversationId: "conversation:readmemory-context" as ConversationId,
        agentId: "agent:readmemory-context" as AgentId,
        channelId: "channel:readmemory-context",
        createdAt: now,
        inputTokens: 12,
        content: "different request",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "different request" }],
        checkpointId
      })).pipe(Effect.flip)

      expect(failure._tag).toBe("TurnPolicyDenied")
      if (failure._tag === "TurnPolicyDenied") {
        expect(failure.reason).toBe("checkpoint_payload_mismatch")
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("InvokeTool replay rejects payload-hash tampering", () => {
    const dbPath = testDatabasePath("turn-invoketool-hash-tamper")
    const layer = makeTurnProcessingLayer(dbPath, "Allow")

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const checkpointPort = yield* CheckpointPortTag
      const runtime = yield* TurnProcessingRuntime
      const now = instant("2026-03-02T20:00:00.000Z")

      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:invoke-tamper" as AgentId,
        tokenBudget: 500,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:invoke-tamper" as SessionId,
        conversationId: "conversation:invoke-tamper" as ConversationId,
        tokenCapacity: 500,
        tokensUsed: 0
      }))

      const inputJson = encodeJson({ command: "pwd" })
      const checkpointId = "checkpoint:invoke-hash-tamper" as CheckpointId
      const checkpointPayload = {
        replayPayloadVersion: 1 as const,
        kind: "InvokeTool" as const,
        toolName: "shell_execute",
        inputJson,
        turnContext: {
          agentId: "agent:invoke-tamper",
          sessionId: "session:invoke-tamper",
          conversationId: "conversation:invoke-tamper",
          channelId: "channel:invoke-tamper",
          turnId: "turn:blocked",
          createdAt: DateTime.formatIso(now)
        }
      }

      yield* checkpointPort.create({
        checkpointId,
        agentId: "agent:invoke-tamper" as AgentId,
        sessionId: "session:invoke-tamper" as SessionId,
        channelId: "channel:invoke-tamper" as ChannelId,
        turnId: "turn:blocked",
        action: "InvokeTool",
        policyId: null,
        reason: "requires approval",
        payloadJson: encodeJson(checkpointPayload),
        payloadHash: "tampered-invoke-hash",
        status: "Approved",
        requestedAt: now,
        decidedAt: now,
        decidedBy: "user:cli:local",
        consumedAt: null,
        consumedBy: null,
        expiresAt: null
      } satisfies CheckpointRecord)

      const failure = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:invoke-tamper" as TurnId,
        sessionId: "session:invoke-tamper" as SessionId,
        conversationId: "conversation:invoke-tamper" as ConversationId,
        agentId: "agent:invoke-tamper" as AgentId,
        channelId: "channel:invoke-tamper",
        createdAt: now,
        inputTokens: 0,
        content: "",
        contentBlocks: [],
        checkpointId,
        invokeToolReplay: {
          replayPayloadVersion: 1,
          toolName: "shell_execute",
          inputJson,
          outputJson: encodeJson({ ok: true, exitCode: 0, stdout: "/tmp", stderr: "" }),
          isError: false
        }
      })).pipe(Effect.flip)

      expect(failure._tag).toBe("TurnPolicyDenied")
      if (failure._tag === "TurnPolicyDenied") {
        expect(failure.reason).toBe("checkpoint_payload_mismatch")
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

})

const encodeJson = Schema.encodeSync(Schema.UnknownFromJsonString)
const decodeJson = Schema.decodeUnknownOption(Schema.UnknownFromJsonString)

const extractSystemPromptText = (capturedPrompts: ReadonlyArray<string>): string => {
  expect(capturedPrompts.length).toBeGreaterThan(0)
  const decoded = decodeJson(capturedPrompts[0] ?? "")
  expect(decoded._tag).toBe("Some")
  const captured = (decoded._tag === "Some" ? decoded.value : {}) as {
    prompt?: { content?: ReadonlyArray<{ role: string; content: unknown }> }
  }
  const promptMessages = captured.prompt?.content ?? []
  const systemMessage = promptMessages.find((message) => message.role === "system")
  if (systemMessage === undefined) {
    return ""
  }

  if (typeof systemMessage.content === "string") {
    return systemMessage.content
  }

  if (Array.isArray(systemMessage.content)) {
    return systemMessage.content
      .map((part) =>
        typeof part === "object"
        && part !== null
        && "type" in part
        && part.type === "text"
        && "text" in part
        && typeof part.text === "string"
          ? part.text
          : "")
      .join("\n")
  }

  return ""
}

const TEST_PROMPT_BINDINGS = {
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
} as const

const makeTurnProcessingLayer = (
  dbPath: string,
  forcedDecision: AuthorizationDecision | ((action: string) => AuthorizationDecision) = "Allow",
  capturedPrompts?: Array<string>,
  mockOptions?: {
    readonly finishReasons?: ReadonlyArray<Response.FinishReason>
    readonly failWithErrorMessage?: string
    readonly omitToolResults?: boolean
    readonly toolName?: string
    readonly toolParams?: Record<string, unknown>
    readonly useProviderInterface?: boolean
  },
  memoryPortOverride?: MemoryPort
) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer

  const agentStateSqliteLayer = AgentStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const sessionTurnSqliteLayer = SessionTurnPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const governanceSqliteLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(sqlInfrastructureLayer)
  )
  const memoryPortSqliteLayer = MemoryPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
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

  const memoryPortTagLayer = Layer.effect(
    MemoryPortTag,
    Effect.gen(function*() {
      if (memoryPortOverride !== undefined) {
        return memoryPortOverride
      }
      return (yield* MemoryPortSqlite) as MemoryPort
    })
  ).pipe(Layer.provide(memoryPortSqliteLayer))

  const agentStateTagLayer = Layer.effect(
    AgentStatePortTag,
    Effect.gen(function*() {
      return (yield* AgentStatePortSqlite) as AgentStatePort
    })
  ).pipe(Layer.provide(agentStateSqliteLayer))

  const sessionTurnTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() {
      return (yield* SessionTurnPortSqlite) as SessionTurnPort
    })
  ).pipe(Layer.provide(sessionTurnSqliteLayer))

  const governanceTagLayer = Layer.effect(
    GovernancePortTag,
    Effect.gen(function*() {
      const governance = yield* GovernancePortSqlite
      if (forcedDecision === "Allow") {
        return governance as GovernancePort
      }

      const resolveDecision = typeof forcedDecision === "function"
        ? forcedDecision
        : () => forcedDecision as AuthorizationDecision

      return {
        ...governance,
        evaluatePolicy: (input: { readonly action: string }) => {
          const decision = resolveDecision(input.action)
          return Effect.succeed({
            decision,
            policyId: null,
            toolDefinitionId: null,
            reason: `forced_${decision.toLowerCase()}`
          })
        }
      } as GovernancePort
    })
  ).pipe(Layer.provide(governanceSqliteLayer))

  const agentConfigLayer = AgentConfig.layerFromParsed({
    prompts: {
      rootDir: "prompts",
      entries: {
        "core.turn.system.default": { file: "core/system-default.md" },
        "core.turn.replay.continuation": { file: "core/replay-continuation.md" },
        "memory.trigger.envelope": { file: "memory/trigger-envelope.md" },
        "memory.tier.working": { file: "memory/tier-working.md" },
        "memory.tier.episodic": { file: "memory/tier-episodic.md" },
        "memory.tier.semantic": { file: "memory/tier-semantic.md" },
        "memory.tier.procedural": { file: "memory/tier-procedural.md" },
        "compaction.block.summary": { file: "compaction/block-summary.md" },
        "compaction.block.artifacts": { file: "compaction/block-artifacts.md" },
        "compaction.block.tools": { file: "compaction/block-tools.md" },
        "compaction.block.kept": { file: "compaction/block-kept-context.md" }
      }
    },
    providers: { anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" } },
    agents: {
      default: {
        persona: { name: "Test"  },
        promptBindings: TEST_PROMPT_BINDINGS,
        model: { provider: "anthropic", modelId: "test" },
        generation: { temperature: 0.7, maxOutputTokens: 4096 }
      }
    },
    server: { port: 3000 }
  })
  const promptCatalogLayer = Layer.succeed(PromptCatalog, {
    get: (ref: string) => Effect.succeed(`prompt:${ref}`),
    getAgentBindings: () => Effect.succeed(TEST_PROMPT_BINDINGS),
    render: (ref: string) => Effect.succeed(`prompt:${ref}`)
  } as any)

  const mockModelRegistryLayer = Layer.effect(
    ModelRegistry,
    Effect.succeed({
      get: (_provider: string, _modelId: string) =>
        Effect.succeed(
          mockOptions?.useProviderInterface
            ? Layer.effect(
                LanguageModel.LanguageModel,
                LanguageModel.make(makeMockProvider(capturedPrompts, mockOptions))
              )
            : Layer.succeed(LanguageModel.LanguageModel, makeMockLanguageModel(capturedPrompts, mockOptions))
        )
    })
  )

  const chatPersistenceLayer = ChatPersistence.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )

  const commandHooksLayer = CommandHooksDefaultLayer

  const cliRuntimeLayer = CliRuntimeLocalLayer.pipe(
    Layer.provide(NodeServices.layer)
  )

  const commandBackendLayer = CommandBackendLocalLayer.pipe(
    Layer.provide(cliRuntimeLayer)
  )

  const commandRuntimeLayer = CommandRuntime.layer.pipe(
    Layer.provide(commandHooksLayer),
    Layer.provide(commandBackendLayer),
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(NodeServices.layer)
  )

  const fileHooksLayer = FileHooksDefaultLayer

  const filePathPolicyLayer = FilePathPolicy.layer.pipe(
    Layer.provide(NodeServices.layer)
  )

  const fileReadTrackerLayer = FileReadTracker.layer

  const fileRuntimeLayer = FileRuntime.layer.pipe(
    Layer.provide(fileHooksLayer),
    Layer.provide(fileReadTrackerLayer),
    Layer.provide(filePathPolicyLayer),
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(NodeServices.layer)
  )

  const toolExecutionLayer = ToolExecution.layer.pipe(
    Layer.provide(fileRuntimeLayer),
    Layer.provide(filePathPolicyLayer),
    Layer.provide(cliRuntimeLayer),
    Layer.provide(commandRuntimeLayer),
    Layer.provide(sqlInfrastructureLayer),
    Layer.provide(NodeServices.layer)
  )

  const toolRegistryLayer = ToolRegistry.layer.pipe(
    Layer.provide(toolExecutionLayer),
    Layer.provide(governanceTagLayer),
    Layer.provide(memoryPortTagLayer),
    Layer.provide(agentConfigLayer),
    Layer.provide(checkpointPortTagLayer),
    Layer.provide(Layer.succeed(ArtifactStorePortTag, {
      putJson: () =>
        Effect.succeed({
          artifactId: "artifact:test" as ArtifactId,
          sha256: "test",
          mediaType: "application/json",
          bytes: 0,
          previewText: null
        }),
      putBytes: () =>
        Effect.succeed({
          artifactId: "artifact:test" as ArtifactId,
          sha256: "test",
          mediaType: "application/octet-stream",
          bytes: 0,
          previewText: null
        }),
      getBytes: () => Effect.succeed(new Uint8Array())
    } as ArtifactStorePort)),
    Layer.provide(Layer.succeed(SessionArtifactPortTag, {
      link: () => Effect.void,
      listBySession: () => Effect.succeed([])
    } as SessionArtifactPort)),
    Layer.provide(Layer.succeed(SessionMetricsPortTag, {
      increment: () => Effect.void,
      get: () => Effect.succeed(null),
      shouldTriggerCompaction: () => Effect.succeed(false)
    } as SessionMetricsPort))
  )

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const workflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
    Layer.provide(clusterLayer)
  )

  const postCommitExecutorLayer = Layer.succeed(PostCommitExecutor, {
    execute: () =>
      Effect.succeed({
        subroutines: [],
        projectionSuccess: true,
        projectionError: null
      })
  } as any)

  const postCommitWorkflowLayer = PostCommitWorkflowLayer.pipe(
    Layer.provide(workflowEngineLayer),
    Layer.provide(postCommitExecutorLayer)
  )

  const turnWorkflowLayer = TurnProcessingWorkflowLayer.pipe(
    Layer.provide(workflowEngineLayer),
    Layer.provide(agentStateTagLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(governanceTagLayer),
    Layer.provide(toolRegistryLayer),
    Layer.provide(chatPersistenceLayer),
    Layer.provide(agentConfigLayer),
    Layer.provide(mockModelRegistryLayer),
    Layer.provide(checkpointPortTagLayer),
    Layer.provide(Layer.succeed(SessionMetricsPortTag, {
      increment: () => Effect.void,
      get: () => Effect.succeed(null),
      shouldTriggerCompaction: () => Effect.succeed(false)
    } as SessionMetricsPort)),
    Layer.provide(promptCatalogLayer)
  )

  const turnRuntimeLayer = TurnProcessingRuntime.layer.pipe(
    Layer.provide(workflowEngineLayer)
  )

  return turnRuntimeLayer.pipe(
    Layer.provideMerge(turnWorkflowLayer),
    Layer.provideMerge(postCommitWorkflowLayer),
    Layer.provideMerge(workflowEngineLayer),
    Layer.provideMerge(Layer.mergeAll(
      toolRegistryLayer,
      mockModelRegistryLayer
    )),
    Layer.provideMerge(Layer.mergeAll(
      chatPersistenceLayer,
      agentConfigLayer
    )),
    Layer.provideMerge(Layer.mergeAll(
      agentStateTagLayer,
      sessionTurnTagLayer,
      governanceTagLayer,
      memoryPortTagLayer,
      checkpointPortTagLayer
    )),
    Layer.provideMerge(Layer.mergeAll(
      agentStateSqliteLayer,
      sessionTurnSqliteLayer,
      governanceSqliteLayer,
      memoryPortSqliteLayer,
      checkpointPortSqliteLayer,
      sandboxRuntimeLayer
    )),
    Layer.provideMerge(clusterLayer),
    Layer.provideMerge(sqlInfrastructureLayer)
  )
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeAgentState = (overrides: Partial<AgentState>): AgentState => ({
  agentId: "agent:default" as AgentId,
  permissionMode: "Standard",
  tokenBudget: 100,
  maxToolIterations: 10,
  quotaPeriod: "Daily",
  tokensConsumed: 0,
  budgetResetAt: null,
  ...overrides
})

const makeSessionState = (overrides: Partial<SessionState>): SessionState => ({
  sessionId: "session:default" as SessionId,
  conversationId: "conversation:default" as ConversationId,
  tokenCapacity: 512,
  tokensUsed: 0,
  ...overrides
})

const makeTurnPayload = (overrides: Partial<ProcessTurnPayload>): ProcessTurnPayload => ({
  turnId: overrides.turnId ?? "turn:default",
  sessionId: overrides.sessionId ?? "session:default",
  conversationId: overrides.conversationId ?? "conversation:default",
  agentId: overrides.agentId ?? "agent:default",
  userId: overrides.userId ?? "user:test",
  channelId: overrides.channelId ?? "channel:test",
  content: overrides.content ?? "hello",
  contentBlocks: overrides.contentBlocks ?? [{ contentBlockType: "TextBlock", text: "hello" }],
  createdAt: overrides.createdAt ?? instant("2026-02-24T12:00:00.000Z"),
  inputTokens: overrides.inputTokens ?? 10,
  ...(overrides.checkpointId !== undefined ? { checkpointId: overrides.checkpointId } : {}),
  ...(overrides.invokeToolReplay !== undefined ? { invokeToolReplay: overrides.invokeToolReplay } : {}),
  ...(overrides.modelOverride !== undefined ? { modelOverride: overrides.modelOverride } : {}),
  ...(overrides.generationConfigOverride !== undefined
    ? { generationConfigOverride: overrides.generationConfigOverride }
    : {})
})

const makeMockLanguageModel = (
  capturedPrompts?: Array<string>,
  mockOptions?: {
    readonly finishReasons?: ReadonlyArray<Response.FinishReason>
    readonly failWithErrorMessage?: string
    readonly omitToolResults?: boolean
    readonly toolName?: string
    readonly toolParams?: Record<string, unknown>
    readonly useProviderInterface?: boolean
  }
): LanguageModel.Service => {
  let callCount = 0

  return {
    generateText: (options: any) => {
      if (capturedPrompts) {
        capturedPrompts.push(encodeJson(options))
      }
      if (mockOptions?.failWithErrorMessage) {
        return Effect.fail({
          _tag: "MockModelProviderError",
          message: mockOptions.failWithErrorMessage
        }) as any
      }
      const finishReasons = mockOptions?.finishReasons
      const currentCall = callCount++
      const finishReason = finishReasons
        ? (finishReasons[currentCall] ?? finishReasons[finishReasons.length - 1] ?? "stop")
        : "stop"

      const mockUsage = new Response.Usage({
        inputTokens: {
          uncached: 10,
          total: 10,
          cacheRead: undefined,
          cacheWrite: undefined
        },
        outputTokens: {
          total: 6,
          text: 6,
          reasoning: undefined
        }
      })

      const mockToolName = mockOptions?.toolName ?? "echo.text"
      const mockToolParams = mockOptions?.toolParams ?? { text: "hello" }
      const parts: Array<Response.Part<any>> = [
        Response.makePart("tool-call", {
          id: `call_${mockToolName}_${currentCall}`,
          name: mockToolName,
          params: mockToolParams,
          providerExecuted: false
        }),
        ...(mockOptions?.omitToolResults ? [] : [
          Response.makePart("tool-result", {
            id: `call_${mockToolName}_${currentCall}`,
            name: mockToolName,
            isFailure: false,
            result: mockToolParams,
            encodedResult: mockToolParams,
            providerExecuted: false,
            preliminary: false
          })
        ])
      ]

      if (finishReason !== "tool-calls") {
        parts.push(Response.makePart("text", {
          text: "assistant mock response"
        }))
      }

      parts.push(Response.makePart("finish", {
        reason: finishReason,
        usage: mockUsage,
        response: undefined
      }))

      return Effect.succeed(
        new LanguageModel.GenerateTextResponse(parts)
      ) as any
    },
    streamText: (_options: any) => {
      if (capturedPrompts) {
        capturedPrompts.push(encodeJson(_options))
      }
      if (mockOptions?.failWithErrorMessage) {
        return Stream.fail({
          _tag: "MockModelProviderError",
          message: mockOptions.failWithErrorMessage
        }) as any
      }

      const finishReasons = mockOptions?.finishReasons
      const currentCall = callCount++
      const finishReason = finishReasons
        ? (finishReasons[currentCall] ?? finishReasons[finishReasons.length - 1] ?? "stop")
        : "stop"

      const mockUsage = new Response.Usage({
        inputTokens: {
          uncached: 10,
          total: 10,
          cacheRead: undefined,
          cacheWrite: undefined
        },
        outputTokens: {
          total: 6,
          text: 6,
          reasoning: undefined
        }
      })

      const mockToolName = mockOptions?.toolName ?? "echo.text"
      const mockToolParams = mockOptions?.toolParams ?? { text: "hello" }
      const streamParts: Array<Response.StreamPart<any>> = [
        Response.makePart("tool-call", {
          id: `call_${mockToolName}_${currentCall}`,
          name: mockToolName,
          params: mockToolParams,
          providerExecuted: false
        }),
        ...(mockOptions?.omitToolResults ? [] : [
          Response.makePart("tool-result", {
            id: `call_${mockToolName}_${currentCall}`,
            name: mockToolName,
            isFailure: false,
            result: mockToolParams,
            encodedResult: mockToolParams,
            providerExecuted: false,
            preliminary: false
          })
        ])
      ]

      if (finishReason !== "tool-calls") {
        const textId = `text_${currentCall}`
        streamParts.push(
          Response.makePart("text-start", { id: textId }),
          Response.makePart("text-delta", {
            id: textId,
            delta: "assistant mock response"
          }),
          Response.makePart("text-end", { id: textId })
        )
      }

      streamParts.push(Response.makePart("finish", {
        reason: finishReason,
        usage: mockUsage,
        response: undefined
      }))

      return Stream.make(...streamParts) as any
    },
    generateObject: (_options: any) => Effect.die(new Error("generateObject not implemented in tests")) as any
  }
}

/**
 * Provider-based mock that goes through LanguageModel.make, enabling @effect/ai
 * tool resolution. Use when the test needs tool handlers to be invoked.
 */
const makeMockProvider = (
  capturedPrompts?: Array<string>,
  mockOptions?: {
    readonly finishReasons?: ReadonlyArray<Response.FinishReason>
    readonly toolName?: string
    readonly toolParams?: Record<string, unknown>
    readonly useProviderInterface?: boolean
  }
): { readonly generateText: any; readonly streamText: any } => {
  let callCount = 0

  return {
    generateText: (_providerOptions: any) => {
      if (capturedPrompts) {
        capturedPrompts.push(encodeJson(_providerOptions))
      }
      const finishReasons = mockOptions?.finishReasons
      const currentCall = callCount++
      const finishReason = finishReasons
        ? (finishReasons[currentCall] ?? finishReasons[finishReasons.length - 1] ?? "stop")
        : "stop"

      const mockToolName = mockOptions?.toolName ?? "echo.text"
      const mockToolParams = mockOptions?.toolParams ?? { text: "hello" }

      // Return raw encoded parts — @effect/ai will process tool-calls
      // via resolveToolCalls, invoking the real tool handlers
      const parts: Array<any> = [
        {
          type: "tool-call",
          id: `call_${mockToolName}_${currentCall}`,
          name: mockToolName,
          params: mockToolParams,
          providerExecuted: false
        }
      ]

      if (finishReason !== "tool-calls") {
        parts.push({ type: "text", text: "assistant mock response" })
      }

      parts.push({
        type: "finish",
        reason: finishReason,
        usage: {
          inputTokens: { uncached: 10, total: 10, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 6, text: 6, reasoning: 0 }
        },
        response: undefined
      })

      return Effect.succeed(parts)
    },
    streamText: (_providerOptions: any) => {
      if (capturedPrompts) {
        capturedPrompts.push(encodeJson(_providerOptions))
      }
      const finishReasons = mockOptions?.finishReasons
      const currentCall = callCount++
      const finishReason = finishReasons
        ? (finishReasons[currentCall] ?? finishReasons[finishReasons.length - 1] ?? "stop")
        : "stop"

      const mockToolName = mockOptions?.toolName ?? "echo.text"
      const mockToolParams = mockOptions?.toolParams ?? { text: "hello" }

      const streamParts: Array<any> = [
        {
          type: "tool-call",
          id: `call_${mockToolName}_${currentCall}`,
          name: mockToolName,
          params: mockToolParams,
          providerExecuted: false
        }
      ]

      if (finishReason !== "tool-calls") {
        const textId = `text_${currentCall}`
        streamParts.push(
          { type: "text-start", id: textId },
          { type: "text-delta", id: textId, delta: "assistant mock response" },
          { type: "text-end", id: textId }
        )
      }

      streamParts.push({
        type: "finish",
        reason: finishReason,
        usage: {
          inputTokens: { uncached: 10, total: 10, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 6, text: 6, reasoning: 0 }
        },
        response: undefined
      })

      return Stream.make(...streamParts)
    }
  }
}

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
