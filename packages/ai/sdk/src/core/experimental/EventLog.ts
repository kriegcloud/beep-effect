import { thunkEffectVoid } from "@beep/utils";
import { Layer } from "effect";
import * as S from "effect/Schema";
import * as EventGroupModule from "effect/unstable/eventlog/EventGroup";
import * as EventJournalModule from "effect/unstable/eventlog/EventJournal";
import * as EventLogModule from "effect/unstable/eventlog/EventLog";
import { HookEvent } from "../Schema/Hooks.js";

/**
 * @since 0.0.0
 */
export * as Event from "effect/unstable/eventlog/Event";
/**
 * @since 0.0.0
 */
export * as EventGroup from "effect/unstable/eventlog/EventGroup";
/**
 * @since 0.0.0
 */
export * as EventJournal from "effect/unstable/eventlog/EventJournal";
/**
 * @since 0.0.0
 */
export * from "effect/unstable/eventlog/EventLog";
/**
 * @since 0.0.0
 */
export * as EventLogRemote from "effect/unstable/eventlog/EventLogRemote";

/**
 * In-memory identity layer for event log auditing.
 */
/**
 * @since 0.0.0
 */
export const layerIdentityMemory = Layer.sync(EventLogModule.Identity, () => EventLogModule.makeIdentityUnsafe());

/**
 * In-memory event log layer for local development and tests.
 */
/**
 * @since 0.0.0
 */
export const layerMemory = EventLogModule.layerEventLog.pipe(
  Layer.provide(EventJournalModule.layerMemory),
  Layer.provide(layerIdentityMemory)
);

const ToolUsePayload = S.Struct({
  sessionId: S.String,
  toolName: S.String,
  toolUseId: S.optional(S.String),
  status: S.Literals(["start", "success", "failure"]),
  durationMs: S.optional(S.Number),
});

const PermissionDecisionPayload = S.Struct({
  sessionId: S.String,
  toolName: S.String,
  decision: S.Literals(["allow", "deny", "prompt"]),
  reason: S.optional(S.String),
});

const HookEventPayload = S.Struct({
  sessionId: S.optional(S.String),
  hook: HookEvent,
  toolUseId: S.optional(S.String),
  outcome: S.Literals(["success", "failure"]),
});

const SyncConflictPayload = S.Struct({
  remoteId: S.String,
  event: S.String,
  primaryKey: S.String,
  entryId: S.String,
  conflictCount: S.Number,
  resolution: S.Literals(["accept", "merge", "reject"]),
  resolvedEntryId: S.optional(S.String),
});

const SyncCompactionPayload = S.Struct({
  remoteId: S.String,
  before: S.Number,
  after: S.Number,
  events: S.optional(S.Array(S.String)),
  timestamp: S.Number,
});

/**
 * Event group definitions for auditing tool use, permissions, and hook events.
 */
/**
 * @since 0.0.0
 */
export const AuditEventGroup = EventGroupModule.empty
  .add({
    tag: "tool_use",
    payload: ToolUsePayload,
    primaryKey: (payload) => `${payload.sessionId}:${payload.toolName}:${payload.status}`,
  })
  .add({
    tag: "permission_decision",
    payload: PermissionDecisionPayload,
    primaryKey: (payload) => `${payload.sessionId}:${payload.toolName}:${payload.decision}`,
  })
  .add({
    tag: "hook_event",
    payload: HookEventPayload,
    primaryKey: (payload) => `${payload.sessionId ?? "unknown"}:${payload.hook}:${payload.outcome}`,
  })
  .add({
    tag: "sync_conflict",
    payload: SyncConflictPayload,
    primaryKey: (payload) => `${payload.remoteId}:${payload.event}:${payload.primaryKey}:${payload.entryId}`,
  })
  .add({
    tag: "sync_compaction",
    payload: SyncCompactionPayload,
    primaryKey: (payload) => `${payload.remoteId}:${payload.timestamp}`,
  });

/**
 * Schema derived from the audit event group.
 */
/**
 * @since 0.0.0
 */
export const AuditEventSchema = EventLogModule.schema(AuditEventGroup);

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
/**
 * @since 0.0.0
 */
export const layerAuditHandlers = EventLogModule.group(AuditEventGroup, (handlers) =>
  handlers
    .handle("tool_use", thunkEffectVoid)
    .handle("permission_decision", thunkEffectVoid)
    .handle("hook_event", thunkEffectVoid)
    .handle("sync_conflict", thunkEffectVoid)
    .handle("sync_compaction", thunkEffectVoid)
);
