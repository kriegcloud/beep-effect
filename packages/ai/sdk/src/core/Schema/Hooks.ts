import * as S from "effect/Schema";

import { withIdentifier } from "./Annotations.js";
import { ExitReason } from "./Common.js";
import { PermissionRequestHookSpecificOutput, PermissionUpdate } from "./Permission.js";

const BaseHookInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.optional(S.String),
});

export const HookEvent = withIdentifier(
  S.Literals([
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
  ]),
  "HookEvent"
);

export type HookEvent = typeof HookEvent.Type;
export type HookEventEncoded = typeof HookEvent.Encoded;

export const NotificationHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Notification"),
    message: S.String,
    title: S.optional(S.String),
    notification_type: S.String,
  }),
  "NotificationHookInput"
);

export type NotificationHookInput = typeof NotificationHookInput.Type;
export type NotificationHookInputEncoded = typeof NotificationHookInput.Encoded;

export const UserPromptSubmitHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("UserPromptSubmit"),
    prompt: S.String,
  }),
  "UserPromptSubmitHookInput"
);

export type UserPromptSubmitHookInput = typeof UserPromptSubmitHookInput.Type;
export type UserPromptSubmitHookInputEncoded = typeof UserPromptSubmitHookInput.Encoded;

export const SessionStartHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SessionStart"),
    source: S.Literals(["startup", "resume", "clear", "compact"]),
    agent_type: S.optional(S.String),
    model: S.optional(S.String),
  }),
  "SessionStartHookInput"
);

export type SessionStartHookInput = typeof SessionStartHookInput.Type;
export type SessionStartHookInputEncoded = typeof SessionStartHookInput.Encoded;

export const SessionEndHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SessionEnd"),
    reason: ExitReason,
  }),
  "SessionEndHookInput"
);

export type SessionEndHookInput = typeof SessionEndHookInput.Type;
export type SessionEndHookInputEncoded = typeof SessionEndHookInput.Encoded;

export const StopHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Stop"),
    stop_hook_active: S.Boolean,
  }),
  "StopHookInput"
);

export type StopHookInput = typeof StopHookInput.Type;
export type StopHookInputEncoded = typeof StopHookInput.Encoded;

export const SubagentStartHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SubagentStart"),
    agent_id: S.String,
    agent_type: S.String,
  }),
  "SubagentStartHookInput"
);

export type SubagentStartHookInput = typeof SubagentStartHookInput.Type;
export type SubagentStartHookInputEncoded = typeof SubagentStartHookInput.Encoded;

export const SubagentStopHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SubagentStop"),
    stop_hook_active: S.Boolean,
    agent_id: S.String,
    agent_transcript_path: S.String,
    agent_type: S.String,
  }),
  "SubagentStopHookInput"
);

export type SubagentStopHookInput = typeof SubagentStopHookInput.Type;
export type SubagentStopHookInputEncoded = typeof SubagentStopHookInput.Encoded;

export const PreCompactHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PreCompact"),
    trigger: S.Literals(["manual", "auto"]),
    custom_instructions: S.Union([S.String, S.Null]),
  }),
  "PreCompactHookInput"
);

export type PreCompactHookInput = typeof PreCompactHookInput.Type;
export type PreCompactHookInputEncoded = typeof PreCompactHookInput.Encoded;

export const PreToolUseHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PreToolUse"),
    tool_name: S.String,
    tool_input: S.Unknown,
    tool_use_id: S.String,
  }),
  "PreToolUseHookInput"
);

export type PreToolUseHookInput = typeof PreToolUseHookInput.Type;
export type PreToolUseHookInputEncoded = typeof PreToolUseHookInput.Encoded;

export const PostToolUseHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PostToolUse"),
    tool_name: S.String,
    tool_input: S.Unknown,
    tool_response: S.Unknown,
    tool_use_id: S.String,
  }),
  "PostToolUseHookInput"
);

export type PostToolUseHookInput = typeof PostToolUseHookInput.Type;
export type PostToolUseHookInputEncoded = typeof PostToolUseHookInput.Encoded;

