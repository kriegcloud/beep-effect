import { Match, Stream } from "effect";
import {
  extractResultText as extractResultText_,
  extractTextChunks as extractTextChunks_,
  toTextStream as toTextStream_,
} from "./QuickStart.js";
import type {
  SDKAssistantMessage,
  SDKAuthStatusMessage,
  SDKCompactBoundaryMessage,
  SDKFilesPersistedEvent,
  SDKHookProgressMessage,
  SDKHookResponseMessage,
  SDKHookStartedMessage,
  SDKMessage,
  SDKPartialAssistantMessage,
  SDKResultError,
  SDKResultMessage,
  SDKResultSuccess,
  SDKStatusMessage,
  SDKSystemMessage,
  SDKTaskNotificationMessage,
  SDKTaskStartedMessage,
  SDKToolProgressMessage,
  SDKToolUseSummaryMessage,
  SDKUserMessage,
  SDKUserMessageReplay,
} from "./Schema/Message.js";

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/** Narrows to `SDKAssistantMessage` (`type: "assistant"`). */
/**
 * @since 0.0.0
 */
export const isAssistant = (msg: SDKMessage): msg is SDKAssistantMessage => msg.type === "assistant";

/** Narrows to `SDKPartialAssistantMessage` (`type: "stream_event"`). */
/**
 * @since 0.0.0
 */
export const isStreamEvent = (msg: SDKMessage): msg is SDKPartialAssistantMessage => msg.type === "stream_event";

/** Narrows to `SDKUserMessage | SDKUserMessageReplay` (`type: "user"`). */
/**
 * @since 0.0.0
 */
export const isUser = (msg: SDKMessage): msg is SDKUserMessage | SDKUserMessageReplay => msg.type === "user";

/** Narrows to `SDKResultMessage` (`type: "result"`). */
/**
 * @since 0.0.0
 */
export const isResult = (msg: SDKMessage): msg is SDKResultMessage => msg.type === "result";

/** Narrows to `SDKResultSuccess` (`type: "result"`, `subtype: "success"`). */
/**
 * @since 0.0.0
 */
export const isResultSuccess = (msg: SDKMessage): msg is SDKResultSuccess =>
  msg.type === "result" && msg.subtype === "success";

/** Narrows to `SDKResultError` (`type: "result"`, `subtype !== "success"`). */
/**
 * @since 0.0.0
 */
export const isResultError = (msg: SDKMessage): msg is SDKResultError =>
  msg.type === "result" && msg.subtype !== "success";

/** Narrows to `SDKSystemMessage` (`type: "system"`, `subtype: "init"`). */
/**
 * @since 0.0.0
 */
export const isSystem = (msg: SDKMessage): msg is SDKSystemMessage => msg.type === "system" && msg.subtype === "init";

/** Narrows to `SDKToolProgressMessage` (`type: "tool_progress"`). */
/**
 * @since 0.0.0
 */
export const isToolProgress = (msg: SDKMessage): msg is SDKToolProgressMessage => msg.type === "tool_progress";

/** Narrows to `SDKToolUseSummaryMessage` (`type: "tool_use_summary"`). */
/**
 * @since 0.0.0
 */
export const isToolUseSummary = (msg: SDKMessage): msg is SDKToolUseSummaryMessage => msg.type === "tool_use_summary";

/** Narrows to `SDKAuthStatusMessage` (`type: "auth_status"`). */
/**
 * @since 0.0.0
 */
export const isAuthStatus = (msg: SDKMessage): msg is SDKAuthStatusMessage => msg.type === "auth_status";

// ---------------------------------------------------------------------------
// Stream filter operators
// ---------------------------------------------------------------------------

/** Filter a stream to only `SDKAssistantMessage` events. */
/**
 * @since 0.0.0
 */
export const filterAssistant = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isAssistant));

/** Filter a stream to only `SDKPartialAssistantMessage` (stream_event) events. */
/**
 * @since 0.0.0
 */
