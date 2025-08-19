import type * as A from "effect/Array";
import type * as R from "effect/Record";
import type { NonEmptyString } from "./string.types";
import type * as UnsafeTypes from "./unsafe.types";
export type NonEmptyReadonlyRecord<T extends UnsafeTypes.UnsafeReadonlyRecord> =
  keyof T extends string
    ? keyof T extends NonEmptyString<keyof T>
      ? T extends NonNullable<unknown>
        ? NonNullable<unknown> extends T
          ? never
          : T
        : T
      : never
    : never;

export type NonEmptyRecordWithStringKeys<
  R extends UnsafeTypes.UnsafeReadonlyRecord,
> = R extends NonEmptyReadonlyRecord<R>
  ? keyof R extends string
    ? keyof R extends NonEmptyString<keyof R>
      ? R
      : never
    : never
  : never;

export type RecordStringKeyValueString = R.ReadonlyRecord<
  NonEmptyString<string>,
  NonEmptyString<string>
>;

export type NonEmptyRecordStringKeyValues<
  R extends RecordStringKeyValueString,
> = R[keyof R] extends string
  ? R[keyof R] extends NonEmptyString<R[keyof R]>
    ? R
    : never
  : never;

export type ReadonlyRecordValuesNonEmptyArray<
  T extends RecordStringKeyValueString,
> = readonly [T[keyof T], ...T[keyof T][]];
export type NonEmptyReadonlyRecordStringValues<
  R extends RecordStringKeyValueString,
> = R extends NonEmptyRecordStringKeyValues<R>
  ? A.NonEmptyReadonlyArray<R[keyof R]>
  : never;
