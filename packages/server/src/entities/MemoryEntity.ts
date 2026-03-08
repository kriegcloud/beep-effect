import { MemoryAccessDenied } from "@template/domain/errors"
import {
  DEFAULT_MEMORY_SEARCH_LIMIT,
  DEFAULT_MEMORY_FORGET_LIMIT,
  DEFAULT_MEMORY_RETRIEVE_LIMIT
} from "@template/domain/system-defaults"
import type { AgentId, AuditEntryId, SessionId, TurnId } from "@template/domain/ids"
import { toMemoryItemIds } from "@template/domain/memory"
import type { MemoryForgetFilters, MemorySearchQuery } from "@template/domain/ports"
import { MemoryScope, MemorySortOrder, MemorySource, MemoryTier, SensitivityLevel } from "@template/domain/status"
import { DateTime, Effect, Schema } from "effect"
import { ClusterSchema, Entity } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { MemoryPortSqlite } from "../MemoryPortSqlite.js"
import { GovernancePortTag, MemoryPortTag } from "../PortTags.js"

const MemoryItemResultSchema = Schema.Struct({
  memoryItemId: Schema.String,
  agentId: Schema.String,
  tier: MemoryTier,
  scope: MemoryScope,
  source: MemorySource,
  content: Schema.String,
  metadataJson: Schema.Union([Schema.String, Schema.Null]),
  generatedByTurnId: Schema.Union([Schema.String, Schema.Null]),
  sessionId: Schema.Union([Schema.String, Schema.Null]),
  sensitivity: SensitivityLevel,
  wasGeneratedBy: Schema.Union([Schema.String, Schema.Null]),
  wasAttributedTo: Schema.Union([Schema.String, Schema.Null]),
  governedByRetention: Schema.Union([Schema.String, Schema.Null]),
  lastAccessTime: Schema.Union([Schema.DateTimeUtc, Schema.Null]),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
})

const SearchResultSchema = Schema.Struct({
  items: Schema.Array(MemoryItemResultSchema),
  cursor: Schema.Union([Schema.String, Schema.Null]),
  totalCount: Schema.Number
})

const SearchRpc = Rpc.make("search", {
  payload: {
    query: Schema.optional(Schema.String),
    tier: Schema.optional(MemoryTier),
    scope: Schema.optional(MemoryScope),
    source: Schema.optional(MemorySource),
    sort: Schema.optional(MemorySortOrder),
    limit: Schema.optional(Schema.Number),
    cursor: Schema.optional(Schema.String)
  },
  success: SearchResultSchema,
  error: MemoryAccessDenied
})

const StoreItemFields = {
  tier: MemoryTier,
  scope: MemoryScope,
  source: MemorySource,
  content: Schema.String,
  metadataJson: Schema.optional(Schema.Union([Schema.String, Schema.Null])),
  generatedByTurnId: Schema.optional(Schema.Union([Schema.String, Schema.Null])),
  sessionId: Schema.optional(Schema.Union([Schema.String, Schema.Null])),
  sensitivity: Schema.optional(SensitivityLevel)
} as const

const StoreRpc = Rpc.make("store", {
  payload: {
    requestId: Schema.String,
    items: Schema.Array(Schema.Struct(StoreItemFields))
  },
  success: Schema.Array(Schema.String),
  error: MemoryAccessDenied,
  primaryKey: ({ requestId }) => `store:${requestId}`
}).annotate(ClusterSchema.Persisted, true)

const RetrieveRpc = Rpc.make("retrieve", {
  payload: {
    query: Schema.String,
    tier: Schema.optional(MemoryTier),
    scope: Schema.optional(MemoryScope),
    limit: Schema.optional(Schema.Number)
  },
  success: Schema.Array(MemoryItemResultSchema),
  error: MemoryAccessDenied
})

const ForgetRpc = Rpc.make("forget", {
  payload: {
    requestId: Schema.String,
    cutoff: Schema.optional(Schema.DateTimeUtcFromString),
    memoryIds: Schema.optional(Schema.Array(Schema.String))
  },
  success: Schema.Number,
  error: MemoryAccessDenied,
  primaryKey: ({ requestId }) => `forget:${requestId}`
}).annotate(ClusterSchema.Persisted, true)

const ListItemsRpc = Rpc.make("listItems", {
  payload: {
    tier: Schema.optional(MemoryTier),
    scope: Schema.optional(MemoryScope),
    limit: Schema.optional(Schema.Number)
  },
  success: Schema.Array(MemoryItemResultSchema),
  error: MemoryAccessDenied
})

export const MemoryEntity = Entity.make("Memory", [
  SearchRpc,
  StoreRpc,
  RetrieveRpc,
  ForgetRpc,
  ListItemsRpc
])

