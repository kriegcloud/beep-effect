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

class ToolUsePayloadBase extends S.Class<ToolUsePayloadBase>($I`ToolUsePayloadBase`)(
  {
    sessionId: S.String,
    toolName: S.String,
    toolUseId: S.optional(S.String),
    durationMs: S.optional(S.Number),
  },
  $I.annote("ToolUsePayloadBase", {
    description: "Base payload for tool use audit events.",
  })
) {}

class ToolUsePayloadStart extends ToolUsePayloadBase.extend<ToolUsePayloadStart>($I`ToolUsePayloadStart`)(
  {
    status: S.tag("start"),
  },
  $I.annote("ToolUsePayloadStart", {
    description: "Payload emitted when a tool use starts.",
  })
) {}

class ToolUsePayloadSuccess extends ToolUsePayloadBase.extend<ToolUsePayloadSuccess>($I`ToolUsePayloadSuccess`)(
  {
    status: S.tag("success"),
  },
  $I.annote("ToolUsePayloadSuccess", {
    description: "Payload emitted when a tool use succeeds.",
  })
) {}

class ToolUsePayloadFailure extends ToolUsePayloadBase.extend<ToolUsePayloadFailure>($I`ToolUsePayloadFailure`)(
  {
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

class PermissionDecisionPayloadBase extends S.Class<PermissionDecisionPayloadBase>($I`PermissionDecisionPayloadBase`)(
  {
    sessionId: S.String,
    toolName: S.String,
    reason: S.optional(S.String),
  },
  $I.annote("PermissionDecisionPayloadBase", {
    description: "Base payload for permission decision events.",
  })
) {}

class PermissionDecisionPayloadAllow extends PermissionDecisionPayloadBase.extend<PermissionDecisionPayloadAllow>(
  $I`PermissionDecisionPayloadAllow`
)(
  {
    decision: S.tag("allow"),
  },
  $I.annote("PermissionDecisionPayloadAllow", {
    description: "Permission decision payload for allow outcomes.",
  })
) {}

class PermissionDecisionPayloadDeny extends PermissionDecisionPayloadBase.extend<PermissionDecisionPayloadDeny>(
  $I`PermissionDecisionPayloadDeny`
)(
  {
    decision: S.tag("deny"),
  },
  $I.annote("PermissionDecisionPayloadDeny", {
    description: "Permission decision payload for deny outcomes.",
  })
) {}

class PermissionDecisionPayloadPrompt extends PermissionDecisionPayloadBase.extend<PermissionDecisionPayloadPrompt>(
  $I`PermissionDecisionPayloadPrompt`
)(
  {
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

class HookEventPayloadBase extends S.Class<HookEventPayloadBase>($I`HookEventPayloadBase`)(
  {
    sessionId: S.optional(S.String),
    hook: HookEvent,
    toolUseId: S.optional(S.String),
  },
  $I.annote("HookEventPayloadBase", {
    description: "Base payload for hook event audit records.",
  })
) {}

class HookEventPayloadSuccess extends HookEventPayloadBase.extend<HookEventPayloadSuccess>($I`HookEventPayloadSuccess`)(
  {
    outcome: S.tag("success"),
  },
  $I.annote("HookEventPayloadSuccess", {
    description: "Hook event payload with successful outcome.",
  })
) {}

class HookEventPayloadFailure extends HookEventPayloadBase.extend<HookEventPayloadFailure>($I`HookEventPayloadFailure`)(
  {
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

class SyncConflictPayloadBase extends S.Class<SyncConflictPayloadBase>($I`SyncConflictPayloadBase`)(
  {
    remoteId: S.String,
    event: S.String,
    primaryKey: S.String,
    entryId: S.String,
    conflictCount: S.Number,
    resolvedEntryId: S.optional(S.String),
  },
  $I.annote("SyncConflictPayloadBase", {
    description: "Base payload for sync conflict audit events.",
  })
) {}

class SyncConflictPayloadAccept extends SyncConflictPayloadBase.extend<SyncConflictPayloadAccept>(
  $I`SyncConflictPayloadAccept`
)(
  {
    resolution: S.tag("accept"),
  },
  $I.annote("SyncConflictPayloadAccept", {
    description: "Conflict payload for accept resolution.",
  })
) {}

class SyncConflictPayloadMerge extends SyncConflictPayloadBase.extend<SyncConflictPayloadMerge>(
  $I`SyncConflictPayloadMerge`
)(
  {
    resolution: S.tag("merge"),
  },
  $I.annote("SyncConflictPayloadMerge", {
    description: "Conflict payload for merge resolution.",
  })
) {}

class SyncConflictPayloadReject extends SyncConflictPayloadBase.extend<SyncConflictPayloadReject>(
  $I`SyncConflictPayloadReject`
)(
  {
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
  S.annotate(
    $I.annote("SyncConflictPayload", {
      description: "Tagged union payload for sync_conflict records.",
    })
  )
);

class SyncCompactionPayload extends S.Class<SyncCompactionPayload>($I`SyncCompactionPayload`)(
  {
    remoteId: S.String,
    before: S.Number,
    after: S.Number,
    events: S.optional(S.Array(S.String)),
    timestamp: S.Number,
  },
  $I.annote("SyncCompactionPayload", {
    description: "Payload for sync compaction audit events.",
  })
) {}

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
