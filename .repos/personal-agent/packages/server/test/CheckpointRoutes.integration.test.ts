import { NodeHttpServer } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type {
  AgentId,
  ChannelId,
  CheckpointId,
  ConversationId,
  SessionId
} from "@template/domain/ids"
import type {
  AgentState,
  ChannelRecord,
  CheckpointPort,
  CheckpointRecord,
  GovernancePort,
  Instant,
  SessionState,
  SessionTurnPort
} from "@template/domain/ports"
import { CheckpointAlreadyDecided } from "@template/domain/errors"
import { DateTime, Effect, Layer, Schema } from "effect"
import type * as Scope from "effect/Scope"
import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as Response from "effect/unstable/ai/Response"
import * as Toolkit from "effect/unstable/ai/Toolkit"
import { ClusterWorkflowEngine, Sharding, SingleRunner } from "effect/unstable/cluster"
import { HttpRouter } from "effect/unstable/http"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import * as ChatPersistence from "../src/ai/ChatPersistence.js"
import { ModelRegistry } from "../src/ai/ModelRegistry.js"
import { ToolRegistry } from "../src/ai/ToolRegistry.js"
import { ChannelCore } from "../src/ChannelCore.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import { layer as CheckpointRoutesLayer } from "../src/gateway/CheckpointRoutes.js"
import {
  SubroutineCatalog,
  type SubroutineCatalogService
} from "../src/memory/SubroutineCatalog.js"
import {
  SubroutineControlPlane,
  type SubroutineControlPlaneService
} from "../src/memory/SubroutineControlPlane.js"
import {
  TranscriptProjector,
  type TranscriptProjectorService
} from "../src/memory/TranscriptProjector.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import {
  AgentStatePortTag,
  ChannelPortTag,
  CheckpointPortTag,
  GovernancePortTag,
  SessionTurnPortTag
} from "../src/PortTags.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { makeCheckpointPayloadHash } from "../src/checkpoints/ReplayHash.js"
import { PostCommitExecutor } from "../src/turn/PostCommitExecutor.js"
import { layer as PostCommitWorkflowLayer } from "../src/turn/PostCommitWorkflow.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import { layer as TurnProcessingWorkflowLayer } from "../src/turn/TurnProcessingWorkflow.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const encodeJson = Schema.encodeSync(Schema.UnknownFromJsonString)

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

const asScopedTest = (
  effect: Effect.Effect<void, unknown, unknown>
): Effect.Effect<void, unknown, Scope.Scope> =>
  effect as unknown as Effect.Effect<void, unknown, Scope.Scope>

const nowInstant = (): Instant => DateTime.fromDateUnsafe(new Date("2026-03-02T12:00:00.000Z"))

const makeDeterministicLanguageModel = (): LanguageModel.Service => ({
  generateText: (_options: unknown) => {
    const usage = new Response.Usage({
      inputTokens: {
        uncached: 10,
        total: 10,
        cacheRead: undefined,
        cacheWrite: undefined
      },
      outputTokens: {
        total: 4,
        text: 4,
        reasoning: undefined
      }
    })

    return Effect.succeed(new LanguageModel.GenerateTextResponse([
      Response.makePart("text", { text: "checkpoint integration response" }),
      Response.makePart("finish", { reason: "stop", usage, response: undefined })
    ])) as any
  }
} as any)

const makeToolRegistryStubLayer = () => {
  const emptyToolkit = Toolkit.empty
  const emptyToolkitLayer = emptyToolkit.toLayer({})

  return Layer.succeed(ToolRegistry, {
    makeToolkit: () =>
      Effect.succeed({
        toolkit: emptyToolkit,
        handlerLayer: emptyToolkitLayer as any
      }),
    executeApprovedCheckpointTool: () =>
      Effect.die("ToolRegistry.executeApprovedCheckpointTool should not be called in ReadMemory integration tests")
  } as any)
}

const makeSeedLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  return Layer.mergeAll(
    AgentStatePortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer)),
    SessionTurnPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer)),
    ChannelPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer)),
    CheckpointPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  )
}

