import * as Schema from "effect/Schema"
import { withIdentifier, withSdkMessage } from "./Annotations.js"
import {
  ApiKeySource,
  ModelUsage,
  NonNullableUsage,
  SDKPermissionDenial,
  UUID
} from "./Common.js"
import { BetaMessage, BetaRawMessageStreamEvent, MessageParam } from "./External.js"
import { PermissionMode } from "./Permission.js"

export const SDKAssistantMessageError = withIdentifier(
  Schema.Literal(
    "authentication_failed",
    "billing_error",
    "rate_limit",
    "invalid_request",
    "server_error",
    "unknown",
    "max_output_tokens"
  ),
  "SDKAssistantMessageError"
)

export type SDKAssistantMessageError = typeof SDKAssistantMessageError.Type
export type SDKAssistantMessageErrorEncoded = typeof SDKAssistantMessageError.Encoded

export const SDKAssistantMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("assistant"),
    message: BetaMessage,
    parent_tool_use_id: Schema.Union(Schema.String, Schema.Null),
    error: Schema.optional(SDKAssistantMessageError),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKAssistantMessage"
)

export type SDKAssistantMessage = typeof SDKAssistantMessage.Type
export type SDKAssistantMessageEncoded = typeof SDKAssistantMessage.Encoded

export const SDKAuthStatusMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("auth_status"),
    isAuthenticating: Schema.Boolean,
    output: Schema.Array(Schema.String),
    error: Schema.optional(Schema.String),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKAuthStatusMessage"
)

export type SDKAuthStatusMessage = typeof SDKAuthStatusMessage.Type
export type SDKAuthStatusMessageEncoded = typeof SDKAuthStatusMessage.Encoded

export const SDKCompactBoundaryMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("compact_boundary"),
    compact_metadata: Schema.Struct({
      trigger: Schema.Literal("manual", "auto"),
      pre_tokens: Schema.Number
    }),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKCompactBoundaryMessage"
)

export type SDKCompactBoundaryMessage = typeof SDKCompactBoundaryMessage.Type
export type SDKCompactBoundaryMessageEncoded = typeof SDKCompactBoundaryMessage.Encoded

export const SDKHookResponseMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("hook_response"),
    hook_id: Schema.String,
    hook_name: Schema.String,
    hook_event: Schema.String,
    output: Schema.String,
    stdout: Schema.String,
    stderr: Schema.String,
    exit_code: Schema.optional(Schema.Number),
    outcome: Schema.Literal("success", "error", "cancelled"),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKHookResponseMessage"
)

export type SDKHookResponseMessage = typeof SDKHookResponseMessage.Type
export type SDKHookResponseMessageEncoded = typeof SDKHookResponseMessage.Encoded

export const SDKHookStartedMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("hook_started"),
    hook_id: Schema.String,
    hook_name: Schema.String,
    hook_event: Schema.String,
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKHookStartedMessage"
)

export type SDKHookStartedMessage = typeof SDKHookStartedMessage.Type
export type SDKHookStartedMessageEncoded = typeof SDKHookStartedMessage.Encoded

export const SDKHookProgressMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("hook_progress"),
    hook_id: Schema.String,
    hook_name: Schema.String,
    hook_event: Schema.String,
    stdout: Schema.String,
    stderr: Schema.String,
    output: Schema.String,
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKHookProgressMessage"
)

export type SDKHookProgressMessage = typeof SDKHookProgressMessage.Type
export type SDKHookProgressMessageEncoded = typeof SDKHookProgressMessage.Encoded

export const SDKPartialAssistantMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("stream_event"),
    event: BetaRawMessageStreamEvent,
    parent_tool_use_id: Schema.Union(Schema.String, Schema.Null),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKPartialAssistantMessage"
)

export type SDKPartialAssistantMessage = typeof SDKPartialAssistantMessage.Type
export type SDKPartialAssistantMessageEncoded = typeof SDKPartialAssistantMessage.Encoded