export const filterStreamEvents = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isStreamEvent));

/** Filter a stream to only `SDKResultMessage` events. */
/**
 * @since 0.0.0
 */
export const filterResults = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) => stream.pipe(Stream.filter(isResult));

/** Filter a stream to only `SDKResultSuccess` events. */
/**
 * @since 0.0.0
 */
export const filterResultSuccess = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isResultSuccess));

/** Filter a stream to only `SDKResultError` events. */
/**
 * @since 0.0.0
 */
export const filterResultError = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isResultError));

/** Filter a stream to only `SDKUserMessage | SDKUserMessageReplay` events. */
/**
 * @since 0.0.0
 */
export const filterUser = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) => stream.pipe(Stream.filter(isUser));

/** Filter a stream to only `SDKToolProgressMessage` events. */
/**
 * @since 0.0.0
 */
export const filterToolProgress = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isToolProgress));

// ---------------------------------------------------------------------------
// Match utilities
// ---------------------------------------------------------------------------

/**
 * Pre-configured `Match.type<SDKMessage>()` — the starting point for
 * building custom exhaustive or partial matchers.
 *
 * @example
 * ```ts
 * import { MessageFilters } from "effect-claude-agent-sdk"
 * import * as Match from "effect/Match"
 *
 * const handler = MessageFilters.match.pipe(
 *   Match.when({ type: "assistant" }, (msg) => `assistant`),
 *   Match.when({ type: "result", subtype: "success" }, (msg) => `done`),
 *   Match.orElse(() => "other")
 * )
 * ```
 */
/**
 * @since 0.0.0
 */
export const match = Match.type<SDKMessage>();

type SystemLikeMessage =
  | SDKSystemMessage
  | SDKCompactBoundaryMessage
  | SDKStatusMessage
  | SDKHookStartedMessage
  | SDKHookProgressMessage
  | SDKHookResponseMessage
  | SDKTaskNotificationMessage
  | SDKTaskStartedMessage
  | SDKFilesPersistedEvent;

type ToolMessage = SDKToolProgressMessage | SDKToolUseSummaryMessage;

type UserLikeMessage = SDKUserMessage | SDKUserMessageReplay;

/**
 * Exhaustive fold over SDKMessage. All handlers are required.
 * Groups the 15+ variants into 7 logical categories by `type` field.
 */
/**
 * @since 0.0.0
 */
export const fold = <R>(handlers: {
  readonly assistant: (msg: SDKAssistantMessage) => R;
  readonly user: (msg: UserLikeMessage) => R;
  readonly result: (msg: SDKResultMessage) => R;
  readonly system: (msg: SystemLikeMessage) => R;
  readonly stream_event: (msg: SDKPartialAssistantMessage) => R;
  readonly tool: (msg: ToolMessage) => R;
  readonly auth_status: (msg: SDKAuthStatusMessage) => R;
}): ((msg: SDKMessage) => R) => (msg: SDKMessage) => {
  if (isAssistant(msg)) return handlers.assistant(msg);
  if (isUser(msg)) return handlers.user(msg);
  if (isResult(msg)) return handlers.result(msg);
  if (isStreamEvent(msg)) return handlers.stream_event(msg);
  if (isToolProgress(msg) || isToolUseSummary(msg)) return handlers.tool(msg);
  if (isAuthStatus(msg)) return handlers.auth_status(msg);
  if (msg.type === "system") return handlers.system(msg);
  const unexpected: never = msg;
  return unexpected;
};

// ---------------------------------------------------------------------------
// Re-exported text utilities
// ---------------------------------------------------------------------------

/**
 * @since 0.0.0
 */
export const extractResultText = extractResultText_;
/**
 * @since 0.0.0
 */
export const extractTextChunks = extractTextChunks_;
/**
 * @since 0.0.0
 */
export const toTextStream = toTextStream_;
