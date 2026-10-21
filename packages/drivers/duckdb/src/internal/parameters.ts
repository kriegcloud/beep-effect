/**
 * JavaScript to DuckDB bind-parameter normalization for the `effect/sql` client.
 *
 * Normalization is value-driven only: the prepared statement's parameter types
 * are never consulted because DuckDB reports `INVALID` for untyped contexts.
 * Values DuckDB binds natively pass through; `Date`, byte arrays, non-empty
 * arrays and plain objects are converted; everything else fails with a typed
 * `SqlError` before any native call.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  blobValue,
  DuckDBArrayValue,
  DuckDBBitValue,
  DuckDBBlobValue,
  DuckDBDateValue,
  DuckDBDecimalValue,
  DuckDBIntervalValue,
  DuckDBListType,
  DuckDBListValue,
  DuckDBMapValue,
  DuckDBStructValue,
  DuckDBTimeNSValue,
  DuckDBTimestampMillisecondsValue,
  DuckDBTimestampNanosecondsValue,
  DuckDBTimestampSecondsValue,
  DuckDBTimestampTZValue,
  DuckDBTimestampValue,
  DuckDBTimeTZValue,
  DuckDBTimeValue,
  DuckDBTypeId,
  DuckDBUnionValue,
  DuckDBUUIDValue,
  DuckDBVariantValue,
  LIST,
  listValue,
  SQLNULL,
  timestampTZValue,
} from "@duckdb/node-api";
// beep: `typeForValue` is not re-exported from the package root; the package
// has no `exports` map, so this deep path is the module `bind` itself uses.
import { typeForValue } from "@duckdb/node-api/lib/typeForValue.js";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { SqlError, UnknownError } from "effect/sql/SqlError";
import { isPlainObject } from "./compiler.ts";
import type { DuckDBType, DuckDBValue } from "@duckdb/node-api";

const BIND_MESSAGE = "Failed to bind statement parameters";

const MICROS_PER_MILLI = BigInt(1000);

/** The value classes `@duckdb/node-api` `typeForValue` accepts as typed binds. */
const DUCKDB_VALUE_CLASSES = [
  DuckDBArrayValue,
  DuckDBBitValue,
  DuckDBBlobValue,
  DuckDBDateValue,
  DuckDBDecimalValue,
  DuckDBIntervalValue,
  DuckDBListValue,
  DuckDBMapValue,
  DuckDBStructValue,
  DuckDBTimestampMillisecondsValue,
  DuckDBTimestampNanosecondsValue,
  DuckDBTimestampSecondsValue,
  DuckDBTimestampTZValue,
  DuckDBTimestampValue,
  DuckDBTimeTZValue,
  DuckDBTimeValue,
  DuckDBTimeNSValue,
  DuckDBUnionValue,
  DuckDBUUIDValue,
  DuckDBVariantValue,
];

const encodeJsonText = S.encodeUnknownResult(S.fromJsonString(S.Unknown));

const isDuckDbValueInstance = (value: unknown): value is DuckDBValue =>
  A.some(DUCKDB_VALUE_CLASSES, (valueClass) => value instanceof valueClass);

const kindOf = (value: unknown): string => Object.prototype.toString.call(value).slice(8, -1);

type BindResult = Result.Result<DuckDBValue, string>;

type BindRule = (value: unknown) => O.Option<BindResult>;

const bindRule =
  <A>(guard: (value: unknown) => value is A, convert: (value: A) => BindResult): BindRule =>
  (value) =>
    guard(value) ? O.some(convert(value)) : O.none();

const isPassThroughScalar = (value: unknown): value is boolean | string | number | bigint =>
  P.isBoolean(value) || P.isString(value) || P.isNumber(value) || P.isBigInt(value);

const isInt8Array = (value: unknown): value is Int8Array => value instanceof Int8Array;

const bindDate = (value: Date): BindResult => {
  const millis = value.getTime();
  return Number.isNaN(millis)
    ? Result.fail("invalid Date")
    : Result.succeed(timestampTZValue(BigInt(millis) * MICROS_PER_MILLI));
};

const bindArray = (value: ReadonlyArray<unknown>): BindResult =>
  A.isReadonlyArrayNonEmpty(value)
    ? Result.map(Result.all(A.map(value, normalizeParameter)), listValue)
    : Result.fail("cannot bind an empty array without a type; pass a typed DuckDB list value or use sql.in");

/** Ordered bind rules; the first matching guard decides the conversion. */
const BIND_RULES: ReadonlyArray<BindRule> = [
  bindRule(P.isNullish, () => Result.succeed(null)),
  bindRule(isPassThroughScalar, Result.succeed),
  bindRule(P.isDate, bindDate),
  bindRule(P.isUint8Array, (value) => Result.succeed(blobValue(value))),
  bindRule(isInt8Array, (value) =>
    Result.succeed(blobValue(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)))
  ),
  bindRule(isDuckDbValueInstance, Result.succeed),
  bindRule(A.isArray, bindArray),
  bindRule(isPlainObject, (value) =>
    Result.mapError(encodeJsonText(value), () => "plain object is not JSON-serializable")
  ),
];

