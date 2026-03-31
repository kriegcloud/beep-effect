/**
 * A module for CSV schema definitions.
 *
 * @module @beep/schema/csv
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { Effect, HashSet, Order, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { CsvCodecOptions, type CsvCodecOptionsArgs, CsvCodecOptionsParseOptions } from "./CsvCodecOptions.ts";
import { type CsvError, csvError } from "./CsvError.ts";
import { formatCsvDocument } from "./format/index.ts";
import { ParserOptions, parseCsvRows } from "./parse/index.ts";

const $I = $SchemaId.create("csv");

const CsvText = S.String.pipe(
  S.brand("CSV"),
  S.annotate(
    $I.annote("CsvText", {
      description: "Branded CSV document text.",
    })
  )
);

type RowSchemaWithFields = S.Top & {
  readonly fields: S.Struct.Fields;
};

const decodeCsvCodecOptions = S.decodeUnknownEffect(CsvCodecOptions);

const toSchemaIssue = (input: unknown, error: CsvError | S.SchemaError): SchemaIssue.Issue =>
  new SchemaIssue.InvalidValue(O.some(input), {
    message: error.message,
  });

const getSchemaColumns = <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema): ReadonlyArray<string> =>
  R.keys(rowSchema.fields);
const validateHeaderRow = Effect.fn("validateHeaderRow")(function* (
  headerRow: ReadonlyArray<string>,
  schemaColumns: ReadonlyArray<string>
) {
  let seen = HashSet.empty<string>();
  let duplicates = HashSet.empty<string>();

  for (const header of headerRow) {
    if (HashSet.has(seen, header)) {
      duplicates = HashSet.add(duplicates, header);
    } else {
      seen = HashSet.add(seen, header);
    }
  }

  const duplicateHeadersSorted = pipe(A.fromIterable(duplicates), A.sort(Order.String));

  if (A.isReadonlyArrayNonEmpty(duplicateHeadersSorted)) {
    return yield* csvError(`Duplicate headers found [${A.join(duplicateHeadersSorted, ", ")}]`);
  }

  const headerSet = HashSet.fromIterable(headerRow);
  const schemaSet = HashSet.fromIterable(schemaColumns);
  const missingHeaders = pipe(
    schemaColumns,
    A.filter((column) => !HashSet.has(headerSet, column)),
    A.sort(Order.String)
  );
  const extraHeaders = pipe(
    headerRow,
    A.filter((column) => !HashSet.has(schemaSet, column)),
    A.sort(Order.String)
  );

  if (A.isReadonlyArrayNonEmpty(missingHeaders) || A.isReadonlyArrayNonEmpty(extraHeaders)) {
    const details = pipe(
      [
        A.isReadonlyArrayNonEmpty(missingHeaders) ? `missing: ${A.join(missingHeaders, ", ")}` : null,
        A.isReadonlyArrayNonEmpty(extraHeaders) ? `unexpected: ${A.join(extraHeaders, ", ")}` : null,
      ],
      A.filter(P.isNotNull),
      A.join("; ")
    );

    return yield* csvError(`CSV header mismatch (${details}).`);
  }

  return yield* Effect.void;
});

const mapRowToHeaderRecord = (
  headerRow: ReadonlyArray<string>,
  row: ReadonlyArray<string>,
  strictColumnHandling: boolean
): Effect.Effect<Record<string, string>, CsvError> => {
  if (strictColumnHandling && row.length !== headerRow.length) {
    return Effect.fail(csvError(`Column header mismatch expected: ${headerRow.length} columns got: ${row.length}`));
  }

  if (row.length > headerRow.length) {
    return Effect.fail(csvError(`Column header mismatch expected: ${headerRow.length} columns got: ${row.length}`));
  }

  return Effect.succeed(
    R.fromEntries(
      pipe(
        headerRow,
        A.map((header, index) => [header, row.at(index) ?? ""] as const)
      )
    )
  );
};

const normalizeParserOptions = Effect.fn(function* (options?: CsvCodecOptionsArgs) {
  const decoded = yield* decodeCsvCodecOptions(options ?? {}, CsvCodecOptionsParseOptions);

  return {
    codec: decoded,
    parser: ParserOptions.new({
      comment: O.getOrNull(decoded.comment),
      delimiter: decoded.delimiter,
      escape: O.getOrNull(decoded.escape),
      ignoreEmpty: decoded.ignoreEmpty,
      ltrim: decoded.ltrim,
      maxRows: decoded.maxRows,
      quote: O.getOrNull(decoded.quote),
      rtrim: decoded.rtrim,
      skipLines: decoded.skipLines,
      skipRows: decoded.skipRows,
      strictColumnHandling: decoded.strictColumnHandling,
      trim: decoded.trim,
    }),
  };
});

const decodeCsvRowsEffect = <RowSchema extends RowSchemaWithFields>(
  rowSchema: RowSchema,
  options?: CsvCodecOptionsArgs
) =>
  Effect.fn(function* (input: string) {
    const normalized = yield* normalizeParserOptions(options);
    const rawRows = yield* parseCsvRows(input, normalized.parser);
    const rowsAfterSkippedLines = A.drop(rawRows, normalized.codec.skipLines);

    return yield* A.match(rowsAfterSkippedLines, {
      onEmpty: () => Effect.succeed(A.empty<RowSchema["Type"]>()),
      onNonEmpty: ([headerRow, ...dataRows]) =>
        Effect.gen(function* () {
          const schemaColumns = getSchemaColumns(rowSchema);

          yield* validateHeaderRow(headerRow, schemaColumns);

          const rowsAfterSkipRows = A.drop(dataRows, normalized.codec.skipRows);
          const rowsAfterLimit =
            normalized.codec.maxRows > 0 ? A.take(rowsAfterSkipRows, normalized.codec.maxRows) : rowsAfterSkipRows;

          const mappedRows = yield* Effect.forEach(rowsAfterLimit, (row) =>
            mapRowToHeaderRecord(headerRow, row, normalized.codec.strictColumnHandling)
          );

          return yield* S.decodeUnknownEffect(S.Array(rowSchema))(mappedRows);
        }),
    });
  });

const getEncodedCell = (row: unknown, column: string): Effect.Effect<string, CsvError> => {
  if (!P.isObject(row)) {
    return Effect.fail(csvError("Encoded CSV rows must be object-like values."));
  }

  if (!(column in row)) {
    return Effect.succeed("");
  }

  const value = row[column];

  if (P.isNull(value) || P.isUndefined(value)) {
    return Effect.succeed("");
  }

  if (P.isString(value)) {
    return Effect.succeed(value);
  }

  return Effect.fail(csvError(`Encoded CSV field '${column}' must be a string-compatible value.`));
};

const encodeCsvRowsEffect = <RowSchema extends RowSchemaWithFields>(
  rowSchema: RowSchema,
  options?: CsvCodecOptionsArgs
) =>
  Effect.fn(function* (rows: ReadonlyArray<RowSchema["Type"]>) {
    const normalized = yield* normalizeParserOptions(options);
    const schemaColumns = getSchemaColumns(rowSchema);
    const encodedRows = yield* S.encodeEffect(S.Array(rowSchema))(rows);
    const formattedRows = yield* Effect.forEach(encodedRows, (row) =>
      Effect.forEach(schemaColumns, (column) => getEncodedCell(row, column))
    );
    const document = yield* formatCsvDocument(schemaColumns, formattedRows, normalized.codec);

    return CsvText.makeUnsafe(document);
  });

/**
 * Schema factory for CSV documents whose rows are validated by the provided
 * row schema.
 *
 * The row schema must be an object-like Effect schema with named fields. CSV
 * cells remain string boundaries, so callers should use string-backed field
 * schemas such as `S.NumberFromString` when coercion is needed.
 *
 * @category Validation
 * @since 0.0.0
 */
