/**
 * Dataset loading helpers backing the streaming dataset tools.
 *
 * Loads text, line, JSONL, or JSON datasets from either a local file (via
 * {@link TextStream}) or a remote `http(s)` URL (via the {@link HttpClient}
 * service, provided at the entrypoint). Remote reads are bounded by
 * {@link Effect.timeout}; JSON payloads are parsed with
 * {@link S.UnknownFromJsonString} rather than raw `JSON.parse`. Each loader
 * returns the data alongside a {@link DatasetMeta} record describing provenance,
 * and the load timestamp comes from {@link Clock.currentTimeMillis}.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import * as Clock from "effect/Clock";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { readLines, readTextFile } from "./TextStream.ts";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";
import type { PlatformError } from "effect/PlatformError";
import type { TextEncoding } from "./TextStream.ts";

/**
 * Provenance metadata returned alongside every loaded dataset.
 *
 * @since 0.0.0
 * @category models
 */
export interface DatasetMeta {
  /** Detected dataset format (`"text"`, `"lines"`, `"jsonl"`, or `"json"`). */
  readonly format: string;
  /** Unix epoch milliseconds when the dataset was loaded. */
  readonly loadedAt: number;
  /** Resolved location (file path or URL) the dataset was loaded from. */
  readonly location: string;
  /** Content size in bytes when known. */
  readonly sizeBytes?: number;
  /** Source channel: `"file"` or `"url"`. */
  readonly sourceType: string;
}

/**
 * A loaded dataset payload paired with its {@link DatasetMeta}.
 *
 * @since 0.0.0
 * @category models
 */
export interface DatasetResult<A> {
  /** The loaded dataset value. */
  readonly data: A;
  /** Provenance metadata for the load. */
  readonly meta: DatasetMeta;
}

/**
 * Structured failure raised when a remote fetch or JSON decode fails.
 *
 * @since 0.0.0
 * @category errors
 */
export class DatasetLoadError extends Data.TaggedError("DatasetLoadError")<{
  readonly cause?: unknown;
  readonly message: string;
  readonly location: string;
}> {}

const DEFAULT_TIMEOUT_MS = 30_000;

const decodeJson = S.decodeEffect(S.UnknownFromJsonString);

const byteLength = (value: string): number => new TextEncoder().encode(value).length;

/**
 * Report whether a location should be treated as a remote `http(s)` URL.
 *
 * @example
 * ```ts
 * import { isUrl } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * isUrl("https://example.com/data.txt")
 * ```
 *
 * @since 0.0.0
 * @category predicates
 */
export const isUrl = (location: string): boolean => location.startsWith("http://") || location.startsWith("https://");

const fetchText = (
  location: string,
  timeoutMs: number
): Effect.Effect<string, DatasetLoadError, HttpClient.HttpClient> =>
  HttpClient.get(location).pipe(
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.flatMap((response) => response.text),
    Effect.timeout(Duration.millis(timeoutMs)),
    Effect.mapError((cause) => new DatasetLoadError({ cause, location, message: String(cause) }))
  );

const parseJson = (value: string, location: string): Effect.Effect<unknown, DatasetLoadError> =>
  decodeJson(value).pipe(Effect.mapError((cause) => new DatasetLoadError({ cause, location, message: String(cause) })));

/**
 * Load raw text from a file or remote URL.
 *
 * @example
 * ```ts
 * import { loadText } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * void loadText("/tmp/data.txt")
 * ```
 *
 * @since 0.0.0
 * @category loading
 */
export const loadText = (
  location: string,
  options: { readonly encoding?: TextEncoding | undefined; readonly timeout?: number | undefined } = {}
): Effect.Effect<
  DatasetResult<string>,
  DatasetLoadError | PlatformError,
  FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> =>
  Effect.gen(function* () {
    const loadedAt = yield* Clock.currentTimeMillis;
    if (isUrl(location)) {
      const data = yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS);
      return {
        data,
        meta: { format: "text", loadedAt, location, sizeBytes: byteLength(data), sourceType: "url" },
      };
    }
    const data = yield* readTextFile(location, options.encoding ?? "utf-8");
    return {
      data,
      meta: { format: "text", loadedAt, location, sizeBytes: byteLength(data), sourceType: "file" },
    };
  });

