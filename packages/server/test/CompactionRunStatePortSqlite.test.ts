import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type { ExecuteCompactionPayload, Instant } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { CompactionRunStatePortSqlite } from "../src/CompactionRunStatePortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

const instant = (iso: string): Instant => DateTime.fromDateUnsafe(new Date(iso))

const makePayload = (params: {
  readonly turnId: TurnId
  readonly triggeredAt: Instant
}): ExecuteCompactionPayload => ({
  triggerSource: "PostCommitMetrics",
  agentId: "agent:compaction" as AgentId,
  sessionId: "session:compaction" as SessionId,
  conversationId: "conversation:compaction" as ConversationId,
  turnId: params.turnId,
  triggeredAt: params.triggeredAt
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

const makeLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  return CompactionRunStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
}

describe("CompactionRunStatePortSqlite", () => {
  it.effect("serializes per-session runs and coalesces pending turn to latest", () => {
    const dbPath = testDatabasePath("compaction-run-state")
    const layer = makeLayer(dbPath)

    return Effect.gen(function*() {
      const port = yield* CompactionRunStatePortSqlite

      const firstPayload = makePayload({
        turnId: "turn:1" as TurnId,
        triggeredAt: instant("2026-03-03T10:00:00.000Z")
      })
      const secondPayload = makePayload({
        turnId: "turn:2" as TurnId,
        triggeredAt: instant("2026-03-03T10:01:00.000Z")
      })
      const thirdPayload = makePayload({
        turnId: "turn:3" as TurnId,
        triggeredAt: instant("2026-03-03T10:02:00.000Z")
      })

      const first = yield* port.claimOrCoalesce(firstPayload)
      const second = yield* port.claimOrCoalesce(secondPayload)
      const third = yield* port.claimOrCoalesce(thirdPayload)

      expect(first.status).toBe("Claimed")
      expect(second.status).toBe("Coalesced")
      expect(third.status).toBe("Coalesced")

      const pending = yield* port.releaseAndTakePending(
        firstPayload.sessionId,
        firstPayload.turnId
      )
      expect(pending?.turnId).toBe(thirdPayload.turnId)

      // Re-claiming the returned pending payload should succeed immediately.
      const reclaimedPending = yield* port.claimOrCoalesce(thirdPayload)
      expect(reclaimedPending.status).toBe("Claimed")

      const drained = yield* port.releaseAndTakePending(
        thirdPayload.sessionId,
        thirdPayload.turnId
      )
      expect(drained).toBeNull()

      const afterDrain = yield* port.claimOrCoalesce(makePayload({
        turnId: "turn:4" as TurnId,
        triggeredAt: instant("2026-03-03T10:03:00.000Z")
      }))
      expect(afterDrain.status).toBe("Claimed")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("coalesces duplicate active turn claims", () => {
    const dbPath = testDatabasePath("compaction-run-state-idempotent")
    const layer = makeLayer(dbPath)

    return Effect.gen(function*() {
      const port = yield* CompactionRunStatePortSqlite
      const payload = makePayload({
        turnId: "turn:same" as TurnId,
        triggeredAt: instant("2026-03-03T11:00:00.000Z")
      })

      const first = yield* port.claimOrCoalesce(payload)
      const second = yield* port.claimOrCoalesce(payload)

      expect(first.status).toBe("Claimed")
      expect(second.status).toBe("Coalesced")

      const pending = yield* port.releaseAndTakePending(payload.sessionId, payload.turnId)
      expect(pending).toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})
