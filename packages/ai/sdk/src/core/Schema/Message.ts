import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { withSdkMessage } from "./Annotations.js";
import { ApiKeySource, ModelUsage, NonNullableUsage, SDKPermissionDenial, UUID } from "./Common.js";
import { BetaMessage, BetaRawMessageStreamEvent, MessageParam } from "./External.js";
import { PermissionMode } from "./Permission.js";

const $I = $AiSdkId.create("core/Schema/Message");

/**
 * @since 0.0.0
 */
export const SDKAssistantMessageError = LiteralKit([
  "authentication_failed",
  "billing_error",
  "rate_limit",
  "invalid_request",
  "server_error",
  "unknown",
  "max_output_tokens",
]).annotate(
  $I.annote("SDKAssistantMessageError", {
    description: "Schema for SDKAssistantMessageError.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKAssistantMessageError = typeof SDKAssistantMessageError.Type;
/**
 * @since 0.0.0
 */
export type SDKAssistantMessageErrorEncoded = typeof SDKAssistantMessageError.Encoded;

/**
 * @since 0.0.0
 */
export const SDKAssistantMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("assistant"),
    message: BetaMessage,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    error: S.optional(SDKAssistantMessageError),
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKAssistantMessage", {
    description: "Schema for SDKAssistantMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKAssistantMessage = typeof SDKAssistantMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKAssistantMessageEncoded = typeof SDKAssistantMessage.Encoded;

/**
 * @since 0.0.0
 */
export const SDKAuthStatusMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("auth_status"),
    isAuthenticating: S.Boolean,
    output: S.Array(S.String),
    error: S.optional(S.String),
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKAuthStatusMessage", {
    description: "Schema for SDKAuthStatusMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKAuthStatusMessage = typeof SDKAuthStatusMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKAuthStatusMessageEncoded = typeof SDKAuthStatusMessage.Encoded;

/**
 * @since 0.0.0
 */
export const SDKCompactBoundaryMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("compact_boundary"),
    compact_metadata: S.Struct({
      trigger: LiteralKit(["manual", "auto"]),
      pre_tokens: S.Number,
    }),
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKCompactBoundaryMessage", {
    description: "Schema for SDKCompactBoundaryMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKCompactBoundaryMessage = typeof SDKCompactBoundaryMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKCompactBoundaryMessageEncoded = typeof SDKCompactBoundaryMessage.Encoded;

/**
 * @since 0.0.0
 */
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
    outcome: LiteralKit(["success", "error", "cancelled"]),
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKHookResponseMessage", {
    description: "Schema for SDKHookResponseMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKHookResponseMessage = typeof SDKHookResponseMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKHookResponseMessageEncoded = typeof SDKHookResponseMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKHookStartedMessage", {
    description: "Schema for SDKHookStartedMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKHookStartedMessage = typeof SDKHookStartedMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKHookStartedMessageEncoded = typeof SDKHookStartedMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKHookProgressMessage", {
    description: "Schema for SDKHookProgressMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKHookProgressMessage = typeof SDKHookProgressMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKHookProgressMessageEncoded = typeof SDKHookProgressMessage.Encoded;

/**
 * @since 0.0.0
 */
export const SDKPartialAssistantMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("stream_event"),
    event: BetaRawMessageStreamEvent,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKPartialAssistantMessage", {
    description: "Schema for SDKPartialAssistantMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKPartialAssistantMessage = typeof SDKPartialAssistantMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKPartialAssistantMessageEncoded = typeof SDKPartialAssistantMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKResultSuccess", {
    description: "Schema for SDKResultSuccess.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKResultSuccess = typeof SDKResultSuccess.Type;
/**
 * @since 0.0.0
 */
export type SDKResultSuccessEncoded = typeof SDKResultSuccess.Encoded;

/**
 * @since 0.0.0
 */
const sdkResultErrorFields = {
  type: S.Literal("result"),
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
} as const;

const SDKResultErrorDuringExecution = withSdkMessage(
  S.Struct({
    ...sdkResultErrorFields,
    subtype: S.Literal("error_during_execution"),
  }),
  $I.annote("SDKResultErrorDuringExecution", {
    description: "Schema for SDK result execution errors.",
  })
);

const SDKResultErrorMaxTurns = withSdkMessage(
  S.Struct({
    ...sdkResultErrorFields,
    subtype: S.Literal("error_max_turns"),
  }),
  $I.annote("SDKResultErrorMaxTurns", {
    description: "Schema for SDK result max-turn errors.",
  })
);

const SDKResultErrorMaxBudget = withSdkMessage(
  S.Struct({
    ...sdkResultErrorFields,
    subtype: S.Literal("error_max_budget_usd"),
  }),
  $I.annote("SDKResultErrorMaxBudget", {
    description: "Schema for SDK result budget-limit errors.",
  })
);

const SDKResultErrorMaxStructuredOutputRetries = withSdkMessage(
  S.Struct({
    ...sdkResultErrorFields,
    subtype: S.Literal("error_max_structured_output_retries"),
  }),
  $I.annote("SDKResultErrorMaxStructuredOutputRetries", {
    description: "Schema for SDK result structured output retry-limit errors.",
  })
);

export const SDKResultError = S.Union([
  SDKResultErrorDuringExecution,
  SDKResultErrorMaxTurns,
  SDKResultErrorMaxBudget,
  SDKResultErrorMaxStructuredOutputRetries,
]).pipe(
  S.toTaggedUnion("subtype"),
  S.annotate(
    $I.annote("SDKResultError", {
      description: "Tagged union schema for SDKResultError variants.",
    })
  )
);

/**
 * @since 0.0.0
 */
export type SDKResultError = typeof SDKResultError.Type;
/**
 * @since 0.0.0
 */
export type SDKResultErrorEncoded = typeof SDKResultError.Encoded;

/**
 * @since 0.0.0
 */
export const SDKResultMessage = S.Union([
  SDKResultSuccess,
  SDKResultErrorDuringExecution,
  SDKResultErrorMaxTurns,
  SDKResultErrorMaxBudget,
  SDKResultErrorMaxStructuredOutputRetries,
]).pipe(
  S.toTaggedUnion("subtype"),
  S.annotate(
    $I.annote("SDKResultMessage", {
      description: "Tagged union schema for result message variants.",
    })
  )
);

/**
 * @since 0.0.0
 */
export type SDKResultMessage = typeof SDKResultMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKResultMessageEncoded = typeof SDKResultMessage.Encoded;

/**
 * @since 0.0.0
 */
export const SDKStatus = S.Union([S.Literal("compacting"), S.Null]).annotate(
  $I.annote("SDKStatus", {
    description: "Schema for SDKStatus.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKStatus = typeof SDKStatus.Type;
/**
 * @since 0.0.0
 */
export type SDKStatusEncoded = typeof SDKStatus.Encoded;

/**
 * @since 0.0.0
 */
export const SDKStatusMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("status"),
    status: SDKStatus,
    permissionMode: S.optional(PermissionMode),
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKStatusMessage", {
    description: "Schema for SDKStatusMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKStatusMessage = typeof SDKStatusMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKStatusMessageEncoded = typeof SDKStatusMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKSystemMessage", {
    description: "Schema for SDKSystemMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKSystemMessage = typeof SDKSystemMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKSystemMessageEncoded = typeof SDKSystemMessage.Encoded;

/**
 * @since 0.0.0
 */
export const SDKTaskNotificationMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("system"),
    subtype: S.Literal("task_notification"),
    task_id: S.String,
    status: LiteralKit(["completed", "failed", "stopped"]),
    output_file: S.String,
    summary: S.String,
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKTaskNotificationMessage", {
    description: "Schema for SDKTaskNotificationMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKTaskNotificationMessage = typeof SDKTaskNotificationMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKTaskNotificationMessageEncoded = typeof SDKTaskNotificationMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKTaskStartedMessage", {
    description: "Schema for SDKTaskStartedMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKTaskStartedMessage = typeof SDKTaskStartedMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKTaskStartedMessageEncoded = typeof SDKTaskStartedMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKFilesPersistedEvent", {
    description: "Schema for SDKFilesPersistedEvent.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKFilesPersistedEvent = typeof SDKFilesPersistedEvent.Type;
/**
 * @since 0.0.0
 */
export type SDKFilesPersistedEventEncoded = typeof SDKFilesPersistedEvent.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKToolProgressMessage", {
    description: "Schema for SDKToolProgressMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKToolProgressMessage = typeof SDKToolProgressMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKToolProgressMessageEncoded = typeof SDKToolProgressMessage.Encoded;

/**
 * @since 0.0.0
 */
export const SDKToolUseSummaryMessage = withSdkMessage(
  S.Struct({
    type: S.Literal("tool_use_summary"),
    summary: S.String,
    preceding_tool_use_ids: S.Array(S.String),
    uuid: UUID,
    session_id: S.String,
  }),
  $I.annote("SDKToolUseSummaryMessage", {
    description: "Schema for SDKToolUseSummaryMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKToolUseSummaryMessage = typeof SDKToolUseSummaryMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKToolUseSummaryMessageEncoded = typeof SDKToolUseSummaryMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKUserMessage", {
    description: "Schema for SDKUserMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKUserMessage = typeof SDKUserMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKUserMessageEncoded = typeof SDKUserMessage.Encoded;

/**
 * @since 0.0.0
 */
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
  $I.annote("SDKUserMessageReplay", {
    description: "Schema for SDKUserMessageReplay.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKUserMessageReplay = typeof SDKUserMessageReplay.Type;
/**
 * @since 0.0.0
 */
export type SDKUserMessageReplayEncoded = typeof SDKUserMessageReplay.Encoded;

/**
 * @since 0.0.0
 */
export const SDKMessage = S.Union([
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
]).annotate(
  $I.annote("SDKMessage", {
    description: "Schema for SDKMessage.",
  })
);

/**
 * @since 0.0.0
 */
export type SDKMessage = typeof SDKMessage.Type;
/**
 * @since 0.0.0
 */
export type SDKMessageEncoded = typeof SDKMessage.Encoded;