export const SDKResultSuccess = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("result"),
    subtype: Schema.Literal("success"),
    duration_ms: Schema.Number,
    duration_api_ms: Schema.Number,
    is_error: Schema.Boolean,
    num_turns: Schema.Number,
    result: Schema.String,
    stop_reason: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
    total_cost_usd: Schema.Number,
    usage: NonNullableUsage,
    modelUsage: Schema.Record({ key: Schema.String, value: ModelUsage }),
    permission_denials: Schema.Array(SDKPermissionDenial),
    structured_output: Schema.optional(Schema.Unknown),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKResultSuccess"
)

export type SDKResultSuccess = typeof SDKResultSuccess.Type
export type SDKResultSuccessEncoded = typeof SDKResultSuccess.Encoded

export const SDKResultError = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("result"),
    subtype: Schema.Literal(
      "error_during_execution",
      "error_max_turns",
      "error_max_budget_usd",
      "error_max_structured_output_retries"
    ),
    duration_ms: Schema.Number,
    duration_api_ms: Schema.Number,
    is_error: Schema.Boolean,
    num_turns: Schema.Number,
    stop_reason: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
    total_cost_usd: Schema.Number,
    usage: NonNullableUsage,
    modelUsage: Schema.Record({ key: Schema.String, value: ModelUsage }),
    permission_denials: Schema.Array(SDKPermissionDenial),
    errors: Schema.Array(Schema.String),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKResultError"
)

export type SDKResultError = typeof SDKResultError.Type
export type SDKResultErrorEncoded = typeof SDKResultError.Encoded

export const SDKResultMessage = withIdentifier(
  Schema.Union(SDKResultSuccess, SDKResultError),
  "SDKResultMessage"
)

export type SDKResultMessage = typeof SDKResultMessage.Type
export type SDKResultMessageEncoded = typeof SDKResultMessage.Encoded

export const SDKStatus = withIdentifier(
  Schema.Union(Schema.Literal("compacting"), Schema.Null),
  "SDKStatus"
)

export type SDKStatus = typeof SDKStatus.Type
export type SDKStatusEncoded = typeof SDKStatus.Encoded

export const SDKStatusMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("status"),
    status: SDKStatus,
    permissionMode: Schema.optional(PermissionMode),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKStatusMessage"
)

export type SDKStatusMessage = typeof SDKStatusMessage.Type
export type SDKStatusMessageEncoded = typeof SDKStatusMessage.Encoded

export const SDKSystemMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("init"),
    agents: Schema.optional(Schema.Array(Schema.String)),
    apiKeySource: ApiKeySource,
    betas: Schema.optional(Schema.Array(Schema.String)),
    claude_code_version: Schema.String,
    cwd: Schema.String,
    tools: Schema.Array(Schema.String),
    mcp_servers: Schema.Array(
      Schema.Struct({
        name: Schema.String,
        status: Schema.String
      })
    ),
    model: Schema.String,
    permissionMode: PermissionMode,
    slash_commands: Schema.Array(Schema.String),
    output_style: Schema.String,
    skills: Schema.Array(Schema.String),
    plugins: Schema.Array(
      Schema.Struct({
        name: Schema.String,
        path: Schema.String
      })
    ),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKSystemMessage"
)

export type SDKSystemMessage = typeof SDKSystemMessage.Type
export type SDKSystemMessageEncoded = typeof SDKSystemMessage.Encoded

export const SDKTaskNotificationMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("task_notification"),
    task_id: Schema.String,
    status: Schema.Literal("completed", "failed", "stopped"),
    output_file: Schema.String,
    summary: Schema.String,
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKTaskNotificationMessage"
)

export type SDKTaskNotificationMessage = typeof SDKTaskNotificationMessage.Type
export type SDKTaskNotificationMessageEncoded = typeof SDKTaskNotificationMessage.Encoded

