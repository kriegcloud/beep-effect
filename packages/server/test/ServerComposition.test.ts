import { describe, expect, it } from "@effect/vitest"
import { NodeServices } from "@effect/platform-node"
import type {
  AgentStatePort,
  ArtifactStorePort,
  ChannelPort,
  CheckpointPort,
  CompactionCheckpointPort,
  GovernancePort,
  IntegrationPort,
  MemoryPort,
  SchedulePort,
  SessionArtifactPort,
  SessionMetricsPort,
  SessionTurnPort
} from "@template/domain/ports"
import { Effect, Exit, Layer, Scope } from "effect"
import { ClusterWorkflowEngine, SingleRunner } from "effect/unstable/cluster"
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
import { SessionIdleMonitor } from "../src/memory/SessionIdleMonitor.js"
import { SubroutineCatalog } from "../src/memory/SubroutineCatalog.js"
import { SubroutineControlPlane } from "../src/memory/SubroutineControlPlane.js"
import { SubroutineRunner } from "../src/memory/SubroutineRunner.js"
import { TraceWriter } from "../src/memory/TraceWriter.js"
import { TranscriptProjector } from "../src/memory/TranscriptProjector.js"
import { SessionArtifactPortSqlite } from "../src/SessionArtifactPortSqlite.js"
import { SessionMetricsPortSqlite } from "../src/SessionMetricsPortSqlite.js"
import { ArtifactStoreFsCas } from "../src/storage/ArtifactStoreFsCas.js"
import { SessionFileStore } from "../src/storage/SessionFileStore.js"
import { StorageLayout } from "../src/storage/StorageLayout.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import { CompactionCheckpointPortSqlite } from "../src/CompactionCheckpointPortSqlite.js"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import { IntegrationPortSqlite } from "../src/IntegrationPortSqlite.js"
import { MemoryPortSqlite } from "../src/MemoryPortSqlite.js"
import { SchedulePortSqlite } from "../src/SchedulePortSqlite.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import {
  AgentStatePortTag,
  ArtifactStorePortTag,
  ChannelPortTag,
  CheckpointPortTag,
  CompactionCheckpointPortTag,
  GovernancePortTag,
  IntegrationPortTag,
  MemoryPortTag,
  SchedulePortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag,
  SessionTurnPortTag
} from "../src/PortTags.js"
import { SchedulerActionExecutor } from "../src/scheduler/SchedulerActionExecutor.js"
import { layer as SchedulerCommandLayer } from "../src/scheduler/SchedulerCommandEntity.js"
import { SchedulerDispatchLoop } from "../src/scheduler/SchedulerDispatchLoop.js"
import { SchedulerTickService } from "../src/scheduler/SchedulerTickService.js"
import { SchedulerRuntime } from "../src/SchedulerRuntime.js"
import { RuntimeSupervisor } from "../src/runtime/RuntimeSupervisor.js"
import { PostCommitExecutor } from "../src/turn/PostCommitExecutor.js"
import { layer as PostCommitWorkflowLayer } from "../src/turn/PostCommitWorkflow.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import { layer as TurnProcessingWorkflowLayer } from "../src/turn/TurnProcessingWorkflow.js"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { rmSync } from "node:fs"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

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

const makeAgentConfigLayer = () =>
  AgentConfig.layerFromParsed({
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
    providers: { anthropic: { apiKeyEnv: "TEST_KEY" } },
    agents: {
      default: {
        persona: { name: "Test"  },
        promptBindings: TEST_PROMPT_BINDINGS,
        model: { provider: "anthropic", modelId: "test" },
        generation: { temperature: 0.7, maxOutputTokens: 1024 }
      }
    },
    server: { port: 3000 }
  })

// ---------------------------------------------------------------------------
// Full layer graph (mirrors server.ts PortsLive, using NodeServices for vitest)
// ---------------------------------------------------------------------------

const makePortsLiveLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer
  const runtimeSupervisorLayer = RuntimeSupervisor.layer

  const agentStatePortSqliteLayer = AgentStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const sessionTurnPortSqliteLayer = SessionTurnPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const schedulePortSqliteLayer = SchedulePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const governancePortSqliteLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.provide(sandboxRuntimeLayer)
  )

  const agentStatePortTagLayer = Layer.effect(
    AgentStatePortTag,
    Effect.gen(function*() {
      return (yield* AgentStatePortSqlite) as AgentStatePort
    })
  ).pipe(Layer.provide(agentStatePortSqliteLayer))

  const sessionTurnPortTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() {
      return (yield* SessionTurnPortSqlite) as SessionTurnPort
    })
  ).pipe(Layer.provide(sessionTurnPortSqliteLayer))

  const schedulePortTagLayer = Layer.effect(
    SchedulePortTag,
    Effect.gen(function*() {
      return (yield* SchedulePortSqlite) as SchedulePort
    })
  ).pipe(Layer.provide(schedulePortSqliteLayer))

  const governancePortTagLayer = Layer.effect(
    GovernancePortTag,
    Effect.gen(function*() {
      return (yield* GovernancePortSqlite) as GovernancePort
    })
  ).pipe(Layer.provide(governancePortSqliteLayer))

  const checkpointPortSqliteLayer = CheckpointPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const checkpointPortTagLayer = Layer.effect(
    CheckpointPortTag,
    Effect.gen(function*() {
      return (yield* CheckpointPortSqlite) as CheckpointPort
    })
  ).pipe(Layer.provide(checkpointPortSqliteLayer))

  const compactionCheckpointPortSqliteLayer = CompactionCheckpointPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const compactionCheckpointPortTagLayer = Layer.effect(
    CompactionCheckpointPortTag,
    Effect.gen(function*() {
      return (yield* CompactionCheckpointPortSqlite) as CompactionCheckpointPort
    })
  ).pipe(Layer.provide(compactionCheckpointPortSqliteLayer))

  const channelPortSqliteLayer = ChannelPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const channelPortTagLayer = Layer.effect(
    ChannelPortTag,
    Effect.gen(function*() {
      return (yield* ChannelPortSqlite) as ChannelPort
    })
  ).pipe(Layer.provide(channelPortSqliteLayer))

  const integrationPortSqliteLayer = IntegrationPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const integrationPortTagLayer = Layer.effect(
    IntegrationPortTag,
    Effect.gen(function*() {
      return (yield* IntegrationPortSqlite) as IntegrationPort
    })
  ).pipe(Layer.provide(integrationPortSqliteLayer))

  const memoryPortSqliteLayer = MemoryPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const memoryPortTagLayer = Layer.effect(
    MemoryPortTag,
    Effect.gen(function*() {
      return (yield* MemoryPortSqlite) as MemoryPort
    })
  ).pipe(Layer.provide(memoryPortSqliteLayer))

  const agentConfigLayer = makeAgentConfigLayer()
  const promptCatalogLayer = Layer.succeed(PromptCatalog, {
    get: (ref: string) => Effect.succeed(`prompt:${ref}`),
    getAgentBindings: () => Effect.succeed(TEST_PROMPT_BINDINGS),
    render: (ref: string) => Effect.succeed(`prompt:${ref}`)
  } as any)

  const storageLayoutLayer = StorageLayout.layer.pipe(
    Layer.provide(Layer.mergeAll(agentConfigLayer, NodeServices.layer))
  )

  const sessionFileStoreLayer = SessionFileStore.layer.pipe(
    Layer.provide(Layer.mergeAll(storageLayoutLayer, NodeServices.layer))
  )

  const artifactStoreFsCasLayer = ArtifactStoreFsCas.layer.pipe(
    Layer.provide(Layer.mergeAll(
      sqlInfrastructureLayer,
      storageLayoutLayer,
      agentConfigLayer,
      NodeServices.layer
    ))
  )
  const artifactStoreTagLayer = Layer.effect(
    ArtifactStorePortTag,
    Effect.gen(function*() {
      return (yield* ArtifactStoreFsCas) as ArtifactStorePort
    })
  ).pipe(Layer.provide(artifactStoreFsCasLayer))

  const sessionArtifactPortSqliteLayer = SessionArtifactPortSqlite.layer.pipe(
    Layer.provide(Layer.mergeAll(
      sqlInfrastructureLayer,
      sessionFileStoreLayer
    ))
  )
  const sessionArtifactPortTagLayer = Layer.effect(
    SessionArtifactPortTag,
    Effect.gen(function*() {
      return (yield* SessionArtifactPortSqlite) as SessionArtifactPort
    })
  ).pipe(Layer.provide(sessionArtifactPortSqliteLayer))

  const sessionMetricsPortSqliteLayer = SessionMetricsPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const sessionMetricsPortTagLayer = Layer.effect(
    SessionMetricsPortTag,
    Effect.gen(function*() {
      return (yield* SessionMetricsPortSqlite) as SessionMetricsPort
    })
  ).pipe(Layer.provide(sessionMetricsPortSqliteLayer))

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const schedulerRuntimeLayer = SchedulerRuntime.layer.pipe(
    Layer.provide(schedulePortTagLayer)
  )

  const modelRegistryLayer = ModelRegistry.layer.pipe(
    Layer.provide(agentConfigLayer)
  )

  const chatPersistenceLayer = ChatPersistence.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )

  // Use NodeServices.layer for vitest compatibility (server.ts uses BunServices.layer)
  const platformLayer = NodeServices.layer

  const cliRuntimeLayer = CliRuntimeLocalLayer.pipe(
    Layer.provide(platformLayer)
  )

  const commandBackendLayer = CommandBackendLocalLayer.pipe(
    Layer.provide(cliRuntimeLayer)
  )

  const commandRuntimeLayer = CommandRuntime.layer.pipe(
    Layer.provide(Layer.mergeAll(
      CommandHooksDefaultLayer,
      commandBackendLayer,
      sandboxRuntimeLayer,
      platformLayer
    ))
  )

  const filePathPolicyLayer = FilePathPolicy.layer.pipe(
    Layer.provide(platformLayer)
  )

  const fileRuntimeLayer = FileRuntime.layer.pipe(
    Layer.provide(Layer.mergeAll(
      FileHooksDefaultLayer,
      FileReadTracker.layer,
      filePathPolicyLayer,
      sandboxRuntimeLayer,
      platformLayer
    ))
  )

  const toolExecutionLayer = ToolExecution.layer.pipe(
    Layer.provide(Layer.mergeAll(
      fileRuntimeLayer,
      filePathPolicyLayer,
      cliRuntimeLayer,
      commandRuntimeLayer,
      sqlInfrastructureLayer,
      platformLayer
    ))
  )

  const toolRegistryLayer = ToolRegistry.layer.pipe(
    Layer.provide(Layer.mergeAll(
      toolExecutionLayer,
      governancePortTagLayer,
      memoryPortTagLayer,
      agentConfigLayer,
      checkpointPortTagLayer,
      artifactStoreTagLayer,
      sessionArtifactPortTagLayer,
      sessionMetricsPortTagLayer
    ))
  )

  const subroutineCatalogLayer = SubroutineCatalog.layer.pipe(
    Layer.provide(Layer.mergeAll(agentConfigLayer, promptCatalogLayer, platformLayer))
  )

  const traceWriterLayer = TraceWriter.layer.pipe(
    Layer.provide(Layer.mergeAll(
      platformLayer,
      agentConfigLayer,
      artifactStoreTagLayer,
      sessionArtifactPortTagLayer,
      sessionMetricsPortTagLayer
    ))
  )

  const transcriptProjectorLayer = TranscriptProjector.layer.pipe(
    Layer.provide(Layer.mergeAll(
      agentConfigLayer,
      sessionTurnPortTagLayer,
      sessionFileStoreLayer
    ))
  )

  const subroutineRunnerLayer = SubroutineRunner.layer.pipe(
    Layer.provide(Layer.mergeAll(
      toolRegistryLayer,
      chatPersistenceLayer,
      agentConfigLayer,
      promptCatalogLayer,
      modelRegistryLayer,
      governancePortTagLayer,
      traceWriterLayer,
      compactionCheckpointPortTagLayer,
      sessionMetricsPortTagLayer
    ))
  )

  const subroutineControlPlaneLayer = SubroutineControlPlane.layer.pipe(
    Layer.provide(Layer.mergeAll(
      subroutineRunnerLayer,
      subroutineCatalogLayer,
      governancePortTagLayer,
      runtimeSupervisorLayer
    ))
  )

  const schedulerCommandLayer = SchedulerCommandLayer.pipe(
    Layer.provide(Layer.mergeAll(
      clusterLayer,
      schedulerRuntimeLayer,
      governancePortTagLayer
    ))
  )

  const schedulerActionExecutorLayer = SchedulerActionExecutor.layer.pipe(
    Layer.provide(Layer.mergeAll(
      commandRuntimeLayer,
      channelPortTagLayer,
      sessionTurnPortTagLayer,
      governancePortTagLayer,
      subroutineRunnerLayer,
      subroutineCatalogLayer
    ))
  )

  const schedulerDispatchLayer = SchedulerDispatchLoop.layer.pipe(
    Layer.provide(Layer.mergeAll(
      clusterLayer,
      schedulerRuntimeLayer,
      schedulerCommandLayer,
      schedulerActionExecutorLayer
    ))
  )

  const schedulerTickLayer = SchedulerTickService.layer.pipe(
    Layer.provide(schedulerDispatchLayer),
    Layer.provide(runtimeSupervisorLayer)
  )

  const workflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
    Layer.provide(clusterLayer)
  )

  const postCommitExecutorLayer = PostCommitExecutor.layer.pipe(
    Layer.provide(Layer.mergeAll(
      agentConfigLayer,
      sessionTurnPortTagLayer,
      sessionMetricsPortTagLayer,
      subroutineControlPlaneLayer,
      subroutineCatalogLayer,
      subroutineRunnerLayer,
      transcriptProjectorLayer
    ))
  )

  const postCommitWorkflowLayer = PostCommitWorkflowLayer.pipe(
    Layer.provide(Layer.mergeAll(
      workflowEngineLayer,
      postCommitExecutorLayer
    ))
  )

  const turnProcessingWorkflowLayer = TurnProcessingWorkflowLayer.pipe(
    Layer.provide(Layer.mergeAll(
      workflowEngineLayer,
      agentStatePortTagLayer,
      governancePortTagLayer,
      toolRegistryLayer,
      chatPersistenceLayer,
      agentConfigLayer,
      promptCatalogLayer,
      modelRegistryLayer,
      checkpointPortTagLayer,
      sessionMetricsPortTagLayer,
      subroutineControlPlaneLayer,
      transcriptProjectorLayer,
      subroutineCatalogLayer
    ).pipe(
      Layer.provideMerge(sessionTurnPortTagLayer)
    ))
  )

  const turnProcessingRuntimeLayer = TurnProcessingRuntime.layer.pipe(
    Layer.provide(workflowEngineLayer)
  )

  const sessionIdleMonitorLayer = SessionIdleMonitor.layer.pipe(
    Layer.provide(Layer.mergeAll(
      channelPortTagLayer,
      subroutineControlPlaneLayer,
      subroutineCatalogLayer,
      agentConfigLayer,
      runtimeSupervisorLayer
    ))
  )

  const portTagsLayer = Layer.mergeAll(
    memoryPortSqliteLayer,
    memoryPortTagLayer,
    agentStatePortTagLayer,
    sessionTurnPortTagLayer,
    sessionMetricsPortTagLayer,
    schedulePortTagLayer,
    governancePortTagLayer,
    checkpointPortTagLayer,
    compactionCheckpointPortTagLayer,
    artifactStoreTagLayer,
    sessionArtifactPortTagLayer,
    channelPortTagLayer,
    integrationPortTagLayer
  )

  const schedulerLayer = schedulerTickLayer.pipe(
    Layer.provideMerge(schedulerDispatchLayer),
    Layer.provideMerge(schedulerCommandLayer),
    Layer.provideMerge(schedulerRuntimeLayer)
  )

  const workflowLayer = turnProcessingRuntimeLayer.pipe(
    Layer.provideMerge(turnProcessingWorkflowLayer),
    Layer.provideMerge(postCommitWorkflowLayer)
  )

  return workflowLayer.pipe(
    Layer.provideMerge(toolRegistryLayer),
    Layer.provideMerge(modelRegistryLayer),
    Layer.provideMerge(chatPersistenceLayer),
    Layer.provideMerge(agentConfigLayer),
    Layer.provideMerge(promptCatalogLayer),
    Layer.provideMerge(schedulerLayer),
    Layer.provideMerge(portTagsLayer),
    Layer.provideMerge(memoryPortSqliteLayer),
    Layer.provideMerge(subroutineCatalogLayer),
    Layer.provideMerge(subroutineRunnerLayer),
    Layer.provideMerge(subroutineControlPlaneLayer),
    Layer.provideMerge(sessionIdleMonitorLayer),
    Layer.provideMerge(runtimeSupervisorLayer),
    Layer.provideMerge(clusterLayer)
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ServerComposition", () => {
  it.effect("PortsLive layer graph builds without missing dependencies", () => {
    const dbPath = testDatabasePath("server-composition")

    return Effect.gen(function*() {
      const scope = yield* Scope.make()
      const exit = yield* Layer.buildWithScope(scope)(makePortsLiveLayer(dbPath)).pipe(
        Effect.exit
      )
      yield* Scope.close(scope, Exit.void)

      expect(Exit.isSuccess(exit)).toBe(true)
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})
