import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import { ExitReason } from "./Common.js"
import {
  PermissionRequestHookSpecificOutput,
  PermissionUpdate
} from "./Permission.js"

const BaseHookInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.optional(Schema.String)
})

export const HookEvent = withIdentifier(
  Schema.Literal(
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
    "TaskCompleted"
  ),
  "HookEvent"
)

export type HookEvent = typeof HookEvent.Type
export type HookEventEncoded = typeof HookEvent.Encoded

export const NotificationHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("Notification"),
    message: Schema.String,
    title: Schema.optional(Schema.String),
    notification_type: Schema.String
  }),
  "NotificationHookInput"
)

export type NotificationHookInput = typeof NotificationHookInput.Type
export type NotificationHookInputEncoded = typeof NotificationHookInput.Encoded

export const UserPromptSubmitHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("UserPromptSubmit"),
    prompt: Schema.String
  }),
  "UserPromptSubmitHookInput"
)

export type UserPromptSubmitHookInput = typeof UserPromptSubmitHookInput.Type
export type UserPromptSubmitHookInputEncoded = typeof UserPromptSubmitHookInput.Encoded

export const SessionStartHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("SessionStart"),
    source: Schema.Literal("startup", "resume", "clear", "compact"),
    agent_type: Schema.optional(Schema.String),
    model: Schema.optional(Schema.String)
  }),
  "SessionStartHookInput"
)

export type SessionStartHookInput = typeof SessionStartHookInput.Type
export type SessionStartHookInputEncoded = typeof SessionStartHookInput.Encoded

export const SessionEndHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("SessionEnd"),
    reason: ExitReason
  }),
  "SessionEndHookInput"
)

export type SessionEndHookInput = typeof SessionEndHookInput.Type
export type SessionEndHookInputEncoded = typeof SessionEndHookInput.Encoded

export const StopHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("Stop"),
    stop_hook_active: Schema.Boolean
  }),
  "StopHookInput"
)

export type StopHookInput = typeof StopHookInput.Type
export type StopHookInputEncoded = typeof StopHookInput.Encoded

export const SubagentStartHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("SubagentStart"),
    agent_id: Schema.String,
    agent_type: Schema.String
  }),
  "SubagentStartHookInput"
)

export type SubagentStartHookInput = typeof SubagentStartHookInput.Type
export type SubagentStartHookInputEncoded = typeof SubagentStartHookInput.Encoded

export const SubagentStopHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("SubagentStop"),
    stop_hook_active: Schema.Boolean,
    agent_id: Schema.String,
    agent_transcript_path: Schema.String,
    agent_type: Schema.String
  }),
  "SubagentStopHookInput"
)

export type SubagentStopHookInput = typeof SubagentStopHookInput.Type
export type SubagentStopHookInputEncoded = typeof SubagentStopHookInput.Encoded

export const PreCompactHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("PreCompact"),
    trigger: Schema.Literal("manual", "auto"),
    custom_instructions: Schema.Union(Schema.String, Schema.Null)
  }),
  "PreCompactHookInput"
)

export type PreCompactHookInput = typeof PreCompactHookInput.Type
export type PreCompactHookInputEncoded = typeof PreCompactHookInput.Encoded

export const PreToolUseHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("PreToolUse"),
    tool_name: Schema.String,
    tool_input: Schema.Unknown,
    tool_use_id: Schema.String
  }),
  "PreToolUseHookInput"
)

export type PreToolUseHookInput = typeof PreToolUseHookInput.Type
export type PreToolUseHookInputEncoded = typeof PreToolUseHookInput.Encoded

export const PostToolUseHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("PostToolUse"),
    tool_name: Schema.String,
    tool_input: Schema.Unknown,
    tool_response: Schema.Unknown,
    tool_use_id: Schema.String
  }),
  "PostToolUseHookInput"
)

export type PostToolUseHookInput = typeof PostToolUseHookInput.Type
export type PostToolUseHookInputEncoded = typeof PostToolUseHookInput.Encoded

export const PostToolUseFailureHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("PostToolUseFailure"),
    tool_name: Schema.String,
    tool_input: Schema.Unknown,
    tool_use_id: Schema.String,
    error: Schema.String,
    is_interrupt: Schema.optional(Schema.Boolean)
  }),
  "PostToolUseFailureHookInput"
)

