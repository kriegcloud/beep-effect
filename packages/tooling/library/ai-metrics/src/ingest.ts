/**
 * Transcript ingest helpers for AI-agent metrics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoAiMetricsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { firstString, metricEventName, optionalTimestamp, transcriptLines } from "./internal/transcript-utils.ts";
import {
  AgentTurn,
  AiMetricsTranscriptSource,
  ClaudeTranscriptLine,
  CodexTranscriptLine,
  OpenClawTranscriptLine,
  TranscriptIngestSummary,
} from "./models.ts";
import { hashPrivateIdentifier } from "./privacy.ts";

const $I = $RepoAiMetricsId.create("ingest");

const decodeCodexTranscriptLine = S.decodeUnknownOption(S.fromJsonString(CodexTranscriptLine));
const decodeClaudeTranscriptLine = S.decodeUnknownOption(S.fromJsonString(ClaudeTranscriptLine));
const decodeOpenClawTranscriptLine = S.decodeUnknownOption(S.fromJsonString(OpenClawTranscriptLine));
const encodeTranscriptIngestSummaryJson = S.encodeUnknownEffect(S.fromJsonString(TranscriptIngestSummary));

/**
 * Error raised by AI metrics ingest helpers.
 *
 * @example
 * ```ts
 * import { AiMetricsIngestError } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsIngestError)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsIngestError extends TaggedErrorClass<AiMetricsIngestError>($I`AiMetricsIngestError`)(
  "AiMetricsIngestError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsIngestError", {
    description: "Typed failure raised by AI metrics transcript ingest helpers.",
  })
) {}

type TranscriptTextSummaryInput = {
  readonly content: string;
  readonly hashSalt?: string;
  readonly sourceKind: AiMetricsTranscriptSource;
  readonly sourcePath: string;
};

const codexTurn = (sourcePathHash: string, lineNumber: number, line: CodexTranscriptLine): AgentTurn =>
  new AgentTurn({
    eventName: metricEventName({
      fallback: "event",
      sourceKind: AiMetricsTranscriptSource.Enum.codex,
      value: line.type,
    }),
    lineNumber,
    sourceKind: AiMetricsTranscriptSource.Enum.codex,
    sourcePathHash,
    ...optionalTimestamp(line.timestamp),
  });

const claudeTurn = (sourcePathHash: string, lineNumber: number, line: ClaudeTranscriptLine): AgentTurn =>
  new AgentTurn({
    eventName: metricEventName({
      fallback: "message",
      sourceKind: AiMetricsTranscriptSource.Enum.claude,
      value: line.type,
    }),
    lineNumber,
    sourceKind: AiMetricsTranscriptSource.Enum.claude,
    sourcePathHash,
    ...optionalTimestamp(line.timestamp),
  });

const openClawTurn = (sourcePathHash: string, lineNumber: number, line: OpenClawTranscriptLine): AgentTurn =>
  new AgentTurn({
    eventName: pipe(
      firstString(line.event, line.type),
      O.map((value) =>
        metricEventName({
          fallback: "event",
          sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
          value,
        })
      ),
      O.getOrElse(() => "event")
    ),
    lineNumber,
    sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
    sourcePathHash,
    ...optionalTimestamp(line.timestamp),
  });

const decodeTranscriptTurn = (
  sourceKind: AiMetricsTranscriptSource,
  sourcePathHash: string,
  lineNumber: number,
  line: string
): O.Option<AgentTurn> => {
  if (sourceKind === AiMetricsTranscriptSource.Enum.codex) {
    return pipe(
      decodeCodexTranscriptLine(line),
      O.map((decoded) => codexTurn(sourcePathHash, lineNumber, decoded))
    );
  }

  if (sourceKind === AiMetricsTranscriptSource.Enum.claude) {
    return pipe(
      decodeClaudeTranscriptLine(line),
      O.map((decoded) => claudeTurn(sourcePathHash, lineNumber, decoded))
    );
  }

  return pipe(
    decodeOpenClawTranscriptLine(line),
    O.map((decoded) => openClawTurn(sourcePathHash, lineNumber, decoded))
  );
};

const eventNameList = (events: ReadonlyArray<AgentTurn>): ReadonlyArray<string> =>
  pipe(
    events,
    A.map((event) => event.eventName),
    A.dedupe,
    A.sort(Order.String)
  );

const timestampList = (events: ReadonlyArray<AgentTurn>): ReadonlyArray<string> =>
  pipe(
    events,
    A.map((event) => O.fromNullishOr(event.timestamp)),
    A.getSomes,
    A.sort(Order.String)
  );

const summaryTimestampFields = (
  events: ReadonlyArray<AgentTurn>
): { readonly firstTimestamp?: string; readonly lastTimestamp?: string } => {
  const timestamps = timestampList(events);
  const firstTimestamp = A.head(timestamps);
  const lastTimestamp = A.get(timestamps, A.length(timestamps) - 1);

  return {
    ...(O.isSome(firstTimestamp) ? { firstTimestamp: firstTimestamp.value } : {}),
    ...(O.isSome(lastTimestamp) ? { lastTimestamp: lastTimestamp.value } : {}),
  };
};

/**
 * Summarize JSONL transcript text into a stable ingest summary.
 *
 * @example
 * ```ts
 * import { summarizeTranscriptText } from "@beep/repo-ai-metrics"
 * import { Effect } from "effect"
 * const result = Effect.runPromise(
 *   summarizeTranscriptText({
 *     content: "{\"type\":\"event_msg\"}",
 *     hashSalt: "local-smoke-salt",
 *     sourceKind: "codex",
 *     sourcePath: "sample.jsonl"
 *   })
 * )
 * console.log(result)
 * ```
 * @category services
 * @since 0.0.0
 */
export const summarizeTranscriptText: (
  input: TranscriptTextSummaryInput
) => Effect.Effect<TranscriptIngestSummary, AiMetricsIngestError> = Effect.fn("AiMetrics.summarizeTranscriptText")(
  function* ({ content, hashSalt, sourceKind, sourcePath }) {
    const sourcePathHash = yield* hashPrivateIdentifier(sourcePath, hashSalt).pipe(
      Effect.mapError(
        (cause) =>
          new AiMetricsIngestError({
            cause,
            message: "Failed to hash transcript source path.",
          })
      )
    );
    const lines = transcriptLines(content);
    const parsed = yield* Effect.forEach(
      lines,
      (line, index) => Effect.succeed(decodeTranscriptTurn(sourceKind, sourcePathHash, index + 1, line)),
      { concurrency: 16 }
    );
    const events = A.getSomes(parsed);

    return new TranscriptIngestSummary({
      acceptedEvents: A.length(events),
      eventNames: eventNameList(events),
      rejectedLines: A.length(lines) - A.length(events),
      sourceKind,
      sourcePathHash,
      totalLines: A.length(lines),
      ...summaryTimestampFields(events),
    });
  }
);

/**
 * Render a transcript ingest summary as JSON.
 *
 * @example
 * ```ts
 * import { summaryToJson } from "@beep/repo-ai-metrics"
 * console.log(summaryToJson)
 * ```
 * @category services
 * @since 0.0.0
 */
export const summaryToJson: (summary: TranscriptIngestSummary) => Effect.Effect<string, AiMetricsIngestError> =
  Effect.fn("AiMetrics.summaryToJson")(function* (summary) {
    return yield* encodeTranscriptIngestSummaryJson(summary).pipe(
      Effect.mapError(
        (cause) =>
          new AiMetricsIngestError({
            cause,
            message: "Failed to encode transcript ingest summary as JSON.",
          })
      )
    );
  });
