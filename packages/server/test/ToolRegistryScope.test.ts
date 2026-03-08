import { describe, expect, it } from "@effect/vitest"
import { NodeServices } from "@effect/platform-node"
import type { AgentId, ArtifactId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type {
  AgentState,
  ArtifactStorePort,
  CheckpointPort,
  GovernancePort,
  Instant,
  MemoryPort,
  SessionArtifactPort,
  SessionMetricsPort
} from "@template/domain/ports"
import type { SubroutineToolScope } from "@template/domain/memory"
import { DateTime, Effect, Layer, Schema, Stream } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import { MemoryPortSqlite } from "../src/MemoryPortSqlite.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import {
  ArtifactStorePortTag,
  CheckpointPortTag,
  GovernancePortTag,
  MemoryPortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag
} from "../src/PortTags.js"
import { layer as CliRuntimeLocalLayer } from "../src/tools/cli/CliRuntimeLocal.js"
import { layer as CommandBackendLocalLayer } from "../src/tools/command/CommandBackendLocal.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import { CommandHooksDefaultLayer } from "../src/tools/command/hooks/CommandHooksDefault.js"
import { FilePathPolicy } from "../src/tools/file/FilePathPolicy.js"
import { FileReadTracker } from "../src/tools/file/FileReadTracker.js"
import { FileRuntime } from "../src/tools/file/FileRuntime.js"
import { FileHooksDefaultLayer } from "../src/tools/file/hooks/FileHooksDefault.js"
import { ToolExecution } from "../src/tools/ToolExecution.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const SESSION_ID = "session:scope-test" as SessionId
const CONVERSATION_ID = "conversation:scope-test" as ConversationId
const TURN_ID = "turn:scope-test" as TurnId
const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))
const NOW = instant("2026-03-01T12:00:00.000Z")

const encodeJsonUnknown = Schema.encodeSync(Schema.UnknownFromJsonString)
const encodeJson = (value: unknown): string => encodeJsonUnknown(value)

const toToolFailure = (error: unknown): { readonly errorCode: string; readonly message: string } => ({
  errorCode: (
    typeof error === "object"
    && error !== null
    && "errorCode" in error
    && typeof (error as { readonly errorCode?: unknown }).errorCode === "string"
  )
    ? (error as { readonly errorCode: string }).errorCode
    : "ToolInvocationError",
  message: (
    typeof error === "object"
    && error !== null
    && "message" in error
    && typeof (error as { readonly message?: unknown }).message === "string"
  )
    ? (error as { readonly message: string }).message
    : String(error)
})

const invokeTool = (
  agentId: AgentId,
  toolName: string,
  params: Record<string, unknown>,
  toolScope?: SubroutineToolScope
) =>
  Effect.gen(function*() {
    const registry = yield* ToolRegistry
    const bundle = yield* registry.makeToolkit(
      {
        agentId,
        sessionId: SESSION_ID,
        conversationId: CONVERSATION_ID,
        turnId: TURN_ID,
        now: NOW,
        channelId: "channel:test"
      },
      undefined,
      toolScope
    )
    const toolkit = yield* bundle.toolkit.asEffect().pipe(
      Effect.provide(bundle.handlerLayer)
    )
    const stream = yield* toolkit.handle(toolName as any, params as any).pipe(
      Effect.mapError(toToolFailure)
    )
    const chunks = yield* Stream.runCollect(stream).pipe(
      Effect.mapError(toToolFailure)
    )
    return encodeJson(chunks)
  })

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

const makeLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer

  const governanceSqliteLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.provide(sandboxRuntimeLayer)
  )
  const governanceTagLayer = Layer.effect(
    GovernancePortTag,
    Effect.gen(function*() {
      return (yield* GovernancePortSqlite) as GovernancePort
    })
  ).pipe(Layer.provide(governanceSqliteLayer))

  const memoryPortSqliteLayer = MemoryPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const memoryPortTagLayer = Layer.effect(
    MemoryPortTag,
    Effect.gen(function*() {
      return (yield* MemoryPortSqlite) as MemoryPort
    })
  ).pipe(Layer.provide(memoryPortSqliteLayer))

  const checkpointPortSqliteLayer = CheckpointPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const checkpointPortTagLayer = Layer.effect(
    CheckpointPortTag,
    Effect.gen(function*() {
      return (yield* CheckpointPortSqlite) as CheckpointPort
    })
  ).pipe(Layer.provide(checkpointPortSqliteLayer))

  const artifactStoreLayer = Layer.succeed(ArtifactStorePortTag, {
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
  } as ArtifactStorePort)

  const sessionArtifactLayer = Layer.succeed(SessionArtifactPortTag, {
    link: () => Effect.void,
    listBySession: () => Effect.succeed([])
  } as SessionArtifactPort)

  const sessionMetricsLayer = Layer.succeed(SessionMetricsPortTag, {
    increment: () => Effect.void,
    get: () => Effect.succeed(null),
    shouldTriggerCompaction: () => Effect.succeed(false)
  } as SessionMetricsPort)

  const cliRuntimeLayer = CliRuntimeLocalLayer.pipe(
    Layer.provide(NodeServices.layer)
  )
  const commandBackendLayer = CommandBackendLocalLayer.pipe(
    Layer.provide(cliRuntimeLayer)
  )
  const commandRuntimeLayer = CommandRuntime.layer.pipe(
    Layer.provide(CommandHooksDefaultLayer),
    Layer.provide(commandBackendLayer),
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(NodeServices.layer)
  )
  const filePathPolicyLayer = FilePathPolicy.layer.pipe(
    Layer.provide(NodeServices.layer)
  )
  const fileRuntimeLayer = FileRuntime.layer.pipe(
    Layer.provide(FileHooksDefaultLayer),
    Layer.provide(FileReadTracker.layer),
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

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    AgentStatePortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer)),
    governanceSqliteLayer,
    governanceTagLayer,
    memoryPortSqliteLayer,
    memoryPortTagLayer,
    checkpointPortSqliteLayer,
    checkpointPortTagLayer,
    toolExecutionLayer,
    ToolRegistry.layer.pipe(
      Layer.provide(toolExecutionLayer),
      Layer.provide(governanceTagLayer),
      Layer.provide(memoryPortTagLayer),
      Layer.provide(mockAgentConfigLayer),
      Layer.provide(checkpointPortTagLayer),
      Layer.provide(artifactStoreLayer),
      Layer.provide(sessionArtifactLayer),
      Layer.provide(sessionMetricsLayer)
    )
  )
}

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => { rmSync(path, { force: true }) })

const makeAgentState = (overrides: Partial<AgentState>): AgentState => ({
  agentId: "agent:default" as AgentId,
  permissionMode: "Standard",
  tokenBudget: 1_000,
  maxToolIterations: 10,
  quotaPeriod: "Daily",
  tokensConsumed: 0,
  budgetResetAt: null,
  ...overrides
})

