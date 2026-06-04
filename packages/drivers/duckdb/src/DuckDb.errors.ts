/**
 * Typed errors raised by the DuckDB driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { make } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { O, P } from "@beep/utils";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const { $DuckdbId } = make("duckdb");
const $I = $DuckdbId.create("DuckDb.errors");

const causeFromUnknown = (cause: unknown): unknown | undefined =>
  P.hasInspectableObjectShape(cause) && S.is(S.Defect({ includeStack: true }))(cause) ? cause : undefined;

const existingDuckDbError = (cause: unknown): O.Option<DuckDbError> =>
  S.is(DuckDbError)(cause) ? O.some(cause) : O.none();

/**
 * Options used when normalizing unknown DuckDB boundary failures.
 *
 * @example
 * ```ts
 * import { DuckDbErrorFromUnknownOptions } from "@beep/duckdb"
 *
 * const options = DuckDbErrorFromUnknownOptions.make({
 *   databasePath: "metrics.duckdb",
 *   statement: "select 1"
 * })
 * console.log(options)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class DuckDbErrorFromUnknownOptions extends S.Class<DuckDbErrorFromUnknownOptions>(
  $I`DuckDbErrorFromUnknownOptions`
)(
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    databasePath: S.optionalKey(S.String),
    message: S.optionalKey(S.String),
    statement: S.optionalKey(S.String),
  },
  $I.annote("DuckDbErrorFromUnknownOptions", {
    description: "Options used when normalizing unknown DuckDB boundary failures.",
  })
) {}

/**
 * Technical failure raised by the `@beep/duckdb` driver boundary.
 *
 * @example
 * ```ts
 * import { DuckDbError } from "@beep/duckdb"
 *
 * const error = DuckDbError.make({
 *   message: "DuckDB query failed.",
 *   operation: "query"
 * })
 *
 * console.log(error)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class DuckDbError extends TaggedErrorClass<DuckDbError>($I`DuckDbError`)(
  "DuckDbError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    databasePath: S.optionalKey(S.String),
    message: S.String,
    operation: S.String,
    statement: S.optionalKey(S.String),
  },
  $I.annote("DuckDbError", {
    description: "Technical DuckDB driver failure scoped to a driver operation.",
  })
) {
  /**
   * Normalize an unknown native DuckDB failure into a {@link DuckDbError}.
   *
   * @example
   * ```ts
   * import { DuckDbError } from "@beep/duckdb"
   *
   * const error = DuckDbError.fromUnknown("run", new Error("boom"), {
   *   statement: "select 1"
   * })
   *
   * console.log(error)
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown: {
    (operation: string, cause: unknown, options?: DuckDbErrorFromUnknownOptions): DuckDbError;
    (cause: unknown, options?: DuckDbErrorFromUnknownOptions): (operation: string) => DuckDbError;
  } = dual(
    (args) => args.length >= 2 && P.isString(args[0]),
    (operation: string, cause: unknown, options: DuckDbErrorFromUnknownOptions = {}): DuckDbError =>
      O.getOrElse(existingDuckDbError(cause), () =>
        DuckDbError.make({
          ...O.getSomesStruct({
            cause: O.fromUndefinedOr(causeFromUnknown(cause)),
            databasePath: O.fromUndefinedOr(options.databasePath),
            statement: O.fromUndefinedOr(options.statement),
          }),
          message: options.message ?? "DuckDB operation failed.",
          operation,
        })
      )
  );
}