const seedReplayCheckpoint = (params: {
  readonly dbPath: string
  readonly channelId: ChannelId
  readonly checkpointId: CheckpointId
  readonly replayContent: string
  readonly tamperedHash?: boolean
}) =>
  Effect.gen(function*() {
    const agentStatePort = yield* AgentStatePortSqlite
    const sessionTurnPort = yield* SessionTurnPortSqlite
    const channelPort = yield* ChannelPortSqlite
    const checkpointPort = yield* CheckpointPortSqlite

    const requestedAt = nowInstant()
    const agentId = "agent:bootstrap" as AgentId
    const sessionId = `session:${params.channelId}` as SessionId
    const conversationId = `conv:${params.channelId}` as ConversationId

    const replayPayload = {
      replayPayloadVersion: 1,
      kind: "ReadMemory",
      content: params.replayContent,
      contentBlocks: [{ contentBlockType: "TextBlock", text: params.replayContent }],
      turnContext: {
        agentId,
        sessionId,
        conversationId,
        channelId: params.channelId,
        turnId: "turn:blocked",
        createdAt: DateTime.formatIso(requestedAt)
      }
    } as const

    const payloadHash = params.tamperedHash
      ? "tampered-hash"
      : (yield* makeCheckpointPayloadHash("ReadMemory", replayPayload))

    yield* agentStatePort.upsert({
      agentId,
      permissionMode: "Standard",
      tokenBudget: 500,
      maxToolIterations: 3,
      quotaPeriod: "Daily",
      tokensConsumed: 0,
      budgetResetAt: null
    } satisfies AgentState)

    yield* sessionTurnPort.startSession({
      sessionId,
      conversationId,
      tokenCapacity: 1000,
      tokensUsed: 0
    } satisfies SessionState)

    yield* channelPort.create({
      channelId: params.channelId,
      channelType: "CLI",
      agentId,
      activeSessionId: sessionId,
      activeConversationId: conversationId,
      capabilities: ["SendText"],
      modelOverride: null,
      generationConfigOverride: null,
      createdAt: requestedAt
    } satisfies ChannelRecord)

    yield* checkpointPort.create({
      checkpointId: params.checkpointId,
      agentId,
      sessionId,
      channelId: params.channelId,
      turnId: "turn:blocked",
      action: "ReadMemory",
      policyId: null,
      reason: "approval required",
      payloadJson: encodeJson(replayPayload),
      payloadHash,
      status: "Pending",
      requestedAt,
      decidedAt: null,
      decidedBy: null,
      consumedAt: null,
      consumedBy: null,
      expiresAt: null
    } satisfies CheckpointRecord)
  }).pipe(
    Effect.provide(makeSeedLayer(params.dbPath))
  )

