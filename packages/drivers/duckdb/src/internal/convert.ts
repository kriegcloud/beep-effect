/**
 * DuckDB to JavaScript read converters for the `effect/sql` client.
 *
 * Two converters are built once at module load, one for each SafeIntegers
 * mode. Each handles the DuckDB types whose `@duckdb/node-api` JS reading is
 * lossy, throws, or yields a shape the driver does not want (wide DECIMAL,
 * TIME, BIT, infinite, pre-epoch or out-of-range DATE/TIMESTAMP, BLOB
 * `Buffer`s, 64-bit and wider integers, INTERVAL micros), and delegates every other type to
 * `JSDuckDBValueConverter`, passing itself so nested LIST, ARRAY, STRUCT, MAP,
 * UNION and VARIANT values are converted by the same rules.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  DuckDBBlobValue,
  DuckDBDateValue,
  DuckDBDecimalValue,
  DuckDBIntervalValue,
  DuckDBTimestampMillisecondsValue,
  DuckDBTimestampNanosecondsValue,
  DuckDBTimestampSecondsValue,
  DuckDBTimestampTZValue,
  DuckDBTimestampValue,
  DuckDBTypeId,
  JSDuckDBValueConverter,
} from "@duckdb/node-api";
import { identity } from "effect/Function";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import type { DuckDBType, DuckDBValue, DuckDBValueConverter, JS } from "@duckdb/node-api";

type TypeConverter = (value: DuckDBValue, type: DuckDBType, self: DuckDBValueConverter<JS>) => JS;

type TypeConverters = { readonly [K in DuckDBTypeId]?: TypeConverter | undefined };

/** Widest DECIMAL that converts to a JS `number` without losing digits (D5). */
const MAX_EXACT_DECIMAL_WIDTH = 15;

const delegate: TypeConverter = (value, type, self) => JSDuckDBValueConverter(value, type, self);

const toPlainBytes = (bytes: Uint8Array): Uint8Array =>
  new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);

const bigintAsNumber: TypeConverter = (value, type, self) =>
  P.isBigInt(value) ? Number(value) : delegate(value, type, self);

const decimal: TypeConverter = (value, type, self) =>
  value instanceof DuckDBDecimalValue && value.width > MAX_EXACT_DECIMAL_WIDTH
    ? value.toString()
    : delegate(value, type, self);

const blob: TypeConverter = (value, type, self) =>
  value instanceof DuckDBBlobValue ? toPlainBytes(value.bytes) : delegate(value, type, self);

const asString: TypeConverter = (value) => String(value);

const MICROS_PER_MILLI = BigInt(1000);

const NANOS_PER_MILLI = BigInt(1000000);

/** Rounds toward negative infinity to a multiple of `unit` (BigInt `/` truncates toward zero). */
const flooredTo = (raw: bigint, unit: bigint): bigint => raw - (((raw % unit) + unit) % unit);

/**
 * Reads a DATE/TIMESTAMP value as a JS `Date`, or as a string when it is a
 * DuckDB infinity sentinel or outside the JS `Date` range (D30).
 *
 * The sentinels are checked first because only the TIMESTAMP and TIMESTAMPTZ
 * `toString` know them, and ±infinity TIMESTAMP_NS is inside the `Date` range.
 * `toMillisFloor` replaces the value with one whose sub-millisecond part is
 * floored, because the upstream reader truncates toward zero and would move a
 * pre-epoch instant forward across the second, day and year boundary.
 */
const temporal =
  <V extends DuckDBValue, N extends bigint | number>(
    isValue: (value: DuckDBValue) => value is V,
    raw: (value: V) => N,
    sentinels: { readonly PosInf: V; readonly NegInf: V },
    toMillisFloor: (value: V) => DuckDBValue
  ): TypeConverter =>
  (value, type, self) => {
    if (!isValue(value)) {
      return delegate(value, type, self);
    }
    const units = raw(value);
    if (units === raw(sentinels.PosInf)) {
      return "infinity";
    }
    if (units === raw(sentinels.NegInf)) {
      return "-infinity";
    }
    return Result.getOrElse(
      Result.try(() => delegate(toMillisFloor(value), type, self)),
      () => String(value)
    );
  };

const instanceGuard =
  <V>(valueClass: abstract new (...args: never) => V) =>
  (value: DuckDBValue): value is DuckDBValue & V =>
    value instanceof valueClass;

const date = temporal(instanceGuard(DuckDBDateValue), (value) => value.days, DuckDBDateValue, identity);

