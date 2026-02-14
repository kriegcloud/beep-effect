import * as EventLogModule from "@effect/experimental/EventLog"
import * as EventJournalModule from "@effect/experimental/EventJournal"
import * as EventGroupModule from "@effect/experimental/EventGroup"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import { HookEvent } from "../Schema/Hooks.js"

export * from "@effect/experimental/EventLog"
export * as Event from "@effect/experimental/Event"
export * as EventGroup from "@effect/experimental/EventGroup"
export * as EventJournal from "@effect/experimental/EventJournal"
export * as EventLogRemote from "@effect/experimental/EventLogRemote"

/**
 * In-memory identity layer for event log auditing.
 */
export const layerIdentityMemory = Layer.sync(
  EventLogModule.Identity,
  () => EventLogModule.Identity.makeRandom()
)

/**
 * In-memory event log layer for local development and tests.
 */
export const layerMemory = EventLogModule.layerEventLog.pipe(
  Layer.provide(EventJournalModule.layerMemory),
  Layer.provide(layerIdentityMemory)
)

const ToolUsePayload = Schema.Struct({
  sessionId: Schema.String,
  toolName: Schema.String,
  toolUseId: Schema.optional(Schema.String),
  status: Schema.Literal("start", "success", "failure"),
  durationMs: Schema.optional(Schema.Number)
})

const PermissionDecisionPayload = Schema.Struct({
  sessionId: Schema.String,
  toolName: Schema.String,
  decision: Schema.Literal("allow", "deny", "prompt"),
  reason: Schema.optional(Schema.String)
})

const HookEventPayload = Schema.Struct({
  sessionId: Schema.optional(Schema.String),
  hook: HookEvent,
  toolUseId: Schema.optional(Schema.String),
  outcome: Schema.Literal("success", "failure")
})

const SyncConflictPayload = Schema.Struct({
  remoteId: Schema.String,
  event: Schema.String,
  primaryKey: Schema.String,
  entryId: Schema.String,
  conflictCount: Schema.Number,
  resolution: Schema.Literal("accept", "merge", "reject"),
  resolvedEntryId: Schema.optional(Schema.String)
})

const SyncCompactionPayload = Schema.Struct({
  remoteId: Schema.String,
  before: Schema.Number,
  after: Schema.Number,
  events: Schema.optional(Schema.Array(Schema.String)),
  timestamp: Schema.Number
})

/**
 * Event group definitions for auditing tool use, permissions, and hook events.
 */
export const AuditEventGroup = EventGroupModule.empty
  .add({
    tag: "tool_use",
    payload: ToolUsePayload,
    primaryKey: (payload) =>
      `${payload.sessionId}:${payload.toolName}:${payload.status}`
  })
  .add({
    tag: "permission_decision",
    payload: PermissionDecisionPayload,
    primaryKey: (payload) =>
      `${payload.sessionId}:${payload.toolName}:${payload.decision}`
  })
  .add({
    tag: "hook_event",
    payload: HookEventPayload,
    primaryKey: (payload) =>
      `${payload.sessionId ?? "unknown"}:${payload.hook}:${payload.outcome}`
  })
  .add({
    tag: "sync_conflict",
    payload: SyncConflictPayload,
    primaryKey: (payload) =>
      `${payload.remoteId}:${payload.event}:${payload.primaryKey}:${payload.entryId}`
  })
  .add({
    tag: "sync_compaction",
    payload: SyncCompactionPayload,
    primaryKey: (payload) => `${payload.remoteId}:${payload.timestamp}`
  })

/**
 * Schema derived from the audit event group.
 */
export const AuditEventSchema = EventLogModule.schema(AuditEventGroup)

/**
 * Default no-op handlers for audit events.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function*() {
 *   const log = yield* EventLog
 *   yield* log.write({
 *     schema: AuditEventSchema,
 *     event: "tool_use",
 *     payload: {
 *       sessionId: "session-1",
 *       toolName: "search",
 *       status: "start"
 *     }
 *   })
 * }).pipe(
 *   Effect.provide(layerMemory),
 *   Effect.provide(layerAuditHandlers)
 * )
 * ```
 */
export const layerAuditHandlers = EventLogModule.group(AuditEventGroup, (handlers) =>
  handlers
    .handle("tool_use", () => Effect.void)
    .handle("permission_decision", () => Effect.void)
    .handle("hook_event", () => Effect.void)
    .handle("sync_conflict", () => Effect.void)
    .handle("sync_compaction", () => Effect.void)
)
