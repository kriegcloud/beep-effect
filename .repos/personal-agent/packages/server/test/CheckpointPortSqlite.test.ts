import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ChannelId, CheckpointId, PolicyId, SessionId } from "@template/domain/ids"
import type { CheckpointRecord, Instant } from "@template/domain/ports"
import type { CheckpointAction } from "@template/domain/status"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { CheckpointPortSqlite } from "../src/CheckpointPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-checkpoint-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

const makeCheckpointLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    CheckpointPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  )
}

const makeCheckpointRecord = (overrides: Partial<CheckpointRecord> = {}): CheckpointRecord => ({
  checkpointId: `cp:${crypto.randomUUID()}` as CheckpointId,
  agentId: "agent:test" as AgentId,
  sessionId: "session:test" as SessionId,
  channelId: "channel:test" as ChannelId,
  turnId: "turn:test",
  action: "InvokeTool" as CheckpointAction,
  policyId: "policy:test" as PolicyId,
  reason: "test_reason",
  payloadJson: "{}",
  payloadHash: "abc123",
  status: "Pending",
  requestedAt: instant("2026-02-27T12:00:00.000Z"),
  decidedAt: null,
  decidedBy: null,
  consumedAt: null,
  consumedBy: null,
  expiresAt: null,
  ...overrides
})

