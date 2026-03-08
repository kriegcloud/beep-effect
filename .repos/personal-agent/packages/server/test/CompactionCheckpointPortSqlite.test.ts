import { describe, expect, it } from "@effect/vitest"
import type { AgentId, CompactionCheckpointId, MessageId, SessionId, TurnId } from "@template/domain/ids"
import type { CompactionCheckpointRecord, Instant } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { CompactionCheckpointPortSqlite } from "../src/CompactionCheckpointPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGENT_ID = "agent:checkpoint-test" as AgentId
const SESSION_ID = "session:checkpoint-test" as SessionId
const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => { rmSync(path, { force: true }) })

// ---------------------------------------------------------------------------
// Layer Construction
// ---------------------------------------------------------------------------

const makeTestLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  return CompactionCheckpointPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const makeRecord = (overrides?: Partial<CompactionCheckpointRecord>): CompactionCheckpointRecord => ({
  checkpointId: `ckpt:${crypto.randomUUID()}` as CompactionCheckpointId,
  agentId: AGENT_ID,
  sessionId: SESSION_ID,
  subroutineId: "memory_consolidation",
  createdAt: instant("2026-03-01T12:00:00.000Z"),
  summary: "Consolidated recent conversation into long-term memory.",
  firstKeptTurnId: null,
  firstKeptMessageId: null,
  tokensBefore: null,
  tokensAfter: null,
  detailsJson: null,
  ...overrides
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompactionCheckpointPortSqlite", () => {
  it("create + getLatestForSubroutine roundtrip", async () => {
    const dbPath = testDatabasePath("ckpt-roundtrip")
    const layer = makeTestLayer(dbPath)

    const program = Effect.gen(function*() {
      const port = yield* CompactionCheckpointPortSqlite

      const record = makeRecord({
        checkpointId: "ckpt:roundtrip-1" as CompactionCheckpointId,
        subroutineId: "context_compaction",
        createdAt: instant("2026-03-01T14:30:00.000Z"),
        summary: "Compacted context window to 40k tokens.",
        firstKeptTurnId: "turn:kept-1" as TurnId,
        firstKeptMessageId: "msg:kept-1" as MessageId,
        tokensBefore: 120_000,
        tokensAfter: 40_000,
        detailsJson: '{"strategy":"sliding_window"}'
      })

      yield* port.create(record)

      const latest = yield* port.getLatestForSubroutine(
        record.agentId,
        record.sessionId,
        record.subroutineId
      )

      expect(latest).not.toBeNull()
      expect(latest!.checkpointId).toBe("ckpt:roundtrip-1")
      expect(latest!.agentId).toBe(AGENT_ID)
      expect(latest!.sessionId).toBe(SESSION_ID)
      expect(latest!.subroutineId).toBe("context_compaction")
      expect(latest!.summary).toBe("Compacted context window to 40k tokens.")
      expect(latest!.firstKeptTurnId).toBe("turn:kept-1")
      expect(latest!.firstKeptMessageId).toBe("msg:kept-1")
      expect(latest!.tokensBefore).toBe(120_000)
      expect(latest!.tokensAfter).toBe(40_000)
      expect(latest!.detailsJson).toBe('{"strategy":"sliding_window"}')
      // createdAt should round-trip as a DateTimeUtc
      expect(DateTime.toEpochMillis(latest!.createdAt)).toBe(
        DateTime.toEpochMillis(instant("2026-03-01T14:30:00.000Z"))
      )
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("getLatestForSubroutine isolates by subroutineId", async () => {
    const dbPath = testDatabasePath("ckpt-isolate")
    const layer = makeTestLayer(dbPath)

    const program = Effect.gen(function*() {
      const port = yield* CompactionCheckpointPortSqlite

      const recordA = makeRecord({
        subroutineId: "subroutine_alpha",
        summary: "Alpha summary"
      })
      const recordB = makeRecord({
        subroutineId: "subroutine_beta",
        summary: "Beta summary"
      })

      yield* port.create(recordA)
      yield* port.create(recordB)

      const latestAlpha = yield* port.getLatestForSubroutine(AGENT_ID, SESSION_ID, "subroutine_alpha")
      const latestBeta = yield* port.getLatestForSubroutine(AGENT_ID, SESSION_ID, "subroutine_beta")

      expect(latestAlpha).not.toBeNull()
      expect(latestAlpha!.summary).toBe("Alpha summary")
      expect(latestAlpha!.subroutineId).toBe("subroutine_alpha")

      expect(latestBeta).not.toBeNull()
      expect(latestBeta!.summary).toBe("Beta summary")
      expect(latestBeta!.subroutineId).toBe("subroutine_beta")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("getLatestForSubroutine returns most recent", async () => {
    const dbPath = testDatabasePath("ckpt-latest")
    const layer = makeTestLayer(dbPath)

    const program = Effect.gen(function*() {
      const port = yield* CompactionCheckpointPortSqlite

      const older = makeRecord({
        subroutineId: "compaction",
        createdAt: instant("2026-03-01T10:00:00.000Z"),
        summary: "Older checkpoint"
      })
      const newer = makeRecord({
        subroutineId: "compaction",
        createdAt: instant("2026-03-01T16:00:00.000Z"),
        summary: "Newer checkpoint"
      })

      yield* port.create(older)
      yield* port.create(newer)

      const latest = yield* port.getLatestForSubroutine(AGENT_ID, SESSION_ID, "compaction")

      expect(latest).not.toBeNull()
      expect(latest!.summary).toBe("Newer checkpoint")
      expect(DateTime.toEpochMillis(latest!.createdAt)).toBe(
        DateTime.toEpochMillis(instant("2026-03-01T16:00:00.000Z"))
      )
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("listBySession returns all in order", async () => {
    const dbPath = testDatabasePath("ckpt-list")
    const layer = makeTestLayer(dbPath)

    const program = Effect.gen(function*() {
      const port = yield* CompactionCheckpointPortSqlite

      const r1 = makeRecord({
        subroutineId: "sub_a",
        createdAt: instant("2026-03-01T08:00:00.000Z"),
        summary: "First"
      })
      const r2 = makeRecord({
        subroutineId: "sub_b",
        createdAt: instant("2026-03-01T12:00:00.000Z"),
        summary: "Second"
      })
      const r3 = makeRecord({
        subroutineId: "sub_a",
        createdAt: instant("2026-03-01T18:00:00.000Z"),
        summary: "Third"
      })

      // Insert a record for a different session — should NOT appear
      const otherSession = makeRecord({
        sessionId: "session:other" as SessionId,
        subroutineId: "sub_a",
        createdAt: instant("2026-03-01T20:00:00.000Z"),
        summary: "Other session"
      })

      yield* port.create(r1)
      yield* port.create(r2)
      yield* port.create(r3)
      yield* port.create(otherSession)

      const results = yield* port.listBySession(SESSION_ID)

      expect(results.length).toBe(3)
      expect(results[0].summary).toBe("First")
      expect(results[1].summary).toBe("Second")
      expect(results[2].summary).toBe("Third")

      // Verify ASC order by timestamp
      for (let i = 1; i < results.length; i++) {
        expect(DateTime.toEpochMillis(results[i].createdAt)).toBeGreaterThanOrEqual(
          DateTime.toEpochMillis(results[i - 1].createdAt)
        )
      }
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })

  it("getLatestForSubroutine returns null when none exist", async () => {
    const dbPath = testDatabasePath("ckpt-empty")
    const layer = makeTestLayer(dbPath)

    const program = Effect.gen(function*() {
      const port = yield* CompactionCheckpointPortSqlite

      const result = yield* port.getLatestForSubroutine(
        AGENT_ID,
        SESSION_ID,
        "nonexistent_subroutine"
      )

      expect(result).toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program as Effect.Effect<unknown, unknown, never>)
  })
})