export type PostToolUseFailureHookInput = typeof PostToolUseFailureHookInput.Type
export type PostToolUseFailureHookInputEncoded = typeof PostToolUseFailureHookInput.Encoded

export const PermissionRequestHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("PermissionRequest"),
    tool_name: Schema.String,
    tool_input: Schema.Unknown,
    permission_suggestions: Schema.optional(Schema.Array(PermissionUpdate))
  }),
  "PermissionRequestHookInput"
)

export type PermissionRequestHookInput = typeof PermissionRequestHookInput.Type
export type PermissionRequestHookInputEncoded = typeof PermissionRequestHookInput.Encoded

export const SetupHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("Setup"),
    trigger: Schema.Literal("init", "maintenance")
  }),
  "SetupHookInput"
)

export type SetupHookInput = typeof SetupHookInput.Type
export type SetupHookInputEncoded = typeof SetupHookInput.Encoded

export const TeammateIdleHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("TeammateIdle"),
    teammate_name: Schema.String,
    team_name: Schema.String
  }),
  "TeammateIdleHookInput"
)

export type TeammateIdleHookInput = typeof TeammateIdleHookInput.Type
export type TeammateIdleHookInputEncoded = typeof TeammateIdleHookInput.Encoded

export const TaskCompletedHookInput = withIdentifier(
  Schema.Struct({
    ...BaseHookInput.fields,
    hook_event_name: Schema.Literal("TaskCompleted"),
    task_id: Schema.String,
    task_subject: Schema.String,
    task_description: Schema.optional(Schema.String),
    teammate_name: Schema.optional(Schema.String),
    team_name: Schema.optional(Schema.String)
  }),
  "TaskCompletedHookInput"
)

export type TaskCompletedHookInput = typeof TaskCompletedHookInput.Type
export type TaskCompletedHookInputEncoded = typeof TaskCompletedHookInput.Encoded

export const HookInput = withIdentifier(
  Schema.Union(
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
    TaskCompletedHookInput
  ),
  "HookInput"
)

export type HookInput = typeof HookInput.Type
export type HookInputEncoded = typeof HookInput.Encoded

export const PreToolUseHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("PreToolUse"),
    permissionDecision: Schema.optional(Schema.Literal("allow", "deny", "ask")),
    permissionDecisionReason: Schema.optional(Schema.String),
    updatedInput: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
    additionalContext: Schema.optional(Schema.String)
  }),
  "PreToolUseHookSpecificOutput"
)

export type PreToolUseHookSpecificOutput = typeof PreToolUseHookSpecificOutput.Type
export type PreToolUseHookSpecificOutputEncoded = typeof PreToolUseHookSpecificOutput.Encoded

export const UserPromptSubmitHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("UserPromptSubmit"),
    additionalContext: Schema.optional(Schema.String)
  }),
  "UserPromptSubmitHookSpecificOutput"
)

export type UserPromptSubmitHookSpecificOutput = typeof UserPromptSubmitHookSpecificOutput.Type
export type UserPromptSubmitHookSpecificOutputEncoded = typeof UserPromptSubmitHookSpecificOutput.Encoded

export const SessionStartHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("SessionStart"),
    additionalContext: Schema.optional(Schema.String)
  }),
  "SessionStartHookSpecificOutput"
)

export type SessionStartHookSpecificOutput = typeof SessionStartHookSpecificOutput.Type
export type SessionStartHookSpecificOutputEncoded = typeof SessionStartHookSpecificOutput.Encoded

export const SetupHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("Setup"),
    additionalContext: Schema.optional(Schema.String)
  }),
  "SetupHookSpecificOutput"
)

export type SetupHookSpecificOutput = typeof SetupHookSpecificOutput.Type
export type SetupHookSpecificOutputEncoded = typeof SetupHookSpecificOutput.Encoded

export const SubagentStartHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("SubagentStart"),
    additionalContext: Schema.optional(Schema.String)
  }),
  "SubagentStartHookSpecificOutput"
)

export type SubagentStartHookSpecificOutput = typeof SubagentStartHookSpecificOutput.Type
export type SubagentStartHookSpecificOutputEncoded = typeof SubagentStartHookSpecificOutput.Encoded

