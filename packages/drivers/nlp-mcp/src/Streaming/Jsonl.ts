/**
 * JSONL (JSON Lines / NDJSON) streaming helpers backing the streaming JSONL
 * tools.
 *
 * Records are parsed line-by-line on top of {@link TextStream.streamLines}, with
 * optional skip-invalid behaviour and structured per-line error collection. All
 * operations require the {@link FileSystem.FileSystem} and {@link Path.Path}
 * services and surface the platform error channel.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import * as Effect from "effect/Effect";
import * as Random from "effect/Random";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import { streamLines } from "./TextStream.ts";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";
import type { PlatformError } from "effect/PlatformError";

/**
 * Structured parse failure for a single JSONL line.
 *
 * @since 0.0.0
 * @category models
 */
export interface JsonlLineError {
  /** Parser error message (the original line text is never included). */
  readonly error: string;
  /** Zero-based index of the offending line within the file. */
  readonly lineNumber: number;
}

/**
 * Aggregate parse statistics for a JSONL file.
 *
 * @since 0.0.0
 * @category models
 */
export interface JsonlStats {
  /** Number of lines that failed to parse. */
  readonly errorCount: number;
  /** Reserved skipped-line count; always `0` because blanks are pre-filtered. */
  readonly skippedCount: number;
  /** Number of lines that parsed successfully. */
  readonly successCount: number;
  /** Total number of non-empty lines examined. */
  readonly totalLines: number;
}

const decodeJsonLine = S.decodeResult(S.UnknownFromJsonString);

const parseLine = (line: string, lineNumber: number): Result.Result<unknown, JsonlLineError> =>
  Result.mapError(decodeJsonLine(line), (error): JsonlLineError => ({ error: String(error), lineNumber }));

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
 * void Stream.runCollect(streamJsonl("/tmp/data.jsonl", { skipInvalid: true }))
 * ```
 *
 * @since 0.0.0
 * @category streaming
 */
export const streamJsonl = (
  filePath: string,
  options: { readonly skipInvalid?: boolean | undefined } = {}
): Stream.Stream<unknown, JsonlLineError | PlatformError, FileSystem.FileSystem | Path.Path> => {
  const skipInvalid = options.skipInvalid ?? false;
  return streamLines(filePath, { skipEmpty: true, trim: true }).pipe(
    Stream.zipWithIndex,
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
 * void Stream.runCollect(streamJsonlResults("/tmp/data.jsonl"))
 * ```
 *
 * @since 0.0.0
 * @category streaming
 */
export const streamJsonlResults = (
  filePath: string
): Stream.Stream<Result.Result<unknown, JsonlLineError>, PlatformError, FileSystem.FileSystem | Path.Path> =>
  streamLines(filePath, { skipEmpty: true, trim: true }).pipe(
    Stream.zipWithIndex,
    Stream.map(([line, lineNumber]) => parseLine(line, lineNumber))
  );

/**
 * Collect parsed JSONL records into an array.
 *
 * @example
 * ```ts
 * import { readJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * void readJsonl("/tmp/data.jsonl", { skipInvalid: true })
 * ```
 *
 * @since 0.0.0
 * @category reading
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
 * void computeJsonlStats("/tmp/data.jsonl")
 * ```
 *
 * @since 0.0.0
 * @category statistics
 */
export const computeJsonlStats = (
  filePath: string
): Effect.Effect<JsonlStats, PlatformError, FileSystem.FileSystem | Path.Path> =>
  streamJsonlResults(filePath).pipe(
    Stream.runFold(
      (): JsonlStats => ({ errorCount: 0, skippedCount: 0, successCount: 0, totalLines: 0 }),
      (acc, result): JsonlStats => ({
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
 * void validateJsonl("/tmp/data.jsonl")
 * ```
 *
 * @since 0.0.0
 * @category validation
 */
export const validateJsonl = (
  filePath: string
): Effect.Effect<
  { readonly errors: ReadonlyArray<JsonlLineError>; readonly records: ReadonlyArray<unknown> },
  PlatformError,
  FileSystem.FileSystem | Path.Path
> =>
  streamJsonlResults(filePath).pipe(
    Stream.runFold(
      (): { errors: Array<JsonlLineError>; records: Array<unknown> } => ({ errors: [], records: [] }),
      (acc, result) =>
        Result.match(result, {
          onFailure: (error) => ({ errors: [...acc.errors, error], records: acc.records }),
          onSuccess: (value) => ({ errors: acc.errors, records: [...acc.records, value] }),
        })
    )
  );

/**
 * Sample up to `sampleSize` parsed JSONL records uniformly at random.
 *
 * Records are first parsed (honouring `skipInvalid`); when at most `sampleSize`
 * are available they are returned in order, otherwise a {@link Random} shuffle
 * selects the sample which is then re-sorted into original order.
 *
 * @example
 * ```ts
 * import { sampleJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"
 *
 * void sampleJsonl("/tmp/data.jsonl", 3, { skipInvalid: true })
 * ```
 *
 * @since 0.0.0
 * @category sampling
 */
export const sampleJsonl = (
  filePath: string,
  sampleSize: number,
  options: { readonly skipInvalid?: boolean | undefined } = {}
): Effect.Effect<ReadonlyArray<unknown>, JsonlLineError | PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const records = yield* readJsonl(filePath, options);
    if (records.length <= sampleSize) {
      return records;
    }
    const indices = yield* Random.shuffle(Array.from({ length: records.length }, (_, index) => index));
    return indices
      .slice(0, sampleSize)
      .sort((left, right) => left - right)
      .map((index) => records[index]);
  });
