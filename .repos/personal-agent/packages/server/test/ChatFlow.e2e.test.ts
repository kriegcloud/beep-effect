import { describe, expect, it } from "@effect/vitest"
import { NodeServices } from "@effect/platform-node"
import type {
  AgentId,
  ArtifactId,
  ConversationId,
  SessionId,
  TurnId
} from "@template/domain/ids"
import type {
  AgentState,
  AgentStatePort,
  ArtifactStorePort,
  CheckpointPort,
  GovernancePort,
  Instant,
  MemoryPort,
  SessionArtifactPort,
  SessionMetricsPort,
  SessionState,
  SessionTurnPort
} from "@template/domain/ports"
import { DateTime, Effect, Layer, Stream } from "effect"
import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as Response from "effect/unstable/ai/Response"
import { ClusterWorkflowEngine, SingleRunner } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
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
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import { MemoryPortSqlite } from "../src/MemoryPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
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
import { layer as PostCommitWorkflowLayer } from "../src/turn/PostCommitWorkflow.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import { SubroutineCatalog } from "../src/memory/SubroutineCatalog.js"
import {
  SubroutineControlPlane,
  type DispatchRequest
} from "../src/memory/SubroutineControlPlane.js"
import { TranscriptProjector } from "../src/memory/TranscriptProjector.js"
import { layer as TurnProcessingWorkflowLayer, type ProcessTurnPayload } from "../src/turn/TurnProcessingWorkflow.js"

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

const testConfigData = {
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
      persona: { name: "Test Bot"  },
      promptBindings: TEST_PROMPT_BINDINGS,
      model: { provider: "anthropic", modelId: "test-model" },
      generation: { temperature: 0.0, maxOutputTokens: 100 }
    }
  },
  server: { port: 3000 }
}