export const PostToolUseHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("PostToolUse"),
    additionalContext: Schema.optional(Schema.String),
    updatedMCPToolOutput: Schema.optional(Schema.Unknown)
  }),
  "PostToolUseHookSpecificOutput"
)

export type PostToolUseHookSpecificOutput = typeof PostToolUseHookSpecificOutput.Type
export type PostToolUseHookSpecificOutputEncoded = typeof PostToolUseHookSpecificOutput.Encoded

export const PostToolUseFailureHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("PostToolUseFailure"),
    additionalContext: Schema.optional(Schema.String)
  }),
  "PostToolUseFailureHookSpecificOutput"
)

export type PostToolUseFailureHookSpecificOutput = typeof PostToolUseFailureHookSpecificOutput.Type
export type PostToolUseFailureHookSpecificOutputEncoded = typeof PostToolUseFailureHookSpecificOutput.Encoded

export const NotificationHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("Notification"),
    additionalContext: Schema.optional(Schema.String)
  }),
  "NotificationHookSpecificOutput"
)

export type NotificationHookSpecificOutput = typeof NotificationHookSpecificOutput.Type
export type NotificationHookSpecificOutputEncoded = typeof NotificationHookSpecificOutput.Encoded

export const HookSpecificOutput = withIdentifier(
  Schema.Union(
    PreToolUseHookSpecificOutput,
    UserPromptSubmitHookSpecificOutput,
    SessionStartHookSpecificOutput,
    SetupHookSpecificOutput,
    SubagentStartHookSpecificOutput,
    PostToolUseHookSpecificOutput,
    PostToolUseFailureHookSpecificOutput,
    NotificationHookSpecificOutput,
    PermissionRequestHookSpecificOutput
  ),
  "HookSpecificOutput"
)

export type HookSpecificOutput = typeof HookSpecificOutput.Type
export type HookSpecificOutputEncoded = typeof HookSpecificOutput.Encoded

export const SyncHookJSONOutput = withIdentifier(
  Schema.Struct({
    continue: Schema.optional(Schema.Boolean),
    suppressOutput: Schema.optional(Schema.Boolean),
    stopReason: Schema.optional(Schema.String),
    decision: Schema.optional(Schema.Literal("approve", "block")),
    systemMessage: Schema.optional(Schema.String),
    reason: Schema.optional(Schema.String),
    hookSpecificOutput: Schema.optional(HookSpecificOutput)
  }),
  "SyncHookJSONOutput"
)

export type SyncHookJSONOutput = typeof SyncHookJSONOutput.Type
export type SyncHookJSONOutputEncoded = typeof SyncHookJSONOutput.Encoded

export const AsyncHookJSONOutput = withIdentifier(
  Schema.Struct({
    async: Schema.Literal(true),
    asyncTimeout: Schema.optional(Schema.Number)
  }),
  "AsyncHookJSONOutput"
)

export type AsyncHookJSONOutput = typeof AsyncHookJSONOutput.Type
export type AsyncHookJSONOutputEncoded = typeof AsyncHookJSONOutput.Encoded

export const HookJSONOutput = withIdentifier(
  Schema.Union(AsyncHookJSONOutput, SyncHookJSONOutput),
  "HookJSONOutput"
)

export type HookJSONOutput = typeof HookJSONOutput.Type
export type HookJSONOutputEncoded = typeof HookJSONOutput.Encoded

export const HookCallback = Schema.declare(
  (_: unknown): _ is ((
    input: HookInput,
    toolUseID: string | undefined,
    options: { signal: AbortSignal }
  ) => Promise<HookJSONOutput>) => true
).pipe(Schema.annotations({ identifier: "HookCallback", jsonSchema: {} }))

export type HookCallback = typeof HookCallback.Type
export type HookCallbackEncoded = typeof HookCallback.Encoded

export const HookCallbackMatcher = withIdentifier(
  Schema.Struct({
    matcher: Schema.optional(Schema.String),
    hooks: Schema.Array(HookCallback),
    timeout: Schema.optional(Schema.Number)
  }),
  "HookCallbackMatcher"
)

export type HookCallbackMatcher = typeof HookCallbackMatcher.Type
export type HookCallbackMatcherEncoded = typeof HookCallbackMatcher.Encoded
