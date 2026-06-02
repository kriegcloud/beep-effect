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

import { $NlpMcpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { Clock, Duration, Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { readLines, readTextFile } from "./TextStream.ts";
import type { TextEncoding } from "./TextStream.ts";

const $I = $NlpMcpId.create("Streaming/DatasetLoader");

/**
 * Provenance metadata returned alongside every loaded dataset.
 *
 * @since 0.0.0
 * @category models
 */
export class DatasetMeta extends S.Class<DatasetMeta>($I`DatasetMeta`)(
  {
    /** Detected dataset format (`"text"`, `"lines"`, `"jsonl"`, or `"json"`). */
    format: S.String.annotateKey({
      description: 'Detected dataset format (`"text"`, `"lines"`, `"jsonl"`, or `"json"`).',
    }),
    /** Unix epoch milliseconds when the dataset was loaded. */
    loadedAt: S.Number.annotateKey({
      description: "Unix epoch milliseconds when the dataset was loaded.",
    }),
    /** Resolved location (file path or URL) the dataset was loaded from. */
    location: S.String.annotateKey({
      description: "Resolved location (file path or URL) the dataset was loaded from.",
    }),
    /** Content size in bytes when known. */
    sizeBytes: S.optionalKey(S.Number).annotateKey({
      description: "Content size in bytes when known.",
    }),
    /** Source channel: `"file"` or `"url"`. */
    sourceType: S.String.annotateKey({
      description: 'Source channel: `"file"` or `"url"`.',
    }),
  },
  $I.annote("DatasetMeta", {
    description: "Provenance metadata returned alongside every loaded dataset.",
  })
) {}

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
export class DatasetLoadError extends TaggedErrorClass<DatasetLoadError>($I`DatasetLoadError`)("DatasetLoadError", {
  cause: S.optionalKey(S.DefectWithStack),
  message: S.String,
  location: S.String,
}) {}

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
export const isUrl = (location: string): boolean =>
  Str.startsWith("http://")(location) || Str.startsWith("https://")(location);

/**
 * Reject hostnames that resolve to the local host or to private/internal
 * network space. This bounds the SSRF surface of the URL-backed loaders: the
 * `location` is attacker-controllable through the MCP tool parameters, so a
 * prompt-injected agent must not be able to reach loopback services, link-local
 * addresses, or the cloud metadata endpoint (`169.254.169.254`).
 */
const isBlockedRemoteHost = (hostname: string): boolean => {
  const host = pipe(Str.toLowerCase(hostname), Str.replace(/^\[|\]$/g, ""));
  return (
    host === "localhost" ||
    Str.endsWith(".localhost")(host) ||
    host === "0.0.0.0" ||
    host === "::" ||
    host === "::1" ||
    Str.startsWith("127.")(host) ||
    Str.startsWith("169.254.")(host) ||
    Str.startsWith("fe80:")(host) ||
    Str.startsWith("fc")(host) ||
    Str.startsWith("fd")(host)
  );
};

const assertAllowedRemote = (location: string): Effect.Effect<void, DatasetLoadError> =>
  Effect.try({
    catch: () => DatasetLoadError.make({ location, message: `Invalid URL: ${location}` }),
    try: () => new URL(location).hostname,
  }).pipe(
    Effect.flatMap((hostname) =>
      isBlockedRemoteHost(hostname)
        ? Effect.fail(
            DatasetLoadError.make({
              location,
              message: `Refusing to load from a loopback, link-local, or private host: ${hostname}`,
            })
          )
        : Effect.void
    )
  );

const fetchText = (
  location: string,
  timeoutMs: number
): Effect.Effect<string, DatasetLoadError, HttpClient.HttpClient> =>
  assertAllowedRemote(location).pipe(
    Effect.andThen(
      HttpClient.get(location).pipe(
        Effect.flatMap(HttpClientResponse.filterStatusOk),
        Effect.flatMap((response) => response.text),
        Effect.timeout(Duration.millis(timeoutMs)),
        Effect.mapError((cause) =>
          DatasetLoadError.make({
            cause,
            location,
            message: String(cause),
          })
        )
      )
    )
  );

const parseJson = (value: string, location: string): Effect.Effect<unknown, DatasetLoadError> =>
  decodeJson(value).pipe(
    Effect.mapError((cause) =>
      DatasetLoadError.make({
        cause,
        location,
        message: String(cause),
      })
    )
  );

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
 * @category constructors
 */
export const loadText = Effect.fn("DatasetLoader.loadText")(function* (
  location: string,
  options: {
    readonly encoding?: TextEncoding | undefined;
    readonly timeout?: number | undefined;
  } = {}
) {
  const loadedAt = yield* Clock.currentTimeMillis;
  if (isUrl(location)) {
    const data = yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS);
    return {
      data,
      meta: DatasetMeta.make({
        format: "text",
        loadedAt,
        location,
        sizeBytes: byteLength(data),
        sourceType: "url",
      }),
    };
  }
  const data = yield* readTextFile(location, options.encoding ?? "utf-8");
  return {
    data,
    meta: DatasetMeta.make({
      format: "text",
      loadedAt,
      location,
      sizeBytes: byteLength(data),
      sourceType: "file",
    }),
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
 * @category constructors
 */
export const loadLines = Effect.fn("DatasetLoader.loadLines")(function* (
  location: string,
  options: {
    readonly skipEmpty?: boolean | undefined;
    readonly timeout?: number | undefined;
    readonly trim?: boolean | undefined;
  } = {}
) {
  const loadedAt = yield* Clock.currentTimeMillis;
  if (isUrl(location)) {
    const text = yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS);
    // Split on CRLF or LF so remote datasets decode identically to local files
    // (where `Stream.splitLines` already strips the trailing `\r`).
    const data = pipe(
      Str.split(/\r?\n/)(text),
      A.map((line) => (options.trim === true ? Str.trim(line) : line)),
      A.filter((line) => options.skipEmpty !== true || Str.isNonEmpty(line))
    );
    return {
      data,
      meta: DatasetMeta.make({
        format: "lines",
        loadedAt,
        location,
        sizeBytes: byteLength(text),
        sourceType: "url",
      }),
    };
  }
  const data = yield* readLines(
    location,
    R.getSomes({ skipEmpty: O.fromUndefinedOr(options.skipEmpty), trim: O.fromUndefinedOr(options.trim) })
  );
  // Read the raw text once more so file sources report `sizeBytes` like URL
  // sources do, keeping the provenance record consistent across channels.
  const rawText = yield* readTextFile(location, "utf-8");
  return {
    data,
    meta: DatasetMeta.make({
      format: "lines",
      loadedAt,
      location,
      sizeBytes: byteLength(rawText),
      sourceType: "file",
    }),
  };
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
 * @category constructors
 */
export const loadJsonl = Effect.fn("DatasetLoader.loadJsonl")(function* (
  location: string,
  options: {
    readonly skipInvalid?: boolean | undefined;
    readonly timeout?: number | undefined;
  } = {}
) {
  const loadedAt = yield* Clock.currentTimeMillis;
  const skipInvalid = options.skipInvalid ?? false;
  const text = isUrl(location)
    ? yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS)
    : yield* readTextFile(location, "utf-8");

  const lines = pipe(Str.split(/\r?\n/)(text), A.map(Str.trim), A.filter(Str.isNonEmpty));
  const records: Array<unknown> = [];
  for (const line of lines) {
    if (skipInvalid) {
      const parsed = yield* Effect.option(parseJson(line, location));
      if (O.isSome(parsed)) {
        records.push(parsed.value);
      }
    } else {
      records.push(yield* parseJson(line, location));
    }
  }

  return {
    data: records,
    meta: DatasetMeta.make({
      format: "jsonl",
      loadedAt,
      location,
      sizeBytes: byteLength(text),
      sourceType: isUrl(location) ? "url" : "file",
    }),
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
 * @category constructors
 */
export const loadJson = Effect.fn("DatasetLoader.loadJson")(function* (
  location: string,
  options: { readonly timeout?: number | undefined } = {}
) {
  const result = yield* loadText(location, options);
  const data = yield* parseJson(result.data, location);
  return {
    data,
    meta: DatasetMeta.make({
      format: "json",
      loadedAt: result.meta.loadedAt,
      location: result.meta.location,
      ...R.getSomes({ sizeBytes: O.fromUndefinedOr(result.meta.sizeBytes) }),
      sourceType: result.meta.sourceType,
    }),
  };
});
