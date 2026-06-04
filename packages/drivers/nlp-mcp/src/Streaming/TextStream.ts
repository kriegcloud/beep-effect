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

import { $NlpMcpId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { Effect, FileSystem, Number as Num, Order, Path, pipe, Random, Stream } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { PlatformError } from "effect/PlatformError";

const $I = $NlpMcpId.create("Streaming/TextStream");

/**
 * Text decoding labels accepted by the streaming text helpers.
 *
 * @example
 * ```ts
 * import type { TextEncoding } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * const encoding: TextEncoding = "utf-8"
 * console.log(encoding)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const TextEncoding = LiteralKit(["ascii", "latin1", "utf-8"]).annotate(
  $I.annote("TextEncoding", {
    description: "Text decoding labels accepted by the streaming text helpers.",
  })
);

/**
 * Type for {@link TextEncoding}.
 *
 * @example
 * ```ts
 * import type { TextEncoding } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * const encoding: TextEncoding = "latin1"
 * console.log(encoding)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TextEncoding = typeof TextEncoding.Type;

const DEFAULT_ENCODING: TextEncoding = "utf-8";

/**
 * Per-line processing options shared by the read-oriented helpers.
 *
 * @example
 * ```ts
 * import { TextReadOptions } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * const options = TextReadOptions.make({ skipEmpty: true, trim: true })
 * console.log(options.skipEmpty)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class TextReadOptions extends S.Class<TextReadOptions>($I`TextReadOptions`)(
  {
    encoding: S.optionalKey(TextEncoding).annotateKey({
      description: 'Text decoding label applied to file bytes (default: "utf-8").',
    }),
    skipEmpty: S.optionalKey(S.Boolean).annotateKey({
      description: "Drop lines that are empty after optional trimming (default: false).",
    }),
    trim: S.optionalKey(S.Boolean).annotateKey({
      description: "Trim surrounding whitespace from each line (default: false).",
    }),
  },
  $I.annote("TextReadOptions", {
    description: "Per-line processing options shared by the read-oriented helpers.",
  })
) {}

/**
 * Streaming options that extend {@link TextReadOptions} with windowing controls.
 *
 * @example
 * ```ts
 * import { TextStreamOptions } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * const options = TextStreamOptions.make({ maxLines: 10, skip: 2 })
 * console.log(options.maxLines)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class TextStreamOptions extends S.Class<TextStreamOptions>($I`TextStreamOptions`)(
  {
    ...TextReadOptions.fields,
    maxLines: S.optionalKey(S.Number).annotateKey({
      description: "Maximum number of lines to emit after skipping (default: unbounded).",
    }),
    skip: S.optionalKey(S.Number).annotateKey({
      description: "Number of leading lines to skip before emitting (default: 0).",
    }),
  },
  $I.annote("TextStreamOptions", {
    description: "Streaming options that extend TextReadOptions with windowing controls.",
  })
) {}

/**
 * Aggregate line-length and byte statistics computed for a text file.
 *
 * @example
 * ```ts
 * import { TextStreamStats } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * const stats = TextStreamStats.make({
 *   avgLineLength: 4,
 *   maxLineLength: 7,
 *   minLineLength: 1,
 *   nonEmptyLines: 2,
 *   totalBytes: 12,
 *   totalLines: 3
 * })
 * console.log(stats.totalLines)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class TextStreamStats extends S.Class<TextStreamStats>($I`TextStreamStats`)(
  {
    avgLineLength: S.Number.annotateKey({
      description: "Mean processed line length across all counted lines.",
    }),
    maxLineLength: S.Number.annotateKey({
      description: "Longest processed line length seen.",
    }),
    minLineLength: S.Number.annotateKey({
      description: "Shortest processed line length seen, or 0 for an empty file.",
    }),
    nonEmptyLines: S.Number.annotateKey({
      description: "Number of lines that were non-empty after processing.",
    }),
    totalBytes: S.Number.annotateKey({
      description: "Total bytes attributed to processed lines, including newline separators.",
    }),
    totalLines: S.Number.annotateKey({
      description: "Total number of processed lines.",
    }),
  },
  $I.annote("TextStreamStats", {
    description: "Aggregate line-length and byte statistics computed for a text file.",
  })
) {}

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
 * console.log(Stream.runCollect(lines))
 * ```
 *
 * @since 0.0.0
 * @category streams
 */
export const streamLines = (
  filePath: string,
  options: TextStreamOptions = {}
): Stream.Stream<string, PlatformError, FileSystem.FileSystem | Path.Path> => {
  const encoding = options.encoding ?? DEFAULT_ENCODING;
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
        Stream.map((line) => (trim ? Str.trim(line) : line)),
        Stream.filter((line) => !skipEmpty || Str.isNonEmpty(line)),
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
 * console.log(readLines("/tmp/data.txt", { skipEmpty: true }))
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
 * console.log(readTextFile("/tmp/data.txt"))
 * ```
 *
 * @effects Requires `FileSystem` and `Path`, resolves the supplied file path,
 * and fails with `PlatformError` when the file cannot be read or decoded.
 *
 * @since 0.0.0
 * @category utilities
 */
export const readTextFile = Effect.fn("TextStream.readTextFile")(function* (
  filePath: string,
  encoding: TextEncoding = DEFAULT_ENCODING
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
 * console.log(head("/tmp/data.txt", 5))
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
 * console.log(tail("/tmp/data.txt", 5))
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
  Effect.map(readLines(filePath, options), A.takeRight(n));

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
 * console.log(sampleLines("/tmp/data.txt", 3))
 * ```
 *
 * @effects Reads processed lines through {@link readLines} and uses the Effect
 * `Random` service to choose sample indices when the file contains more than
 * `sampleSize` lines.
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
  if (A.length(lines) <= sampleSize) {
    return lines;
  }
  const indices = yield* Random.shuffle(A.makeBy(A.length(lines), (index) => index));
  return pipe(
    indices,
    A.take(sampleSize),
    A.sort(Order.Number),
    A.map((index) => A.get(lines, index)),
    A.getSomes
  );
});

