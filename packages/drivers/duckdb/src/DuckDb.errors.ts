/**
 * Typed error models and normalization helpers for the DuckDB driver boundary.
 *
 * @remarks
 * Native `@duckdb/node-api` failures enter this package as `unknown`. The
 * exported normalizer converts them into a single tagged error shape so callers
 * can catch `DuckDbError` without depending on native error internals.
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
 * Diagnostic context captured while normalizing an unknown DuckDB failure.
 *
 * @remarks
 * `databasePath` and `statement` are copied into the resulting
 * {@link DuckDbError} when present. The unknown failure value supplied to
 * {@link DuckDbError.fromUnknown} is retained only when it has an inspectable
 * defect shape, keeping opaque native values out of the public error payload.
 *
 * @example
 * ```ts
 * import { DuckDbError, DuckDbErrorFromUnknownOptions } from "@beep/duckdb"
 *
 * const options = DuckDbErrorFromUnknownOptions.make({
 *   databasePath: "metrics.duckdb",
 *   statement: "select * from missing_table"
 * })
 *
 * const error = DuckDbError.fromUnknown("query", new Error("no table"), options)
 * console.log(error.statement) // "select * from missing_table"
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
 * Recoverable technical failure raised by the DuckDB driver boundary.
 *
 * @remarks
 * The error captures the driver operation that failed plus optional database
 * path and SQL statement context. Native failures are normalized through
 * {@link DuckDbError.fromUnknown}; callers usually handle this error by tag in
 * the Effect failure channel.
 *
 * @example
 * ```ts
 * import { DuckDbError } from "@beep/duckdb"
 * import { Effect } from "effect"
 *
 * const failing = Effect.fail(DuckDbError.make({
 *   message: "DuckDB query failed.",
 *   operation: "query"
 * }))
 *
 * const recovered = failing.pipe(
 *   Effect.catchTag("DuckDbError", (error) => Effect.succeed(error.operation))
 * )
 *
 * Effect.runPromise(recovered).then(console.log) // "query"
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
   * Normalize an unknown native DuckDB failure into a tagged driver error.
   *
   * @remarks
   * Existing {@link DuckDbError} values are returned unchanged, which lets
   * adapter code call the normalizer at multiple boundaries without wrapping
   * the same failure repeatedly. The helper supports both data-first and
   * data-last forms for use in `Effect.mapError` and `Effect.try*` callbacks.
   *
   * @example
   * ```ts
   * import { DuckDbError } from "@beep/duckdb"
   *
   * const normalizeRunFailure = DuckDbError.fromUnknown(new Error("boom"), {
   *   databasePath: ":memory:"
   * })
   *
   * const error = normalizeRunFailure("run")
   * console.log(error.operation) // "run"
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
