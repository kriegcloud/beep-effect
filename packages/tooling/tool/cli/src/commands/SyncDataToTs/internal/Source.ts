/**
 * Shared source acquisition and rendering helpers for sync-data-to-ts targets.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { CSV } from "@beep/schema/Csv";
import { parseCsvRows } from "@beep/schema/CsvParser";
import { ParserOptions } from "@beep/schema/ParserOptions";
import { XmlTextToUnknown } from "@beep/schema/Xml";
import { A, Str } from "@beep/utils";
import { cast } from "@beep/utils/Function";
import { Effect, Encoding, pipe, Result } from "effect";
import * as Crypto from "effect/Crypto";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import * as jsonc from "jsonc-parser";
import { SyncDataToTsError } from "../SyncDataToTs.errors.js";
import { SyncDataOutputFile, SyncDataSourceMetadata } from "./Models.js";

const $I = $RepoCliId.create("commands/SyncDataToTs/internal/Source");

const textDecoder = new TextDecoder();
const decodeJsonText = S.decodeUnknownEffect(S.UnknownFromJsonString);
const decodeXmlText = S.decodeUnknownEffect(XmlTextToUnknown);
const encodeUnknownJsonResult = S.encodeUnknownResult(S.UnknownFromJsonString);
const defaultCsvParserOptions = ParserOptions.new();

const ParsedCsvRecord = S.Record(S.String, S.String).pipe(
  $I.annoteSchema("ParsedCsvRecord", {
    description: "One CSV row keyed by header name with string cell values.",
  })
);
type ParsedCsvRecord = typeof ParsedCsvRecord.Type;

export type ParsedCsvRecords = Array<ParsedCsvRecord> & {
  readonly columns: ReadonlyArray<string>;
};

/**
 * Raw fetched source with stable hash metadata.
 *
 * @category models
 * @since 0.0.0
 */
export interface SyncDataFetchedSource {
  readonly id: string;
  readonly url: string;
  readonly bytes: Uint8Array;
  readonly text: string;
  readonly sha256: string;
}

const attachCsvColumns = (rows: ReadonlyArray<ParsedCsvRecord>, columns: ReadonlyArray<string>): ParsedCsvRecords => {
  const records = A.fromIterable(rows);

  Reflect.defineProperty(records, "columns", {
    configurable: true,
    enumerable: true,
    value: columns,
    writable: false,
  });

  return cast<Array<ParsedCsvRecord>, ParsedCsvRecords>(records);
};

/**
 * Pretty-print a JSON value as canonical JSON with a trailing newline.
 *
 * @category formatting
 * @since 0.0.0
 */
export const formatJson = (value: unknown): string => {
  const encoded = Result.getOrThrow(encodeUnknownJsonResult(value));
  const edits = jsonc.format(encoded, undefined, {
    tabSize: 2,
    insertSpaces: true,
  });
  return `${jsonc.applyEdits(encoded, edits)}\n`;
};

/**
 * Pretty-print a JSON-compatible value as a TypeScript literal.
 *
 * @category formatting
 * @since 0.0.0
 */
export const formatTsLiteral = (value: unknown): string =>
  pipe(formatJson(value).trimEnd(), Str.replaceAll(/"([A-Za-z_$][A-Za-z0-9_$]*)":/g, "$1:"));

/**
 * Create a generated output file value.
 *
 * @category constructors
 * @since 0.0.0
 */
export const outputFile = (path: string, content: string): SyncDataOutputFile =>
  SyncDataOutputFile.make({ path, content });

/**
 * Create stable source metadata.
 *
 * @category constructors
 * @since 0.0.0
 */
export const sourceMetadata = (
  source: SyncDataFetchedSource,
  extras: {
    readonly version?: string;
    readonly published?: string;
  } = {}
): SyncDataSourceMetadata =>
  SyncDataSourceMetadata.make({
    id: source.id,
    url: source.url,
    sha256: source.sha256,
    ...extras,
  });

