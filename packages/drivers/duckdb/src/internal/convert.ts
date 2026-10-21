/**
 * DuckDB to JavaScript read converters for the `effect/sql` client.
 *
 * Two converters are built once at module load, one for each SafeIntegers
 * mode. Each handles the DuckDB types whose `@duckdb/node-api` JS reading is
 * lossy, throws, or yields a shape the driver does not want (wide DECIMAL,
 * TIME, out-of-range DATE/TIMESTAMP, BLOB `Buffer`s, 64-bit and wider
 * integers, INTERVAL micros), and delegates every other type to
 * `JSDuckDBValueConverter`, passing itself so nested LIST, ARRAY, STRUCT, MAP,
 * UNION and VARIANT values are converted by the same rules.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  DuckDBBlobValue,
  DuckDBDecimalValue,
  DuckDBIntervalValue,
  DuckDBTypeId,
  JSDuckDBValueConverter,
} from "@duckdb/node-api";
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

const timeString: TypeConverter = (value) => String(value);

const dateOrString: TypeConverter = (value, type, self) =>
  Result.getOrElse(
    Result.try(() => delegate(value, type, self)),
    () => String(value)
  );

const intervalWithNumberMicros: TypeConverter = (value, type, self) =>
  value instanceof DuckDBIntervalValue
    ? { months: value.months, days: value.days, micros: Number(value.micros) }
    : delegate(value, type, self);

const sharedConverters: TypeConverters = {
  [DuckDBTypeId.DECIMAL]: decimal,
  [DuckDBTypeId.BLOB]: blob,
  [DuckDBTypeId.TIME]: timeString,
  [DuckDBTypeId.TIME_TZ]: timeString,
  [DuckDBTypeId.TIME_NS]: timeString,
  [DuckDBTypeId.DATE]: dateOrString,
  [DuckDBTypeId.TIMESTAMP]: dateOrString,
  [DuckDBTypeId.TIMESTAMP_S]: dateOrString,
  [DuckDBTypeId.TIMESTAMP_MS]: dateOrString,
  [DuckDBTypeId.TIMESTAMP_NS]: dateOrString,
  [DuckDBTypeId.TIMESTAMP_TZ]: dateOrString,
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
 * its exact string, TIME/TIME_TZ/TIME_NS as strings, BLOB as a plain
 * `Uint8Array`, and DATE/TIMESTAMP values outside the JS `Date` range (such as
 * `infinity`) as their string form.
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