const makeIntegrationLayer = (
  dbPath: string,
  options?: {
    readonly forceConsumeApprovedFailure?: boolean
  }
) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const agentStateSqliteLayer = AgentStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const sessionTurnSqliteLayer = SessionTurnPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const channelPortSqliteLayer = ChannelPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const checkpointPortSqliteLayer = CheckpointPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )

  const agentStateTagLayer = Layer.effect(
    AgentStatePortTag,
    Effect.gen(function*() {
      return yield* AgentStatePortSqlite
    })
  ).pipe(Layer.provide(agentStateSqliteLayer))

  const sessionTurnTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() {
      return (yield* SessionTurnPortSqlite) as SessionTurnPort
    })
  ).pipe(Layer.provide(sessionTurnSqliteLayer))

  const channelPortTagLayer = Layer.effect(
    ChannelPortTag,
    Effect.gen(function*() {
      return yield* ChannelPortSqlite
    })
  ).pipe(Layer.provide(channelPortSqliteLayer))

  const checkpointPortTagLayer = Layer.effect(
    CheckpointPortTag,
    Effect.gen(function*() {
      const checkpointPort = (yield* CheckpointPortSqlite) as CheckpointPort
      if (options?.forceConsumeApprovedFailure !== true) {
        return checkpointPort
      }

      return {
        ...checkpointPort,
        consumeApproved: (checkpointId) =>
          Effect.fail(
            new CheckpointAlreadyDecided({
              checkpointId,
              currentStatus: "Approved"
            })
          )
      } satisfies CheckpointPort
    })
  ).pipe(Layer.provide(checkpointPortSqliteLayer))

  const governanceStubLayer = Layer.succeed(
    GovernancePortTag,
    {
      evaluatePolicy: () =>
        Effect.succeed({
          decision: "RequireApproval",
          policyId: null,
          toolDefinitionId: null,
          reason: "forced_require_approval"
        }),
      writeAudit: () => Effect.void
    } satisfies Pick<GovernancePort, "evaluatePolicy" | "writeAudit"> as any
  )

  const agentConfigLayer = AgentConfig.layerFromParsed(withTestPromptsConfig({
    providers: { anthropic: { apiKeyEnv: "TEST_KEY" } },
    agents: {
      default: {
        persona: { name: "Integration"  },
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
        model: { provider: "anthropic", modelId: "integration-model" },
        generation: { temperature: 0.1, maxOutputTokens: 256 }
      }
    },
    server: { port: 3000 }
  }))

  const modelRegistryLayer = Layer.effect(
    ModelRegistry,
    Effect.succeed({
      get: () =>
        Effect.succeed(
          Layer.succeed(LanguageModel.LanguageModel, makeDeterministicLanguageModel())
        )
    })
  )

  const chatPersistenceLayer = ChatPersistence.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )

  const toolRegistryStubLayer = makeToolRegistryStubLayer()

  const subroutineControlPlaneLayer = Layer.succeed(
    SubroutineControlPlane,
    {
      enqueue: () => Effect.succeed({ accepted: true, reason: "dispatched", runId: "noop-run" }),
      execute: (request) =>
        Effect.succeed({
          accepted: true,
          subroutineId: request.subroutineId,
          runId: "noop-run",
          success: true,
          errorTag: null,
          reason: "completed"
        }),
      dispatchByTrigger: () => Effect.succeed([]),
      snapshot: () =>
        Effect.succeed({
          queueDepth: 0,
          inFlightCount: 0,
          dedupeEntries: 0,
          lastWorkerError: null
        })
    } satisfies SubroutineControlPlaneService as any
  )

  const subroutineCatalogLayer = Layer.succeed(
    SubroutineCatalog,
    {
      getByTrigger: () => Effect.succeed([]),
      getById: () => Effect.die("SubroutineNotFound")
    } satisfies SubroutineCatalogService as any
  )

  const transcriptProjectorLayer = Layer.succeed(
    TranscriptProjector,
    {
      appendTurn: () => Effect.void,
      projectSession: () => Effect.void,
      projectFromStore: () => Effect.void
    } satisfies TranscriptProjectorService as any
  )

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const workflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
    Layer.provide(clusterLayer)
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
    Layer.provide(governanceStubLayer),
    Layer.provide(toolRegistryStubLayer),
    Layer.provide(chatPersistenceLayer),
    Layer.provide(agentConfigLayer),
    Layer.provide(modelRegistryLayer),
    Layer.provide(checkpointPortTagLayer),
    Layer.provide(subroutineControlPlaneLayer),
    Layer.provide(transcriptProjectorLayer),
    Layer.provide(subroutineCatalogLayer)
  )

  const turnRuntimeLayer = TurnProcessingRuntime.layer.pipe(
    Layer.provide(workflowEngineLayer)
  )

  const mockShardingLayer = Layer.succeed(Sharding.Sharding, {} as any)

  const channelCoreLayer = ChannelCore.layer.pipe(
    Layer.provide(agentStateTagLayer),
    Layer.provide(channelPortTagLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(checkpointPortTagLayer),
    Layer.provide(turnRuntimeLayer),
    Layer.provide(mockShardingLayer as any),
    Layer.provide(agentConfigLayer),
    Layer.provide(toolRegistryStubLayer)
  )

  return Layer.mergeAll(
    channelCoreLayer,
    turnWorkflowLayer,
    postCommitWorkflowLayer
  )
}

