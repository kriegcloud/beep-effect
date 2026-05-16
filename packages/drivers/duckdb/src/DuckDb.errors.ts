/**
 * Typed errors raised by the DuckDB driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { make } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const { $DuckdbId } = make("duckdb");
const $I = $DuckdbId.create("DuckDb.errors");

const causeFromUnknown = (cause: unknown): unknown | undefined => (S.is(S.DefectWithStack)(cause) ? cause : undefined);

const existingDuckDbError = (cause: unknown): O.Option<DuckDbError> =>
  S.is(DuckDbError)(cause) ? O.some(cause) : O.none();

/**
 * Options used when normalizing unknown DuckDB boundary failures.
 *
 * @example
 * ```ts
 * import { DuckDbErrorFromUnknownOptions } from "@beep/duckdb"
 *
 * const options = new DuckDbErrorFromUnknownOptions({
 *   databasePath: "metrics.duckdb",
 *   statement: "select 1"
 * })
 * void options
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class DuckDbErrorFromUnknownOptions extends S.Class<DuckDbErrorFromUnknownOptions>(
  $I`DuckDbErrorFromUnknownOptions`
)(
  {
    cause: S.optionalKey(S.DefectWithStack),
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
 * const error = new DuckDbError({
 *   message: "DuckDB query failed.",
 *   operation: "query"
 * })
 *
 * void error
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class DuckDbError extends TaggedErrorClass<DuckDbError>($I`DuckDbError`)(
  "DuckDbError",
  {
    cause: S.optionalKey(S.DefectWithStack),
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
   * void error
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
      O.getOrElse(
        existingDuckDbError(cause),
        () =>
          new DuckDbError({
            ...R.getSomes({ cause: O.fromUndefinedOr(causeFromUnknown(cause)) }),
            ...R.getSomes({ databasePath: O.fromUndefinedOr(options.databasePath) }),
            message: options.message ?? "DuckDB operation failed.",
            operation,
            ...R.getSomes({ statement: O.fromUndefinedOr(options.statement) }),
          })
      )
  );
}
