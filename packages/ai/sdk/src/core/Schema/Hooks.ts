import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { ExitReason } from "./Common.js";
import { PermissionRequestHookSpecificOutput, PermissionUpdate } from "./Permission.js";

const $I = $AiSdkId.create("core/Schema/Hooks");

class BaseHookInput extends S.Class<BaseHookInput>($I`BaseHookInput`)(
  {
    session_id: S.String,
    transcript_path: S.String,
    cwd: S.String,
    permission_mode: S.optional(S.String),
  },
  $I.annote("BaseHookInput", {
    description: "Shared transport fields present on all hook input payloads.",
  })
) {}

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
    description: "Supported Claude Code hook event names emitted by the SDK.",
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
export class NotificationHookInput extends S.Class<NotificationHookInput>($I`NotificationHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Notification"),
    message: S.String,
    title: S.optional(S.String),
    notification_type: S.String,
  },
  $I.annote("NotificationHookInput", {
    description: "Incoming Notification hook payload delivered to hook callbacks.",
  })
) {}
/**
 * @since 0.0.0
 */
export type NotificationHookInputEncoded = typeof NotificationHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class UserPromptSubmitHookInput extends S.Class<UserPromptSubmitHookInput>($I`UserPromptSubmitHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("UserPromptSubmit"),
    prompt: S.String,
  },
  $I.annote("UserPromptSubmitHookInput", {
    description: "Incoming UserPromptSubmit hook payload containing the submitted prompt text.",
  })
) {}
/**
 * @since 0.0.0
 */
export type UserPromptSubmitHookInputEncoded = typeof UserPromptSubmitHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionStartHookInput extends S.Class<SessionStartHookInput>($I`SessionStartHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SessionStart"),
    source: LiteralKit(["startup", "resume", "clear", "compact"]),
    agent_type: S.optional(S.String),
    model: S.optional(S.String),
  },
  $I.annote("SessionStartHookInput", {
    description: "Incoming SessionStart hook payload describing how a session began.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionStartHookInputEncoded = typeof SessionStartHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionEndHookInput extends S.Class<SessionEndHookInput>($I`SessionEndHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SessionEnd"),
    reason: ExitReason,
  },
  $I.annote("SessionEndHookInput", {
    description: "Incoming SessionEnd hook payload describing why a session ended.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionEndHookInputEncoded = typeof SessionEndHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class StopHookInput extends S.Class<StopHookInput>($I`StopHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Stop"),
    stop_hook_active: S.Boolean,
  },
  $I.annote("StopHookInput", {
    description: "Incoming Stop hook payload indicating whether stop handling is currently active.",
  })
) {}
/**
 * @since 0.0.0
 */
