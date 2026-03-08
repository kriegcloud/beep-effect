import { ToolQuotaExceeded } from "@template/domain/errors"
import { DEFAULT_PAGINATION_LIMIT } from "@template/domain/system-defaults"
import type { AgentId, AuditLogId, PolicyId, ToolDefinitionId, ToolInvocationId, ToolName } from "@template/domain/ids"
import type {
  AuditEntryRecord,
  GovernancePort,
  PermissionPolicyRecord,
  PolicyDecision,
  ToolInvocationRecord
} from "@template/domain/ports"
import type { GovernanceAction, PermissionMode, PolicySelector } from "@template/domain/status"
import { DateTime, Effect, Layer, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { TOOL_CATALOG } from "./ai/ToolCatalog.js"
import { sqlInstant, sqlJsonColumn } from "./persistence/SqlCodecs.js"
import { SandboxRuntime } from "./safety/SandboxRuntime.js"

const POLICY_SYSTEM_ERROR = "policy:invoke_tool:system_error:v1" as PolicyId
const POLICY_INVALID_REQUEST = "policy:invoke_tool:invalid_request:v1" as PolicyId
const POLICY_MISSING_AGENT = "policy:invoke_tool:missing_agent:v1" as PolicyId
const POLICY_UNKNOWN_TOOL = "policy:invoke_tool:unknown_tool:v1" as PolicyId

type ToolDefinitionRow = {
  readonly tool_definition_id: string
  readonly tool_name: string
  readonly source_kind: string
  readonly integration_id: string | null
  readonly is_safe_standard: number
}

type PolicyRow = {
  readonly policy_id: string
  readonly action: GovernanceAction
  readonly permission_mode: PermissionMode | null
  readonly selector: PolicySelector
  readonly decision: PolicyDecision["decision"]
  readonly reason_template: string
  readonly precedence: number
  readonly active: number
  readonly tool_definition_ids_json: string
}

type ToolInvocationListRow = {
  readonly tool_invocation_id: string
  readonly idempotency_key: string
  readonly audit_entry_id: string
  readonly tool_definition_id: string | null
  readonly audit_log_id: string
  readonly agent_id: string
  readonly session_id: string
  readonly conversation_id: string
  readonly turn_id: string
  readonly tool_name: string
  readonly input_json: string
  readonly output_json: string
  readonly decision: ToolInvocationRecord["decision"]
  readonly compliance_status: ToolInvocationRecord["complianceStatus"]
  readonly policy_id: string
  readonly reason: string
  readonly invoked_at: string
  readonly completed_at: string
  readonly policy_selector: PolicySelector | null
  readonly policy_decision: ToolInvocationRecord["decision"] | null
  readonly policy_reason_template: string | null
  readonly policy_permission_mode: PermissionMode | null
  readonly policy_precedence: number | null
  readonly tool_source_kind: string | null
  readonly tool_is_safe_standard: number | null
  readonly tool_integration_id: string | null
}

export class GovernancePortSqlite extends ServiceMap.Service<GovernancePortSqlite>()(
  "server/GovernancePortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient
      const sandboxRuntime = yield* SandboxRuntime

      // ── Hardened built-in tool catalog sync ──────────────────────────
      yield* syncBuiltInToolCatalog(sql)

      const getAgentPermissionMode = (agentId: AgentId) =>
        sql`
          SELECT permission_mode
          FROM agents
          WHERE agent_id = ${agentId}
          LIMIT 1
        `.unprepared.pipe(
          Effect.map((rows) => {
            const value = rows[0]?.permission_mode
            return typeof value === "string"
              ? value as PermissionMode
              : null
          })
        )

      const getToolDefinitionByName = (toolName: ToolName) =>
        sql`
          SELECT
            tool_definition_id,
            tool_name,
            source_kind,
            integration_id,
            is_safe_standard
          FROM tool_definitions
          WHERE tool_name = ${toolName}
          LIMIT 1
        `.unprepared.pipe(
          Effect.map((rows) => rows.length > 0 ? rows[0] as ToolDefinitionRow : null)
        )

      const listModePolicies = (permissionMode: PermissionMode) =>
        sql`
          SELECT
            p.policy_id,
            p.action,
            p.permission_mode,
            p.selector,
            p.decision,
            p.reason_template,
            p.precedence,
            p.active,
            COALESCE((
              SELECT json_group_array(ppt.tool_definition_id)
              FROM permission_policy_tools ppt
              WHERE ppt.policy_id = p.policy_id
            ), '[]') AS tool_definition_ids_json
          FROM permission_policies p
          WHERE
            p.action = 'InvokeTool'
            AND p.permission_mode = ${permissionMode}
            AND p.active = 1
          ORDER BY p.precedence ASC, p.policy_id ASC
        `.unprepared.pipe(
          Effect.map((rows) => rows as ReadonlyArray<PolicyRow>)
        )

      const listModePoliciesByAction = (permissionMode: PermissionMode, action: GovernanceAction) =>
        sql`
          SELECT
            p.policy_id,
            p.action,
            p.permission_mode,
            p.selector,
            p.decision,
            p.reason_template,
            p.precedence,
            p.active,
            COALESCE((
              SELECT json_group_array(ppt.tool_definition_id)
              FROM permission_policy_tools ppt
              WHERE ppt.policy_id = p.policy_id
            ), '[]') AS tool_definition_ids_json
          FROM permission_policies p
          WHERE
            p.action = ${action}
            AND p.permission_mode = ${permissionMode}
            AND p.active = 1
          ORDER BY p.precedence ASC, p.policy_id ASC
        `.unprepared.pipe(
          Effect.map((rows) => rows as ReadonlyArray<PolicyRow>)
        )

      const evaluatePolicy: GovernancePort["evaluatePolicy"] = (input) =>
        Effect.gen(function*() {
          // InvokeTool: existing full path with tool definition + selector matching
          if (input.action === "InvokeTool") {
            const toolName = input.toolName?.trim()
            if (toolName === undefined || toolName.length === 0) {
              return {
                decision: "Deny",
                policyId: POLICY_INVALID_REQUEST,
                toolDefinitionId: null,
                reason: "invalid_tool_name"
              } satisfies PolicyDecision
            }

            const permissionMode = yield* getAgentPermissionMode(input.agentId)
            if (permissionMode === null) {
              return {
                decision: "Deny",
                policyId: POLICY_MISSING_AGENT,
                toolDefinitionId: null,
                reason: "missing_agent_state"
              } satisfies PolicyDecision
            }

            const toolDefinition = yield* getToolDefinitionByName(toolName as ToolName)
            if (toolDefinition === null) {
              return {
                decision: "Deny",
                policyId: POLICY_UNKNOWN_TOOL,
                toolDefinitionId: null,
                reason: "unknown_tool_definition"
              } satisfies PolicyDecision
            }

            const policies = yield* listModePolicies(permissionMode)
            for (const policy of policies) {
              const explicitToolIds = parseToolDefinitionIds(policy.tool_definition_ids_json)
              if (!selectorMatches(policy.selector, toolDefinition, explicitToolIds)) {
                continue
              }
              return {
                decision: policy.decision,
                policyId: policy.policy_id as PolicyId,
                toolDefinitionId: toolDefinition.tool_definition_id as ToolDefinitionId,
                reason: policy.reason_template
              } satisfies PolicyDecision
            }

            return {
              decision: "Deny",
              policyId: POLICY_SYSTEM_ERROR,
              toolDefinitionId: toolDefinition.tool_definition_id as ToolDefinitionId,
              reason: "no_matching_policy"
            } satisfies PolicyDecision
          }

          // Non-tool actions: action-specific policy matching (AllTools selector)
          const permissionMode = yield* getAgentPermissionMode(input.agentId)
          if (permissionMode === null) {
            return {
              decision: "Deny",
              policyId: POLICY_MISSING_AGENT,
              toolDefinitionId: null,
              reason: "missing_agent_state"
            } satisfies PolicyDecision
          }

          const policies = yield* listModePoliciesByAction(permissionMode, input.action)
          for (const policy of policies) {
            // Non-tool policies use AllTools selector as a catch-all
            return {
              decision: policy.decision,
              policyId: policy.policy_id as PolicyId,
              toolDefinitionId: null,
              reason: policy.reason_template
            } satisfies PolicyDecision
          }

          // Default-deny: no matching policy found
          return {
            decision: "Deny",
            policyId: null,
            toolDefinitionId: null,
            reason: "no_matching_policy"
          } satisfies PolicyDecision
        }).pipe(
          Effect.catchCause(() =>
            Effect.succeed(
              {
                decision: "Deny",
                policyId: POLICY_SYSTEM_ERROR,
                toolDefinitionId: null,
                reason: "governance_evaluate_policy_error"
              } satisfies PolicyDecision
            )
          )
        )

      const checkToolQuota: GovernancePort["checkToolQuota"] = (agentId, toolName, now) =>
        Effect.gen(function*() {
          const permissionMode = yield* getAgentPermissionMode(agentId)
          const maxPerDay = permissionMode === "Permissive"
            ? 5_000
            : permissionMode === "Restrictive"
            ? 50
            : 500

          const windowStart = sqlInstant.encode(DateTime.removeTime(now))
          yield* sql.withTransaction(
            Effect.gen(function*() {
              const rows = yield* sql`
                SELECT used_count
                FROM tool_quota_counters
                WHERE
                  agent_id = ${agentId}
                  AND tool_name = ${toolName}
                  AND window_start = ${windowStart}
                LIMIT 1
              `.unprepared

              const usedCount = Number(rows[0]?.used_count ?? 0)
              if (usedCount >= maxPerDay) {
                return yield* new ToolQuotaExceeded({
                  agentId,
                  toolName,
                  remainingInvocations: 0
                })
              }

              if (rows.length === 0) {
                yield* sql`
                  INSERT INTO tool_quota_counters (
                    agent_id,
                    tool_name,
                    window_start,
                    used_count
                  ) VALUES (
                    ${agentId},
                    ${toolName},
                    ${windowStart},
                    ${1}
                  )
                `.unprepared
              } else {
                yield* sql`
                  UPDATE tool_quota_counters
                  SET used_count = ${usedCount + 1}
                  WHERE
                    agent_id = ${agentId}
                    AND tool_name = ${toolName}
                    AND window_start = ${windowStart}
                `.unprepared
              }
            })
          )
        }).pipe(
          Effect.catch((error: unknown) =>
            isToolQuotaExceededError(error)
              ? Effect.fail(error)
              : Effect.die(error)
          )
        )

      const writeAudit: GovernancePort["writeAudit"] = (entry) =>
        sql`
          INSERT OR REPLACE INTO audit_entries (
            audit_entry_id,
            audit_log_id,
            tool_invocation_id,
            agent_id,
            session_id,
            decision,
            reason,
            created_at
          ) VALUES (
            ${entry.auditEntryId},
            ${entry.auditLogId ?? null},
            ${entry.toolInvocationId ?? null},
            ${entry.agentId},
            ${entry.sessionId},
            ${entry.decision},
            ${entry.reason},
            ${sqlInstant.encode(entry.createdAt)}
          )
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const recordToolInvocation: GovernancePort["recordToolInvocation"] = (record) =>
        sql`
          INSERT OR REPLACE INTO tool_invocations (
            tool_invocation_id,
            idempotency_key,
            audit_entry_id,
            tool_definition_id,
            audit_log_id,
            agent_id,
            session_id,
            conversation_id,
            turn_id,
            tool_name,
            input_json,
            output_json,
            decision,
            compliance_status,
            policy_id,
            reason,
            invoked_at,
            completed_at
          ) VALUES (
            ${record.toolInvocationId},
            ${record.idempotencyKey},
            ${record.auditEntryId},
            ${record.toolDefinitionId},
            ${record.auditLogId},
            ${record.agentId},
            ${record.sessionId},
            ${record.conversationId},
            ${record.turnId},
            ${record.toolName},
            ${record.inputJson},
            ${record.outputJson},
            ${record.decision},
            ${record.complianceStatus},
            ${record.policyId},
            ${record.reason},
            ${sqlInstant.encode(record.invokedAt)},
            ${sqlInstant.encode(record.completedAt)}
          )
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const findToolInvocationByIdempotencyKey: GovernancePort["findToolInvocationByIdempotencyKey"] = (
        idempotencyKey
      ) =>
        sql`
          SELECT
            ti.tool_invocation_id,
            ti.idempotency_key,
            ti.audit_entry_id,
            ti.tool_definition_id,
            ti.audit_log_id,
            ti.agent_id,
            ti.session_id,
            ti.conversation_id,
            ti.turn_id,
            ti.tool_name,
            ti.input_json,
            ti.output_json,
            ti.decision,
            ti.compliance_status,
            ti.policy_id,
            ti.reason,
            ti.invoked_at,
            ti.completed_at,
            pp.selector AS policy_selector,
            pp.decision AS policy_decision,
            pp.reason_template AS policy_reason_template,
            pp.permission_mode AS policy_permission_mode,
            pp.precedence AS policy_precedence,
            td.source_kind AS tool_source_kind,
            td.is_safe_standard AS tool_is_safe_standard,
            td.integration_id AS tool_integration_id
          FROM tool_invocations ti
          LEFT JOIN permission_policies pp ON pp.policy_id = ti.policy_id
          LEFT JOIN tool_definitions td ON td.tool_definition_id = ti.tool_definition_id
          WHERE ti.idempotency_key = ${idempotencyKey}
          LIMIT 1
        `.unprepared.pipe(
          Effect.map((rows) =>
            rows.length > 0
              ? decodeToolInvocationRow(rows[0] as ToolInvocationListRow)
              : null
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const recordToolInvocationWithAudit: GovernancePort["recordToolInvocationWithAudit"] = (input) =>
        sql.withTransaction(
          Effect.gen(function*() {
            yield* recordToolInvocation(input.invocation)
            yield* writeAudit(input.audit)
          })
        ).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const listToolInvocationsBySession: GovernancePort["listToolInvocationsBySession"] = (
        sessionId,
        query
      ) =>
        Effect.gen(function*() {
          const conditions: Array<string> = [
            `ti.session_id = '${escapeSql(sessionId)}'`
          ]
          if (query.decision !== undefined) {
            conditions.push(`ti.decision = '${escapeSql(query.decision)}'`)
          }
          if (query.complianceStatus !== undefined) {
            conditions.push(`ti.compliance_status = '${escapeSql(query.complianceStatus)}'`)
          }
          if (query.policyId !== undefined) {
            conditions.push(`ti.policy_id = '${escapeSql(query.policyId)}'`)
          }
          if (query.toolName !== undefined) {
            conditions.push(`ti.tool_name = '${escapeSql(query.toolName)}'`)
          }
          const whereClause = conditions.join(" AND ")
          const limit = query.limit ?? DEFAULT_PAGINATION_LIMIT
          const offset = query.offset ?? 0

          const countRows = yield* sql`
            SELECT COUNT(*) AS cnt
            FROM tool_invocations ti
            WHERE ${sql.unsafe(whereClause)}
          `.unprepared
          const totalCount = Number(countRows[0]?.cnt ?? 0)

          const rows = yield* sql`
            SELECT
              ti.tool_invocation_id,
              ti.idempotency_key,
              ti.audit_entry_id,
              ti.tool_definition_id,
              ti.audit_log_id,
              ti.agent_id,
              ti.session_id,
              ti.conversation_id,
              ti.turn_id,
              ti.tool_name,
              ti.input_json,
              ti.output_json,
              ti.decision,
              ti.compliance_status,
              ti.policy_id,
              ti.reason,
              ti.invoked_at,
              ti.completed_at,
              pp.selector AS policy_selector,
              pp.decision AS policy_decision,
              pp.reason_template AS policy_reason_template,
              pp.permission_mode AS policy_permission_mode,
              pp.precedence AS policy_precedence,
              td.source_kind AS tool_source_kind,
              td.is_safe_standard AS tool_is_safe_standard,
              td.integration_id AS tool_integration_id
            FROM tool_invocations ti
            LEFT JOIN permission_policies pp ON pp.policy_id = ti.policy_id
            LEFT JOIN tool_definitions td ON td.tool_definition_id = ti.tool_definition_id
            WHERE ${sql.unsafe(whereClause)}
            ORDER BY ti.invoked_at ASC, ti.tool_invocation_id ASC
            LIMIT ${limit}
            OFFSET ${offset}
          `.unprepared

          return {
            items: rows.map((row) => decodeToolInvocationRow(row as ToolInvocationListRow)),
            totalCount
          }
        }).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const listPoliciesForAgent: GovernancePort["listPoliciesForAgent"] = (agentId) =>
        Effect.gen(function*() {
          const permissionMode = yield* getAgentPermissionMode(agentId)
          if (permissionMode === null) {
            return [] as ReadonlyArray<PermissionPolicyRecord>
          }

          const rows = yield* sql`
            SELECT
              p.policy_id,
              p.action,
              p.permission_mode,
              p.selector,
              p.decision,
              p.reason_template,
              p.precedence,
              p.active,
              COALESCE((
                SELECT json_group_array(ppt.tool_definition_id)
                FROM permission_policy_tools ppt
                WHERE ppt.policy_id = p.policy_id
              ), '[]') AS tool_definition_ids_json
            FROM permission_policies p
            WHERE
              p.active = 1
              AND (p.permission_mode = ${permissionMode} OR p.permission_mode IS NULL)
            ORDER BY p.precedence ASC, p.policy_id ASC
          `.unprepared

          return (rows as ReadonlyArray<PolicyRow>).map((row) => ({
            policyId: row.policy_id as PolicyId,
            action: row.action,
            permissionMode: row.permission_mode,
            selector: row.selector,
            decision: row.decision,
            reasonTemplate: row.reason_template,
            precedence: row.precedence,
            active: row.active === 1,
            toolDefinitionIds: parseToolDefinitionIds(row.tool_definition_ids_json)
          }))
        }).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const listAuditEntries: GovernancePort["listAuditEntries"] = () =>
        sql`
          SELECT
            audit_entry_id,
            audit_log_id,
            tool_invocation_id,
            agent_id,
            session_id,
            decision,
            reason,
            created_at
          FROM audit_entries
          ORDER BY created_at ASC, audit_entry_id ASC
        `.unprepared.pipe(
          Effect.map((rows) =>
            rows.map((row) =>
              ({
                auditEntryId: row.audit_entry_id as AuditEntryRecord["auditEntryId"],
                auditLogId: (row.audit_log_id ?? null) as AuditLogId | null,
                toolInvocationId: (row.tool_invocation_id ?? null) as ToolInvocationId | null,
                agentId: row.agent_id as AuditEntryRecord["agentId"],
                sessionId: row.session_id as AuditEntryRecord["sessionId"],
                decision: row.decision as AuditEntryRecord["decision"],
                reason: row.reason as string,
                createdAt: sqlInstant.decode(row.created_at as string)
              }) satisfies AuditEntryRecord
            )
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const enforceSandbox: GovernancePort["enforceSandbox"] = (agentId, effect) =>
        sandboxRuntime.enter(agentId, effect)

      return {
        evaluatePolicy,
        checkToolQuota,
        writeAudit,
        recordToolInvocation,
        recordToolInvocationWithAudit,
        findToolInvocationByIdempotencyKey,
        listToolInvocationsBySession,
        listPoliciesForAgent,
        listAuditEntries,
        enforceSandbox
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const syncBuiltInToolCatalog = (sql: SqlClient.SqlClient) =>
  Effect.gen(function*() {
    // 1. Preflight drift checks — reject startup on name/id mismatches
    const existingRows = yield* sql`
      SELECT tool_definition_id, tool_name
      FROM tool_definitions
      WHERE source_kind = 'BuiltIn'
    `.unprepared

    const existingByName = new Map<string, string>()
    const existingById = new Map<string, string>()
    for (const row of existingRows) {
      existingByName.set(row.tool_name as string, row.tool_definition_id as string)
      existingById.set(row.tool_definition_id as string, row.tool_name as string)
    }

    for (const entry of TOOL_CATALOG) {
      const dbIdForName = existingByName.get(entry.name)
      if (dbIdForName !== undefined && dbIdForName !== entry.definitionId) {
        return yield* Effect.die(
          new Error(
            `ToolCatalog drift: tool_name="${entry.name}" exists in DB with tool_definition_id="${dbIdForName}" `
            + `but catalog expects "${entry.definitionId}". `
            + `Repair the DB row or update the catalog entry before restarting.`
          )
        )
      }

      const dbNameForId = existingById.get(entry.definitionId)
      if (dbNameForId !== undefined && dbNameForId !== entry.name) {
        return yield* Effect.die(
          new Error(
            `ToolCatalog drift: tool_definition_id="${entry.definitionId}" exists in DB with tool_name="${dbNameForId}" `
            + `but catalog expects "${entry.name}". `
            + `Repair the DB row or update the catalog entry before restarting.`
          )
        )
      }
    }

    // 2. Atomic converge transaction — upsert all catalog entries
    const now = sqlInstant.encode(yield* DateTime.now)
    yield* sql.withTransaction(
      Effect.gen(function*() {
        for (const entry of TOOL_CATALOG) {
          yield* sql`
            INSERT INTO tool_definitions (
              tool_definition_id,
              tool_name,
              source_kind,
              integration_id,
              is_safe_standard,
              created_at
            ) VALUES (
              ${entry.definitionId},
              ${entry.name},
              ${"BuiltIn"},
              ${null},
              ${entry.isSafeStandard ? 1 : 0},
              ${now}
            )
            ON CONFLICT(tool_definition_id) DO UPDATE SET
              tool_name = excluded.tool_name,
              source_kind = 'BuiltIn',
              integration_id = NULL,
              is_safe_standard = excluded.is_safe_standard
          `.unprepared
        }
      })
    )
  })

const decodeToolInvocationRow = (row: ToolInvocationListRow): ToolInvocationRecord => ({
  toolInvocationId: row.tool_invocation_id as ToolInvocationRecord["toolInvocationId"],
  idempotencyKey: row.idempotency_key,
  auditEntryId: row.audit_entry_id as ToolInvocationRecord["auditEntryId"],
  toolDefinitionId: row.tool_definition_id as ToolInvocationRecord["toolDefinitionId"],
  auditLogId: row.audit_log_id as ToolInvocationRecord["auditLogId"],
  agentId: row.agent_id as ToolInvocationRecord["agentId"],
  sessionId: row.session_id as ToolInvocationRecord["sessionId"],
  conversationId: row.conversation_id as ToolInvocationRecord["conversationId"],
  turnId: row.turn_id as ToolInvocationRecord["turnId"],
  toolName: row.tool_name as ToolInvocationRecord["toolName"],
  inputJson: row.input_json,
  outputJson: row.output_json,
  decision: row.decision,
  complianceStatus: row.compliance_status,
  policyId: row.policy_id as ToolInvocationRecord["policyId"],
  reason: row.reason,
  invokedAt: sqlInstant.decode(row.invoked_at),
  completedAt: sqlInstant.decode(row.completed_at),
  policy: row.policy_selector === null || row.policy_decision === null || row.policy_reason_template === null
    ? null
    : {
      selector: row.policy_selector,
      decision: row.policy_decision,
      reasonTemplate: row.policy_reason_template,
      permissionMode: row.policy_permission_mode,
      precedence: row.policy_precedence ?? 0
    },
  tool: row.tool_definition_id === null || row.tool_source_kind === null
    ? null
    : {
      toolDefinitionId: row.tool_definition_id as NonNullable<ToolInvocationRecord["tool"]>["toolDefinitionId"],
      toolName: row.tool_name as NonNullable<ToolInvocationRecord["tool"]>["toolName"],
      sourceKind: row.tool_source_kind as NonNullable<ToolInvocationRecord["tool"]>["sourceKind"],
      isSafeStandard: row.tool_is_safe_standard === 1,
      integrationId: row.tool_integration_id as NonNullable<ToolInvocationRecord["tool"]>["integrationId"]
    }
})

const toolDefinitionIdsJson = sqlJsonColumn(Schema.Array(Schema.String))
const parseToolDefinitionIds = (value: string): ReadonlyArray<ToolDefinitionId> => {
  try {
    return toolDefinitionIdsJson.decode(value).map((item) => item as ToolDefinitionId)
  } catch {
    return []
  }
}

const selectorMatches = (
  selector: PolicySelector,
  toolDefinition: ToolDefinitionRow,
  explicitToolDefinitionIds: ReadonlyArray<ToolDefinitionId>
): boolean => {
  switch (selector) {
    case "AllTools":
      return true
    case "SafeStandardTools":
      return toolDefinition.is_safe_standard === 1
    case "ExplicitToolList":
      return explicitToolDefinitionIds.includes(toolDefinition.tool_definition_id as ToolDefinitionId)
    case "UnknownTool":
    case "MissingAgent":
    case "InvalidRequest":
    case "GovernanceError":
      return false
  }
}

const escapeSql = (value: string): string => value.replace(/'/g, "''")


const isToolQuotaExceededError = (error: unknown): error is ToolQuotaExceeded =>
  typeof error === "object"
  && error !== null
  && "_tag" in error
  && error._tag === "ToolQuotaExceeded"
