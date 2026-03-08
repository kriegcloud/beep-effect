import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ExternalServiceId, IntegrationId } from "@template/domain/ids"
import type { ExternalServiceRecord, IntegrationRecord } from "@template/domain/integration"
import { ServicePromptCapability, ServiceResourceCapability, ServiceToolCapability } from "@template/domain/integration"
import type { Instant } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { IntegrationPortSqlite } from "../src/IntegrationPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

describe("IntegrationPortSqlite", () => {
  // ---- External Services ----

  it.effect("getService returns null for unknown service", () => {
    const dbPath = testDatabasePath("svc-null")
    return Effect.gen(function*() {
      const port = yield* IntegrationPortSqlite
      const result = yield* port.getService("svc:missing" as ExternalServiceId)
      expect(result).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("createService + getService roundtrip", () => {
    const dbPath = testDatabasePath("svc-roundtrip")
    return Effect.gen(function*() {
      const port = yield* IntegrationPortSqlite
      const now = instant("2026-02-25T10:00:00.000Z")

      const service: ExternalServiceRecord = makeService({
        serviceId: "svc:mcp-github" as ExternalServiceId,
        name: "GitHub MCP",
        endpoint: "http://localhost:3100",
        transport: "sse",
        identifier: "github-mcp-server",
        createdAt: now
      })

      yield* port.createService(service)
      const result = yield* port.getService(service.serviceId)

      expect(result).not.toBeNull()
      expect(result!.serviceId).toBe("svc:mcp-github")
      expect(result!.name).toBe("GitHub MCP")
      expect(result!.endpoint).toBe("http://localhost:3100")
      expect(result!.transport).toBe("sse")
      expect(result!.identifier).toBe("github-mcp-server")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  // ---- Integrations ----

  it.effect("getIntegration returns null for unknown integration", () => {
    const dbPath = testDatabasePath("int-null")
    return Effect.gen(function*() {
      const port = yield* IntegrationPortSqlite
      const result = yield* port.getIntegration("int:missing" as IntegrationId)
      expect(result).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("createIntegration + getIntegration roundtrip", () => {
    const dbPath = testDatabasePath("int-roundtrip")
    return Effect.gen(function*() {
      const port = yield* IntegrationPortSqlite
      const now = instant("2026-02-25T10:00:00.000Z")

      // First create a service that the integration references
      const service = makeService({
        serviceId: "svc:test-svc" as ExternalServiceId,
        name: "Test Service",
        endpoint: "http://localhost:9999",
        transport: "stdio",
        identifier: "test-server",
        createdAt: now
      })
      yield* port.createService(service)

      const integration: IntegrationRecord = makeIntegration({
        integrationId: "int:1" as IntegrationId,
        agentId: "agent:a1" as AgentId,
        serviceId: "svc:test-svc" as ExternalServiceId,
        status: "Connected",
        capabilities: [],
        createdAt: now,
        updatedAt: now
      })

      yield* port.createIntegration(integration)
      const result = yield* port.getIntegration(integration.integrationId)

      expect(result).not.toBeNull()
      expect(result!.integrationId).toBe("int:1")
      expect(result!.agentId).toBe("agent:a1")
      expect(result!.serviceId).toBe("svc:test-svc")
      expect(result!.status).toBe("Connected")
      expect(result!.capabilities).toEqual([])
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("getIntegrationByService returns integration for agent+service", () => {
    const dbPath = testDatabasePath("int-by-svc")
    return Effect.gen(function*() {
      const port = yield* IntegrationPortSqlite
      const now = instant("2026-02-25T10:00:00.000Z")

      const service = makeService({
        serviceId: "svc:lookup" as ExternalServiceId,
        name: "Lookup Service",
        endpoint: "http://localhost:8080",
        transport: "http",
        identifier: "lookup-server",
        createdAt: now
      })
      yield* port.createService(service)

      const integration = makeIntegration({
        integrationId: "int:lookup-1" as IntegrationId,
        agentId: "agent:a2" as AgentId,
        serviceId: "svc:lookup" as ExternalServiceId,
        status: "Initializing",
        capabilities: [],
        createdAt: now,
        updatedAt: now
      })
      yield* port.createIntegration(integration)

      const result = yield* port.getIntegrationByService(
        "agent:a2" as AgentId,
        "svc:lookup" as ExternalServiceId
      )
      expect(result).not.toBeNull()
      expect(result!.integrationId).toBe("int:lookup-1")

      // Non-existent combo returns null
      const missing = yield* port.getIntegrationByService(
        "agent:other" as AgentId,
        "svc:lookup" as ExternalServiceId
      )
      expect(missing).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("updateStatus changes the status", () => {
    const dbPath = testDatabasePath("int-update-status")
    return Effect.gen(function*() {
      const port = yield* IntegrationPortSqlite
      const now = instant("2026-02-25T10:00:00.000Z")

      const service = makeService({
        serviceId: "svc:status-test" as ExternalServiceId,
        name: "Status Test",
        endpoint: "http://localhost:7777",
        transport: "stdio",
        identifier: "status-server",
        createdAt: now
      })
      yield* port.createService(service)

      const integration = makeIntegration({
        integrationId: "int:status-1" as IntegrationId,
        agentId: "agent:a3" as AgentId,
        serviceId: "svc:status-test" as ExternalServiceId,
        status: "Initializing",
        capabilities: [],
        createdAt: now,
        updatedAt: now
      })
      yield* port.createIntegration(integration)

      yield* port.updateStatus("int:status-1" as IntegrationId, "Connected")

      const result = yield* port.getIntegration("int:status-1" as IntegrationId)
      expect(result).not.toBeNull()
      expect(result!.status).toBe("Connected")

      // Update again to Error
      yield* port.updateStatus("int:status-1" as IntegrationId, "Error")
      const result2 = yield* port.getIntegration("int:status-1" as IntegrationId)
      expect(result2!.status).toBe("Error")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("capabilities JSON roundtrip with mixed capability types", () => {
    const dbPath = testDatabasePath("int-caps-roundtrip")
    return Effect.gen(function*() {
      const port = yield* IntegrationPortSqlite
      const now = instant("2026-02-25T10:00:00.000Z")

      const service = makeService({
        serviceId: "svc:caps-test" as ExternalServiceId,
        name: "Caps Test",
        endpoint: "http://localhost:6666",
        transport: "sse",
        identifier: "caps-server",
        createdAt: now
      })
      yield* port.createService(service)

      const capabilities = [
        new ServiceToolCapability({ name: "read_file", description: "Read a file" }),
        new ServiceResourceCapability({ name: "file_tree", uri: "file:///project" }),
        new ServicePromptCapability({ name: "code_review" })
      ]

      const integration = makeIntegration({
        integrationId: "int:caps-1" as IntegrationId,
        agentId: "agent:a4" as AgentId,
        serviceId: "svc:caps-test" as ExternalServiceId,
        status: "Connected",
        capabilities,
        createdAt: now,
        updatedAt: now
      })
      yield* port.createIntegration(integration)

      const result = yield* port.getIntegration("int:caps-1" as IntegrationId)
      expect(result).not.toBeNull()
      expect(result!.capabilities).toHaveLength(3)

      const [tool, resource, prompt] = result!.capabilities
      expect(tool._tag).toBe("ServiceToolCapability")
      expect(tool.name).toBe("read_file")
      expect((tool as any).description).toBe("Read a file")

      expect(resource._tag).toBe("ServiceResourceCapability")
      expect(resource.name).toBe("file_tree")
      expect((resource as any).uri).toBe("file:///project")

      expect(prompt._tag).toBe("ServicePromptCapability")
      expect(prompt.name).toBe("code_review")
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

  return IntegrationPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })

const makeService = (props: {
  serviceId: ExternalServiceId
  name: string
  endpoint: string
  transport: "stdio" | "sse" | "http"
  identifier: string
  createdAt: Instant
}): ExternalServiceRecord =>
  ({
    serviceId: props.serviceId,
    name: props.name,
    endpoint: props.endpoint,
    transport: props.transport,
    identifier: props.identifier,
    createdAt: props.createdAt
  }) as ExternalServiceRecord

const makeIntegration = (props: {
  integrationId: IntegrationId
  agentId: AgentId
  serviceId: ExternalServiceId
  status: "Connected" | "Disconnected" | "Error" | "Initializing"
  capabilities: ReadonlyArray<any>
  createdAt: Instant
  updatedAt: Instant
}): IntegrationRecord =>
  ({
    integrationId: props.integrationId,
    agentId: props.agentId,
    serviceId: props.serviceId,
    status: props.status,
    capabilities: props.capabilities,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt
  }) as IntegrationRecord
