import { ToolQuotaExceeded } from "@template/domain/errors"
import type { AgentId, ToolName } from "@template/domain/ids"
import type { GovernanceAction } from "@template/domain/status"
import { DEFAULT_PAGINATION_LIMIT } from "@template/domain/system-defaults"
import type {
  AuditEntryRecord,
  GovernancePort,
  Instant,
  PermissionPolicyRecord,
  PolicyDecision,
  ToolInvocationRecord
} from "@template/domain/ports"
import { DateTime, Effect, HashMap, Layer, Option, Ref, ServiceMap } from "effect"
import { SandboxRuntime } from "./safety/SandboxRuntime.js"

interface ToolQuotaState {
  readonly maxPerDay: number
  readonly usedToday: number
  readonly resetAt: Instant
}

export class GovernancePortMemory extends ServiceMap.Service<GovernancePortMemory>()("server/GovernancePortMemory", {
  make: Effect.gen(function*() {
    const auditEntries = yield* Ref.make(Array<AuditEntryRecord>())
    const toolInvocations = yield* Ref.make(Array<ToolInvocationRecord>())
    const policies = yield* Ref.make(Array<PermissionPolicyRecord>())
    const toolQuotaState = yield* Ref.make(HashMap.empty<string, ToolQuotaState>())
    const policyOverrides = yield* Ref.make(HashMap.empty<string, PolicyDecision>())
    const sandboxRuntime = yield* SandboxRuntime

    const evaluatePolicy: GovernancePort["evaluatePolicy"] = (input) =>
      Ref.get(policyOverrides).pipe(
        Effect.map((overrides) => {
          // Check for specific action override
          const key = policyOverrideKey(input.action, input.toolName)
          const specific = HashMap.get(overrides, key)
          if (Option.isSome(specific)) {
            return specific.value
          }
          // Check for action-only override (no tool)
          const actionOnly = HashMap.get(overrides, input.action)
          if (Option.isSome(actionOnly)) {
            return actionOnly.value
          }
          // Default deny
          return {
            decision: "Deny",
            policyId: null,
            toolDefinitionId: null,
            reason: "no_matching_policy"
          } satisfies PolicyDecision
        })
      )

    const checkToolQuota: GovernancePort["checkToolQuota"] = (agentId, toolName, now) =>
      Ref.get(toolQuotaState).pipe(
        Effect.flatMap((map) => {
          const key = quotaKey(agentId, toolName)
          const current = HashMap.get(map, key)
          if (Option.isNone(current)) {
            return Effect.void
          }

          const normalized = DateTime.toEpochMillis(now) >= DateTime.toEpochMillis(current.value.resetAt)
            ? { ...current.value, usedToday: 0, resetAt: endOfUtcDay(now) }
            : current.value

          if (normalized.usedToday >= normalized.maxPerDay) {
            return Effect.fail(
              new ToolQuotaExceeded({
                agentId,
                toolName,
                remainingInvocations: 0
              })
            )
          }

          return Ref.set(
            toolQuotaState,
            HashMap.set(map, key, {
              ...normalized,
              usedToday: normalized.usedToday + 1
            })
          )
        })
      )

    const writeAudit: GovernancePort["writeAudit"] = (entry) =>
      Ref.update(auditEntries, (entries) => [...entries, entry])

    const recordToolInvocation: GovernancePort["recordToolInvocation"] = (record) =>
      Ref.update(toolInvocations, (entries) => [...entries, record])

    const recordToolInvocationWithAudit: GovernancePort["recordToolInvocationWithAudit"] = (input) =>
      recordToolInvocation(input.invocation).pipe(
        Effect.andThen(writeAudit(input.audit))
      )

    const listToolInvocationsBySession: GovernancePort["listToolInvocationsBySession"] = (sessionId, query) =>
      Ref.get(toolInvocations).pipe(
        Effect.map((items) => {
          const filtered = items
            .filter((item) => item.sessionId === sessionId)
            .filter((item) => query.decision === undefined || item.decision === query.decision)
            .filter((item) => query.complianceStatus === undefined || item.complianceStatus === query.complianceStatus)
            .filter((item) => query.policyId === undefined || item.policyId === query.policyId)
            .filter((item) => query.toolName === undefined || item.toolName === query.toolName)
            .sort((a, b) => {
              const at = DateTime.toEpochMillis(a.invokedAt)
              const bt = DateTime.toEpochMillis(b.invokedAt)
              return at === bt
                ? a.toolInvocationId.localeCompare(b.toolInvocationId)
                : at - bt
            })

          const offset = query.offset ?? 0
          const limit = query.limit ?? DEFAULT_PAGINATION_LIMIT
          return {
            items: filtered.slice(offset, offset + limit),
            totalCount: filtered.length
          } as const
        })
      )

    const findToolInvocationByIdempotencyKey: GovernancePort["findToolInvocationByIdempotencyKey"] = (
      idempotencyKey
    ) =>
      Ref.get(toolInvocations).pipe(
        Effect.map((items) =>
          items.find((item) => item.idempotencyKey === idempotencyKey) ?? null
        )
      )

    const listPoliciesForAgent: GovernancePort["listPoliciesForAgent"] = (_agentId) => Ref.get(policies)

    const listAuditEntries: GovernancePort["listAuditEntries"] = () => Ref.get(auditEntries)

    const enforceSandbox: GovernancePort["enforceSandbox"] = (agentId, effect) =>
      sandboxRuntime.enter(agentId, effect)

    const setPolicyOverride = (action: GovernanceAction, decision: PolicyDecision, toolName?: ToolName) =>
      Ref.update(policyOverrides, (map) =>
        HashMap.set(map, toolName ? policyOverrideKey(action, toolName) : action, decision)
      )

    const clearPolicyOverrides = Ref.set(policyOverrides, HashMap.empty<string, PolicyDecision>())

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
      enforceSandbox,
      // Test helpers (not on GovernancePort interface)
      setPolicyOverride,
      clearPolicyOverrides
    } as const
  })
}) {
  static layer = Layer.effect(this, this.make)
}

const quotaKey = (agentId: AgentId, toolName: ToolName): string => `${agentId}:${toolName}`

const endOfUtcDay = (from: Instant): Instant => DateTime.add(DateTime.removeTime(from), { days: 1 })

const policyOverrideKey = (action: string, toolName?: ToolName): string =>
  toolName ? `${action}:${toolName}` : action
