import { describe, expect, it } from "@effect/vitest"
import type { IntegrationPort } from "@template/domain/ports"
import { DateTime, Effect, Exit, Layer, Ref } from "effect"
import { Entity, ShardingConfig } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { IntegrationEntity, layer as IntegrationEntityLayer } from "../src/entities/IntegrationEntity.js"
import { ExternalServiceClientRegistry, type RuntimeIntegrationStatus } from "../src/integrations/ExternalServiceClientRegistry.js"
import { IntegrationPortSqlite } from "../src/IntegrationPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { IntegrationPortTag } from "../src/PortTags.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const testConfig = withTestPromptsConfig({
  providers: {
    anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
  },
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
      model: { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
      generation: { temperature: 0.7, maxOutputTokens: 4096 }
    }
  },
  server: { port: 3000 },
  channels: { cli: { enabled: true }, webchat: { enabled: false } },
  integrations: [
    { serviceId: "svc:test", name: "Test", endpoint: "http://localhost:9999", transport: "stdio" }
  ]
})

const agentConfigLayer = AgentConfig.layerFromParsed(testConfig)

describe("IntegrationEntity", () => {
  it.effect("connect creates records and getIntegrationStatus returns them", () => {
    const dbPath = testDatabasePath("int-entity-connect")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(IntegrationEntity, IntegrationEntityLayer)
      const client = yield* makeClient("int:test-1")

      yield* client.connect({
        agentId: "agent:default",
        serviceId: "svc:test",
        name: "Test Service",
        endpoint: "http://localhost:9999",
        transport: "stdio"
      })

      const status = yield* client.getIntegrationStatus({})
      expect(status.integrationId).toBe("int:test-1")
      expect(status.serviceId).toBe("svc:test")
      expect(status.status).toBe("Connected")
      expect(status.capabilities).toEqual([])
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("disconnect updates status to Disconnected", () => {
    const dbPath = testDatabasePath("int-entity-disconnect")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(IntegrationEntity, IntegrationEntityLayer)
      const client = yield* makeClient("int:test-2")

      yield* client.connect({
        agentId: "agent:default",
        serviceId: "svc:test-dc",
        name: "Disconnect Service",
        endpoint: "http://localhost:8888",
        transport: "sse"
      })

      yield* client.disconnect({})

      const status = yield* client.getIntegrationStatus({})
      expect(status.status).toBe("Disconnected")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("getIntegrationStatus for non-existent returns IntegrationNotFound", () => {
    const dbPath = testDatabasePath("int-entity-not-found")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(IntegrationEntity, IntegrationEntityLayer)
      const client = yield* makeClient("int:missing")

      const exit = yield* client.getIntegrationStatus({}).pipe(Effect.exit)
      expect(Exit.isFailure(exit)).toBe(true)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("connect is idempotent (calling twice does not error)", () => {
    const dbPath = testDatabasePath("int-entity-idempotent")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(IntegrationEntity, IntegrationEntityLayer)
      const client = yield* makeClient("int:test-idem")

      yield* client.connect({
        agentId: "agent:default",
        serviceId: "svc:idem",
        name: "Idempotent Service",
        endpoint: "http://localhost:7777",
        transport: "http"
      })

      // Second connect should not error (upsert semantics)
      yield* client.connect({
        agentId: "agent:default",
        serviceId: "svc:idem",
        name: "Idempotent Service",
        endpoint: "http://localhost:7777",
        transport: "http"
      })

      const status = yield* client.getIntegrationStatus({})
      expect(status.integrationId).toBe("int:test-idem")
      expect(status.status).toBe("Connected")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeTestLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const integrationPortSqliteLayer = IntegrationPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const integrationPortTagLayer = Layer.effect(
    IntegrationPortTag,
    Effect.gen(function*() {
      return (yield* IntegrationPortSqlite) as IntegrationPort
    })
  ).pipe(Layer.provide(integrationPortSqliteLayer))

  const integrationRegistryLayer = Layer.effect(
    ExternalServiceClientRegistry,
    Effect.gen(function*() {
      const integrationPort = yield* IntegrationPortTag
      const statusesRef = yield* Ref.make(new Map<string, RuntimeIntegrationStatus>())

      return ExternalServiceClientRegistry.of({
        connect: ({ integrationId, agentId, service }) =>
          Effect.gen(function*() {
            const now = yield* DateTime.now
            yield* integrationPort.createService(service)
            yield* integrationPort.createIntegration({
              integrationId,
              agentId,
              serviceId: service.serviceId,
              status: "Connected",
              capabilities: [],
              createdAt: now,
              updatedAt: now
            })
            yield* Ref.update(statusesRef, (map) => {
              const next = new Map(map)
              next.set(integrationId, {
                integrationId,
                agentId,
                serviceId: service.serviceId,
                status: "Connected",
                health: "healthy",
                capabilities: [],
                pid: null,
                lastError: null,
                updatedAt: now
              })
              return next
            })
          }),
        disconnect: (serviceId) =>
          Effect.gen(function*() {
            const now = yield* DateTime.now
            yield* Ref.update(statusesRef, (map) => {
              const next = new Map(map)
              for (const [integrationId, status] of next) {
                if (status.serviceId === serviceId) {
                  next.set(integrationId, {
                    ...status,
                    status: "Disconnected",
                    health: "degraded",
                    lastError: null,
                    updatedAt: now
                  })
                }
              }
              return next
            })

            const statuses = yield* Ref.get(statusesRef)
            for (const status of statuses.values()) {
              if (status.serviceId === serviceId) {
                yield* integrationPort.updateStatus(status.integrationId, "Disconnected")
              }
            }
          }),
        getStatus: (integrationId) =>
          Ref.get(statusesRef).pipe(
            Effect.map((map) => map.get(integrationId) ?? null)
          ),
        snapshot: () =>
          Ref.get(statusesRef).pipe(
            Effect.map((map) => {
              const integrations = [...map.values()]
              return {
                integrations,
                summary: {
                  total: integrations.length,
                  connected: integrations.filter((item) => item.status === "Connected").length,
                  initializing: integrations.filter((item) => item.status === "Initializing").length,
                  error: integrations.filter((item) => item.status === "Error").length,
                  disconnected: integrations.filter((item) => item.status === "Disconnected").length,
                  degraded: integrations.filter((item) => item.health === "degraded").length
                }
              }
            })
          )
      })
    })
  ).pipe(Layer.provide(integrationPortTagLayer))

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    integrationPortSqliteLayer,
    integrationPortTagLayer,
    integrationRegistryLayer,
    agentConfigLayer,
    ShardingConfig.layer()
  )
}

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
