/**
 * Line-oriented text streaming helpers backing the streaming file tools.
 *
 * Provides memory-efficient, line-by-line access to text files using the
 * platform {@link FileSystem.FileSystem} and {@link Path.Path} services
 * (`FileSystem.stream` -> `Stream.decodeText` -> `Stream.splitLines`). All
 * operations stay platform-agnostic: a node `FileSystem`/`Path` implementation
 * is provided at the entrypoint, not here.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { Effect, FileSystem, Path, Random, Stream } from "effect";
import * as A from "effect/Array";
import type { PlatformError } from "effect/PlatformError";

/**
 * Text decoding labels accepted by the streaming text helpers.
 *
 * @since 0.0.0
 * @category models
 */
export type TextEncoding = "ascii" | "latin1" | "utf-8";

/**
 * Per-line processing options shared by the read-oriented helpers.
 *
 * @since 0.0.0
 * @category models
 */
export interface TextReadOptions {
  /** Text decoding label applied to file bytes (default: `"utf-8"`). */
  readonly encoding?: TextEncoding | undefined;
  /** Drop lines that are empty after optional trimming (default: `false`). */
  readonly skipEmpty?: boolean | undefined;
  /** Trim surrounding whitespace from each line (default: `false`). */
  readonly trim?: boolean | undefined;
}

/**
 * Streaming options that extend {@link TextReadOptions} with windowing controls.
 *
 * @since 0.0.0
 * @category models
 */
export interface TextStreamOptions extends TextReadOptions {
  /** Maximum number of lines to emit after skipping (default: unbounded). */
  readonly maxLines?: number | undefined;
  /** Number of leading lines to skip before emitting (default: `0`). */
  readonly skip?: number | undefined;
}

/**
 * Aggregate line-length and byte statistics computed for a text file.
 *
 * @since 0.0.0
 * @category models
 */
export interface TextStreamStats {
  /** Mean processed line length across all counted lines. */
  readonly avgLineLength: number;
  /** Longest processed line length seen. */
  readonly maxLineLength: number;
  /** Shortest processed line length seen (`0` for an empty file). */
  readonly minLineLength: number;
  /** Number of lines that were non-empty after processing. */
  readonly nonEmptyLines: number;
  /** Total bytes attributed to processed lines, including newline separators. */
  readonly totalBytes: number;
  /** Total number of processed lines. */
  readonly totalLines: number;
}

const byteLength = (value: string): number => new TextEncoder().encode(value).length;

/**
 * Stream a text file as a sequence of processed lines.
 *
 * Bytes are decoded with the requested encoding then split on line boundaries;
 * `skip` and `maxLines` window the result while `trim`/`skipEmpty` shape each
 * emitted line. The stream surfaces the platform's `PlatformError` channel and
 * requires the {@link FileSystem.FileSystem} and {@link Path.Path} services.
 *
 * @example
 * ```ts
 * import * as Stream from "effect/Stream"
 * import { streamLines } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * const lines = streamLines("/tmp/data.txt", { maxLines: 10, trim: true })
 * void Stream.runCollect(lines)
 * ```
 *
 * @since 0.0.0
 * @category streams
 */
export const streamLines = (
  filePath: string,
  options: TextStreamOptions = {}
): Stream.Stream<string, PlatformError, FileSystem.FileSystem | Path.Path> => {
  const encoding = options.encoding ?? "utf-8";
  const skip = options.skip ?? 0;
  const maxLines = options.maxLines ?? Number.MAX_SAFE_INTEGER;
  const skipEmpty = options.skipEmpty ?? false;
  const trim = options.trim ?? false;

  return Stream.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const resolved = path.resolve(filePath);

      return fs.stream(resolved).pipe(
        Stream.decodeText({ encoding }),
        Stream.splitLines,
        Stream.drop(skip),
        Stream.map((line) => (trim ? line.trim() : line)),
        Stream.filter((line) => !skipEmpty || line.length > 0),
        Stream.take(maxLines)
      );
    })
  );
};

