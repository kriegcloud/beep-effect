/**
 * JSONL (JSON Lines / NDJSON) streaming helpers backing the streaming JSONL
 * tools.
 *
 * Records are parsed line-by-line on top of {@link streamLines}, with
 * optional skip-invalid behavior and structured per-line error collection. All
 * operations require the {@link FileSystem.FileSystem} and {@link Path.Path}
 * services and surface the platform error channel.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpMcpId } from "@beep/identity";
import { Effect, Order, pipe, Random, Result, Stream } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { streamLines } from "./TextStream.ts";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";
import type { PlatformError } from "effect/PlatformError";

const $I = $NlpMcpId.create("Streaming/Jsonl");

/**
 * Structured parse failure for a single JSONL line.
 *
 * @example
 * ```ts
 * import { JsonlLineError } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * const error = JsonlLineError.make({ error: "Unexpected token", lineNumber: 4 })
 * console.log(error.lineNumber)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonlLineError extends S.Class<JsonlLineError>($I`JsonlLineError`)(
  {
    /** Parser error message (the original line text is never included). */
    error: S.String.annotateKey({
      description: "Parser error message (the original line text is never included).",
    }),
    lineNumber: S.Finite.annotateKey({
      description: "Zero-based index of the offending line within the file.",
    }),
  },
  $I.annote("JsonlLineError", {
    description: "Structured parse failure for a single JSONL line.",
  })
) {}

/**
 * Aggregate parse statistics for a JSONL file.
 *
 * @example
 * ```ts
 * import { JsonlStats } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * const stats = JsonlStats.make({ errorCount: 0, skippedCount: 0, successCount: 2, totalLines: 2 })
 * console.log(stats.successCount)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonlStats extends S.Class<JsonlStats>($I`JsonlStats`)(
  {
    /** Number of lines that failed to parse. */
    errorCount: S.Finite.annotateKey({ description: "Number of lines that failed to parse." }),
    /** Reserved skipped-line count, always `0` because blanks are pre-filtered. */
    skippedCount: S.Finite.annotateKey({
      description: "Reserved skipped-line count, always `0` because blanks are pre-filtered.",
    }),
    /** Number of lines that parsed successfully. */
    successCount: S.Finite.annotateKey({ description: "Number of lines that parsed successfully." }),
    /** Total number of non-empty lines examined. */
    totalLines: S.Finite.annotateKey({ description: "Total number of non-empty lines examined." }),
  },
  $I.annote("JsonlStats", {
    description: "Aggregate parse statistics for a JSONL file.",
  })
) {}

const decodeJsonLine = S.decodeResult(S.UnknownFromJsonString);

const parseLine = (line: string, lineNumber: number): Result.Result<unknown, JsonlLineError> =>
  Result.mapError(
    decodeJsonLine(line),
    (error): JsonlLineError =>
      JsonlLineError.make({
        error: error.message,
        lineNumber,
      })
  );

/**
 * Stream `[trimmedLine, physicalLineNumber]` pairs for non-blank lines.
 *
 * Indexing happens on the raw stream (before blank lines are dropped) so the
 * reported `lineNumber` is the zero-based position of the line within the file,
 * even when blank lines precede a malformed record.
 */
const streamIndexedLines = (
  filePath: string
): Stream.Stream<readonly [string, number], PlatformError, FileSystem.FileSystem | Path.Path> =>
  streamLines(filePath).pipe(
    Stream.zipWithIndex,
    Stream.map(([line, index]): readonly [string, number] => [Str.trim(line), index]),
    Stream.filter(([line]) => Str.isNonEmpty(line))
  );

/**
 * Stream parsed JSONL records, optionally dropping invalid lines.
 *
 * Blank lines are filtered before parsing. When `skipInvalid` is `true` parse
 * failures are silently discarded; otherwise the first failure fails the stream
 * with a {@link JsonlLineError}.
 *
 * @example
 * ```ts
 * import * as Stream from "effect/Stream"
 * import { streamJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * console.log(Stream.runCollect(streamJsonl("/tmp/data.jsonl", { skipInvalid: true })))
 * ```
 *
 * @since 0.0.0
 * @category streams
 */
export const streamJsonl = (
  filePath: string,
  options: { readonly skipInvalid?: boolean | undefined } = {}
): Stream.Stream<unknown, JsonlLineError | PlatformError, FileSystem.FileSystem | Path.Path> => {
  const skipInvalid = options.skipInvalid ?? false;
  return streamIndexedLines(filePath).pipe(
    skipInvalid
      ? Stream.filterMap(([line, lineNumber]) => parseLine(line, lineNumber))
      : Stream.mapEffect(([line, lineNumber]) => Effect.fromResult(parseLine(line, lineNumber)))
  );
};

