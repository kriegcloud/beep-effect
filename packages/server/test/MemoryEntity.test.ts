import { describe, expect, it } from "@effect/vitest"
import { MemoryAccessDenied } from "@template/domain/errors"
import type { AgentId } from "@template/domain/ids"
import type { GovernancePort, Instant, MemoryPort } from "@template/domain/ports"
import type { AuthorizationDecision } from "@template/domain/status"
import { DateTime, Effect, Layer } from "effect"
import { Entity, ShardingConfig, SingleRunner } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { layer as MemoryEntityLayer, MemoryEntity } from "../src/entities/MemoryEntity.js"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import { MemoryPortSqlite } from "../src/MemoryPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { GovernancePortTag, MemoryPortTag } from "../src/PortTags.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"

const AGENT_ID = "agent:mem-entity" as AgentId

describe("MemoryEntity", () => {
  it.effect("store + search round-trip", () => {
    const dbPath = testDatabasePath("mem-entity-roundtrip")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const client = yield* makeClient(AGENT_ID)

      const ids = yield* client.store({
        requestId: "store:roundtrip",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "User's name is Alex" },
          { tier: "EpisodicMemory", scope: "SessionScope", source: "AgentSource", content: "Discussed TypeScript" }
        ]
      })
      expect(ids).toHaveLength(2)

      const result = yield* client.search({ query: "Alex", limit: 10 })
      expect(result.items).toHaveLength(1)
      expect(result.items[0].content).toBe("User's name is Alex")
      expect(result.totalCount).toBe(1)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("store + retrieve round-trip via entity RPCs", () => {
    const dbPath = testDatabasePath("memory-entity-retrieve-roundtrip")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const client = yield* makeClient(AGENT_ID)

      yield* client.store({
        requestId: "store:retrieve-roundtrip",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "AgentSource", content: "User's name is Alex" }
        ]
      })

      const results = yield* client.retrieve({ query: "Alex", limit: 10 })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0].content).toContain("Alex")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.live("store timestamps items with server clock", () => {
    const dbPath = testDatabasePath("mem-entity-server-clock")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const client = yield* makeClient(AGENT_ID)

      const before = yield* DateTime.now

      yield* client.store({
        requestId: "store:server-clock",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "Fact A" }
        ]
      })
      const after = yield* DateTime.now

      const result = yield* client.search({ query: "Fact A", limit: 10 })
      expect(result.items).toHaveLength(1)
      const createdAt = DateTime.toEpochMillis(result.items[0].createdAt)
      expect(createdAt).toBeGreaterThanOrEqual(DateTime.toEpochMillis(before))
      expect(createdAt).toBeLessThanOrEqual(DateTime.toEpochMillis(after))
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("forget removes items via entity RPC", () => {
    const dbPath = testDatabasePath("memory-entity-forget")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const port = yield* MemoryPortSqlite
      const agentId = "agent:entity-forget" as AgentId
      const client = yield* makeClient(agentId)

      yield* port.encode(agentId, [
        { tier: "SemanticMemory", scope: "GlobalScope", source: "AgentSource", content: "old memory" }
      ], instant("2026-01-01T00:00:00.000Z"))

      const result = yield* client.forget({
        requestId: "forget:entity",
        cutoff: instant("2026-02-25T12:00:00.000Z")
      })
      expect(result).toBe(1)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("listItems returns all items for agent", () => {
    const dbPath = testDatabasePath("memory-entity-list")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const client = yield* makeClient(AGENT_ID)

      yield* client.store({
        requestId: "store:list-items",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "AgentSource", content: "fact" },
          { tier: "EpisodicMemory", scope: "SessionScope", source: "SystemSource", content: "event" }
        ]
      })

      const all = yield* client.listItems({ limit: 10 })
      expect(all).toHaveLength(2)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("search with pagination via cursor", () => {
    const dbPath = testDatabasePath("mem-entity-pagination")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const client = yield* makeClient(AGENT_ID)

      for (let i = 0; i < 5; i++) {
        yield* client.store({
          requestId: `store:page:${i}`,
          items: [
            { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: `Item ${i}` }
          ]
        })
      }

      const page1 = yield* client.search({ sort: "CreatedAsc", limit: 2 })
      expect(page1.items).toHaveLength(2)
      expect(page1.cursor).not.toBeNull()
      expect(page1.items[0].content).toBe("Item 0")

      const page2 = yield* client.search({ sort: "CreatedAsc", limit: 2, cursor: page1.cursor! })
      expect(page2.items).toHaveLength(2)
      expect(page2.items[0].content).toBe("Item 2")

      const page3 = yield* client.search({ sort: "CreatedAsc", limit: 2, cursor: page2.cursor! })
      expect(page3.items).toHaveLength(1)
      expect(page3.cursor).toBeNull()
      expect(page3.items[0].content).toBe("Item 4")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.live("store is idempotent for the same requestId", () => {
    const dbPath = testDatabasePath("mem-entity-store-idempotent")
    const layer = makeClusterLayer(dbPath)
    return Effect.gen(function*() {
      const makeClient = yield* MemoryEntity.client
      const client = makeClient(AGENT_ID)

      const first = yield* client.store({
        requestId: "store:idempotent",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "Idempotent fact" }
        ]
      })

      const second = yield* client.store({
        requestId: "store:idempotent",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "Idempotent fact" }
        ]
      })

      const result = yield* client.search({ query: "Idempotent fact", limit: 10 })
      expect(result.items).toHaveLength(1)
      expect(second).toEqual(first)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.live("forget is idempotent for the same requestId", () => {
    const dbPath = testDatabasePath("mem-entity-forget-idempotent")
    const layer = makeClusterLayer(dbPath)
    return Effect.gen(function*() {
      const makeClient = yield* MemoryEntity.client
      const client = makeClient(AGENT_ID)

      yield* client.store({
        requestId: "store:forget-idempotent",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "Old fact" },
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "New fact" }
        ]
      })

      const cutoff = instant("2100-01-01T00:00:00.000Z")

      const firstDelete = yield* client.forget({
        requestId: "forget:idempotent",
        cutoff
      })
      const secondDelete = yield* client.forget({
        requestId: "forget:idempotent",
        cutoff
      })

      const remaining = yield* client.search({ limit: 10 })
      expect(firstDelete).toBe(2)
      expect(secondDelete).toBe(firstDelete)
      expect(remaining.items).toHaveLength(0)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("store and forget allow audits do not collide when requestId is reused", () => {
    const dbPath = testDatabasePath("mem-entity-audit-id-scope")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const client = yield* makeClient(AGENT_ID)
      const governance = yield* GovernancePortSqlite

      yield* client.store({
        requestId: "shared-request",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "Scoped audit memory" }
        ]
      })
      yield* client.forget({
        requestId: "shared-request",
        cutoff: instant("2100-01-01T00:00:00.000Z")
      })

      const audits = yield* governance.listAuditEntries()
      const allowAudits = audits.filter((entry) => entry.decision === "Allow")
      expect(allowAudits.filter((entry) => entry.reason === "memory_store_allowed")).toHaveLength(1)
      expect(allowAudits.filter((entry) => entry.reason === "memory_forget_allowed")).toHaveLength(1)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("governance deny blocks search/store/forget and writes audit", () => {
    const dbPath = testDatabasePath("mem-entity-governance-deny")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(MemoryEntity, MemoryEntityLayer)
      const client = yield* makeClient(AGENT_ID)
      const governance = yield* GovernancePortSqlite
      const memoryPort = yield* MemoryPortSqlite

      const storeError = yield* client.store({
        requestId: "store:deny",
        items: [
          { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "User fact" },
          { tier: "SemanticMemory", scope: "GlobalScope", source: "AgentSource", content: "Agent fact" }
        ]
      }).pipe(Effect.flip)
      const searchError = yield* client.search({ limit: 10 }).pipe(Effect.flip)
      const forgetError = yield* client.forget({
        requestId: "forget:deny",
        cutoff: instant("2100-01-01T00:00:00.000Z")
      }).pipe(Effect.flip)

      expect(storeError).toBeInstanceOf(MemoryAccessDenied)
      expect(searchError).toBeInstanceOf(MemoryAccessDenied)
      expect(forgetError).toBeInstanceOf(MemoryAccessDenied)
      expect(storeError.decision).toBe("Deny")
      expect(searchError.decision).toBe("Deny")
      expect(forgetError.decision).toBe("Deny")

      const persistedItems = yield* memoryPort.search(AGENT_ID, { limit: 10 })
      expect(persistedItems.items).toHaveLength(0)

      const audits = yield* governance.listAuditEntries()
      expect(audits.some((entry) => entry.reason.startsWith("memory_store_denied"))).toBe(true)
      expect(audits.some((entry) => entry.reason.startsWith("memory_search_denied"))).toBe(true)
      expect(audits.some((entry) => entry.reason.startsWith("memory_forget_denied"))).toBe(true)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath, "Deny")),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const makeTestLayer = (
  dbPath: string,
  forcedDecision: AuthorizationDecision = "Allow"
) => {
  const sqlInfrastructureLayer = makeSqlInfrastructureLayer(dbPath)
  const {
    sandboxRuntimeLayer,
    governanceSqliteLayer,
    governanceTagLayer,
    memorySqliteLayer,
    memoryTagLayer
  } = makeMemoryGovernanceLayers(sqlInfrastructureLayer, forcedDecision)

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    sandboxRuntimeLayer,
    governanceSqliteLayer,
    governanceTagLayer,
    memorySqliteLayer,
    memoryTagLayer,
    ShardingConfig.layer()
  )
}

const makeClusterLayer = (
  dbPath: string,
  forcedDecision: AuthorizationDecision = "Allow"
) => {
  const sqlInfrastructureLayer = makeSqlInfrastructureLayer(dbPath)
  const {
    sandboxRuntimeLayer,
    governanceSqliteLayer,
    governanceTagLayer,
    memorySqliteLayer,
    memoryTagLayer
  } = makeMemoryGovernanceLayers(sqlInfrastructureLayer, forcedDecision)

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const memoryEntityLayer = MemoryEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(memoryTagLayer),
    Layer.provide(memorySqliteLayer),
    Layer.provide(governanceTagLayer)
  )

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    sandboxRuntimeLayer,
    governanceSqliteLayer,
    governanceTagLayer,
    memorySqliteLayer,
    memoryTagLayer,
    memoryEntityLayer
  ).pipe(
    Layer.provideMerge(clusterLayer)
  )
}

const makeSqlInfrastructureLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  return Layer.mergeAll(sqliteLayer, migrationLayer)
}

const makeMemoryGovernanceLayers = (
  sqlInfrastructureLayer: ReturnType<typeof makeSqlInfrastructureLayer>,
  forcedDecision: AuthorizationDecision
) => {
  const sandboxRuntimeLayer = SandboxRuntime.layer
  const governanceSqliteLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(sqlInfrastructureLayer)
  )
  const governanceTagLayer = Layer.effect(
    GovernancePortTag,
    Effect.gen(function*() {
      const governance = yield* GovernancePortSqlite
      return {
        ...governance,
        evaluatePolicy: (_input) =>
          Effect.succeed({
            decision: forcedDecision,
            policyId: null,
            toolDefinitionId: null,
            reason: `forced_${forcedDecision.toLowerCase()}`
          })
      } as GovernancePort
    })
  ).pipe(Layer.provide(governanceSqliteLayer))

  const memorySqliteLayer = MemoryPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const memoryTagLayer = Layer.effect(
    MemoryPortTag,
    Effect.gen(function*() {
      return (yield* MemoryPortSqlite) as MemoryPort
    })
  ).pipe(Layer.provide(memorySqliteLayer))

  return {
    sandboxRuntimeLayer,
    governanceSqliteLayer,
    governanceTagLayer,
    memorySqliteLayer,
    memoryTagLayer
  } as const
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
