import { NodeHttpServer } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { AgentId } from "@template/domain/ids"
import type { AgentStatePort, GovernancePort, MemoryPort } from "@template/domain/ports"
import type { AuthorizationDecision } from "@template/domain/status"
import { Effect, Layer } from "effect"
import { SingleRunner } from "effect/unstable/cluster"
import { HttpRouter } from "effect/unstable/http"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { layer as AgentEntityLayer } from "../src/entities/AgentEntity.js"
import { layer as MemoryEntityLayer } from "../src/entities/MemoryEntity.js"
import { ProxyApi, ProxyHandlersLive } from "../src/gateway/ProxyGateway.js"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import { MemoryPortSqlite } from "../src/MemoryPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { AgentStatePortTag, GovernancePortTag, MemoryPortTag } from "../src/PortTags.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"

const AGENT_ID = "agent:memory-api" as AgentId

const ProxyApiLive = HttpApiBuilder.layer(ProxyApi).pipe(
  Layer.provide(ProxyHandlersLive)
)

describe("Memory API e2e", () => {
  it.live("store -> search -> forget via proxy endpoints", () => {
    const dbPath = testDatabasePath("memory-api-happy")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(ProxyApiLive, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath)),
        Layer.build
      )

      const client = yield* HttpClient.HttpClient

      const storeRequest = yield* HttpClientRequest.post(`/memories/store/${AGENT_ID}`).pipe(
        HttpClientRequest.bodyJson({
          requestId: "store:memory-api-1",
          items: [
            { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "User's name is Alex" },
            {
              tier: "SemanticMemory",
              scope: "GlobalScope",
              source: "AgentSource",
              content: "User prefers concise responses"
            }
          ]
        })
      )
      const storeResponse = yield* client.execute(storeRequest)
      expect(storeResponse.status).toBe(200)
      const storedIds = (yield* storeResponse.json) as Array<string>
      expect(storedIds).toHaveLength(2)

      const searchRequest = yield* HttpClientRequest.post(`/memories/search/${AGENT_ID}`).pipe(
        HttpClientRequest.bodyJson({
          query: "Alex",
          tier: "SemanticMemory",
          limit: 20
        })
      )
      const searchResponse = yield* client.execute(searchRequest)
      expect(searchResponse.status).toBe(200)
      const searchBody = (yield* searchResponse.json) as {
        readonly items: ReadonlyArray<{ readonly content: string }>
        readonly totalCount: number
      }
      expect(searchBody.totalCount).toBe(1)
      expect(searchBody.items[0].content).toContain("Alex")

      const forgetRequest = yield* HttpClientRequest.post(`/memories/forget/${AGENT_ID}`).pipe(
        HttpClientRequest.bodyJson({
          requestId: "forget:memory-api-1",
          cutoff: "2100-01-01T00:00:00.000Z"
        })
      )
      const forgetResponse = yield* client.execute(forgetRequest)
      expect(forgetResponse.status).toBe(200)
      const deletedCount = (yield* forgetResponse.json) as number
      expect(deletedCount).toBe(2)

      const finalSearchRequest = yield* HttpClientRequest.post(`/memories/search/${AGENT_ID}`).pipe(
        HttpClientRequest.bodyJson({
          tier: "SemanticMemory",
          limit: 20
        })
      )
      const finalSearchResponse = yield* client.execute(finalSearchRequest)
      expect(finalSearchResponse.status).toBe(200)
      const finalSearchBody = (yield* finalSearchResponse.json) as {
        readonly items: ReadonlyArray<unknown>
      }
      expect(finalSearchBody.items).toHaveLength(0)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.live("denied policy returns MemoryAccessDenied and does not persist writes", () => {
    const dbPath = testDatabasePath("memory-api-deny")
    return Effect.gen(function*() {
      yield* HttpRouter.serve(ProxyApiLive, { disableLogger: true, disableListenLog: true }).pipe(
        Layer.provide(makeAppLayer(dbPath, "Deny")),
        Layer.build
      )

      const client = yield* HttpClient.HttpClient
      const deniedStoreRequest = yield* HttpClientRequest.post(`/memories/store/${AGENT_ID}`).pipe(
        HttpClientRequest.bodyJson({
          requestId: "store:memory-api-deny",
          items: [
            { tier: "SemanticMemory", scope: "GlobalScope", source: "UserSource", content: "Denied write" }
          ]
        })
      )
      const deniedStoreResponse = yield* client.execute(deniedStoreRequest)
      expect(deniedStoreResponse.status).toBe(403)
      const deniedBody = yield* deniedStoreResponse.text
      expect(deniedBody).toContain("MemoryAccessDenied")

      const persistedCount = yield* Effect.gen(function*() {
        const memoryPort = yield* MemoryPortSqlite
        const result = yield* memoryPort.search(AGENT_ID, { limit: 20 })
        return result.items.length
      }).pipe(
        Effect.provide(makeAppLayer(dbPath))
      )
      expect(persistedCount).toBe(0)
    }).pipe(
      Effect.provide(NodeHttpServer.layerTest),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const makeAppLayer = (
  dbPath: string,
  forcedDecision: AuthorizationDecision = "Allow"
) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const agentStateSqliteLayer = AgentStatePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const agentStateTagLayer = Layer.effect(
    AgentStatePortTag,
    Effect.gen(function*() {
      return (yield* AgentStatePortSqlite) as AgentStatePort
    })
  ).pipe(Layer.provide(agentStateSqliteLayer))

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

  const memoryPortSqliteLayer = MemoryPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const memoryPortTagLayer = Layer.effect(
    MemoryPortTag,
    Effect.gen(function*() {
      return (yield* MemoryPortSqlite) as MemoryPort
    })
  ).pipe(Layer.provide(memoryPortSqliteLayer))

  const agentEntityLayer = AgentEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(agentStateTagLayer)
  )

  const memoryEntityLayer = MemoryEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(memoryPortTagLayer),
    Layer.provide(memoryPortSqliteLayer),
    Layer.provide(governanceTagLayer)
  )

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    sandboxRuntimeLayer,
    agentStateSqliteLayer,
    agentStateTagLayer,
    governanceSqliteLayer,
    governanceTagLayer,
    memoryPortSqliteLayer,
    memoryPortTagLayer,
    agentEntityLayer,
    memoryEntityLayer
  ).pipe(
    Layer.provideMerge(clusterLayer)
  )
}

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
