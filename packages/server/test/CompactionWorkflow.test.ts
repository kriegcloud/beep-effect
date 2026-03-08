import { describe, expect, it } from "@effect/vitest"
import type {
  AgentId,
  ArtifactId,
  ConversationId,
  SessionId,
  TurnId
} from "@template/domain/ids"
import type {
  CompactionCheckpointPort,
  CompactionWorkflowResult,
  ExecuteCompactionPayload,
  GovernancePort,
  Instant
} from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { ClusterWorkflowEngine, SingleRunner } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { CompactionRunStatePortSqlite } from "../src/CompactionRunStatePortSqlite.js"
import { CompactionCheckpointPortTag, GovernancePortTag } from "../src/PortTags.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { CompactionCoordinator } from "../src/memory/compaction/CompactionCoordinator.js"
import {
  CompactionWorkflow,
  layer as CompactionWorkflowLayer
} from "../src/memory/compaction/CompactionWorkflow.js"

const instant = (iso: string): Instant => DateTime.fromDateUnsafe(new Date(iso))

const makePayload = (params: {
  readonly turnId: TurnId
  readonly conversationId?: ConversationId
}): ExecuteCompactionPayload => ({
  triggerSource: "PostCommitMetrics",
  agentId: "agent:compaction" as AgentId,
  sessionId: "session:compaction" as SessionId,
  conversationId: params.conversationId ?? ("conversation:compaction" as ConversationId),
  turnId: params.turnId,
  triggeredAt: instant("2026-03-03T12:00:00.000Z")
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

const makeCompactionWorkflowLayer = (
  dbPath: string,
  coordinatorRun: (payload: ExecuteCompactionPayload) => Effect.Effect<CompactionWorkflowResult>
) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )
  const workflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
    Layer.provide(clusterLayer)
  )

  const runStateLayer = CompactionRunStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )

  const coordinatorLayer = Layer.succeed(CompactionCoordinator, {
    run: coordinatorRun
  } as any)

  const governanceLayer = Layer.succeed(GovernancePortTag, {
    writeAudit: () => Effect.void,
    listAuditEntries: () => Effect.succeed([])
  } as unknown as GovernancePort)

  const checkpointLayer = Layer.succeed(CompactionCheckpointPortTag, {
    create: () => Effect.void,
    getLatestForSubroutine: () => Effect.succeed(null),
    listBySession: () => Effect.succeed([])
  } as unknown as CompactionCheckpointPort)

  const compactionWorkflowLayer = CompactionWorkflowLayer.pipe(
    Layer.provide(Layer.mergeAll(
      workflowEngineLayer,
      runStateLayer,
      coordinatorLayer,
      governanceLayer,
      checkpointLayer
    ))
  )

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    clusterLayer,
    workflowEngineLayer,
    runStateLayer,
    coordinatorLayer,
    governanceLayer,
    checkpointLayer,
    compactionWorkflowLayer
  )
}

describe("CompactionWorkflow", () => {
  it.effect("uses sessionId+turnId idempotency across cold restart", () => {
    const dbPath = testDatabasePath("compaction-workflow-idempotency")
    const payload = makePayload({ turnId: "turn:idempotent" as TurnId })

    const firstLayer = makeCompactionWorkflowLayer(
      dbPath,
      (input) =>
        Effect.succeed({
          status: "Applied",
          sessionId: input.sessionId,
          turnId: input.turnId,
          detailsArtifactId: "artifact:compaction" as ArtifactId,
          message: "ok"
        })
    )

    const secondLayer = makeCompactionWorkflowLayer(
      dbPath,
      (input) =>
        Effect.succeed({
          status: "Applied",
          sessionId: input.sessionId,
          turnId: input.turnId,
          detailsArtifactId: "artifact:compaction" as ArtifactId,
          message: "ok"
        })
    )

    return Effect.gen(function*() {
      const firstExecutionId = yield* CompactionWorkflow.execute(payload, { discard: true }).pipe(
        Effect.provide(firstLayer)
      )

      const secondExecutionId = yield* CompactionWorkflow.execute(
        {
          ...payload,
          conversationId: "conversation:other" as ConversationId
        },
        { discard: true }
      ).pipe(Effect.provide(secondLayer))

      expect(firstExecutionId).toBe(secondExecutionId)
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("different turns map to different durable execution ids across restart", () => {
    const dbPath = testDatabasePath("compaction-workflow-execid-restart")
    const firstPayload = makePayload({ turnId: "turn:first" as TurnId })
    const secondPayload = makePayload({ turnId: "turn:second" as TurnId })

    const firstLayer = makeCompactionWorkflowLayer(
      dbPath,
      (input) =>
        Effect.succeed({
          status: "Applied",
          sessionId: input.sessionId,
          turnId: input.turnId,
          detailsArtifactId: null,
          message: "done"
        })
    )

    const secondLayer = makeCompactionWorkflowLayer(
      dbPath,
      (input) =>
        Effect.succeed({
          status: "Applied",
          sessionId: input.sessionId,
          turnId: input.turnId,
          detailsArtifactId: null,
          message: "done"
        })
    )

    return Effect.gen(function*() {
      const firstExecutionId = yield* CompactionWorkflow.execute(firstPayload, { discard: true }).pipe(
        Effect.provide(firstLayer)
      )
      const secondExecutionId = yield* CompactionWorkflow.execute(secondPayload, { discard: true }).pipe(
        Effect.provide(secondLayer)
      )
      const repeatedFirstExecutionId = yield* CompactionWorkflow.execute(firstPayload, { discard: true }).pipe(
        Effect.provide(secondLayer)
      )

      expect(firstExecutionId).not.toBe(secondExecutionId)
      expect(repeatedFirstExecutionId).toBe(firstExecutionId)
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})
