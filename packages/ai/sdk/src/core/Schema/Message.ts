import * as S from "effect/Schema";
import { withIdentifier, withSdkMessage } from "./Annotations.js";
import { ApiKeySource, ModelUsage, NonNullableUsage, SDKPermissionDenial, UUID } from "./Common.js";
import { BetaMessage, BetaRawMessageStreamEvent, MessageParam } from "./External.js";
import { PermissionMode } from "./Permission.js";

export const SDKAssistantMessageError = withIdentifier(
  S.Literals([
    "authentication_failed",
    "billing_error",
    "rate_limit",
    "invalid_request",
    "server_error",
    "unknown",
    "max_output_tokens",
  ]),
  "SDKAssistantMessageError"
);

export type SDKAssistantMessageError = typeof SDKAssistantMessageError.Type;
export type SDKAssistantMessageErrorEncoded = typeof SDKAssistantMessageError.Encoded;

export const SDKAssistantMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("assistant"),
    message: BetaMessage,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    error: S.optional(SDKAssistantMessageError),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKAssistantMessage"
);

export type SDKAssistantMessage = typeof SDKAssistantMessage.Type;
export type SDKAssistantMessageEncoded = typeof SDKAssistantMessage.Encoded;

export const SDKAuthStatusMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("auth_status"),
    isAuthenticating: S.Boolean,
    output: S.Array(S.String),
    error: S.optional(S.String),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKAuthStatusMessage"
);

export type SDKAuthStatusMessage = typeof SDKAuthStatusMessage.Type;
export type SDKAuthStatusMessageEncoded = typeof SDKAuthStatusMessage.Encoded;

export const SDKCompactBoundaryMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("compact_boundary"),
    compact_metadata: S.Struct({
      trigger: S.Literals(["manual", "auto"]),
      pre_tokens: S.Number,
    }),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKCompactBoundaryMessage"
);

export type SDKCompactBoundaryMessage = typeof SDKCompactBoundaryMessage.Type;
export type SDKCompactBoundaryMessageEncoded = typeof SDKCompactBoundaryMessage.Encoded;

export const SDKHookResponseMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("hook_response"),
    hook_id: S.String,
    hook_name: S.String,
    hook_event: S.String,
    output: S.String,
    stdout: S.String,
    stderr: S.String,
    exit_code: S.optional(S.Number),
    outcome: S.Literals(["success", "error", "cancelled"]),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKHookResponseMessage"
);

export type SDKHookResponseMessage = typeof SDKHookResponseMessage.Type;
export type SDKHookResponseMessageEncoded = typeof SDKHookResponseMessage.Encoded;

export const SDKHookStartedMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("hook_started"),
    hook_id: S.String,
    hook_name: S.String,
    hook_event: S.String,
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKHookStartedMessage"
);

export type SDKHookStartedMessage = typeof SDKHookStartedMessage.Type;
export type SDKHookStartedMessageEncoded = typeof SDKHookStartedMessage.Encoded;

export const SDKHookProgressMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("hook_progress"),
    hook_id: S.String,
    hook_name: S.String,
    hook_event: S.String,
    stdout: S.String,
    stderr: S.String,
    output: S.String,
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKHookProgressMessage"
);

export type SDKHookProgressMessage = typeof SDKHookProgressMessage.Type;
export type SDKHookProgressMessageEncoded = typeof SDKHookProgressMessage.Encoded;

export const SDKPartialAssistantMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("stream_event"),
    event: BetaRawMessageStreamEvent,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKPartialAssistantMessage"
);

export type SDKPartialAssistantMessage = typeof SDKPartialAssistantMessage.Type;
export type SDKPartialAssistantMessageEncoded = typeof SDKPartialAssistantMessage.Encoded;

