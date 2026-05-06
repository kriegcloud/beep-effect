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
import * as Str from "effect/String";
import {
  AgentTurn,
  AiMetricsTranscriptSource,
  ClaudeTranscriptLine,
  CodexTranscriptLine,
  OpenClawTranscriptLine,
  TranscriptIngestSummary,
} from "./models.js";

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
  readonly sourceKind: AiMetricsTranscriptSource;
  readonly sourcePath: string;
};

const transcriptLines = (content: string): ReadonlyArray<string> =>
  pipe(content, Str.split("\n"), A.map(Str.trim), A.filter(Str.isNonEmpty));

const firstString = (...values: ReadonlyArray<string | undefined>): O.Option<string> =>
  pipe(values, A.map(O.fromNullishOr), A.getSomes, A.head);

const optionalTimestamp = (timestamp: string | undefined): { readonly timestamp?: string } =>
  timestamp === undefined ? {} : { timestamp };

const codexTurn = (sourcePath: string, lineNumber: number, line: CodexTranscriptLine): AgentTurn =>
  new AgentTurn({
    eventName: line.type,
    lineNumber,
    sourceKind: AiMetricsTranscriptSource.Enum.codex,
    sourcePath,
    ...optionalTimestamp(line.timestamp),
  });

const claudeTurn = (sourcePath: string, lineNumber: number, line: ClaudeTranscriptLine): AgentTurn =>
  new AgentTurn({
    eventName: pipe(
      firstString(line.type, line.sessionId, line.cwd),
      O.getOrElse(() => "message")
    ),
    lineNumber,
    sourceKind: AiMetricsTranscriptSource.Enum.claude,
    sourcePath,
    ...optionalTimestamp(line.timestamp),
  });

const openClawTurn = (sourcePath: string, lineNumber: number, line: OpenClawTranscriptLine): AgentTurn =>
  new AgentTurn({
    eventName: pipe(
      firstString(line.event, line.type, line.message),
      O.getOrElse(() => "event")
    ),
    lineNumber,
    sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
    sourcePath,
    ...optionalTimestamp(line.timestamp),
  });

const decodeTranscriptTurn = (
  sourceKind: AiMetricsTranscriptSource,
  sourcePath: string,
  lineNumber: number,
  line: string
): O.Option<AgentTurn> => {
  if (sourceKind === AiMetricsTranscriptSource.Enum.codex) {
    return pipe(
      decodeCodexTranscriptLine(line),
      O.map((decoded) => codexTurn(sourcePath, lineNumber, decoded))
    );
  }

  if (sourceKind === AiMetricsTranscriptSource.Enum.claude) {
    return pipe(
      decodeClaudeTranscriptLine(line),
      O.map((decoded) => claudeTurn(sourcePath, lineNumber, decoded))
    );
  }

  return pipe(
    decodeOpenClawTranscriptLine(line),
    O.map((decoded) => openClawTurn(sourcePath, lineNumber, decoded))
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
 *     sourceKind: "codex",
 *     sourcePath: "sample.jsonl"
 *   })
 * )
 * console.log(result)
 * ```
 * @category services
 * @since 0.0.0
 */
export const summarizeTranscriptText: (input: TranscriptTextSummaryInput) => Effect.Effect<TranscriptIngestSummary> =
  Effect.fn("AiMetrics.summarizeTranscriptText")(function* ({ content, sourceKind, sourcePath }) {
    const lines = transcriptLines(content);
    const parsed = yield* Effect.forEach(
      lines,
      (line, index) => Effect.succeed(decodeTranscriptTurn(sourceKind, sourcePath, index + 1, line)),
      { concurrency: 16 }
    );
    const events = A.getSomes(parsed);

    return new TranscriptIngestSummary({
      acceptedEvents: A.length(events),
      eventNames: eventNameList(events),
      rejectedLines: A.length(lines) - A.length(events),
      sourceKind,
      sourcePath,
      totalLines: A.length(lines),
      ...summaryTimestampFields(events),
    });
  });

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