export const layer = MemoryEntity.toLayer(Effect.gen(function*() {
  const port = yield* MemoryPortTag
  const sqlitePort = yield* MemoryPortSqlite
  const governance = yield* GovernancePortTag

  type MemoryAction = "ReadMemory" | "WriteMemory"
  type MemoryOperation = "search" | "store" | "forget" | "retrieve" | "listItems"

  const withPolicy = <A>(options: {
    readonly agentId: AgentId
    readonly action: MemoryAction
    readonly operation: MemoryOperation
    readonly requestId?: string
    readonly auditBeforeExecute: boolean
    readonly allowReason: string
    readonly denyReason: string
    readonly execute: Effect.Effect<A>
  }): Effect.Effect<A, MemoryAccessDenied> =>
    Effect.gen(function*() {
      const now = yield* DateTime.now
      const policy = yield* governance.evaluatePolicy({
        agentId: options.agentId,
        sessionId: null,
        action: options.action
      })
      const auditEntryId = makeAuditEntryId(
        options.agentId,
        options.action,
        options.operation,
        options.requestId
      )

      if (policy.decision === "Deny" || policy.decision === "RequireApproval") {
        yield* governance.writeAudit({
          auditEntryId,
          agentId: options.agentId,
          sessionId: null,
          decision: policy.decision,
          reason: `${options.denyReason}:${policy.reason}`,
          createdAt: now
        })
        return yield* new MemoryAccessDenied({
          agentId: options.agentId,
          action: options.action,
          decision: policy.decision,
          reason: policy.reason
        })
      }

      const writeAllowAudit = governance.writeAudit({
        auditEntryId,
        agentId: options.agentId,
        sessionId: null,
        decision: "Allow",
        reason: options.allowReason,
        createdAt: now
      })

      if (options.auditBeforeExecute) {
        yield* writeAllowAudit
        return yield* options.execute
      }

      const result = yield* options.execute
      yield* writeAllowAudit
      return result
    })

  return {
    search: ({ address, payload }) => {
      const agentId = String(address.entityId) as AgentId
      const query = Object.fromEntries(
        Object.entries({
          query: payload.query,
          tier: payload.tier,
          scope: payload.scope,
          source: payload.source,
          sort: payload.sort,
          limit: payload.limit ?? DEFAULT_MEMORY_SEARCH_LIMIT,
          cursor: payload.cursor
        }).filter(([, v]) => v !== undefined)
      ) as MemorySearchQuery
      return withPolicy({
        agentId,
        action: "ReadMemory",
        operation: "search",
        auditBeforeExecute: false,
        allowReason: "memory_search_allowed",
        denyReason: "memory_search_denied",
        execute: port.search(agentId, query)
      })
    },

    store: ({ address, payload }) => {
      const agentId = String(address.entityId) as AgentId
      return withPolicy({
        agentId,
        action: "WriteMemory",
        operation: "store",
        requestId: payload.requestId,
        auditBeforeExecute: true,
        allowReason: "memory_store_allowed",
        denyReason: "memory_store_denied",
        execute: Effect.gen(function*() {
          const now = yield* DateTime.now
          return yield* port.encode(
            agentId,
            payload.items.map((item) => {
              const base = {
                tier: item.tier,
                scope: item.scope,
                source: item.source,
                content: item.content,
                metadataJson: item.metadataJson ?? null,
                generatedByTurnId: (item.generatedByTurnId ?? null) as TurnId | null,
                sessionId: (item.sessionId ?? null) as SessionId | null
              }
              return item.sensitivity !== undefined
                ? { ...base, sensitivity: item.sensitivity }
                : base
            }),
            now
          )
        })
      })
    },

    retrieve: ({ address, payload }) => {
      const agentId = String(address.entityId) as AgentId
      return withPolicy({
        agentId,
        action: "ReadMemory",
        operation: "retrieve",
        auditBeforeExecute: false,
        allowReason: "memory_retrieve_allowed",
        denyReason: "memory_retrieve_denied",
        execute: sqlitePort.retrieve(agentId, {
          query: payload.query,
          tier: payload.tier,
          scope: payload.scope,
          limit: payload.limit ?? DEFAULT_MEMORY_RETRIEVE_LIMIT
        }) as any
      })
    },

    forget: ({ address, payload }) => {
      const agentId = String(address.entityId) as AgentId
      const filters: MemoryForgetFilters = {
        ...(payload.cutoff === undefined ? {} : { cutoffDate: payload.cutoff }),
        ...(payload.memoryIds === undefined ? {} : { itemIds: toMemoryItemIds(payload.memoryIds) })
      }
      return withPolicy({
        agentId,
        action: "WriteMemory",
        operation: "forget",
        requestId: payload.requestId,
        auditBeforeExecute: true,
        allowReason: "memory_forget_allowed",
        denyReason: "memory_forget_denied",
        execute: port.forget(agentId, filters)
      })
    },

    listItems: ({ address, payload }) => {
      const agentId = String(address.entityId) as AgentId
      return withPolicy({
        agentId,
        action: "ReadMemory",
        operation: "listItems",
        auditBeforeExecute: false,
        allowReason: "memory_list_allowed",
        denyReason: "memory_list_denied",
        execute: sqlitePort.listAll(agentId, {
          tier: payload.tier,
          scope: payload.scope,
          limit: payload.limit ?? DEFAULT_MEMORY_FORGET_LIMIT
        }) as any
      })
    }
  }
}))

const makeAuditEntryId = (
  agentId: AgentId,
  action: "ReadMemory" | "WriteMemory",
  operation: "search" | "store" | "forget" | "retrieve" | "listItems",
  requestId?: string
): AuditEntryId =>
  requestId === undefined
    ? (`audit:memory:${operation}:${action}:${agentId}:${crypto.randomUUID()}`) as AuditEntryId
    : (`audit:memory:${operation}:${action}:${agentId}:${requestId}`) as AuditEntryId

