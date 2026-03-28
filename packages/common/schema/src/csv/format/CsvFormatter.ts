/**
 * Whole-text CSV formatting helpers.
 *
 * @module @beep/schema/csv/format/CsvFormatter
 * @since 0.0.0
 */

import { thunkFalse } from "@beep/utils";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { CsvCodecOptions } from "../CsvCodecOptions.ts";
import { type CsvError, csvError } from "../CsvError.ts";

const rowDelimiter = "\n";

const stripNullBytes = Str.replace(/\0/g, "");

const getEscapedQuote = (options: CsvCodecOptions): O.Option<string> =>
  pipe(
    options.quote,
    O.flatMap((quote) =>
      pipe(
        options.escapeChar,
        O.map((escape) => `${escape}${quote}`)
      )
    )
  );

const requiresQuoting = (value: string, options: CsvCodecOptions, fieldIndex: number): boolean =>
  pipe(
    options.quote,
    O.match({
      onNone: () =>
        Str.includes(options.delimiter)(value) ||
        Str.includes("\r")(value) ||
        Str.includes("\n")(value) ||
        pipe(
          options.comment,
          O.match({
            onNone: thunkFalse,
            onSome: (comment) => fieldIndex === 0 && Str.startsWith(comment)(value),
          })
        ),
      onSome: (quote) =>
        Str.includes(options.delimiter)(value) ||
        Str.includes("\r")(value) ||
        Str.includes("\n")(value) ||
        Str.includes(quote)(value) ||
        pipe(
          options.comment,
          O.match({
            onNone: thunkFalse,
            onSome: (comment) => fieldIndex === 0 && Str.startsWith(comment)(value),
          })
        ),
    })
  );

const escapeField = (value: string, options: CsvCodecOptions): string =>
  pipe(
    options.quote,
    O.match({
      onNone: () => value,
      onSome: (quote) =>
        pipe(
          value,
          (field) =>
            pipe(
              options.escapeChar,
              O.match({
                onNone: () => field,
                onSome: (escapeChar) =>
                  escapeChar === quote ? field : Str.replaceAll(escapeChar, `${escapeChar}${escapeChar}`)(field),
              })
            ),
          (field) =>
            pipe(
              getEscapedQuote(options),
              O.match({
                onNone: () => field,
                onSome: (escapedQuote) => Str.replaceAll(quote, escapedQuote)(field),
              })
            )
        ),
    })
  );

const formatField = (value: string, fieldIndex: number, options: CsvCodecOptions): Effect.Effect<string, CsvError> => {
  const prepared = stripNullBytes(value);

  if (!requiresQuoting(prepared, options, fieldIndex)) {
    return Effect.succeed(prepared);
  }

  return pipe(
    options.quote,
    O.match({
      onNone: () =>
        Effect.fail(csvError(`Unable to encode field '${prepared}' without a configured quote character.`, fieldIndex)),
      onSome: (quote) => Effect.succeed(`${quote}${escapeField(prepared, options)}${quote}`),
    })
  );
};

/**
 * Format a CSV header row.
 *
 * @category Utility
 * @since 0.0.0
 */
export const formatCsvHeaderRow = Effect.fn(function* (headers: ReadonlyArray<string>, options: CsvCodecOptions) {
  const fields = yield* Effect.forEach(headers, (header, index) => formatField(header, index, options));
  return A.join(fields, options.delimiter);
});

/**
 * Format a CSV data row.
 *
 * @category Utility
 * @since 0.0.0
 */
export const formatCsvDataRow = Effect.fn(function* (fields: ReadonlyArray<string>, options: CsvCodecOptions) {
  const encodedFields = yield* Effect.forEach(fields, (field, index) => formatField(field, index, options));
  return A.join(encodedFields, options.delimiter);
});

/**
 * Format a whole CSV document.
 *
 * @category Utility
 * @since 0.0.0
 */
export const formatCsvDocument = Effect.fn(function* (
  headers: ReadonlyArray<string>,
  rows: ReadonlyArray<ReadonlyArray<string>>,
  options: CsvCodecOptions
) {
  const header = yield* formatCsvHeaderRow(headers, options);
  const dataRows = yield* Effect.forEach(rows, (row) => formatCsvDataRow(row, options));
  return pipe([header, ...dataRows], A.join(rowDelimiter));
});
