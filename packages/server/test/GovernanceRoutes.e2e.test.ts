import { describe, expect, it } from "@effect/vitest"
import type { AgentId, SessionId } from "@template/domain/ids"
import type {
  AgentState,
  AgentStatePort,
  GovernancePort,
  Instant,
  SessionTurnPort,
  ToolInvocationRecord
} from "@template/domain/ports"
import { DateTime, Effect, Layer, Schema } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentStatePortSqlite } from "../src/AgentStatePortSqlite.js"
import { handleListAgentPolicies, handleListSessionToolInvocations } from "../src/gateway/GovernanceRoutes.js"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { AgentStatePortTag, GovernancePortTag, SessionTurnPortTag } from "../src/PortTags.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"

describe("GovernanceRoutes e2e", () => {
  it("returns session-scoped tool invocation list with pagination and filters", async () => {
    const dbPath = testDatabasePath("governance-routes-success")
    const layer = makeAppLayer(dbPath)
    const sessionId = "session:governance" as SessionId
    const now = instant("2026-02-27T12:00:00.000Z")

    const program = Effect.gen(function*() {
      const sessions = yield* SessionTurnPortTag
      const governance = yield* GovernancePortTag

      yield* sessions.startSession({
        sessionId,
        conversationId: "conversation:governance" as ToolInvocationRecord["conversationId"],
        tokenCapacity: 10_000,
        tokensUsed: 0
      })

      yield* governance.recordToolInvocationWithAudit({
        invocation: {
          toolInvocationId: "toolinv:1" as ToolInvocationRecord["toolInvocationId"],
          idempotencyKey: "tool-idem:test:1",
          auditEntryId: "audit:1" as ToolInvocationRecord["auditEntryId"],
          toolDefinitionId: "tooldef:echo_text:v1" as ToolInvocationRecord["toolDefinitionId"],
          auditLogId: "auditlog:governance:default:v1" as ToolInvocationRecord["auditLogId"],
          agentId: "agent:governance" as AgentId,
          sessionId,
          conversationId: "conversation:governance" as ToolInvocationRecord["conversationId"],
          turnId: "turn:1" as ToolInvocationRecord["turnId"],
          toolName: "echo_text" as ToolInvocationRecord["toolName"],
          inputJson: "{\"text\":\"hello\"}",
          outputJson: "{\"text\":\"hello\"}",
          decision: "Allow",
          complianceStatus: "Compliant",
          policyId: "policy:invoke_tool:standard:allow_safe:v1" as ToolInvocationRecord["policyId"],
          reason: "tool_invoked:echo_text",
          invokedAt: now,
          completedAt: now
        },
        audit: {
          auditEntryId: "audit:1" as ToolInvocationRecord["auditEntryId"],
          auditLogId: "auditlog:governance:default:v1" as ToolInvocationRecord["auditLogId"],
          toolInvocationId: "toolinv:1" as ToolInvocationRecord["toolInvocationId"],
          agentId: "agent:governance" as AgentId,
          sessionId,
          decision: "Allow",
          reason: "tool_invoked:echo_text",
          createdAt: now
        }
      })

      const response = yield* handleListSessionToolInvocations(
        `http://localhost/governance/sessions/${sessionId}/tool-invocations?limit=10&offset=0&decision=Allow&complianceStatus=Compliant&toolName=echo_text`,
        { governance, sessions }
      )

      expect(response.status).toBe(200)
      const body = decodeJson(decodeResponseBody(response)) as {
        readonly sessionId: string
        readonly totalCount: number
        readonly limit: number
        readonly offset: number
        readonly items: ReadonlyArray<{
          readonly toolName: string
          readonly toolDefinitionId: string | null
          readonly auditLogId: string
          readonly policy?: { readonly selector: string } | null
          readonly tool?: { readonly sourceKind: string } | null
        }>
      }
      expect(body.sessionId).toBe(sessionId)
      expect(body.totalCount).toBe(1)
      expect(body.limit).toBe(10)
      expect(body.offset).toBe(0)
      expect(body.items[0].toolName).toBe("echo_text")
      expect(body.items[0].toolDefinitionId).toBe("tooldef:echo_text:v1")
      expect(body.items[0].auditLogId).toBe("auditlog:governance:default:v1")
      expect(body.items[0].policy?.selector).toBe("SafeStandardTools")
      expect(body.items[0].tool?.sourceKind).toBe("BuiltIn")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program)
  })

  it("returns 404 when session does not exist", async () => {
    const dbPath = testDatabasePath("governance-routes-404")
    const layer = makeAppLayer(dbPath)

    const program = Effect.gen(function*() {
      const sessions = yield* SessionTurnPortTag
      const governance = yield* GovernancePortTag

      const response = yield* handleListSessionToolInvocations(
        "http://localhost/governance/sessions/session:missing/tool-invocations",
        { governance, sessions }
      )

      expect(response.status).toBe(404)
      const body = decodeResponseBody(response)
      expect(body).toContain("SessionNotFound")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program)
  })

  it("returns 400 for invalid query params", async () => {
    const dbPath = testDatabasePath("governance-routes-400")
    const layer = makeAppLayer(dbPath)
    const sessionId = "session:governance-400" as SessionId

    const program = Effect.gen(function*() {
      const sessions = yield* SessionTurnPortTag
      const governance = yield* GovernancePortTag
      yield* sessions.startSession({
        sessionId,
        conversationId: "conversation:governance-400" as ToolInvocationRecord["conversationId"],
        tokenCapacity: 10_000,
        tokensUsed: 0
      })

      const response = yield* handleListSessionToolInvocations(
        `http://localhost/governance/sessions/${sessionId}/tool-invocations?decision=Nope`,
        { governance, sessions }
      )

      expect(response.status).toBe(400)
      const body = decodeResponseBody(response)
      expect(body).toContain("BadRequest")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program)
  })

  it("returns agent policy list and 404 for unknown agent", async () => {
    const dbPath = testDatabasePath("governance-routes-policies")
    const layer = makeAppLayer(dbPath)

    const program = Effect.gen(function*() {
      const agents = yield* AgentStatePortTag
      const governance = yield* GovernancePortTag
      yield* agents.upsert(makeAgentState({
        agentId: "agent:policies" as AgentId,
        permissionMode: "Standard"
      }))

      const success = yield* handleListAgentPolicies(
        "http://localhost/governance/agents/agent:policies/policies?action=InvokeTool",
        { governance, agents }
      )

      expect(success.status).toBe(200)
      const successBody = decodeJson(decodeResponseBody(success)) as {
        readonly totalCount: number
        readonly items: ReadonlyArray<{ readonly policyId: string }>
      }
      expect(successBody.totalCount).toBeGreaterThan(0)
      expect(successBody.items.some((item) => item.policyId.includes("standard"))).toBe(true)

      const missing = yield* handleListAgentPolicies(
        "http://localhost/governance/agents/agent:missing/policies",
        { governance, agents }
      )
      expect(missing.status).toBe(404)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
    await Effect.runPromise(program)
  })
})

const makeAppLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer

  const governanceSqliteLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(sqlInfrastructureLayer)
  )
  const governanceTagLayer = Layer.effect(
    GovernancePortTag,
    Effect.gen(function*() {
      return (yield* GovernancePortSqlite) as GovernancePort
    })
  ).pipe(Layer.provide(governanceSqliteLayer))

  const sessionTurnSqliteLayer = SessionTurnPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const sessionTurnTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() {
      return (yield* SessionTurnPortSqlite) as SessionTurnPort
    })
  ).pipe(Layer.provide(sessionTurnSqliteLayer))

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
    sqlInfrastructureLayer,
    sandboxRuntimeLayer,
    governanceSqliteLayer,
    governanceTagLayer,
    sessionTurnSqliteLayer,
    sessionTurnTagLayer,
    agentStateSqliteLayer,
    agentStateTagLayer
  )
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeAgentState = (overrides: Partial<AgentState>): AgentState => ({
  agentId: "agent:default" as AgentId,
  permissionMode: "Standard",
  tokenBudget: 1_000,
  maxToolIterations: 10,
  quotaPeriod: "Daily",
  tokensConsumed: 0,
  budgetResetAt: null,
  ...overrides
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const decodeResponseBody = (response: unknown) => {
  if (typeof response !== "object" || response === null) {
    return ""
  }
  const raw = (
    response as {
      readonly body?: {
        readonly body?: Uint8Array | string
      }
    }
  ).body?.body
  if (raw === undefined) {
    return ""
  }
  return typeof raw === "string" ? raw : new TextDecoder().decode(raw)
}

const decodeJsonUnknown = Schema.decodeUnknownSync(Schema.UnknownFromJsonString)

const decodeJson = (input: string): unknown => decodeJsonUnknown(input)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
