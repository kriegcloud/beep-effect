import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { sdkMessageParseOptions } from "./Annotations.js";
import { ApiKeySource, ModelUsage, NonNullableUsage, SDKPermissionDenial, UUID } from "./Common.js";
import { BetaMessage, BetaRawMessageStreamEvent, MessageParam } from "./External.js";
import { PermissionMode } from "./Permission.js";

const $I = $AiSdkId.create("core/Schema/Message");

const sdkMessageAnnotation = (name: string, description: string) => ({
  ...$I.annote(name, { description }),
  parseOptions: sdkMessageParseOptions,
});

/**
 * @since 0.0.0
 * @category Validation
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
    description: "Normalized assistant-side failure codes emitted by the SDK.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKAssistantMessageError = typeof SDKAssistantMessageError.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKAssistantMessageErrorEncoded = typeof SDKAssistantMessageError.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKAssistantMessageData extends S.Class<SDKAssistantMessageData>($I`SDKAssistantMessage`)(
  {
    type: S.Literal("assistant"),
    message: BetaMessage,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    error: S.optional(SDKAssistantMessageError),
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation("SDKAssistantMessage", "Assistant turn payload emitted after the model completes a response.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKAssistantMessage = SDKAssistantMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKAssistantMessage = typeof SDKAssistantMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKAssistantMessageEncoded = typeof SDKAssistantMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKAuthStatusMessageData extends S.Class<SDKAuthStatusMessageData>($I`SDKAuthStatusMessage`)(
  {
    type: S.Literal("auth_status"),
    isAuthenticating: S.Boolean,
    output: S.Array(S.String),
    error: S.optional(S.String),
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation(
    "SDKAuthStatusMessage",
    "Authentication status updates emitted while the SDK signs in or reports auth errors."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKAuthStatusMessage = SDKAuthStatusMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKAuthStatusMessage = typeof SDKAuthStatusMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKAuthStatusMessageEncoded = typeof SDKAuthStatusMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKCompactBoundaryMetadata extends S.Class<SDKCompactBoundaryMetadata>($I`SDKCompactBoundaryMetadata`)(
  {
    trigger: LiteralKit(["manual", "auto"]),
    pre_tokens: S.Number,
  },
  $I.annote("SDKCompactBoundaryMetadata", {
    description: "Metadata describing why and when transcript compaction was triggered.",
  })
) {}

class SDKCompactBoundaryMessageData extends S.Class<SDKCompactBoundaryMessageData>($I`SDKCompactBoundaryMessage`)(
  {
    type: S.Literal("system"),
    subtype: S.Literal("compact_boundary"),
    compact_metadata: SDKCompactBoundaryMetadata,
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation(
    "SDKCompactBoundaryMessage",
    "System message emitted when the session crosses a compaction boundary."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKCompactBoundaryMessage = SDKCompactBoundaryMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKCompactBoundaryMessage = typeof SDKCompactBoundaryMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKCompactBoundaryMessageEncoded = typeof SDKCompactBoundaryMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKHookResponseMessageData extends S.Class<SDKHookResponseMessageData>($I`SDKHookResponseMessage`)(
  {
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
  },
  sdkMessageAnnotation(
    "SDKHookResponseMessage",
    "Hook completion payload including final output streams and exit status."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKHookResponseMessage = SDKHookResponseMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKHookResponseMessage = typeof SDKHookResponseMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKHookResponseMessageEncoded = typeof SDKHookResponseMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKHookStartedMessageData extends S.Class<SDKHookStartedMessageData>($I`SDKHookStartedMessage`)(
  {
    type: S.Literal("system"),
    subtype: S.Literal("hook_started"),
    hook_id: S.String,
    hook_name: S.String,
    hook_event: S.String,
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation("SDKHookStartedMessage", "Hook lifecycle event emitted when a hook starts running.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKHookStartedMessage = SDKHookStartedMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKHookStartedMessage = typeof SDKHookStartedMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKHookStartedMessageEncoded = typeof SDKHookStartedMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKHookProgressMessageData extends S.Class<SDKHookProgressMessageData>($I`SDKHookProgressMessage`)(
  {
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
  },
  sdkMessageAnnotation(
    "SDKHookProgressMessage",
    "Hook lifecycle event carrying incremental stdout, stderr, and output updates."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKHookProgressMessage = SDKHookProgressMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKHookProgressMessage = typeof SDKHookProgressMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKHookProgressMessageEncoded = typeof SDKHookProgressMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKPartialAssistantMessageData extends S.Class<SDKPartialAssistantMessageData>($I`SDKPartialAssistantMessage`)(
  {
    type: S.Literal("stream_event"),
    event: BetaRawMessageStreamEvent,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation(
    "SDKPartialAssistantMessage",
    "Streaming assistant event emitted before a final assistant message is assembled."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKPartialAssistantMessage = SDKPartialAssistantMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKPartialAssistantMessage = typeof SDKPartialAssistantMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKPartialAssistantMessageEncoded = typeof SDKPartialAssistantMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKResultSuccessData extends S.Class<SDKResultSuccessData>($I`SDKResultSuccess`)(
  {
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
  },
  sdkMessageAnnotation("SDKResultSuccess", "Successful result payload summarizing an SDK run and its usage.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKResultSuccess = SDKResultSuccessData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKResultSuccess = typeof SDKResultSuccess.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKResultSuccessEncoded = typeof SDKResultSuccess.Encoded;

/**
 * @since 0.0.0
 * @category Validation
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

class SDKResultErrorDuringExecutionData extends S.Class<SDKResultErrorDuringExecutionData>(
  $I`SDKResultErrorDuringExecution`
)(
  {
    ...sdkResultErrorFields,
    subtype: S.Literal("error_during_execution"),
  },
  sdkMessageAnnotation(
    "SDKResultErrorDuringExecution",
    "Result payload emitted when execution fails before producing a successful answer."
  )
) {}

const SDKResultErrorDuringExecution = SDKResultErrorDuringExecutionData;

class SDKResultErrorMaxTurnsData extends S.Class<SDKResultErrorMaxTurnsData>($I`SDKResultErrorMaxTurns`)(
  {
    ...sdkResultErrorFields,
    subtype: S.Literal("error_max_turns"),
  },
  sdkMessageAnnotation(
    "SDKResultErrorMaxTurns",
    "Result payload emitted when the SDK stops after exhausting its maximum turn budget."
  )
) {}

const SDKResultErrorMaxTurns = SDKResultErrorMaxTurnsData;

class SDKResultErrorMaxBudgetData extends S.Class<SDKResultErrorMaxBudgetData>($I`SDKResultErrorMaxBudget`)(
  {
    ...sdkResultErrorFields,
    subtype: S.Literal("error_max_budget_usd"),
  },
  sdkMessageAnnotation(
    "SDKResultErrorMaxBudget",
    "Result payload emitted when the SDK exceeds the configured cost budget."
  )
) {}

const SDKResultErrorMaxBudget = SDKResultErrorMaxBudgetData;

class SDKResultErrorMaxStructuredOutputRetriesData extends S.Class<SDKResultErrorMaxStructuredOutputRetriesData>(
  $I`SDKResultErrorMaxStructuredOutputRetries`
)(
  {
    ...sdkResultErrorFields,
    subtype: S.Literal("error_max_structured_output_retries"),
  },
  sdkMessageAnnotation(
    "SDKResultErrorMaxStructuredOutputRetries",
    "Result payload emitted when structured-output retries are exhausted."
  )
) {}

const SDKResultErrorMaxStructuredOutputRetries = SDKResultErrorMaxStructuredOutputRetriesData;

/**
 * @since 0.0.0
 * @category Validation
 */
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
 * @category Validation
 */
