import { describe, expect, it } from "@effect/vitest"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { TokenBudgetExceeded } from "../../domain/src/errors.js"
import type { AgentId } from "../../domain/src/ids.js"
import type { AgentState, Instant } from "../../domain/src/ports.js"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

describe("AgentStatePortSqlite", () => {
  it.effect("upserts and fetches agent state", () => {
    const dbPath = testDatabasePath("agent-upsert")
    const layer = makeAgentLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const state = makeAgentState({
        agentId: "agent:upsert" as AgentId,
        tokenBudget: 150,
        tokensConsumed: 10
      })

      yield* agentPort.upsert(state)
      const loaded = yield* agentPort.get(state.agentId)

      expect(loaded).not.toBeNull()
      expect(loaded?.agentId).toBe("agent:upsert")
      expect(loaded?.tokenBudget).toBe(150)
      expect(loaded?.tokensConsumed).toBe(10)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("consumes budget and fails when budget is exceeded", () => {
    const dbPath = testDatabasePath("agent-consume")
    const layer = makeAgentLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const now = instant("2026-02-24T12:00:00.000Z")
      const state = makeAgentState({
        agentId: "agent:consume" as AgentId,
        tokenBudget: 100,
        tokensConsumed: 10,
        budgetResetAt: DateTime.add(now, { hours: 1 })
      })

      yield* agentPort.upsert(state)
      yield* agentPort.consumeTokenBudget(state.agentId, 50, now)

      const updated = yield* agentPort.get(state.agentId)
      expect(updated?.tokensConsumed).toBe(60)

      const exceeded = yield* agentPort.consumeTokenBudget(
        state.agentId,
        50,
        now
      ).pipe(Effect.flip)

      expect(exceeded).toBeInstanceOf(TokenBudgetExceeded)
      expect(exceeded._tag).toBe("TokenBudgetExceeded")
      expect(exceeded.remainingTokens).toBe(40)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("resets quota windows before consuming", () => {
    const dbPath = testDatabasePath("agent-reset")
    const layer = makeAgentLayer(dbPath)

    return Effect.gen(function*() {
      const agentPort = yield* AgentStatePortSqlite
      const now = instant("2026-02-24T12:00:00.000Z")
      const state = makeAgentState({
        agentId: "agent:reset" as AgentId,
        tokenBudget: 100,
        tokensConsumed: 90,
        quotaPeriod: "Daily",
        budgetResetAt: DateTime.add(now, { hours: -1 })
      })

      yield* agentPort.upsert(state)
      yield* agentPort.consumeTokenBudget(state.agentId, 30, now)

      const updated = yield* agentPort.get(state.agentId)
      expect(updated?.tokensConsumed).toBe(30)
      expect(updated?.budgetResetAt).not.toBeNull()
      expect(
        DateTime.toEpochMillis(updated!.budgetResetAt!)
      ).toBeGreaterThan(DateTime.toEpochMillis(now))
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("retains state across cold restart", () => {
    const dbPath = testDatabasePath("agent-restart")
    const firstLayer = makeAgentLayer(dbPath)
    const secondLayer = makeAgentLayer(dbPath)

    return Effect.gen(function*() {
      yield* Effect.gen(function*() {
        const agentPort = yield* AgentStatePortSqlite
        const now = instant("2026-02-24T12:00:00.000Z")
        const state = makeAgentState({
          agentId: "agent:restart" as AgentId,
          tokenBudget: 200,
          tokensConsumed: 20,
          budgetResetAt: DateTime.add(now, { hours: 1 })
        })

        yield* agentPort.upsert(state)
        yield* agentPort.consumeTokenBudget(state.agentId, 15, now)
      }).pipe(Effect.provide(firstLayer))

      const persisted = yield* Effect.gen(function*() {
        const agentPort = yield* AgentStatePortSqlite
        return yield* agentPort.get("agent:restart" as AgentId)
      }).pipe(Effect.provide(secondLayer))

      expect(persisted).not.toBeNull()
      expect(persisted?.tokensConsumed).toBe(35)
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const makeAgentLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    AgentStatePortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  )
}

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

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
