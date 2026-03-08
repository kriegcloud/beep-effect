import { describe, expect, it } from "@effect/vitest"
import { NodeFileSystem, NodePath } from "@effect/platform-node"
import type { SessionId, TurnId, ToolInvocationId } from "@template/domain/ids"
import { DateTime, Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { SessionArtifactPortSqlite } from "../src/SessionArtifactPortSqlite.js"
import { SessionMetricsPortSqlite } from "../src/SessionMetricsPortSqlite.js"
import { ArtifactStoreFsCas } from "../src/storage/ArtifactStoreFsCas.js"
import { SessionFileStore } from "../src/storage/SessionFileStore.js"
import { StorageLayout } from "../src/storage/StorageLayout.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const TEST_SESSION_ID = "session:storage-test" as SessionId
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const makeBaseDir = (name: string): string => {
  const dir = join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

const cleanupBaseDir = (baseDir: string) =>
  Effect.sync(() => rmSync(baseDir, { recursive: true, force: true }))

const makeAgentConfigLayer = (baseDir: string) =>
  AgentConfig.layerFromParsed(withTestPromptsConfig({
    providers: { anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" } },
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
        model: { provider: "anthropic", modelId: "test" },
        generation: { temperature: 0.7, maxOutputTokens: 4096 },
        runtime: {
          tokenBudget: 200_000,
          maxToolIterations: 16,
          memory: {
            defaultRetrieveLimit: 5,
            maxRetrieveLimit: 50
          }
        },
        memoryRoutines: { subroutines: [] }
      }
    },
    server: {
      port: 3000,
      storage: {
        rootDir: join(baseDir, "state"),
        artifacts: {
          inlineToolResultMaxBytes: 262_144,
          previewMaxBytes: 4096,
          compression: "gzip"
        },
        compaction: {
          cooldownSeconds: 300,
          thresholds: {
            tokenPressureRatio: 0.82,
            toolResultBytes: 262_144,
            artifactBytes: 1_048_576,
            fileTouches: 40
          }
        }
      }
    }
  }))

const makeSqlInfrastructureLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  return Layer.mergeAll(sqliteLayer, migrationLayer)
}

const makeStorageLayers = (baseDir: string, dbPath: string) => {
  const sqlInfrastructureLayer = makeSqlInfrastructureLayer(dbPath)
  const agentConfigLayer = makeAgentConfigLayer(baseDir)

  const storageLayoutLayer = StorageLayout.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodePath.layer,
      agentConfigLayer
    ))
  )

  const sessionFileStoreLayer = SessionFileStore.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodeFileSystem.layer,
      NodePath.layer,
      storageLayoutLayer
    ))
  )

  const artifactStoreLayer = ArtifactStoreFsCas.layer.pipe(
    Layer.provide(Layer.mergeAll(
      sqlInfrastructureLayer,
      storageLayoutLayer,
      agentConfigLayer,
      NodeFileSystem.layer,
      NodePath.layer
    ))
  )

  const sessionArtifactLayer = SessionArtifactPortSqlite.layer.pipe(
    Layer.provide(Layer.mergeAll(
      sqlInfrastructureLayer,
      sessionFileStoreLayer
    ))
  )

  const sessionMetricsLayer = SessionMetricsPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )

  return {
    sqlInfrastructureLayer,
    storageLayoutLayer,
    artifactStoreLayer,
    sessionArtifactLayer,
    sessionMetricsLayer
  }
}