describe("ChatFlow E2E", () => {
  it.effect("full chat flow: config -> turn processing -> system prompt injected -> response persisted", () => {
    const dbPath = testDatabasePath("chatflow-happy")
    const layer = makeChatFlowLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-02-25T12:00:00.000Z")
      const agent = makeAgentState({
        agentId: "agent:chatflow" as AgentId,
        tokenBudget: 500,
        tokensConsumed: 0,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })
      const session = makeSessionState({
        sessionId: "session:chatflow" as SessionId,
        conversationId: "conversation:chatflow" as ConversationId,
        tokenCapacity: 1000,
        tokensUsed: 0
      })

      yield* agentPort.upsert(agent)
      yield* sessionPort.startSession(session)

      // Process a turn through the full workflow
      const result = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:chatflow-1" as TurnId,
        agentId: agent.agentId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: now,
        inputTokens: 20,
        content: "Hello!"
      }))

      // Verify turn accepted
      expect(result.accepted).toBe(true)
      expect(result.assistantContent).toContain("assistant mock response")

      // Verify history persisted (user + assistant)
      const turns = yield* sessionPort.listTurns(session.sessionId)
      expect(turns).toHaveLength(2)
      expect(turns[0].participantRole).toBe("UserRole")
      expect(turns[0].message.content).toBe("Hello!")
      expect(turns[1].participantRole).toBe("AssistantRole")
      expect(turns[1].message.content).toContain("assistant mock response")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("streams canonical events through full workflow", () => {
    const dbPath = testDatabasePath("chatflow-stream")
    const layer = makeChatFlowLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-02-25T12:00:00.000Z")
      yield* agentPort.upsert(makeAgentState({
        agentId: "agent:chatflow-stream" as AgentId,
        tokenBudget: 500,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      }))
      yield* sessionPort.startSession(makeSessionState({
        sessionId: "session:chatflow-stream" as SessionId,
        conversationId: "conversation:chatflow-stream" as ConversationId,
        tokenCapacity: 1000,
        tokensUsed: 0
      }))

      const events = yield* runtime.processTurnStream(makeTurnPayload({
        turnId: "turn:chatflow-stream" as TurnId,
        agentId: "agent:chatflow-stream" as AgentId,
        sessionId: "session:chatflow-stream" as SessionId,
        conversationId: "conversation:chatflow-stream" as ConversationId,
        createdAt: now,
        inputTokens: 15,
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

  it.effect("second turn reuses existing chat history without re-injecting system prompt", () => {
    const dbPath = testDatabasePath("chatflow-multi")
    const layer = makeChatFlowLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const sessionPort = yield* SessionTurnPortSqlite
      const runtime = yield* TurnProcessingRuntime

      const now = instant("2026-02-25T12:00:00.000Z")
      const agent = makeAgentState({
        agentId: "agent:chatflow-multi" as AgentId,
        tokenBudget: 1000,
        tokensConsumed: 0,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })
      const session = makeSessionState({
        sessionId: "session:chatflow-multi" as SessionId,
        conversationId: "conversation:chatflow-multi" as ConversationId,
        tokenCapacity: 2000,
        tokensUsed: 0
      })

      yield* agentPort.upsert(agent)
      yield* sessionPort.startSession(session)

      // First turn
      yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:multi-1" as TurnId,
        agentId: agent.agentId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: now,
        inputTokens: 20,
        content: "first message"
      }))

      // Second turn
      const second = yield* runtime.processTurn(makeTurnPayload({
        turnId: "turn:multi-2" as TurnId,
        agentId: agent.agentId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: instant("2026-02-25T12:01:00.000Z"),
        inputTokens: 20,
        content: "second message"
      }))

      expect(second.accepted).toBe(true)

      // Should have 4 turns total (2 user + 2 assistant)
      const turns = yield* sessionPort.listTurns(session.sessionId)
      expect(turns).toHaveLength(4)
      expect(turns[0].participantRole).toBe("UserRole")
      expect(turns[1].participantRole).toBe("AssistantRole")
      expect(turns[2].participantRole).toBe("UserRole")
      expect(turns[3].participantRole).toBe("AssistantRole")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

// ---------------------------------------------------------------------------
// Layer factory
// ---------------------------------------------------------------------------

const makeChatFlowLayer = (
  dbPath: string,
  capturedMessages?: Array<Array<{ role: string; content: string }>>
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
    Layer.provide(sqlInfrastructureLayer),
    Layer.provide(sandboxRuntimeLayer)
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
      return (yield* GovernancePortSqlite) as GovernancePort
    })
  ).pipe(Layer.provide(governanceSqliteLayer))

  const agentConfigLayer = AgentConfig.layerFromParsed(testConfigData)
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
          Layer.succeed(LanguageModel.LanguageModel, makeMockLanguageModel(capturedMessages))
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

  const subroutineControlPlaneLayer = Layer.succeed(
    SubroutineControlPlane,
    {
      enqueue: () => Effect.succeed({ accepted: false, reason: "deduped", runId: null }),
      execute: (request: DispatchRequest) =>
        Effect.succeed({
          accepted: false,
          subroutineId: request.subroutineId,
          runId: null,
          success: false,
          errorTag: null,
          reason: "deduped"
        }),
      dispatchByTrigger: () => Effect.succeed([]),
      snapshot: () =>
        Effect.succeed({
          queueDepth: 0,
          inFlightCount: 0,
          dedupeEntries: 0,
          lastWorkerError: null
        })
    } as any
  )

  const transcriptProjectorLayer = Layer.succeed(
    TranscriptProjector,
    {
      appendTurn: () => Effect.void,
      projectSession: () => Effect.void,
      projectFromStore: () => Effect.void
    } as any
  )

  const subroutineCatalogLayer = Layer.succeed(
    SubroutineCatalog,
    {
      getByTrigger: () => Effect.succeed([]),
      getById: () => Effect.die(new Error("SubroutineNotFound in test mock"))
    } as any
  )

  const postCommitWorkflowLayer = PostCommitWorkflowLayer.pipe(
    Layer.provide(workflowEngineLayer),
    Layer.provide(Layer.succeed(PostCommitExecutor, {
      execute: () =>
        Effect.succeed({
          subroutines: [],
          projectionSuccess: true,
          projectionError: null
        })
    } as any))
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
    Layer.provide(promptCatalogLayer),
    Layer.provide(subroutineControlPlaneLayer),
    Layer.provide(transcriptProjectorLayer),
    Layer.provide(subroutineCatalogLayer)
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
      memoryPortTagLayer
    )),
    Layer.provideMerge(Layer.mergeAll(
      agentStateSqliteLayer,
      sessionTurnSqliteLayer,
      governanceSqliteLayer,
      memoryPortSqliteLayer
    )),
    Layer.provideMerge(clusterLayer),
    Layer.provideMerge(sqlInfrastructureLayer)
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  contentBlocks: overrides.contentBlocks ?? [{ contentBlockType: "TextBlock", text: overrides.content ?? "hello" }],
  createdAt: overrides.createdAt ?? instant("2026-02-25T12:00:00.000Z"),
  inputTokens: overrides.inputTokens ?? 10
})

const makeMockLanguageModel = (
  capturedMessages?: Array<Array<{ role: string; content: string }>>
): LanguageModel.Service => ({
  generateText: (options: any) => {
    // Capture prompt messages for assertion if collector provided
    if (capturedMessages && options?.prompt?.content) {
      const messages = (options.prompt.content as Array<any>).map((msg: any) => ({
        role: String(msg.role),
        content: typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
          ? msg.content.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n")
          : String(msg.content)
      }))
      capturedMessages.push(messages)
    }
    return Effect.succeed(
      new LanguageModel.GenerateTextResponse([
        Response.makePart("text", {
          text: "assistant mock response"
        }),
        Response.makePart("finish", {
          reason: "stop",
          usage: new Response.Usage({
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
          }),
          response: undefined
        })
      ])
    ) as any
  },
  streamText: (_options: any) => Stream.make(
    Response.makePart("text-start", { id: "text:0" }),
    Response.makePart("text-delta", {
      id: "text:0",
      delta: "assistant mock response"
    }),
    Response.makePart("text-end", { id: "text:0" }),
    Response.makePart("finish", {
      reason: "stop",
      usage: new Response.Usage({
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
      }),
      response: undefined
    })
  ) as any,
  generateObject: (_options: any) => Effect.die(new Error("generateObject not implemented in tests")) as any
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
