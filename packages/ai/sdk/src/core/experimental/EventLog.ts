import { $AiSdkId } from "@beep/identity/packages";
import { thunkEffectVoid } from "@beep/utils";
import { Layer } from "effect";
import * as S from "effect/Schema";
import * as EventGroupModule from "effect/unstable/eventlog/EventGroup";
import * as EventJournalModule from "effect/unstable/eventlog/EventJournal";
import * as EventLogModule from "effect/unstable/eventlog/EventLog";
import { HookEvent } from "../Schema/Hooks.js";

const $I = $AiSdkId.create("core/experimental/EventLog");

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

const toolUsePayloadFields = {
  sessionId: S.String,
  toolName: S.String,
  toolUseId: S.optionalKey(S.String),
  durationMs: S.optionalKey(S.Number),
} as const;

class ToolUsePayloadStart extends S.Class<ToolUsePayloadStart>($I`ToolUsePayloadStart`)(
  {
    ...toolUsePayloadFields,
    status: S.tag("start"),
  },
  $I.annote("ToolUsePayloadStart", {
    description: "Payload emitted when a tool use starts.",
  })
) {}

class ToolUsePayloadSuccess extends S.Class<ToolUsePayloadSuccess>($I`ToolUsePayloadSuccess`)(
  {
    ...toolUsePayloadFields,
    status: S.tag("success"),
  },
  $I.annote("ToolUsePayloadSuccess", {
    description: "Payload emitted when a tool use succeeds.",
  })
) {}

class ToolUsePayloadFailure extends S.Class<ToolUsePayloadFailure>($I`ToolUsePayloadFailure`)(
  {
    ...toolUsePayloadFields,
    status: S.tag("failure"),
  },
  $I.annote("ToolUsePayloadFailure", {
    description: "Payload emitted when a tool use fails.",
  })
) {}

const ToolUsePayload = S.Union([ToolUsePayloadStart, ToolUsePayloadSuccess, ToolUsePayloadFailure]).pipe(
  S.toTaggedUnion("status"),
  S.annotate(
    $I.annote("ToolUsePayload", {
      description: "Tagged union payload for tool_use events.",
    })
  )
);

const permissionDecisionPayloadFields = {
  sessionId: S.String,
  toolName: S.String,
  reason: S.optional(S.String),
} as const;

class PermissionDecisionPayloadAllow extends S.Class<PermissionDecisionPayloadAllow>(
  $I`PermissionDecisionPayloadAllow`
)(
  {
    ...permissionDecisionPayloadFields,
    decision: S.tag("allow"),
  },
  $I.annote("PermissionDecisionPayloadAllow", {
    description: "Permission decision payload for allow outcomes.",
  })
) {}

class PermissionDecisionPayloadDeny extends S.Class<PermissionDecisionPayloadDeny>($I`PermissionDecisionPayloadDeny`)(
  {
    ...permissionDecisionPayloadFields,
    decision: S.tag("deny"),
  },
  $I.annote("PermissionDecisionPayloadDeny", {
    description: "Permission decision payload for deny outcomes.",
  })
) {}

class PermissionDecisionPayloadPrompt extends S.Class<PermissionDecisionPayloadPrompt>(
  $I`PermissionDecisionPayloadPrompt`
)(
  {
    ...permissionDecisionPayloadFields,
    decision: S.tag("prompt"),
  },
  $I.annote("PermissionDecisionPayloadPrompt", {
    description: "Permission decision payload for prompt outcomes.",
  })
) {}

const PermissionDecisionPayload = S.Union([
  PermissionDecisionPayloadAllow,
  PermissionDecisionPayloadDeny,
  PermissionDecisionPayloadPrompt,
]).pipe(
  S.toTaggedUnion("decision"),
  S.annotate(
    $I.annote("PermissionDecisionPayload", {
      description: "Tagged union payload for permission_decision events.",
    })
  )
);

