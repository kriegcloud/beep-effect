/**
 * Type guards, stream filters, and Match utilities for SDKMessage.
 *
 * @since 0.5.0
 */
import * as Match from "effect/Match"
import * as Stream from "effect/Stream"
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
  SDKUserMessageReplay
} from "./Schema/Message.js"

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/** Narrows to `SDKAssistantMessage` (`type: "assistant"`). */
export const isAssistant = (msg: SDKMessage): msg is SDKAssistantMessage =>
  msg.type === "assistant"

/** Narrows to `SDKPartialAssistantMessage` (`type: "stream_event"`). */
export const isStreamEvent = (msg: SDKMessage): msg is SDKPartialAssistantMessage =>
  msg.type === "stream_event"

/** Narrows to `SDKUserMessage | SDKUserMessageReplay` (`type: "user"`). */
export const isUser = (msg: SDKMessage): msg is SDKUserMessage | SDKUserMessageReplay =>
  msg.type === "user"

/** Narrows to `SDKResultMessage` (`type: "result"`). */
export const isResult = (msg: SDKMessage): msg is SDKResultMessage =>
  msg.type === "result"

/** Narrows to `SDKResultSuccess` (`type: "result"`, `subtype: "success"`). */
export const isResultSuccess = (msg: SDKMessage): msg is SDKResultSuccess =>
  msg.type === "result" && msg.subtype === "success"

/** Narrows to `SDKResultError` (`type: "result"`, `subtype !== "success"`). */
export const isResultError = (msg: SDKMessage): msg is SDKResultError =>
  msg.type === "result" && msg.subtype !== "success"

/** Narrows to `SDKSystemMessage` (`type: "system"`, `subtype: "init"`). */
export const isSystem = (msg: SDKMessage): msg is SDKSystemMessage =>
  msg.type === "system" && msg.subtype === "init"

/** Narrows to `SDKToolProgressMessage` (`type: "tool_progress"`). */
export const isToolProgress = (msg: SDKMessage): msg is SDKToolProgressMessage =>
  msg.type === "tool_progress"

/** Narrows to `SDKToolUseSummaryMessage` (`type: "tool_use_summary"`). */
export const isToolUseSummary = (msg: SDKMessage): msg is SDKToolUseSummaryMessage =>
  msg.type === "tool_use_summary"

/** Narrows to `SDKAuthStatusMessage` (`type: "auth_status"`). */
export const isAuthStatus = (msg: SDKMessage): msg is SDKAuthStatusMessage =>
  msg.type === "auth_status"

// ---------------------------------------------------------------------------
// Stream filter operators
// ---------------------------------------------------------------------------

/** Filter a stream to only `SDKAssistantMessage` events. */
export const filterAssistant = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isAssistant))

/** Filter a stream to only `SDKPartialAssistantMessage` (stream_event) events. */
export const filterStreamEvents = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isStreamEvent))

/** Filter a stream to only `SDKResultMessage` events. */
export const filterResults = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isResult))

/** Filter a stream to only `SDKResultSuccess` events. */
export const filterResultSuccess = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isResultSuccess))

/** Filter a stream to only `SDKResultError` events. */
export const filterResultError = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isResultError))

/** Filter a stream to only `SDKUserMessage | SDKUserMessageReplay` events. */
export const filterUser = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isUser))

/** Filter a stream to only `SDKToolProgressMessage` events. */
export const filterToolProgress = <E, R>(stream: Stream.Stream<SDKMessage, E, R>) =>
  stream.pipe(Stream.filter(isToolProgress))

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
export const match = Match.type<SDKMessage>()

type SystemLikeMessage =
  | SDKSystemMessage
  | SDKCompactBoundaryMessage
  | SDKStatusMessage
  | SDKHookStartedMessage
  | SDKHookProgressMessage
  | SDKHookResponseMessage
  | SDKTaskNotificationMessage
  | SDKTaskStartedMessage
  | SDKFilesPersistedEvent

type ToolMessage = SDKToolProgressMessage | SDKToolUseSummaryMessage

type UserLikeMessage = SDKUserMessage | SDKUserMessageReplay

/**
 * Exhaustive fold over SDKMessage. All handlers are required.
 * Groups the 15+ variants into 7 logical categories by `type` field.
 */
export const fold = <R>(handlers: {
  readonly assistant: (msg: SDKAssistantMessage) => R
  readonly user: (msg: UserLikeMessage) => R
  readonly result: (msg: SDKResultMessage) => R
  readonly system: (msg: SystemLikeMessage) => R
  readonly stream_event: (msg: SDKPartialAssistantMessage) => R
  readonly tool: (msg: ToolMessage) => R
  readonly auth_status: (msg: SDKAuthStatusMessage) => R
}): (msg: SDKMessage) => R => {
  const matcher = Match.type<SDKMessage>().pipe(
    Match.when({ type: "assistant" }, handlers.assistant),
    Match.when({ type: "user", isReplay: true }, (msg) =>
      handlers.user(msg as unknown as UserLikeMessage)
    ),
    Match.when({ type: "user" }, (msg) =>
      handlers.user(msg as unknown as UserLikeMessage)
    ),
    Match.when({ type: "result", subtype: "success" }, handlers.result),
    Match.whenOr(
      { type: "result", subtype: "error_during_execution" },
      { type: "result", subtype: "error_max_turns" },
      { type: "result", subtype: "error_max_budget_usd" },
      { type: "result", subtype: "error_max_structured_output_retries" },
      handlers.result
    ),
    Match.when({ type: "stream_event" }, handlers.stream_event),
    Match.when({ type: "tool_progress" }, handlers.tool),
    Match.when({ type: "tool_use_summary" }, handlers.tool),
    Match.when({ type: "auth_status" }, handlers.auth_status),
    Match.when({ type: "system", subtype: "init" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "compact_boundary" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "status" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "hook_started" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "hook_progress" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "hook_response" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "files_persisted" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "task_notification" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.when({ type: "system", subtype: "task_started" }, (msg) =>
      handlers.system(msg as unknown as SystemLikeMessage)
    ),
    Match.exhaustive
  )
  return matcher as unknown as (msg: SDKMessage) => R
}

// ---------------------------------------------------------------------------
// Re-exported text utilities
// ---------------------------------------------------------------------------

export { extractResultText, extractTextChunks, toTextStream } from "./QuickStart.js"