describe("CheckpointRoutes integration", () => {
  it.effect("approved replay with tampered payload hash emits checkpoint_payload_mismatch and stays retryable", () => {
    const dbPath = testDatabasePath("checkpoint-routes-hash-mismatch")
    return asScopedTest(Effect.gen(function*() {
      yield* HttpRouter.serve(CheckpointRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeIntegrationLayer(dbPath)),
        Layer.build
      )

      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      yield* seedReplayCheckpoint({
        dbPath,
        channelId,
        checkpointId,
        replayContent: "read memory for replay",
        tamperedHash: true
      })

      const client = yield* HttpClient.HttpClient
      const decideReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Approved", decidedBy: "user:cli:local" })
      )

      const decideResponse = yield* client.execute(decideReq)
      const decideBody = yield* decideResponse.text
      expect(decideResponse.status).toBe(200)
      expect(decideBody).toContain("turn.failed")
      expect(decideBody).toContain("checkpoint_payload_mismatch")

      const persistedResponse = yield* client.get(`/checkpoints/${checkpointId}`)
      expect(persistedResponse.status).toBe(200)
      const persisted = (yield* persistedResponse.json) as Record<string, unknown>
      expect(persisted.status).toBe("Approved")
      expect(persisted.consumedAt).toBeNull()
      expect(persisted.consumedBy).toBeNull()
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    ))
  })

  it.effect("consumed transition failure keeps checkpoint Approved while replay stream starts", () => {
    const dbPath = testDatabasePath("checkpoint-routes-consume-failure")
    return asScopedTest(Effect.gen(function*() {
      yield* HttpRouter.serve(CheckpointRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeIntegrationLayer(dbPath, { forceConsumeApprovedFailure: true })),
        Layer.build
      )

      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      yield* seedReplayCheckpoint({
        dbPath,
        channelId,
        checkpointId,
        replayContent: "read memory with consume transition failure"
      })

      const client = yield* HttpClient.HttpClient
      const decideReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Approved", decidedBy: "user:cli:local" })
      )

      const decideResponse = yield* client.execute(decideReq)
      const decideBody = yield* decideResponse.text
      expect(decideResponse.status).toBe(200)
      expect(decideBody).toContain("turn.started")

      const persistedResponse = yield* client.get(`/checkpoints/${checkpointId}`)
      expect(persistedResponse.status).toBe(200)
      const persisted = (yield* persistedResponse.json) as Record<string, unknown>
      expect(persisted.status).toBe("Approved")
      expect(persisted.consumedAt).toBeNull()
      expect(persisted.consumedBy).toBeNull()
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    ))
  })

  it.effect("concurrent decide requests on same checkpoint yield one success and one conflict", () => {
    const dbPath = testDatabasePath("checkpoint-routes-concurrent-decide")
    return asScopedTest(Effect.gen(function*() {
      yield* HttpRouter.serve(CheckpointRoutesLayer, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeIntegrationLayer(dbPath)),
        Layer.build
      )

      const channelId = `channel:${crypto.randomUUID()}` as ChannelId
      const checkpointId = `checkpoint:${crypto.randomUUID()}` as CheckpointId
      yield* seedReplayCheckpoint({
        dbPath,
        channelId,
        checkpointId,
        replayContent: "read memory for concurrent decide"
      })

      const client = yield* HttpClient.HttpClient
      const approvedReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Approved", decidedBy: "user:cli:local" })
      )
      const rejectedReq = yield* HttpClientRequest.post(`/checkpoints/${checkpointId}/decide`).pipe(
        HttpClientRequest.bodyJson({ decision: "Rejected", decidedBy: "user:cli:local" })
      )

      const [approvedResult, rejectedResult] = yield* Effect.all([
        client.execute(approvedReq).pipe(
          Effect.flatMap((response) =>
            response.text.pipe(
              Effect.map((body) => ({
                status: response.status,
                body
              }))
            )
          )
        ),
        client.execute(rejectedReq).pipe(
          Effect.flatMap((response) =>
            response.text.pipe(
              Effect.map((body) => ({
                status: response.status,
                body
              }))
            )
          )
        )
      ], { concurrency: 2 })

      const statuses = [approvedResult.status, rejectedResult.status].sort((a, b) => a - b)
      expect(statuses).toEqual([200, 409])
      expect(`${approvedResult.body}\n${rejectedResult.body}`).toContain("CheckpointAlreadyDecided")
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    ))
  })
})