export const PostToolUseFailureHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PostToolUseFailure"),
    tool_name: S.String,
    tool_input: S.Unknown,
    tool_use_id: S.String,
    error: S.String,
    is_interrupt: S.optional(S.Boolean),
  }),
  "PostToolUseFailureHookInput"
);

export type PostToolUseFailureHookInput = typeof PostToolUseFailureHookInput.Type;
export type PostToolUseFailureHookInputEncoded = typeof PostToolUseFailureHookInput.Encoded;

export const PermissionRequestHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PermissionRequest"),
    tool_name: S.String,
    tool_input: S.Unknown,
    permission_suggestions: S.optional(S.Array(PermissionUpdate)),
  }),
  "PermissionRequestHookInput"
);

export type PermissionRequestHookInput = typeof PermissionRequestHookInput.Type;
export type PermissionRequestHookInputEncoded = typeof PermissionRequestHookInput.Encoded;

export const SetupHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Setup"),
    trigger: S.Literals(["init", "maintenance"]),
  }),
  "SetupHookInput"
);

export type SetupHookInput = typeof SetupHookInput.Type;
export type SetupHookInputEncoded = typeof SetupHookInput.Encoded;

export const TeammateIdleHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("TeammateIdle"),
    teammate_name: S.String,
    team_name: S.String,
  }),
  "TeammateIdleHookInput"
);

export type TeammateIdleHookInput = typeof TeammateIdleHookInput.Type;
export type TeammateIdleHookInputEncoded = typeof TeammateIdleHookInput.Encoded;

export const TaskCompletedHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("TaskCompleted"),
    task_id: S.String,
    task_subject: S.String,
    task_description: S.optional(S.String),
    teammate_name: S.optional(S.String),
    team_name: S.optional(S.String),
  }),
  "TaskCompletedHookInput"
);

export type TaskCompletedHookInput = typeof TaskCompletedHookInput.Type;
export type TaskCompletedHookInputEncoded = typeof TaskCompletedHookInput.Encoded;

export const HookInput = withIdentifier(
  S.Union([
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
  ]),
  "HookInput"
);

export type HookInput = typeof HookInput.Type;
export type HookInputEncoded = typeof HookInput.Encoded;

export const PreToolUseHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("PreToolUse"),
    permissionDecision: S.optionalKey(S.Literals(["allow", "deny", "ask"])),
    permissionDecisionReason: S.optionalKey(S.String),
    updatedInput: S.optionalKey(S.Record(S.String, S.Unknown)),
    additionalContext: S.optionalKey(S.String),
  }),
  "PreToolUseHookSpecificOutput"
);

export type PreToolUseHookSpecificOutput = typeof PreToolUseHookSpecificOutput.Type;
export type PreToolUseHookSpecificOutputEncoded = typeof PreToolUseHookSpecificOutput.Encoded;

export const UserPromptSubmitHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("UserPromptSubmit"),
    additionalContext: S.optional(S.String),
  }),
  "UserPromptSubmitHookSpecificOutput"
);

export type UserPromptSubmitHookSpecificOutput = typeof UserPromptSubmitHookSpecificOutput.Type;
export type UserPromptSubmitHookSpecificOutputEncoded = typeof UserPromptSubmitHookSpecificOutput.Encoded;

export const SessionStartHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("SessionStart"),
    additionalContext: S.optional(S.String),
  }),
  "SessionStartHookSpecificOutput"
);

export type SessionStartHookSpecificOutput = typeof SessionStartHookSpecificOutput.Type;
export type SessionStartHookSpecificOutputEncoded = typeof SessionStartHookSpecificOutput.Encoded;

export const SetupHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("Setup"),
    additionalContext: S.optional(S.String),
  }),
  "SetupHookSpecificOutput"
);

export type SetupHookSpecificOutput = typeof SetupHookSpecificOutput.Type;
export type SetupHookSpecificOutputEncoded = typeof SetupHookSpecificOutput.Encoded;

export const SubagentStartHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("SubagentStart"),
    additionalContext: S.optional(S.String),
  }),
  "SubagentStartHookSpecificOutput"
);

export type SubagentStartHookSpecificOutput = typeof SubagentStartHookSpecificOutput.Type;
export type SubagentStartHookSpecificOutputEncoded = typeof SubagentStartHookSpecificOutput.Encoded;

