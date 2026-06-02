/**
 * Handler layer for the streaming MCP toolkit.
 *
 * Binds each of the 17 {@link StreamingTools.StreamingToolkit} tools to an
 * Effect-based implementation backed by the {@link TextStream}, {@link Jsonl},
 * {@link DatasetLoader}, and {@link Pipeline} helpers. Handler failures are
 * mapped to {@link AiToolError} (the toolkit declares `failureMode: "return"`),
 * and spans are annotated with counts, paths, and byte sizes only -- never raw
 * file content or line/record text.
 *
 * The resulting layer requires the {@link FileSystem.FileSystem} and
 * {@link Path.Path} services, which are provided at the entrypoint.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { AiToolError } from "@beep/nlp/Tools";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as Stream from "effect/Stream";
import * as DatasetLoader from "./Streaming/DatasetLoader.ts";
import * as Jsonl from "./Streaming/Jsonl.ts";
import * as Pipeline from "./Streaming/Pipeline.ts";
import * as TextStream from "./Streaming/TextStream.ts";
import { StreamingToolkit } from "./StreamingTools.ts";
import type * as FileSystem from "effect/FileSystem";
import type * as Layer from "effect/Layer";
import type * as Path from "effect/Path";
import type { Tool } from "effect/unstable/ai";
import type * as HttpClient from "effect/unstable/http/HttpClient";

const toStreamToolError =
  (toolName: string, operation: string) =>
  (error: unknown): typeof AiToolError.Type =>
    AiToolError.make({
      message: error instanceof Error ? error.message : String(error),
      operation,
      reason: typeof error === "object" && error !== null && "_tag" in error ? String(error._tag) : "StreamingError",
      retryable: false,
      toolName,
    });

const pathAttribute = (path: string): Record<string, string> => ({ path_length: `${path.length}` });

const countAttribute = (name: string, count: number): Record<string, string> => ({ [name]: `${count}` });

class InvalidPatternError extends Data.TaggedError("InvalidPatternError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

const compileRegex = (pattern: string, flags: string): Effect.Effect<RegExp, InvalidPatternError> =>
  Effect.try({
    catch: (cause) =>
      new InvalidPatternError({ cause, message: cause instanceof Error ? cause.message : String(cause) }),
    try: () => new RegExp(pattern, flags),
  });

/**
 * Live handler layer for the streaming toolkit.
 *
 * Provide this layer (together with a node `FileSystem`/`Path` implementation)
 * when mounting {@link StreamingTools.StreamingToolkit} into an MCP server. Each
 * handler returns plain objects matching the tool's `S.Struct` success schema
 * and surfaces expected failures as {@link AiToolError}.
 *
 * @example
 * ```ts
 * import { StreamingToolkitHandlersLive } from "@beep/nlp-mcp/StreamingHandlers"
 *
 * void StreamingToolkitHandlersLive
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const StreamingToolkitHandlersLive: Layer.Layer<
  Tool.HandlersFor<typeof StreamingToolkit.tools>,
  never,
  FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> = StreamingToolkit.toLayer(
  Effect.gen(function* () {
    const context = yield* Effect.context<FileSystem.FileSystem | HttpClient.HttpClient | Path.Path>();
    const finalize =
      (toolName: string, operation: string) =>
      <A, E, R>(
        effect: Effect.Effect<A, E, R>
      ): Effect.Effect<
        A,
        typeof AiToolError.Type,
        Exclude<R, FileSystem.FileSystem | HttpClient.HttpClient | Path.Path>
      > =>
        effect.pipe(Effect.mapError(toStreamToolError(toolName, operation)), Effect.provideContext(context));

    return {
      stream_count_jsonl: Effect.fn("StreamingToolkit.stream_count_jsonl")(
        function* ({ options, path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const stats = yield* Jsonl.computeJsonlStats(path);
          const count = options?.skipInvalid === true ? stats.successCount : stats.totalLines;
          yield* Effect.annotateCurrentSpan(countAttribute("count", count));
          return stats.errorCount > 0 ? { count, errors: stats.errorCount } : { count };
        },
        finalize("stream_count_jsonl", "count_jsonl")
      ),

      stream_count_lines: Effect.fn("StreamingToolkit.stream_count_lines")(
        function* ({ options, path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const count = yield* TextStream.countLines(
            path,
            options?.skipEmpty === undefined ? {} : { skipEmpty: options.skipEmpty }
          );
          yield* Effect.annotateCurrentSpan(countAttribute("count", count));
          return { count };
        },
        finalize("stream_count_lines", "count_lines")
      ),

      stream_extract_matches: Effect.fn("StreamingToolkit.stream_extract_matches")(
        function* ({ options, path, pattern }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const maxMatches = options?.maxMatches ?? 1000;
          if (options?.fullLines === true) {
            const lineRegex = yield* compileRegex(pattern, options.caseInsensitive === true ? "i" : "");
            const lines = yield* TextStream.streamLines(path, { skipEmpty: true, trim: true }).pipe(
              Stream.filter((line) => lineRegex.test(line)),
              Stream.take(maxMatches),
              Stream.runCollect
            );
            yield* Effect.annotateCurrentSpan(countAttribute("count", lines.length));
            return { count: lines.length, lines, truncated: lines.length >= maxMatches };
          }
          const regex = yield* compileRegex(pattern, `g${options?.caseInsensitive === true ? "i" : ""}`);
          const content = yield* TextStream.readTextFile(path);
          const allMatches = Array.from(content.matchAll(regex), (match) => match[0]);
          const matches = allMatches.slice(0, maxMatches);
          yield* Effect.annotateCurrentSpan(countAttribute("count", matches.length));
          return { count: matches.length, lines: matches, truncated: allMatches.length > maxMatches };
        },
        finalize("stream_extract_matches", "extract_matches")
      ),

      stream_file_info: Effect.fn("StreamingToolkit.stream_file_info")(
        function* ({ path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const exists = yield* TextStream.fileExists(path);
          if (!exists) {
            return { exists: false };
          }
          const sizeBytes = yield* TextStream.getFileSize(path);
          const lineCount = yield* TextStream.countLines(path);
          yield* Effect.annotateCurrentSpan({
            ...countAttribute("line_count", lineCount),
            size_bytes: `${sizeBytes}`,
          });
          return { exists: true, lineCount, sizeBytes };
        },
        finalize("stream_file_info", "file_info")
      ),

      stream_filter_lines: Effect.fn("StreamingToolkit.stream_filter_lines")(
        function* ({ options, path, pattern }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const regex = yield* compileRegex(pattern, options?.caseInsensitive === true ? "i" : "");
          const maxLines = options?.maxLines ?? 1000;
          const lines = yield* TextStream.streamLines(path, { skipEmpty: true, trim: true }).pipe(
            Stream.filter((line) => {
              const matches = regex.test(line);
              return options?.invert === true ? !matches : matches;
            }),
            Stream.take(maxLines),
            Stream.runCollect
          );
          yield* Effect.annotateCurrentSpan(countAttribute("count", lines.length));
          return { count: lines.length, lines, truncated: lines.length >= maxLines };
        },
        finalize("stream_filter_lines", "filter_lines")
      ),

      stream_jsonl_stats: Effect.fn("StreamingToolkit.stream_jsonl_stats")(
        function* ({ path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const stats = yield* Jsonl.computeJsonlStats(path);
          yield* Effect.annotateCurrentSpan(countAttribute("total_lines", stats.totalLines));
          return {
            errorCount: stats.errorCount,
            skippedCount: stats.skippedCount,
            successCount: stats.successCount,
            totalLines: stats.totalLines,
          };
        },
        finalize("stream_jsonl_stats", "jsonl_stats")
      ),

      stream_load_json: Effect.fn("StreamingToolkit.stream_load_json")(
        function* ({ location, options }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(location));
          const result = yield* DatasetLoader.loadJson(
            location,
            options?.timeout === undefined ? {} : { timeout: options.timeout }
          );
          return { data: result.data, meta: result.meta };
        },
        finalize("stream_load_json", "load_json")
      ),

      stream_load_jsonl: Effect.fn("StreamingToolkit.stream_load_jsonl")(
        function* ({ location, options }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(location));
          const result = yield* DatasetLoader.loadJsonl(location, {
            ...(options?.skipInvalid === undefined ? {} : { skipInvalid: options.skipInvalid }),
            ...(options?.timeout === undefined ? {} : { timeout: options.timeout }),
          });
          const records = options?.maxRecords === undefined ? result.data : result.data.slice(0, options.maxRecords);
          yield* Effect.annotateCurrentSpan(countAttribute("count", records.length));
          return { data: records, meta: result.meta };
        },
        finalize("stream_load_jsonl", "load_jsonl")
      ),

      stream_load_lines: Effect.fn("StreamingToolkit.stream_load_lines")(
        function* ({ location, options }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(location));
          const result = yield* DatasetLoader.loadLines(location, {
            ...(options?.skipEmpty === undefined ? {} : { skipEmpty: options.skipEmpty }),
            ...(options?.timeout === undefined ? {} : { timeout: options.timeout }),
            ...(options?.trim === undefined ? {} : { trim: options.trim }),
          });
          const lines = options?.maxLines === undefined ? result.data : result.data.slice(0, options.maxLines);
          yield* Effect.annotateCurrentSpan(countAttribute("count", lines.length));
          return { data: lines, meta: result.meta };
        },
        finalize("stream_load_lines", "load_lines")
      ),

      stream_load_text: Effect.fn("StreamingToolkit.stream_load_text")(
        function* ({ location, options }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(location));
          const result = yield* DatasetLoader.loadText(location, {
            ...(options?.encoding === undefined ? {} : { encoding: options.encoding }),
            ...(options?.timeout === undefined ? {} : { timeout: options.timeout }),
          });
          if (result.meta.sizeBytes !== undefined) {
            yield* Effect.annotateCurrentSpan({ size_bytes: `${result.meta.sizeBytes}` });
          }
          return { data: result.data, meta: result.meta };
        },
        finalize("stream_load_text", "load_text")
      ),

      stream_process_file: Effect.fn("StreamingToolkit.stream_process_file")(
        function* ({ options, path, stages }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const result = yield* Pipeline.processFile(path, stages, {
            ...(options?.maxLines === undefined ? {} : { maxLines: options.maxLines }),
            ...(options?.skipEmpty === undefined ? {} : { skipEmpty: options.skipEmpty }),
            ...(options?.stopOnError === undefined ? {} : { stopOnError: options.stopOnError }),
          });
          yield* Effect.annotateCurrentSpan(countAttribute("processed", result.processed));
          return {
            durationMs: result.durationMs,
            errors: result.errors,
            failed: result.failed,
            processed: result.processed,
            results: result.results,
            skipped: result.skipped,
          };
        },
        finalize("stream_process_file", "process_file")
      ),

      stream_read_jsonl: Effect.fn("StreamingToolkit.stream_read_jsonl")(
        function* ({ options, path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const maxRecords = options?.maxRecords ?? 1000;
          if (options?.collectErrors === true) {
            const results = yield* Jsonl.streamJsonlResults(path).pipe(Stream.take(maxRecords), Stream.runCollect);
            const records = results.flatMap((result) =>
              Result.match(result, { onFailure: () => [], onSuccess: (value) => [value] })
            );
            const errors = results.flatMap((result) =>
              Result.match(result, { onFailure: (error) => [error], onSuccess: () => [] })
            );
            yield* Effect.annotateCurrentSpan(countAttribute("count", records.length));
            return {
              count: records.length,
              records,
              truncated: results.length >= maxRecords,
              ...(errors.length > 0 ? { errors } : {}),
            };
          }
          const records = yield* Jsonl.streamJsonl(path, {
            ...(options?.skipInvalid === undefined ? {} : { skipInvalid: options.skipInvalid }),
          }).pipe(Stream.take(maxRecords), Stream.runCollect);
          yield* Effect.annotateCurrentSpan(countAttribute("count", records.length));
          return { count: records.length, records, truncated: records.length >= maxRecords };
        },
        finalize("stream_read_jsonl", "read_jsonl")
      ),

      stream_read_lines: Effect.fn("StreamingToolkit.stream_read_lines")(
        function* ({ options, path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const maxLines = options?.maxLines ?? 1000;
          const readOptions: { encoding?: TextStream.TextEncoding; skipEmpty?: boolean; trim?: boolean } = {
            encoding: options?.encoding ?? "utf-8",
            ...(options?.skipEmpty === undefined ? {} : { skipEmpty: options.skipEmpty }),
            ...(options?.trim === undefined ? {} : { trim: options.trim }),
          };
          const lines =
            options?.tail === undefined
              ? yield* TextStream.readLines(path, { ...readOptions, maxLines, skip: options?.skip ?? 0 })
              : yield* TextStream.tail(path, options.tail, readOptions);
          yield* Effect.annotateCurrentSpan(countAttribute("count", lines.length));
          return { count: lines.length, lines, truncated: lines.length >= maxLines };
        },
        finalize("stream_read_lines", "read_lines")
      ),

      stream_sample_jsonl: Effect.fn("StreamingToolkit.stream_sample_jsonl")(
        function* ({ options, path, sampleSize }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const records = yield* Jsonl.sampleJsonl(path, sampleSize, {
            ...(options?.skipInvalid === undefined ? {} : { skipInvalid: options.skipInvalid }),
          });
          yield* Effect.annotateCurrentSpan(countAttribute("count", records.length));
          return { count: records.length, records, truncated: false };
        },
        finalize("stream_sample_jsonl", "sample_jsonl")
      ),

      stream_sample_lines: Effect.fn("StreamingToolkit.stream_sample_lines")(
        function* ({ options, path, sampleSize }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const lines = yield* TextStream.sampleLines(path, sampleSize, {
            ...(options?.skipEmpty === undefined ? {} : { skipEmpty: options.skipEmpty }),
            ...(options?.trim === undefined ? {} : { trim: options.trim }),
          });
          yield* Effect.annotateCurrentSpan(countAttribute("count", lines.length));
          return { count: lines.length, lines, truncated: false };
        },
        finalize("stream_sample_lines", "sample_lines")
      ),

      stream_text_stats: Effect.fn("StreamingToolkit.stream_text_stats")(
        function* ({ options, path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const stats = yield* TextStream.computeStats(path, {
            ...(options?.skipEmpty === undefined ? {} : { skipEmpty: options.skipEmpty }),
            ...(options?.trim === undefined ? {} : { trim: options.trim }),
          });
          yield* Effect.annotateCurrentSpan(countAttribute("total_lines", stats.totalLines));
          return {
            avgLineLength: stats.avgLineLength,
            maxLineLength: stats.maxLineLength,
            minLineLength: stats.minLineLength,
            nonEmptyLines: stats.nonEmptyLines,
            totalBytes: stats.totalBytes,
            totalLines: stats.totalLines,
          };
        },
        finalize("stream_text_stats", "text_stats")
      ),

      stream_validate_jsonl: Effect.fn("StreamingToolkit.stream_validate_jsonl")(
        function* ({ options, path }) {
          yield* Effect.annotateCurrentSpan(pathAttribute(path));
          const maxErrors = options?.maxErrors ?? 100;
          const { errors, records } = yield* Jsonl.validateJsonl(path);
          const limitedErrors = errors.slice(0, maxErrors);
          yield* Effect.annotateCurrentSpan(countAttribute("count", records.length));
          return {
            count: records.length,
            records,
            truncated: false,
            ...(limitedErrors.length > 0 ? { errors: limitedErrors } : {}),
          };
        },
        finalize("stream_validate_jsonl", "validate_jsonl")
      ),
    };
  })
);