/**
 * Count the processed lines in a text file without buffering them.
 *
 * @example
 * ```ts
 * import { countLines } from "@beep/nlp-mcp/Streaming/TextStream"
 *
 * console.log(countLines("/tmp/data.txt"))
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
 * console.log(fileExists("/tmp/data.txt"))
 * ```
 *
 * @effects Requires `FileSystem` and `Path`, resolves the supplied file path,
 * and queries the platform file system for path existence.
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
 * console.log(getFileSize("/tmp/data.txt"))
 * ```
 *
 * @effects Requires `FileSystem` and `Path`, resolves the supplied file path,
 * and fails with `PlatformError` when the file cannot be statted.
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const getFileSize = Effect.fn("TextStream.getFileSize")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const info = yield* fs.stat(path.resolve(filePath));
  return Num.Number(info.size);
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
 * console.log(computeStats("/tmp/data.txt", { trim: true }))
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
        maxLineLength: Num.max(acc.maxLineLength, Str.length(line)),
        minLineLength: Num.min(acc.minLineLength, Str.length(line)),
        nonEmptyLines: acc.nonEmptyLines + (Str.isNonEmpty(line) ? 1 : 0),
        totalBytes: acc.totalBytes + byteLength(line) + 1,
        totalLength: acc.totalLength + Str.length(line),
        totalLines: acc.totalLines + 1,
      })
    ),
    Effect.map(
      (acc): TextStreamStats =>
        TextStreamStats.make({
          avgLineLength: acc.totalLines > 0 ? acc.totalLength / acc.totalLines : 0,
          maxLineLength: acc.maxLineLength,
          minLineLength: acc.totalLines > 0 ? acc.minLineLength : 0,
          nonEmptyLines: acc.nonEmptyLines,
          totalBytes: acc.totalBytes,
          totalLines: acc.totalLines,
        })
    )
  );