export const CSV = <RowSchema extends RowSchemaWithFields>(rowSchema: RowSchema, options?: CsvCodecOptionsArgs) => {
  const decodeRows = decodeCsvRowsEffect(rowSchema, options);
  const encodeRows = encodeCsvRowsEffect(rowSchema, options);
  const rowsSchema = rowSchema.pipe(S.Array, S.toType);

  return CsvText.pipe(
    S.decodeTo(
      rowsSchema,
      SchemaTransformation.transformOrFail({
        decode: (input) =>
          pipe(
            input,
            decodeRows,
            Effect.mapError((error) => toSchemaIssue(input, error))
          ),
        encode: (rows) =>
          pipe(
            rows,
            encodeRows,
            Effect.mapError((error) => toSchemaIssue(rows, error))
          ),
      })
    ),
    S.annotate(
      $I.annote("CSV", {
        description: "Schema factory for branded CSV text decoded into typed row arrays.",
      })
    )
  );
};

/**
 * Runtime type for branded CSV text.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CsvText = typeof CsvText.Type;

/**
 * @since 0.0.0
 */
export * from "./CsvCodecOptions.ts";
/**
 * @since 0.0.0
 */
export * from "./CsvError.ts";
/**
 * @since 0.0.0
 */
export * from "./format/index.ts";
/**
 * @since 0.0.0
 */
export * from "./parse/index.ts";
