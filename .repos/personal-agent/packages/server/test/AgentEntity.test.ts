import { describe, expect, it } from "@effect/vitest"
import { TokenBudgetExceeded } from "@template/domain/errors"
import type { AgentId } from "@template/domain/ids"
import type { AgentStatePort, Instant } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { Entity, ShardingConfig } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { AgentEntity, layer as AgentEntityLayer } from "../src/entities/AgentEntity.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { AgentStatePortTag } from "../src/PortTags.js"

describe("AgentEntity", () => {
  it.effect("getState returns null for non-existent agent", () => {
    const dbPath = testDatabasePath("agent-entity-null")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(AgentEntity, AgentEntityLayer)
      const client = yield* makeClient("agent:missing")
      const result = yield* client.getState({ agentId: "agent:missing" })
      expect(result).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("upsertState + getState round-trip", () => {
    const dbPath = testDatabasePath("agent-entity-roundtrip")
    return Effect.gen(function*() {
      const agentId = "agent:roundtrip" as AgentId
      const now = instant("2026-02-24T12:00:00.000Z")
      const makeClient = yield* Entity.makeTestClient(AgentEntity, AgentEntityLayer)
      const client = yield* makeClient(agentId)

      yield* client.upsertState({
        agentId,
        permissionMode: "Standard",
        tokenBudget: 100_000,
        maxToolIterations: 10,
        quotaPeriod: "Daily",
        tokensConsumed: 0,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })

      const result = yield* client.getState({ agentId })
      expect(result).not.toBeNull()
      expect(result!.agentId).toBe(agentId)
      expect(result!.tokenBudget).toBe(100_000)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("consumeTokenBudget succeeds within budget", () => {
    const dbPath = testDatabasePath("agent-entity-budget-ok")
    return Effect.gen(function*() {
      const agentId = "agent:budget-ok" as AgentId
      const now = instant("2026-02-24T12:00:00.000Z")
      const port = yield* AgentStatePortSqlite

      yield* port.upsert({
        agentId,
        permissionMode: "Standard",
        tokenBudget: 200,
        maxToolIterations: 10,
        quotaPeriod: "Daily",
        tokensConsumed: 0,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })

      const makeClient = yield* Entity.makeTestClient(AgentEntity, AgentEntityLayer)
      const client = yield* makeClient(agentId)
      yield* client.consumeTokenBudget({ agentId, requestedTokens: 50, now })

      const updated = yield* client.getState({ agentId })
      expect(updated!.tokensConsumed).toBe(50)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("consumeTokenBudget fails when budget exceeded", () => {
    const dbPath = testDatabasePath("agent-entity-budget-exceeded")
    return Effect.gen(function*() {
      const agentId = "agent:budget-exceeded" as AgentId
      const now = instant("2026-02-24T12:00:00.000Z")
      const port = yield* AgentStatePortSqlite

      yield* port.upsert({
        agentId,
        permissionMode: "Standard",
        tokenBudget: 10,
        maxToolIterations: 10,
        quotaPeriod: "Daily",
        tokensConsumed: 5,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })

      const makeClient = yield* Entity.makeTestClient(AgentEntity, AgentEntityLayer)
      const client = yield* makeClient(agentId)

      const error = yield* client.consumeTokenBudget({
        agentId,
        requestedTokens: 100,
        now
      }).pipe(Effect.flip)

      expect(error).toBeInstanceOf(TokenBudgetExceeded)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const makeTestLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const agentStateSqliteLayer = AgentStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const agentStateTagLayer = Layer.effect(
    AgentStatePortTag,
    Effect.gen(function*() {
      return (yield* AgentStatePortSqlite) as AgentStatePort
    })
  ).pipe(Layer.provide(agentStateSqliteLayer))

  return Layer.mergeAll(
    agentStateSqliteLayer,
    agentStateTagLayer,
    ShardingConfig.layer()
  )
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
