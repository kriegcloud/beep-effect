import { describe, expect, it } from "@effect/vitest"
import type { AgentId, AuditEntryId, SessionId } from "@template/domain/ids"
import { ToolName } from "@template/domain/ids"
import type { Instant } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"

describe("GovernancePortSqlite", () => {
  it.effect("persists audit entries", () => {
    const dbPath = testDatabasePath("audit-write")
    const layer = makeGovernanceLayer(dbPath)
    const now = instant("2026-02-24T12:00:00.000Z")

    return Effect.gen(function*() {
      const governance = yield* GovernancePortSqlite

      yield* governance.writeAudit({
        auditEntryId: "audit:1" as AuditEntryId,
        agentId: "agent:governance" as AgentId,
        sessionId: null,
        decision: "Allow",
        reason: "policy_allow_default",
        createdAt: now
      })

      const audits = yield* governance.listAuditEntries()
      expect(audits).toHaveLength(1)
      expect(audits[0].auditEntryId).toBe("audit:1")
      expect(audits[0].reason).toBe("policy_allow_default")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("retains audit entries across restart", () => {
    const dbPath = testDatabasePath("audit-restart")
    const firstLayer = makeGovernanceLayer(dbPath)
    const secondLayer = makeGovernanceLayer(dbPath)
    const now = instant("2026-02-24T12:00:00.000Z")

    return Effect.gen(function*() {
      yield* Effect.gen(function*() {
        const governance = yield* GovernancePortSqlite
        yield* governance.writeAudit({
          auditEntryId: "audit:restart" as AuditEntryId,
          agentId: "agent:governance" as AgentId,
          sessionId: null,
          decision: "Allow",
          reason: "restart_probe",
          createdAt: now
        })
      }).pipe(Effect.provide(firstLayer))

      const audits = yield* Effect.gen(function*() {
        const governance = yield* GovernancePortSqlite
        return yield* governance.listAuditEntries()
      }).pipe(Effect.provide(secondLayer))

      expect(audits).toHaveLength(1)
      expect(audits[0].auditEntryId).toBe("audit:restart")
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

describe("evaluatePolicy — test tools in Standard mode", () => {
  const agentId = "agent:test-governance" as AgentId
  const sessionId = "session:test" as SessionId

  it.effect("returns RequireApproval for file_write", () => {
    const dbPath = testDatabasePath("policy-file-write")
    const layer = makeGovernanceLayer(dbPath)

    return Effect.gen(function*() {
      const sqlClient = yield* SqlClient.SqlClient
      yield* sqlClient`
        INSERT INTO agents (agent_id, permission_mode, token_budget, quota_period, tokens_consumed)
        VALUES (${agentId}, 'Standard', 100000, 'daily', 0)
      `.unprepared

      const governance = yield* GovernancePortSqlite
      const result = yield* governance.evaluatePolicy({
        agentId,
        sessionId,
        action: "InvokeTool",
        toolName: ToolName.makeUnsafe("file_write")
      })
      expect(result.decision).toBe("RequireApproval")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("returns RequireApproval for shell_execute", () => {
    const dbPath = testDatabasePath("policy-shell-execute")
    const layer = makeGovernanceLayer(dbPath)

    return Effect.gen(function*() {
      const sqlClient = yield* SqlClient.SqlClient
      yield* sqlClient`
        INSERT INTO agents (agent_id, permission_mode, token_budget, quota_period, tokens_consumed)
        VALUES (${agentId}, 'Standard', 100000, 'daily', 0)
      `.unprepared

      const governance = yield* GovernancePortSqlite
      const result = yield* governance.evaluatePolicy({
        agentId,
        sessionId,
        action: "InvokeTool",
        toolName: ToolName.makeUnsafe("shell_execute")
      })
      expect(result.decision).toBe("RequireApproval")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("returns RequireApproval for send_notification", () => {
    const dbPath = testDatabasePath("policy-send-notification")
    const layer = makeGovernanceLayer(dbPath)

    return Effect.gen(function*() {
      const sqlClient = yield* SqlClient.SqlClient
      yield* sqlClient`
        INSERT INTO agents (agent_id, permission_mode, token_budget, quota_period, tokens_consumed)
        VALUES (${agentId}, 'Standard', 100000, 'daily', 0)
      `.unprepared

      const governance = yield* GovernancePortSqlite
      const result = yield* governance.evaluatePolicy({
        agentId,
        sessionId,
        action: "InvokeTool",
        toolName: ToolName.makeUnsafe("send_notification")
      })
      expect(result.decision).toBe("RequireApproval")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

describe("syncBuiltInToolCatalog", () => {
  it.effect("creates all 14 built-in tool definitions on startup", () => {
    const dbPath = testDatabasePath("sync-creates")
    const layer = makeGovernanceLayer(dbPath)

    return Effect.gen(function*() {
      const sqlClient = yield* SqlClient.SqlClient
      const rows = yield* sqlClient`
        SELECT tool_definition_id, tool_name, source_kind, is_safe_standard
        FROM tool_definitions
        WHERE source_kind = 'BuiltIn'
        ORDER BY tool_name ASC
      `.unprepared

      expect(rows).toHaveLength(14)

      // Spot-check safe standards
      const timeNow = rows.find((r) => r.tool_name === "time_now")
      expect(timeNow?.tool_definition_id).toBe("tooldef:time_now:v1")
      expect(timeNow?.is_safe_standard).toBe(1)

      const shellExec = rows.find((r) => r.tool_name === "shell_execute")
      expect(shellExec?.tool_definition_id).toBe("tooldef:shell_execute:v1")
      expect(shellExec?.is_safe_standard).toBe(0)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("sync is idempotent across restart", () => {
    const dbPath = testDatabasePath("sync-idempotent")
    const firstLayer = makeGovernanceLayer(dbPath)
    const secondLayer = makeGovernanceLayer(dbPath)

    return Effect.gen(function*() {
      // First startup
      const countAfterFirst = yield* Effect.gen(function*() {
        const sqlClient = yield* SqlClient.SqlClient
        const rows = yield* sqlClient`
          SELECT COUNT(*) AS cnt FROM tool_definitions WHERE source_kind = 'BuiltIn'
        `.unprepared
        return Number(rows[0]?.cnt ?? 0)
      }).pipe(Effect.provide(firstLayer))

      // Second startup (same DB)
      const countAfterSecond = yield* Effect.gen(function*() {
        const sqlClient = yield* SqlClient.SqlClient
        const rows = yield* sqlClient`
          SELECT COUNT(*) AS cnt FROM tool_definitions WHERE source_kind = 'BuiltIn'
        `.unprepared
        return Number(rows[0]?.cnt ?? 0)
      }).pipe(Effect.provide(secondLayer))

      expect(countAfterFirst).toBe(14)
      expect(countAfterSecond).toBe(14)
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("drift check fails when same tool_name has wrong ID", () => {
    const dbPath = testDatabasePath("sync-drift-name")

    return Effect.gen(function*() {
      // First: create a valid DB via migrations only (no GovernancePortSqlite startup yet)
      const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
      const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
      const infraLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

      // Insert a row with mismatched ID for time_now
      yield* Effect.gen(function*() {
        const sqlClient = yield* SqlClient.SqlClient
        yield* sqlClient`
          INSERT OR REPLACE INTO tool_definitions (
            tool_definition_id, tool_name, source_kind, integration_id, is_safe_standard, created_at
          ) VALUES ('tooldef:time_now:WRONG', 'time_now', 'BuiltIn', NULL, 1, '2026-01-01T00:00:00.000Z')
        `.unprepared
      }).pipe(Effect.provide(infraLayer))

      // Now try to construct GovernancePortSqlite — should die
      const sandboxRuntimeLayer = SandboxRuntime.layer
      const governanceLayer = Layer.mergeAll(
        infraLayer,
        sandboxRuntimeLayer,
        GovernancePortSqlite.layer.pipe(
          Layer.provide(sandboxRuntimeLayer),
          Layer.provide(infraLayer)
        )
      )

      const exit = yield* Effect.gen(function*() {
        yield* GovernancePortSqlite
      }).pipe(
        Effect.provide(governanceLayer),
        Effect.exit
      )

      expect(exit._tag).toBe("Failure")
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("drift check fails when same ID has wrong tool_name", () => {
    const dbPath = testDatabasePath("sync-drift-id")

    return Effect.gen(function*() {
      const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
      const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
      const infraLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

      // Insert a row with correct ID but wrong name
      yield* Effect.gen(function*() {
        const sqlClient = yield* SqlClient.SqlClient
        // First delete the existing time_now row seeded by migration
        yield* sqlClient`
          DELETE FROM tool_definitions WHERE tool_name = 'time_now'
        `.unprepared
        yield* sqlClient`
          INSERT INTO tool_definitions (
            tool_definition_id, tool_name, source_kind, integration_id, is_safe_standard, created_at
          ) VALUES ('tooldef:time_now:v1', 'wrong_name', 'BuiltIn', NULL, 1, '2026-01-01T00:00:00.000Z')
        `.unprepared
      }).pipe(Effect.provide(infraLayer))

      const sandboxRuntimeLayer = SandboxRuntime.layer
      const governanceLayer = Layer.mergeAll(
        infraLayer,
        sandboxRuntimeLayer,
        GovernancePortSqlite.layer.pipe(
          Layer.provide(sandboxRuntimeLayer),
          Layer.provide(infraLayer)
        )
      )

      const exit = yield* Effect.gen(function*() {
        yield* GovernancePortSqlite
      }).pipe(
        Effect.provide(governanceLayer),
        Effect.exit
      )

      expect(exit._tag).toBe("Failure")
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const makeGovernanceLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer
  const governancePortLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(sqlInfrastructureLayer)
  )

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    sandboxRuntimeLayer,
    governancePortLayer
  )
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
