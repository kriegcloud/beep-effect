import type * as A from "effect/Array";
import type * as R from "effect/Record";
import type * as S from "effect/Schema";
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
export type StructFieldsWithStringKeys = {
  readonly [x: string]: S.Struct.Field;
};

export type NonEmptyStructFields<T extends StructFieldsWithStringKeys> =
  keyof T extends string
    ? keyof T extends NonEmptyString<keyof T>
      ? T extends NonNullable<unknown>
        ? NonNullable<unknown> extends T
          ? never
          : T
        : T
      : never
    : never;

export type NonEmptyReadonlyStructFieldKeys<
  T extends StructFieldsWithStringKeys,
> = T extends NonEmptyStructFields<T>
  ? A.NonEmptyReadonlyArray<keyof NonEmptyStructFields<T> & string>
  : never;

export type ReadonlyNonEmptyRecordKeys<
  T extends UnsafeTypes.UnsafeReadonlyRecord,
> = T extends NonEmptyRecordWithStringKeys<T>
  ? A.NonEmptyReadonlyArray<keyof T>
  : never;

export type StructFieldsOrPropertySignatures =
  | StructFieldsWithStringKeys
  | S.PropertySignature.Any;

export type NonEmptyStructFieldsOrPropertySignatures<
  T extends StructFieldsOrPropertySignatures,
> = keyof T extends string
  ? keyof T extends NonEmptyString<keyof T>
    ? T extends NonNullable<unknown>
      ? NonNullable<unknown> extends T
        ? never
        : T
      : T
    : never
  : never;