export type StopHookInputEncoded = typeof StopHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class SubagentStartHookInput extends S.Class<SubagentStartHookInput>($I`SubagentStartHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SubagentStart"),
    agent_id: S.String,
    agent_type: S.String,
  },
  $I.annote("SubagentStartHookInput", {
    description: "Incoming SubagentStart hook payload for a newly launched subagent.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SubagentStartHookInputEncoded = typeof SubagentStartHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class SubagentStopHookInput extends S.Class<SubagentStopHookInput>($I`SubagentStopHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("SubagentStop"),
    stop_hook_active: S.Boolean,
    agent_id: S.String,
    agent_transcript_path: S.String,
    agent_type: S.String,
  },
  $I.annote("SubagentStopHookInput", {
    description: "Incoming SubagentStop hook payload for a finished subagent run.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SubagentStopHookInputEncoded = typeof SubagentStopHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class PreCompactHookInput extends S.Class<PreCompactHookInput>($I`PreCompactHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PreCompact"),
    trigger: LiteralKit(["manual", "auto"]),
    custom_instructions: S.Union([S.String, S.Null]),
  },
  $I.annote("PreCompactHookInput", {
    description: "Incoming PreCompact hook payload emitted before transcript compaction.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PreCompactHookInputEncoded = typeof PreCompactHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class PreToolUseHookInput extends S.Class<PreToolUseHookInput>($I`PreToolUseHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PreToolUse"),
    tool_name: S.String,
    tool_input: S.Unknown,
    tool_use_id: S.String,
  },
  $I.annote("PreToolUseHookInput", {
    description: "Incoming PreToolUse hook payload emitted before a tool invocation runs.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PreToolUseHookInputEncoded = typeof PreToolUseHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class PostToolUseHookInput extends S.Class<PostToolUseHookInput>($I`PostToolUseHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PostToolUse"),
    tool_name: S.String,
    tool_input: S.Unknown,
    tool_response: S.Unknown,
    tool_use_id: S.String,
  },
  $I.annote("PostToolUseHookInput", {
    description: "Incoming PostToolUse hook payload emitted after a tool invocation completes.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PostToolUseHookInputEncoded = typeof PostToolUseHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class PostToolUseFailureHookInput extends S.Class<PostToolUseFailureHookInput>($I`PostToolUseFailureHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PostToolUseFailure"),
    tool_name: S.String,
    tool_input: S.Unknown,
    tool_use_id: S.String,
    error: S.String,
    is_interrupt: S.optional(S.Boolean),
  },
  $I.annote("PostToolUseFailureHookInput", {
    description: "Incoming PostToolUseFailure hook payload emitted when a tool invocation fails.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PostToolUseFailureHookInputEncoded = typeof PostToolUseFailureHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class PermissionRequestHookInput extends S.Class<PermissionRequestHookInput>($I`PermissionRequestHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("PermissionRequest"),
    tool_name: S.String,
    tool_input: S.Unknown,
    permission_suggestions: S.optional(S.Array(PermissionUpdate)),
  },
  $I.annote("PermissionRequestHookInput", {
    description: "Incoming PermissionRequest hook payload describing a tool permission decision request.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PermissionRequestHookInputEncoded = typeof PermissionRequestHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class SetupHookInput extends S.Class<SetupHookInput>($I`SetupHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("Setup"),
    trigger: LiteralKit(["init", "maintenance"]),
  },
  $I.annote("SetupHookInput", {
    description: "Incoming Setup hook payload for repository initialization or maintenance work.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SetupHookInputEncoded = typeof SetupHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class TeammateIdleHookInput extends S.Class<TeammateIdleHookInput>($I`TeammateIdleHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("TeammateIdle"),
    teammate_name: S.String,
    team_name: S.String,
  },
  $I.annote("TeammateIdleHookInput", {
    description: "Incoming TeammateIdle hook payload emitted when a teammate becomes idle.",
  })
) {}
/**
 * @since 0.0.0
 */
export type TeammateIdleHookInputEncoded = typeof TeammateIdleHookInput.Encoded;

/**
 * @since 0.0.0
 */
export class TaskCompletedHookInput extends S.Class<TaskCompletedHookInput>($I`TaskCompletedHookInput`)(
  {
    ...BaseHookInput.fields,
    hook_event_name: S.Literal("TaskCompleted"),
    task_id: S.String,
    task_subject: S.String,
    task_description: S.optional(S.String),
    teammate_name: S.optional(S.String),
    team_name: S.optional(S.String),
  },
  $I.annote("TaskCompletedHookInput", {
    description: "Incoming TaskCompleted hook payload emitted when delegated work finishes.",
  })
) {}
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
export class PreToolUseHookSpecificOutput extends S.Class<PreToolUseHookSpecificOutput>(
  $I`PreToolUseHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("PreToolUse"),
    permissionDecision: S.optionalKey(LiteralKit(["allow", "deny", "ask"])),
    permissionDecisionReason: S.optionalKey(S.String),
    updatedInput: S.optionalKey(S.Record(S.String, S.Unknown)),
    additionalContext: S.optionalKey(S.String),
  },
  $I.annote("PreToolUseHookSpecificOutput", {
    description: "Hook-specific response payload for PreToolUse hooks, including permission overrides.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PreToolUseHookSpecificOutputEncoded = typeof PreToolUseHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export class UserPromptSubmitHookSpecificOutput extends S.Class<UserPromptSubmitHookSpecificOutput>(
  $I`UserPromptSubmitHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("UserPromptSubmit"),
    additionalContext: S.optional(S.String),
  },
  $I.annote("UserPromptSubmitHookSpecificOutput", {
    description: "Hook-specific response payload for UserPromptSubmit hooks.",
  })
) {}
/**
 * @since 0.0.0
 */
export type UserPromptSubmitHookSpecificOutputEncoded = typeof UserPromptSubmitHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export class SessionStartHookSpecificOutput extends S.Class<SessionStartHookSpecificOutput>(
  $I`SessionStartHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("SessionStart"),
    additionalContext: S.optional(S.String),
  },
  $I.annote("SessionStartHookSpecificOutput", {
    description: "Hook-specific response payload for SessionStart hooks.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SessionStartHookSpecificOutputEncoded = typeof SessionStartHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export class SetupHookSpecificOutput extends S.Class<SetupHookSpecificOutput>($I`SetupHookSpecificOutput`)(
  {
    hookEventName: S.Literal("Setup"),
    additionalContext: S.optional(S.String),
  },
  $I.annote("SetupHookSpecificOutput", {
    description: "Hook-specific response payload for Setup hooks.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SetupHookSpecificOutputEncoded = typeof SetupHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export class SubagentStartHookSpecificOutput extends S.Class<SubagentStartHookSpecificOutput>(
  $I`SubagentStartHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("SubagentStart"),
    additionalContext: S.optional(S.String),
  },
  $I.annote("SubagentStartHookSpecificOutput", {
    description: "Hook-specific response payload for SubagentStart hooks.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SubagentStartHookSpecificOutputEncoded = typeof SubagentStartHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export class PostToolUseHookSpecificOutput extends S.Class<PostToolUseHookSpecificOutput>(
  $I`PostToolUseHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("PostToolUse"),
    additionalContext: S.optional(S.String),
    updatedMCPToolOutput: S.optional(S.Unknown),
  },
  $I.annote("PostToolUseHookSpecificOutput", {
    description: "Hook-specific response payload for PostToolUse hooks, including MCP output overrides.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PostToolUseHookSpecificOutputEncoded = typeof PostToolUseHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export class PostToolUseFailureHookSpecificOutput extends S.Class<PostToolUseFailureHookSpecificOutput>(
  $I`PostToolUseFailureHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("PostToolUseFailure"),
    additionalContext: S.optional(S.String),
  },
  $I.annote("PostToolUseFailureHookSpecificOutput", {
    description: "Hook-specific response payload for PostToolUseFailure hooks.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PostToolUseFailureHookSpecificOutputEncoded = typeof PostToolUseFailureHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export class NotificationHookSpecificOutput extends S.Class<NotificationHookSpecificOutput>(
  $I`NotificationHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("Notification"),
    additionalContext: S.optional(S.String),
  },
  $I.annote("NotificationHookSpecificOutput", {
    description: "Hook-specific response payload for Notification hooks.",
  })
) {}
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
export class SyncHookJSONOutput extends S.Class<SyncHookJSONOutput>($I`SyncHookJSONOutput`)(
  {
    continue: S.optional(S.Boolean),
    suppressOutput: S.optional(S.Boolean),
    stopReason: S.optional(S.String),
    decision: S.optional(LiteralKit(["approve", "block"])),
    systemMessage: S.optional(S.String),
    reason: S.optional(S.String),
    hookSpecificOutput: S.optional(HookSpecificOutput),
  },
  $I.annote("SyncHookJSONOutput", {
    description: "Synchronous hook runner response payload returned directly to Claude Code.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SyncHookJSONOutputEncoded = typeof SyncHookJSONOutput.Encoded;

/**
 * @since 0.0.0
 */
export class AsyncHookJSONOutput extends S.Class<AsyncHookJSONOutput>($I`AsyncHookJSONOutput`)(
  {
    async: S.Literal(true),
    asyncTimeout: S.optional(S.Number),
  },
  $I.annote("AsyncHookJSONOutput", {
    description: "Asynchronous hook runner response payload requesting deferred completion.",
  })
) {}
/**
 * @since 0.0.0
 */
export type AsyncHookJSONOutputEncoded = typeof AsyncHookJSONOutput.Encoded;

/**
 * @since 0.0.0
 */
export const HookJSONOutput = S.Union([AsyncHookJSONOutput, SyncHookJSONOutput]).annotate(
  $I.annote("HookJSONOutput", {
    description: "Union schema for synchronous and asynchronous hook callback results.",
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
      description: "Hook callback function that evaluates hook input and returns JSON output.",
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
export class HookCallbackMatcher extends S.Class<HookCallbackMatcher>($I`HookCallbackMatcher`)(
  {
    matcher: S.optional(S.String),
    hooks: S.Array(HookCallback),
    timeout: S.optional(S.Number),
  },
  $I.annote("HookCallbackMatcher", {
    description: "Matcher entry that binds hook callbacks to an optional filter and timeout.",
  })
) {}
/**
 * @since 0.0.0
 */
export type HookCallbackMatcherEncoded = typeof HookCallbackMatcher.Encoded;
