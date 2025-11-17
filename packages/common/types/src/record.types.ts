/**
 * Record-centric helpers for enforcing non-empty string keyed dictionaries.
 *
 * @example
 * import type * as RecordTypes from "@beep/types/record.types";
 *
 * type SafeMap = RecordTypes.NonEmptyReadonlyRecord<{ id: string }>;
 * let example!: SafeMap;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
import type * as A from "effect/Array";
import type * as R from "effect/Record";
import type { NonEmptyString } from "./string.types.js";
import type * as UnsafeTypes from "./unsafe.types.js";

/**
 * Readonly record with arbitrary string or symbol keys.
 *
 * @example
 * import type { AnyRecord } from "@beep/types/record.types";
 *
 * type Payload = AnyRecord;
 * let example!: Payload;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type AnyRecord = R.ReadonlyRecord<string | symbol, unknown>;

/**
 * Readonly record where every key is a {@link NonEmptyString}.
 *
 * @example
 * import type { AnyRecordStringKey } from "@beep/types/record.types";
 *
 * type Shape = AnyRecordStringKey & { id: string };
 * let example!: Shape;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type AnyRecordStringKey = R.ReadonlyRecord<NonEmptyString, unknown>;

/**
 * Narrows records to those with provably non-empty string keys.
 *
 * @example
 * import type { NonEmptyReadonlyRecord } from "@beep/types/record.types";
 *
 * type Safe = NonEmptyReadonlyRecord<{ id: string }>;
 * let example!: Safe;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type NonEmptyReadonlyRecord<T extends UnsafeTypes.UnsafeReadonlyRecord> = keyof T extends string
  ? keyof T extends NonEmptyString<keyof T>
    ? T extends NonNullable<unknown>
      ? NonNullable<unknown> extends T
        ? never
        : T
      : T
    : never
  : never;

/**
 * Ensures a record has string keys and at least one entry.
 *
 * @example
 * import type { NonEmptyRecordWithStringKeys } from "@beep/types/record.types";
 *
 * type NonEmpty = NonEmptyRecordWithStringKeys<{ name: "Beep" }>;
 * let example!: NonEmpty;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type NonEmptyRecordWithStringKeys<R extends UnsafeTypes.UnsafeReadonlyRecord> =
  R extends NonEmptyReadonlyRecord<R>
    ? keyof R extends string
      ? keyof R extends NonEmptyString<keyof R>
        ? R
        : never
      : never
    : never;

/**
 * Readonly map whose keys and values are non-empty strings.
 *
 * @example
 * import type { RecordStringKeyValueString } from "@beep/types/record.types";
 *
 * type Headers = RecordStringKeyValueString & { accept: "application/json" };
 * let example!: Headers;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type RecordStringKeyValueString = R.ReadonlyRecord<NonEmptyString<string>, NonEmptyString<string>>;

/**
 * Narrows a record so that every value is a non-empty string literal union.
 *
 * @example
 * import type { NonEmptyRecordStringKeyValues } from "@beep/types/record.types";
 *
 * type LocaleLabels = NonEmptyRecordStringKeyValues<{ en: "Home"; fr: "Accueil" }>;
 * let example!: LocaleLabels;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type NonEmptyRecordStringKeyValues<R extends AnyRecord> = R[keyof R] extends string
  ? R[keyof R] extends NonEmptyString<R[keyof R]>
    ? R
    : never
  : never;

/**
 * Non-empty array containing the values of a record `T`.
 *
 * @example
 * import type { ReadonlyRecordValuesNonEmptyArray } from "@beep/types/record.types";
 *
 * type Values = ReadonlyRecordValuesNonEmptyArray<{ a: 1; b: 2 }>;
 * let example!: Values;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type ReadonlyRecordValuesNonEmptyArray<T extends AnyRecord> = readonly [T[keyof T], ...T[keyof T][]];

/**
 * Non-empty array of `[key, value]` tuples derived from record `T`.
 *
 * @example
 * import type { ReadonlyRecordEntriesNonEmptyArray } from "@beep/types/record.types";
 *
 * type Entries = ReadonlyRecordEntriesNonEmptyArray<{ a: 1; b: 2 }>;
 * let example!: Entries;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type ReadonlyRecordEntriesNonEmptyArray<T extends AnyRecord> = readonly [[keyof T, T[keyof T]]];

/**
 * Returns a non-empty readonly array of string values from a record whose
 * values are provably non-empty strings.
 *
 * @example
 * import type { NonEmptyReadonlyRecordStringValues } from "@beep/types/record.types";
 *
 * type Labels = NonEmptyReadonlyRecordStringValues<{ ok: "yes"; nope: "no" }>;
 * let example!: Labels;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type NonEmptyReadonlyRecordStringValues<R extends AnyRecord> = R extends NonEmptyRecordStringKeyValues<R>
  ? A.NonEmptyReadonlyArray<R[keyof R]>
  : never;

/**
 * Reverses a record’s mapping, producing a new record where original values
 * become keys and original keys become values.
 *
 * @example
 * import type { ReversedRecord } from "@beep/types/record.types";
 *
 * type Direction = ReversedRecord<{ up: "north"; down: "south" }>;
 * let example!: Direction;
 * void example;
 *
 * @category Types/Records
 * @since 0.1.0
 */
export type ReversedRecord<T extends R.ReadonlyRecord<keyof T & NonEmptyString, NonEmptyString>> = {
  readonly [P in T[keyof T]]: {
    readonly [K in keyof T]: T[K] extends P ? K : never;
  }[keyof T];
};