export const PostToolUseHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("PostToolUse"),
    additionalContext: S.optional(S.String),
    updatedMCPToolOutput: S.optional(S.Unknown),
  }),
  "PostToolUseHookSpecificOutput"
);

export type PostToolUseHookSpecificOutput = typeof PostToolUseHookSpecificOutput.Type;
export type PostToolUseHookSpecificOutputEncoded = typeof PostToolUseHookSpecificOutput.Encoded;

export const PostToolUseFailureHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("PostToolUseFailure"),
    additionalContext: S.optional(S.String),
  }),
  "PostToolUseFailureHookSpecificOutput"
);

export type PostToolUseFailureHookSpecificOutput = typeof PostToolUseFailureHookSpecificOutput.Type;
export type PostToolUseFailureHookSpecificOutputEncoded = typeof PostToolUseFailureHookSpecificOutput.Encoded;

export const NotificationHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("Notification"),
    additionalContext: S.optional(S.String),
  }),
  "NotificationHookSpecificOutput"
);

export type NotificationHookSpecificOutput = typeof NotificationHookSpecificOutput.Type;
export type NotificationHookSpecificOutputEncoded = typeof NotificationHookSpecificOutput.Encoded;

export const HookSpecificOutput = withIdentifier(
  S.Union([
    PreToolUseHookSpecificOutput,
    UserPromptSubmitHookSpecificOutput,
    SessionStartHookSpecificOutput,
    SetupHookSpecificOutput,
    SubagentStartHookSpecificOutput,
    PostToolUseHookSpecificOutput,
    PostToolUseFailureHookSpecificOutput,
    NotificationHookSpecificOutput,
    PermissionRequestHookSpecificOutput,
  ]),
  "HookSpecificOutput"
);

export type HookSpecificOutput = typeof HookSpecificOutput.Type;
export type HookSpecificOutputEncoded = typeof HookSpecificOutput.Encoded;

export const SyncHookJSONOutput = withIdentifier(
  S.Struct({
    continue: S.optional(S.Boolean),
    suppressOutput: S.optional(S.Boolean),
    stopReason: S.optional(S.String),
    decision: S.optional(S.Literals(["approve", "block"])),
    systemMessage: S.optional(S.String),
    reason: S.optional(S.String),
    hookSpecificOutput: S.optional(HookSpecificOutput),
  }),
  "SyncHookJSONOutput"
);

export type SyncHookJSONOutput = typeof SyncHookJSONOutput.Type;
export type SyncHookJSONOutputEncoded = typeof SyncHookJSONOutput.Encoded;

export const AsyncHookJSONOutput = withIdentifier(
  S.Struct({
    async: S.Literal(true),
    asyncTimeout: S.optional(S.Number),
  }),
  "AsyncHookJSONOutput"
);

export type AsyncHookJSONOutput = typeof AsyncHookJSONOutput.Type;
export type AsyncHookJSONOutputEncoded = typeof AsyncHookJSONOutput.Encoded;

export const HookJSONOutput = withIdentifier(S.Union([AsyncHookJSONOutput, SyncHookJSONOutput]), "HookJSONOutput");

export type HookJSONOutput = typeof HookJSONOutput.Type;
export type HookJSONOutputEncoded = typeof HookJSONOutput.Encoded;

export const HookCallback = S.declare(
  (
    _: unknown
  ): _ is (
    input: HookInput,
    toolUseID: string | undefined,
    options: { signal: AbortSignal }
  ) => Promise<HookJSONOutput> => true
).pipe(S.annotate({ identifier: "HookCallback", jsonSchema: {} }));

export type HookCallback = typeof HookCallback.Type;
export type HookCallbackEncoded = typeof HookCallback.Encoded;

export const HookCallbackMatcher = withIdentifier(
  S.Struct({
    matcher: S.optional(S.String),
    hooks: S.Array(HookCallback),
    timeout: S.optional(S.Number),
  }),
  "HookCallbackMatcher"
);

export type HookCallbackMatcher = typeof HookCallbackMatcher.Type;
export type HookCallbackMatcherEncoded = typeof HookCallbackMatcher.Encoded;