const timestamp = temporal(
  instanceGuard(DuckDBTimestampValue),
  (value) => value.micros,
  DuckDBTimestampValue,
  (value) => new DuckDBTimestampValue(flooredTo(value.micros, MICROS_PER_MILLI))
);

const timestampTz = temporal(
  instanceGuard(DuckDBTimestampTZValue),
  (value) => value.micros,
  DuckDBTimestampTZValue,
  (value) => new DuckDBTimestampTZValue(flooredTo(value.micros, MICROS_PER_MILLI))
);

const timestampNs = temporal(
  instanceGuard(DuckDBTimestampNanosecondsValue),
  (value) => value.nanos,
  DuckDBTimestampNanosecondsValue,
  (value) => new DuckDBTimestampNanosecondsValue(flooredTo(value.nanos, NANOS_PER_MILLI))
);

const timestampMs = temporal(
  instanceGuard(DuckDBTimestampMillisecondsValue),
  (value) => value.millis,
  DuckDBTimestampMillisecondsValue,
  identity
);

const timestampS = temporal(
  instanceGuard(DuckDBTimestampSecondsValue),
  (value) => value.seconds,
  DuckDBTimestampSecondsValue,
  identity
);

const intervalWithNumberMicros: TypeConverter = (value, type, self) =>
  value instanceof DuckDBIntervalValue
    ? { months: value.months, days: value.days, micros: Number(value.micros) }
    : delegate(value, type, self);

const sharedConverters: TypeConverters = {
  [DuckDBTypeId.DECIMAL]: decimal,
  [DuckDBTypeId.BLOB]: blob,
  [DuckDBTypeId.BIT]: asString,
  [DuckDBTypeId.TIME]: asString,
  [DuckDBTypeId.TIME_TZ]: asString,
  [DuckDBTypeId.TIME_NS]: asString,
  [DuckDBTypeId.DATE]: date,
  [DuckDBTypeId.TIMESTAMP]: timestamp,
  [DuckDBTypeId.TIMESTAMP_S]: timestampS,
  [DuckDBTypeId.TIMESTAMP_MS]: timestampMs,
  [DuckDBTypeId.TIMESTAMP_NS]: timestampNs,
  [DuckDBTypeId.TIMESTAMP_TZ]: timestampTz,
};

const numberConverters: TypeConverters = {
  ...sharedConverters,
  [DuckDBTypeId.BIGINT]: bigintAsNumber,
  [DuckDBTypeId.UBIGINT]: bigintAsNumber,
  [DuckDBTypeId.HUGEINT]: bigintAsNumber,
  [DuckDBTypeId.UHUGEINT]: bigintAsNumber,
  [DuckDBTypeId.BIGNUM]: bigintAsNumber,
  [DuckDBTypeId.INTERVAL]: intervalWithNumberMicros,
};

const makeConverter = (converters: TypeConverters): DuckDBValueConverter<unknown> => {
  const self: DuckDBValueConverter<JS> = (value, type) => {
    if (P.isNullish(value)) {
      return null;
    }
    const converter = converters[type.typeId];
    return converter === undefined ? delegate(value, type, self) : converter(value, type, self);
  };
  return (value, type) => self(value, type, self);
};

const numberConverter = makeConverter(numberConverters);

const safeIntegerConverter = makeConverter(sharedConverters);

/**
 * Selects the DuckDB value converter for a SafeIntegers mode.
 *
 * **Details**
 *
 * With `safeIntegers` off, BIGINT, UBIGINT, HUGEINT, UHUGEINT and BIGNUM read
 * as `number` (lossy above 2^53) and INTERVAL `micros` as `number`; with it on
 * they read as `bigint`. In both modes DECIMAL wider than 15 digits reads as
 * its exact string, TIME/TIME_TZ/TIME_NS as strings, BIT as its bit string
 * (`"101"`), BLOB as a plain `Uint8Array`, DATE/TIMESTAMP values of every
 * precision as a `Date` floored to the millisecond (also before the epoch),
 * DuckDB's `infinity`/`-infinity` as those strings, and values outside the JS
 * `Date` range as their string form.
 *
 * **Example** (Reading rows with the default converter)
 *
 * ```ts
 * import type { DuckDBConnection } from "@duckdb/node-api"
 * import { converterFor } from "./convert.ts"
 *
 * const readRows = async (connection: DuckDBConnection) => {
 *   const reader = await connection.runAndReadAll("select 1::bigint as n")
 *   return reader.convertRowObjects(converterFor(false))
 * }
 * console.log(readRows)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 * @internal
 */
export const converterFor = (safeIntegers: boolean): DuckDBValueConverter<unknown> =>
  safeIntegers ? safeIntegerConverter : numberConverter;