describe("CheckpointPortSqlite", () => {
  it.effect("create/get roundtrip", () => {
    const dbPath = testDatabasePath("roundtrip")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord({
      policyId: "policy:roundtrip" as PolicyId,
      reason: "roundtrip_test",
      payloadJson: '{"tool":"shell"}',
      payloadHash: "hash_roundtrip",
      expiresAt: instant("2099-01-01T00:00:00.000Z")
    })

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      const fetched = yield* port.get(record.checkpointId)

      expect(fetched).not.toBeNull()
      expect(fetched!.checkpointId).toBe(record.checkpointId)
      expect(fetched!.agentId).toBe(record.agentId)
      expect(fetched!.sessionId).toBe(record.sessionId)
      expect(fetched!.channelId).toBe(record.channelId)
      expect(fetched!.turnId).toBe(record.turnId)
      expect(fetched!.action).toBe(record.action)
      expect(fetched!.policyId).toBe(record.policyId)
      expect(fetched!.reason).toBe(record.reason)
      expect(fetched!.payloadJson).toBe(record.payloadJson)
      expect(fetched!.payloadHash).toBe(record.payloadHash)
      expect(fetched!.status).toBe("Pending")
      expect(fetched!.decidedAt).toBeNull()
      expect(fetched!.decidedBy).toBeNull()
      expect(fetched!.consumedAt).toBeNull()
      expect(fetched!.consumedBy).toBeNull()
      expect(fetched!.expiresAt).not.toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("pending list filtering", () => {
    const dbPath = testDatabasePath("pending-filter")
    const layer = makeCheckpointLayer(dbPath)

    const pendingAgent1 = makeCheckpointRecord({
      agentId: "agent:alpha" as AgentId,
      status: "Pending"
    })
    const pendingAgent2 = makeCheckpointRecord({
      agentId: "agent:beta" as AgentId,
      status: "Pending"
    })
    const approvedAgent1 = makeCheckpointRecord({
      agentId: "agent:alpha" as AgentId,
      status: "Pending" // insert as Pending, then transition to Approved
    })

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(pendingAgent1)
      yield* port.create(pendingAgent2)
      yield* port.create(approvedAgent1)

      // Transition the third checkpoint to Approved
      yield* port.transition(
        approvedAgent1.checkpointId,
        "Approved",
        "human:tester",
        instant("2026-02-27T12:01:00.000Z")
      )

      // listPending() should return only the 2 Pending checkpoints
      const allPending = yield* port.listPending()
      expect(allPending).toHaveLength(2)
      const ids = allPending.map((r) => r.checkpointId)
      expect(ids).toContain(pendingAgent1.checkpointId)
      expect(ids).toContain(pendingAgent2.checkpointId)

      // listPending(agentId) should return only that agent's Pending
      const agent1Pending = yield* port.listPending("agent:alpha" as AgentId)
      expect(agent1Pending).toHaveLength(1)
      expect(agent1Pending[0].checkpointId).toBe(pendingAgent1.checkpointId)

      const agent2Pending = yield* port.listPending("agent:beta" as AgentId)
      expect(agent2Pending).toHaveLength(1)
      expect(agent2Pending[0].checkpointId).toBe(pendingAgent2.checkpointId)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("deleteByChannel removes checkpoints only for selected channel", () => {
    const dbPath = testDatabasePath("delete-by-channel")
    const layer = makeCheckpointLayer(dbPath)

    const channelA1 = makeCheckpointRecord({
      channelId: "channel:a" as ChannelId,
      sessionId: "session:a" as SessionId
    })
    const channelA2 = makeCheckpointRecord({
      channelId: "channel:a" as ChannelId,
      sessionId: "session:a" as SessionId
    })
    const channelB1 = makeCheckpointRecord({
      channelId: "channel:b" as ChannelId,
      sessionId: "session:b" as SessionId
    })

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(channelA1)
      yield* port.create(channelA2)
      yield* port.create(channelB1)

      yield* port.deleteByChannel("channel:a" as ChannelId)
      yield* port.deleteByChannel("channel:a" as ChannelId)

      const deletedA1 = yield* port.get(channelA1.checkpointId)
      const deletedA2 = yield* port.get(channelA2.checkpointId)
      const keptB1 = yield* port.get(channelB1.checkpointId)

      expect(deletedA1).toBeNull()
      expect(deletedA2).toBeNull()
      expect(keptB1).not.toBeNull()
      expect(keptB1!.channelId).toBe("channel:b")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.live("expiry behavior — lazy expiry on get", () => {
    const dbPath = testDatabasePath("expiry-lazy")
    const layer = makeCheckpointLayer(dbPath)

    const record = makeCheckpointRecord({
      expiresAt: instant("2020-01-01T00:00:00.000Z") // well in the past
    })

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      const fetched = yield* port.get(record.checkpointId)

      expect(fetched).not.toBeNull()
      expect(fetched!.status).toBe("Expired")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("state transitions — Pending to Approved", () => {
    const dbPath = testDatabasePath("transition-approve")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      yield* port.transition(
        record.checkpointId,
        "Approved",
        "human:approver",
        instant("2026-02-27T12:05:00.000Z")
      )
      const fetched = yield* port.get(record.checkpointId)
      expect(fetched!.status).toBe("Approved")
      expect(fetched!.decidedBy).toBe("human:approver")
      expect(fetched!.decidedAt).not.toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("state transitions — Pending to Rejected", () => {
    const dbPath = testDatabasePath("transition-reject")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      yield* port.transition(
        record.checkpointId,
        "Rejected",
        "human:reviewer",
        instant("2026-02-27T12:05:00.000Z")
      )
      const fetched = yield* port.get(record.checkpointId)
      expect(fetched!.status).toBe("Rejected")
      expect(fetched!.decidedBy).toBe("human:reviewer")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("state transitions — Pending to Deferred", () => {
    const dbPath = testDatabasePath("transition-defer")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      yield* port.transition(
        record.checkpointId,
        "Deferred",
        "human:reviewer",
        instant("2026-02-27T12:05:00.000Z")
      )
      const fetched = yield* port.get(record.checkpointId)
      expect(fetched!.status).toBe("Deferred")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("state transitions — Approved to Consumed", () => {
    const dbPath = testDatabasePath("transition-consume")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      yield* port.transition(
        record.checkpointId,
        "Approved",
        "human:approver",
        instant("2026-02-27T12:05:00.000Z")
      )
      yield* port.transition(
        record.checkpointId,
        "Consumed",
        "agent:executor",
        instant("2026-02-27T12:06:00.000Z")
      )
      const fetched = yield* port.get(record.checkpointId)
      expect(fetched!.status).toBe("Consumed")
      expect(fetched!.decidedBy).toBe("human:approver")
      expect(fetched!.consumedBy).toBe("agent:executor")
      expect(fetched!.consumedAt).not.toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("explicit transition methods — decidePending then consumeApproved", () => {
    const dbPath = testDatabasePath("explicit-transition-methods")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      yield* port.decidePending(
        record.checkpointId,
        "Approved",
        "human:approver",
        instant("2026-02-27T12:05:00.000Z")
      )
      yield* port.consumeApproved(
        record.checkpointId,
        "agent:executor",
        instant("2026-02-27T12:06:00.000Z")
      )

      const fetched = yield* port.get(record.checkpointId)
      expect(fetched).not.toBeNull()
      expect(fetched!.status).toBe("Consumed")
      expect(fetched!.decidedBy).toBe("human:approver")
      expect(fetched!.consumedBy).toBe("agent:executor")
      expect(fetched!.consumedAt).not.toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("race — concurrent decidePending yields one success and one CheckpointAlreadyDecided", () => {
    const dbPath = testDatabasePath("race-decide")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()
    const decidedAt = instant("2026-02-27T12:05:00.000Z")

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite
      yield* port.create(record)

      const outcomes = yield* Effect.all([
        port.decidePending(record.checkpointId, "Approved", "human:a", decidedAt).pipe(
          Effect.as("ok:a"),
          Effect.catch((error) => Effect.succeed(error._tag))
        ),
        port.decidePending(record.checkpointId, "Approved", "human:b", decidedAt).pipe(
          Effect.as("ok:b"),
          Effect.catch((error) => Effect.succeed(error._tag))
        )
      ], { concurrency: 2 })

      expect(outcomes.filter((value) => value.startsWith("ok:"))).toHaveLength(1)
      expect(outcomes).toContain("CheckpointAlreadyDecided")

      const fetched = yield* port.get(record.checkpointId)
      expect(fetched).not.toBeNull()
      expect(fetched!.status).toBe("Approved")
      expect(["human:a", "human:b"]).toContain(fetched!.decidedBy)
      expect(fetched!.consumedAt).toBeNull()
      expect(fetched!.consumedBy).toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("race — concurrent consumeApproved yields one success and one CheckpointAlreadyDecided", () => {
    const dbPath = testDatabasePath("race-consume")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()
    const decidedAt = instant("2026-02-27T12:05:00.000Z")
    const consumedAt = instant("2026-02-27T12:06:00.000Z")

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite
      yield* port.create(record)
      yield* port.decidePending(record.checkpointId, "Approved", "human:approver", decidedAt)

      const outcomes = yield* Effect.all([
        port.consumeApproved(record.checkpointId, "agent:a", consumedAt).pipe(
          Effect.as("ok:a"),
          Effect.catch((error) => Effect.succeed(error._tag))
        ),
        port.consumeApproved(record.checkpointId, "agent:b", consumedAt).pipe(
          Effect.as("ok:b"),
          Effect.catch((error) => Effect.succeed(error._tag))
        )
      ], { concurrency: 2 })

      expect(outcomes.filter((value) => value.startsWith("ok:"))).toHaveLength(1)
      expect(outcomes).toContain("CheckpointAlreadyDecided")

      const fetched = yield* port.get(record.checkpointId)
      expect(fetched).not.toBeNull()
      expect(fetched!.status).toBe("Consumed")
      expect(["agent:a", "agent:b"]).toContain(fetched!.consumedBy)
      expect(fetched!.consumedAt).not.toBeNull()
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("CAS errors — already decided", () => {
    const dbPath = testDatabasePath("cas-already-decided")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord()

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)
      yield* port.transition(
        record.checkpointId,
        "Approved",
        "human:approver",
        instant("2026-02-27T12:05:00.000Z")
      )

      // Try to approve again — should fail
      const result = yield* port.transition(
        record.checkpointId,
        "Approved",
        "human:approver2",
        instant("2026-02-27T12:06:00.000Z")
      ).pipe(Effect.flip)

      expect(result._tag).toBe("CheckpointAlreadyDecided")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.live("expired checkpoint cannot be transitioned", () => {
    const dbPath = testDatabasePath("expired-approval")
    const layer = makeCheckpointLayer(dbPath)
    const record = makeCheckpointRecord({
      expiresAt: instant("2020-01-01T00:00:00.000Z") // well in the past
    })

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      yield* port.create(record)

      // get() lazily marks the checkpoint as Expired, so transition
      // detects the Expired status and returns CheckpointExpired (HTTP 410)
      const result = yield* port.transition(
        record.checkpointId,
        "Approved",
        "human:approver",
        instant("2026-02-27T12:05:00.000Z")
      ).pipe(Effect.flip)

      expect(result._tag).toBe("CheckpointExpired")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("not found", () => {
    const dbPath = testDatabasePath("not-found")
    const layer = makeCheckpointLayer(dbPath)

    return Effect.gen(function*() {
      const port = yield* CheckpointPortSqlite

      const result = yield* port.transition(
        "cp:nonexistent" as CheckpointId,
        "Approved",
        "human:approver",
        instant("2026-02-27T12:05:00.000Z")
      ).pipe(Effect.flip)

      expect(result._tag).toBe("CheckpointNotFound")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})
