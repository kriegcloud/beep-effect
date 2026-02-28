import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { ExitReason } from "./Common.js";
import { PermissionRequestHookSpecificOutput, PermissionUpdate } from "./Permission.js";

const $I = $AiSdkId.create("core/Schema/Hooks");

const BaseHookInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.optional(S.String),
});

/**
 * @since 0.0.0
 */
export const HookEvent = LiteralKit([
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "Notification",
  "UserPromptSubmit",
  "SessionStart",
  "SessionEnd",
  "Stop",
  "SubagentStart",
  "SubagentStop",
  "PreCompact",
  "PermissionRequest",
  "Setup",
  "TeammateIdle",
  "TaskCompleted",
]).annotate(
  $I.annote("HookEvent", {
    description: "Schema for HookEvent.",
  })
);

/**
 * @since 0.0.0
 */
export type HookEvent = typeof HookEvent.Type;
/**
 * @since 0.0.0
 */
export type HookEventEncoded = typeof HookEvent.Encoded;

/**
 * @since 0.0.0
 */
export const NotificationHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("Notification"),
  message: S.String,
  title: S.optional(S.String),
  notification_type: S.String,
}).annotate(
  $I.annote("NotificationHookInput", {
    description: "Schema for NotificationHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type NotificationHookInput = typeof NotificationHookInput.Type;
/**
 * @since 0.0.0
 */
export type NotificationHookInputEncoded = typeof NotificationHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const UserPromptSubmitHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("UserPromptSubmit"),
  prompt: S.String,
}).annotate(
  $I.annote("UserPromptSubmitHookInput", {
    description: "Schema for UserPromptSubmitHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type UserPromptSubmitHookInput = typeof UserPromptSubmitHookInput.Type;
/**
 * @since 0.0.0
 */
export type UserPromptSubmitHookInputEncoded = typeof UserPromptSubmitHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const SessionStartHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("SessionStart"),
  source: LiteralKit(["startup", "resume", "clear", "compact"]),
  agent_type: S.optional(S.String),
  model: S.optional(S.String),
}).annotate(
  $I.annote("SessionStartHookInput", {
    description: "Schema for SessionStartHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type SessionStartHookInput = typeof SessionStartHookInput.Type;
/**
 * @since 0.0.0
 */
export type SessionStartHookInputEncoded = typeof SessionStartHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const SessionEndHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("SessionEnd"),
  reason: ExitReason,
}).annotate(
  $I.annote("SessionEndHookInput", {
    description: "Schema for SessionEndHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type SessionEndHookInput = typeof SessionEndHookInput.Type;
/**
 * @since 0.0.0
 */
export type SessionEndHookInputEncoded = typeof SessionEndHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const StopHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("Stop"),
  stop_hook_active: S.Boolean,
}).annotate(
  $I.annote("StopHookInput", {
    description: "Schema for StopHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type StopHookInput = typeof StopHookInput.Type;
/**
 * @since 0.0.0
 */
export type StopHookInputEncoded = typeof StopHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const SubagentStartHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("SubagentStart"),
  agent_id: S.String,
  agent_type: S.String,
}).annotate(
  $I.annote("SubagentStartHookInput", {
    description: "Schema for SubagentStartHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type SubagentStartHookInput = typeof SubagentStartHookInput.Type;
/**
 * @since 0.0.0
 */
export type SubagentStartHookInputEncoded = typeof SubagentStartHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const SubagentStopHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("SubagentStop"),
  stop_hook_active: S.Boolean,
  agent_id: S.String,
  agent_transcript_path: S.String,
  agent_type: S.String,
}).annotate(
  $I.annote("SubagentStopHookInput", {
    description: "Schema for SubagentStopHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type SubagentStopHookInput = typeof SubagentStopHookInput.Type;
/**
 * @since 0.0.0
 */
export type SubagentStopHookInputEncoded = typeof SubagentStopHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const PreCompactHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("PreCompact"),
  trigger: LiteralKit(["manual", "auto"]),
  custom_instructions: S.Union([S.String, S.Null]),
}).annotate(
  $I.annote("PreCompactHookInput", {
    description: "Schema for PreCompactHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type PreCompactHookInput = typeof PreCompactHookInput.Type;
/**
 * @since 0.0.0
 */
export type PreCompactHookInputEncoded = typeof PreCompactHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const PreToolUseHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("PreToolUse"),
  tool_name: S.String,
  tool_input: S.Unknown,
  tool_use_id: S.String,
}).annotate(
  $I.annote("PreToolUseHookInput", {
    description: "Schema for PreToolUseHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type PreToolUseHookInput = typeof PreToolUseHookInput.Type;
/**
 * @since 0.0.0
 */
export type PreToolUseHookInputEncoded = typeof PreToolUseHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const PostToolUseHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("PostToolUse"),
  tool_name: S.String,
  tool_input: S.Unknown,
  tool_response: S.Unknown,
  tool_use_id: S.String,
}).annotate(
  $I.annote("PostToolUseHookInput", {
    description: "Schema for PostToolUseHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type PostToolUseHookInput = typeof PostToolUseHookInput.Type;
/**
 * @since 0.0.0
 */
export type PostToolUseHookInputEncoded = typeof PostToolUseHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const PostToolUseFailureHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("PostToolUseFailure"),
  tool_name: S.String,
  tool_input: S.Unknown,
  tool_use_id: S.String,
  error: S.String,
  is_interrupt: S.optional(S.Boolean),
}).annotate(
  $I.annote("PostToolUseFailureHookInput", {
    description: "Schema for PostToolUseFailureHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type PostToolUseFailureHookInput = typeof PostToolUseFailureHookInput.Type;
/**
 * @since 0.0.0
 */
export type PostToolUseFailureHookInputEncoded = typeof PostToolUseFailureHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const PermissionRequestHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("PermissionRequest"),
  tool_name: S.String,
  tool_input: S.Unknown,
  permission_suggestions: S.optional(S.Array(PermissionUpdate)),
}).annotate(
  $I.annote("PermissionRequestHookInput", {
    description: "Schema for PermissionRequestHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionRequestHookInput = typeof PermissionRequestHookInput.Type;
/**
 * @since 0.0.0
 */
export type PermissionRequestHookInputEncoded = typeof PermissionRequestHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const SetupHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("Setup"),
  trigger: LiteralKit(["init", "maintenance"]),
}).annotate(
  $I.annote("SetupHookInput", {
    description: "Schema for SetupHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type SetupHookInput = typeof SetupHookInput.Type;
/**
 * @since 0.0.0
 */
export type SetupHookInputEncoded = typeof SetupHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const TeammateIdleHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("TeammateIdle"),
  teammate_name: S.String,
  team_name: S.String,
}).annotate(
  $I.annote("TeammateIdleHookInput", {
    description: "Schema for TeammateIdleHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type TeammateIdleHookInput = typeof TeammateIdleHookInput.Type;
/**
 * @since 0.0.0
 */
export type TeammateIdleHookInputEncoded = typeof TeammateIdleHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const TaskCompletedHookInput = S.Struct({
  ...BaseHookInput.fields,
  hook_event_name: S.Literal("TaskCompleted"),
  task_id: S.String,
  task_subject: S.String,
  task_description: S.optional(S.String),
  teammate_name: S.optional(S.String),
  team_name: S.optional(S.String),
}).annotate(
  $I.annote("TaskCompletedHookInput", {
    description: "Schema for TaskCompletedHookInput.",
  })
);

/**
 * @since 0.0.0
 */
export type TaskCompletedHookInput = typeof TaskCompletedHookInput.Type;
/**
 * @since 0.0.0
 */
export type TaskCompletedHookInputEncoded = typeof TaskCompletedHookInput.Encoded;

/**
 * @since 0.0.0
 */
export const HookInput = S.Union([
  PreToolUseHookInput,
  PostToolUseHookInput,
  PostToolUseFailureHookInput,
  NotificationHookInput,
  UserPromptSubmitHookInput,
  SessionStartHookInput,
  SessionEndHookInput,
  StopHookInput,
  SubagentStartHookInput,
  SubagentStopHookInput,
  PreCompactHookInput,
  PermissionRequestHookInput,
  SetupHookInput,
  TeammateIdleHookInput,
  TaskCompletedHookInput,
]).pipe(
  S.toTaggedUnion("hook_event_name"),
  S.annotate(
    $I.annote("HookInput", {
      description: "Tagged union schema for incoming hook payloads.",
    })
  )
);

/**
 * @since 0.0.0
 */
export type HookInput = typeof HookInput.Type;
/**
 * @since 0.0.0
 */
export type HookInputEncoded = typeof HookInput.Encoded;

/**
 * @since 0.0.0
 */
export const PreToolUseHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("PreToolUse"),
  permissionDecision: S.optionalKey(LiteralKit(["allow", "deny", "ask"])),
  permissionDecisionReason: S.optionalKey(S.String),
  updatedInput: S.optionalKey(S.Record(S.String, S.Unknown)),
  additionalContext: S.optionalKey(S.String),
}).annotate(
  $I.annote("PreToolUseHookSpecificOutput", {
    description: "Schema for PreToolUseHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type PreToolUseHookSpecificOutput = typeof PreToolUseHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type PreToolUseHookSpecificOutputEncoded = typeof PreToolUseHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const UserPromptSubmitHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("UserPromptSubmit"),
  additionalContext: S.optional(S.String),
}).annotate(
  $I.annote("UserPromptSubmitHookSpecificOutput", {
    description: "Schema for UserPromptSubmitHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type UserPromptSubmitHookSpecificOutput = typeof UserPromptSubmitHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type UserPromptSubmitHookSpecificOutputEncoded = typeof UserPromptSubmitHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const SessionStartHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("SessionStart"),
  additionalContext: S.optional(S.String),
}).annotate(
  $I.annote("SessionStartHookSpecificOutput", {
    description: "Schema for SessionStartHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type SessionStartHookSpecificOutput = typeof SessionStartHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type SessionStartHookSpecificOutputEncoded = typeof SessionStartHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const SetupHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("Setup"),
  additionalContext: S.optional(S.String),
}).annotate(
  $I.annote("SetupHookSpecificOutput", {
    description: "Schema for SetupHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type SetupHookSpecificOutput = typeof SetupHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type SetupHookSpecificOutputEncoded = typeof SetupHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const SubagentStartHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("SubagentStart"),
  additionalContext: S.optional(S.String),
}).annotate(
  $I.annote("SubagentStartHookSpecificOutput", {
    description: "Schema for SubagentStartHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type SubagentStartHookSpecificOutput = typeof SubagentStartHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type SubagentStartHookSpecificOutputEncoded = typeof SubagentStartHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const PostToolUseHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("PostToolUse"),
  additionalContext: S.optional(S.String),
  updatedMCPToolOutput: S.optional(S.Unknown),
}).annotate(
  $I.annote("PostToolUseHookSpecificOutput", {
    description: "Schema for PostToolUseHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type PostToolUseHookSpecificOutput = typeof PostToolUseHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type PostToolUseHookSpecificOutputEncoded = typeof PostToolUseHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const PostToolUseFailureHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("PostToolUseFailure"),
  additionalContext: S.optional(S.String),
}).annotate(
  $I.annote("PostToolUseFailureHookSpecificOutput", {
    description: "Schema for PostToolUseFailureHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type PostToolUseFailureHookSpecificOutput = typeof PostToolUseFailureHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type PostToolUseFailureHookSpecificOutputEncoded = typeof PostToolUseFailureHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const NotificationHookSpecificOutput = S.Struct({
  hookEventName: S.Literal("Notification"),
  additionalContext: S.optional(S.String),
}).annotate(
  $I.annote("NotificationHookSpecificOutput", {
    description: "Schema for NotificationHookSpecificOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type NotificationHookSpecificOutput = typeof NotificationHookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type NotificationHookSpecificOutputEncoded = typeof NotificationHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const HookSpecificOutput = S.Union([
  PreToolUseHookSpecificOutput,
  UserPromptSubmitHookSpecificOutput,
  SessionStartHookSpecificOutput,
  SetupHookSpecificOutput,
  SubagentStartHookSpecificOutput,
  PostToolUseHookSpecificOutput,
  PostToolUseFailureHookSpecificOutput,
  NotificationHookSpecificOutput,
  PermissionRequestHookSpecificOutput,
]).pipe(
  S.toTaggedUnion("hookEventName"),
  S.annotate(
    $I.annote("HookSpecificOutput", {
      description: "Tagged union schema for hook-specific output payloads.",
    })
  )
);

/**
 * @since 0.0.0
 */
export type HookSpecificOutput = typeof HookSpecificOutput.Type;
/**
 * @since 0.0.0
 */
export type HookSpecificOutputEncoded = typeof HookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const SyncHookJSONOutput = S.Struct({
  continue: S.optional(S.Boolean),
  suppressOutput: S.optional(S.Boolean),
  stopReason: S.optional(S.String),
  decision: S.optional(LiteralKit(["approve", "block"])),
  systemMessage: S.optional(S.String),
  reason: S.optional(S.String),
  hookSpecificOutput: S.optional(HookSpecificOutput),
}).annotate(
  $I.annote("SyncHookJSONOutput", {
    description: "Schema for SyncHookJSONOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type SyncHookJSONOutput = typeof SyncHookJSONOutput.Type;
/**
 * @since 0.0.0
 */
export type SyncHookJSONOutputEncoded = typeof SyncHookJSONOutput.Encoded;

/**
 * @since 0.0.0
 */
export const AsyncHookJSONOutput = S.Struct({
  async: S.Literal(true),
  asyncTimeout: S.optional(S.Number),
}).annotate(
  $I.annote("AsyncHookJSONOutput", {
    description: "Schema for AsyncHookJSONOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type AsyncHookJSONOutput = typeof AsyncHookJSONOutput.Type;
/**
 * @since 0.0.0
 */
export type AsyncHookJSONOutputEncoded = typeof AsyncHookJSONOutput.Encoded;

/**
 * @since 0.0.0
 */
export const HookJSONOutput = S.Union([AsyncHookJSONOutput, SyncHookJSONOutput]).annotate(
  $I.annote("HookJSONOutput", {
    description: "Schema for HookJSONOutput.",
  })
);

/**
 * @since 0.0.0
 */
export type HookJSONOutput = typeof HookJSONOutput.Type;
/**
 * @since 0.0.0
 */
export type HookJSONOutputEncoded = typeof HookJSONOutput.Encoded;

/**
 * @since 0.0.0
 */
export const HookCallback = S.declare(
  (
    _: unknown
  ): _ is (
    input: HookInput,
    toolUseID: string | undefined,
    options: { signal: AbortSignal }
  ) => Promise<HookJSONOutput> => true
).pipe(
  S.annotate(
    $I.annote("HookCallback", {
      description: "Schema for HookCallback.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export type HookCallback = typeof HookCallback.Type;
/**
 * @since 0.0.0
 */
export type HookCallbackEncoded = typeof HookCallback.Encoded;

/**
 * @since 0.0.0
 */
export const HookCallbackMatcher = S.Struct({
  matcher: S.optional(S.String),
  hooks: S.Array(HookCallback),
  timeout: S.optional(S.Number),
}).annotate(
  $I.annote("HookCallbackMatcher", {
    description: "Schema for HookCallbackMatcher.",
  })
);

/**
 * @since 0.0.0
 */
export type HookCallbackMatcher = typeof HookCallbackMatcher.Type;
/**
 * @since 0.0.0
 */
export type HookCallbackMatcherEncoded = typeof HookCallbackMatcher.Encoded;