const hookEventPayloadFields = {
  sessionId: S.optional(S.String),
  hook: HookEvent,
  toolUseId: S.optional(S.String),
} as const;

class HookEventPayloadSuccess extends S.Class<HookEventPayloadSuccess>($I`HookEventPayloadSuccess`)(
  {
    ...hookEventPayloadFields,
    outcome: S.tag("success"),
  },
  $I.annote("HookEventPayloadSuccess", {
    description: "Hook event payload with successful outcome.",
  })
) {}

class HookEventPayloadFailure extends S.Class<HookEventPayloadFailure>($I`HookEventPayloadFailure`)(
  {
    ...hookEventPayloadFields,
    outcome: S.tag("failure"),
  },
  $I.annote("HookEventPayloadFailure", {
    description: "Hook event payload with failure outcome.",
  })
) {}

const HookEventPayload = S.Union([HookEventPayloadSuccess, HookEventPayloadFailure]).pipe(
  S.toTaggedUnion("outcome"),
  S.annotate(
    $I.annote("HookEventPayload", {
      description: "Tagged union payload for hook_event records.",
    })
  )
);

const syncConflictPayloadFields = {
  remoteId: S.String,
  event: S.String,
  primaryKey: S.String,
  entryId: S.String,
  conflictCount: S.Number,
  resolvedEntryId: S.optional(S.String),
} as const;

class SyncConflictPayloadAccept extends S.Class<SyncConflictPayloadAccept>($I`SyncConflictPayloadAccept`)(
  {
    ...syncConflictPayloadFields,
    resolution: S.tag("accept"),
  },
  $I.annote("SyncConflictPayloadAccept", {
    description: "Conflict payload for accept resolution.",
  })
) {}

class SyncConflictPayloadMerge extends S.Class<SyncConflictPayloadMerge>($I`SyncConflictPayloadMerge`)(
  {
    ...syncConflictPayloadFields,
    resolution: S.tag("merge"),
  },
  $I.annote("SyncConflictPayloadMerge", {
    description: "Conflict payload for merge resolution.",
  })
) {}

class SyncConflictPayloadReject extends S.Class<SyncConflictPayloadReject>($I`SyncConflictPayloadReject`)(
  {
    ...syncConflictPayloadFields,
    resolution: S.tag("reject"),
  },
  $I.annote("SyncConflictPayloadReject", {
    description: "Conflict payload for reject resolution.",
  })
) {}

const SyncConflictPayload = S.Union([
  SyncConflictPayloadAccept,
  SyncConflictPayloadMerge,
  SyncConflictPayloadReject,
]).pipe(
  S.toTaggedUnion("resolution"),
  $I.annoteSchema("SyncConflictPayload", {
    description: "Tagged union payload for sync_conflict records.",
  })
);

/**
 * @since 0.0.0
 */
export class SyncCompactionPayload extends S.Class<SyncCompactionPayload>($I`SyncCompactionPayload`)(
  {
    remoteId: S.String,
    before: S.Number,
    after: S.Number,
    events: S.optional(S.Array(S.String)),
    timestamp: S.DateTimeUtcFromMillis,
  },
  $I.annote("SyncCompactionPayload", {
    description: "Payload for sync compaction audit events.",
  })
) {
  static readonly make = (params: SyncCompactionPayload) => new SyncCompactionPayload(params);
}

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
export const AuditEventLog = EventLogModule.schema(AuditEventGroup);

/**
 * Default no-op handlers for audit events.
 *
 * @example
 * ```ts-morph
 * const program = Effect.gen(function*() {
 *   const log = yield* EventLog
 *   yield* log.write({
 *     schema: AuditEventLog,
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

/**
 * In-memory event log layer with default audit handlers registered.
 *
 * @since 0.0.0
 */
export const layerMemoryWithAudit = EventLogModule.layerEventLog.pipe(
  Layer.provide(EventJournalModule.layerMemory),
  Layer.provide(layerIdentityMemory),
  Layer.provide(layerAuditHandlers)
);