const normalizeParameter = (value: unknown): BindResult =>
  O.getOrElse(
    A.findFirst(BIND_RULES, (rule) => rule(value)),
    () => Result.fail(`unsupported bind parameter of type ${kindOf(value)}`)
  );

const isListValue = (value: DuckDBValue): value is DuckDBListValue => value instanceof DuckDBListValue;

const isNotNullValue = (value: DuckDBValue): boolean => value !== null;

const hasNullLeaf = (type: DuckDBType): boolean =>
  type.typeId === DuckDBTypeId.SQLNULL || (type instanceof DuckDBListType && hasNullLeaf(type.valueType));

/** The first item type without a `NULL` leaf, so `[[null], [null, 2]]` types as `INTEGER[][]`. */
const listItemType = (items: ReadonlyArray<DuckDBValue>): DuckDBType => {
  const types = A.map(A.filter(items, isNotNullValue), bindTypeOf);
  return pipe(
    A.findFirst(types, (type) => !hasNullLeaf(type)),
    O.orElse(() => A.head(types)),
    O.getOrElse(() => SQLNULL)
  );
};

/**
 * The bind type of one normalized value. `typeForValue` types a LIST from its
 * first item only, so a leading `NULL` would type the list `LIST(SQLNULL)` and
 * bind every item as `NULL`; lists are typed from their first item whose type
 * has no `NULL` leaf.
 */
const bindTypeOf = (value: DuckDBValue): DuckDBType =>
  isListValue(value) ? LIST(listItemType(value.items)) : typeForValue(value);

/**
 * Explicit bind types for normalized parameters.
 *
 * **Details**
 *
 * LIST values are typed from their first item whose type has no `NULL` leaf
 * (recursively); every other value gets the same `typeForValue` type DuckDB
 * infers for an untyped bind, so only lists bind differently. A list whose
 * items are all `NULL` stays `LIST(SQLNULL)`.
 *
 * **Example** (Typing a list with a leading null)
 *
 * ```ts
 * import * as Result from "effect/Result"
 * import { bindTypes, normalizeParameters } from "./parameters.ts"
 *
 * const binds = Result.getOrThrow(normalizeParameters([[null, 7]], "execute"))
 * console.log(String(bindTypes(binds)[0])) // "INTEGER[]"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 * @internal
 */
export const bindTypes = (binds: ReadonlyArray<DuckDBValue>): Array<DuckDBType> => A.map(binds, bindTypeOf);

/**
 * Normalizes statement parameters into DuckDB bind values.
 *
 * **Details**
 *
 * `null`/`undefined` bind as `NULL`; booleans, strings, numbers and bigints
 * pass through; a valid `Date` binds as a TIMESTAMPTZ instant; `Uint8Array`
 * and `Int8Array` bind as BLOB; typed `DuckDB*Value` instances pass through; a
 * non-empty array binds as a LIST of normalized items, typed from its first
 * non-null item through {@link bindTypes}; a plain object binds as JSON text. The first value that cannot be bound fails the whole call.
 *
 * **Gotchas**
 *
 * An empty array, an invalid `Date`, a plain object holding a bigint or a
 * cycle, and any other value (Map, Set, class instance, symbol, function)
 * fail with an `UnknownError` whose message starts with
 * `Failed to bind statement parameters:`.
 *
 * **Example** (Normalizing parameters before a native bind)
 *
 * ```ts
 * import * as Result from "effect/Result"
 * import { normalizeParameters } from "./parameters.ts"
 *
 * const normalized = normalizeParameters([1, "a", null, { tag: "x" }], "execute")
 * console.log(Result.isSuccess(normalized)) // true
 * ```
 *
 * @category utilities
 * @since 0.0.0
 * @internal
 */
export const normalizeParameters: {
  (operation: string): (params: ReadonlyArray<unknown>) => Result.Result<Array<DuckDBValue>, SqlError>;
  (params: ReadonlyArray<unknown>, operation: string): Result.Result<Array<DuckDBValue>, SqlError>;
} = dual(
  2,
  (params: ReadonlyArray<unknown>, operation: string): Result.Result<Array<DuckDBValue>, SqlError> =>
    Result.all(
      A.map(params, (param, index) =>
        Result.mapError(normalizeParameter(param), (detail) =>
          SqlError.make({
            reason: UnknownError.make({
              cause: `parameter ${index} of type ${kindOf(param)}`,
              message: `${BIND_MESSAGE}: ${detail}`,
              operation,
            }),
          })
        )
      )
    )
);