describe("ToolRegistry scope filtering", () => {
  it("allowed tool succeeds when in scope", async () => {
    const dbPath = testDatabasePath("scope-allowed")
    const layer = makeLayer(dbPath)
    const agentId = "agent:scope-allow" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const scope: SubroutineToolScope = {
        fileRead: false,
        fileWrite: false,
        shell: false,
        memoryRead: true,
        memoryWrite: true,
        notification: false
      }
      const output = yield* invokeTool(agentId, "store_memory", {
        content: "test fact"
      }, scope)
      expect(output).toContain("memoryId")
      expect(output).toContain("true")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("denied tool returns ToolNotInScope error", async () => {
    const dbPath = testDatabasePath("scope-denied")
    const layer = makeLayer(dbPath)
    const agentId = "agent:scope-deny" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const scope: SubroutineToolScope = {
        fileRead: false,
        fileWrite: false,
        shell: false,
        memoryRead: false,
        memoryWrite: false,
        notification: false
      }
      const failure = (yield* invokeTool(agentId, "store_memory", {
        content: "test"
      }, scope).pipe(Effect.flip)) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("ToolNotInScope")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("ToolNotInScope denial is recorded as governance event", async () => {
    const dbPath = testDatabasePath("scope-audit")
    const layer = makeLayer(dbPath)
    const agentId = "agent:scope-audit" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      const governance = yield* GovernancePortSqlite

      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const scope: SubroutineToolScope = {
        fileRead: false,
        fileWrite: false,
        shell: true,
        memoryRead: false,
        memoryWrite: false,
        notification: false
      }
      yield* invokeTool(agentId, "store_memory", {
        content: "test"
      }, scope).pipe(Effect.flip)

      const records = yield* governance.listToolInvocationsBySession(SESSION_ID, {})
      expect(records.totalCount).toBe(1)
      expect(records.items[0].decision).toBe("Deny")
      expect(records.items[0].reason).toContain("tool_scope_denied")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("always-allowed tools work without scope flags", async () => {
    const dbPath = testDatabasePath("scope-always")
    const layer = makeLayer(dbPath)
    const agentId = "agent:scope-always" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const scope: SubroutineToolScope = {
        fileRead: false,
        fileWrite: false,
        shell: false,
        memoryRead: false,
        memoryWrite: false,
        notification: false
      }
      const output = yield* invokeTool(agentId, "time_now", undefined as any, scope)
      expect(output).toContain("nowIso")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("send_notification is denied when notification scope is false", async () => {
    const dbPath = testDatabasePath("scope-notif-denied")
    const layer = makeLayer(dbPath)
    const agentId = "agent:scope-notif" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      const scope: SubroutineToolScope = {
        fileRead: true,
        fileWrite: true,
        shell: true,
        memoryRead: true,
        memoryWrite: true,
        notification: false
      }
      const failure = (yield* invokeTool(agentId, "send_notification", {
        recipient: "test",
        message: "hello"
      }, scope).pipe(Effect.flip)) as { readonly errorCode: string }
      expect(failure.errorCode).toBe("ToolNotInScope")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("no scope means all tools allowed", async () => {
    const dbPath = testDatabasePath("scope-none")
    const layer = makeLayer(dbPath)
    const agentId = "agent:scope-none" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Permissive",
        budgetResetAt: NOW
      }))

      // No toolScope = all tools available
      const output = yield* invokeTool(agentId, "echo_text", { text: "hello" })
      expect(output).toContain("hello")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })
})

describe("store_memory tier parameter", () => {
  it("stores with explicit EpisodicMemory tier", async () => {
    const dbPath = testDatabasePath("store-tier")
    const layer = makeLayer(dbPath)
    const agentId = "agent:store-tier" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      const memoryPort = yield* MemoryPortSqlite

      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      const output = yield* invokeTool(agentId, "store_memory", {
        content: "episodic fact",
        tier: "EpisodicMemory"
      })
      expect(output).toContain("memoryId")

      const results = yield* memoryPort.search(agentId, {
        query: "episodic",
        sort: "CreatedDesc"
      })
      expect(results.items.length).toBeGreaterThanOrEqual(1)
      expect(results.items[0].tier).toBe("EpisodicMemory")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("defaults to SemanticMemory when tier is omitted", async () => {
    const dbPath = testDatabasePath("store-default-tier")
    const layer = makeLayer(dbPath)
    const agentId = "agent:default-tier" as AgentId

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortSqlite
      const memoryPort = yield* MemoryPortSqlite

      yield* agents.upsert(makeAgentState({
        agentId,
        permissionMode: "Standard",
        budgetResetAt: NOW
      }))

      yield* invokeTool(agentId, "store_memory", {
        content: "default tier fact"
      })

      const results = yield* memoryPort.search(agentId, {
        query: "default tier",
        sort: "CreatedDesc"
      })
      expect(results.items.length).toBeGreaterThanOrEqual(1)
      expect(results.items[0].tier).toBe("SemanticMemory")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })
})