export const SDKTaskStartedMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("task_started"),
    task_id: Schema.String,
    tool_use_id: Schema.optional(Schema.String),
    description: Schema.String,
    task_type: Schema.optional(Schema.String),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKTaskStartedMessage"
)

export type SDKTaskStartedMessage = typeof SDKTaskStartedMessage.Type
export type SDKTaskStartedMessageEncoded = typeof SDKTaskStartedMessage.Encoded

export const SDKFilesPersistedEvent = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("system"),
    subtype: Schema.Literal("files_persisted"),
    files: Schema.Array(
      Schema.Struct({
        filename: Schema.String,
        file_id: Schema.String
      })
    ),
    failed: Schema.Array(
      Schema.Struct({
        filename: Schema.String,
        error: Schema.String
      })
    ),
    processed_at: Schema.String,
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKFilesPersistedEvent"
)

export type SDKFilesPersistedEvent = typeof SDKFilesPersistedEvent.Type
export type SDKFilesPersistedEventEncoded = typeof SDKFilesPersistedEvent.Encoded

export const SDKToolProgressMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("tool_progress"),
    tool_use_id: Schema.String,
    tool_name: Schema.String,
    parent_tool_use_id: Schema.Union(Schema.String, Schema.Null),
    elapsed_time_seconds: Schema.Number,
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKToolProgressMessage"
)

export type SDKToolProgressMessage = typeof SDKToolProgressMessage.Type
export type SDKToolProgressMessageEncoded = typeof SDKToolProgressMessage.Encoded

export const SDKToolUseSummaryMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("tool_use_summary"),
    summary: Schema.String,
    preceding_tool_use_ids: Schema.Array(Schema.String),
    uuid: UUID,
    session_id: Schema.String
  }),
  "SDKToolUseSummaryMessage"
)

export type SDKToolUseSummaryMessage = typeof SDKToolUseSummaryMessage.Type
export type SDKToolUseSummaryMessageEncoded = typeof SDKToolUseSummaryMessage.Encoded

export const SDKUserMessage = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("user"),
    message: MessageParam,
    parent_tool_use_id: Schema.Union(Schema.String, Schema.Null),
    isSynthetic: Schema.optional(Schema.Boolean),
    tool_use_result: Schema.optional(Schema.Unknown),
    uuid: Schema.optional(UUID),
    session_id: Schema.String
  }),
  "SDKUserMessage"
)

export type SDKUserMessage = typeof SDKUserMessage.Type
export type SDKUserMessageEncoded = typeof SDKUserMessage.Encoded

export const SDKUserMessageReplay = withSdkMessage(
  Schema.Struct({
    type: Schema.Literal("user"),
    message: MessageParam,
    parent_tool_use_id: Schema.Union(Schema.String, Schema.Null),
    isSynthetic: Schema.optional(Schema.Boolean),
    tool_use_result: Schema.optional(Schema.Unknown),
    uuid: UUID,
    session_id: Schema.String,
    isReplay: Schema.Literal(true)
  }),
  "SDKUserMessageReplay"
)

export type SDKUserMessageReplay = typeof SDKUserMessageReplay.Type
export type SDKUserMessageReplayEncoded = typeof SDKUserMessageReplay.Encoded

export const SDKMessage = withIdentifier(
  Schema.Union(
    SDKAssistantMessage,
    SDKUserMessage,
    SDKUserMessageReplay,
    SDKResultMessage,
    SDKSystemMessage,
    SDKPartialAssistantMessage,
    SDKCompactBoundaryMessage,
    SDKStatusMessage,
    SDKHookStartedMessage,
    SDKHookProgressMessage,
    SDKHookResponseMessage,
    SDKToolProgressMessage,
    SDKToolUseSummaryMessage,
    SDKAuthStatusMessage,
    SDKTaskNotificationMessage,
    SDKTaskStartedMessage,
    SDKFilesPersistedEvent
  ),
  "SDKMessage"
)

export type SDKMessage = typeof SDKMessage.Type
export type SDKMessageEncoded = typeof SDKMessage.Encoded