export const SDKResultSuccess = withSdkMessage(
  S.Struct({
    type: S.Literal("result"),
    subtype: S.Literal("success"),
    duration_ms: S.Number,
    duration_api_ms: S.Number,
    is_error: S.Boolean,
    num_turns: S.Number,
    result: S.String,
    stop_reason: S.optional(S.Union([S.String, S.Null])),
    total_cost_usd: S.Number,
    usage: NonNullableUsage,
    modelUsage: S.Record(S.String, ModelUsage),
    permission_denials: S.Array(SDKPermissionDenial),
    structured_output: S.optional(S.Unknown),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKResultSuccess"
);

export type SDKResultSuccess = typeof SDKResultSuccess.Type;
export type SDKResultSuccessEncoded = typeof SDKResultSuccess.Encoded;

export const SDKResultError = withSdkMessage(
  S.Struct({
    type: S.Literal("result"),
    subtype: S.Literals([
      "error_during_execution",
      "error_max_turns",
      "error_max_budget_usd",
      "error_max_structured_output_retries",
    ]),
    duration_ms: S.Number,
    duration_api_ms: S.Number,
    is_error: S.Boolean,
    num_turns: S.Number,
    stop_reason: S.optional(S.Union([S.String, S.Null])),
    total_cost_usd: S.Number,
    usage: NonNullableUsage,
    modelUsage: S.Record(S.String, ModelUsage),
    permission_denials: S.Array(SDKPermissionDenial),
    errors: S.Array(S.String),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKResultError"
);

export type SDKResultError = typeof SDKResultError.Type;
export type SDKResultErrorEncoded = typeof SDKResultError.Encoded;

export const SDKResultMessage = withIdentifier(S.Union([SDKResultSuccess, SDKResultError]), "SDKResultMessage");

export type SDKResultMessage = typeof SDKResultMessage.Type;
export type SDKResultMessageEncoded = typeof SDKResultMessage.Encoded;

export const SDKStatus = withIdentifier(S.Union([S.Literal("compacting"), S.Null]), "SDKStatus");

export type SDKStatus = typeof SDKStatus.Type;
export type SDKStatusEncoded = typeof SDKStatus.Encoded;

export const SDKStatusMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("status"),
    status: SDKStatus,
    permissionMode: S.optional(PermissionMode),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKStatusMessage"
);

export type SDKStatusMessage = typeof SDKStatusMessage.Type;
export type SDKStatusMessageEncoded = typeof SDKStatusMessage.Encoded;

export const SDKSystemMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("init"),
    agents: S.optional(S.Array(S.String)),
    apiKeySource: ApiKeySource,
    betas: S.optional(S.Array(S.String)),
    claude_code_version: S.String,
    cwd: S.String,
    tools: S.Array(S.String),
    mcp_servers: S.Array(
      S.Struct({
        name: S.String,
        status: S.String,
      })
    ),
    model: S.String,
    permissionMode: PermissionMode,
    slash_commands: S.Array(S.String),
    output_style: S.String,
    skills: S.Array(S.String),
    plugins: S.Array(
      S.Struct({
        name: S.String,
        path: S.String,
      })
    ),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKSystemMessage"
);

export type SDKSystemMessage = typeof SDKSystemMessage.Type;
export type SDKSystemMessageEncoded = typeof SDKSystemMessage.Encoded;

export const SDKTaskNotificationMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("task_notification"),
    task_id: S.String,
    status: S.Literals(["completed", "failed", "stopped"]),
    output_file: S.String,
    summary: S.String,
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKTaskNotificationMessage"
);

export type SDKTaskNotificationMessage = typeof SDKTaskNotificationMessage.Type;
export type SDKTaskNotificationMessageEncoded = typeof SDKTaskNotificationMessage.Encoded;

export const SDKTaskStartedMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("task_started"),
    task_id: S.String,
    tool_use_id: S.optional(S.String),
    description: S.String,
    task_type: S.optional(S.String),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKTaskStartedMessage"
);

export type SDKTaskStartedMessage = typeof SDKTaskStartedMessage.Type;
export type SDKTaskStartedMessageEncoded = typeof SDKTaskStartedMessage.Encoded;

export const SDKFilesPersistedEvent = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("files_persisted"),
    files: S.Array(
      S.Struct({
        filename: S.String,
        file_id: S.String,
      })
    ),
    failed: S.Array(
      S.Struct({
        filename: S.String,
        error: S.String,
      })
    ),
    processed_at: S.String,
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKFilesPersistedEvent"
);

export type SDKFilesPersistedEvent = typeof SDKFilesPersistedEvent.Type;
export type SDKFilesPersistedEventEncoded = typeof SDKFilesPersistedEvent.Encoded;

export const SDKToolProgressMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("tool_progress"),
    tool_use_id: S.String,
    tool_name: S.String,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    elapsed_time_seconds: S.Number,
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKToolProgressMessage"
);

export type SDKToolProgressMessage = typeof SDKToolProgressMessage.Type;
export type SDKToolProgressMessageEncoded = typeof SDKToolProgressMessage.Encoded;

export const SDKToolUseSummaryMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("tool_use_summary"),
    summary: S.String,
    preceding_tool_use_ids: S.Array(S.String),
    uuid: UUID,
    session_id: S.String,
  }),
  "SDKToolUseSummaryMessage"
);

export type SDKToolUseSummaryMessage = typeof SDKToolUseSummaryMessage.Type;
export type SDKToolUseSummaryMessageEncoded = typeof SDKToolUseSummaryMessage.Encoded;

export const SDKUserMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("user"),
    message: MessageParam,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    isSynthetic: S.optional(S.Boolean),
    tool_use_result: S.optional(S.Unknown),
    uuid: S.optional(UUID),
    session_id: S.String,
  }),
  "SDKUserMessage"
);

export type SDKUserMessage = typeof SDKUserMessage.Type;
export type SDKUserMessageEncoded = typeof SDKUserMessage.Encoded;

export const SDKUserMessageReplay = withSdkMessage(
  S.Struct({
    type: S.Literal("user"),
    message: MessageParam,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    isSynthetic: S.optional(S.Boolean),
    tool_use_result: S.optional(S.Unknown),
    uuid: UUID,
    session_id: S.String,
    isReplay: S.Literal(true),
  }),
  "SDKUserMessageReplay"
);

export type SDKUserMessageReplay = typeof SDKUserMessageReplay.Type;
export type SDKUserMessageReplayEncoded = typeof SDKUserMessageReplay.Encoded;

export const SDKMessage = withIdentifier(
  S.Union([
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
    SDKFilesPersistedEvent,
  ]),
  "SDKMessage"
);

export type SDKMessage = typeof SDKMessage.Type;
export type SDKMessageEncoded = typeof SDKMessage.Encoded;
