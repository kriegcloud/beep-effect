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
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
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
 * Dataset formats supported by the file and URL loaders.
 *
 * @example
 * ```ts
 * import type { DatasetFormat } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * const format: DatasetFormat = "jsonl"
 * console.log(format)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const DatasetFormat = LiteralKit(["json", "jsonl", "lines", "text"]).annotate(
  $I.annote("DatasetFormat", {
    description: "Dataset formats supported by the file and URL loaders.",
  })
);

/**
 * Type for {@link DatasetFormat}.
 *
 * @example
 * ```ts
 * import type { DatasetFormat } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * const format: DatasetFormat = "text"
 * console.log(format)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type DatasetFormat = typeof DatasetFormat.Type;

/**
 * Provenance source channels supported by dataset loaders.
 *
 * @example
 * ```ts
 * import type { DatasetSourceType } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * const sourceType: DatasetSourceType = "file"
 * console.log(sourceType)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const DatasetSourceType = LiteralKit(["file", "url"]).annotate(
  $I.annote("DatasetSourceType", {
    description: "Provenance source channels supported by dataset loaders.",
  })
);

/**
 * Type for {@link DatasetSourceType}.
 *
 * @example
 * ```ts
 * import type { DatasetSourceType } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * const sourceType: DatasetSourceType = "url"
 * console.log(sourceType)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type DatasetSourceType = typeof DatasetSourceType.Type;

/**
 * Provenance metadata returned alongside every loaded dataset.
 *
 * @example
 * ```ts
 * import { DatasetMeta } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * const meta = DatasetMeta.make({
 *   format: "text",
 *   loadedAt: 0,
 *   location: "/tmp/data.txt",
 *   sourceType: "file"
 * })
 * console.log(meta.location)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class DatasetMeta extends S.Class<DatasetMeta>($I`DatasetMeta`)(
  {
    /** Detected dataset format (`"text"`, `"lines"`, `"jsonl"`, or `"json"`). */
    format: DatasetFormat.annotateKey({
      description: 'Detected dataset format (`"text"`, `"lines"`, `"jsonl"`, or `"json"`).',
    }),
    /** Unix epoch milliseconds when the dataset was loaded. */
    loadedAt: S.Finite.annotateKey({
      description: "Unix epoch milliseconds when the dataset was loaded.",
    }),
    /** Resolved location (file path or URL) the dataset was loaded from. */
    location: S.String.annotateKey({
      description: "Resolved location (file path or URL) the dataset was loaded from.",
    }),
    /** Content size in bytes when known. */
    sizeBytes: S.optionalKey(S.Finite).annotateKey({
      description: "Content size in bytes when known.",
    }),
    /** Source channel: `"file"` or `"url"`. */
    sourceType: DatasetSourceType.annotateKey({
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
 * @example
 * ```ts
 * import { DatasetResult } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 * import * as S from "effect/Schema"
 *
 * const TextDataset = DatasetResult(S.String)
 * const result = TextDataset.make({
 *   data: "hello",
 *   meta: { format: "text", loadedAt: 0, location: "/tmp/data.txt", sourceType: "file" }
 * })
 * console.log(result.data)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const DatasetResult = <Data extends S.Top>(data: Data) =>
  S.Class<{
    readonly data: Data["Type"];
    readonly meta: DatasetMeta;
  }>($I`DatasetResult`)(
    {
      data: data.annotateKey({
        description: "The loaded dataset value.",
      }),
      meta: DatasetMeta.annotateKey({
        description: "Provenance metadata for the load.",
      }),
    },
    $I.annote("DatasetResult", {
      description: "A loaded dataset payload paired with its provenance metadata.",
    })
  );

/**
 * Type for {@link DatasetResult}.
 *
 * @example
 * ```ts
 * import type { DatasetResult } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * const result: DatasetResult<string> = {
 *   data: "hello",
 *   meta: { format: "text", loadedAt: 0, location: "/tmp/data.txt", sourceType: "file" }
 * }
 * console.log(result.data)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type DatasetResult<A> = S.Schema.Type<ReturnType<typeof DatasetResult<S.Schema<A>>>>;

/**
 * Structured failure raised when a remote fetch or JSON decode fails.
 *
 * @example
 * ```ts
 * import { DatasetLoadError } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * const error = DatasetLoadError.make({ location: "https://example.com/data.json", message: "failed" })
 * console.log(error._tag)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class DatasetLoadError extends TaggedErrorClass<DatasetLoadError>($I`DatasetLoadError`)(
  "DatasetLoadError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })).annotateKey({
      description: "Underlying platform, HTTP, timeout, or schema failure when available.",
    }),
    message: S.String.annotateKey({
      description: "Safe diagnostic message for the dataset load failure.",
    }),
    location: S.String.annotateKey({
      description: "File path or URL that failed to load or decode.",
    }),
  },
  $I.annote("DatasetLoadError", {
    description: "Structured failure raised when a remote fetch or JSON decode fails.",
  })
) {}

const TextDatasetResult = DatasetResult(S.String);
const LinesDatasetResult = DatasetResult(S.String.pipe(S.Array));
const JsonDatasetResult = DatasetResult(S.Unknown);
const JsonlDatasetResult = DatasetResult(S.Unknown.pipe(S.Array));

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
 * console.log(isUrl("https://example.com/data.txt"))
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
 * addresses, RFC1918/ULA private network space, or the cloud metadata endpoint
 * (`169.254.169.254`).
 */
const isPrivate172 = (host: string): boolean =>
  pipe(
    Str.match(/^172\.(\d{1,3})\./)(host),
    O.flatMap(A.get(1)),
    O.map((octet) => Number.parseInt(octet, 10)),
    O.filter((n) => !Number.isNaN(n)),
    O.exists((n) => n >= 16 && n <= 31)
  );

const isInternalIpv4 = (host: string): boolean =>
  Str.startsWith("127.")(host) ||
  Str.startsWith("169.254.")(host) ||
  Str.startsWith("10.")(host) ||
  Str.startsWith("192.168.")(host) ||
  isPrivate172(host);

// Decode the IPv4 embedded in an IPv4-mapped IPv6 host. `new URL(...).hostname`
// normalizes mapped addresses to compressed hex (::ffff:c0a8:101), so the dotted
// prefixes never fire for URL input; decode hex and dotted suffixes back to IPv4
// so mapped private ranges classify like their bare form. None for non-mapped.
const extractMappedIpv4 = (host: string): O.Option<string> =>
  pipe(
    Str.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)(host),
    O.flatMap((groups) => O.all([A.get(groups, 1), A.get(groups, 2)])),
    O.map(([hi, lo]) => {
      const high = Number.parseInt(hi, 16);
      const low = Number.parseInt(lo, 16);
      return `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
    }),
    O.orElse(() => pipe(Str.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/)(host), O.flatMap(A.get(1))))
  );

const isBlockedRemoteHost = (hostname: string): boolean => {
  const host = pipe(Str.toLowerCase(hostname), Str.replace(/^\[|\]$/g, ""));
  // SSRF guard duplicated with @beep/schema SafeRemoteHost.isInternalHost by
  // design: each slice owns a self-contained, independently auditable blocklist
  // rather than coupling this driver to a foundation schema's internals.
  // IPv4-mapped IPv6 is decoded back to its IPv4 form so mapped private ranges
  // classify through the same isInternalIpv4 checks.
  // fallow-ignore-next-line code-duplication
  return (
    host === "localhost" ||
    Str.endsWith(".localhost")(host) ||
    host === "0.0.0.0" ||
    host === "::" ||
    host === "::1" ||
    Str.startsWith("fe80:")(host) ||
    Str.startsWith("fc")(host) ||
    Str.startsWith("fd")(host) ||
    isInternalIpv4(host) ||
    O.exists(extractMappedIpv4(host), isInternalIpv4)
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
 * console.log(loadText("/tmp/data.txt"))
 * ```
 *
 * @effects Reads the Effect `Clock`; local locations require `FileSystem` and
 * `Path`, while URL locations require `HttpClient` and fail with
 * `DatasetLoadError` on HTTP, timeout, or remote allow-list failures.
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
    return TextDatasetResult.make({
      data,
      meta: DatasetMeta.make({
        format: "text",
        loadedAt,
        location,
        sizeBytes: byteLength(data),
        sourceType: "url",
      }),
    });
  }
  const data = yield* readTextFile(location, options.encoding ?? "utf-8");
  return TextDatasetResult.make({
    data,
    meta: DatasetMeta.make({
      format: "text",
      loadedAt,
      location,
      sizeBytes: byteLength(data),
      sourceType: "file",
    }),
  });
});

/**
 * Load a dataset as an array of lines from a file or remote URL.
 *
 * @example
 * ```ts
 * import { loadLines } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * console.log(loadLines("/tmp/data.txt", { skipEmpty: true }))
 * ```
 *
 * @effects Reads the Effect `Clock`; local locations require `FileSystem` and
 * `Path`, while URL locations require `HttpClient` and fail with
 * `DatasetLoadError` on HTTP, timeout, or remote allow-list failures.
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
    return LinesDatasetResult.make({
      data,
      meta: DatasetMeta.make({
        format: "lines",
        loadedAt,
        location,
        sizeBytes: byteLength(text),
        sourceType: "url",
      }),
    });
  }
  const data = yield* readLines(
    location,
    R.getSomes({ skipEmpty: O.fromUndefinedOr(options.skipEmpty), trim: O.fromUndefinedOr(options.trim) })
  );
  // Read the raw text once more so file sources report `sizeBytes` like URL
  // sources do, keeping the provenance record consistent across channels.
  const rawText = yield* readTextFile(location, "utf-8");
  return LinesDatasetResult.make({
    data,
    meta: DatasetMeta.make({
      format: "lines",
      loadedAt,
      location,
      sizeBytes: byteLength(rawText),
      sourceType: "file",
    }),
  });
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
 * console.log(loadJsonl("/tmp/data.jsonl", { skipInvalid: true }))
 * ```
 *
 * @effects Reads the Effect `Clock`, loads text through either `FileSystem` and
 * `Path` or `HttpClient`, then decodes each JSONL line with the schema JSON
 * codec and reports malformed records through `DatasetLoadError` unless
 * `skipInvalid` drops them.
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
  const sourceType: DatasetSourceType = isUrl(location) ? "url" : "file";
  const text =
    sourceType === "url"
      ? yield* fetchText(location, options.timeout ?? DEFAULT_TIMEOUT_MS)
      : yield* readTextFile(location, "utf-8");

  const lines = pipe(Str.split(/\r?\n/)(text), A.map(Str.trim), A.filter(Str.isNonEmpty));
  const records = yield* Effect.forEach(
    lines,
    (line) => (skipInvalid ? Effect.option(parseJson(line, location)) : Effect.map(parseJson(line, location), O.some)),
    { concurrency: 1 }
  ).pipe(Effect.map(A.getSomes));

  return JsonlDatasetResult.make({
    data: records,
    meta: DatasetMeta.make({
      format: "jsonl",
      loadedAt,
      location,
      sizeBytes: byteLength(text),
      sourceType,
    }),
  });
});

/**
 * Load and parse a single JSON document from a file or remote URL.
 *
 * @example
 * ```ts
 * import { loadJson } from "@beep/nlp-mcp/Streaming/DatasetLoader"
 *
 * console.log(loadJson("/tmp/data.json"))
 * ```
 *
 * @effects Delegates text loading to {@link loadText}, then decodes the JSON
 * document with the schema JSON codec and fails with `DatasetLoadError` when
 * the document is malformed or the upstream text load fails.
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
  return JsonDatasetResult.make({
    data,
    meta: DatasetMeta.make({
      format: "json",
      loadedAt: result.meta.loadedAt,
      location: result.meta.location,
      ...R.getSomes({ sizeBytes: O.fromUndefinedOr(result.meta.sizeBytes) }),
      sourceType: result.meta.sourceType,
    }),
  });
});