const readResponseBytes = Effect.fn("SyncDataToTs.readResponseBytes")(function* (
  response: HttpClientResponse.HttpClientResponse,
  targetId: string,
  url: string
) {
  const buffer = yield* response.arrayBuffer.pipe(
    SyncDataToTsError.mapError(`Failed to read response body from ${url}`, targetId)
  );
  return new Uint8Array(buffer);
});

const sha256Hex = Effect.fn("SyncDataToTs.sha256Hex")(function* (bytes: Uint8Array, targetId: string, url: string) {
  const crypto = yield* Crypto.Crypto;
  const digest = yield* crypto.digest("SHA-256", bytes).pipe(
    SyncDataToTsError.mapError(`Failed to compute SHA-256 digest for ${url}`, targetId)
  );
  return Encoding.encodeHex(digest);
});

/**
 * Fetch a source URL as bytes and text while computing a stable SHA-256 hash.
 *
 * @category getters
 * @since 0.0.0
 */
export const fetchSource = Effect.fn("SyncDataToTs.fetchSource")(function* (
  targetId: string,
  id: string,
  url: string
): Effect.fn.Return<SyncDataFetchedSource, SyncDataToTsError, HttpClient.HttpClient | Crypto.Crypto> {
  const response = yield* HttpClient.get(url).pipe(
    SyncDataToTsError.mapError(`Failed to fetch ${url}`, targetId),
    Effect.flatMap((response) => HttpClientResponse.filterStatusOk(response)),
    SyncDataToTsError.mapError(`Received a non-2xx response from ${url}`, targetId)
  );
  const bytes = yield* readResponseBytes(response, targetId, url);
  const sha256 = yield* sha256Hex(bytes, targetId, url);

  return {
    id,
    url,
    bytes,
    text: textDecoder.decode(bytes),
    sha256,
  };
});

/**
 * Parse a fetched source as JSON.
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseJsonSource = (targetId: string, source: SyncDataFetchedSource): Effect.Effect<unknown, SyncDataToTsError> =>
  decodeJsonText(source.text).pipe(SyncDataToTsError.mapError(`Failed to parse JSON payload for ${targetId}`, targetId));

/**
 * Parse a fetched source as XML.
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseXmlSource = (targetId: string, source: SyncDataFetchedSource): Effect.Effect<unknown, SyncDataToTsError> =>
  decodeXmlText(source.text).pipe(SyncDataToTsError.mapError(`Failed to parse XML payload for ${targetId}`, targetId));

const decodeCsvText = Effect.fn("SyncDataToTs.decodeCsvText")(function* (content: string) {
  const rawRows = yield* parseCsvRows(content, defaultCsvParserOptions);

  return yield* A.match(rawRows, {
    onEmpty: () => Effect.succeed(attachCsvColumns([], [])),
    onNonEmpty: ([headerRow]) => {
      const rowFields: Record<string, typeof S.String> = pipe(
        headerRow,
        A.map((header) => [header, S.String] as const),
        R.fromEntries
      );

      class ParsedCsvRow extends S.Class<ParsedCsvRow>($I`ParsedCsvRow`)(
        rowFields,
        $I.annote("ParsedCsvRow", {
          description: "CSV row decoded with the runtime header columns from the source document.",
        })
      ) {}

      return S.decodeUnknownEffect(CSV({})(ParsedCsvRow))(content).pipe(
        Effect.map((rows) => attachCsvColumns(rows as ReadonlyArray<ParsedCsvRecord>, headerRow))
      );
    },
  });
});

/**
 * Parse a fetched source as CSV.
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseCsvSource = (
  targetId: string,
  source: SyncDataFetchedSource
): Effect.Effect<ParsedCsvRecords, SyncDataToTsError> =>
  decodeCsvText(source.text).pipe(SyncDataToTsError.mapError(`Failed to parse CSV payload for ${targetId}`, targetId));