/**
 * Stream per-line parse results, never failing on malformed JSON.
 *
 * Each emitted {@link Result.Result} is either a parsed record (`Success`) or a
 * {@link JsonlLineError} (`Failure`), enabling callers to fold over outcomes.
 *
 * @example
 * ```ts
 * import * as Stream from "effect/Stream"
 * import { streamJsonlResults } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * console.log(Stream.runCollect(streamJsonlResults("/tmp/data.jsonl")))
 * ```
 *
 * @since 0.0.0
 * @category streams
 */
export const streamJsonlResults = (
  filePath: string
): Stream.Stream<Result.Result<unknown, JsonlLineError>, PlatformError, FileSystem.FileSystem | Path.Path> =>
  streamIndexedLines(filePath).pipe(Stream.map(([line, lineNumber]) => parseLine(line, lineNumber)));

/**
 * Collect parsed JSONL records into an array.
 *
 * @example
 * ```ts
 * import { readJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * console.log(readJsonl("/tmp/data.jsonl", { skipInvalid: true }))
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const readJsonl = (
  filePath: string,
  options: { readonly skipInvalid?: boolean | undefined } = {}
): Effect.Effect<ReadonlyArray<unknown>, JsonlLineError | PlatformError, FileSystem.FileSystem | Path.Path> =>
  Stream.runCollect(streamJsonl(filePath, options));

/**
 * Compute aggregate parse statistics for a JSONL file.
 *
 * @example
 * ```ts
 * import { computeJsonlStats } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * console.log(computeJsonlStats("/tmp/data.jsonl"))
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const computeJsonlStats = (
  filePath: string
): Effect.Effect<JsonlStats, PlatformError, FileSystem.FileSystem | Path.Path> =>
  streamJsonlResults(filePath).pipe(
    Stream.runFold(
      (): JsonlStats =>
        JsonlStats.make({
          errorCount: 0,
          skippedCount: 0,
          successCount: 0,
          totalLines: 0,
        }),
      (acc, result): JsonlStats =>
        JsonlStats.make({
          errorCount: acc.errorCount + (Result.isFailure(result) ? 1 : 0),
          skippedCount: acc.skippedCount,
          successCount: acc.successCount + (Result.isSuccess(result) ? 1 : 0),
          totalLines: acc.totalLines + 1,
        })
    )
  );

/**
 * Validate a JSONL file, returning parsed records and collected line errors.
 *
 * @example
 * ```ts
 * import { validateJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * console.log(validateJsonl("/tmp/data.jsonl"))
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const validateJsonl = (
  filePath: string
): Effect.Effect<
  {
    readonly errors: ReadonlyArray<JsonlLineError>;
    readonly records: ReadonlyArray<unknown>;
  },
  PlatformError,
  FileSystem.FileSystem | Path.Path
> =>
  streamJsonlResults(filePath).pipe(
    Stream.runFold(
      (): {
        errors: Array<JsonlLineError>;
        records: Array<unknown>;
      } => ({ errors: [], records: [] }),
      (acc, result) =>
        Result.match(result, {
          onFailure: (error) => ({
            errors: [...acc.errors, error],
            records: acc.records,
          }),
          onSuccess: (value) => ({
            errors: acc.errors,
            records: [...acc.records, value],
          }),
        })
    )
  );

/**
 * Sample up to `sampleSize` parsed JSONL records uniformly at random.
 *
 * Records are first parsed (honoring `skipInvalid`); when at most `sampleSize`
 * are available they are returned in order, otherwise a {@link Random} shuffle
 * selects the sample which is then re-sorted into original order.
 *
 * @example
 * ```ts
 * import { sampleJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * console.log(sampleJsonl("/tmp/data.jsonl", 3, { skipInvalid: true }))
 * ```
 *
 * @effects Reads parsed records through {@link readJsonl} and uses the Effect
 * `Random` service to choose sample indices when the file contains more than
 * `sampleSize` records.
 *
 * @since 0.0.0
 * @category utilities
 */
export const sampleJsonl = Effect.fn("Jsonl.sampleJsonl")(function* (
  filePath: string,
  sampleSize: number,
  options: { readonly skipInvalid?: boolean | undefined } = {}
) {
  const records = yield* readJsonl(filePath, options);
  if (A.length(records) <= sampleSize) {
    return records;
  }
  const indices = yield* Random.shuffle(A.makeBy(A.length(records), (index) => index));
  return pipe(
    indices,
    A.take(sampleSize),
    A.sort(Order.Number),
    A.map((index) => A.get(records, index)),
    A.getSomes
  );
});