/**
 * Collect a text file into an array of processed lines.
 *
 * Loads every emitted line into memory; prefer {@link streamLines} for large
 * inputs where incremental processing is sufficient.
 *
 * @example
 * ```ts
 * import { readLines } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void readLines("/tmp/data.txt", { skipEmpty: true })
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const readLines = (
  filePath: string,
  options: TextStreamOptions = {}
): Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path> =>
  Stream.runCollect(streamLines(filePath, options));

/**
 * Read an entire text file into a single decoded string.
 *
 * @example
 * ```ts
 * import { readTextFile } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void readTextFile("/tmp/data.txt")
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const readTextFile = Effect.fn("TextStream.readTextFile")(function* (
  filePath: string,
  encoding: TextEncoding = "utf-8"
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return yield* fs.readFileString(path.resolve(filePath), encoding);
});

/**
 * Read the first `n` processed lines of a text file.
 *
 * @example
 * ```ts
 * import { head } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void head("/tmp/data.txt", 5)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const head = (
  filePath: string,
  n: number,
  options: TextReadOptions = {}
): Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path> =>
  readLines(filePath, { ...options, maxLines: n });

/**
 * Read the last `n` processed lines of a text file.
 *
 * @example
 * ```ts
 * import { tail } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void tail("/tmp/data.txt", 5)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const tail = (
  filePath: string,
  n: number,
  options: TextReadOptions = {}
): Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.map(readLines(filePath, options), (lines) => lines.slice(Math.max(0, lines.length - n)));

/**
 * Sample up to `sampleSize` processed lines uniformly at random.
 *
 * When the file has at most `sampleSize` processed lines they are returned in
 * order; otherwise a deterministic-by-{@link Random} shuffle selects the sample,
 * which is then re-sorted into original document order.
 *
 * @example
 * ```ts
 * import { sampleLines } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void sampleLines("/tmp/data.txt", 3)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const sampleLines = Effect.fn("TextStream.sampleLines")(function* (
  filePath: string,
  sampleSize: number,
  options: TextReadOptions = {}
) {
  const lines = yield* readLines(filePath, options);
  if (lines.length <= sampleSize) {
    return lines;
  }
  const indices = yield* Random.shuffle(A.makeBy(lines.length, (index) => index));
  return indices
    .slice(0, sampleSize)
    .sort((left, right) => left - right)
    .map((index) => lines[index] as string);
});

/**
 * Count the processed lines in a text file without buffering them.
 *
 * @example
 * ```ts
 * import { countLines } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void countLines("/tmp/data.txt")
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const countLines = (
  filePath: string,
  options: TextReadOptions = {}
): Effect.Effect<number, PlatformError, FileSystem.FileSystem | Path.Path> =>
  Stream.runCount(streamLines(filePath, options));

/**
 * Report whether a path exists.
 *
 * @example
 * ```ts
 * import { fileExists } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void fileExists("/tmp/data.txt")
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const fileExists = Effect.fn("TextStream.fileExists")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return yield* fs.exists(path.resolve(filePath));
});

/**
 * Report the size of a file in bytes.
 *
 * @example
 * ```ts
 * import { getFileSize } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void getFileSize("/tmp/data.txt")
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const getFileSize = Effect.fn("TextStream.getFileSize")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const info = yield* fs.stat(path.resolve(filePath));
  return Number(info.size);
});

/**
 * Compute aggregate line-length and byte statistics for a text file.
 *
 * The accumulator runs in a single streaming pass; `totalBytes` charges each
 * processed line its UTF-8 byte length plus one newline separator.
 *
 * @example
 * ```ts
 * import { computeStats } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * void computeStats("/tmp/data.txt", { trim: true })
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const computeStats = (
  filePath: string,
  options: TextReadOptions = {}
): Effect.Effect<TextStreamStats, PlatformError, FileSystem.FileSystem | Path.Path> =>
  streamLines(filePath, options).pipe(
    Stream.runFold(
      (): {
        maxLineLength: number;
        minLineLength: number;
        nonEmptyLines: number;
        totalBytes: number;
        totalLength: number;
        totalLines: number;
      } => ({
        maxLineLength: 0,
        minLineLength: Number.MAX_SAFE_INTEGER,
        nonEmptyLines: 0,
        totalBytes: 0,
        totalLength: 0,
        totalLines: 0,
      }),
      (acc, line) => ({
        maxLineLength: Math.max(acc.maxLineLength, line.length),
        minLineLength: Math.min(acc.minLineLength, line.length),
        nonEmptyLines: acc.nonEmptyLines + (line.length > 0 ? 1 : 0),
        totalBytes: acc.totalBytes + byteLength(line) + 1,
        totalLength: acc.totalLength + line.length,
        totalLines: acc.totalLines + 1,
      })
    ),
    Effect.map(
      (acc): TextStreamStats => ({
        avgLineLength: acc.totalLines > 0 ? acc.totalLength / acc.totalLines : 0,
        maxLineLength: acc.maxLineLength,
        minLineLength: acc.totalLines > 0 ? acc.minLineLength : 0,
        nonEmptyLines: acc.nonEmptyLines,
        totalBytes: acc.totalBytes,
        totalLines: acc.totalLines,
      })
    )
  );
