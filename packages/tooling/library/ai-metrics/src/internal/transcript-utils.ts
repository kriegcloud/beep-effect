/**
 * Shared transcript metadata helpers for AI metrics ingest and privacy projections.
 *
 * @since 0.0.0
 */

import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { AiMetricsTranscriptSource } from "../models.ts";

const codexEventNames = [
  "assistant_message",
  "event",
  "event_msg",
  "response_item",
  "session_meta",
  "turn_context",
  "user_message",
] as const;

const claudeEventNames = ["assistant", "message", "summary", "system", "tool_result", "tool_use", "user"] as const;

const openClawEventNames = [
  "event",
  "gateway_request",
  "gateway_response",
  "message",
  "request",
  "response",
  "session",
  "tool_call",
  "tool_result",
] as const;

const eventNamesForSource = (sourceKind: AiMetricsTranscriptSource): ReadonlyArray<string> => {
  if (sourceKind === AiMetricsTranscriptSource.Enum.codex) {
    return codexEventNames;
  }

  if (sourceKind === AiMetricsTranscriptSource.Enum.claude) {
    return claudeEventNames;
  }

  return openClawEventNames;
};

/**
 * Trim transcript JSONL text into non-empty lines.
 *
 * @category utilities
 * @since 0.0.0
 */
export const transcriptLines = (content: string): ReadonlyArray<string> =>
  pipe(content, Str.split("\n"), A.map(Str.trim), A.filter(Str.isNonEmpty));

/**
 * Return the first defined string from a small candidate list.
 *
 * @category utilities
 * @since 0.0.0
 */
export const firstString = (...values: ReadonlyArray<string | undefined>): O.Option<string> =>
  pipe(values, A.map(O.fromNullishOr), A.getSomes, A.head);

/**
 * Build an optional timestamp object for schema class constructors.
 *
 * @category utilities
 * @since 0.0.0
 */
export const optionalTimestamp = (timestamp: string | undefined): { readonly timestamp?: string } =>
  timestamp === undefined ? {} : { timestamp };

/**
 * Normalize transcript metadata into a bounded, source-specific metric event name.
 *
 * @category utilities
 * @since 0.0.0
 */
export const metricEventName = (
  sourceKind: AiMetricsTranscriptSource,
  fallback: string,
  value: string | undefined
): string =>
  pipe(
    O.fromNullishOr(value),
    O.filter((eventName) => A.contains(eventNamesForSource(sourceKind), eventName)),
    O.getOrElse(() => fallback)
  );