describe("Filesystem-first storage ports", () => {
  it("CAS dedupes identical payloads and reads bytes back", async () => {
    const baseDir = makeBaseDir("artifact-cas")
    const dbPath = join(baseDir, "storage.sqlite")
    const layers = makeStorageLayers(baseDir, dbPath)

    const program = Effect.gen(function*() {
      const artifactStore = yield* ArtifactStoreFsCas
      const storageLayout = yield* StorageLayout
      const sql = yield* SqlClient.SqlClient

      const payload = textEncoder.encode('{"key":"value","size":3}')
      const first = yield* artifactStore.putBytes(
        TEST_SESSION_ID,
        "ToolResult",
        payload,
        { mediaType: "application/json" }
      )
      const second = yield* artifactStore.putBytes(
        TEST_SESSION_ID,
        "ToolResult",
        payload,
        { mediaType: "application/json" }
      )

      expect(second.artifactId).toBe(first.artifactId)
      expect(second.sha256).toBe(first.sha256)

      const blobPath = storageLayout.artifactBlobPath(first.sha256)
      expect(existsSync(blobPath)).toBe(true)

      const rowCountRows = yield* sql`
        SELECT COUNT(*) AS count
        FROM artifacts
        WHERE sha256 = ${first.sha256}
      `.unprepared
      expect(Number((rowCountRows[0] as { count: number }).count)).toBe(1)

      const bytes = yield* artifactStore.getBytes(first.artifactId)
      expect(textDecoder.decode(bytes)).toBe(textDecoder.decode(payload))
    }).pipe(
      Effect.provide(Layer.mergeAll(
        layers.artifactStoreLayer,
        layers.storageLayoutLayer,
        layers.sqlInfrastructureLayer
      )),
      Effect.ensuring(cleanupBaseDir(baseDir))
    )

    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("session artifact linking is idempotent and writes link manifest", async () => {
    const baseDir = makeBaseDir("session-artifacts")
    const dbPath = join(baseDir, "storage.sqlite")
    const layers = makeStorageLayers(baseDir, dbPath)

    const program = Effect.gen(function*() {
      const artifactStore = yield* ArtifactStoreFsCas
      const sessionArtifactPort = yield* SessionArtifactPortSqlite
      const storageLayout = yield* StorageLayout

      const artifact = yield* artifactStore.putJson(
        TEST_SESSION_ID,
        "ToolResult",
        { result: "large output" },
        { mediaType: "application/json" }
      )

      const provenance = {
        turnId: "turn:storage-test" as TurnId,
        toolInvocationId: "toolinv:storage-test" as ToolInvocationId
      }

      yield* sessionArtifactPort.link(
        TEST_SESSION_ID,
        artifact,
        "ToolResult",
        provenance
      )
      yield* sessionArtifactPort.link(
        TEST_SESSION_ID,
        artifact,
        "ToolResult",
        provenance
      )

      const linked = yield* sessionArtifactPort.listBySession(TEST_SESSION_ID)
      expect(linked.length).toBe(1)
      expect(linked[0].purpose).toBe("ToolResult")
      expect(linked[0].artifact.artifactId).toBe(artifact.artifactId)

      const linkPath = storageLayout.sessionArtifactLinkPath(
        TEST_SESSION_ID,
        linked[0].sessionArtifactId
      )
      expect(existsSync(linkPath)).toBe(true)
    }).pipe(
      Effect.provide(Layer.mergeAll(
        layers.artifactStoreLayer,
        layers.sessionArtifactLayer,
        layers.storageLayoutLayer
      )),
      Effect.ensuring(cleanupBaseDir(baseDir))
    )

    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("session metrics compaction gate respects thresholds and cooldown", async () => {
    const baseDir = makeBaseDir("session-metrics")
    const dbPath = join(baseDir, "storage.sqlite")
    const layers = makeStorageLayers(baseDir, dbPath)

    const program = Effect.gen(function*() {
      const sessionMetrics = yield* SessionMetricsPortSqlite
      const now = DateTime.fromDateUnsafe(new Date("2026-03-03T12:00:00.000Z"))

      yield* sessionMetrics.increment(TEST_SESSION_ID, {
        tokenCount: 900
      })

      const baseline = yield* sessionMetrics.get(TEST_SESSION_ID)
      expect(baseline).not.toBeNull()
      expect(baseline!.tokenCount).toBe(900)

      const shouldTriggerInitially = yield* sessionMetrics.shouldTriggerCompaction(
        TEST_SESSION_ID,
        {
          tokenPressureRatio: 0.82,
          tokenCapacity: 1_000,
          toolResultBytes: 999_999,
          artifactBytes: 999_999,
          fileTouches: 999_999,
          cooldownSeconds: 300,
          now
        }
      )
      expect(shouldTriggerInitially).toBe(true)

      yield* sessionMetrics.increment(TEST_SESSION_ID, {
        lastCompactionAt: now
      })

      const withinCooldown = yield* sessionMetrics.shouldTriggerCompaction(
        TEST_SESSION_ID,
        {
          tokenPressureRatio: 0.82,
          tokenCapacity: 1_000,
          toolResultBytes: 999_999,
          artifactBytes: 999_999,
          fileTouches: 999_999,
          cooldownSeconds: 300,
          now: DateTime.fromDateUnsafe(new Date("2026-03-03T12:02:00.000Z"))
        }
      )
      expect(withinCooldown).toBe(false)

      const afterCooldown = yield* sessionMetrics.shouldTriggerCompaction(
        TEST_SESSION_ID,
        {
          tokenPressureRatio: 0.82,
          tokenCapacity: 1_000,
          toolResultBytes: 999_999,
          artifactBytes: 999_999,
          fileTouches: 999_999,
          cooldownSeconds: 300,
          now: DateTime.fromDateUnsafe(new Date("2026-03-03T12:10:00.000Z"))
        }
      )
      expect(afterCooldown).toBe(true)
    }).pipe(
      Effect.provide(layers.sessionMetricsLayer),
      Effect.ensuring(cleanupBaseDir(baseDir))
    )

    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })
})