export type SDKResultError = typeof SDKResultError.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKResultErrorEncoded = typeof SDKResultError.Encoded;

/**
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type SDKResultMessage = typeof SDKResultMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKResultMessageEncoded = typeof SDKResultMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKStatus = S.Union([S.Literal("compacting"), S.Null]).annotate(
  $I.annote("SDKStatus", {
    description: "Transient SDK status marker surfaced by system status messages.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKStatus = typeof SDKStatus.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKStatusEncoded = typeof SDKStatus.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKStatusMessageData extends S.Class<SDKStatusMessageData>($I`SDKStatusMessage`)(
  {
    type: S.Literal("system"),
    subtype: S.Literal("status"),
    status: SDKStatus,
    permissionMode: S.optional(PermissionMode),
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation("SDKStatusMessage", "System message reporting transient SDK status changes such as compaction.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKStatusMessage = SDKStatusMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKStatusMessage = typeof SDKStatusMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKStatusMessageEncoded = typeof SDKStatusMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKSystemMcpServer extends S.Class<SDKSystemMcpServer>($I`SDKSystemMcpServer`)(
  {
    name: S.String,
    status: S.String,
  },
  $I.annote("SDKSystemMcpServer", {
    description: "Connected MCP server summary included in SDK initialization messages.",
  })
) {}

class SDKSystemPlugin extends S.Class<SDKSystemPlugin>($I`SDKSystemPlugin`)(
  {
    name: S.String,
    path: FilePath,
  },
  $I.annote("SDKSystemPlugin", {
    description: "Plugin descriptor included in SDK initialization messages.",
  })
) {}

class SDKSystemMessageData extends S.Class<SDKSystemMessageData>($I`SDKSystemMessage`)(
  {
    type: S.Literal("system"),
    subtype: S.Literal("init"),
    agents: S.optional(S.Array(S.String)),
    apiKeySource: ApiKeySource,
    betas: S.optional(S.Array(S.String)),
    claude_code_version: S.String,
    cwd: S.String,
    tools: S.Array(S.String),
    mcp_servers: S.Array(SDKSystemMcpServer),
    model: S.String,
    permissionMode: PermissionMode,
    slash_commands: S.Array(S.String),
    output_style: S.String,
    skills: S.Array(S.String),
    plugins: S.Array(SDKSystemPlugin),
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation(
    "SDKSystemMessage",
    "Initialization message describing SDK capabilities, tools, and environment state."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKSystemMessage = SDKSystemMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKSystemMessage = typeof SDKSystemMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKSystemMessageEncoded = typeof SDKSystemMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKTaskNotificationMessageData extends S.Class<SDKTaskNotificationMessageData>($I`SDKTaskNotificationMessage`)(
  {
    type: S.Literal("system"),
    subtype: S.Literal("task_notification"),
    task_id: S.String,
    status: LiteralKit(["completed", "failed", "stopped"]),
    output_file: FilePath,
    summary: S.String,
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation(
    "SDKTaskNotificationMessage",
    "Task completion notification emitted for delegated background work."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKTaskNotificationMessage = SDKTaskNotificationMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKTaskNotificationMessage = typeof SDKTaskNotificationMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKTaskNotificationMessageEncoded = typeof SDKTaskNotificationMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKTaskStartedMessageData extends S.Class<SDKTaskStartedMessageData>($I`SDKTaskStartedMessage`)(
  {
    type: S.Literal("system"),
    subtype: S.Literal("task_started"),
    task_id: S.String,
    tool_use_id: S.optional(S.String),
    description: S.String,
    task_type: S.optional(S.String),
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation("SDKTaskStartedMessage", "Task lifecycle message emitted when delegated work begins.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKTaskStartedMessage = SDKTaskStartedMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKTaskStartedMessage = typeof SDKTaskStartedMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKTaskStartedMessageEncoded = typeof SDKTaskStartedMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKFilesPersistedFile extends S.Class<SDKFilesPersistedFile>($I`SDKFilesPersistedFile`)(
  {
    filename: S.String,
    file_id: S.String,
  },
  $I.annote("SDKFilesPersistedFile", {
    description: "Persisted file descriptor emitted after storage sync completes.",
  })
) {}

class SDKFilesPersistedFailure extends S.Class<SDKFilesPersistedFailure>($I`SDKFilesPersistedFailure`)(
  {
    filename: S.String,
    error: S.String,
  },
  $I.annote("SDKFilesPersistedFailure", {
    description: "Persisted file failure emitted when a file could not be saved.",
  })
) {}

class SDKFilesPersistedEventData extends S.Class<SDKFilesPersistedEventData>($I`SDKFilesPersistedEvent`)(
  {
    type: S.Literal("system"),
    subtype: S.Literal("files_persisted"),
    files: S.Array(SDKFilesPersistedFile),
    failed: S.Array(SDKFilesPersistedFailure),
    processed_at: S.String,
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation(
    "SDKFilesPersistedEvent",
    "System event summarizing persisted files and failures after storage processing."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKFilesPersistedEvent = SDKFilesPersistedEventData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKFilesPersistedEvent = typeof SDKFilesPersistedEvent.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKFilesPersistedEventEncoded = typeof SDKFilesPersistedEvent.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKToolProgressMessageData extends S.Class<SDKToolProgressMessageData>($I`SDKToolProgressMessage`)(
  {
    type: S.Literal("tool_progress"),
    tool_use_id: S.String,
    tool_name: S.String,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    elapsed_time_seconds: S.Number,
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation(
    "SDKToolProgressMessage",
    "Tool progress message reporting elapsed time for an active tool call."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKToolProgressMessage = SDKToolProgressMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKToolProgressMessage = typeof SDKToolProgressMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKToolProgressMessageEncoded = typeof SDKToolProgressMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKToolUseSummaryMessageData extends S.Class<SDKToolUseSummaryMessageData>($I`SDKToolUseSummaryMessage`)(
  {
    type: S.Literal("tool_use_summary"),
    summary: S.String,
    preceding_tool_use_ids: S.Array(S.String),
    uuid: UUID,
    session_id: S.String,
  },
  sdkMessageAnnotation("SDKToolUseSummaryMessage", "Tool summary message aggregating related tool use identifiers.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKToolUseSummaryMessage = SDKToolUseSummaryMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKToolUseSummaryMessage = typeof SDKToolUseSummaryMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKToolUseSummaryMessageEncoded = typeof SDKToolUseSummaryMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKUserMessageData extends S.Class<SDKUserMessageData>($I`SDKUserMessage`)(
  {
    type: S.Literal("user"),
    message: MessageParam,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    isSynthetic: S.optional(S.Boolean),
    tool_use_result: S.optional(S.Unknown),
    uuid: S.optional(UUID),
    session_id: S.String,
  },
  sdkMessageAnnotation("SDKUserMessage", "User-authored message payload submitted to the SDK session.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKUserMessage = SDKUserMessageData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKUserMessage = typeof SDKUserMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKUserMessageEncoded = typeof SDKUserMessage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class SDKUserMessageReplayData extends S.Class<SDKUserMessageReplayData>($I`SDKUserMessageReplay`)(
  {
    type: S.Literal("user"),
    message: MessageParam,
    parent_tool_use_id: S.Union([S.String, S.Null]),
    isSynthetic: S.optional(S.Boolean),
    tool_use_result: S.optional(S.Unknown),
    uuid: UUID,
    session_id: S.String,
    isReplay: S.Literal(true),
  },
  sdkMessageAnnotation(
    "SDKUserMessageReplay",
    "Replay variant of a user message emitted during transcript restoration."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKUserMessageReplay = SDKUserMessageReplayData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKUserMessageReplay = typeof SDKUserMessageReplay.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKUserMessageReplayEncoded = typeof SDKUserMessageReplay.Encoded;

/**
 * @since 0.0.0
 * @category Validation
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
    description: "Top-level union of assistant, user, system, and lifecycle messages emitted by the SDK.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKMessage = typeof SDKMessage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKMessageEncoded = typeof SDKMessage.Encoded;

const decodeSDKMessageSync = S.decodeUnknownSync(SDKMessage);
const decodeSDKUserMessageSync = S.decodeUnknownSync(SDKUserMessage);

/**
 * @since 0.0.0
 * @category Validation
 */
export const makeSDKMessage = (input: SDKMessage | SDKMessageEncoded): SDKMessage => decodeSDKMessageSync(input);

/**
 * @since 0.0.0
 * @category Validation
 */
export const makeSDKUserMessage = (input: SDKUserMessage | SDKUserMessageEncoded): SDKUserMessage =>
  decodeSDKUserMessageSync(input);

/**
 * @since 0.0.0
 * @category Validation
 */
export const makeUserMessage = (prompt: string): SDKUserMessage =>
  makeSDKUserMessage({
    type: "user",
    session_id: "",
    message: {
      role: "user",
      content: [{ type: "text", text: prompt }],
    },
    parent_tool_use_id: null,
  });
