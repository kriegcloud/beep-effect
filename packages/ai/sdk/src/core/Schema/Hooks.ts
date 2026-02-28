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

/**
 * @since 0.0.0
 */
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
export const UserPromptSubmitHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("UserPromptSubmit"),
    prompt: S.String,
  }),
  "UserPromptSubmitHookInput"
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
export const SessionEndHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SessionEnd"),
    reason: ExitReason,
  }),
  "SessionEndHookInput"
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
export const StopHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Stop"),
    stop_hook_active: S.Boolean,
  }),
  "StopHookInput"
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
export const SubagentStartHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SubagentStart"),
    agent_id: S.String,
    agent_type: S.String,
  }),
  "SubagentStartHookInput"
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
export const PreCompactHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PreCompact"),
    trigger: S.Literals(["manual", "auto"]),
    custom_instructions: S.Union([S.String, S.Null]),
  }),
  "PreCompactHookInput"
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
export const SetupHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Setup"),
    trigger: S.Literals(["init", "maintenance"]),
  }),
  "SetupHookInput"
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
export const TeammateIdleHookInput = withIdentifier(
  S.Struct({
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("TeammateIdle"),
    teammate_name: S.String,
    team_name: S.String,
  }),
  "TeammateIdleHookInput"
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
export const UserPromptSubmitHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("UserPromptSubmit"),
    additionalContext: S.optional(S.String),
  }),
  "UserPromptSubmitHookSpecificOutput"
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
export const SessionStartHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("SessionStart"),
    additionalContext: S.optional(S.String),
  }),
  "SessionStartHookSpecificOutput"
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
export const SetupHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("Setup"),
    additionalContext: S.optional(S.String),
  }),
  "SetupHookSpecificOutput"
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
export const SubagentStartHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("SubagentStart"),
    additionalContext: S.optional(S.String),
  }),
  "SubagentStartHookSpecificOutput"
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
export const PostToolUseHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("PostToolUse"),
    additionalContext: S.optional(S.String),
    updatedMCPToolOutput: S.optional(S.Unknown),
  }),
  "PostToolUseHookSpecificOutput"
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
export const PostToolUseFailureHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("PostToolUseFailure"),
    additionalContext: S.optional(S.String),
  }),
  "PostToolUseFailureHookSpecificOutput"
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
export const NotificationHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("Notification"),
    additionalContext: S.optional(S.String),
  }),
  "NotificationHookSpecificOutput"
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
export const AsyncHookJSONOutput = withIdentifier(
  S.Struct({
    async: S.Literal(true),
    asyncTimeout: S.optional(S.Number),
  }),
  "AsyncHookJSONOutput"
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
export const HookJSONOutput = withIdentifier(S.Union([AsyncHookJSONOutput, SyncHookJSONOutput]), "HookJSONOutput");

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
).pipe(S.annotate({ identifier: "HookCallback", jsonSchema: {} }));

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
export const HookCallbackMatcher = withIdentifier(
  S.Struct({
    matcher: S.optional(S.String),
    hooks: S.Array(HookCallback),
    timeout: S.optional(S.Number),
  }),
  "HookCallbackMatcher"
);

/**
 * @since 0.0.0
 */
export type HookCallbackMatcher = typeof HookCallbackMatcher.Type;
/**
 * @since 0.0.0
 */
export type HookCallbackMatcherEncoded = typeof HookCallbackMatcher.Encoded;