/**
 * Load a dataset as an array of lines from a file or remote URL.
 *
 * @example
 * ```ts
 * import { loadLines } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * void loadLines("/tmp/data.txt", { skipEmpty: true })
 * ```
 *
 * @since 0.0.0
 * @category loading
 */
export const loadLines = (
  location: string,
  options: {
    readonly skipEmpty?: boolean | undefined;
    readonly timeout?: number | undefined;
    readonly trim?: boolean | undefined;
  } = {}
): Effect.Effect<
  DatasetResult<ReadonlyArray<string>>,
  DatasetLoadError | PlatformError,
  FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> =>
  Effect.gen(function* () {
    const loadedAt = yield* Clock.currentTimeMillis;
    if (isUrl(location)) {
      const text = yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS);
      const data = text
        .split("\n")
        .map((line) => (options.trim === true ? line.trim() : line))
        .filter((line) => options.skipEmpty !== true || line.length > 0);
      return {
        data,
        meta: { format: "lines", loadedAt, location, sizeBytes: byteLength(text), sourceType: "url" },
      };
    }
    const lineOptions: { readonly skipEmpty?: boolean; readonly trim?: boolean } = {
      ...(options.skipEmpty === undefined ? {} : { skipEmpty: options.skipEmpty }),
      ...(options.trim === undefined ? {} : { trim: options.trim }),
    };
    const data = yield* readLines(location, lineOptions);
    return { data, meta: { format: "lines", loadedAt, location, sourceType: "file" } };
  });

/**
 * Load a JSONL dataset as an array of parsed records from a file or remote URL.
 *
 * Blank lines are skipped. When `skipInvalid` is `true` lines that fail to parse
 * are dropped; otherwise the first malformed line fails the effect.
 *
 * @example
 * ```ts
 * import { loadJsonl } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * void loadJsonl("/tmp/data.jsonl", { skipInvalid: true })
 * ```
 *
 * @since 0.0.0
 * @category loading
 */
export const loadJsonl = (
  location: string,
  options: { readonly skipInvalid?: boolean | undefined; readonly timeout?: number | undefined } = {}
): Effect.Effect<
  DatasetResult<ReadonlyArray<unknown>>,
  DatasetLoadError | PlatformError,
  FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> =>
  Effect.gen(function* () {
    const loadedAt = yield* Clock.currentTimeMillis;
    const skipInvalid = options.skipInvalid ?? false;
    const text = isUrl(location)
      ? yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS)
      : yield* readTextFile(location, "utf-8");

    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const records: Array<unknown> = [];
    for (const line of lines) {
      if (skipInvalid) {
        const parsed = yield* Effect.option(parseJson(line.trim(), location));
        if (parsed._tag === "Some") {
          records.push(parsed.value);
        }
      } else {
        records.push(yield* parseJson(line.trim(), location));
      }
    }

    return {
      data: records,
      meta: {
        format: "jsonl",
        loadedAt,
        location,
        sizeBytes: byteLength(text),
        sourceType: isUrl(location) ? "url" : "file",
      },
    };
  });

/**
 * Load and parse a single JSON document from a file or remote URL.
 *
 * @example
 * ```ts
 * import { loadJson } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * void loadJson("/tmp/data.json")
 * ```
 *
 * @since 0.0.0
 * @category loading
 */
export const loadJson = (
  location: string,
  options: { readonly timeout?: number | undefined } = {}
): Effect.Effect<
  DatasetResult<unknown>,
  DatasetLoadError | PlatformError,
  FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> =>
  Effect.gen(function* () {
    const result = yield* loadText(location, options);
    const data = yield* parseJson(result.data, location);
    return { data, meta: { ...result.meta, format: "json" } };
  });
