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
 * @category Configuration
 */
export const layerIdentityMemory = Layer.sync(EventLogModule.Identity, () => EventLogModule.makeIdentityUnsafe());

/**
 * In-memory event log layer for local development and tests.
 */
/**
 * @since 0.0.0
 * @category Configuration
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
};

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

const ToolUsePayloadBase = S.Union([ToolUsePayloadStart, ToolUsePayloadSuccess, ToolUsePayloadFailure]).pipe(
  S.toTaggedUnion("status")
);

const ToolUsePayload = ToolUsePayloadBase.pipe(
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
};

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

const PermissionDecisionPayloadBase = S.Union([
  PermissionDecisionPayloadAllow,
  PermissionDecisionPayloadDeny,
  PermissionDecisionPayloadPrompt,
]).pipe(S.toTaggedUnion("decision"));

const PermissionDecisionPayload = PermissionDecisionPayloadBase.pipe(
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
};

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

const HookEventPayloadBase = S.Union([HookEventPayloadSuccess, HookEventPayloadFailure]).pipe(
  S.toTaggedUnion("outcome")
);

const HookEventPayload = HookEventPayloadBase.pipe(
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
};

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

const SyncConflictPayloadBase = S.Union([
  SyncConflictPayloadAccept,
  SyncConflictPayloadMerge,
  SyncConflictPayloadReject,
]).pipe(S.toTaggedUnion("resolution"));

const SyncConflictPayload = SyncConflictPayloadBase.pipe(
  $I.annoteSchema("SyncConflictPayload", {
    description: "Tagged union payload for sync_conflict records.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export class SyncCompactionPayload extends S.Class<SyncCompactionPayload>($I`SyncCompactionPayload`)(
  {
    remoteId: S.String,
    before: S.Number,
    after: S.Number,
    events: S.Array(S.String).pipe(S.optionalKey),
    timestamp: S.DateTimeUtcFromMillis,
  },
  $I.annote("SyncCompactionPayload", {
    description: "Payload for sync compaction audit events.",
  })
) {
  static readonly make = (params: SyncCompactionPayload) => new SyncCompactionPayload(params);
}

/**
 * @since 0.0.0
 */
class AuditEventInputToolUse extends S.Class<AuditEventInputToolUse>($I`AuditEventInputToolUse`)(
  {
    event: S.tag("tool_use"),
    payload: ToolUsePayload,
  },
  $I.annote("AuditEventInputToolUse", {
    description: "Audit event input for tool use records.",
  })
) {}

class AuditEventInputPermissionDecision extends S.Class<AuditEventInputPermissionDecision>(
  $I`AuditEventInputPermissionDecision`
)(
  {
    event: S.tag("permission_decision"),
    payload: PermissionDecisionPayload,
  },
  $I.annote("AuditEventInputPermissionDecision", {
    description: "Audit event input for permission decision records.",
  })
) {}

class AuditEventInputHookEvent extends S.Class<AuditEventInputHookEvent>($I`AuditEventInputHookEvent`)(
  {
    event: S.tag("hook_event"),
    payload: HookEventPayload,
  },
  $I.annote("AuditEventInputHookEvent", {
    description: "Audit event input for hook event records.",
  })
) {}

class AuditEventInputSyncConflict extends S.Class<AuditEventInputSyncConflict>($I`AuditEventInputSyncConflict`)(
  {
    event: S.tag("sync_conflict"),
    payload: SyncConflictPayload,
  },
  $I.annote("AuditEventInputSyncConflict", {
    description: "Audit event input for sync conflict records.",
  })
) {}

class AuditEventInputSyncCompaction extends S.Class<AuditEventInputSyncCompaction>($I`AuditEventInputSyncCompaction`)(
  {
    event: S.tag("sync_compaction"),
    payload: SyncCompactionPayload,
  },
  $I.annote("AuditEventInputSyncCompaction", {
    description: "Audit event input for sync compaction records.",
  })
) {}

const AuditEventInputBase = S.Union([
  AuditEventInputToolUse,
  AuditEventInputPermissionDecision,
  AuditEventInputHookEvent,
  AuditEventInputSyncConflict,
  AuditEventInputSyncCompaction,
]).pipe(S.toTaggedUnion("event"));

type ToolUsePayload = typeof ToolUsePayload.Type;
type PermissionDecisionPayload = typeof PermissionDecisionPayload.Type;
type HookEventPayload = typeof HookEventPayload.Type;
type SyncConflictPayload = typeof SyncConflictPayload.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const AuditEventInput = AuditEventInputBase.pipe(
  S.annotate(
    $I.annote("AuditEventInput", {
      description: "Tagged union of audit-log writes keyed by event name and normalized payload shape.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type AuditEventInput = typeof AuditEventInput.Type;

const normalizeToolUsePayload = (payload: ToolUsePayload): ToolUsePayload =>
  payload.status === "start"
    ? new ToolUsePayloadStart(payload)
    : payload.status === "success"
      ? new ToolUsePayloadSuccess(payload)
      : payload.status === "failure"
        ? new ToolUsePayloadFailure(payload)
        : payload;

const normalizePermissionDecisionPayload = (payload: PermissionDecisionPayload): PermissionDecisionPayload =>
  payload.decision === "allow"
    ? new PermissionDecisionPayloadAllow(payload)
    : payload.decision === "deny"
      ? new PermissionDecisionPayloadDeny(payload)
      : payload.decision === "prompt"
        ? new PermissionDecisionPayloadPrompt(payload)
        : payload;

const normalizeHookEventPayload = (payload: HookEventPayload): HookEventPayload =>
  payload.outcome === "success"
    ? new HookEventPayloadSuccess(payload)
    : payload.outcome === "failure"
      ? new HookEventPayloadFailure(payload)
      : payload;

const normalizeSyncConflictPayload = (payload: SyncConflictPayload): SyncConflictPayload =>
  payload.resolution === "accept"
    ? new SyncConflictPayloadAccept(payload)
    : payload.resolution === "merge"
      ? new SyncConflictPayloadMerge(payload)
      : payload.resolution === "reject"
        ? new SyncConflictPayloadReject(payload)
        : payload;

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const normalizeAuditEventInput: (input: AuditEventInput) => AuditEventInput = (input) =>
  input.event === "tool_use"
    ? new AuditEventInputToolUse({
        event: "tool_use",
        payload: normalizeToolUsePayload(input.payload),
      })
    : input.event === "permission_decision"
      ? new AuditEventInputPermissionDecision({
          event: "permission_decision",
          payload: normalizePermissionDecisionPayload(input.payload),
        })
      : input.event === "hook_event"
        ? new AuditEventInputHookEvent({
            event: "hook_event",
            payload: normalizeHookEventPayload(input.payload),
          })
        : input.event === "sync_conflict"
          ? new AuditEventInputSyncConflict({
              event: "sync_conflict",
              payload: normalizeSyncConflictPayload(input.payload),
            })
          : input.event === "sync_compaction"
            ? new AuditEventInputSyncCompaction({
                event: "sync_compaction",
                payload: SyncCompactionPayload.make(input.payload),
              })
            : input;

/**
 * Event group definitions for auditing tool use, permissions, and hook events.
 */
/**
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
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
 * @category Configuration
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
 * @category Configuration
 */
export const layerMemoryWithAudit = EventLogModule.layerEventLog.pipe(
  Layer.provide(EventJournalModule.layerMemory),
  Layer.provide(layerIdentityMemory),
  Layer.provide(layerAuditHandlers)
);
